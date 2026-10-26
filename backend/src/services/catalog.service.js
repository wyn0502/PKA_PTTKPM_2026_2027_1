// Dung Pham Anh: Nghiệp vụ danh mục tài liệu: thể loại phân cấp, nhà xuất bản, đầu sách (UC-03, FR-01, FR-03) và nhập Excel
import { withTransaction } from '../db/pool.js';
import { categoryRepository } from '../repositories/category.repository.js';
import { publisherRepository } from '../repositories/publisher.repository.js';
import { bookTitleRepository } from '../repositories/bookTitle.repository.js';
import { bookCopyRepository } from '../repositories/bookCopy.repository.js';
import { auditService } from './audit.service.js';
import { reservationService } from './reservation.service.js';
import { toCategoryDTO, toPublisherDTO } from '../dtos/catalog.dto.js';
import { toBookTitleDTO, toBookCopyDTO } from '../dtos/book.dto.js';
import { normalizeIsbn, isValidIsbn } from '../utils/isbn.js';
import { str, int, email, page, bool, oneOf } from '../utils/validate.js';
import { badRequest, conflict, notFound } from '../utils/AppError.js';

const CONDITIONS = ['Good', 'Worn', 'Damaged'];

function parseIsbn(value) {
  const isbn = normalizeIsbn(value);
  if (!isbn) throw badRequest('ISBN không được để trống');
  if (!isValidIsbn(isbn)) throw badRequest(`ISBN ${isbn} không hợp lệ (cần ISBN-10 hoặc ISBN-13 đúng chữ số kiểm tra)`);
  return isbn;
}

async function parseTitleInput(input) {
  const data = {
    categoryId: str(input.categoryId, 'Thể loại', { required: true, max: 50 }),
    publisherId: str(input.publisherId, 'Nhà xuất bản', { required: true, max: 50 }),
    title: str(input.title, 'Nhan đề', { required: true, max: 250 }),
    author: str(input.author, 'Tác giả', { required: true, max: 100 }),
    publishYear: int(input.publishYear, 'Năm xuất bản', { min: 1450, max: new Date().getFullYear() + 1 }),
    description: str(input.description, 'Mô tả', { max: 2000 }),
  };
  const [category, publisher] = await Promise.all([
    categoryRepository.findById(data.categoryId),
    publisherRepository.findById(data.publisherId),
  ]);
  if (!category) throw badRequest('Thể loại không tồn tại');
  if (!publisher) throw badRequest('Nhà xuất bản không tồn tại');
  return data;
}

function parseCopyOptions(input) {
  return {
    shelfLocation: str(input.shelfLocation, 'Vị trí kệ', { max: 50 }),
    physicalCondition: oneOf(input.physicalCondition || 'Good', 'Tình trạng vật lý', CONDITIONS),
  };
}

export const catalogService = {
  async listCategories() {
    return (await categoryRepository.list()).map(toCategoryDTO);
  },

  async saveCategory(categoryId, input, actor) {
    const data = {
      categoryName: str(input.categoryName, 'Tên thể loại', { required: true, max: 100 }),
      description: str(input.description, 'Mô tả', { max: 255 }),
      parentId: str(input.parentId, 'Thể loại cha', { max: 50 }),
    };
    if (data.parentId) {
      if (!(await categoryRepository.findById(data.parentId))) throw badRequest('Thể loại cha không tồn tại');
      if (categoryId && (await categoryRepository.isDescendant(categoryId, data.parentId))) {
        throw badRequest('Không thể chọn chính thể loại này hoặc thể loại con làm thể loại cha');
      }
    }
    const sameName = await categoryRepository.findByName(data.categoryName);
    if (sameName && sameName.category_id !== categoryId) throw conflict('Tên thể loại đã tồn tại');

    const saved = categoryId
      ? await categoryRepository.update(categoryId, data)
      : await categoryRepository.create(data);
    if (!saved) throw notFound('Không tìm thấy thể loại');
    await auditService.record(null, actor, categoryId ? 'UPDATE_CATEGORY' : 'CREATE_CATEGORY', 'category', saved.category_id);
    return toCategoryDTO(saved);
  },

  async deleteCategory(categoryId, actor) {
    if (!(await categoryRepository.findById(categoryId))) throw notFound('Không tìm thấy thể loại');
    if (await categoryRepository.isInUse(categoryId)) throw conflict('Thể loại đang có đầu sách hoặc thể loại con, không thể xoá');
    await categoryRepository.remove(categoryId);
    await auditService.record(null, actor, 'DELETE_CATEGORY', 'category', categoryId);
  },

  async listPublishers() {
    return (await publisherRepository.list()).map(toPublisherDTO);
  },

  async savePublisher(publisherId, input, actor) {
    const data = {
      publisherName: str(input.publisherName, 'Tên nhà xuất bản', { required: true, max: 150 }),
      address: str(input.address, 'Địa chỉ', { max: 250 }),
      contactEmail: email(input.contactEmail, 'Email liên hệ'),
      phone: str(input.phone, 'Số điện thoại', { max: 20 }),
    };
    const sameName = await publisherRepository.findByName(data.publisherName);
    if (sameName && sameName.publisher_id !== publisherId) throw conflict('Tên nhà xuất bản đã tồn tại');
    const saved = publisherId
      ? await publisherRepository.update(publisherId, data)
      : await publisherRepository.create(data);
    if (!saved) throw notFound('Không tìm thấy nhà xuất bản');
    await auditService.record(null, actor, publisherId ? 'UPDATE_PUBLISHER' : 'CREATE_PUBLISHER', 'publisher', saved.publisher_id);
    return toPublisherDTO(saved);
  },

  async deletePublisher(publisherId, actor) {
    if (!(await publisherRepository.findById(publisherId))) throw notFound('Không tìm thấy nhà xuất bản');
    if (await publisherRepository.isInUse(publisherId)) throw conflict('Nhà xuất bản đang có đầu sách, không thể xoá');
    await publisherRepository.remove(publisherId);
    await auditService.record(null, actor, 'DELETE_PUBLISHER', 'publisher', publisherId);
  },

  async searchTitles(query) {
    const { page: pageNo, pageSize, offset } = page(query);
    const { rows, total } = await bookTitleRepository.search({
      q: query.q?.trim() || null,
      categoryId: query.categoryId || null,
      publisherId: query.publisherId || null,
      availableOnly: bool(query.availableOnly),
      sort: query.sort,
      offset,
      limit: pageSize,
    });
    return { items: rows.map(toBookTitleDTO), total, page: pageNo, pageSize };
  },

  async getTitle(isbn, { includeBorrowers = true } = {}) {
    const title = await bookTitleRepository.findByIsbn(normalizeIsbn(isbn));
    if (!title) throw notFound('Không tìm thấy đầu sách');
    const copies = (await bookCopyRepository.listByIsbn(title.isbn)).map(toBookCopyDTO);
    return {
      ...toBookTitleDTO(title),
      copies: includeBorrowers ? copies : copies.map(({ borrower, ...copy }) => ({ ...copy, dueDate: borrower?.dueDate ?? null })),
    };
  },

  async createTitle(input, actor) {
    const isbn = parseIsbn(input.isbn);
    const data = { isbn, ...(await parseTitleInput(input)) };
    const initialCopies = int(input.initialCopies, 'Số bản sao', { min: 0, max: 200 }) ?? 0;
    const copyOptions = parseCopyOptions(input);
    const existing = await bookTitleRepository.exists(isbn);
    if (existing && !existing.is_deleted) throw conflict('Mã ISBN này đã tồn tại trong tủ sách');

    const barcodes = await withTransaction(async (db) => {
      if (existing) await bookTitleRepository.restore(data, db);
      else await bookTitleRepository.create(data, db);
      const created = initialCopies
        ? await bookCopyRepository.createMany({ isbn, quantity: initialCopies, ...copyOptions }, db)
        : [];
      await auditService.record(db, actor, 'CREATE_TITLE', 'book_title', isbn, { copies: created.length });
      return created;
    });
    return { ...(await this.getTitle(isbn)), createdBarcodes: barcodes };
  },

  async updateTitle(isbn, input, actor) {
    const key = normalizeIsbn(isbn);
    if (!(await bookTitleRepository.findByIsbn(key))) throw notFound('Không tìm thấy đầu sách');
    await bookTitleRepository.update(key, await parseTitleInput(input));
    await auditService.record(null, actor, 'UPDATE_TITLE', 'book_title', key);
    return this.getTitle(key);
  },

  async deleteTitle(isbn, actor) {
    const key = normalizeIsbn(isbn);
    if (!(await bookTitleRepository.findByIsbn(key))) throw notFound('Không tìm thấy đầu sách');
    if ((await bookCopyRepository.countInCirculation(key)) > 0) {
      throw conflict('Đầu sách còn bản sao đang được mượn hoặc giữ chỗ, không thể xoá');
    }
    await withTransaction(async (db) => {
      await bookTitleRepository.softDelete(key, db);
      await reservationService.cancelPendingForTitle(db, key);
      await auditService.record(db, actor, 'DELETE_TITLE', 'book_title', key);
    });
  },

  async importTitles(rows, actor) {
    if (!rows.length) throw badRequest('Tệp không có dòng dữ liệu nào');
    const results = { created: [], errors: [] };
    for (const [index, row] of rows.entries()) {
      try {
        parseIsbn(row.isbn);
        const categoryId = await this.resolveCategory(row.categoryName, actor);
        const publisherId = await this.resolvePublisher(row.publisherName, actor);
        const title = await this.createTitle({ ...row, categoryId, publisherId }, actor);
        results.created.push({ isbn: title.isbn, title: title.title, copies: title.createdBarcodes.length });
      } catch (error) {
        results.errors.push({ row: index + 2, message: error.message });
      }
    }
    return results;
  },

  async resolveCategory(name, actor) {
    const categoryName = str(name, 'Thể loại', { required: true, max: 100 });
    const found = await categoryRepository.findByName(categoryName);
    return found ? found.category_id : (await this.saveCategory(null, { categoryName }, actor)).categoryId;
  },

  async resolvePublisher(name, actor) {
    const publisherName = str(name, 'Nhà xuất bản', { required: true, max: 150 });
    const found = await publisherRepository.findByName(publisherName);
    return found ? found.publisher_id : (await this.savePublisher(null, { publisherName }, actor)).publisherId;
  },
};

export { parseCopyOptions, CONDITIONS };
