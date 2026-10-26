// Dung Pham Anh: Nghiệp vụ lưu thông: lập phiếu mượn (UC-07), ghi nhận trả (UC-08), gia hạn (UC-09), báo mất; mỗi thao tác là một transaction
import { withTransaction } from '../db/pool.js';
import { readerRepository } from '../repositories/reader.repository.js';
import { bookCopyRepository } from '../repositories/bookCopy.repository.js';
import { loanRepository } from '../repositories/loan.repository.js';
import { reservationRepository } from '../repositories/reservation.repository.js';
import { fineRepository } from '../repositories/fine.repository.js';
import { reservationService } from './reservation.service.js';
import { settingService } from './setting.service.js';
import { auditService } from './audit.service.js';
import { borrowBlockers, loanDaysFor, overdueFine, COPY_STATUS } from './policies.js';
import { toReaderCardDTO } from '../dtos/readerCard.dto.js';
import { toBookCopyDTO } from '../dtos/book.dto.js';
import { toLoanDTO } from '../dtos/loan.dto.js';
import { toLoanHistoryDTO } from '../dtos/loanHistory.dto.js';
import { toFineDTO } from '../dtos/fine.dto.js';
import { toReservationDTO } from '../dtos/reservation.dto.js';
import { str, oneOf, page, bool } from '../utils/validate.js';
import { today, addDays, diffDays } from '../utils/date.js';
import { AppError, badRequest, conflict, forbidden, notFound } from '../utils/AppError.js';

const COPY_BLOCK_REASONS = {
  Borrowed: 'Bản sao đang được mượn',
  Maintenance: 'Bản sao đang bảo trì',
  Lost: 'Bản sao đã báo mất',
  Storage: 'Bản sao đang lưu kho, chưa đưa ra phục vụ',
};

async function copyBorrowability(copy, readerId, db) {
  if (!copy) return { reason: 'Không tìm thấy bản sao với mã này' };
  if (copy.title_deleted) return { reason: 'Đầu sách đã ngừng phục vụ' };
  if (copy.loan_status === COPY_STATUS.AVAILABLE) return { reason: null };
  if (copy.loan_status === COPY_STATUS.ON_HOLD) {
    const hold = await reservationRepository.findReadyByBarcode(copy.barcode, db);
    if (hold?.reader_id === readerId) return { reason: null, reservationId: hold.reserve_id };
    return { reason: 'Bản sao đang được giữ cho độc giả đã đặt trước' };
  }
  return { reason: COPY_BLOCK_REASONS[copy.loan_status] || 'Bản sao không sẵn sàng phục vụ' };
}

async function eligibility(reader, now, db) {
  const settings = await settingService.get(db);
  const overdueCount = await loanRepository.countOverdueByReader(reader.reader_id, now, db);
  const blockers = borrowBlockers({ reader, today: now, unpaidFineTotal: Number(reader.unpaid_fine_total), overdueCount });
  const remaining = Math.max(0, reader.max_borrow_limit - reader.borrowing_count);
  return { settings, blockers, remaining, dueDate: addDays(now, loanDaysFor(reader.reader_type, settings)) };
}

function renewBlocker(loan, settings, pendingIsbns, isbns, now) {
  if (loan.status !== 'Borrowing') return 'Phiếu mượn đã hoàn tất';
  if (loan.due_date < now) return 'Không thể gia hạn do đã quá hạn trả';
  if (loan.renew_count >= settings.max_renewals) return 'Đã dùng hết số lần gia hạn cho phép';
  if (isbns.some((isbn) => pendingIsbns.has(isbn))) return 'Không thể gia hạn do sách đã có người đặt trước';
  return null;
}

function suggestedFines({ overdueDays, condition, settings, title }) {
  const fines = [];
  if (overdueDays > 0) {
    fines.push({ fineType: 'Overdue', amount: overdueFine(overdueDays, settings), reason: `Trả trễ ${overdueDays} ngày – ${title}` });
  }
  if (condition === 'Damaged') fines.push({ fineType: 'Damaged', amount: settings.damage_fine, reason: `Sách hư hỏng – ${title}` });
  if (condition === 'Lost') fines.push({ fineType: 'Lost', amount: settings.lost_fine, reason: `Mất sách – ${title}` });
  return fines;
}

function groupByLoan(items) {
  const map = new Map();
  for (const item of items) map.set(item.loan_id, [...(map.get(item.loan_id) || []), item]);
  return map;
}

export const circulationService = {
  async checkReader(code) {
    const reader = await readerRepository.findByCode(str(code, 'Mã thẻ', { required: true, max: 50 }));
    if (!reader) throw notFound('Không tìm thấy thẻ độc giả');
    const now = today();
    const { blockers, remaining, dueDate } = await eligibility(reader, now);
    const ready = await reservationRepository.list({ readerId: reader.reader_id, status: 'Ready', offset: 0, limit: 20 });
    return {
      reader: toReaderCardDTO(reader, now),
      blockers,
      remaining,
      dueDate,
      readyReservations: ready.rows.map(toReservationDTO),
    };
  },

  async checkCopy(barcode, readerId) {
    const copy = await bookCopyRepository.findByBarcode(str(barcode, 'Mã cá biệt', { required: true, max: 50 }));
    const { reason } = await copyBorrowability(copy, readerId);
    return { copy: copy ? toBookCopyDTO(copy) : null, canBorrow: !reason, reason };
  },

  async createLoan(actor, input) {
    if (!actor.staffId) throw forbidden('Tài khoản chưa có hồ sơ thủ thư để lập phiếu');
    const readerId = str(input.readerId, 'Độc giả', { required: true, max: 50 });
    const barcodes = [...new Set((input.barcodes || []).map((b) => String(b).trim().toUpperCase()).filter(Boolean))];
    if (!barcodes.length) throw badRequest('Chưa quét bản sao nào');
    if (barcodes.length !== (input.barcodes || []).length) throw badRequest('Danh sách có bản sao bị trùng');

    const loanId = await withTransaction(async (db) => {
      await readerRepository.lockForUpdate(readerId, db);
      const reader = await readerRepository.findById(readerId, db);
      if (!reader) throw notFound('Không tìm thấy độc giả');
      const now = today();
      const { blockers, remaining, dueDate } = await eligibility(reader, now, db);
      if (blockers.length) throw badRequest(blockers[0], { reasons: blockers });
      if (barcodes.length > remaining) {
        throw badRequest(`Độc giả đã đạt số lượng mượn tối đa (còn được mượn ${remaining} cuốn)`);
      }

      const reservationIds = [];
      const problems = [];
      for (const barcode of barcodes) {
        const copy = await bookCopyRepository.findForUpdate(barcode, db);
        const { reason, reservationId } = await copyBorrowability(copy, readerId, db);
        if (reason) problems.push({ barcode, reason });
        if (reservationId) reservationIds.push(reservationId);
      }
      if (problems.length) throw new AppError(409, `${problems.length} bản sao không thể cho mượn`, { problems });

      const loan = await loanRepository.createRecord({ readerId, staffId: actor.staffId, createdDate: now, dueDate }, db);
      await loanRepository.addDetails(loan.loan_id, barcodes, db);
      await bookCopyRepository.setStatusMany(barcodes, COPY_STATUS.BORROWED, db);
      for (const id of reservationIds) await reservationRepository.fulfill(id, db);
      await auditService.record(db, actor, 'CREATE_LOAN', 'loan_record', loan.loan_id, { readerId, barcodes, dueDate });
      return loan.loan_id;
    });
    return this.getLoan(loanId);
  },

  async returnCopy(actor, input) {
    const barcode = str(input.barcode, 'Mã cá biệt', { required: true, max: 50 });
    const condition = oneOf(input.condition || 'Good', 'Tình trạng khi trả', ['Good', 'Damaged']);
    return this.closeCopy(actor, { barcode, condition, action: 'RETURN_COPY' });
  },

  async reportLost(actor, input) {
    const barcode = str(input.barcode, 'Mã cá biệt', { required: true, max: 50 });
    return this.closeCopy(actor, { barcode, condition: 'Lost', action: 'REPORT_LOST' });
  },

  async closeCopy(actor, { barcode, condition, action }) {
    return withTransaction(async (db) => {
      const detail = await loanRepository.findActiveDetailForUpdate(barcode, db);
      if (!detail) {
        const copy = await bookCopyRepository.findByBarcode(barcode, db);
        throw notFound(copy ? 'Bản sao này không nằm trong phiếu mượn nào đang hoạt động' : 'Không tìm thấy bản sao với mã này');
      }
      const now = today();
      const settings = await settingService.get(db);
      await bookCopyRepository.findForUpdate(detail.barcode, db);
      await loanRepository.markDetailReturned({ loanId: detail.loan_id, barcode: detail.barcode, condition }, db);

      let heldFor = null;
      if (condition === 'Good') {
        heldFor = await reservationService.allocateCopy(db, { barcode: detail.barcode, isbn: detail.isbn }, settings);
      } else {
        await bookCopyRepository.setStatus(detail.barcode, condition === 'Lost' ? COPY_STATUS.LOST : COPY_STATUS.MAINTENANCE, db);
        if (condition === 'Damaged') await bookCopyRepository.setCondition(detail.barcode, 'Damaged', db);
      }

      const loanClosed = (await loanRepository.countUnreturned(detail.loan_id, db)) === 0;
      if (loanClosed) await loanRepository.close(detail.loan_id, now, db);

      const overdueDays = Math.max(0, diffDays(detail.due_date, now));
      await auditService.record(db, actor, action, 'loan_detail', detail.loan_id, { barcode: detail.barcode, condition, overdueDays });
      return {
        loanId: detail.loan_id,
        barcode: detail.barcode,
        title: detail.title,
        readerId: detail.reader_id,
        readerName: detail.reader_name,
        dueDate: detail.due_date,
        overdueDays,
        condition,
        loanClosed,
        heldForReservation: heldFor ? heldFor.reserve_id : null,
        suggestedFines: suggestedFines({ overdueDays, condition, settings, title: detail.title }),
      };
    });
  },

  async renew(actor, loanId) {
    const result = await withTransaction(async (db) => {
      const loan = await loanRepository.findForUpdate(loanId, db);
      if (!loan) throw notFound('Không tìm thấy phiếu mượn');
      if (actor.role === 'reader' && loan.reader_id !== actor.readerId) throw forbidden();
      const now = today();
      const settings = await settingService.get(db);
      const isbns = await loanRepository.unreturnedIsbns(loanId, db);
      const pending = await reservationRepository.pendingIsbnSet(isbns, db);
      const blocker = renewBlocker(loan, settings, pending, isbns, now);
      if (blocker) throw conflict(blocker);
      const dueDate = addDays(loan.due_date, settings.renew_days);
      await loanRepository.renew(loanId, dueDate, db);
      await auditService.record(db, actor, 'RENEW_LOAN', 'loan_record', loanId, { from: loan.due_date, to: dueDate });
      return dueDate;
    });
    return { ...(await this.getLoan(loanId)), newDueDate: result };
  },

  async listLoans(query) {
    const { page: pageNo, pageSize, offset } = page(query);
    const now = today();
    const { rows, total } = await loanRepository.list({
      q: query.q?.trim() || null,
      status: query.status || null,
      overdue: bool(query.overdue),
      readerId: query.readerId || null,
      today: now,
      offset,
      limit: pageSize,
    });
    return { items: rows.map((r) => toLoanDTO(r, now)), total, page: pageNo, pageSize };
  },

  async getLoan(loanId, actor) {
    const loan = await loanRepository.findById(loanId);
    if (!loan) throw notFound('Không tìm thấy phiếu mượn');
    if (actor?.role === 'reader' && loan.reader_id !== actor.readerId) throw forbidden();
    const [items, fines] = await Promise.all([loanRepository.listDetails([loanId]), fineRepository.listByLoan(loanId)]);
    return { ...toLoanDTO(loan, today(), items), fines: fines.map(toFineDTO) };
  },

  async myLoans(actor) {
    if (!actor.readerId) throw forbidden('Chỉ độc giả mới có lịch sử mượn');
    const now = today();
    const settings = await settingService.get();
    const { rows } = await loanRepository.list({ readerId: actor.readerId, today: now, offset: 0, limit: 100 });
    const details = await loanRepository.listDetails(rows.map((r) => r.loan_id));
    const activeIsbns = details.filter((d) => !d.returned_at).map((d) => d.isbn);
    const pending = await reservationRepository.pendingIsbnSet([...new Set(activeIsbns)]);

    const byLoan = groupByLoan(details);
    const loans = rows.map((loan) => {
      const items = byLoan.get(loan.loan_id) || [];
      const isbns = items.filter((d) => !d.returned_at).map((d) => d.isbn);
      const blocker = renewBlocker(loan, settings, pending, isbns, now);
      return { ...toLoanDTO(loan, now, items), canRenew: !blocker, renewBlocker: blocker };
    });
    const history = rows.flatMap((loan) => (byLoan.get(loan.loan_id) || []).map((item) => toLoanHistoryDTO(loan, item, now)));
    return { loans, history };
  },
};
