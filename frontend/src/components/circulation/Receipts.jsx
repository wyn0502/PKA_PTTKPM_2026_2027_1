// Dung Pham Anh: Nội dung phiếu mượn và biên lai thu tiền phạt để in tại quầy
import { formatDate, formatDateTime, formatMoney } from '../../utils/format.js';
import { FINE_TYPE } from '../../utils/labels.js';

function ReceiptHeader({ title, code }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 12 }}>
      <img src="/logo.svg" alt="" width="36" height="36" />
      <div style={{ fontWeight: 700 }}>QUẢN LÝ THƯ VIỆN</div>
      <div style={{ fontSize: 16, fontWeight: 700, marginTop: 6 }}>{title}</div>
      <div className="mono">Số: {code}</div>
    </div>
  );
}

export function LoanReceipt({ loan }) {
  return (
    <div>
      <ReceiptHeader title="PHIẾU MƯỢN TÀI LIỆU" code={loan.loanId} />
      <dl className="kv">
        <dt>Độc giả</dt>
        <dd>
          {loan.readerName} (<span className="mono">{loan.readerId}</span>)
        </dd>
        <dt>Ngày mượn</dt>
        <dd className="mono">{formatDate(loan.createdDate)}</dd>
        <dt>Hạn trả</dt>
        <dd className="mono" style={{ fontWeight: 700 }}>
          {formatDate(loan.dueDate)}
        </dd>
        <dt>Thủ thư</dt>
        <dd>{loan.staffName}</dd>
      </dl>
      <table className="table" style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Mã cá biệt</th>
            <th>Nhan đề</th>
          </tr>
        </thead>
        <tbody>
          {loan.items.map((item, i) => (
            <tr key={item.barcode}>
              <td className="mono">{i + 1}</td>
              <td className="mono">{item.barcode}</td>
              <td>{item.title}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted" style={{ fontSize: 12 }}>
        Vui lòng trả sách đúng hạn. Trả trễ sẽ bị tính phí theo quy định của thư viện.
      </p>
    </div>
  );
}

export function FineReceipt({ fines }) {
  const total = fines.reduce((sum, f) => sum + f.amount, 0);
  const first = fines[0];
  return (
    <div>
      <ReceiptHeader title="BIÊN LAI THU TIỀN PHẠT" code={fines.map((f) => f.fineId).join(', ')} />
      <dl className="kv">
        <dt>Độc giả</dt>
        <dd>
          {first.readerName} (<span className="mono">{first.readerId}</span>)
        </dd>
        <dt>Phiếu mượn</dt>
        <dd className="mono">{first.loanId}</dd>
        <dt>Thời gian</dt>
        <dd className="mono">{formatDateTime(first.paidAt || first.createdAt)}</dd>
      </dl>
      <table className="table" style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>Vi phạm</th>
            <th>Nội dung</th>
            <th className="right">Số tiền</th>
          </tr>
        </thead>
        <tbody>
          {fines.map((f) => (
            <tr key={f.fineId}>
              <td>{FINE_TYPE[f.fineType]?.label}</td>
              <td>{f.reason}</td>
              <td className="right mono">{formatMoney(f.amount)}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={2} style={{ fontWeight: 700 }}>
              Tổng cộng
            </td>
            <td className="right mono" style={{ fontWeight: 700 }}>
              {formatMoney(total)}
            </td>
          </tr>
        </tbody>
      </table>
      <p className="muted" style={{ fontSize: 12 }}>
        Trạng thái: {fines.every((f) => f.isPaid) ? 'Đã thanh toán' : 'Ghi nợ – độc giả cần thanh toán trước lần mượn tiếp theo'}
        {first.collectorName ? ` · Thủ thư: ${first.collectorName}` : ''}
      </p>
    </div>
  );
}
