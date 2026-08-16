import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3100',
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

async function getFreshToken(): Promise<string | null> {
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = (async () => {
    try {
      const res = await axios.post(
        'http://localhost:3100/auth/refresh',
        {},
        { withCredentials: true }
      );
      const newToken = res.data.access_token;
      if (newToken && typeof window !== 'undefined') {
        localStorage.setItem('jwt_token', newToken);
        return newToken;
      }
      return null;
    } catch {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jwt_token');
        window.location.href = '/login';
      }
      return null;
    } finally {
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
}

// Proactive Token Refresh Request Interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Skip proactive refresh check for authentication endpoints
    if (config.url?.includes('/auth/refresh') || config.url?.includes('/auth/login')) {
      return config;
    }

    if (typeof window !== 'undefined') {
      let token = localStorage.getItem('jwt_token');
      if (token && isTokenExpiringSoon(token, 120)) {
        // Proactively refresh token BEFORE sending the request!
        const newToken = await getFreshToken();
        if (newToken) {
          token = newToken;
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Fallback Response Interceptor (for unexpected 401s)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.url?.includes('/auth/refresh')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jwt_token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await getFreshToken();
        if (newAccessToken && typeof window !== 'undefined') {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('jwt_token');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
