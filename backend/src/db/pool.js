// Dung Pham Anh: Kết nối PostgreSQL (pool) và hàm bao transaction để lớp nghiệp vụ quản lý ranh giới giao dịch
import pg from 'pg';
import { env } from '../config/env.js';

pg.types.setTypeParser(1082, (value) => value);
pg.types.setTypeParser(1700, (value) => Number(value));
pg.types.setTypeParser(20, (value) => Number(value));

export const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  ssl: env.databaseSsl ? { rejectUnauthorized: false } : undefined,
  max: 10,
});

export const query = (text, params) => pool.query(text, params);

export async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query('begin');
    const result = await work(client);
    await client.query('commit');
    return result;
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}
