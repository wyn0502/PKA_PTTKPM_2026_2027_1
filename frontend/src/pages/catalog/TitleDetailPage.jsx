// Dung Pham Anh: Màn hình chi tiết đầu sách: thông tin thư mục, bảng bản sao và người đang giữ, các hộp thoại bản sao/in tem
import { Link } from 'react-router-dom';
import { FiEdit2, FiPlus, FiPrinter, FiTrash2 } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import ErrorNotice from '../../components/ui/ErrorNotice.jsx';
import LoadingBlock from '../../components/ui/LoadingBlock.jsx';
import TitleFormModal from '../../components/catalog/TitleFormModal.jsx';
import { AddCopiesModal, EditCopyModal, LabelsModal } from '../../components/catalog/CopyModals.jsx';
import { useTitleDetail } from './useTitleDetail.js';
import { formatDate } from '../../utils/format.js';
import { CONDITION, COPY_STATUS } from '../../utils/labels.js';

const buildColumns = ({ onPrint, onEdit }) => [
  { key: 'barcode', header: 'Mã cá biệt', render: (c) => <span className="code-id">{c.barcode}</span> },
  { key: 'loanStatus', header: 'Trạng thái', render: (c) => <StatusBadge map={COPY_STATUS} value={c.loanStatus} /> },
  { key: 'physicalCondition', header: 'Tình trạng', render: (c) => <StatusBadge map={CONDITION} value={c.physicalCondition} /> },
  { key: 'shelfLocation', header: 'Vị trí kệ', render: (c) => c.shelfLocation || '—' },
  {
    key: 'borrower',
    header: 'Đang ở tay',
    render: (c) =>
      c.borrower ? (
        <>
          <Link to={`/readers/${c.borrower.readerId}`}>{c.borrower.fullName}</Link>{' '}
          <small className="muted mono">hạn {formatDate(c.borrower.dueDate)}</small>
        </>
      ) : (
        '—'
      ),
  },
  {
    key: 'actions',
    header: '',
    className: 'actions',
    render: (c) => (
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-sm" onClick={() => onPrint([c.barcode])} aria-label={`In tem ${c.barcode}`}>
          <FiPrinter />
        </button>
        <button type="button" className="btn btn-sm" onClick={() => onEdit(c)}>
          Sửa
        </button>
      </div>
    ),
  },
];

function TitleStats({ title }) {
  return (
    <div className="stats" style={{ marginBottom: 20 }}>
      <div className="stat tone-1">
        <div className="stat-label">ISBN</div>
        <div className="stat-value" style={{ fontSize: 18 }}>
          {title.isbn}
        </div>
      </div>
      <div className="stat tone-8">
        <div className="stat-label">Khả dụng / tổng</div>
        <div className="stat-value">
          {title.availableCopies}/{title.totalCopies}
        </div>
      </div>
      <div className="stat tone-5">
        <div className="stat-label">Đang chờ đặt trước</div>
        <div className="stat-value">{title.pendingReservations}</div>
      </div>
      <div className="stat tone-6">
        <div className="stat-label">Thể loại</div>
        <div className="stat-value" style={{ fontSize: 16, fontFamily: 'var(--font-sans)' }}>
          {title.categoryName}
        </div>
      </div>
    </div>
  );
}

export default function TitleDetailPage() {
  const page = useTitleDetail();
  const { title } = page;

  if (page.error) return <ErrorNotice error={page.error} onRetry={page.reload} />;
  if (page.loading) return <LoadingBlock />;

  return (
    <>
      <PageHeader
        marker={<Link to="/titles">đầu sách</Link>}
        title={title.title}
        description={`${title.author} · ${title.publisherName}${title.publishYear ? ` · ${title.publishYear}` : ''}`}
        actions={
          <>
            <button type="button" className="btn" onClick={page.openEdit}>
              <FiEdit2 /> Sửa
            </button>
            <button type="button" className="btn btn-danger" onClick={page.askDelete}>
              <FiTrash2 /> Xoá
            </button>
          </>
        }
      />
      <TitleStats title={title} />
      {title.description && <p style={{ maxWidth: '70ch' }}>{title.description}</p>}

      <section className="card card-flush">
        <div className="card-title" style={{ padding: '16px 18px 0' }}>
          Bản sao vật lý
          <span className="row">
            <button type="button" className="btn btn-sm" disabled={!title.copies.length} onClick={page.printAllLabels}>
              <FiPrinter /> In tất cả tem
            </button>
            <button type="button" className="btn btn-sm btn-primary" onClick={page.openAdd}>
              <FiPlus /> Thêm bản sao
            </button>
          </span>
        </div>
        <DataTable
          columns={buildColumns({ onPrint: page.printLabels, onEdit: page.editCopy })}
          rows={title.copies}
          rowKey={(c) => c.barcode}
          empty="Đầu sách chưa có bản sao nào"
        />
      </section>

      <TitleFormModal open={page.editing} title={title} onClose={page.closeEdit} onSaved={page.onEdited} />
      <AddCopiesModal open={page.adding} isbn={page.isbn} onClose={page.closeAdd} onAdded={page.onCopiesAdded} />
      <EditCopyModal copy={page.editingCopy} onClose={page.closeCopy} onSaved={page.onCopySaved} />
      <LabelsModal open={!!page.labels} title={title.title} barcodes={page.labels || []} onClose={page.closeLabels} />
      <ConfirmModal
        open={page.deleting}
        title="Xoá đầu sách"
        message="Đầu sách sẽ bị ẩn khỏi tra cứu (xoá mềm) và các yêu cầu đặt trước đang chờ bị huỷ. Không thể xoá khi còn bản sao đang mượn hoặc giữ chỗ."
        confirmLabel="Xoá"
        danger
        onConfirm={page.remove}
        onClose={page.closeDelete}
      />
    </>
  );
}
