// Dung Pham Anh: Controller thống kê – báo cáo (UC-11) và tải tệp Excel
import { reportService } from '../services/report.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export function sendFile(res, { buffer, filename }) {
  res.setHeader('Content-Type', XLSX_TYPE);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(Buffer.from(buffer));
}

export const reportController = {
  summary: asyncHandler(async (req, res) => res.json(await reportService.summary())),
  get: asyncHandler(async (req, res) => res.json(await reportService.get(req.params.type, req.query))),
  exportXlsx: asyncHandler(async (req, res) => sendFile(res, await reportService.exportXlsx(req.params.type, req.query))),
};
