import axios from 'axios';
import { encryptPayload, decryptPayload } from '../utils/payload-crypto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let refreshTokenPromise: Promise<string | null> | null = null;

function parseJwtExp(token: string): number | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return typeof parsed.exp === 'number' ? parsed.exp : null;
  } catch {
    return null;
  }
}

function isTokenExpiringSoon(token: string, bufferSeconds = 120): boolean {
  const exp = parseJwtExp(token);
  if (!exp) return false;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return exp - nowInSeconds <= bufferSeconds;
}

async function getFreshToken(shouldRedirectOnFail = true): Promise<string | null> {
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = (async () => {
    try {
      const storedRefreshToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('refresh_token')
          : null;

      const res = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        storedRefreshToken ? { refresh_token: storedRefreshToken } : {},
        {
          withCredentials: true,
          headers: {
            'X-Encrypted-Payload': '1',
            ...(storedRefreshToken
              ? { 'X-Refresh-Token': storedRefreshToken }
              : {}),
          },
        }
      );
      let data = res.data;
      if (data && typeof data === 'object' && typeof data._enc === 'string') {
        data = await decryptPayload(data._enc);
      }
      const newToken = data?.access_token;
      if (newToken && typeof window !== 'undefined') {
        localStorage.setItem('jwt_token', newToken);
        if (data?.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
        return newToken;
      }
      return null;
    } catch {
      if (shouldRedirectOnFail && typeof window !== 'undefined') {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
      return null;
    } finally {
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
}

// Request Interceptor: Proactive Auth + End-to-End Payload Encryption
apiClient.interceptors.request.use(
  async (config) => {
    config.headers = config.headers || {};
    // Signal backend that client supports encrypted responses
    config.headers['X-Encrypted-Payload'] = '1';

    // Skip proactive refresh check for authentication endpoints
    const isAuthEndpoint =
      config.url?.includes('/auth/refresh') ||
      config.url?.includes('/auth/login') ||
      config.url?.includes('/auth/logout') ||
      config.url?.includes('/auth/register') ||
      config.url?.includes('/auth/google');

    if (!isAuthEndpoint && typeof window !== 'undefined') {
      let token = localStorage.getItem('jwt_token');
      if (token && isTokenExpiringSoon(token, 120)) {
        // Proactively refresh token BEFORE sending the request!
        const newToken = await getFreshToken(false);
        if (newToken) {
          token = newToken;
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Encrypt outgoing mutation payload (POST, PUT, PATCH, DELETE)
    if (config.data !== undefined && config.data !== null) {
      const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
      if (!isFormData) {
        if (typeof config.data === 'object' && !config.data._enc) {
          const encrypted = await encryptPayload(config.data);
          config.data = { _enc: encrypted };
        } else if (typeof config.data === 'string') {
          try {
            const parsed = JSON.parse(config.data);
            if (parsed && typeof parsed === 'object' && !parsed._enc) {
              const encrypted = await encryptPayload(parsed);
              config.data = { _enc: encrypted };
            }
          } catch {
            // Not a JSON string; leave intact
          }
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: End-to-End Decryption + Fallback 401 Refresh
apiClient.interceptors.response.use(
  async (response) => {
    if (response.data && typeof response.data === 'object' && typeof response.data._enc === 'string') {
      try {
        response.data = await decryptPayload(response.data._enc);
      } catch (err) {
        console.error('Failed to decrypt response payload:', err);
      }
    }
    return response;
  },
  async (error) => {
    // Decrypt encrypted error response so callers can read message and status
    if (
      error.response?.data &&
      typeof error.response.data === 'object' &&
      typeof error.response.data._enc === 'string'
    ) {
      try {
        error.response.data = await decryptPayload(error.response.data._enc);
      } catch (err) {
        console.error('Failed to decrypt error response payload:', err);
      }
    }

    const originalRequest = error.config;

    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/logout') ||
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/google');

    if (isAuthEndpoint) {
      if (originalRequest?.url?.includes('/auth/logout')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('refresh_token');
        }
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If user has no jwt_token in localStorage, they are unauthenticated/logged out — do not auto-refresh!
      if (typeof window !== 'undefined' && !localStorage.getItem('jwt_token')) {
        return Promise.reject(error);
      }

      try {
        const newAccessToken = await getFreshToken(true);
        if (newAccessToken && typeof window !== 'undefined') {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
