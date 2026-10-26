// Dung Pham Anh: Màn hình hồ sơ độc giả: thẻ, nợ phạt, các nút nghiệp vụ, tab phiếu mượn/đặt trước/phí phạt, bản in thẻ
import { Link } from 'react-router-dom';
import { FiEdit2, FiLock, FiUnlock, FiRefreshCw, FiKey, FiPrinter } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Barcode from '../../components/ui/Barcode.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import ErrorNotice from '../../components/ui/ErrorNotice.jsx';
import LoadingBlock from '../../components/ui/LoadingBlock.jsx';
import ReaderFormModal from '../../components/readers/ReaderFormModal.jsx';
import CredentialsModal from '../../components/readers/CredentialsModal.jsx';
import PrintModal from '../../components/circulation/PrintModal.jsx';
import LoanDetailModal from '../../components/circulation/LoanDetailModal.jsx';
import { useReaderDetail, READER_TABS } from './useReaderDetail.js';
import { formatDate, formatDateTime, formatMoney } from '../../utils/format.js';
import { CARD_STATUS, FINE_TYPE, LOAN_STATUS, PAID_STATUS, READER_TYPE, RESERVATION_STATUS } from '../../utils/labels.js';
import { loanStatusOf } from '../../utils/domain.js';

const TABLES = {
  loans: {
    rowKey: (r) => r.loanId,
    columns: [
      { key: 'loanId', header: 'Số phiếu', render: (r) => <span className="code-id">{r.loanId}</span> },
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
    ],
  },
  reservations: {
    rowKey: (r) => r.reserveId,
    columns: [
      { key: 'title', header: 'Đầu sách', render: (r) => <Link to={`/titles/${r.isbn}`}>{r.title}</Link> },
      { key: 'reserveDate', header: 'Ngày đặt', render: (r) => <span className="mono">{formatDateTime(r.reserveDate)}</span> },
      { key: 'expireDate', header: 'Hết hạn', render: (r) => <span className="mono">{formatDate(r.expireDate)}</span> },
      { key: 'status', header: 'Trạng thái', render: (r) => <StatusBadge map={RESERVATION_STATUS} value={r.status} /> },
    ],
  },
  fines: {
    rowKey: (r) => r.fineId,
    columns: [
      { key: 'fineId', header: 'Biên lai', render: (r) => <span className="code-id">{r.fineId}</span> },
      { key: 'fineType', header: 'Vi phạm', render: (r) => <StatusBadge map={FINE_TYPE} value={r.fineType} /> },
      { key: 'reason', header: 'Nội dung' },
      { key: 'amount', header: 'Số tiền', className: 'right', render: (r) => <span className="num">{formatMoney(r.amount)}</span> },
      { key: 'isPaid', header: 'Trạng thái', render: (r) => <StatusBadge map={PAID_STATUS} value={r.isPaid} /> },
    ],
  },
};

function CardInfo({ reader }) {
  return (
    <section className="card">
      <div className="card-title">
        Thẻ thư viện <StatusBadge map={CARD_STATUS} value={reader.cardStatus} />
      </div>
      <dl className="kv">
        <dt>Mã thẻ</dt>
        <dd className="code-id">{reader.readerId}</dd>
        <dt>Mã SV/GV</dt>
        <dd className="mono">{reader.studentCode || '—'}</dd>
        <dt>CCCD</dt>
        <dd className="mono">{reader.identityNumber || '—'}</dd>
        <dt>Tài khoản</dt>
        <dd className="mono">{reader.username}</dd>
        <dt>Cấp ngày</dt>
        <dd className="mono">{formatDate(reader.cardIssuedDate)}</dd>
        <dt>Hết hạn</dt>
        <dd className="mono">{formatDate(reader.cardExpiryDate)}</dd>
      </dl>
    </section>
  );
}

function PrintableCard({ reader }) {
  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, maxWidth: 340, margin: '0 auto' }}>
      <div className="row" style={{ marginBottom: 8 }}>
        <img src="/logo.svg" alt="" width="28" height="28" />
        <strong>THẺ THƯ VIỆN</strong>
      </div>
      <div style={{ fontWeight: 600, fontSize: 16 }}>{reader.fullName}</div>
      <div className="muted">
        {READER_TYPE[reader.readerType]?.label} · {reader.studentCode || reader.email}
      </div>
      <div style={{ textAlign: 'center', margin: '10px 0 4px' }}>
        <Barcode value={reader.readerId} height={44} />
      </div>
      <div className="mono" style={{ fontSize: 12 }}>
        Hạn dùng: {formatDate(reader.cardExpiryDate)}
      </div>
    </div>
  );
}

export default function ReaderDetailPage() {
  const page = useReaderDetail();
  const { reader, locked, action } = page;

  if (page.error) return <ErrorNotice error={page.error} onRetry={page.reload} />;
  if (page.loading) return <LoadingBlock />;
  const table = TABLES[page.tab];

  return (
    <>
      <PageHeader
        marker={<Link to="/readers">độc giả</Link>}
        title={reader.fullName}
        description={`${READER_TYPE[reader.readerType]?.label} · ${reader.email}${reader.phone ? ` · ${reader.phone}` : ''}`}
        actions={
          <>
            <button type="button" className="btn" onClick={page.openEdit}>
              <FiEdit2 /> Sửa
            </button>
            <button type="button" className="btn" onClick={page.openPrint}>
              <FiPrinter /> In thẻ
            </button>
          </>
        }
      />
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <CardInfo reader={reader} />
        <section className="card stack">
          <div className="stats" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            <div className="stat tone-6">
              <div className="stat-label">Đang mượn</div>
              <div className="stat-value">
                {reader.borrowingCount}/{reader.maxBorrowLimit}
              </div>
            </div>
            <div className="stat tone-3">
              <div className="stat-label">Nợ phạt</div>
              <div className="stat-value" style={{ fontSize: 20 }}>
                {formatMoney(reader.unpaidFineTotal)}
              </div>
            </div>
          </div>
          <div className="row">
            <button type="button" className={`btn ${locked ? '' : 'btn-danger'}`} onClick={() => page.askAction('lock')}>
              {locked ? <FiUnlock /> : <FiLock />} {locked ? 'Mở khoá thẻ' : 'Khoá thẻ'}
            </button>
            <button type="button" className="btn" onClick={() => page.askAction('renew')}>
              <FiRefreshCw /> Gia hạn thẻ
            </button>
            <button type="button" className="btn" onClick={() => page.askAction('reset')}>
              <FiKey /> Cấp lại mật khẩu
            </button>
          </div>
        </section>
      </div>

      <div className="tabs" role="tablist" style={{ marginBottom: 12 }}>
        {READER_TABS.map((t) => (
          <button key={t.key} type="button" role="tab" className="tab" aria-selected={page.tab === t.key} onClick={() => page.setTab(t.key)}>
            {t.label} <span className="mono muted">{reader[t.key].length}</span>
          </button>
        ))}
      </div>
      <section className="card card-flush">
        <DataTable
          columns={table.columns}
          rows={reader[page.tab]}
          rowKey={table.rowKey}
          onRowClick={page.tab === 'loans' ? page.openLoan : undefined}
          empty="Chưa có dữ liệu"
        />
      </section>

      <ReaderFormModal open={page.editing} reader={reader} onClose={page.closeEdit} onSaved={page.onEdited} />
      <ConfirmModal open={!!action} title={action?.title} message={action?.message} danger={action?.danger} onConfirm={page.runAction} onClose={page.closeAction} />
      <CredentialsModal credentials={page.credentials} onClose={page.closeCredentials} />
      <LoanDetailModal loanId={page.loanId} onClose={page.closeLoan} onChanged={page.reload} />
      <PrintModal open={page.printing} title="In thẻ thư viện" onClose={page.closePrint} width={420}>
        <PrintableCard reader={reader} />
      </PrintModal>
    </>
  );
}
