// Dung Pham Anh: Lỗi nghiệp vụ có mã HTTP, được errorHandler chuyển thành phản hồi JSON
export class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (message, details) => new AppError(400, message, details);
export const unauthorized = (message = 'Bạn cần đăng nhập') => new AppError(401, message);
export const forbidden = (message = 'Bạn không có quyền thực hiện thao tác này') => new AppError(403, message);
export const notFound = (message = 'Không tìm thấy dữ liệu') => new AppError(404, message);
export const conflict = (message, details) => new AppError(409, message, details);
