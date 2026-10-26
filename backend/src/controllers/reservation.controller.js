// Dung Pham Anh: Controller đặt trước tài liệu (UC-06)
import { reservationService } from '../services/reservation.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const reservationController = {
  list: asyncHandler(async (req, res) => res.json(await reservationService.list(req.query))),
  create: asyncHandler(async (req, res) => res.status(201).json(await reservationService.create(req.user, req.body))),
  cancel: asyncHandler(async (req, res) => res.json(await reservationService.cancel(req.user, req.params.id))),
};
