// Dung Pham Anh: Tiện ích ngày theo múi giờ Việt Nam (chuỗi YYYY-MM-DD) dùng cho hạn trả và báo cáo
const TZ = 'Asia/Ho_Chi_Minh';

export function today() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
}

export function addDays(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function diffDays(fromIso, toIso) {
  return Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86400000);
}
