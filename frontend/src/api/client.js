// Dung Pham Anh: HTTP client gọi API backend: gắn JWT, chuẩn hoá lỗi, tải lên/tải xuống tệp
import { safeStorage } from '../utils/storage.js';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'qltv.token';
export const UNAUTHORIZED_EVENT = 'qltv:unauthorized';

export const tokenStore = {
  get: () => safeStorage.get(TOKEN_KEY),
  set: (token) => safeStorage.set(TOKEN_KEY, token),
  clear: () => safeStorage.remove(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function buildUrl(path, query) {
  const params = new URLSearchParams();
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.append(key, value);
  });
  const qs = params.toString();
  return `${BASE_URL}${path}${qs ? `?${qs}` : ''}`;
}

function filenameFrom(response, fallback) {
  const header = response.headers.get('content-disposition') || '';
  return header.match(/filename="?([^"]+)"?/)?.[1] || fallback;
}

async function request(method, path, { body, query, file, raw } = {}) {
  const headers = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (file) {
    payload = new FormData();
    payload.append('file', file);
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(buildUrl(path, query), { method, headers, body: payload });
  } catch {
    throw new ApiError(0, 'Không thể kết nối đến máy chủ. Vui lòng thử lại.');
  }

  if (response.status === 401 && token) {
    tokenStore.clear();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
  if (response.status === 204) return null;

  const isJson = (response.headers.get('content-type') || '').includes('application/json');
  if (!response.ok) {
    const data = isJson ? await response.json() : {};
    throw new ApiError(response.status, data.message || 'Đã có lỗi xảy ra', data.details);
  }
  if (raw) return { blob: await response.blob(), filename: filenameFrom(response, 'tai-xuong.xlsx') };
  return isJson ? response.json() : null;
}

function saveBlob({ blob, filename }) {
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const http = {
  get: (path, query) => request('GET', path, { query }),
  post: (path, body) => request('POST', path, { body }),
  put: (path, body) => request('PUT', path, { body }),
  patch: (path, body) => request('PATCH', path, { body }),
  delete: (path) => request('DELETE', path),
  upload: (path, file) => request('POST', path, { file }),
  download: async (path, query) => saveBlob(await request('GET', path, { query, raw: true })),
};
