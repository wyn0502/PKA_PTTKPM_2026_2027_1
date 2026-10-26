// Dung Pham Anh: Chuẩn hoá và kiểm tra mã ISBN-10/ISBN-13 (bỏ dấu gạch, kiểm tra chữ số kiểm tra)
export function normalizeIsbn(value) {
  return String(value ?? '').replace(/[\s-]/g, '').toUpperCase();
}

export function isValidIsbn(isbn) {
  if (/^\d{13}$/.test(isbn)) {
    const sum = [...isbn].reduce((acc, ch, i) => acc + Number(ch) * (i % 2 === 0 ? 1 : 3), 0);
    return sum % 10 === 0;
  }
  if (/^\d{9}[\dX]$/.test(isbn)) {
    const sum = [...isbn].reduce((acc, ch, i) => acc + (ch === 'X' ? 10 : Number(ch)) * (10 - i), 0);
    return sum % 11 === 0;
  }
  return false;
}
