// Dung Pham Anh: Màn hình phí phạt của độc giả: cảnh báo tổng nợ và bảng biên lai
import PageHeader from '../../components/ui/PageHeader.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import ErrorNotice from '../../components/ui/ErrorNotice.jsx';
import { useMyFines } from './useMyFines.js';
import { formatDateTime, formatMoney } from '../../utils/format.js';
import { FINE_TYPE, PAID_STATUS } from '../../utils/labels.js';

const COLUMNS = [
  { key: 'fineId', header: 'Biên lai', render: (r) => <span className="code-id">{r.fineId}</span> },
  { key: 'fineType', header: 'Vi phạm', render: (r) => <StatusBadge map={FINE_TYPE} value={r.fineType} /> },
  { key: 'reason', header: 'Nội dung' },
  { key: 'amount', header: 'Số tiền', className: 'right', render: (r) => <span className="num">{formatMoney(r.amount)}</span> },
  { key: 'createdAt', header: 'Ngày lập', render: (r) => <span className="mono">{formatDateTime(r.createdAt)}</span> },
  { key: 'isPaid', header: 'Trạng thái', render: (r) => <StatusBadge map={PAID_STATUS} value={r.isPaid} /> },
];

export default function MyFinesPage() {
  const { list, unpaidTotal: unpaid } = useMyFines();

  return (
    <>
      <PageHeader marker="UC-10" title="Phí phạt của tôi" description="Khoản phạt chưa thanh toán sẽ tạm chặn quyền mượn và đặt trước. Thanh toán tại quầy thủ thư." />
      {unpaid > 0 && (
        <div className="alert tone-3" style={{ marginBottom: 14 }}>
          Bạn đang nợ <strong>{formatMoney(unpaid)}</strong>.
        </div>
      )}
      <ErrorNotice error={list.error} onRetry={list.reload} />
      <section className="card card-flush">
        <DataTable columns={COLUMNS} rows={list.data?.items} rowKey={(r) => r.fineId} loading={list.loading} empty="Bạn không có khoản phạt nào" />
        <Pagination page={list.page} pageSize={list.pageSize} total={list.data?.total} onChange={list.setPage} />
      </section>
    </>
  );
}
