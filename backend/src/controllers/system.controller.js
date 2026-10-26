// Dung Pham Anh: Controller quản trị hệ thống: tham số nghiệp vụ, nhật ký thao tác, tệp mẫu nhập Excel
import { settingService } from '../services/setting.service.js';
import { auditService } from '../services/audit.service.js';
import { buildTemplate } from '../utils/excel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendFile } from './report.controller.js';

export const systemController = {
  listSettings: asyncHandler(async (req, res) => res.json(await settingService.list())),
  updateSettings: asyncHandler(async (req, res) => res.json(await settingService.update(req.body, req.user))),
  auditLogs: asyncHandler(async (req, res) => res.json(await auditService.list(req.query))),
  template: asyncHandler(async (req, res) => sendFile(res, await buildTemplate(req.params.type))),
};
