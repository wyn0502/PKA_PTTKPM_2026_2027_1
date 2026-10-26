// Dung Pham Anh: Tạo bảng từ schema.sql; cờ --reset xoá toàn bộ dữ liệu cũ trước (chỉ dùng ở môi trường phát triển)
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const dir = path.dirname(fileURLToPath(import.meta.url));

const RESET_SQL = `
drop table if exists audit_log, system_setting, fine_receipt, reservation, loan_detail, loan_record,
  book_copy, book_title, publisher, category, librarian, reader, account cascade;
drop sequence if exists seq_account, seq_reader, seq_librarian, seq_category, seq_publisher,
  seq_copy, seq_loan, seq_reservation, seq_fine;
`;

async function main() {
  if (process.argv.includes('--reset')) {
    await pool.query(RESET_SQL);
    console.log('Đã xoá lược đồ cũ');
  }
  const sql = await fs.readFile(path.join(dir, 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('Đã tạo/cập nhật lược đồ CSDL');
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
