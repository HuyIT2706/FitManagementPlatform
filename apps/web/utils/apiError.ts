import { isAxiosError } from 'axios';

/**
 * Extracts a human-readable error message from an unknown error value.
 * Handles Axios errors, standard Error objects, and plain strings.
 *
 * Usage:
 *   .catch((err) => {
 *     const msg = getApiErrorMessage(err, 'Something went wrong');
 *   })
 */
export function getApiErrorMessage(err: unknown, fallback = ''): string {
  if (isAxiosError(err)) {
    const serverMsg = (err.response?.data as { message?: string })?.message;
    return serverMsg || err.message || fallback;
  }
  if (err instanceof Error) {
    return err.message || fallback;
  }
  if (typeof err === 'string' && err.length > 0) {
    return err;
  }
  return fallback;
}
