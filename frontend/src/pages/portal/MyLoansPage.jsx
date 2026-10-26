// Dung Pham Anh: Màn hình sách đang mượn của độc giả: thẻ phiếu đang mượn kèm nút gia hạn và bảng lịch sử
import { FiClock } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import ErrorNotice from '../../components/ui/ErrorNotice.jsx';
import LoadingBlock from '../../components/ui/LoadingBlock.jsx';
import { useMyLoans } from './useMyLoans.js';
import { formatDate, formatDateTime } from '../../utils/format.js';
import { LOAN_STATUS } from '../../utils/labels.js';

const HISTORY_COLUMNS = [
  { key: 'title', header: 'Nhan đề', render: (r) => (
    <>
      {r.title} <small className="muted">{r.author}</small>
    </>
  ) },
  { key: 'createdDate', header: 'Ngày mượn', render: (r) => <span className="mono">{formatDate(r.createdDate)}</span> },
  { key: 'dueDate', header: 'Hạn trả', render: (r) => <span className="mono">{formatDate(r.dueDate)}</span> },
  { key: 'returnedAt', header: 'Đã trả', render: (r) => <span className="mono">{formatDateTime(r.returnedAt)}</span> },
  { key: 'status', header: 'Trạng thái', render: (r) => <StatusBadge map={LOAN_STATUS} value={r.status} /> },
];

export default function MyLoansPage() {
  const page = useMyLoans();
  if (page.error) return <ErrorNotice error={page.error} onRetry={page.reload} />;
  if (page.loading) return <LoadingBlock />;
  const { current, history, renewing } = page;

  return (
    <>
      <PageHeader marker="UC-09" title="Sách đang mượn" description="Mỗi phiếu được gia hạn khi chưa quá hạn, còn lượt gia hạn và không có người đặt trước." />
      {current.length === 0 ? (
        <div className="card empty">Bạn không mượn cuốn sách nào.</div>
      ) : (
        <div className="stack">
          {current.map((loan) => (
            <section key={loan.loanId} className="card">
              <div className="row-between" style={{ marginBottom: 10 }}>
                <div>
                  <span className="code-id">{loan.loanId}</span>{' '}
                  <span className="muted">
                    · mượn {formatDate(loan.createdDate)} · hạn <strong className="mono">{formatDate(loan.dueDate)}</strong>
                  </span>
                </div>
                <div className="row">
                  <StatusBadge map={LOAN_STATUS} value={loan.isOverdue ? 'Overdue' : loan.status} />
                  <button type="button" className="btn btn-sm btn-primary" disabled={!loan.canRenew} title={loan.renewBlocker || undefined} onClick={() => page.askRenew(loan)}>
                    <FiClock /> Gia hạn
                  </button>
                </div>
              </div>
              {loan.renewBlocker && <p className="muted" style={{ margin: '0 0 8px', fontSize: 12.5 }}>{loan.renewBlocker}</p>}
              <ul className="list-plain scan-list">
                {loan.items.map((item) => (
                  <li key={item.barcode}>
                    <span>{item.title}</span>
                    <small className="muted">{item.returnedAt ? `Đã trả ${formatDate(item.returnedAt)}` : item.author}</small>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
      <h2 style={{ fontSize: 16, margin: '28px 0 12px' }}>Lịch sử mượn – trả</h2>
      <section className="card card-flush">
        <DataTable columns={HISTORY_COLUMNS} rows={history} rowKey={(r) => `${r.loanId}-${r.barcode}`} empty="Chưa có lịch sử" />
      </section>
      <ConfirmModal
        open={!!renewing}
        title="Gia hạn mượn"
        message={renewing && `Gia hạn phiếu ${renewing.loanId} (hạn hiện tại ${formatDate(renewing.dueDate)})?`}
        confirmLabel="Gia hạn"
        onConfirm={page.renew}
        onClose={page.closeRenew}
      />
    </>
  );
}
