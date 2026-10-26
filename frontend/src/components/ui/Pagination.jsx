// Dung Pham Anh: Phân trang: hiển thị khoảng bản ghi và nút trang trước/sau
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Pagination({ page, pageSize, total, onChange }) {
  if (!total) return null;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="pagination">
      <span className="mono">
        {from}–{to} / {total}
      </span>
      <div className="row">
        <button type="button" className="btn btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Trang trước">
          <FiChevronLeft />
        </button>
        <span className="mono">
          {page}/{pages}
        </span>
        <button type="button" className="btn btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Trang sau">
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
}
