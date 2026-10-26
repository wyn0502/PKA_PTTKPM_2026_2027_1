// Dung Pham Anh: Hộp thoại tính và thu phí phạt (UC-10): danh sách khoản phạt, thu tiền ngay, ghi nợ hoặc huỷ
import Modal from '../ui/Modal.jsx';
import Field from '../ui/Field.jsx';
import { useFineForm } from './useFineForm.js';
import { FINE_TYPE, toOptions } from '../../utils/labels.js';
import { formatMoney } from '../../utils/format.js';

export default function FineFormModal({ open, context, onClose, onCreated }) {
  const form = useFineForm({ open, context, onCreated });

  return (
    <Modal
      open={open}
      title="Tính và thu phí phạt"
      onClose={onClose}
      width={600}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose} disabled={form.busy}>
            Huỷ bỏ
          </button>
          <button type="button" className="btn" onClick={form.recordDebt} disabled={!form.canSubmit}>
            Ghi nhận nợ
          </button>
          <button type="button" className="btn btn-primary" onClick={form.collectNow} disabled={!form.canSubmit}>
            Thu tiền ngay · {formatMoney(form.total)}
          </button>
        </>
      }
    >
      <div className="stack">
        {context?.readerName && (
          <div className="alert tone-1">
            Độc giả <strong>{context.readerName}</strong> · phiếu <span className="mono">{context.loanId}</span>
            {context.barcode && (
              <>
                {' '}
                · bản sao <span className="mono">{context.barcode}</span>
              </>
            )}
          </div>
        )}
        {form.isManual && (
          <div className="grid-3">
            <Field label="Mã phiếu mượn">
              <input className="input mono" value={form.manual.loanId} onChange={form.setManualField('loanId')} />
            </Field>
            <Field label="Mã cá biệt (tuỳ chọn)">
              <input className="input mono" value={form.manual.barcode} onChange={form.setManualField('barcode')} />
            </Field>
            <Field label="Loại vi phạm">
              <select className="select" value={form.manual.fineType} onChange={form.setManualField('fineType')}>
                {toOptions(FINE_TYPE).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <div>
              <button type="button" className="btn" onClick={form.suggest} disabled={!form.canSuggest}>
                Tính theo quy định
              </button>
            </div>
          </div>
        )}
        {form.drafts.map((d, i) => (
          <div key={`${d.fineType}-${i}`} className="card stack" style={{ padding: 14, gap: 10 }}>
            <label className="checkbox">
              <input type="checkbox" checked={d.selected} onChange={(e) => form.updateDraft(i, { selected: e.target.checked })} />
              <strong>{FINE_TYPE[d.fineType]?.label}</strong>
            </label>
            <div className="grid-2">
              <Field label="Số tiền (đ)">
                <input className="input mono" type="number" min={1000} step={1000} value={d.amount} onChange={(e) => form.updateDraft(i, { amount: e.target.value })} />
              </Field>
              <Field label="Nội dung">
                <input className="input" value={d.reason} onChange={(e) => form.updateDraft(i, { reason: e.target.value })} />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
