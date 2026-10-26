// Dung Pham Anh: DAL truy vấn tổng hợp cho thống kê – báo cáo (UC-11)
import { pool } from '../db/pool.js';

export const reportRepository = {
  async summary(today, db = pool) {
    const { rows } = await db.query(
      `select
         (select count(*)::int from book_title where not is_deleted) as title_count,
         (select count(*)::int from book_copy where loan_status <> 'Lost') as copy_count,
         (select count(*)::int from book_copy where loan_status = 'Available') as available_count,
         (select count(*)::int from book_copy where loan_status = 'Borrowed') as borrowed_count,
         (select count(*)::int from book_copy where loan_status = 'Maintenance') as maintenance_count,
         (select count(*)::int from reader) as reader_count,
         (select count(*)::int from loan_record where status = 'Borrowing') as active_loan_count,
         (select count(*)::int from loan_detail d join loan_record l on l.loan_id = d.loan_id
            where d.returned_at is null and l.due_date < $1) as overdue_copy_count,
         (select count(*)::int from loan_record where created_date = $1) as loans_today,
         (select count(*)::int from loan_detail
            where returned_at >= ($1::date::timestamp at time zone 'Asia/Ho_Chi_Minh')
              and returned_at < (($1::date + 1)::timestamp at time zone 'Asia/Ho_Chi_Minh')) as returns_today,
         (select count(*)::int from reservation where status = 'Pending') as pending_reservation_count,
         (select count(*)::int from reservation where status = 'Ready') as ready_reservation_count,
         (select coalesce(sum(amount), 0) from fine_receipt where not is_paid) as unpaid_fine_total`,
      [today],
    );
    return rows[0];
  },

  async loanTrend({ from, to }, db = pool) {
    const { rows } = await db.query(
      `with borrowed as (
         select l.created_date as day, count(*)::int as n
         from loan_detail d join loan_record l on l.loan_id = d.loan_id
         where l.created_date between $1 and $2 group by 1),
       returned as (
         select (returned_at at time zone 'Asia/Ho_Chi_Minh')::date as day, count(*)::int as n
         from loan_detail
         where returned_at >= $1::date - 1 and returned_at < $2::date + 2 group by 1)
       select to_char(s.day, 'YYYY-MM-DD') as day, coalesce(b.n, 0) as borrowed, coalesce(r.n, 0) as returned
       from generate_series($1::date, $2::date, interval '1 day') as s(day)
       left join borrowed b on b.day = s.day::date
       left join returned r on r.day = s.day::date
       order by s.day`,
      [from, to],
    );
    return rows;
  },

  async loansByCategory({ from, to }, db = pool) {
    const { rows } = await db.query(
      `select coalesce(parent.category_name, c.category_name) as category, count(*)::int as loans
       from loan_detail d
       join loan_record l on l.loan_id = d.loan_id
       join book_copy bc on bc.barcode = d.barcode
       join book_title b on b.isbn = bc.isbn
       join category c on c.category_id = b.category_id
       left join category parent on parent.category_id = c.parent_id
       where l.created_date between $1 and $2
       group by 1 order by loans desc`,
      [from, to],
    );
    return rows;
  },

  async topTitles({ from, to, limit = 10 }, db = pool) {
    const { rows } = await db.query(
      `select b.isbn, b.title, b.author, c.category_name, count(*)::int as loans
       from loan_detail d
       join loan_record l on l.loan_id = d.loan_id
       join book_copy bc on bc.barcode = d.barcode
       join book_title b on b.isbn = bc.isbn
       join category c on c.category_id = b.category_id
       where l.created_date between $1 and $2
       group by b.isbn, b.title, b.author, c.category_name
       order by loans desc, b.title limit $3`,
      [from, to, limit],
    );
    return rows;
  },

  async overdueList(today, db = pool) {
    const { rows } = await db.query(
      `select l.loan_id, l.reader_id, r.full_name as reader_name, r.phone, r.email,
              d.barcode, b.title, l.created_date, l.due_date, ($1::date - l.due_date) as overdue_days
       from loan_detail d
       join loan_record l on l.loan_id = d.loan_id
       join reader r on r.reader_id = l.reader_id
       join book_copy bc on bc.barcode = d.barcode
       join book_title b on b.isbn = bc.isbn
       where d.returned_at is null and l.due_date < $1
       order by l.due_date, l.loan_id`,
      [today],
    );
    return rows;
  },

  async inventory(db = pool) {
    const { rows } = await db.query(
      `select coalesce(parent.category_name, c.category_name) as category,
              count(distinct b.isbn)::int as titles,
              count(bc.barcode)::int as copies,
              count(bc.barcode) filter (where bc.loan_status = 'Available')::int as available,
              count(bc.barcode) filter (where bc.loan_status = 'Borrowed')::int as borrowed,
              count(bc.barcode) filter (where bc.loan_status = 'OnHold')::int as on_hold,
              count(bc.barcode) filter (where bc.loan_status = 'Maintenance')::int as maintenance,
              count(bc.barcode) filter (where bc.loan_status = 'Storage')::int as storage,
              count(bc.barcode) filter (where bc.loan_status = 'Lost')::int as lost
       from book_title b
       join category c on c.category_id = b.category_id
       left join category parent on parent.category_id = c.parent_id
       left join book_copy bc on bc.isbn = b.isbn
       where not b.is_deleted
       group by 1 order by copies desc`,
    );
    return rows;
  },

  async fines({ from, to }, db = pool) {
    const { rows } = await db.query(
      `select fine_type, count(*)::int as receipts, coalesce(sum(amount), 0) as amount,
              coalesce(sum(amount) filter (where is_paid), 0) as paid_amount
       from fine_receipt
       where (created_at at time zone 'Asia/Ho_Chi_Minh')::date between $1 and $2
       group by fine_type order by fine_type`,
      [from, to],
    );
    return rows;
  },
};
