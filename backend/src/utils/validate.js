// Dung Pham Anh: Kiểm tra cú pháp dữ liệu đầu vào (bắt buộc, độ dài, số, ngày, email) cho các controller
import { badRequest } from './AppError.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function str(value, label, { required = false, max = 255, min = 0 } = {}) {
  const text = typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
  if (!text) {
    if (required) throw badRequest(`${label} không được để trống`);
    return null;
  }
  if (text.length < min) throw badRequest(`${label} phải có ít nhất ${min} ký tự`);
  if (text.length > max) throw badRequest(`${label} tối đa ${max} ký tự`);
  return text;
}

export function int(value, label, { required = false, min, max } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) throw badRequest(`${label} không được để trống`);
    return null;
  }
  const n = Number(value);
  if (!Number.isInteger(n)) throw badRequest(`${label} phải là số nguyên`);
  if (min !== undefined && n < min) throw badRequest(`${label} phải ≥ ${min}`);
  if (max !== undefined && n > max) throw badRequest(`${label} phải ≤ ${max}`);
  return n;
}

export function num(value, label, { required = false, min } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) throw badRequest(`${label} không được để trống`);
    return null;
  }
  const n = Number(value);
  if (!Number.isFinite(n)) throw badRequest(`${label} phải là số`);
  if (min !== undefined && n < min) throw badRequest(`${label} phải ≥ ${min}`);
  return n;
}

export function email(value, label = 'Email', options = {}) {
  const text = str(value, label, { max: 100, ...options });
  if (text && !EMAIL_RE.test(text)) throw badRequest(`${label} không đúng định dạng`);
  return text ? text.toLowerCase() : null;
}

export function date(value, label, { required = false } = {}) {
  const text = str(value, label, { required, max: 10 });
  if (!text) return null;
  if (!DATE_RE.test(text) || Number.isNaN(Date.parse(text))) throw badRequest(`${label} không hợp lệ (YYYY-MM-DD)`);
  return text;
}

export function oneOf(value, label, options, { required = false } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) throw badRequest(`${label} không được để trống`);
    return null;
  }
  if (!options.includes(value)) throw badRequest(`${label} không hợp lệ`);
  return value;
}

export function bool(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

export function page(queryParams) {
  const pageNo = Math.max(1, Number(queryParams.page) || 1);
  const size = Math.min(100, Math.max(1, Number(queryParams.pageSize) || 20));
  return { page: pageNo, pageSize: size, offset: (pageNo - 1) * size };
}

export function strongPassword(value, label = 'Mật khẩu') {
  const text = str(value, label, { required: true, max: 72 });
  if (text.length < 8 || !/[A-Za-z]/.test(text) || !/\d/.test(text)) {
    throw badRequest(`${label} phải dài ít nhất 8 ký tự, gồm cả chữ và số`);
  }
  return text;
}
