// Dung Pham Anh: DAL bảng system_setting: tham số nghiệp vụ (hạn mượn, mức phạt…) đổi được không cần biên dịch lại
import { pool } from '../db/pool.js';

export const settingRepository = {
  async list(db = pool) {
    const { rows } = await db.query(`select * from system_setting order by setting_key`);
    return rows;
  },

  async upsertMany(entries, db = pool) {
    for (const { key, value, description } of entries) {
      await db.query(
        `insert into system_setting (setting_key, setting_value, description) values ($1, $2, $3)
         on conflict (setting_key) do update
           set setting_value = excluded.setting_value,
               description = coalesce(excluded.description, system_setting.description),
               updated_at = now()`,
        [key, String(value), description ?? null],
      );
    }
  },
};
