// Dung Pham Anh: DAL bảng publisher: nhà xuất bản
import { pool } from '../db/pool.js';

export const publisherRepository = {
  async list(db = pool) {
    const { rows } = await db.query(
      `select p.*, (select count(*)::int from book_title b where b.publisher_id = p.publisher_id and not b.is_deleted) as title_count
       from publisher p order by p.publisher_name`,
    );
    return rows;
  },

  async findById(id, db = pool) {
    const { rows } = await db.query(`select * from publisher where publisher_id = $1`, [id]);
    return rows[0] || null;
  },

  async findByName(name, db = pool) {
    const { rows } = await db.query(`select * from publisher where lower(publisher_name) = lower($1)`, [name]);
    return rows[0] || null;
  },

  async create({ publisherName, address, contactEmail, phone }, db = pool) {
    const { rows } = await db.query(
      `insert into publisher (publisher_name, address, contact_email, phone) values ($1, $2, $3, $4) returning *`,
      [publisherName, address, contactEmail, phone],
    );
    return rows[0];
  },

  async update(id, { publisherName, address, contactEmail, phone }, db = pool) {
    const { rows } = await db.query(
      `update publisher set publisher_name = $2, address = $3, contact_email = $4, phone = $5
       where publisher_id = $1 returning *`,
      [id, publisherName, address, contactEmail, phone],
    );
    return rows[0] || null;
  },

  async isInUse(id, db = pool) {
    const { rows } = await db.query(`select exists(select 1 from book_title where publisher_id = $1) as used`, [id]);
    return rows[0].used;
  },

  async remove(id, db = pool) {
    await db.query(`delete from publisher where publisher_id = $1`, [id]);
  },
};
