// Dung Pham Anh: DAL bảng account: tài khoản đăng nhập, vai trò, trạng thái khoá
import { pool } from '../db/pool.js';

const SELECT = `
  select a.account_id, a.username, a.password_hash, a.role, a.status, a.failed_login_count, a.created_at,
         coalesce(l.full_name, r.full_name) as full_name,
         coalesce(l.email, r.email) as email,
         l.staff_id, l.department, r.reader_id
  from account a
  left join librarian l on l.account_id = a.account_id
  left join reader r on r.account_id = a.account_id`;

export const accountRepository = {
  async findByUsername(username, db = pool) {
    const { rows } = await db.query(`${SELECT} where lower(a.username) = lower($1)`, [username]);
    return rows[0] || null;
  },

  async findById(accountId, db = pool) {
    const { rows } = await db.query(`${SELECT} where a.account_id = $1`, [accountId]);
    return rows[0] || null;
  },

  async list({ q, role, offset, limit }, db = pool) {
    const params = [];
    const where = [];
    if (q) {
      params.push(`%${q}%`);
      where.push(`(a.username ilike $${params.length} or f_unaccent(coalesce(l.full_name, r.full_name, '')) like f_unaccent($${params.length}))`);
    }
    if (role) {
      params.push(role);
      where.push(`a.role = $${params.length}`);
    }
    const clause = where.length ? `where ${where.join(' and ')}` : '';
    const total = await db.query(
      `select count(*)::int as n from account a
       left join librarian l on l.account_id = a.account_id
       left join reader r on r.account_id = a.account_id ${clause}`,
      params,
    );
    params.push(limit, offset);
    const { rows } = await db.query(
      `${SELECT} ${clause} order by a.created_at desc limit $${params.length - 1} offset $${params.length}`,
      params,
    );
    return { rows, total: total.rows[0].n };
  },

  async create({ username, passwordHash, role }, db = pool) {
    const { rows } = await db.query(
      `insert into account (username, password_hash, role) values ($1, $2, $3) returning account_id`,
      [username, passwordHash, role],
    );
    return rows[0].account_id;
  },

  async resetFailedLogins(accountId, db = pool) {
    await db.query(`update account set failed_login_count = 0 where account_id = $1 and failed_login_count <> 0`, [
      accountId,
    ]);
  },

  async incrementFailedLogins(accountId, maxAttempts, db = pool) {
    const { rows } = await db.query(
      `update account set failed_login_count = failed_login_count + 1,
         status = status and failed_login_count + 1 < $2
       where account_id = $1 returning failed_login_count, status`,
      [accountId, maxAttempts],
    );
    return rows[0];
  },

  async setStatus(accountId, status, db = pool) {
    await db.query(`update account set status = $2, failed_login_count = 0 where account_id = $1`, [accountId, status]);
  },

  async setRole(accountId, role, db = pool) {
    await db.query(`update account set role = $2 where account_id = $1`, [accountId, role]);
  },

  async setPassword(accountId, passwordHash, db = pool) {
    await db.query(`update account set password_hash = $2, failed_login_count = 0 where account_id = $1`, [
      accountId,
      passwordHash,
    ]);
  },

  async countActiveAdmins(db = pool) {
    const { rows } = await db.query(`select count(*)::int as n from account where role = 'admin' and status`);
    return rows[0].n;
  },
};
