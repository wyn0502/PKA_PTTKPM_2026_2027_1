// Dung Pham Anh: Khối thông tin độc giả tại quầy: thẻ, hạn mức còn lại, lý do bị chặn, sách đặt trước đã về
import { Link } from 'react-router-dom';
import StatusBadge from '../ui/StatusBadge.jsx';
import { CARD_STATUS, READER_TYPE } from '../../utils/labels.js';
import { formatDate, formatMoney } from '../../utils/format.js';

export default function ReaderSummary({ info }) {
  const { reader, blockers, remaining, dueDate, readyReservations } = info;
  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="row-between">
        <div>
          <Link to={`/readers/${reader.readerId}`} style={{ fontWeight: 600, fontSize: 16 }}>
            {reader.fullName}
          </Link>
          <div className="muted">
            <span className="code-id">{reader.readerId}</span> · {READER_TYPE[reader.readerType]?.label}
            {reader.studentCode && <> · {reader.studentCode}</>}
          </div>
        </div>
        <StatusBadge map={CARD_STATUS} value={reader.cardStatus} />
      </div>
      <dl className="kv">
        <dt>Đang mượn</dt>
        <dd className="mono">
          {reader.borrowingCount}/{reader.maxBorrowLimit} · còn được mượn {remaining}
        </dd>
        <dt>Hạn trả nếu mượn hôm nay</dt>
        <dd className="mono">{formatDate(dueDate)}</dd>
        <dt>Hạn thẻ</dt>
        <dd className="mono">{formatDate(reader.cardExpiryDate)}</dd>
        <dt>Nợ phạt</dt>
        <dd className="mono">{formatMoney(reader.unpaidFineTotal)}</dd>
      </dl>
      {blockers.length > 0 && (
        <div className="alert tone-3" role="alert">
          <strong>Không thể lập phiếu mượn:</strong>
          <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
            {blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      )}
      {readyReservations.length > 0 && (
        <div className="alert tone-7">
          <strong>Sách đặt trước đã về:</strong>{' '}
          {readyReservations.map((r) => (
            <span key={r.reserveId}>
              {r.title} (<span className="mono">{r.barcode}</span>){' '}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
