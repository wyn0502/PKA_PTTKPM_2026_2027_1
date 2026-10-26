// Dung Pham Anh: Quy tắc nghiệp vụ thuần: hạn mượn theo loại độc giả, cách tính phạt, bảng chuyển trạng thái bản sao (mục 4.5)
export const COPY_STATUS = {
  AVAILABLE: 'Available',
  BORROWED: 'Borrowed',
  ON_HOLD: 'OnHold',
  MAINTENANCE: 'Maintenance',
  LOST: 'Lost',
  STORAGE: 'Storage',
};

export const MANUAL_COPY_TRANSITIONS = {
  Available: ['Maintenance', 'Storage', 'Lost'],
  Maintenance: ['Available', 'Lost'],
  Storage: ['Available'],
  Lost: ['Available'],
  Borrowed: [],
  OnHold: [],
};

export const canTransitionManually = (from, to) => (MANUAL_COPY_TRANSITIONS[from] || []).includes(to);

export const loanDaysFor = (readerType, settings) =>
  readerType === 'lecturer' ? settings.loan_days_lecturer : settings.loan_days_student;

export const borrowLimitFor = (readerType, settings) =>
  readerType === 'lecturer' ? settings.max_borrow_lecturer : settings.max_borrow_student;

export const overdueFine = (overdueDays, settings) => Math.max(0, overdueDays) * settings.fine_per_day;

export function borrowBlockers({ reader, today, unpaidFineTotal, overdueCount }) {
  const reasons = [];
  if (!reader.account_status) reasons.push('Thẻ/tài khoản độc giả đang bị khoá');
  if (reader.card_expiry_date < today) reasons.push(`Thẻ đã hết hạn từ ${reader.card_expiry_date}`);
  if (unpaidFineTotal > 0) reasons.push(`Độc giả còn nợ phạt ${unpaidFineTotal.toLocaleString('vi-VN')}đ`);
  if (overdueCount > 0) reasons.push(`Độc giả đang có ${overdueCount} phiếu mượn quá hạn`);
  return reasons;
}
