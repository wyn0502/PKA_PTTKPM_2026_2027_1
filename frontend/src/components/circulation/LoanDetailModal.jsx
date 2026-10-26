// Dung Pham Anh: Hộp thoại chi tiết phiếu mượn: bản sao, tình trạng trả, phí phạt, nút gia hạn và in phiếu
import { Link } from 'react-router-dom';
import { FiPrinter, FiClock } from 'react-icons/fi';
import Modal from '../ui/Modal.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import LoadingBlock from '../ui/LoadingBlock.jsx';
import PrintModal from './PrintModal.jsx';
import { LoanReceipt } from './Receipts.jsx';
import { useLoanDetail } from './useLoanDetail.js';
import { formatDate, formatDateTime, formatMoney } from '../../utils/format.js';
import { CONDITION, FINE_TYPE, LOAN_STATUS, PAID_STATUS } from '../../utils/labels.js';
import { loanStatusOf } from '../../utils/domain.js';

export default function LoanDetailModal({ loanId, onClose, onChanged }) {
  const detail = useLoanDetail(loanId, onChanged);
  const { loan } = detail;

  return (
    <>
      <Modal
        open={!!loanId}
        title={`Phiếu mượn ${loanId || ''}`}
        onClose={onClose}
        width={720}
        footer={
          loan && (
            <>
              <button type="button" className="btn" onClick={detail.openPrint}>
                <FiPrinter /> In phiếu
              </button>
              {detail.canRenew && (
                <button type="button" className="btn btn-primary" onClick={detail.renew} disabled={detail.renewing}>
                  <FiClock /> Gia hạn
                </button>
              )}
            </>
          )
        }
      >
        {detail.loading ? (
          <LoadingBlock />
        ) : (
          <div className="stack">
            <div className="row-between">
              <div>
                <Link to={`/readers/${loan.readerId}`} style={{ fontWeight: 600 }}>
                  {loan.readerName}
                </Link>{' '}
                <span className="code-id">{loan.readerId}</span>
              </div>
              <StatusBadge map={LOAN_STATUS} value={loanStatusOf(loan)} />
            </div>
            <dl className="kv">
              <dt>Ngày mượn</dt>
              <dd className="mono">{formatDate(loan.createdDate)}</dd>
              <dt>Hạn trả</dt>
              <dd className="mono">{formatDate(loan.dueDate)}</dd>
              <dt>Ngày trả</dt>
              <dd className="mono">{formatDate(loan.actualReturnDate)}</dd>
              <dt>Số lần gia hạn</dt>
              <dd className="mono">{loan.renewCount}</dd>
              <dt>Thủ thư lập</dt>
              <dd>{loan.staffName}</dd>
            </dl>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mã cá biệt</th>
                    <th>Nhan đề</th>
                    <th>Trả lúc</th>
                    <th>Tình trạng</th>
                  </tr>
                </thead>
                <tbody>
                  {loan.items.map((item) => (
                    <tr key={item.barcode}>
                      <td className="code-id">{item.barcode}</td>
                      <td>{item.title}</td>
                      <td className="mono">{item.returnedAt ? formatDateTime(item.returnedAt) : 'Chưa trả'}</td>
                      <td>{item.returnCondition ? <StatusBadge map={CONDITION} value={item.returnCondition} /> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {loan.fines.length > 0 && (
              <ul className="list-plain scan-list">
                {loan.fines.map((f) => (
                  <li key={f.fineId}>
                    <span>
                      <StatusBadge map={FINE_TYPE} value={f.fineType} /> {f.reason}
                    </span>
                    <span className="row">
                      <span className="mono">{formatMoney(f.amount)}</span>
                      <StatusBadge map={PAID_STATUS} value={f.isPaid} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Modal>
      <PrintModal open={detail.printing} title="Phiếu mượn" onClose={detail.closePrint}>
        {loan && <LoanReceipt loan={loan} />}
      </PrintModal>
    </>
  );
}
