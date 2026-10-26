// Dung Pham Anh: Nhãn + ô nhập + gợi ý/lỗi cho biểu mẫu
export default function Field({ label, hint, error, children, className = '' }) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      {children}
      {error ? <small className="error">{error}</small> : hint && <small className="hint">{hint}</small>}
    </label>
  );
}
