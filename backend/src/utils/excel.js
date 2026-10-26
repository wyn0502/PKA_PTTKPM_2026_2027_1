// Dung Pham Anh: Đọc tệp Excel nhập liệu theo tiêu đề cột và tạo tệp mẫu tương ứng
import ExcelJS from 'exceljs';
import { badRequest } from './AppError.js';

const normalize = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

export const TEMPLATES = {
  titles: {
    filename: 'mau-nhap-dau-sach.xlsx',
    columns: [
      { header: 'ISBN', key: 'isbn', example: '9786042123456' },
      { header: 'Nhan đề', key: 'title', example: 'Tên sách' },
      { header: 'Tác giả', key: 'author', example: 'Tên tác giả' },
      { header: 'Thể loại', key: 'categoryName', example: 'Văn học' },
      { header: 'Nhà xuất bản', key: 'publisherName', example: 'NXB Trẻ' },
      { header: 'Năm xuất bản', key: 'publishYear', example: 2024 },
      { header: 'Số bản sao', key: 'initialCopies', example: 3 },
      { header: 'Vị trí kệ', key: 'shelfLocation', example: 'Kệ A1' },
    ],
  },
  readers: {
    filename: 'mau-nhap-doc-gia.xlsx',
    columns: [
      { header: 'Họ tên', key: 'fullName', example: 'Nguyễn Văn A' },
      { header: 'Email', key: 'email', example: 'a.nguyen@example.edu.vn' },
      { header: 'Mã SV/GV', key: 'studentCode', example: 'SV24100001' },
      { header: 'CCCD', key: 'identityNumber', example: '001204000001' },
      { header: 'Số điện thoại', key: 'phone', example: '0900000000' },
      { header: 'Loại thẻ (Sinh viên/Giảng viên)', key: 'readerType', example: 'Sinh viên' },
    ],
  },
};

const cellValue = (cell) => {
  const value = cell.value;
  if (value && typeof value === 'object') return value.text ?? value.result ?? value.richText?.map((r) => r.text).join('') ?? '';
  return value ?? '';
};

export async function readRows(buffer, templateKey) {
  const template = TEMPLATES[templateKey];
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer);
  } catch {
    throw badRequest('Không đọc được tệp Excel');
  }
  const sheet = workbook.worksheets[0];
  if (!sheet) throw badRequest('Tệp Excel không có trang tính');

  const headerMap = new Map(template.columns.map((c) => [normalize(c.header), c.key]));
  const keys = [];
  sheet.getRow(1).eachCell((cell, col) => {
    keys[col] = headerMap.get(normalize(cellValue(cell)));
  });
  const missing = template.columns.filter((c) => !keys.includes(c.key)).map((c) => c.header);
  if (missing.length) throw badRequest(`Thiếu cột: ${missing.join(', ')} (hãy dùng tệp mẫu)`);

  const rows = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const item = {};
    row.eachCell((cell, col) => {
      if (keys[col]) item[keys[col]] = String(cellValue(cell)).trim();
    });
    if (Object.values(item).some(Boolean)) rows.push(item);
  });
  if (rows.length > 1000) throw badRequest('Mỗi lần nhập tối đa 1000 dòng');
  return rows;
}

export async function buildTemplate(templateKey) {
  const template = TEMPLATES[templateKey];
  if (!template) throw badRequest('Mẫu không tồn tại');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Du lieu');
  sheet.columns = template.columns.map((c) => ({ header: c.header, key: c.key, width: Math.max(14, c.header.length + 4) }));
  sheet.getRow(1).font = { bold: true };
  sheet.addRow(Object.fromEntries(template.columns.map((c) => [c.key, c.example])));
  return { buffer: await workbook.xlsx.writeBuffer(), filename: template.filename };
}

export const readerTypeFromLabel = (label) => (normalize(label).startsWith('giang') || label === 'lecturer' ? 'lecturer' : 'student');
