// Dung Pham Anh: Màn hình ghi nhận trả (UC-08): quét bản sao, đánh dấu hư hỏng, báo mất, danh sách đã xử lý trong phiên
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader.jsx';
import ScanInput from '../../components/ui/ScanInput.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import FineFormModal from '../../components/circulation/FineFormModal.jsx';
import PrintModal from '../../components/circulation/PrintModal.jsx';
import { FineReceipt } from '../../components/circulation/Receipts.jsx';
import { useReturn } from './useReturn.js';
import { formatDate } from '../../utils/format.js';
import { CONDITION } from '../../utils/labels.js';

function SessionResults({ results }) {
  if (!results.length) {
    return (
      <p className="muted" style={{ margin: 0 }}>
        Chưa có lượt trả nào.
      </p>
    );
  }
  return (
    <ul className="list-plain scan-list">
      {results.map((r) => (
        <li key={`${r.loanId}-${r.barcode}`}>
          <div style={{ minWidth: 0 }}>
            <div>{r.title}</div>
            <small className="muted">
              <span className="code-id">{r.barcode}</span> · <Link to={`/readers/${r.readerId}`}>{r.readerName}</Link> · hạn{' '}
              <span className="mono">{formatDate(r.dueDate)}</span>
              {r.overdueDays > 0 && <span className="num-alert"> · trễ {r.overdueDays} ngày</span>}
              {r.loanClosed && ' · đã đóng phiếu'}
            </small>
          </div>
          <StatusBadge map={CONDITION} value={r.condition} />
        </li>
      ))}
    </ul>
  );
}

export default function ReturnPage() {
  const ret = useReturn();

  return (
    <>
      <PageHeader marker="UC-08" title="Ghi nhận trả sách" description="Quét mã cá biệt bản sao độc giả mang trả. Hệ thống tự đối chiếu hạn trả và hàng đợi đặt trước." />
      <div className="grid-2">
        <section className="card stack">
          <div className="card-title" style={{ margin: 0 }}>
            Quét bản sao trả
          </div>
          <label className="checkbox">
            <input type="checkbox" checked={ret.damaged} onChange={ret.toggleDamaged} />
            Bản sao bị rách/hư hỏng (chuyển sang “Đang sửa chữa”)
          </label>
          <ScanInput ref={ret.inputRef} placeholder="Quét mã cá biệt" buttonLabel="Xác nhận trả" onSubmit={ret.returnCopy} />
          <hr className="rule-ramp" style={{ opacity: 0.4 }} />
          <div className="card-title" style={{ margin: 0 }}>
            Độc giả báo mất sách
          </div>
          <div className="input-group">
            <input className="input mono" placeholder="Mã cá biệt bản sao bị mất" value={ret.lostCode} onChange={ret.changeLostCode} />
            <button type="button" className="btn btn-danger" disabled={!ret.lostCode.trim()} onClick={ret.openConfirmLost}>
              Báo mất
            </button>
          </div>
        </section>

        <section className="card stack">
          <div className="card-title" style={{ margin: 0 }}>
            Đã xử lý trong phiên <span className="mono muted">{ret.results.length}</span>
          </div>
          <SessionResults results={ret.results} />
        </section>
      </div>

      <FineFormModal open={!!ret.fineContext} context={ret.fineContext} onClose={ret.skipFines} onCreated={ret.finishFines} />
      <PrintModal open={!!ret.receipt} title="Biên lai phạt" onClose={ret.closeReceipt}>
        {ret.receipt && <FineReceipt fines={ret.receipt} />}
      </PrintModal>
      <ConfirmModal
        open={ret.confirmLost}
        title="Xác nhận báo mất"
        message={`Ghi nhận bản sao ${ret.lostCode} bị mất? Bản sao chuyển sang trạng thái “Mất” và hệ thống gợi ý phí bồi thường.`}
        confirmLabel="Báo mất"
        danger
        onConfirm={ret.reportLost}
        onClose={ret.closeConfirmLost}
      />
    </>
  );
}
