// Dung Pham Anh: Ô số liệu tổng quan: nhãn, giá trị lớn dạng mono, ghi chú, vạch màu theo dải
export default function StatCard({ label, value, note, tone = 6 }) {
  return (
    <div className={`stat tone-${tone}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {note && <div className="stat-note">{note}</div>}
    </div>
  );
}
