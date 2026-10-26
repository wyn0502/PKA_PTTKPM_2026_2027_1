// Dung Pham Anh: Nghiệp vụ bản sao vật lý (UC-04): thêm hàng loạt mã cá biệt, cập nhật vị trí/tình trạng, chuyển trạng thái theo mục 4.5
import { withTransaction } from '../db/pool.js';
import { bookCopyRepository } from '../repositories/bookCopy.repository.js';
import { bookTitleRepository } from '../repositories/bookTitle.repository.js';
import { reservationService } from './reservation.service.js';
import { settingService } from './setting.service.js';
import { auditService } from './audit.service.js';
import { parseCopyOptions } from './catalog.service.js';
import { canTransitionManually, COPY_STATUS, MANUAL_COPY_TRANSITIONS } from './policies.js';
import { toBookCopyDTO } from '../dtos/book.dto.js';
import { normalizeIsbn } from '../utils/isbn.js';
import { int, str } from '../utils/validate.js';
import { badRequest, conflict, notFound } from '../utils/AppError.js';

async function requireCopy(barcode) {
  const copy = await bookCopyRepository.findByBarcode(barcode);
  if (!copy) throw notFound('Không tìm thấy bản sao với mã cá biệt này');
  return copy;
}

export const copyService = {
  async addCopies(isbn, input, actor) {
    const key = normalizeIsbn(isbn);
    if (!(await bookTitleRepository.findByIsbn(key))) throw notFound('Không tìm thấy đầu sách');
    const quantity = int(input.quantity, 'Số lượng', { required: true, min: 1, max: 200 });
    const options = parseCopyOptions(input);

    const barcodes = await withTransaction(async (db) => {
      const created = await bookCopyRepository.createMany({ isbn: key, quantity, ...options }, db);
      const settings = await settingService.get(db);
      for (const barcode of created) {
        if (!(await reservationService.allocateCopy(db, { barcode, isbn: key }, settings))) break;
      }
      await auditService.record(db, actor, 'ADD_COPIES', 'book_title', key, { barcodes: created });
      return created;
    });
    return { isbn: key, barcodes };
  },

  async getCopy(barcode) {
    return toBookCopyDTO(await requireCopy(barcode));
  },

  async updateCopy(barcode, input, actor) {
    const copy = await requireCopy(barcode);
    await bookCopyRepository.update(copy.barcode, parseCopyOptions(input));
    await auditService.record(null, actor, 'UPDATE_COPY', 'book_copy', copy.barcode);
    return this.getCopy(copy.barcode);
  },

  async changeStatus(barcode, input, actor) {
    const target = str(input.status, 'Trạng thái', { required: true, max: 20 });
    if (!Object.values(COPY_STATUS).includes(target)) throw badRequest('Trạng thái không hợp lệ');
    const note = str(input.note, 'Ghi chú', { max: 255 });

    await withTransaction(async (db) => {
      const copy = await bookCopyRepository.findForUpdate(barcode, db);
      if (!copy) throw notFound('Không tìm thấy bản sao với mã cá biệt này');
      if (!canTransitionManually(copy.loan_status, target)) {
        const allowed = MANUAL_COPY_TRANSITIONS[copy.loan_status];
        throw conflict(
          allowed.length
            ? `Không thể chuyển từ ${copy.loan_status} sang ${target}`
            : 'Bản sao đang được mượn hoặc giữ chỗ, hãy xử lý qua nghiệp vụ mượn – trả',
        );
      }
      if (target === COPY_STATUS.AVAILABLE) {
        await reservationService.allocateCopy(db, { barcode: copy.barcode, isbn: copy.isbn }, await settingService.get(db));
      } else {
        await bookCopyRepository.setStatus(copy.barcode, target, db);
      }
      await auditService.record(db, actor, 'CHANGE_COPY_STATUS', 'book_copy', copy.barcode, {
        from: copy.loan_status,
        to: target,
        note,
      });
    });
    return this.getCopy(barcode);
  },
};
