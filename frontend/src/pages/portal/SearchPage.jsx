// Dung Pham Anh: Màn hình tra cứu tài liệu (UC-05) cho độc giả: bộ lọc và lưới thẻ sách kèm số bản khả dụng
import { Link } from 'react-router-dom';
import { FiInbox } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Field from '../../components/ui/Field.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import ErrorNotice from '../../components/ui/ErrorNotice.jsx';
import LoadingBlock from '../../components/ui/LoadingBlock.jsx';
import { useSearch } from './useSearch.js';
import { categoryLabel } from '../../hooks/useCatalogOptions.js';

export default function SearchPage() {
  const { categories, filters, setFilter, list, items, initialLoading, isEmpty } = useSearch();

  return (
    <>
      <PageHeader marker="UC-05" title="Tra cứu tài liệu" description="Gõ có dấu hoặc không dấu đều được. Sách đã hết có thể đặt trước để giữ chỗ." />
      <div className="toolbar">
        <Field label="Từ khoá" className="grow">
          <SearchInput autoFocus value={filters.q} onChange={(q) => setFilter('q', q)} placeholder="Nhan đề, tác giả, ISBN…" />
        </Field>
        <Field label="Thể loại">
          <select className="select" value={filters.categoryId} onChange={(e) => setFilter('categoryId', e.target.value)}>
            <option value="">Tất cả</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {categoryLabel(c)}
              </option>
            ))}
          </select>
        </Field>
        <label className="checkbox" style={{ minHeight: 38 }}>
          <input type="checkbox" checked={filters.availableOnly} onChange={(e) => setFilter('availableOnly', e.target.checked)} />
          Chỉ sách còn trên kệ
        </label>
      </div>
      <ErrorNotice error={list.error} onRetry={list.reload} />
      {initialLoading ? (
        <LoadingBlock />
      ) : isEmpty ? (
        <div className="empty">
          <FiInbox />
          Không tìm thấy tài liệu phù hợp
        </div>
      ) : (
        <div className="book-grid">
          {items.map((b, i) => (
            <Link key={b.isbn} to={`/books/${b.isbn}`} className={`book-card tone-${i % 9}`}>
              <span className="marker">{b.categoryName}</span>
              <h3>{b.title}</h3>
              <span className="muted">{b.author}</span>
              <div className="meta">
                {b.availableCopies > 0 ? (
                  <span className="badge tone-8">Còn {b.availableCopies} bản</span>
                ) : (
                  <span className="badge tone-1">Đã hết · có thể đặt trước</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
      <div style={{ marginTop: 12 }}>
        <Pagination page={list.page} pageSize={list.pageSize} total={list.data?.total} onChange={list.setPage} />
      </div>
    </>
  );
}
