// Dung Pham Anh: Nghiệp vụ quản lý tài khoản và phân quyền (UC-12): cấp tài khoản nhân sự, khoá/mở, đổi vai trò, đặt lại mật khẩu
import { withTransaction } from '../db/pool.js';
import { accountRepository } from '../repositories/account.repository.js';
import { librarianRepository } from '../repositories/librarian.repository.js';
import { auditService } from './audit.service.js';
import { toAccountDTO } from '../dtos/account.dto.js';
import { hashPassword } from '../utils/password.js';
import { str, email, oneOf, page, strongPassword, bool } from '../utils/validate.js';
import { badRequest, conflict, notFound } from '../utils/AppError.js';

const STAFF_ROLES = ['librarian', 'admin'];
const USERNAME_RE = /^[a-zA-Z0-9._-]{3,50}$/;

async function requireAccount(accountId, db) {
  const account = await accountRepository.findById(accountId, db);
  if (!account) throw notFound('Không tìm thấy tài khoản');
  return account;
}

async function assertNotLastAdmin(account, db) {
  if (account.role === 'admin' && account.status && (await accountRepository.countActiveAdmins(db)) <= 1) {
    throw badRequest('Không thể khoá hoặc hạ quyền quản trị viên cuối cùng');
  }
}

export const accountService = {
  async list(query) {
    const { page: pageNo, pageSize, offset } = page(query);
    const { rows, total } = await accountRepository.list({
      q: query.q?.trim() || null,
      role: query.role || null,
      offset,
      limit: pageSize,
    });
    return { items: rows.map(toAccountDTO), total, page: pageNo, pageSize };
  },

  async createStaff(input, actor) {
    const username = str(input.username, 'Tên đăng nhập', { required: true, max: 50 });
    if (!USERNAME_RE.test(username)) throw badRequest('Tên đăng nhập chỉ gồm chữ, số, dấu . _ - (3–50 ký tự)');
    const password = strongPassword(input.password);
    const role = oneOf(input.role, 'Vai trò', STAFF_ROLES, { required: true });
    const fullName = str(input.fullName, 'Họ tên', { required: true, max: 100 });
    const mail = email(input.email, 'Email', { required: true });
    const department = str(input.department, 'Phòng ban', { max: 100 });

    if (await accountRepository.findByUsername(username)) throw conflict('Tên đăng nhập đã tồn tại');
    if (await librarianRepository.emailExists(mail)) throw conflict('Email đã được sử dụng');

    const passwordHash = await hashPassword(password);
    const accountId = await withTransaction(async (db) => {
      const id = await accountRepository.create({ username, passwordHash, role }, db);
      await librarianRepository.create({ accountId: id, fullName, email: mail, department }, db);
      await auditService.record(db, actor, 'CREATE_ACCOUNT', 'account', id, { username, role });
      return id;
    });
    return toAccountDTO(await accountRepository.findById(accountId));
  },

  async updateStaff(accountId, input, actor) {
    const account = await requireAccount(accountId);
    if (!account.staff_id) throw badRequest('Hồ sơ độc giả được cập nhật ở mục Độc giả');
    const fullName = str(input.fullName, 'Họ tên', { required: true, max: 100 });
    const mail = email(input.email, 'Email', { required: true });
    const department = str(input.department, 'Phòng ban', { max: 100 });
    if (await librarianRepository.emailExists(mail, accountId)) throw conflict('Email đã được sử dụng');
    await librarianRepository.update(accountId, { fullName, email: mail, department });
    await auditService.record(null, actor, 'UPDATE_ACCOUNT', 'account', accountId);
    return toAccountDTO(await accountRepository.findById(accountId));
  },

  async setStatus(accountId, input, actor) {
    const status = bool(input.status);
    if (accountId === actor.accountId && !status) throw badRequest('Không thể tự khoá tài khoản của mình');
    const account = await requireAccount(accountId);
    if (!status) await assertNotLastAdmin(account);
    await accountRepository.setStatus(accountId, status);
    await auditService.record(null, actor, status ? 'UNLOCK_ACCOUNT' : 'LOCK_ACCOUNT', 'account', accountId);
    return toAccountDTO(await accountRepository.findById(accountId));
  },

  async setRole(accountId, input, actor) {
    const role = oneOf(input.role, 'Vai trò', STAFF_ROLES, { required: true });
    const account = await requireAccount(accountId);
    if (!account.staff_id) throw badRequest('Chỉ đổi vai trò giữa Thủ thư và Quản trị viên');
    if (account.role === role) return toAccountDTO(account);
    if (role !== 'admin') await assertNotLastAdmin(account);
    await accountRepository.setRole(accountId, role);
    await auditService.record(null, actor, 'CHANGE_ROLE', 'account', accountId, { from: account.role, to: role });
    return toAccountDTO(await accountRepository.findById(accountId));
  },

  async resetPassword(accountId, input, actor) {
    const password = strongPassword(input.password, 'Mật khẩu mới');
    await requireAccount(accountId);
    await accountRepository.setPassword(accountId, await hashPassword(password));
    await auditService.record(null, actor, 'RESET_PASSWORD', 'account', accountId);
  },
};
