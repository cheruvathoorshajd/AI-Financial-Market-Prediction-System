import { AxiosError } from 'axios';

interface ApiErrorBody {
  detail?: string | Array<{ msg?: string }>;
}

/** Turns an unknown thrown value (usually an Axios error) into a human sentence. */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  const ax = err as AxiosError<ApiErrorBody> | undefined;
  const detail = ax?.response?.data?.detail;
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg as string;
  if (ax?.code === 'ERR_NETWORK') {
    return 'Can’t reach the server. Check that the API is running, then try again.';
  }
  if (ax?.message) return ax.message;
  return fallback;
}
