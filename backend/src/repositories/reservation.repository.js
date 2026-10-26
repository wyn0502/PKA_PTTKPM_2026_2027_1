// Dung Pham Anh: DAL bảng reservation: hàng đợi đặt trước theo đầu sách
import { pool } from '../db/pool.js';

const SELECT = `
  select rs.*, b.title, b.author, r.full_name as reader_name,
         case when rs.status = 'Pending' then (
           select count(*)::int + 1 from reservation q
           where q.isbn = rs.isbn and q.status = 'Pending' and q.reserve_date < rs.reserve_date)
         end as queue_position
  from reservation rs
  join book_title b on b.isbn = rs.isbn
  join reader r on r.reader_id = rs.reader_id`;

export const reservationRepository = {
  async create({ readerId, isbn, expireDate }, db = pool) {
    const { rows } = await db.query(
      `insert into reservation (reader_id, isbn, expire_date) values ($1, $2, $3) returning reserve_id`,
      [readerId, isbn, expireDate],
    );
    return rows[0].reserve_id;
  },

  async findById(reserveId, db = pool) {
    const { rows } = await db.query(`${SELECT} where rs.reserve_id = $1`, [reserveId]);
    return rows[0] || null;
  },

  async findForUpdate(reserveId, db) {
    const { rows } = await db.query(`select * from reservation where reserve_id = $1 for update`, [reserveId]);
    return rows[0] || null;
  },

  async list({ readerId, status, isbn, offset, limit }, db = pool) {
    const params = [];
    const where = [];
    if (readerId) {
      params.push(readerId);
      where.push(`rs.reader_id = $${params.length}`);
    }
    if (status) {
      params.push(status.split(','));
      where.push(`rs.status = any($${params.length}::varchar[])`);
    }
    if (isbn) {
      params.push(isbn);
      where.push(`rs.isbn = $${params.length}`);
    }
    const clause = where.length ? `where ${where.join(' and ')}` : '';
    const total = await db.query(`select count(*)::int as n from reservation rs ${clause}`, params);
    params.push(limit, offset);
    const { rows } = await db.query(
      `${SELECT} ${clause} order by rs.reserve_date desc limit $${params.length - 1} offset $${params.length}`,
      params,
    );
    return { rows, total: total.rows[0].n };
  },

  async findActive(readerId, isbn, db = pool) {
    const { rows } = await db.query(
      `select * from reservation where reader_id = $1 and isbn = $2 and status in ('Pending', 'Ready')`,
      [readerId, isbn],
    );
    return rows[0] || null;
  },

  async countActiveByReader(readerId, db = pool) {
    const { rows } = await db.query(
      `select count(*)::int as n from reservation where reader_id = $1 and status in ('Pending', 'Ready')`,
      [readerId],
    );
    return rows[0].n;
  },

  async hasPending(isbns, db = pool) {
    const { rows } = await db.query(
      `select exists(select 1 from reservation where isbn = any($1::varchar[]) and status = 'Pending') as found`,
      [isbns],
    );
    return rows[0].found;
  },

  async pendingIsbnSet(isbns, db = pool) {
    if (!isbns.length) return new Set();
    const { rows } = await db.query(
      `select distinct isbn from reservation where isbn = any($1::varchar[]) and status = 'Pending'`,
      [isbns],
    );
    return new Set(rows.map((r) => r.isbn));
  },

  async fulfill(reserveId, db) {
    await db.query(`update reservation set status = 'Fulfilled' where reserve_id = $1`, [reserveId]);
  },

  async firstPendingForUpdate(isbn, db) {
    const { rows } = await db.query(
      `select * from reservation where isbn = $1 and status = 'Pending'
       order by reserve_date limit 1 for update skip locked`,
      [isbn],
    );
    return rows[0] || null;
  },

  async findReadyByBarcode(barcode, db = pool) {
    const { rows } = await db.query(`select * from reservation where barcode = $1 and status = 'Ready'`, [barcode]);
    return rows[0] || null;
  },

  async markReady(reserveId, { barcode, expireDate }, db) {
    await db.query(
      `update reservation set status = 'Ready', barcode = $2, expire_date = $3 where reserve_id = $1`,
      [reserveId, barcode, expireDate],
    );
  },

  async setStatus(reserveId, status, db = pool) {
    await db.query(`update reservation set status = $2 where reserve_id = $1`, [reserveId, status]);
  },

  async cancelPendingByIsbn(isbn, db = pool) {
    await db.query(`update reservation set status = 'Cancelled' where isbn = $1 and status = 'Pending'`, [isbn]);
  },

  async findExpiredForUpdate(today, db) {
    const { rows } = await db.query(
      `select * from reservation where status in ('Pending', 'Ready') and expire_date < $1
       order by reserve_date for update skip locked`,
      [today],
    );
    return rows;
  },
};
