// Dung Pham Anh: Nhãn tiếng Việt và tông màu (chỉ số trên dải màu) cho các trạng thái, vai trò, loại vi phạm
export const COPY_STATUS = {
  Available: { label: 'Khả dụng', tone: 8 },
  Borrowed: { label: 'Đang mượn', tone: 6 },
  OnHold: { label: 'Đang giữ chỗ', tone: 5 },
  Maintenance: { label: 'Đang sửa chữa', tone: 1 },
  Storage: { label: 'Lưu kho', tone: 4 },
  Lost: { label: 'Mất', tone: 3 },
};

export const CONDITION = {
  Good: { label: 'Tốt', tone: 8 },
  Worn: { label: 'Cũ', tone: 1 },
  Damaged: { label: 'Hư hỏng', tone: 3 },
  Lost: { label: 'Mất', tone: 3 },
};

export const LOAN_STATUS = {
  Borrowing: { label: 'Đang mượn', tone: 6 },
  Overdue: { label: 'Quá hạn', tone: 3 },
  Returned: { label: 'Đã trả', tone: 8 },
};

export const RESERVATION_STATUS = {
  Pending: { label: 'Đang chờ', tone: 1 },
  Ready: { label: 'Sách đã về', tone: 7 },
  Fulfilled: { label: 'Đã nhận sách', tone: 8 },
  Cancelled: { label: 'Đã huỷ', tone: 4 },
  Expired: { label: 'Hết hạn', tone: 3 },
};

export const CARD_STATUS = {
  Active: { label: 'Còn hiệu lực', tone: 8 },
  Expired: { label: 'Hết hạn', tone: 1 },
  Locked: { label: 'Bị khoá', tone: 3 },
};

export const FINE_TYPE = {
  Overdue: { label: 'Trễ hạn', tone: 1 },
  Damaged: { label: 'Hư hỏng', tone: 2 },
  Lost: { label: 'Mất sách', tone: 3 },
};

export const PAID_STATUS = {
  true: { label: 'Đã thanh toán', tone: 8 },
  false: { label: 'Chưa thanh toán', tone: 3 },
};

export const ACCOUNT_STATUS = {
  true: { label: 'Hoạt động', tone: 8 },
  false: { label: 'Bị khoá', tone: 3 },
};

export const ROLE = {
  admin: { label: 'Quản trị viên', tone: 5 },
  librarian: { label: 'Thủ thư', tone: 6 },
  reader: { label: 'Độc giả', tone: 7 },
};

export const READER_TYPE = {
  student: { label: 'Sinh viên', tone: 6 },
  lecturer: { label: 'Giảng viên', tone: 5 },
};

export const toOptions = (map) => Object.entries(map).map(([value, { label }]) => ({ value, label }));

export const MANUAL_COPY_TRANSITIONS = {
  Available: ['Maintenance', 'Storage', 'Lost'],
  Maintenance: ['Available', 'Lost'],
  Storage: ['Available'],
  Lost: ['Available'],
  Borrowed: [],
  OnHold: [],
};

export const AUDIT_ACTIONS = {
  LOGIN: 'Đăng nhập',
  LOGOUT: 'Đăng xuất',
  LOGIN_FAILED: 'Đăng nhập sai',
  ACCOUNT_LOCKED: 'Tự khoá tài khoản',
  CREATE_LOAN: 'Lập phiếu mượn',
  RETURN_COPY: 'Ghi nhận trả',
  REPORT_LOST: 'Báo mất sách',
  RENEW_LOAN: 'Gia hạn',
  CREATE_FINE_PAID: 'Thu tiền phạt',
  CREATE_FINE_DEBT: 'Ghi nợ phạt',
  PAY_FINE: 'Thu nợ phạt',
  CREATE_RESERVATION: 'Đặt trước',
  CANCEL_RESERVATION: 'Huỷ đặt trước',
  CREATE_READER: 'Thêm độc giả',
  UPDATE_READER: 'Sửa độc giả',
  LOCK_CARD: 'Khoá thẻ',
  UNLOCK_CARD: 'Mở khoá thẻ',
  RENEW_CARD: 'Gia hạn thẻ',
  CREATE_TITLE: 'Thêm đầu sách',
  UPDATE_TITLE: 'Sửa đầu sách',
  DELETE_TITLE: 'Xoá đầu sách',
  ADD_COPIES: 'Thêm bản sao',
  UPDATE_COPY: 'Sửa bản sao',
  CHANGE_COPY_STATUS: 'Đổi trạng thái bản sao',
  CREATE_ACCOUNT: 'Cấp tài khoản',
  UPDATE_ACCOUNT: 'Sửa tài khoản',
  LOCK_ACCOUNT: 'Khoá tài khoản',
  UNLOCK_ACCOUNT: 'Mở khoá tài khoản',
  CHANGE_ROLE: 'Đổi vai trò',
  RESET_PASSWORD: 'Đặt lại mật khẩu',
  CHANGE_PASSWORD: 'Đổi mật khẩu',
  UPDATE_SETTINGS: 'Sửa tham số',
};
