// Dung Pham Anh: Kiểm tra cú pháp ISBN-10/13 phía giao diện (lớp trình bày) trước khi gửi lên máy chủ
export const normalizeIsbn = (value) => String(value ?? '').replace(/[\s-]/g, '').toUpperCase();

export function isValidIsbn(isbn) {
  if (/^\d{13}$/.test(isbn)) {
    return [...isbn].reduce((acc, ch, i) => acc + Number(ch) * (i % 2 === 0 ? 1 : 3), 0) % 10 === 0;
  }
  if (/^\d{9}[\dX]$/.test(isbn)) {
    return [...isbn].reduce((acc, ch, i) => acc + (ch === 'X' ? 10 : Number(ch)) * (10 - i), 0) % 11 === 0;
  }
  return false;
}
