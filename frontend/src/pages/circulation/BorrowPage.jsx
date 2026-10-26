// Dung Pham Anh: Màn hình lập phiếu mượn (UC-07): quét thẻ, quét các bản sao, hoàn tất và in phiếu trên một màn hình
import { FiTrash2, FiCheck, FiRefreshCw } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader.jsx';
import ScanInput from '../../components/ui/ScanInput.jsx';
import ReaderSummary from '../../components/circulation/ReaderSummary.jsx';
import PrintModal from '../../components/circulation/PrintModal.jsx';
import { LoanReceipt } from '../../components/circulation/Receipts.jsx';
import { useBorrow } from './useBorrow.js';

function CartList({ cart, onRemove }) {
  if (!cart.length) {
    return (
      <p className="muted" style={{ margin: 0 }}>
        Chưa có bản sao nào.
      </p>
    );
  }
  return (
    <ul className="list-plain scan-list">
      {cart.map((c) => (
        <li key={c.barcode}>
          <div style={{ minWidth: 0 }}>
            <div>{c.title}</div>
            <small className="muted">
              <span className="code-id">{c.barcode}</span> · {c.shelfLocation || 'Chưa xếp kệ'}
            </small>
          </div>
          <button type="button" className="btn btn-ghost btn-icon" aria-label={`Bỏ ${c.barcode}`} onClick={() => onRemove(c.barcode)}>
            <FiTrash2 />
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function BorrowPage() {
  const borrow = useBorrow();
  const { info, cart } = borrow;

  return (
    <>
      <PageHeader marker="UC-07" title="Lập phiếu mượn" description="Quét thẻ độc giả, quét lần lượt mã cá biệt các bản sao rồi bấm Hoàn tất." />
      <div className="grid-2">
        <section className="card stack">
          <div className="card-title" style={{ margin: 0 }}>
            <span>
              <span className="marker">01</span> Thẻ độc giả
            </span>
            {info && (
              <button type="button" className="btn btn-sm btn-ghost" onClick={borrow.reset}>
                <FiRefreshCw /> Đổi độc giả
              </button>
            )}
          </div>
          <ScanInput ref={borrow.readerInput} placeholder="Quét hoặc nhập mã thẻ / mã SV" buttonLabel="Kiểm tra" onSubmit={borrow.scanReader} />
          {info && <ReaderSummary info={info} />}
        </section>

        <section className="card stack">
          <div className="card-title" style={{ margin: 0 }}>
            <span>
              <span className="marker">02</span> Bản sao mượn
            </span>
            <span className="mono muted">
              {cart.length}/{info?.remaining ?? 0}
            </span>
          </div>
          <ScanInput
            ref={borrow.copyInput}
            placeholder="Quét mã cá biệt bản sao"
            disabled={!borrow.canScanCopies || borrow.limitReached}
            onSubmit={borrow.scanCopy}
          />
          {borrow.limitReached && cart.length > 0 && <div className="alert tone-1">Độc giả đã đạt số lượng mượn tối đa.</div>}
          <CartList cart={cart} onRemove={borrow.removeCopy} />
          <button type="button" className="btn btn-primary" style={{ minHeight: 44 }} disabled={!borrow.canComplete} onClick={borrow.complete}>
            <FiCheck /> {borrow.busy ? 'Đang lưu…' : `Hoàn tất mượn (${cart.length})`}
          </button>
        </section>
      </div>

      <PrintModal open={!!borrow.receipt} title="Phiếu mượn" onClose={borrow.closeReceipt}>
        {borrow.receipt && <LoanReceipt loan={borrow.receipt} />}
      </PrintModal>
    </>
  );
}
