// Dung Pham Anh: Màn hình phí phạt (UC-10): bảng biên lai, bộ lọc, thu tiền, lập phiếu phạt và in biên lai
import { FiPlus } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Field from '../../components/ui/Field.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import ErrorNotice from '../../components/ui/ErrorNotice.jsx';
import FineFormModal from '../../components/circulation/FineFormModal.jsx';
import PrintModal from '../../components/circulation/PrintModal.jsx';
import { FineReceipt } from '../../components/circulation/Receipts.jsx';
import { useFines } from './useFines.js';
import { formatDateTime, formatMoney } from '../../utils/format.js';
import { FINE_TYPE, PAID_STATUS } from '../../utils/labels.js';

const buildColumns = ({ onPay, onPrint }) => [
  { key: 'fineId', header: 'Biên lai', render: (r) => <span className="code-id">{r.fineId}</span> },
  {
    key: 'readerName',
    header: 'Độc giả',
    render: (r) => (
      <>
        {r.readerName} <small className="muted mono">{r.readerId}</small>
      </>
    ),
  },
  { key: 'fineType', header: 'Vi phạm', render: (r) => <StatusBadge map={FINE_TYPE} value={r.fineType} /> },
  { key: 'reason', header: 'Nội dung' },
  { key: 'amount', header: 'Số tiền', className: 'right', render: (r) => <span className="num">{formatMoney(r.amount)}</span> },
  { key: 'createdAt', header: 'Ngày lập', render: (r) => <span className="mono">{formatDateTime(r.createdAt)}</span> },
  { key: 'isPaid', header: 'Trạng thái', render: (r) => <StatusBadge map={PAID_STATUS} value={r.isPaid} /> },
  {
    key: 'actions',
    header: '',
    className: 'actions',
    render: (r) => (
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        {!r.isPaid && (
          <button type="button" className="btn btn-sm btn-primary" onClick={() => onPay(r)}>
            Thu tiền
          </button>
        )}
        <button type="button" className="btn btn-sm" onClick={() => onPrint(r)}>
          In
        </button>
      </div>
    ),
  },
];

export default function FinesPage() {
  const page = useFines();
  const { filters, setFilter, list, paying } = page;

  return (
    <>
      <PageHeader
        marker="UC-10"
        title="Phí phạt"
        description="Độc giả còn nợ phạt bị chặn mượn và đặt trước cho đến khi thanh toán đủ."
        actions={
          <button type="button" className="btn btn-primary" onClick={page.openCreate}>
            <FiPlus /> Lập phiếu phạt
          </button>
        }
      />
      <div className="toolbar">
        <Field label="Tìm kiếm" className="grow">
          <SearchInput value={filters.q} onChange={(q) => setFilter('q', q)} placeholder="Mã biên lai, số phiếu, mã/tên độc giả" />
        </Field>
        <Field label="Trạng thái">
          <select className="select" value={filters.paid} onChange={(e) => setFilter('paid', e.target.value)}>
            <option value="false">Chưa thanh toán</option>
            <option value="true">Đã thanh toán</option>
            <option value="">Tất cả</option>
          </select>
        </Field>
      </div>
      <ErrorNotice error={list.error} onRetry={list.reload} />
      {list.data && (
        <p className="muted" style={{ margin: '0 0 10px' }}>
          Tổng tiền theo bộ lọc: <span className="num">{formatMoney(list.data.totalAmount)}</span>
        </p>
      )}
      <section className="card card-flush">
        <DataTable
          columns={buildColumns({ onPay: page.askPay, onPrint: page.showReceipt })}
          rows={list.data?.items}
          rowKey={(r) => r.fineId}
          loading={list.loading}
          empty="Không có biên lai phạt"
        />
        <Pagination page={list.page} pageSize={list.pageSize} total={list.data?.total} onChange={list.setPage} />
      </section>

      <ConfirmModal
        open={!!paying}
        title="Thu tiền phạt"
        message={paying && `Xác nhận đã nhận ${formatMoney(paying.amount)} từ ${paying.readerName} cho biên lai ${paying.fineId}?`}
        confirmLabel="Đã nhận tiền"
        onConfirm={page.pay}
        onClose={page.closePay}
      />
      <FineFormModal open={page.creating} context={null} onClose={page.closeCreate} onCreated={page.onCreated} />
      <PrintModal open={!!page.receipt} title="Biên lai phạt" onClose={page.closeReceipt}>
        {page.receipt && <FineReceipt fines={page.receipt} />}
      </PrintModal>
    </>
  );
}
