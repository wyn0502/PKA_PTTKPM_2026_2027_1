// Dung Pham Anh: DAL bảng loan_record và loan_detail: phiếu mượn và chi tiết từng bản sao được mượn
import { pool } from '../db/pool.js';

const LIST_SELECT = `
  select l.*, r.full_name as reader_name, r.student_code, lb.full_name as staff_name,
         count(d.barcode)::int as item_count,
         count(d.barcode) filter (where d.returned_at is null)::int as unreturned_count
  from loan_record l
  join reader r on r.reader_id = l.reader_id
  join librarian lb on lb.staff_id = l.staff_id
  join loan_detail d on d.loan_id = l.loan_id`;

export const loanRepository = {
  async createRecord({ readerId, staffId, createdDate, dueDate }, db) {
    const { rows } = await db.query(
      `insert into loan_record (reader_id, staff_id, created_date, due_date) values ($1, $2, $3, $4) returning *`,
      [readerId, staffId, createdDate, dueDate],
    );
    return rows[0];
  },

  async addDetails(loanId, barcodes, db) {
    await db.query(
      `insert into loan_detail (loan_id, barcode) select $1, unnest($2::varchar[])`,
      [loanId, barcodes],
    );
  },

  async list({ q, status, overdue, readerId, today, offset, limit }, db = pool) {
    const params = [];
    const where = [];
    if (q) {
      params.push(`%${q}%`);
      const p = `$${params.length}`;
      where.push(`(l.loan_id ilike ${p} or l.reader_id ilike ${p} or f_unaccent(r.full_name) like f_unaccent(${p})
        or exists (select 1 from loan_detail x where x.loan_id = l.loan_id and x.barcode ilike ${p}))`);
    }
    if (status) {
      params.push(status);
      where.push(`l.status = $${params.length}`);
    }
    if (overdue) {
      params.push(today);
      where.push(`l.status = 'Borrowing' and l.due_date < $${params.length}`);
    }
    if (readerId) {
      params.push(readerId);
      where.push(`l.reader_id = $${params.length}`);
    }
    const clause = where.length ? `where ${where.join(' and ')}` : '';
    const total = await db.query(
      `select count(*)::int as n from loan_record l join reader r on r.reader_id = l.reader_id ${clause}`,
      params,
    );
    params.push(limit, offset);
    const { rows } = await db.query(
      `${LIST_SELECT} ${clause} group by l.loan_id, r.full_name, r.student_code, lb.full_name
       order by l.created_date desc, l.loan_id desc limit $${params.length - 1} offset $${params.length}`,
      params,
    );
    return { rows, total: total.rows[0].n };
  },

  async findById(loanId, db = pool) {
    const { rows } = await db.query(
      `${LIST_SELECT} where l.loan_id = $1 group by l.loan_id, r.full_name, r.student_code, lb.full_name`,
      [loanId],
    );
    return rows[0] || null;
  },

  async findForUpdate(loanId, db) {
    const { rows } = await db.query(`select * from loan_record where loan_id = $1 for update`, [loanId]);
    return rows[0] || null;
  },

  async listDetails(loanIds, db = pool) {
    const { rows } = await db.query(
      `select d.*, bc.isbn, b.title, b.author, bc.shelf_location
       from loan_detail d
       join book_copy bc on bc.barcode = d.barcode
       join book_title b on b.isbn = bc.isbn
       where d.loan_id = any($1::varchar[]) order by d.loan_id, d.barcode`,
      [loanIds],
    );
    return rows;
  },

  async findActiveDetailForUpdate(barcode, db) {
    const { rows } = await db.query(
      `select d.loan_id, d.barcode, l.reader_id, l.due_date, l.created_date, r.full_name as reader_name,
              bc.isbn, b.title
       from loan_detail d
       join loan_record l on l.loan_id = d.loan_id
       join reader r on r.reader_id = l.reader_id
       join book_copy bc on bc.barcode = d.barcode
       join book_title b on b.isbn = bc.isbn
       where upper(d.barcode) = upper($1) and d.returned_at is null
       for update of d, l`,
      [barcode],
    );
    return rows[0] || null;
  },

  async markDetailReturned({ loanId, barcode, condition }, db) {
    await db.query(
      `update loan_detail set returned_at = now(), return_condition = $3 where loan_id = $1 and barcode = $2`,
      [loanId, barcode, condition],
    );
  },

  async countUnreturned(loanId, db = pool) {
    const { rows } = await db.query(
      `select count(*)::int as n from loan_detail where loan_id = $1 and returned_at is null`,
      [loanId],
    );
    return rows[0].n;
  },

  async close(loanId, returnDate, db) {
    await db.query(
      `update loan_record set status = 'Returned', actual_return_date = $2 where loan_id = $1`,
      [loanId, returnDate],
    );
  },

  async renew(loanId, dueDate, db) {
    await db.query(
      `update loan_record set due_date = $2, renew_count = renew_count + 1 where loan_id = $1`,
      [loanId, dueDate],
    );
  },

  async unreturnedIsbns(loanId, db = pool) {
    const { rows } = await db.query(
      `select distinct bc.isbn from loan_detail d join book_copy bc on bc.barcode = d.barcode
       where d.loan_id = $1 and d.returned_at is null`,
      [loanId],
    );
    return rows.map((r) => r.isbn);
  },

  async countBorrowingByReader(readerId, db = pool) {
    const { rows } = await db.query(
      `select count(*)::int as n from loan_detail d join loan_record l on l.loan_id = d.loan_id
       where l.reader_id = $1 and d.returned_at is null`,
      [readerId],
    );
    return rows[0].n;
  },

  async countOverdueByReader(readerId, today, db = pool) {
    const { rows } = await db.query(
      `select count(*)::int as n from loan_record where reader_id = $1 and status = 'Borrowing' and due_date < $2`,
      [readerId, today],
    );
    return rows[0].n;
  },
};
