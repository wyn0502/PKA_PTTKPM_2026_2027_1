// Dung Pham Anh: Controller quản lý tài khoản và phân quyền (UC-12)
import { accountService } from '../services/account.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const accountController = {
  list: asyncHandler(async (req, res) => res.json(await accountService.list(req.query))),
  create: asyncHandler(async (req, res) => res.status(201).json(await accountService.createStaff(req.body, req.user))),
  update: asyncHandler(async (req, res) => res.json(await accountService.updateStaff(req.params.id, req.body, req.user))),
  setStatus: asyncHandler(async (req, res) => res.json(await accountService.setStatus(req.params.id, req.body, req.user))),
  setRole: asyncHandler(async (req, res) => res.json(await accountService.setRole(req.params.id, req.body, req.user))),
  resetPassword: asyncHandler(async (req, res) => {
    await accountService.resetPassword(req.params.id, req.body, req.user);
    res.json({ message: 'Đã đặt lại mật khẩu' });
  }),
};
