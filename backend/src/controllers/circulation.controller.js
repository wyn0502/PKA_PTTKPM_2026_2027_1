// Dung Pham Anh: Controller lưu thông: kiểm tra thẻ/bản sao, lập phiếu mượn, trả, báo mất, gia hạn, tra cứu phiếu
import { circulationService } from '../services/circulation.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const circulationController = {
  checkReader: asyncHandler(async (req, res) => res.json(await circulationService.checkReader(req.params.code))),
  checkCopy: asyncHandler(async (req, res) => res.json(await circulationService.checkCopy(req.params.barcode, req.query.readerId))),
  createLoan: asyncHandler(async (req, res) => res.status(201).json(await circulationService.createLoan(req.user, req.body))),
  returnCopy: asyncHandler(async (req, res) => res.json(await circulationService.returnCopy(req.user, req.body))),
  reportLost: asyncHandler(async (req, res) => res.json(await circulationService.reportLost(req.user, req.body))),
  renew: asyncHandler(async (req, res) => res.json(await circulationService.renew(req.user, req.params.id))),
  listLoans: asyncHandler(async (req, res) => res.json(await circulationService.listLoans(req.query))),
  getLoan: asyncHandler(async (req, res) => res.json(await circulationService.getLoan(req.params.id, req.user))),
};
