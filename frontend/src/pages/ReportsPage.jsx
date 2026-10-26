// Dung Pham Anh: Màn hình thống kê – báo cáo (UC-11): tab loại báo cáo, chọn kỳ, biểu đồ và bảng chi tiết
import { FiDownload } from 'react-icons/fi';
import PageHeader from '../components/ui/PageHeader.jsx';
import Field from '../components/ui/Field.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import ErrorNotice from '../components/ui/ErrorNotice.jsx';
import TrendChart from '../components/charts/TrendChart.jsx';
import CategoryBarChart from '../components/charts/CategoryBarChart.jsx';
import { useReports, RANGE_PRESETS } from './useReports.js';
import { formatDate, formatMoney } from '../utils/format.js';
import { FINE_TYPE } from '../utils/labels.js';

const mono = (key) => (r) => <span className="num">{r[key]}</span>;
const money = (key) => (r) => <span className="num">{formatMoney(r[key])}</span>;
const date = (key) => (r) => <span className="mono">{formatDate(r[key])}</span>;

const REPORTS = {
  loans: {
    label: 'Lượt mượn – trả',
    usesRange: true,
    chart: (rows) => <TrendChart data={rows} />,
    rowKey: (r) => r.day,
    columns: [
      { key: 'day', header: 'Ngày', render: date('day') },
      { key: 'borrowed', header: 'Lượt mượn', className: 'right', render: mono('borrowed') },
      { key: 'returned', header: 'Lượt trả', className: 'right', render: mono('returned') },
    ],
  },
  categories: {
    label: 'Theo thể loại',
    usesRange: true,
    chart: (rows) => <CategoryBarChart data={rows} labelKey="category" valueKey="loans" valueName="Lượt mượn" />,
    rowKey: (r) => r.category,
    columns: [
      { key: 'category', header: 'Thể loại' },
      { key: 'loans', header: 'Lượt mượn', className: 'right', render: mono('loans') },
    ],
  },
  top: {
    label: 'Sách mượn nhiều',
    usesRange: true,
    rowKey: (r) => r.isbn,
    columns: [
      { key: 'rank', header: '#', render: (r) => <span className="marker">{String(r.rank).padStart(2, '0')}</span> },
      { key: 'title', header: 'Nhan đề', render: (r) => (
        <>
          {r.title} <small className="muted">· {r.author}</small>
        </>
      ) },
      { key: 'categoryName', header: 'Thể loại' },
      { key: 'loans', header: 'Lượt mượn', className: 'right', render: mono('loans') },
    ],
  },
  overdue: {
    label: 'Sách quá hạn',
    usesRange: false,
    rowKey: (r) => `${r.loanId}-${r.barcode}`,
    columns: [
      { key: 'loanId', header: 'Phiếu', render: (r) => <span className="code-id">{r.loanId}</span> },
      { key: 'readerName', header: 'Độc giả', render: (r) => (
        <>
          {r.readerName} <small className="muted">{r.phone || r.email}</small>
        </>
      ) },
      { key: 'title', header: 'Nhan đề' },
      { key: 'dueDate', header: 'Hạn trả', render: date('dueDate') },
      { key: 'overdueDays', header: 'Số ngày trễ', className: 'right', render: (r) => <span className="num-alert">{r.overdueDays}</span> },
      { key: 'estimatedFine', header: 'Phí tạm tính', className: 'right', render: money('estimatedFine') },
    ],
  },
  inventory: {
    label: 'Tồn kho',
    usesRange: false,
    rowKey: (r) => r.category,
    columns: [
      { key: 'category', header: 'Thể loại' },
      { key: 'titles', header: 'Đầu sách', className: 'right', render: mono('titles') },
      { key: 'copies', header: 'Bản sao', className: 'right', render: mono('copies') },
      { key: 'available', header: 'Khả dụng', className: 'right', render: mono('available') },
      { key: 'borrowed', header: 'Đang mượn', className: 'right', render: mono('borrowed') },
      { key: 'onHold', header: 'Giữ chỗ', className: 'right', render: mono('onHold') },
      { key: 'maintenance', header: 'Sửa chữa', className: 'right', render: mono('maintenance') },
      { key: 'storage', header: 'Lưu kho', className: 'right', render: mono('storage') },
      { key: 'lost', header: 'Mất', className: 'right', render: mono('lost') },
    ],
  },
  fines: {
    label: 'Phí phạt',
    usesRange: true,
    rowKey: (r) => r.fineType,
    columns: [
      { key: 'fineType', header: 'Loại vi phạm', render: (r) => <StatusBadge map={FINE_TYPE} value={r.fineType} /> },
      { key: 'receipts', header: 'Số biên lai', className: 'right', render: mono('receipts') },
      { key: 'amount', header: 'Tổng tiền', className: 'right', render: money('amount') },
      { key: 'paidAmount', header: 'Đã thu', className: 'right', render: money('paidAmount') },
    ],
  },
};

export default function ReportsPage() {
  const page = useReports();
  const report = REPORTS[page.type];

  return (
    <>
      <PageHeader
        marker="UC-11"
        title="Thống kê – báo cáo"
        description="Số liệu được tổng hợp trực tiếp từ hồ sơ giao dịch, không cần rà sổ cuối kỳ."
        actions={
          <button type="button" className="btn btn-primary" onClick={page.exportXlsx} disabled={page.exporting}>
            <FiDownload /> {page.exporting ? 'Đang xuất…' : 'Xuất Excel'}
          </button>
        }
      />
      <div className="tabs" role="tablist" style={{ marginBottom: 14 }}>
        {Object.entries(REPORTS).map(([key, r]) => (
          <button key={key} type="button" role="tab" className="tab" aria-selected={page.type === key} onClick={() => page.setType(key)}>
            {r.label}
          </button>
        ))}
      </div>
      {report.usesRange && (
        <div className="toolbar">
          <Field label="Từ ngày">
            <input className="input mono" type="date" value={page.range.from} max={page.range.to} onChange={page.setFrom} />
          </Field>
          <Field label="Đến ngày">
            <input className="input mono" type="date" value={page.range.to} min={page.range.from} onChange={page.setTo} />
          </Field>
          <div className="row">
            {RANGE_PRESETS.map((p) => (
              <button key={p.label} type="button" className="btn btn-sm" onClick={() => page.applyPreset(p.days)}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <ErrorNotice error={page.error} onRetry={page.reload} />
      <div className="stack">
        {report.chart && page.rows.length > 0 && <section className="card">{report.chart(page.rows)}</section>}
        <section className="card card-flush">
          <DataTable columns={report.columns} rows={page.rows} rowKey={report.rowKey} loading={page.loading} empty="Không phát sinh dữ liệu trong kỳ báo cáo này" />
        </section>
      </div>
    </>
  );
}
