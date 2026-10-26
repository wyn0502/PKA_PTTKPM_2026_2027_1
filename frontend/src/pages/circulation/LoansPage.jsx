// Dung Pham Anh: Màn hình danh sách phiếu mượn: bộ lọc trạng thái/quá hạn, bảng phiếu và hộp thoại chi tiết
import PageHeader from '../../components/ui/PageHeader.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Field from '../../components/ui/Field.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import ErrorNotice from '../../components/ui/ErrorNotice.jsx';
import LoanDetailModal from '../../components/circulation/LoanDetailModal.jsx';
import { useLoans } from './useLoans.js';
import { formatDate } from '../../utils/format.js';
import { LOAN_STATUS } from '../../utils/labels.js';
import { loanStatusOf } from '../../utils/domain.js';

const COLUMNS = [
  { key: 'loanId', header: 'Số phiếu', render: (r) => <span className="code-id">{r.loanId}</span> },
  {
    key: 'readerName',
    header: 'Độc giả',
    render: (r) => (
      <>
        {r.readerName} <small className="muted mono">{r.readerId}</small>
      </>
    ),
  },
  { key: 'createdDate', header: 'Ngày mượn', render: (r) => <span className="mono">{formatDate(r.createdDate)}</span> },
  { key: 'dueDate', header: 'Hạn trả', render: (r) => <span className="mono">{formatDate(r.dueDate)}</span> },
  {
    key: 'items',
    header: 'Chưa trả / tổng',
    className: 'right',
    render: (r) => (
      <span className="num">
        {r.unreturnedCount}/{r.itemCount}
      </span>
    ),
  },
  { key: 'status', header: 'Trạng thái', render: (r) => <StatusBadge map={LOAN_STATUS} value={loanStatusOf(r)} /> },
];

export default function LoansPage() {
  const { filters, setFilter, list, selectedId, select, closeDetail } = useLoans();

  return (
    <>
      <PageHeader marker="lưu thông" title="Phiếu mượn" description="Tra cứu phiếu mượn, xem chi tiết, gia hạn và in lại phiếu." />
      <div className="toolbar">
        <Field label="Tìm kiếm" className="grow">
          <SearchInput value={filters.q} onChange={(q) => setFilter('q', q)} placeholder="Số phiếu, mã/tên độc giả, mã cá biệt" />
        </Field>
        <Field label="Trạng thái">
          <select className="select" value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
            <option value="">Tất cả</option>
            <option value="Borrowing">Đang mượn</option>
            <option value="Returned">Đã trả</option>
          </select>
        </Field>
        <label className="checkbox" style={{ minHeight: 38 }}>
          <input type="checkbox" checked={filters.overdue} onChange={(e) => setFilter('overdue', e.target.checked)} />
          Chỉ phiếu quá hạn
        </label>
      </div>
      <ErrorNotice error={list.error} onRetry={list.reload} />
      <section className="card card-flush">
        <DataTable columns={COLUMNS} rows={list.data?.items} rowKey={(r) => r.loanId} loading={list.loading} onRowClick={select} empty="Không có phiếu mượn phù hợp" />
        <Pagination page={list.page} pageSize={list.pageSize} total={list.data?.total} onChange={list.setPage} />
      </section>
      <LoanDetailModal loanId={selectedId} onClose={closeDetail} onChanged={list.reload} />
    </>
  );
}
