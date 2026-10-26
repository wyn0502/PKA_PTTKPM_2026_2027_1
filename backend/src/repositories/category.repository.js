// Dung Pham Anh: DAL bảng category: thể loại sách phân cấp cha – con
import { pool } from '../db/pool.js';

export const categoryRepository = {
  async list(db = pool) {
    const { rows } = await db.query(
      `select c.*, p.category_name as parent_name,
              (select count(*)::int from book_title b where b.category_id = c.category_id and not b.is_deleted) as title_count
       from category c left join category p on p.category_id = c.parent_id
       order by coalesce(p.category_name, c.category_name), c.parent_id nulls first, c.category_name`,
    );
    return rows;
  },

  async findById(id, db = pool) {
    const { rows } = await db.query(`select * from category where category_id = $1`, [id]);
    return rows[0] || null;
  },

  async findByName(name, db = pool) {
    const { rows } = await db.query(`select * from category where lower(category_name) = lower($1)`, [name]);
    return rows[0] || null;
  },

  async create({ categoryName, description, parentId }, db = pool) {
    const { rows } = await db.query(
      `insert into category (category_name, description, parent_id) values ($1, $2, $3) returning *`,
      [categoryName, description, parentId],
    );
    return rows[0];
  },

  async update(id, { categoryName, description, parentId }, db = pool) {
    const { rows } = await db.query(
      `update category set category_name = $2, description = $3, parent_id = $4 where category_id = $1 returning *`,
      [id, categoryName, description, parentId],
    );
    return rows[0] || null;
  },

  async isInUse(id, db = pool) {
    const { rows } = await db.query(
      `select exists(select 1 from book_title where category_id = $1)
           or exists(select 1 from category where parent_id = $1) as used`,
      [id],
    );
    return rows[0].used;
  },

  async isDescendant(id, candidateParentId, db = pool) {
    const { rows } = await db.query(
      `with recursive tree as (
         select category_id from category where category_id = $1
         union all select c.category_id from category c join tree t on c.parent_id = t.category_id)
       select exists(select 1 from tree where category_id = $2) as found`,
      [id, candidateParentId],
    );
    return rows[0].found;
  },

  async remove(id, db = pool) {
    await db.query(`delete from category where category_id = $1`, [id]);
  },
};
