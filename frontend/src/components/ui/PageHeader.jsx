// Dung Pham Anh: Tiêu đề trang: mã mục dạng mono, tiêu đề chữ dải màu, mô tả và các nút thao tác
export default function PageHeader({ marker, title, description, actions }) {
  return (
    <header className="page-header">
      <div>
        {marker && (
          <div className="marker">
            {'// '}
            {marker}
          </div>
        )}
        <h1 className="text-ramp">{title}</h1>
        {description && <p>{description}</p>}
        <hr className="rule-ramp" />
      </div>
      {actions && <div className="row">{actions}</div>}
    </header>
  );
}
