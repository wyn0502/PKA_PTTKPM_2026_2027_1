// Dung Pham Anh: Màn hình thể loại phân cấp và nhà xuất bản (FR-03): hai tab bảng, biểu mẫu thêm/sửa, xác nhận xoá
import { FiPlus } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Field from '../../components/ui/Field.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import { useCatalog, ENTITIES } from './useCatalog.js';

function CategoryFields({ value, categories, set }) {
  return (
    <div className="stack">
      <Field label="Tên thể loại *">
        <input className="input" required maxLength={100} value={value.categoryName} onChange={set('categoryName')} />
      </Field>
      <Field label="Thể loại cha" hint="Để trống nếu là thể loại gốc">
        <select className="select" value={value.parentId || ''} onChange={set('parentId')}>
          <option value="">— Không có —</option>
          {categories
            .filter((c) => !c.parentId && c.categoryId !== value.categoryId)
            .map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.categoryName}
              </option>
            ))}
        </select>
      </Field>
      <Field label="Mô tả">
        <input className="input" maxLength={255} value={value.description || ''} onChange={set('description')} />
      </Field>
    </div>
  );
}

function PublisherFields({ value, set }) {
  return (
    <div className="stack">
      <Field label="Tên nhà xuất bản *">
        <input className="input" required maxLength={150} value={value.publisherName} onChange={set('publisherName')} />
      </Field>
      <Field label="Địa chỉ">
        <input className="input" maxLength={250} value={value.address || ''} onChange={set('address')} />
      </Field>
      <div className="grid-2">
        <Field label="Email liên hệ">
          <input className="input" type="email" maxLength={100} value={value.contactEmail || ''} onChange={set('contactEmail')} />
        </Field>
        <Field label="Điện thoại">
          <input className="input" maxLength={20} value={value.phone || ''} onChange={set('phone')} />
        </Field>
      </div>
    </div>
  );
}

const actionsColumn = ({ onEdit, onDelete }) => ({
  key: 'actions',
  header: '',
  className: 'actions',
  render: (row) => (
    <div className="row" style={{ justifyContent: 'flex-end' }}>
      <button type="button" className="btn btn-sm" onClick={() => onEdit(row)}>
        Sửa
      </button>
      <button type="button" className="btn btn-sm btn-danger" disabled={row.titleCount > 0} onClick={() => onDelete(row)}>
        Xoá
      </button>
    </div>
  ),
});

const COLUMNS = {
  category: [
    { key: 'categoryId', header: 'Mã', render: (r) => <span className="code-id">{r.categoryId}</span> },
    { key: 'categoryName', header: 'Tên thể loại', render: (r) => (r.parentId ? <span style={{ paddingLeft: 18 }}>↳ {r.categoryName}</span> : <strong>{r.categoryName}</strong>) },
    { key: 'description', header: 'Mô tả', render: (r) => r.description || '—' },
    { key: 'titleCount', header: 'Đầu sách', className: 'right', render: (r) => <span className="num">{r.titleCount}</span> },
  ],
  publisher: [
    { key: 'publisherId', header: 'Mã', render: (r) => <span className="code-id">{r.publisherId}</span> },
    { key: 'publisherName', header: 'Tên nhà xuất bản' },
    { key: 'contact', header: 'Liên hệ', render: (r) => [r.contactEmail, r.phone].filter(Boolean).join(' · ') || '—' },
    { key: 'titleCount', header: 'Đầu sách', className: 'right', render: (r) => <span className="num">{r.titleCount}</span> },
  ],
};

export default function CatalogPage() {
  const page = useCatalog();
  const { entity, editing, deleting } = page;
  const capitalize = (text) => text[0].toUpperCase() + text.slice(1);

  return (
    <>
      <PageHeader
        marker="FR-03"
        title="Thể loại & nhà xuất bản"
        actions={
          <button type="button" className="btn btn-primary" onClick={page.startCreate}>
            <FiPlus /> Thêm {entity.label}
          </button>
        }
      />
      <div className="tabs" role="tablist" style={{ marginBottom: 14 }}>
        {Object.entries(ENTITIES).map(([key, e]) => (
          <button key={key} type="button" role="tab" className="tab" aria-selected={page.tab === key} onClick={() => page.selectTab(key)}>
            {capitalize(e.label)}
          </button>
        ))}
      </div>
      <section className="card card-flush">
        <DataTable
          columns={[...COLUMNS[page.tab], actionsColumn({ onEdit: page.setEditing, onDelete: page.askDelete })]}
          rows={page.rows}
          rowKey={(r) => r[entity.idKey]}
        />
      </section>

      <Modal
        open={!!editing}
        title={`${editing?.[entity.idKey] ? 'Sửa' : 'Thêm'} ${entity.label}`}
        onClose={page.closeEdit}
        footer={
          <>
            <button type="button" className="btn" onClick={page.closeEdit}>
              Huỷ bỏ
            </button>
            <button type="submit" form="entity-form" className="btn btn-primary" disabled={page.saving}>
              Lưu
            </button>
          </>
        }
      >
        {editing && (
          <form id="entity-form" onSubmit={page.submit}>
            {page.tab === 'category' ? <CategoryFields value={editing} categories={page.categories} set={page.editField} /> : <PublisherFields value={editing} set={page.editField} />}
          </form>
        )}
      </Modal>
      <ConfirmModal
        open={!!deleting}
        title={`Xoá ${entity.label}`}
        message={deleting && `Xoá “${deleting[entity.nameKey]}”?`}
        confirmLabel="Xoá"
        danger
        onConfirm={page.remove}
        onClose={page.closeDelete}
      />
    </>
  );
}
