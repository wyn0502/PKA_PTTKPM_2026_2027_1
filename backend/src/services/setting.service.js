// Dung Pham Anh: Nghiệp vụ tham số hệ thống (FR-28, NFR-08): đọc kèm giá trị mặc định và cập nhật có kiểm tra
import { settingRepository } from '../repositories/setting.repository.js';
import { auditService } from './audit.service.js';
import { badRequest } from '../utils/AppError.js';

export const SETTING_DEFINITIONS = {
  loan_days_student: { value: 14, min: 1, max: 365, label: 'Số ngày mượn – Sinh viên' },
  loan_days_lecturer: { value: 30, min: 1, max: 365, label: 'Số ngày mượn – Giảng viên' },
  max_borrow_student: { value: 3, min: 0, max: 50, label: 'Số cuốn tối đa – Sinh viên' },
  max_borrow_lecturer: { value: 5, min: 0, max: 50, label: 'Số cuốn tối đa – Giảng viên' },
  max_renewals: { value: 1, min: 0, max: 10, label: 'Số lần gia hạn tối đa' },
  renew_days: { value: 7, min: 1, max: 90, label: 'Số ngày cộng thêm khi gia hạn' },
  fine_per_day: { value: 2000, min: 0, max: 1000000, label: 'Phí quá hạn mỗi ngày (đ/cuốn)' },
  damage_fine: { value: 50000, min: 0, max: 10000000, label: 'Phí hư hỏng mặc định (đ)' },
  lost_fine: { value: 150000, min: 0, max: 10000000, label: 'Phí mất sách mặc định (đ)' },
  hold_days: { value: 3, min: 1, max: 30, label: 'Số ngày giữ sách đặt trước' },
  reservation_wait_days: { value: 30, min: 1, max: 365, label: 'Thời hạn chờ của yêu cầu đặt trước (ngày)' },
  max_reservations: { value: 3, min: 0, max: 20, label: 'Số yêu cầu đặt trước tối đa' },
  card_valid_days: { value: 365, min: 30, max: 3650, label: 'Thời hạn thẻ thư viện (ngày)' },
  max_login_attempts: { value: 5, min: 1, max: 20, label: 'Số lần đăng nhập sai trước khi khoá' },
};

export const settingService = {
  async get(db) {
    const rows = await settingRepository.list(db);
    const stored = Object.fromEntries(rows.map((r) => [r.setting_key, Number(r.setting_value)]));
    return Object.fromEntries(
      Object.entries(SETTING_DEFINITIONS).map(([key, def]) => [key, Number.isFinite(stored[key]) ? stored[key] : def.value]),
    );
  },

  async list() {
    const values = await this.get();
    return Object.entries(SETTING_DEFINITIONS).map(([key, def]) => ({
      key,
      label: def.label,
      value: values[key],
      min: def.min,
      max: def.max,
    }));
  },

  async update(input, actor) {
    const entries = Object.entries(input || {}).map(([key, raw]) => {
      const def = SETTING_DEFINITIONS[key];
      if (!def) throw badRequest(`Tham số ${key} không tồn tại`);
      const value = Number(raw);
      if (!Number.isInteger(value) || value < def.min || value > def.max) {
        throw badRequest(`${def.label} phải là số nguyên từ ${def.min} đến ${def.max}`);
      }
      return { key, value, description: def.label };
    });
    if (!entries.length) throw badRequest('Không có tham số nào để cập nhật');
    await settingRepository.upsertMany(entries);
    await auditService.record(null, actor, 'UPDATE_SETTINGS', 'system_setting', null, Object.fromEntries(entries.map((e) => [e.key, e.value])));
    return this.list();
  },

  async seedDefaults(db) {
    const rows = await settingRepository.list(db);
    const existing = new Set(rows.map((r) => r.setting_key));
    const missing = Object.entries(SETTING_DEFINITIONS)
      .filter(([key]) => !existing.has(key))
      .map(([key, def]) => ({ key, value: def.value, description: def.label }));
    if (missing.length) await settingRepository.upsertMany(missing, db);
  },
};
