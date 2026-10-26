// Dung Pham Anh: Nạp tham số mặc định và dữ liệu mẫu (tài khoản demo với mật khẩu ngẫu nhiên, sách, độc giả, phiếu mượn) cho môi trường phát triển
import { pool, withTransaction } from './pool.js';
import { settingService } from '../services/setting.service.js';
import { hashPassword, generatePassword } from '../utils/password.js';
import { today, addDays } from '../utils/date.js';

const CATEGORIES = [
  { key: 'vh', name: 'Văn học' },
  { key: 'vhvn', name: 'Văn học Việt Nam', parent: 'vh' },
  { key: 'vhnn', name: 'Văn học nước ngoài', parent: 'vh' },
  { key: 'kh', name: 'Khoa học' },
  { key: 'cntt', name: 'Công nghệ thông tin', parent: 'kh' },
  { key: 'kn', name: 'Kỹ năng sống' },
];

const PUBLISHERS = ['NXB Kim Đồng', 'NXB Trẻ', 'NXB Hội Nhà văn', 'NXB Giáo dục Việt Nam', 'NXB Tổng hợp TP.HCM', 'Prentice Hall', 'MIT Press'];

const TITLES = [
  ['Dế Mèn phiêu lưu ký', 'Tô Hoài', 'vhvn', 0, 2019, 3, 'A1-01'],
  ['Tôi thấy hoa vàng trên cỏ xanh', 'Nguyễn Nhật Ánh', 'vhvn', 1, 2018, 2, 'A1-02'],
  ['Mắt biếc', 'Nguyễn Nhật Ánh', 'vhvn', 1, 2019, 1, 'A1-02'],
  ['Hoàng tử bé', 'Antoine de Saint-Exupéry', 'vhnn', 2, 2020, 2, 'A2-01'],
  ['Cây cam ngọt của tôi', 'José Mauro de Vasconcelos', 'vhnn', 2, 2021, 1, 'A2-01'],
  ['Nhà giả kim', 'Paulo Coelho', 'vhnn', 2, 2020, 2, 'A2-02'],
  ['Mười vạn câu hỏi vì sao', 'Nhiều tác giả', 'kh', 3, 2017, 2, 'B1-01'],
  ['Clean Code', 'Robert C. Martin', 'cntt', 5, 2008, 2, 'B2-01'],
  ['Introduction to Algorithms', 'Thomas H. Cormen', 'cntt', 6, 2009, 2, 'B2-02'],
  ['Đắc nhân tâm', 'Dale Carnegie', 'kn', 4, 2016, 3, 'C1-01'],
];

const READERS = [
  { username: 'docgia', fullName: 'Nguyễn Minh Anh', email: 'minhanh@example.edu.vn', studentCode: 'SV24100001', type: 'student' },
  { username: 'sv24100002', fullName: 'Trần Quốc Bảo', email: 'quocbao@example.edu.vn', studentCode: 'SV24100002', type: 'student' },
  { username: 'gv0001', fullName: 'Lê Thu Hà', email: 'thuha@example.edu.vn', studentCode: 'GV0001', type: 'lecturer' },
  { username: 'sv24100003', fullName: 'Phạm Gia Huy', email: 'giahuy@example.edu.vn', studentCode: 'SV24100003', type: 'student' },
  { username: 'sv24100004', fullName: 'Võ Ngọc Lan', email: 'ngoclan@example.edu.vn', studentCode: 'SV24100004', type: 'student' },
];

function isbn13(index) {
  const body = `978604${String(100000 + index).slice(-6)}`;
  const sum = [...body].reduce((acc, ch, i) => acc + Number(ch) * (i % 2 === 0 ? 1 : 3), 0);
  return `${body}${(10 - (sum % 10)) % 10}`;
}

async function insertAccount(db, { username, role, credentials }) {
  const password = generatePassword();
  const { rows } = await db.query(
    `insert into account (username, password_hash, role) values ($1, $2, $3) returning account_id`,
    [username, await hashPassword(password), role],
  );
  credentials.push({ username, role, password });
  return rows[0].account_id;
}

async function insertStaff(db, { username, role, fullName, email, department, credentials }) {
  const accountId = await insertAccount(db, { username, role, credentials });
  const { rows } = await db.query(
    `insert into librarian (account_id, full_name, email, department) values ($1, $2, $3, $4) returning staff_id`,
    [accountId, fullName, email, department],
  );
  return rows[0].staff_id;
}

async function seedCatalog(db) {
  const categoryIds = {};
  for (const c of CATEGORIES) {
    const { rows } = await db.query(
      `insert into category (category_name, parent_id) values ($1, $2) returning category_id`,
      [c.name, c.parent ? categoryIds[c.parent] : null],
    );
    categoryIds[c.key] = rows[0].category_id;
  }
  const publisherIds = [];
  for (const name of PUBLISHERS) {
    const { rows } = await db.query(`insert into publisher (publisher_name) values ($1) returning publisher_id`, [name]);
    publisherIds.push(rows[0].publisher_id);
  }
  const copies = {};
  for (const [index, [title, author, cat, pub, year, quantity, shelf]] of TITLES.entries()) {
    const isbn = isbn13(index + 1);
    await db.query(
      `insert into book_title (isbn, category_id, publisher_id, title, author, publish_year) values ($1, $2, $3, $4, $5, $6)`,
      [isbn, categoryIds[cat], publisherIds[pub], title, author, year],
    );
    const { rows } = await db.query(
      `insert into book_copy (isbn, shelf_location) select $1, $2 from generate_series(1, $3) returning barcode`,
      [isbn, shelf, quantity],
    );
    copies[title] = { isbn, barcodes: rows.map((r) => r.barcode) };
  }
  return copies;
}

async function seedReaders(db, settings, credentials) {
  const issued = today();
  const ids = {};
  for (const r of READERS) {
    const accountId = await insertAccount(db, { username: r.username, role: 'reader', credentials });
    const limit = r.type === 'lecturer' ? settings.max_borrow_lecturer : settings.max_borrow_student;
    const { rows } = await db.query(
      `insert into reader (account_id, full_name, email, student_code, reader_type, max_borrow_limit, card_issued_date, card_expiry_date)
       values ($1, $2, $3, $4, $5, $6, $7, $8) returning reader_id`,
      [accountId, r.fullName, r.email, r.studentCode, r.type, limit, addDays(issued, -60), addDays(issued, settings.card_valid_days - 60)],
    );
    ids[r.username] = rows[0].reader_id;
  }
  return ids;
}

async function seedLoan(db, { readerId, staffId, barcodes, createdOffset, loanDays, returnedOffset }) {
  const now = today();
  const created = addDays(now, createdOffset);
  const returned = returnedOffset === undefined ? null : addDays(now, returnedOffset);
  const { rows } = await db.query(
    `insert into loan_record (reader_id, staff_id, created_date, due_date, actual_return_date, status)
     values ($1, $2, $3, $4, $5, $6) returning loan_id`,
    [readerId, staffId, created, addDays(created, loanDays), returned, returned ? 'Returned' : 'Borrowing'],
  );
  const loanId = rows[0].loan_id;
  await db.query(
    `insert into loan_detail (loan_id, barcode, returned_at, return_condition)
     select $1, unnest($2::varchar[]), $3::date, case when $3::date is null then null else 'Good' end`,
    [loanId, barcodes, returned],
  );
  if (!returned) await db.query(`update book_copy set loan_status = 'Borrowed' where barcode = any($1::varchar[])`, [barcodes]);
  return loanId;
}

async function seedCirculation(db, { staffId, readers, copies }) {
  const pick = (title, i = 0) => copies[title].barcodes[i];
  await seedLoan(db, { readerId: readers.docgia, staffId, barcodes: [pick('Clean Code')], createdOffset: -3, loanDays: 14 });
  await seedLoan(db, {
    readerId: readers.sv24100002,
    staffId,
    barcodes: [pick('Mắt biếc'), pick('Nhà giả kim')],
    createdOffset: -20,
    loanDays: 14,
  });
  await seedLoan(db, { readerId: readers.gv0001, staffId, barcodes: [pick('Hoàng tử bé')], createdOffset: -40, loanDays: 30, returnedOffset: -8 });
  const damagedLoan = await seedLoan(db, {
    readerId: readers.sv24100003,
    staffId,
    barcodes: [pick('Cây cam ngọt của tôi')],
    createdOffset: -15,
    loanDays: 14,
    returnedOffset: -1,
  });
  await db.query(
    `insert into fine_receipt (loan_id, barcode, fine_type, reason, amount) values ($1, $2, 'Overdue', $3, 2000)`,
    [damagedLoan, pick('Cây cam ngọt của tôi'), 'Trả trễ 1 ngày – Cây cam ngọt của tôi'],
  );
  await db.query(
    `insert into reservation (reader_id, isbn, expire_date) values ($1, $2, $3)`,
    [readers.sv24100004, copies['Mắt biếc'].isbn, addDays(today(), 30)],
  );
}

async function main() {
  await settingService.seedDefaults();
  const { rows } = await pool.query(`select 1 from account where username = 'admin'`);
  if (rows.length) {
    console.log('Dữ liệu mẫu đã tồn tại, chỉ cập nhật tham số mặc định');
    return;
  }
  const settings = await settingService.get();
  const credentials = [];
  await withTransaction(async (db) => {
    await insertStaff(db, {
      username: 'admin',
      role: 'admin',
      fullName: 'Quản trị viên',
      email: 'admin@thuvien.local',
      department: 'Ban quản trị',
      credentials,
    });
    const staffId = await insertStaff(db, {
      username: 'thuthu',
      role: 'librarian',
      fullName: 'Đỗ Thị Hoa',
      email: 'thuthu@thuvien.local',
      department: 'Phòng lưu thông',
      credentials,
    });
    const copies = await seedCatalog(db);
    const readers = await seedReaders(db, settings, credentials);
    await seedCirculation(db, { staffId, readers, copies });
  });
  console.log('Đã nạp dữ liệu mẫu. Mật khẩu chỉ hiển thị một lần, hãy lưu lại:');
  console.table(credentials);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
