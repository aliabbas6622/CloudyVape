// API client wrapper using standard fetch API
const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  info: any;

  constructor(message: string, status: number, info: any) {
    super(message);
    this.status = status;
    this.info = info;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(options.headers || {}),
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data;
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(data?.error || response.statusText || 'API Request failed', response.status, data);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: any, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'POST', body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: any, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'PUT', body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: 'DELETE' }),
  upload: <T>(path: string, body: FormData, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'POST', body }),
};
export default api;
