// Dung Pham Anh: Controller danh mục: thể loại, nhà xuất bản, đầu sách (UC-03, UC-05) và bản sao (UC-04)
import { catalogService } from '../services/catalog.service.js';
import { copyService } from '../services/copy.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { readRows } from '../utils/excel.js';
import { badRequest } from '../utils/AppError.js';

const noContent = (action) =>
  asyncHandler(async (req, res) => {
    await action(req);
    res.status(204).end();
  });

export const catalogController = {
  listCategories: asyncHandler(async (req, res) => res.json(await catalogService.listCategories())),
  createCategory: asyncHandler(async (req, res) => res.status(201).json(await catalogService.saveCategory(null, req.body, req.user))),
  updateCategory: asyncHandler(async (req, res) => res.json(await catalogService.saveCategory(req.params.id, req.body, req.user))),
  deleteCategory: noContent((req) => catalogService.deleteCategory(req.params.id, req.user)),

  listPublishers: asyncHandler(async (req, res) => res.json(await catalogService.listPublishers())),
  createPublisher: asyncHandler(async (req, res) => res.status(201).json(await catalogService.savePublisher(null, req.body, req.user))),
  updatePublisher: asyncHandler(async (req, res) => res.json(await catalogService.savePublisher(req.params.id, req.body, req.user))),
  deletePublisher: noContent((req) => catalogService.deletePublisher(req.params.id, req.user)),

  searchTitles: asyncHandler(async (req, res) => res.json(await catalogService.searchTitles(req.query))),
  getTitle: asyncHandler(async (req, res) =>
    res.json(await catalogService.getTitle(req.params.isbn, { includeBorrowers: req.user.role !== 'reader' })),
  ),
  createTitle: asyncHandler(async (req, res) => res.status(201).json(await catalogService.createTitle(req.body, req.user))),
  updateTitle: asyncHandler(async (req, res) => res.json(await catalogService.updateTitle(req.params.isbn, req.body, req.user))),
  deleteTitle: noContent((req) => catalogService.deleteTitle(req.params.isbn, req.user)),
  importTitles: asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest('Chưa chọn tệp Excel');
    res.json(await catalogService.importTitles(await readRows(req.file.buffer, 'titles'), req.user));
  }),

  addCopies: asyncHandler(async (req, res) => res.status(201).json(await copyService.addCopies(req.params.isbn, req.body, req.user))),
  getCopy: asyncHandler(async (req, res) => res.json(await copyService.getCopy(req.params.barcode))),
  updateCopy: asyncHandler(async (req, res) => res.json(await copyService.updateCopy(req.params.barcode, req.body, req.user))),
  changeCopyStatus: asyncHandler(async (req, res) => res.json(await copyService.changeStatus(req.params.barcode, req.body, req.user))),
};
