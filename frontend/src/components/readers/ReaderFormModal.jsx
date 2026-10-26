// Dung Pham Anh: Hộp thoại thêm/sửa hồ sơ độc giả (UC-02): định danh, loại thẻ, hạn mức mượn
import Modal from '../ui/Modal.jsx';
import Field from '../ui/Field.jsx';
import { useReaderForm } from './useReaderForm.js';
import { READER_TYPE, toOptions } from '../../utils/labels.js';

export default function ReaderFormModal({ open, reader, onClose, onSaved }) {
  const form = useReaderForm({ open, reader, onSaved });
  const { values, field } = form;

  return (
    <Modal
      open={open}
      title={form.isEdit ? 'Sửa hồ sơ độc giả' : 'Thêm độc giả'}
      onClose={onClose}
      width={620}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Huỷ bỏ
          </button>
          <button type="submit" form="reader-form" className="btn btn-primary" disabled={form.busy}>
            {form.busy ? 'Đang lưu…' : 'Lưu'}
          </button>
        </>
      }
    >
      <form id="reader-form" className="stack" onSubmit={form.submit}>
        <Field label="Họ tên *">
          <input className="input" required maxLength={100} value={values.fullName} onChange={field('fullName')} />
        </Field>
        <div className="grid-2">
          <Field label="Email *">
            <input className="input" type="email" required maxLength={100} value={values.email} onChange={field('email')} />
          </Field>
          <Field label="Số điện thoại">
            <input className="input" maxLength={20} value={values.phone} onChange={field('phone')} />
          </Field>
          <Field label="Mã SV/GV" hint="Dùng làm tên đăng nhập; để trống sẽ dùng email">
            <input className="input mono" maxLength={30} value={values.studentCode} onChange={field('studentCode')} />
          </Field>
          <Field label="CCCD">
            <input className="input mono" maxLength={20} inputMode="numeric" value={values.identityNumber} onChange={field('identityNumber')} />
          </Field>
          <Field label="Loại thẻ">
            <select className="select" value={values.readerType} onChange={field('readerType')}>
              {toOptions(READER_TYPE).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Hạn mức mượn" hint="Để trống = theo tham số của loại thẻ">
            <input className="input mono" type="number" min={0} max={50} value={values.maxBorrowLimit} onChange={field('maxBorrowLimit')} />
          </Field>
        </div>
      </form>
    </Modal>
  );
}
