// Dung Pham Anh: Chuyển mọi lỗi (nghiệp vụ, ràng buộc CSDL, upload) thành phản hồi JSON thống nhất
import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const PG_ERRORS = {
  23505: [409, 'Dữ liệu bị trùng với bản ghi đã có'],
  23503: [409, 'Dữ liệu đang được tham chiếu hoặc tham chiếu tới bản ghi không tồn tại'],
  23514: [400, 'Dữ liệu vi phạm ràng buộc hợp lệ'],
  '22P02': [400, 'Định dạng dữ liệu không hợp lệ'],
  22001: [400, 'Dữ liệu vượt quá độ dài cho phép'],
};

export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Không tìm thấy API ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof AppError) {
    return res.status(error.status).json({ message: error.message, details: error.details });
  }
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ message: error.code === 'LIMIT_FILE_SIZE' ? 'Tệp vượt quá 5MB' : error.message });
  }
  if (error.type === 'entity.parse.failed') return res.status(400).json({ message: 'Dữ liệu JSON không hợp lệ' });
  const pg = PG_ERRORS[error.code];
  if (pg) return res.status(pg[0]).json({ message: pg[1], details: { constraint: error.constraint } });
  console.error(error);
  return res.status(500).json({ message: 'Lỗi hệ thống, vui lòng thử lại sau' });
}
