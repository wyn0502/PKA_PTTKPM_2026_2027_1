// Dung Pham Anh: Màn hình chi tiết tài liệu cho độc giả: thông tin, vị trí kệ, danh sách bản sao và nút đặt trước
import { Link } from 'react-router-dom';
import { FiBookmark } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import ErrorNotice from '../../components/ui/ErrorNotice.jsx';
import LoadingBlock from '../../components/ui/LoadingBlock.jsx';
import { useBook } from './useBook.js';
import { formatDate } from '../../utils/format.js';
import { COPY_STATUS } from '../../utils/labels.js';

export default function BookPage() {
  const page = useBook();
  const { book } = page;

  if (page.error) return <ErrorNotice error={page.error} onRetry={page.reload} />;
  if (page.loading) return <LoadingBlock />;

  return (
    <>
      <PageHeader
        marker={<Link to="/search">tra cứu</Link>}
        title={book.title}
        description={`${book.author} · ${book.publisherName}${book.publishYear ? ` · ${book.publishYear}` : ''}`}
        actions={
          <button
            type="button"
            className="btn btn-primary"
            disabled={page.hasAvailable}
            title={page.hasAvailable ? 'Sách còn trên kệ, bạn có thể đến quầy mượn trực tiếp' : undefined}
            onClick={page.askReserve}
          >
            <FiBookmark /> Đặt trước
          </button>
        }
      />
      <div className="grid-2">
        <section className="card">
          <div className="card-title">Thông tin</div>
          <dl className="kv">
            <dt>ISBN</dt>
            <dd className="code-id">{book.isbn}</dd>
            <dt>Thể loại</dt>
            <dd>{book.categoryName}</dd>
            <dt>Bản khả dụng</dt>
            <dd className="mono">
              {book.availableCopies}/{book.totalCopies}
            </dd>
            <dt>Vị trí kệ</dt>
            <dd>{page.shelves.length ? page.shelves.join(', ') : '—'}</dd>
            <dt>Đang chờ đặt trước</dt>
            <dd className="mono">{book.pendingReservations} người</dd>
            {!page.hasAvailable && page.nextReturn && (
              <>
                <dt>Hạn trả gần nhất</dt>
                <dd className="mono">{formatDate(page.nextReturn)}</dd>
              </>
            )}
          </dl>
          {book.description && <p style={{ marginBottom: 0 }}>{book.description}</p>}
        </section>
        <section className="card">
          <div className="card-title">Bản sao</div>
          <ul className="list-plain scan-list">
            {book.copies.map((c) => (
              <li key={c.barcode}>
                <span>
                  <span className="code-id">{c.barcode}</span> <small className="muted">{c.shelfLocation}</small>
                </span>
                <StatusBadge map={COPY_STATUS} value={c.loanStatus} />
              </li>
            ))}
          </ul>
        </section>
      </div>
      <ConfirmModal
        open={page.confirming}
        title="Đặt trước tài liệu"
        message={`Đặt trước “${book.title}”? Khi có bản sao trả về, thư viện giữ sách cho bạn và hiển thị ở mục Đặt trước.`}
        confirmLabel="Đặt trước"
        onConfirm={page.reserve}
        onClose={page.closeReserve}
      />
    </>
  );
}
