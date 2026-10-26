// Dung Pham Anh: Màn hình đặt trước phía thủ thư (UC-06): bảng hàng đợi, bộ lọc trạng thái, huỷ yêu cầu
import PageHeader from '../../components/ui/PageHeader.jsx';
import Field from '../../components/ui/Field.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import ErrorNotice from '../../components/ui/ErrorNotice.jsx';
import { useReservations, STATUS_FILTERS } from './useReservations.js';
import { isActiveReservation } from '../../utils/domain.js';
import { formatDate, formatDateTime } from '../../utils/format.js';
import { RESERVATION_STATUS } from '../../utils/labels.js';

const buildColumns = (onCancel) => [
  { key: 'reserveId', header: 'Mã', render: (r) => <span className="code-id">{r.reserveId}</span> },
  {
    key: 'readerName',
    header: 'Độc giả',
    render: (r) => (
      <>
        {r.readerName} <small className="muted mono">{r.readerId}</small>
      </>
    ),
  },
  { key: 'title', header: 'Đầu sách' },
  { key: 'reserveDate', header: 'Ngày đặt', render: (r) => <span className="mono">{formatDateTime(r.reserveDate)}</span> },
  { key: 'queue', header: 'Thứ tự', className: 'right', render: (r) => (r.queuePosition ? <span className="num">#{r.queuePosition}</span> : '—') },
  { key: 'barcode', header: 'Bản sao giữ', render: (r) => (r.barcode ? <span className="code-id">{r.barcode}</span> : '—') },
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

export default function ReservationsPage() {
  const page = useReservations();
  const { list, cancelling } = page;

  return (
    <>
      <PageHeader marker="UC-06" title="Đặt trước tài liệu" description="Hàng đợi xếp theo thời gian đặt. Khi có bản sao trả về, hệ thống tự giữ chỗ cho người đứng đầu hàng." />
      <div className="toolbar">
        <Field label="Trạng thái">
          <select className="select" value={page.status} onChange={(e) => page.setStatus(e.target.value)}>
            {STATUS_FILTERS.map((o) => (
              <option key={o.label} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <ErrorNotice error={list.error} onRetry={list.reload} />
      <section className="card card-flush">
        <DataTable columns={buildColumns(page.askCancel)} rows={list.data?.items} rowKey={(r) => r.reserveId} loading={list.loading} empty="Không có yêu cầu đặt trước" />
        <Pagination page={list.page} pageSize={list.pageSize} total={list.data?.total} onChange={list.setPage} />
      </section>
      <ConfirmModal
        open={!!cancelling}
        title="Huỷ đặt trước"
        message={cancelling && `Huỷ yêu cầu ${cancelling.reserveId} của ${cancelling.readerName}? Nếu sách đang được giữ, bản sao sẽ chuyển cho người kế tiếp.`}
        confirmLabel="Huỷ yêu cầu"
        danger
        onConfirm={page.cancel}
        onClose={page.closeCancel}
      />
    </>
  );
}
