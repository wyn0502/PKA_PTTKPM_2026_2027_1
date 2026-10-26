// Dung Pham Anh: DAL bảng book_copy: bản sao vật lý theo mã cá biệt, vị trí kệ và trạng thái lưu thông
import { pool } from '../db/pool.js';

const SELECT = `
  select bc.*, b.title, b.author, b.is_deleted as title_deleted
  from book_copy bc join book_title b on b.isbn = bc.isbn`;

export const bookCopyRepository = {
  async findByBarcode(barcode, db = pool) {
    const { rows } = await db.query(`${SELECT} where upper(bc.barcode) = upper($1)`, [barcode]);
    return rows[0] || null;
  },

  async findForUpdate(barcode, db) {
    const { rows } = await db.query(
      `${SELECT} where upper(bc.barcode) = upper($1) for update of bc`,
      [barcode],
    );
    return rows[0] || null;
  },

  async listByIsbn(isbn, db = pool) {
    const { rows } = await db.query(
      `select bc.*, cur.reader_id, cur.full_name as reader_name, cur.due_date
       from book_copy bc
       left join lateral (
         select l.reader_id, r.full_name, l.due_date from loan_detail d
         join loan_record l on l.loan_id = d.loan_id
         join reader r on r.reader_id = l.reader_id
         where d.barcode = bc.barcode and d.returned_at is null limit 1) cur on true
       where bc.isbn = $1 order by bc.barcode`,
      [isbn],
    );
    return rows;
  },

  async createMany({ isbn, quantity, shelfLocation, physicalCondition }, db = pool) {
    const { rows } = await db.query(
      `insert into book_copy (isbn, shelf_location, physical_condition)
       select $1, $2, $3 from generate_series(1, $4) returning barcode`,
      [isbn, shelfLocation, physicalCondition, quantity],
    );
    return rows.map((r) => r.barcode);
  },

  async setStatus(barcode, loanStatus, db = pool) {
    await db.query(`update book_copy set loan_status = $2 where barcode = $1`, [barcode, loanStatus]);
  },

  async setStatusMany(barcodes, loanStatus, db) {
    await db.query(`update book_copy set loan_status = $2 where barcode = any($1::varchar[])`, [barcodes, loanStatus]);
  },

  async setCondition(barcode, physicalCondition, db = pool) {
    await db.query(`update book_copy set physical_condition = $2 where barcode = $1`, [barcode, physicalCondition]);
  },

  async update(barcode, { shelfLocation, physicalCondition }, db = pool) {
    await db.query(`update book_copy set shelf_location = $2, physical_condition = $3 where barcode = $1`, [
      barcode,
      shelfLocation,
      physicalCondition,
    ]);
  },

  async countAvailable(isbn, db = pool) {
    const { rows } = await db.query(
      `select count(*)::int as n from book_copy where isbn = $1 and loan_status = 'Available'`,
      [isbn],
    );
    return rows[0].n;
  },

  async countInCirculation(isbn, db = pool) {
    const { rows } = await db.query(
      `select count(*)::int as n from book_copy where isbn = $1 and loan_status in ('Borrowed', 'OnHold')`,
      [isbn],
    );
    return rows[0].n;
  },

  async firstAvailableForUpdate(isbn, db) {
    const { rows } = await db.query(
      `select barcode from book_copy where isbn = $1 and loan_status = 'Available'
       order by barcode limit 1 for update skip locked`,
      [isbn],
    );
    return rows[0]?.barcode || null;
  },
};
