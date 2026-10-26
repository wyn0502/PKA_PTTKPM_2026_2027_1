// Dung Pham Anh: Nghiệp vụ đăng nhập/đăng xuất (UC-01): xác thực, khoá sau N lần sai, cấp JWT theo vai trò
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { accountRepository } from '../repositories/account.repository.js';
import { settingService } from './setting.service.js';
import { auditService } from './audit.service.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { strongPassword, str } from '../utils/validate.js';
import { AppError, badRequest, unauthorized } from '../utils/AppError.js';

const DUMMY_HASH = '$2a$10$vlEA/xDiRHK1iC7YO.SQ0eoa5wcCkj0ZHQqWTHa1DBrfW20pL72e6';

export const toSessionUser = (account) => ({
  accountId: account.account_id,
  username: account.username,
  role: account.role,
  fullName: account.full_name,
  email: account.email,
  staffId: account.staff_id,
  readerId: account.reader_id,
});

export const authService = {
  async login(input) {
    const username = str(input.username, 'Tên đăng nhập', { required: true, max: 50 });
    const password = str(input.password, 'Mật khẩu', { required: true, max: 72 });
    const account = await accountRepository.findByUsername(username);

    if (!account) {
      await verifyPassword(password, DUMMY_HASH);
      throw unauthorized('Thông tin đăng nhập không chính xác');
    }
    if (!account.status) throw new AppError(423, 'Tài khoản đã bị khóa. Vui lòng liên hệ Quản trị viên');

    if (!(await verifyPassword(password, account.password_hash))) {
      throw await this.registerFailure(account);
    }

    await accountRepository.resetFailedLogins(account.account_id);
    await auditService.record(null, { accountId: account.account_id }, 'LOGIN', 'account', account.account_id);
    const token = jwt.sign({ sub: account.account_id, role: account.role }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn,
    });
    return { token, user: toSessionUser(account) };
  },

  async registerFailure(account) {
    const { max_login_attempts: maxAttempts } = await settingService.get();
    const { failed_login_count: failedCount, status } = await accountRepository.incrementFailedLogins(
      account.account_id,
      maxAttempts,
    );
    const locked = !status;
    await auditService.record(null, { accountId: account.account_id }, locked ? 'ACCOUNT_LOCKED' : 'LOGIN_FAILED', 'account', account.account_id, { failedCount });
    if (locked) return new AppError(423, `Nhập sai ${maxAttempts} lần, tài khoản đã bị khóa. Vui lòng liên hệ Quản trị viên`);
    return unauthorized(`Thông tin đăng nhập không chính xác (còn ${maxAttempts - failedCount} lần thử)`);
  },

  verifyToken(token) {
    try {
      return jwt.verify(token, env.jwtSecret);
    } catch {
      throw unauthorized('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
    }
  },

  async me(accountId) {
    const account = await accountRepository.findById(accountId);
    if (!account || !account.status) throw unauthorized();
    return toSessionUser(account);
  },

  async changePassword(actor, input) {
    const currentPassword = str(input.currentPassword, 'Mật khẩu hiện tại', { required: true, max: 72 });
    const newPassword = strongPassword(input.newPassword, 'Mật khẩu mới');
    if (currentPassword === newPassword) throw badRequest('Mật khẩu mới phải khác mật khẩu hiện tại');
    const account = await accountRepository.findById(actor.accountId);
    if (!(await verifyPassword(currentPassword, account.password_hash))) {
      throw badRequest('Mật khẩu hiện tại không đúng');
    }
    await accountRepository.setPassword(actor.accountId, await hashPassword(newPassword));
    await auditService.record(null, actor, 'CHANGE_PASSWORD', 'account', actor.accountId);
  },

  async logout(actor) {
    await auditService.record(null, actor, 'LOGOUT', 'account', actor.accountId);
  },
};
