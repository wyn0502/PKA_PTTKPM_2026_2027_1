// Dung Pham Anh: Khung báo lỗi tải dữ liệu kèm nút thử lại
export default function ErrorNotice({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="alert tone-3 row-between">
      <span>{error.message}</span>
      {onRetry && (
        <button type="button" className="btn btn-sm" onClick={onRetry}>
          Thử lại
        </button>
      )}
    </div>
  );
}
