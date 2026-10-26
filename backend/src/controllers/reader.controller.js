// Dung Pham Anh: Controller quản lý độc giả và thẻ thư viện (UC-02)
import { readerService } from '../services/reader.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { readRows, readerTypeFromLabel } from '../utils/excel.js';
import { badRequest } from '../utils/AppError.js';

export const readerController = {
  list: asyncHandler(async (req, res) => res.json(await readerService.list(req.query))),
  detail: asyncHandler(async (req, res) => res.json(await readerService.getDetail(req.params.id))),
  create: asyncHandler(async (req, res) => res.status(201).json(await readerService.create(req.body, req.user))),
  update: asyncHandler(async (req, res) => res.json(await readerService.update(req.params.id, req.body, req.user))),
  setLocked: asyncHandler(async (req, res) => res.json(await readerService.setLocked(req.params.id, req.body, req.user))),
  renewCard: asyncHandler(async (req, res) => res.json(await readerService.renewCard(req.params.id, req.user))),
  resetPassword: asyncHandler(async (req, res) => res.json(await readerService.resetPassword(req.params.id, req.user))),
  importExcel: asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest('Chưa chọn tệp Excel');
    const rows = (await readRows(req.file.buffer, 'readers')).map((r) => ({ ...r, readerType: readerTypeFromLabel(r.readerType) }));
    res.json(await readerService.importRows(rows, req.user));
  }),
};
