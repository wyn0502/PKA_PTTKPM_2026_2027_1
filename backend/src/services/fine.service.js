// Dung Pham Anh: Nghiệp vụ tính và thu phí phạt (UC-10): gợi ý số tiền, lập biên lai (thu ngay hoặc ghi nợ), thu nợ cũ
import { withTransaction } from '../db/pool.js';
import { fineRepository } from '../repositories/fine.repository.js';
import { loanRepository } from '../repositories/loan.repository.js';
import { settingService } from './setting.service.js';
import { auditService } from './audit.service.js';
import { overdueFine } from './policies.js';
import { toFineDTO } from '../dtos/fine.dto.js';
import { str, num, oneOf, page, bool } from '../utils/validate.js';
import { today, diffDays } from '../utils/date.js';
import { badRequest, conflict, forbidden, notFound } from '../utils/AppError.js';

const FINE_TYPES = ['Overdue', 'Damaged', 'Lost'];

async function requireLoanItem(loanId, barcode) {
  const loan = await loanRepository.findById(loanId);
  if (!loan) throw notFound('Không tìm thấy phiếu mượn');
  const items = await loanRepository.listDetails([loanId]);
  const item = barcode ? items.find((d) => d.barcode === barcode.toUpperCase()) : null;
  if (barcode && !item) throw badRequest('Bản sao không thuộc phiếu mượn này');
  return { loan, item };
}

export const fineService = {
  async list(query, readerId) {
    const { page: pageNo, pageSize, offset } = page(query);
    const paid = query.paid === undefined || query.paid === '' ? null : bool(query.paid);
    const { rows, total, totalAmount } = await fineRepository.list({
      q: query.q?.trim() || null,
      paid,
      readerId: readerId || query.readerId || null,
      offset,
      limit: pageSize,
    });
    return { items: rows.map(toFineDTO), total, totalAmount, page: pageNo, pageSize };
  },

  async suggest(query) {
    const loanId = str(query.loanId, 'Phiếu mượn', { required: true, max: 50 });
    const fineType = oneOf(query.fineType, 'Loại vi phạm', FINE_TYPES, { required: true });
    const barcode = str(query.barcode, 'Mã cá biệt', { max: 50 });
    const { loan, item } = await requireLoanItem(loanId, barcode);
    const settings = await settingService.get();
    if (fineType === 'Damaged') return { fineType, amount: settings.damage_fine, overdueDays: 0 };
    if (fineType === 'Lost') return { fineType, amount: settings.lost_fine, overdueDays: 0 };
    const endDate = item?.returned_at ? new Date(item.returned_at).toISOString().slice(0, 10) : today();
    const overdueDays = Math.max(0, diffDays(loan.due_date, endDate));
    const copies = item ? 1 : loan.unreturned_count || loan.item_count;
    return { fineType, overdueDays, amount: overdueFine(overdueDays, settings) * copies };
  },

  async create(actor, input) {
    if (!actor.staffId) throw forbidden('Tài khoản chưa có hồ sơ thủ thư');
    const loanId = str(input.loanId, 'Phiếu mượn', { required: true, max: 50 });
    const barcode = str(input.barcode, 'Mã cá biệt', { max: 50 })?.toUpperCase() ?? null;
    const fineType = oneOf(input.fineType, 'Loại vi phạm', FINE_TYPES, { required: true });
    const amount = num(input.amount, 'Số tiền', { required: true, min: 1000 });
    const reason = str(input.reason, 'Nội dung vi phạm', { required: true, max: 255 });
    const payNow = bool(input.payNow);
    await requireLoanItem(loanId, barcode);
    if (await fineRepository.exists({ loanId, barcode, fineType })) {
      throw conflict('Vi phạm này đã được lập biên lai trước đó');
    }

    const fineId = await withTransaction(async (db) => {
      const id = await fineRepository.create(
        { loanId, barcode, fineType, reason, amount, isPaid: payNow, collectedBy: actor.staffId },
        db,
      );
      await auditService.record(db, actor, payNow ? 'CREATE_FINE_PAID' : 'CREATE_FINE_DEBT', 'fine_receipt', id, { amount });
      return id;
    });
    return toFineDTO(await fineRepository.findById(fineId));
  },

  async pay(actor, fineId) {
    if (!actor.staffId) throw forbidden('Tài khoản chưa có hồ sơ thủ thư');
    await withTransaction(async (db) => {
      const fine = await fineRepository.findForUpdate(fineId, db);
      if (!fine) throw notFound('Không tìm thấy biên lai phạt');
      if (fine.is_paid) throw conflict('Biên lai này đã được thanh toán');
      await fineRepository.markPaid(fineId, actor.staffId, db);
      await auditService.record(db, actor, 'PAY_FINE', 'fine_receipt', fineId, { amount: fine.amount });
    });
    return toFineDTO(await fineRepository.findById(fineId));
  },

  async get(fineId, actor) {
    const fine = await fineRepository.findById(fineId);
    if (!fine) throw notFound('Không tìm thấy biên lai phạt');
    if (actor.role === 'reader' && fine.reader_id !== actor.readerId) throw forbidden();
    return toFineDTO(fine);
  },
};
