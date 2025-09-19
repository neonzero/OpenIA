const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';
const TOKEN_STORAGE_KEY = 'openia.jwt';

let inMemoryToken: string | null = null;

type SerializableBody = BodyInit | Record<string, unknown> | null | undefined;

const getBrowserStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage;
  } catch (error) {
    console.warn('LocalStorage is not available, falling back to in-memory token storage.', error);
    return null;
  }
};

export const getToken = () => {
  const storage = getBrowserStorage();
  if (storage) {
    return storage.getItem(TOKEN_STORAGE_KEY);
  }
  return inMemoryToken;
};

export const setToken = (token: string | null) => {
  const storage = getBrowserStorage();
  if (storage) {
    if (token) {
      storage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      storage.removeItem(TOKEN_STORAGE_KEY);
    }
  }
  inMemoryToken = token;
};

export interface RequestOptions extends RequestInit {
  auth?: boolean;
  body?: SerializableBody;
}

export class ApiError extends Error {
  public status: number;
  public details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const buildHeaders = (options: RequestOptions) => {
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.auth !== false) {
    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return headers;
};

const serialiseBody = (body: SerializableBody) => {
  if (!body) {
    return undefined;
  }
  if (
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams ||
    typeof body === 'string'
  ) {
    return body as BodyInit;
  }
  return JSON.stringify(body);
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new ApiError(
      response.statusText || 'Request failed',
      response.status,
      payload
    );
  }

  return payload as T;
};

const request = async <T>(path: string, options: RequestOptions = {}) => {
  const headers = buildHeaders(options);
  const body = serialiseBody(options.body);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body
  });

  return handleResponse<T>(response);
};

export const apiClient = {
  get: <T>(path: string, options: RequestOptions = {}) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: SerializableBody, options: RequestOptions = {}) => request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: SerializableBody, options: RequestOptions = {}) => request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: SerializableBody, options: RequestOptions = {}) => request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options: RequestOptions = {}) => request<T>(path, { ...options, method: 'DELETE' })
};

export const clearToken = () => setToken(null);

export const withErrorBoundary = async <T>(promise: Promise<T>, fallback: T): Promise<T> => {
  try {
    return await promise;
  } catch (error) {
    console.error('API request failed', error);
    return fallback;
  }
};
