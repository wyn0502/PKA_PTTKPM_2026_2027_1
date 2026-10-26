// Dung Pham Anh: Nhận tệp Excel tải lên (bộ nhớ tạm, tối đa 5MB, chỉ .xlsx)
import multer from 'multer';
import { badRequest } from '../utils/AppError.js';

export const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.toLowerCase().endsWith('.xlsx')) return cb(badRequest('Chỉ chấp nhận tệp .xlsx'));
    return cb(null, true);
  },
}).single('file');
