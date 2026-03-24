const DEFAULT_API_BASE_URL = 'http://localhost:4000';
import { getToken } from '@/lib/auth/token';

type ErrorResponseBody = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

export class ApiRequestError extends Error {
  status: number;
  path: string;
  code?: string;

  constructor(params: {
    message: string;
    status: number;
    path: string;
    code?: string;
  }) {
    super(params.message);
    this.name = 'ApiRequestError';
    this.status = params.status;
    this.path = params.path;
    this.code = params.code;
  }
}

export function isApiRequestError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

export function getApiBaseUrl(): string {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  return normalizeBaseUrl(configuredBaseUrl || DEFAULT_API_BASE_URL);
}

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  accessToken?: string;
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;

  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.accessToken) {
    headers.set('Authorization', `Bearer ${options.accessToken}`);
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      headers,
      cache: 'no-store',
    });
  } catch {
    throw new ApiRequestError({
      status: 0,
      path,
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to the server. Please try again.',
    });
  }

  if (!response.ok) {
    const responseBody = await response.text().catch(() => '');
    let parsedBody: ErrorResponseBody | null = null;

    if (responseBody) {
      try {
        parsedBody = JSON.parse(responseBody) as ErrorResponseBody;
      } catch {
        parsedBody = null;
      }
    }

    const message = Array.isArray(parsedBody?.message)
      ? parsedBody?.message.join(', ')
      : parsedBody?.message ||
        responseBody ||
        `Request failed (${response.status}) for ${path}`;

    throw new ApiRequestError({
      status: response.status,
      path,
      code: parsedBody?.error,
      message,
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function apiRequestWithAuth<T>(
  path: string,
  options: Omit<ApiRequestOptions, 'accessToken'> = {}
): Promise<T> {
  const token = getToken();

  if (!token) {
    throw new Error('Missing auth token.');
  }

  return apiRequest<T>(path, {
    ...options,
    accessToken: token,
  });
}
