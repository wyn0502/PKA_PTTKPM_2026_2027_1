// Dung Pham Anh: Màn hình đặt trước của độc giả: thông báo sách đã về, bảng yêu cầu với thứ tự chờ, nút huỷ
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import ErrorNotice from '../../components/ui/ErrorNotice.jsx';
import { useMyReservations } from './useMyReservations.js';
import { isActiveReservation } from '../../utils/domain.js';
import { formatDate, formatDateTime } from '../../utils/format.js';
import { RESERVATION_STATUS } from '../../utils/labels.js';

const buildColumns = (onCancel) => [
  { key: 'title', header: 'Đầu sách', render: (r) => <Link to={`/books/${r.isbn}`}>{r.title}</Link> },
  { key: 'reserveDate', header: 'Ngày đặt', render: (r) => <span className="mono">{formatDateTime(r.reserveDate)}</span> },
  { key: 'queue', header: 'Thứ tự chờ', render: (r) => (r.queuePosition ? <span className="num">#{r.queuePosition}</span> : '—') },
  { key: 'expireDate', header: 'Hết hạn', render: (r) => <span className="mono">{formatDate(r.expireDate)}</span> },
  { key: 'status', header: 'Trạng thái', render: (r) => <StatusBadge map={RESERVATION_STATUS} value={r.status} /> },
  {
    key: 'actions',
    header: '',
    className: 'actions',
    render: (r) =>
      isActiveReservation(r) && (
        <button type="button" className="btn btn-sm btn-danger" onClick={() => onCancel(r)}>
          Huỷ
        </button>
      ),
  },
];

export default function MyReservationsPage() {
  const page = useMyReservations();
  const { list, ready, cancelling } = page;

  return (
    <>
      <PageHeader marker="UC-06" title="Đặt trước của tôi" />
      {ready.length > 0 && (
        <div className="alert tone-7" style={{ marginBottom: 14 }}>
          <strong>Sách đã về:</strong> {ready.map((r) => r.title).join(', ')}. Vui lòng đến quầy nhận trước ngày {formatDate(ready[0].expireDate)}.
        </div>
      )}
      <ErrorNotice error={list.error} onRetry={list.reload} />
      <section className="card card-flush">
        <DataTable columns={buildColumns(page.askCancel)} rows={list.data?.items} rowKey={(r) => r.reserveId} loading={list.loading} empty="Bạn chưa đặt trước tài liệu nào" />
        <Pagination page={list.page} pageSize={list.pageSize} total={list.data?.total} onChange={list.setPage} />
      </section>
      <ConfirmModal
        open={!!cancelling}
        title="Huỷ đặt trước"
        message={cancelling && `Huỷ đặt trước “${cancelling.title}”?`}
        confirmLabel="Huỷ đặt trước"
        danger
        onConfirm={page.cancel}
        onClose={page.closeCancel}
      />
    </>
  );
}
