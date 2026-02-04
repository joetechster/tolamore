export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://fakestoreapi.com';

type RequestOptions = RequestInit & { parseAsText?: boolean };

const buildUrl = (path: string) => {
  if (path.startsWith('http')) {
    return path;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
};

export const request = async <T>(path: string, options: RequestOptions = {}) => {
  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as T) : (null as T);

  if (!response.ok) {
    const message =
      (data as { message?: string })?.message ??
      `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
};

export const get = async <T>(path: string) => request<T>(path);

export const post = async <T, U>(path: string, body: U) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) });