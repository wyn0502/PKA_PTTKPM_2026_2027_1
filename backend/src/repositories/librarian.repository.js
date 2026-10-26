// Dung Pham Anh: DAL bảng librarian: hồ sơ thủ thư/quản trị viên gắn với tài khoản
import { pool } from '../db/pool.js';

export const librarianRepository = {
  async findByAccountId(accountId, db = pool) {
    const { rows } = await db.query(`select * from librarian where account_id = $1`, [accountId]);
    return rows[0] || null;
  },

  async emailExists(email, excludeAccountId, db = pool) {
    const { rows } = await db.query(
      `select 1 from librarian where lower(email) = lower($1) and account_id <> coalesce($2, '')
       union all select 1 from reader where lower(email) = lower($1) and account_id <> coalesce($2, '')`,
      [email, excludeAccountId || null],
    );
    return rows.length > 0;
  },

  async create({ accountId, fullName, email, department }, db = pool) {
    const { rows } = await db.query(
      `insert into librarian (account_id, full_name, email, department) values ($1, $2, $3, $4) returning *`,
      [accountId, fullName, email, department],
    );
    return rows[0];
  },

  async update(accountId, { fullName, email, department }, db = pool) {
    await db.query(
      `update librarian set full_name = $2, email = $3, department = $4 where account_id = $1`,
      [accountId, fullName, email, department],
    );
  },
};
