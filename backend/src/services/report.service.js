// Dung Pham Anh: Nghiệp vụ thống kê – báo cáo (UC-11): tổng quan, lượt mượn theo kỳ/thể loại, quá hạn, tồn kho, phí phạt, xuất Excel
import ExcelJS from 'exceljs';
import { reportRepository } from '../repositories/report.repository.js';
import { settingService } from './setting.service.js';
import { overdueFine } from './policies.js';
import { date } from '../utils/validate.js';
import { today, addDays, diffDays } from '../utils/date.js';
import { badRequest } from '../utils/AppError.js';

const MAX_RANGE_DAYS = 366;

function parseRange(query) {
  const to = date(query.to, 'Đến ngày') || today();
  const from = date(query.from, 'Từ ngày') || addDays(to, -29);
  if (from > to) throw badRequest('Mốc thời gian sai logic: "Từ ngày" phải trước "Đến ngày"');
  if (diffDays(from, to) > MAX_RANGE_DAYS) throw badRequest('Khoảng thời gian tối đa 1 năm');
  return { from, to };
}

const camel = (row) =>
  Object.fromEntries(Object.entries(row).map(([k, v]) => [k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()), v]));

const REPORTS = {
  loans: {
    title: 'Lượt mượn – trả theo ngày',
    columns: [
      { header: 'Ngày', key: 'day', width: 14 },
      { header: 'Lượt mượn', key: 'borrowed', width: 12 },
      { header: 'Lượt trả', key: 'returned', width: 12 },
    ],
    load: (range) => reportRepository.loanTrend(range),
  },
  categories: {
    title: 'Lượt mượn theo thể loại',
    columns: [
      { header: 'Thể loại', key: 'category', width: 30 },
      { header: 'Lượt mượn', key: 'loans', width: 12 },
    ],
    load: (range) => reportRepository.loansByCategory(range),
  },
  top: {
    title: 'Sách được mượn nhiều',
    columns: [
      { header: 'ISBN', key: 'isbn', width: 16 },
      { header: 'Nhan đề', key: 'title', width: 40 },
      { header: 'Tác giả', key: 'author', width: 24 },
      { header: 'Thể loại', key: 'categoryName', width: 20 },
      { header: 'Lượt mượn', key: 'loans', width: 12 },
    ],
    load: (range) => reportRepository.topTitles({ ...range, limit: 50 }),
  },
  overdue: {
    title: 'Danh sách quá hạn',
    columns: [
      { header: 'Phiếu mượn', key: 'loanId', width: 12 },
      { header: 'Mã độc giả', key: 'readerId', width: 12 },
      { header: 'Họ tên', key: 'readerName', width: 24 },
      { header: 'Điện thoại', key: 'phone', width: 14 },
      { header: 'Mã cá biệt', key: 'barcode', width: 12 },
      { header: 'Nhan đề', key: 'title', width: 36 },
      { header: 'Hạn trả', key: 'dueDate', width: 12 },
      { header: 'Số ngày trễ', key: 'overdueDays', width: 12 },
      { header: 'Phí tạm tính', key: 'estimatedFine', width: 14 },
    ],
    load: async () => {
      const settings = await settingService.get();
      const rows = await reportRepository.overdueList(today());
      return rows.map((r) => ({ ...r, estimated_fine: overdueFine(r.overdue_days, settings) }));
    },
  },
  inventory: {
    title: 'Tồn kho theo thể loại',
    columns: [
      { header: 'Thể loại', key: 'category', width: 28 },
      { header: 'Đầu sách', key: 'titles', width: 10 },
      { header: 'Bản sao', key: 'copies', width: 10 },
      { header: 'Khả dụng', key: 'available', width: 10 },
      { header: 'Đang mượn', key: 'borrowed', width: 11 },
      { header: 'Giữ chỗ', key: 'onHold', width: 10 },
      { header: 'Sửa chữa', key: 'maintenance', width: 10 },
      { header: 'Lưu kho', key: 'storage', width: 10 },
      { header: 'Mất', key: 'lost', width: 8 },
    ],
    load: () => reportRepository.inventory(),
  },
  fines: {
    title: 'Phí phạt theo loại vi phạm',
    columns: [
      { header: 'Loại vi phạm', key: 'fineType', width: 16 },
      { header: 'Số biên lai', key: 'receipts', width: 12 },
      { header: 'Tổng tiền', key: 'amount', width: 14 },
      { header: 'Đã thu', key: 'paidAmount', width: 14 },
    ],
    load: (range) => reportRepository.fines(range),
  },
};

function requireReport(type) {
  const report = REPORTS[type];
  if (!report) throw badRequest('Loại báo cáo không hợp lệ');
  return report;
}

export const reportService = {
  async summary() {
    return camel(await reportRepository.summary(today()));
  },

  async get(type, query) {
    const report = requireReport(type);
    const range = parseRange(query);
    const rows = (await report.load(range)).map(camel);
    return { type, title: report.title, ...range, rows };
  },

  async exportXlsx(type, query) {
    const report = requireReport(type);
    const { from, to, rows } = await this.get(type, query);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Quản lý Thư viện';
    const sheet = workbook.addWorksheet(report.title.slice(0, 31));
    sheet.columns = report.columns;
    sheet.insertRow(1, [`${report.title} (${from} → ${to})`]);
    sheet.mergeCells(1, 1, 1, report.columns.length);
    sheet.getRow(1).font = { bold: true, size: 13 };
    sheet.getRow(2).font = { bold: true };
    sheet.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F3F3' } };
    rows.forEach((row) => sheet.addRow(row));
    if (!rows.length) sheet.addRow(['Không phát sinh dữ liệu trong kỳ báo cáo này']);
    return { buffer: await workbook.xlsx.writeBuffer(), filename: `bao-cao-${type}-${from}_${to}.xlsx` };
  },
};
