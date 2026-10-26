// Dung Pham Anh: Màn hình danh mục đầu sách (UC-03, UC-05): tìm kiếm, lọc thể loại, bảng đầu sách, thêm và nhập Excel
import { FiPlus, FiUpload } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Field from '../../components/ui/Field.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import ErrorNotice from '../../components/ui/ErrorNotice.jsx';
import ExcelImport from '../../components/ui/ExcelImport.jsx';
import TitleFormModal from '../../components/catalog/TitleFormModal.jsx';
import { useTitles } from './useTitles.js';
import { categoryLabel } from '../../hooks/useCatalogOptions.js';

const COLUMNS = [
  { key: 'isbn', header: 'ISBN', render: (r) => <span className="code-id">{r.isbn}</span> },
  {
    key: 'title',
    header: 'Nhan đề',
    render: (r) => (
      <>
        <div style={{ fontWeight: 500 }}>{r.title}</div>
        <small className="muted">{r.author}</small>
      </>
    ),
  },
  { key: 'categoryName', header: 'Thể loại' },
  { key: 'publisherName', header: 'NXB' },
  {
    key: 'copies',
    header: 'Khả dụng / tổng',
    className: 'right',
    render: (r) => (
      <span className="num">
        {r.availableCopies}/{r.totalCopies}
      </span>
    ),
  },
  { key: 'reservations', header: 'Đặt trước', className: 'right', render: (r) => (r.pendingReservations ? <span className="num">{r.pendingReservations}</span> : '—') },
];

export default function TitlesPage() {
  const page = useTitles();
  const { filters, setFilter, list } = page;

  return (
    <>
      <PageHeader
        marker="UC-03 · UC-04"
        title="Đầu sách & bản sao"
        description="Đầu sách là bản ghi thư mục; mỗi đầu sách có nhiều bản sao vật lý quản lý theo mã cá biệt."
        actions={
          <>
            <button type="button" className="btn" onClick={page.openImport}>
              <FiUpload /> Nhập Excel
            </button>
            <button type="button" className="btn btn-primary" onClick={page.openCreate}>
              <FiPlus /> Thêm đầu sách
            </button>
          </>
        }
      />
      <div className="toolbar">
        <Field label="Tìm kiếm" className="grow">
          <SearchInput value={filters.q} onChange={(q) => setFilter('q', q)} placeholder="Nhan đề, tác giả, ISBN, thể loại (gõ không dấu được)" />
        </Field>
        <Field label="Thể loại">
          <select className="select" value={filters.categoryId} onChange={(e) => setFilter('categoryId', e.target.value)}>
            <option value="">Tất cả</option>
            {page.categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {categoryLabel(c)}
              </option>
            ))}
          </select>
        </Field>
        <label className="checkbox" style={{ minHeight: 38 }}>
          <input type="checkbox" checked={filters.availableOnly} onChange={(e) => setFilter('availableOnly', e.target.checked)} />
          Chỉ đầu sách còn bản khả dụng
        </label>
      </div>
      <ErrorNotice error={list.error} onRetry={list.reload} />
      <section className="card card-flush">
        <DataTable columns={COLUMNS} rows={list.data?.items} rowKey={(r) => r.isbn} loading={list.loading} onRowClick={page.openTitle} empty="Không tìm thấy tài liệu phù hợp" />
        <Pagination page={list.page} pageSize={list.pageSize} total={list.data?.total} onChange={list.setPage} />
      </section>

      <TitleFormModal open={page.creating} onClose={page.closeCreate} onSaved={page.onCreated} />
      <ExcelImport open={page.importing} title="Nhập đầu sách từ Excel" template="titles" onImport={page.importTitles} onClose={page.closeImport} />
    </>
  );
}
