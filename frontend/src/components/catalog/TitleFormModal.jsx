// Dung Pham Anh: Hộp thoại thêm/sửa đầu sách (UC-03), tuỳ chọn tạo bản sao ban đầu
import Modal from '../ui/Modal.jsx';
import Field from '../ui/Field.jsx';
import { useTitleForm } from './useTitleForm.js';
import { categoryLabel } from '../../hooks/useCatalogOptions.js';

export default function TitleFormModal({ open, title, onClose, onSaved }) {
  const form = useTitleForm({ open, title, onSaved });
  const { values, field } = form;

  return (
    <Modal
      open={open}
      title={form.isEdit ? 'Sửa đầu sách' : 'Thêm đầu sách'}
      onClose={onClose}
      width={680}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Huỷ bỏ
          </button>
          <button type="submit" form="title-form" className="btn btn-primary" disabled={form.busy}>
            {form.busy ? 'Đang lưu…' : 'Lưu'}
          </button>
        </>
      }
    >
      <form id="title-form" className="stack" onSubmit={form.submit}>
        <div className="grid-2">
          <Field label="ISBN *" error={form.isbnError} hint="ISBN-10 hoặc ISBN-13, có thể có dấu gạch">
            <input className="input mono" required disabled={form.isEdit} value={values.isbn} onChange={field('isbn')} />
          </Field>
          <Field label="Năm xuất bản">
            <input className="input mono" type="number" min={1450} max={2100} value={values.publishYear} onChange={field('publishYear')} />
          </Field>
        </div>
        <Field label="Nhan đề *">
          <input className="input" required maxLength={250} value={values.title} onChange={field('title')} />
        </Field>
        <Field label="Tác giả *">
          <input className="input" required maxLength={100} value={values.author} onChange={field('author')} />
        </Field>
        <div className="grid-2">
          <Field label="Thể loại *">
            <select className="select" required value={values.categoryId} onChange={field('categoryId')}>
              <option value="">— Chọn thể loại —</option>
              {form.categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {categoryLabel(c)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nhà xuất bản *">
            <select className="select" required value={values.publisherId} onChange={field('publisherId')}>
              <option value="">— Chọn NXB —</option>
              {form.publishers.map((p) => (
                <option key={p.publisherId} value={p.publisherId}>
                  {p.publisherName}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Tóm tắt">
          <textarea className="textarea" maxLength={2000} value={values.description} onChange={field('description')} />
        </Field>
        {!form.isEdit && (
          <div className="grid-2">
            <Field label="Số bản sao nhập kho" hint="Hệ thống tự sinh mã cá biệt cho từng cuốn">
              <input className="input mono" type="number" min={0} max={200} value={values.initialCopies} onChange={field('initialCopies')} />
            </Field>
            <Field label="Vị trí kệ">
              <input className="input" maxLength={50} placeholder="VD: A1-02" value={values.shelfLocation} onChange={field('shelfLocation')} />
            </Field>
          </div>
        )}
      </form>
    </Modal>
  );
}
