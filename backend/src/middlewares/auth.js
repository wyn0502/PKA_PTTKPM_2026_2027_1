// Dung Pham Anh: Xác thực JWT và phân quyền theo vai trò (FR-26); tài khoản bị khoá mất quyền truy cập ngay
import { authService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { forbidden, unauthorized } from '../utils/AppError.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw unauthorized();
  const payload = authService.verifyToken(token);
  req.user = await authService.me(payload.sub);
  next();
});

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return next(forbidden());
  return next();
};

export const STAFF = ['librarian', 'admin'];
