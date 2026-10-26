// Dung Pham Anh: DAL bảng audit_log: nhật ký thao tác kèm tài khoản thực hiện (NFR-06)
import { pool } from '../db/pool.js';

export const auditRepository = {
  async insert({ accountId, action, entity, entityId, detail }, db = pool) {
    await db.query(
      `insert into audit_log (account_id, action, entity, entity_id, detail) values ($1, $2, $3, $4, $5)`,
      [accountId, action, entity, entityId, detail ? JSON.stringify(detail) : null],
    );
  },

  async list({ action, accountId, offset, limit }, db = pool) {
    const params = [];
    const where = [];
    if (action) {
      params.push(action);
      where.push(`g.action = $${params.length}`);
    }
    if (accountId) {
      params.push(accountId);
      where.push(`g.account_id = $${params.length}`);
    }
    const clause = where.length ? `where ${where.join(' and ')}` : '';
    const total = await db.query(`select count(*)::int as n from audit_log g ${clause}`, params);
    params.push(limit, offset);
    const { rows } = await db.query(
      `select g.*, a.username from audit_log g left join account a on a.account_id = g.account_id ${clause}
       order by g.created_at desc limit $${params.length - 1} offset $${params.length}`,
      params,
    );
    return { rows, total: total.rows[0].n };
  },
};
