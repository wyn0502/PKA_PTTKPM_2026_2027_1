// Dung Pham Anh: Vòng xoay chờ tải dữ liệu
export default function LoadingBlock() {
  return (
    <div className="loading-block" role="status" aria-label="Đang tải">
      <div className="spinner" />
    </div>
  );
}
