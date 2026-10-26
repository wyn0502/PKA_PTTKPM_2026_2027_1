// Dung Pham Anh: Nghiệp vụ đặt trước (UC-06): xếp hàng theo đầu sách, giữ bản sao khi có sách trả về, huỷ và hết hạn
import { withTransaction } from '../db/pool.js';
import { reservationRepository } from '../repositories/reservation.repository.js';
import { readerRepository } from '../repositories/reader.repository.js';
import { bookTitleRepository } from '../repositories/bookTitle.repository.js';
import { bookCopyRepository } from '../repositories/bookCopy.repository.js';
import { loanRepository } from '../repositories/loan.repository.js';
import { settingService } from './setting.service.js';
import { auditService } from './audit.service.js';
import { borrowBlockers, COPY_STATUS } from './policies.js';
import { toReservationDTO } from '../dtos/reservation.dto.js';
import { normalizeIsbn } from '../utils/isbn.js';
import { page } from '../utils/validate.js';
import { today, addDays } from '../utils/date.js';
import { badRequest, conflict, forbidden, notFound } from '../utils/AppError.js';

export const reservationService = {
  async create(actor, input) {
    const reader = await readerRepository.findByAccountId(actor.accountId);
    if (!reader) throw forbidden('Chỉ độc giả mới đặt trước được tài liệu');
    const isbn = normalizeIsbn(input.isbn);
    const title = await bookTitleRepository.findByIsbn(isbn);
    if (!title) throw notFound('Không tìm thấy đầu sách');

    const now = today();
    const settings = await settingService.get();
    const blockers = borrowBlockers({
      reader,
      today: now,
      unpaidFineTotal: Number(reader.unpaid_fine_total),
      overdueCount: await loanRepository.countOverdueByReader(reader.reader_id, now),
    });
    if (blockers.length) throw badRequest(blockers[0], { reasons: blockers });
    if (title.available_copies > 0) throw conflict('Đầu sách vẫn còn bản sao khả dụng, bạn có thể đến quầy mượn trực tiếp');
    if (await reservationRepository.findActive(reader.reader_id, isbn)) {
      throw conflict('Bạn đã nằm trong danh sách chờ của tài liệu này');
    }
    if ((await reservationRepository.countActiveByReader(reader.reader_id)) >= settings.max_reservations) {
      throw conflict(`Bạn chỉ được đặt trước tối đa ${settings.max_reservations} tài liệu cùng lúc`);
    }

    const reserveId = await reservationRepository.create({
      readerId: reader.reader_id,
      isbn,
      expireDate: addDays(now, settings.reservation_wait_days),
    });
    await auditService.record(null, actor, 'CREATE_RESERVATION', 'reservation', reserveId, { isbn });
    return toReservationDTO(await reservationRepository.findById(reserveId));
  },

  async cancel(actor, reserveId) {
    const reservation = await reservationRepository.findById(reserveId);
    if (!reservation) throw notFound('Không tìm thấy yêu cầu đặt trước');
    if (actor.role === 'reader' && reservation.reader_id !== actor.readerId) throw forbidden();
    if (!['Pending', 'Ready'].includes(reservation.status)) throw conflict('Yêu cầu này đã kết thúc, không thể huỷ');

    await withTransaction(async (db) => {
      const locked = await reservationRepository.findForUpdate(reserveId, db);
      await reservationRepository.setStatus(reserveId, 'Cancelled', db);
      if (locked.status === 'Ready' && locked.barcode) await this.releaseHeldCopy(db, locked);
      await auditService.record(db, actor, 'CANCEL_RESERVATION', 'reservation', reserveId);
    });
    return toReservationDTO(await reservationRepository.findById(reserveId));
  },

  async list(query, readerId) {
    const { page: pageNo, pageSize, offset } = page(query);
    const { rows, total } = await reservationRepository.list({
      readerId: readerId || query.readerId || null,
      status: query.status || null,
      isbn: query.isbn ? normalizeIsbn(query.isbn) : null,
      offset,
      limit: pageSize,
    });
    return { items: rows.map(toReservationDTO), total, page: pageNo, pageSize };
  },

  async allocateCopy(db, { barcode, isbn }, settings) {
    const next = await reservationRepository.firstPendingForUpdate(isbn, db);
    if (!next) {
      await bookCopyRepository.setStatus(barcode, COPY_STATUS.AVAILABLE, db);
      return null;
    }
    await reservationRepository.markReady(next.reserve_id, { barcode, expireDate: addDays(today(), settings.hold_days) }, db);
    await bookCopyRepository.setStatus(barcode, COPY_STATUS.ON_HOLD, db);
    return next;
  },

  async releaseHeldCopy(db, reservation) {
    const copy = await bookCopyRepository.findForUpdate(reservation.barcode, db);
    if (copy?.loan_status !== COPY_STATUS.ON_HOLD) return;
    await this.allocateCopy(db, { barcode: copy.barcode, isbn: copy.isbn }, await settingService.get(db));
  },

  cancelPendingForTitle(db, isbn) {
    return reservationRepository.cancelPendingByIsbn(isbn, db);
  },

  async expireOverdue() {
    return withTransaction(async (db) => {
      const expired = await reservationRepository.findExpiredForUpdate(today(), db);
      for (const reservation of expired) {
        await reservationRepository.setStatus(reservation.reserve_id, 'Expired', db);
        if (reservation.status === 'Ready' && reservation.barcode) await this.releaseHeldCopy(db, reservation);
      }
      return expired.length;
    });
  },
};
