// Dung Pham Anh: DAL bảng reader: hồ sơ độc giả và thẻ thư viện, kèm số sách đang mượn và nợ phạt
import { pool } from '../db/pool.js';

const SELECT = `
  select r.*, a.username, a.status as account_status,
         (select count(*)::int from loan_detail d join loan_record l on l.loan_id = d.loan_id
           where l.reader_id = r.reader_id and d.returned_at is null) as borrowing_count,
         (select coalesce(sum(f.amount), 0) from fine_receipt f join loan_record l on l.loan_id = f.loan_id
           where l.reader_id = r.reader_id and not f.is_paid) as unpaid_fine_total
  from reader r
  join account a on a.account_id = r.account_id`;

export const readerRepository = {
  async list({ q, type, status, today, offset, limit }, db = pool) {
    const params = [];
    const where = [];
    if (q) {
      params.push(`%${q}%`);
      const p = `$${params.length}`;
      where.push(`(f_unaccent(r.full_name) like f_unaccent(${p}) or r.reader_id ilike ${p}
        or r.student_code ilike ${p} or r.email ilike ${p} or r.phone ilike ${p})`);
    }
    if (type) {
      params.push(type);
      where.push(`r.reader_type = $${params.length}`);
    }
    if (status === 'locked') where.push('not a.status');
    if (status === 'active' || status === 'expired') {
      params.push(today);
      where.push(status === 'active' ? `a.status and r.card_expiry_date >= $${params.length}` : `r.card_expiry_date < $${params.length}`);
    }
    const clause = where.length ? `where ${where.join(' and ')}` : '';
    const total = await db.query(
      `select count(*)::int as n from reader r join account a on a.account_id = r.account_id ${clause}`,
      params,
    );
    params.push(limit, offset);
    const { rows } = await db.query(
      `${SELECT} ${clause} order by r.reader_id desc limit $${params.length - 1} offset $${params.length}`,
      params,
    );
    return { rows, total: total.rows[0].n };
  },

  async findById(readerId, db = pool) {
    const { rows } = await db.query(`${SELECT} where r.reader_id = $1`, [readerId]);
    return rows[0] || null;
  },

  async findByCode(code, db = pool) {
    const { rows } = await db.query(
      `${SELECT} where upper(r.reader_id) = upper($1) or upper(r.student_code) = upper($1) or r.identity_number = $1
       limit 1`,
      [code],
    );
    return rows[0] || null;
  },

  async findByAccountId(accountId, db = pool) {
    const { rows } = await db.query(`${SELECT} where r.account_id = $1`, [accountId]);
    return rows[0] || null;
  },

  async lockForUpdate(readerId, db) {
    await db.query(`select 1 from reader where reader_id = $1 for update`, [readerId]);
  },

  async findDuplicate({ studentCode, identityNumber, email, excludeId }, db = pool) {
    const { rows } = await db.query(
      `select reader_id, student_code, identity_number, email from reader
       where reader_id <> coalesce($4, '')
         and ((($1)::text is not null and upper(student_code) = upper($1))
           or (($2)::text is not null and identity_number = $2)
           or lower(email) = lower($3))
       limit 1`,
      [studentCode, identityNumber, email, excludeId || null],
    );
    return rows[0] || null;
  },

  async create(data, db = pool) {
    const { rows } = await db.query(
      `insert into reader (account_id, full_name, email, phone, student_code, identity_number, reader_type,
         max_borrow_limit, card_issued_date, card_expiry_date)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning reader_id`,
      [
        data.accountId,
        data.fullName,
        data.email,
        data.phone,
        data.studentCode,
        data.identityNumber,
        data.readerType,
        data.maxBorrowLimit,
        data.cardIssuedDate,
        data.cardExpiryDate,
      ],
    );
    return rows[0].reader_id;
  },

  async update(readerId, data, db = pool) {
    await db.query(
      `update reader set full_name = $2, email = $3, phone = $4, student_code = $5, identity_number = $6,
         reader_type = $7, max_borrow_limit = $8
       where reader_id = $1`,
      [
        readerId,
        data.fullName,
        data.email,
        data.phone,
        data.studentCode,
        data.identityNumber,
        data.readerType,
        data.maxBorrowLimit,
      ],
    );
  },

  async updateContact(readerId, { phone }, db = pool) {
    await db.query(`update reader set phone = $2 where reader_id = $1`, [readerId, phone]);
  },

  async setCardExpiry(readerId, expiry, db = pool) {
    await db.query(`update reader set card_expiry_date = $2 where reader_id = $1`, [readerId, expiry]);
  },
};
