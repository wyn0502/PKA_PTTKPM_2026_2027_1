// Dung Pham Anh: Nghiệp vụ quản lý độc giả (UC-02): thêm hồ sơ + thẻ + tài khoản, cập nhật, khoá thẻ, gia hạn thẻ, nhập Excel
import { withTransaction } from '../db/pool.js';
import { readerRepository } from '../repositories/reader.repository.js';
import { accountRepository } from '../repositories/account.repository.js';
import { librarianRepository } from '../repositories/librarian.repository.js';
import { loanRepository } from '../repositories/loan.repository.js';
import { reservationRepository } from '../repositories/reservation.repository.js';
import { fineRepository } from '../repositories/fine.repository.js';
import { settingService } from './setting.service.js';
import { auditService } from './audit.service.js';
import { borrowLimitFor } from './policies.js';
import { toReaderCardDTO } from '../dtos/readerCard.dto.js';
import { toLoanDTO } from '../dtos/loan.dto.js';
import { toReservationDTO } from '../dtos/reservation.dto.js';
import { toFineDTO } from '../dtos/fine.dto.js';
import { hashPassword, generatePassword } from '../utils/password.js';
import { str, int, email, oneOf, page, bool } from '../utils/validate.js';
import { today, addDays } from '../utils/date.js';
import { badRequest, conflict, notFound } from '../utils/AppError.js';

const READER_TYPES = ['student', 'lecturer'];

function parseReaderInput(input, settings) {
  const readerType = oneOf(input.readerType || 'student', 'Loại thẻ', READER_TYPES);
  return {
    fullName: str(input.fullName, 'Họ tên', { required: true, max: 100 }),
    email: email(input.email, 'Email', { required: true }),
    phone: str(input.phone, 'Số điện thoại', { max: 20 }),
    studentCode: str(input.studentCode, 'Mã SV/GV', { max: 30 })?.toUpperCase() ?? null,
    identityNumber: str(input.identityNumber, 'CCCD', { max: 20 }),
    readerType,
    maxBorrowLimit: int(input.maxBorrowLimit, 'Hạn mức mượn', { min: 0, max: 50 }) ?? borrowLimitFor(readerType, settings),
  };
}

async function assertUnique(data, current) {
  if (await readerRepository.findDuplicate({ ...data, excludeId: current?.reader_id })) {
    throw conflict('Dữ liệu định danh đã tồn tại trong hệ thống (Mã SV, CCCD hoặc Email)');
  }
  if (await librarianRepository.emailExists(data.email, current?.account_id)) {
    throw conflict('Email đã được sử dụng bởi tài khoản khác');
  }
}

async function requireReader(readerId) {
  const reader = await readerRepository.findById(readerId);
  if (!reader) throw notFound('Không tìm thấy độc giả');
  return reader;
}

export const readerService = {
  async list(query) {
    const { page: pageNo, pageSize, offset } = page(query);
    const now = today();
    const { rows, total } = await readerRepository.list({
      q: query.q?.trim() || null,
      type: query.type || null,
      status: query.status || null,
      today: now,
      offset,
      limit: pageSize,
    });
    return { items: rows.map((r) => toReaderCardDTO(r, now)), total, page: pageNo, pageSize };
  },

  async getCard(readerId) {
    return toReaderCardDTO(await requireReader(readerId), today());
  },

  async getDetail(readerId) {
    const reader = await requireReader(readerId);
    const now = today();
    const [loans, reservations, fines] = await Promise.all([
      loanRepository.list({ readerId, today: now, offset: 0, limit: 50 }),
      reservationRepository.list({ readerId, offset: 0, limit: 20 }),
      fineRepository.list({ readerId, offset: 0, limit: 50 }),
    ]);
    return {
      ...toReaderCardDTO(reader, now),
      loans: loans.rows.map((l) => toLoanDTO(l, now)),
      reservations: reservations.rows.map(toReservationDTO),
      fines: fines.rows.map(toFineDTO),
    };
  },

  async create(input, actor) {
    const settings = await settingService.get();
    const data = parseReaderInput(input, settings);
    await assertUnique(data);

    const username = (data.studentCode || data.email).toLowerCase();
    if (await accountRepository.findByUsername(username)) throw conflict(`Tên đăng nhập ${username} đã tồn tại`);
    const initialPassword = generatePassword();
    const passwordHash = await hashPassword(initialPassword);
    const issued = today();

    const readerId = await withTransaction(async (db) => {
      const accountId = await accountRepository.create({ username, passwordHash, role: 'reader' }, db);
      const id = await readerRepository.create(
        { ...data, accountId, cardIssuedDate: issued, cardExpiryDate: addDays(issued, settings.card_valid_days) },
        db,
      );
      await auditService.record(db, actor, 'CREATE_READER', 'reader', id, { username });
      return id;
    });

    const reader = await readerRepository.findById(readerId);
    return { reader: toReaderCardDTO(reader, today()), credentials: { username, password: initialPassword } };
  },

  async update(readerId, input, actor) {
    const settings = await settingService.get();
    const current = await requireReader(readerId);
    const data = parseReaderInput(input, settings);
    await assertUnique(data, current);
    await readerRepository.update(readerId, data);
    await auditService.record(null, actor, 'UPDATE_READER', 'reader', readerId);
    return toReaderCardDTO(await readerRepository.findById(readerId), today());
  },

  async setLocked(readerId, input, actor) {
    const reader = await requireReader(readerId);
    const locked = bool(input.locked);
    await accountRepository.setStatus(reader.account_id, !locked);
    await auditService.record(null, actor, locked ? 'LOCK_CARD' : 'UNLOCK_CARD', 'reader', readerId, {
      reason: str(input.reason, 'Lý do', { max: 255 }),
    });
    return toReaderCardDTO(await readerRepository.findById(readerId), today());
  },

  async renewCard(readerId, actor) {
    const reader = await requireReader(readerId);
    const settings = await settingService.get();
    const base = reader.card_expiry_date > today() ? reader.card_expiry_date : today();
    const expiry = addDays(base, settings.card_valid_days);
    await readerRepository.setCardExpiry(readerId, expiry);
    await auditService.record(null, actor, 'RENEW_CARD', 'reader', readerId, { expiry });
    return toReaderCardDTO(await readerRepository.findById(readerId), today());
  },

  async resetPassword(readerId, actor) {
    const reader = await requireReader(readerId);
    const password = generatePassword();
    await accountRepository.setPassword(reader.account_id, await hashPassword(password));
    await auditService.record(null, actor, 'RESET_PASSWORD', 'reader', readerId);
    return { username: reader.username, password };
  },

  async importRows(rows, actor) {
    if (!rows.length) throw badRequest('Tệp không có dòng dữ liệu nào');
    const results = { created: [], errors: [] };
    for (const [index, row] of rows.entries()) {
      try {
        const { reader, credentials } = await this.create(row, actor);
        results.created.push({ readerId: reader.readerId, fullName: reader.fullName, ...credentials });
      } catch (error) {
        results.errors.push({ row: index + 2, message: error.message });
      }
    }
    return results;
  },
};
