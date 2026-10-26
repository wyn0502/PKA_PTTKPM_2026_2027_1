// Dung Pham Anh: DAL bảng fine_receipt: biên lai phạt (quá hạn, hư hỏng, mất sách)
import { pool } from '../db/pool.js';

const SELECT = `
  select f.*, l.reader_id, r.full_name as reader_name, b.title, lb.full_name as collector_name
  from fine_receipt f
  join loan_record l on l.loan_id = f.loan_id
  join reader r on r.reader_id = l.reader_id
  left join book_copy bc on bc.barcode = f.barcode
  left join book_title b on b.isbn = bc.isbn
  left join librarian lb on lb.staff_id = f.collected_by`;

export const fineRepository = {
  async create({ loanId, barcode, fineType, reason, amount, isPaid, collectedBy }, db) {
    const { rows } = await db.query(
      `insert into fine_receipt (loan_id, barcode, fine_type, reason, amount, is_paid, paid_at, collected_by)
       values ($1, $2, $3, $4, $5, $6, case when $6 then now() end, case when $6 then $7 end)
       returning fine_id`,
      [loanId, barcode, fineType, reason, amount, isPaid, collectedBy],
    );
    return rows[0].fine_id;
  },

  async findById(fineId, db = pool) {
    const { rows } = await db.query(`${SELECT} where f.fine_id = $1`, [fineId]);
    return rows[0] || null;
  },

  async listByLoan(loanId, db = pool) {
    const { rows } = await db.query(`${SELECT} where f.loan_id = $1 order by f.created_at`, [loanId]);
    return rows;
  },

  async findForUpdate(fineId, db) {
    const { rows } = await db.query(`select * from fine_receipt where fine_id = $1 for update`, [fineId]);
    return rows[0] || null;
  },

  async exists({ loanId, barcode, fineType }, db = pool) {
    const { rows } = await db.query(
      `select exists(select 1 from fine_receipt where loan_id = $1 and barcode is not distinct from $2 and fine_type = $3) as found`,
      [loanId, barcode, fineType],
    );
    return rows[0].found;
  },

  async list({ q, paid, readerId, offset, limit }, db = pool) {
    const params = [];
    const where = [];
    if (q) {
      params.push(`%${q}%`);
      const p = `$${params.length}`;
      where.push(`(f.fine_id ilike ${p} or f.loan_id ilike ${p} or l.reader_id ilike ${p}
        or f_unaccent(r.full_name) like f_unaccent(${p}))`);
    }
    if (paid !== null && paid !== undefined) {
      params.push(paid);
      where.push(`f.is_paid = $${params.length}`);
    }
    if (readerId) {
      params.push(readerId);
      where.push(`l.reader_id = $${params.length}`);
    }
    const clause = where.length ? `where ${where.join(' and ')}` : '';
    const total = await db.query(
      `select count(*)::int as n, coalesce(sum(f.amount), 0) as amount from fine_receipt f
       join loan_record l on l.loan_id = f.loan_id join reader r on r.reader_id = l.reader_id ${clause}`,
      params,
    );
    params.push(limit, offset);
    const { rows } = await db.query(
      `${SELECT} ${clause} order by f.created_at desc limit $${params.length - 1} offset $${params.length}`,
      params,
    );
    return { rows, total: total.rows[0].n, totalAmount: total.rows[0].amount };
  },

  async markPaid(fineId, staffId, db) {
    await db.query(
      `update fine_receipt set is_paid = true, paid_at = now(), collected_by = $2 where fine_id = $1`,
      [fineId, staffId],
    );
  },

  async unpaidTotalByReader(readerId, db = pool) {
    const { rows } = await db.query(
      `select coalesce(sum(f.amount), 0) as total from fine_receipt f join loan_record l on l.loan_id = f.loan_id
       where l.reader_id = $1 and not f.is_paid`,
      [readerId],
    );
    return rows[0].total;
  },
};
