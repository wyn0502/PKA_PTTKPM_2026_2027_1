// Dung Pham Anh: Controller phí phạt (UC-10)
import { fineService } from '../services/fine.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const fineController = {
  list: asyncHandler(async (req, res) => res.json(await fineService.list(req.query))),
  suggest: asyncHandler(async (req, res) => res.json(await fineService.suggest(req.query))),
  get: asyncHandler(async (req, res) => res.json(await fineService.get(req.params.id, req.user))),
  create: asyncHandler(async (req, res) => res.status(201).json(await fineService.create(req.user, req.body))),
  pay: asyncHandler(async (req, res) => res.json(await fineService.pay(req.user, req.params.id))),
};
