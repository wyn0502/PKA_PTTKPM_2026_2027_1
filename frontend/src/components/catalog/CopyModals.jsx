// Dung Pham Anh: Hộp thoại bản sao (UC-04): thêm hàng loạt, sửa vị trí/tình trạng/trạng thái, in tem mã vạch
import Modal from '../ui/Modal.jsx';
import Field from '../ui/Field.jsx';
import Barcode from '../ui/Barcode.jsx';
import PrintModal from '../circulation/PrintModal.jsx';
import { useAddCopies, useEditCopy } from './useCopyForms.js';
import { CONDITION, COPY_STATUS } from '../../utils/labels.js';

const CONDITIONS = ['Good', 'Worn', 'Damaged'];

function ConditionSelect({ value, onChange }) {
  return (
    <select className="select" value={value} onChange={onChange}>
      {CONDITIONS.map((c) => (
        <option key={c} value={c}>
          {CONDITION[c].label}
        </option>
      ))}
    </select>
  );
}

function SaveFooter({ onClose, onSave, disabled, label }) {
  return (
    <>
      <button type="button" className="btn" onClick={onClose}>
        Huỷ bỏ
      </button>
      <button type="button" className="btn btn-primary" disabled={disabled} onClick={onSave}>
        {label}
      </button>
    </>
  );
}

export function AddCopiesModal({ open, isbn, onClose, onAdded }) {
  const form = useAddCopies({ open, isbn, onAdded });
  const { values, field } = form;
  return (
    <Modal
      open={open}
      title="Thêm bản sao"
      onClose={onClose}
      width={480}
      footer={<SaveFooter onClose={onClose} onSave={form.submit} disabled={!form.canSubmit} label={form.busy ? 'Đang tạo…' : `Tạo ${values.quantity} bản sao`} />}
    >
      <div className="stack">
        <Field label="Số lượng" hint="Mã cá biệt được sinh tự động, duy nhất cho từng cuốn">
          <input className="input mono" type="number" min={1} max={200} value={values.quantity} onChange={field('quantity')} />
        </Field>
        <Field label="Vị trí kệ">
          <input className="input" maxLength={50} value={values.shelfLocation} onChange={field('shelfLocation')} />
        </Field>
        <Field label="Tình trạng vật lý">
          <ConditionSelect value={values.physicalCondition} onChange={field('physicalCondition')} />
        </Field>
      </div>
    </Modal>
  );
}

export function EditCopyModal({ copy, onClose, onSaved }) {
  const form = useEditCopy({ copy, onSaved });
  const { values, field, transitions } = form;
  return (
    <Modal
      open={!!copy}
      title={`Bản sao ${copy?.barcode || ''}`}
      onClose={onClose}
      width={480}
      footer={<SaveFooter onClose={onClose} onSave={form.submit} disabled={form.busy} label={form.busy ? 'Đang lưu…' : 'Lưu'} />}
    >
      {copy && (
        <div className="stack">
          <Field label="Vị trí kệ">
            <input className="input" maxLength={50} value={values.shelfLocation} onChange={field('shelfLocation')} />
          </Field>
          <Field label="Tình trạng vật lý">
            <ConditionSelect value={values.physicalCondition} onChange={field('physicalCondition')} />
          </Field>
          <Field
            label={`Chuyển trạng thái (hiện tại: ${COPY_STATUS[copy.loanStatus]?.label})`}
            hint={transitions.length ? 'Theo bảng chuyển trạng thái của bản sao' : 'Bản sao đang lưu thông – xử lý qua mượn/trả'}
          >
            <select className="select" value={values.status} disabled={!transitions.length} onChange={field('status')}>
              <option value="">Giữ nguyên</option>
              {transitions.map((s) => (
                <option key={s} value={s}>
                  {COPY_STATUS[s].label}
                </option>
              ))}
            </select>
          </Field>
          {values.status && (
            <Field label="Ghi chú">
              <input className="input" maxLength={255} value={values.note} onChange={field('note')} />
            </Field>
          )}
        </div>
      )}
    </Modal>
  );
}

export function LabelsModal({ open, title, barcodes, onClose }) {
  return (
    <PrintModal open={open} title="In tem mã vạch" onClose={onClose} width={760}>
      <div className="barcode-sheet">
        {barcodes.map((code) => (
          <div key={code} className="barcode-label">
            <Barcode value={code} height={40} />
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
          </div>
        ))}
      </div>
    </PrintModal>
  );
}
