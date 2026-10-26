// Dung Pham Anh: Trang tổng quan cho thủ thư: thẻ số liệu, biểu đồ mượn/trả 30 ngày, danh sách quá hạn
import { Link } from 'react-router-dom';
import { FiLogIn, FiLogOut } from 'react-icons/fi';
import PageHeader from '../components/ui/PageHeader.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import ErrorNotice from '../components/ui/ErrorNotice.jsx';
import LoadingBlock from '../components/ui/LoadingBlock.jsx';
import TrendChart from '../components/charts/TrendChart.jsx';
import { useDashboard } from './useDashboard.js';
import { formatDate, formatMoney, formatNumber } from '../utils/format.js';

const OVERDUE_COLUMNS = [
  { key: 'readerName', header: 'Độc giả', render: (r) => <Link to={`/readers/${r.readerId}`}>{r.readerName}</Link> },
  { key: 'title', header: 'Nhan đề' },
  { key: 'barcode', header: 'Mã cá biệt', render: (r) => <span className="code-id">{r.barcode}</span> },
  { key: 'dueDate', header: 'Hạn trả', render: (r) => <span className="mono">{formatDate(r.dueDate)}</span> },
  { key: 'overdueDays', header: 'Trễ', className: 'right', render: (r) => <span className="num-alert">{r.overdueDays} ngày</span> },
];

function SummaryStats({ s }) {
  return (
    <div className="stats">
      <StatCard tone={1} label="Đầu sách" value={formatNumber(s.titleCount)} note={`${formatNumber(s.copyCount)} bản sao`} />
      <StatCard tone={8} label="Bản sao khả dụng" value={formatNumber(s.availableCount)} note={`${s.maintenanceCount} đang sửa chữa`} />
      <StatCard tone={6} label="Phiếu đang mượn" value={formatNumber(s.activeLoanCount)} note={`${s.borrowedCount} bản sao ngoài thư viện`} />
      <StatCard tone={3} label="Bản sao quá hạn" value={formatNumber(s.overdueCopyCount)} note="Cần nhắc độc giả trả" />
      <StatCard tone={2} label="Hôm nay" value={`${s.loansToday} / ${s.returnsToday}`} note="Phiếu mượn / lượt trả" />
      <StatCard tone={5} label="Đặt trước đang chờ" value={formatNumber(s.pendingReservationCount)} note={`${s.readyReservationCount} sách đang giữ chỗ`} />
      <StatCard tone={4} label="Nợ phạt chưa thu" value={formatMoney(s.unpaidFineTotal)} />
      <StatCard tone={7} label="Độc giả" value={formatNumber(s.readerCount)} />
    </div>
  );
}

export default function DashboardPage() {
  const dashboard = useDashboard();
  const { summary } = dashboard;

  return (
    <>
      <PageHeader
        marker="01 tổng quan"
        title={`Xin chào, ${dashboard.userName}`}
        description={`Tình hình thư viện hôm nay, ${formatDate(dashboard.today)}`}
        actions={
          <>
            <Link to="/borrow" className="btn btn-primary">
              <FiLogOut /> Lập phiếu mượn
            </Link>
            <Link to="/return" className="btn">
              <FiLogIn /> Ghi nhận trả
            </Link>
          </>
        }
      />
      <ErrorNotice error={summary.error} onRetry={summary.reload} />
      {summary.data ? <SummaryStats s={summary.data} /> : <LoadingBlock />}

      <div className="stack" style={{ marginTop: 20 }}>
        <section className="card">
          <div className="card-title">
            Lượt mượn – trả 30 ngày gần nhất <Link to="/reports">Xem báo cáo</Link>
          </div>
          {dashboard.trendRows ? <TrendChart data={dashboard.trendRows} /> : <LoadingBlock />}
        </section>
        <section className="card card-flush">
          <div className="card-title" style={{ padding: '16px 18px 0' }}>
            Bản sao quá hạn <Link to="/loans?overdue=true">Tất cả phiếu quá hạn</Link>
          </div>
          <DataTable
            columns={OVERDUE_COLUMNS}
            rows={dashboard.overdueRows}
            rowKey={(r) => `${r.loanId}-${r.barcode}`}
            loading={dashboard.overdueLoading}
            empty="Không có bản sao nào quá hạn"
          />
        </section>
      </div>
    </>
  );
}
