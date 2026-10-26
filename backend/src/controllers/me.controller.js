// Dung Pham Anh: Controller cổng độc giả: thẻ của tôi, sách đang mượn, đặt trước, phí phạt, gia hạn
import { readerService } from '../services/reader.service.js';
import { circulationService } from '../services/circulation.service.js';
import { reservationService } from '../services/reservation.service.js';
import { fineService } from '../services/fine.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const meController = {
  profile: asyncHandler(async (req, res) => res.json(await readerService.getCard(req.user.readerId))),
  loans: asyncHandler(async (req, res) => res.json(await circulationService.myLoans(req.user))),
  reservations: asyncHandler(async (req, res) => res.json(await reservationService.list(req.query, req.user.readerId))),
  fines: asyncHandler(async (req, res) => res.json(await fineService.list(req.query, req.user.readerId))),
};
