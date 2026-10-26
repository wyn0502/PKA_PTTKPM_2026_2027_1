// Dung Pham Anh: DAL bảng book_title: đầu sách (bản ghi thư mục) kèm số bản sao tổng/khả dụng
import { pool } from '../db/pool.js';

const SELECT = `
  select b.*, c.category_name, p.publisher_name,
         count(bc.barcode) filter (where bc.loan_status <> 'Lost')::int as total_copies,
         count(bc.barcode) filter (where bc.loan_status = 'Available')::int as available_copies,
         (select count(*)::int from reservation r where r.isbn = b.isbn and r.status = 'Pending') as pending_reservations
  from book_title b
  join category c on c.category_id = b.category_id
  join publisher p on p.publisher_id = b.publisher_id
  left join book_copy bc on bc.isbn = b.isbn`;

export const bookTitleRepository = {
  async search({ q, categoryId, publisherId, availableOnly, offset, limit, sort }, db = pool) {
    const params = [];
    const where = ['not b.is_deleted'];
    if (q) {
      params.push(`%${q}%`);
      const p = `$${params.length}`;
      where.push(`(f_unaccent(b.title) like f_unaccent(${p}) or f_unaccent(b.author) like f_unaccent(${p})
        or b.isbn ilike ${p} or f_unaccent(c.category_name) like f_unaccent(${p}))`);
    }
    if (categoryId) {
      params.push(categoryId);
      where.push(`(b.category_id = $${params.length} or c.parent_id = $${params.length})`);
    }
    if (publisherId) {
      params.push(publisherId);
      where.push(`b.publisher_id = $${params.length}`);
    }
    const clause = `where ${where.join(' and ')}`;
    const having = availableOnly ? `having count(bc.barcode) filter (where bc.loan_status = 'Available') > 0` : '';
    const order = sort === 'title' ? 'b.title asc' : 'b.created_at desc, b.title asc';
    const total = await db.query(
      `select count(*)::int as n from (select b.isbn from book_title b
         join category c on c.category_id = b.category_id
         left join book_copy bc on bc.isbn = b.isbn ${clause} group by b.isbn ${having}) t`,
      params,
    );
    params.push(limit, offset);
    const { rows } = await db.query(
      `${SELECT} ${clause} group by b.isbn, c.category_name, p.publisher_name ${having}
       order by ${order} limit $${params.length - 1} offset $${params.length}`,
      params,
    );
    return { rows, total: total.rows[0].n };
  },

  async findByIsbn(isbn, db = pool, { includeDeleted = false } = {}) {
    const { rows } = await db.query(
      `${SELECT} where b.isbn = $1 ${includeDeleted ? '' : 'and not b.is_deleted'}
       group by b.isbn, c.category_name, p.publisher_name`,
      [isbn],
    );
    return rows[0] || null;
  },

  async exists(isbn, db = pool) {
    const { rows } = await db.query(`select is_deleted from book_title where isbn = $1`, [isbn]);
    return rows[0] || null;
  },

  async create(data, db = pool) {
    await db.query(
      `insert into book_title (isbn, category_id, publisher_id, title, author, publish_year, description)
       values ($1, $2, $3, $4, $5, $6, $7)`,
      [data.isbn, data.categoryId, data.publisherId, data.title, data.author, data.publishYear, data.description],
    );
  },

  async restore(data, db = pool) {
    await db.query(
      `update book_title set category_id = $2, publisher_id = $3, title = $4, author = $5, publish_year = $6,
         description = $7, is_deleted = false
       where isbn = $1`,
      [data.isbn, data.categoryId, data.publisherId, data.title, data.author, data.publishYear, data.description],
    );
  },

  async update(isbn, data, db = pool) {
    await db.query(
      `update book_title set category_id = $2, publisher_id = $3, title = $4, author = $5, publish_year = $6,
         description = $7
       where isbn = $1`,
      [isbn, data.categoryId, data.publisherId, data.title, data.author, data.publishYear, data.description],
    );
  },

  async softDelete(isbn, db = pool) {
    await db.query(`update book_title set is_deleted = true where isbn = $1`, [isbn]);
  },
};
