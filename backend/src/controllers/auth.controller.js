// Dung Pham Anh: Controller xác thực: đăng nhập, thông tin phiên, đổi mật khẩu, đăng xuất
import { authService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authController = {
  login: asyncHandler(async (req, res) => res.json(await authService.login(req.body))),
  me: asyncHandler(async (req, res) => res.json(req.user)),
  changePassword: asyncHandler(async (req, res) => {
    await authService.changePassword(req.user, req.body);
    res.json({ message: 'Đổi mật khẩu thành công' });
  }),
  logout: asyncHandler(async (req, res) => {
    await authService.logout(req.user);
    res.json({ message: 'Đăng xuất thành công' });
  }),
};
