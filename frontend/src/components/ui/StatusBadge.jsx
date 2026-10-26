// Dung Pham Anh: Nhãn trạng thái có chấm màu theo dải màu, luôn kèm chữ (không chỉ dựa vào màu)
export default function StatusBadge({ map, value }) {
  const item = map[String(value)];
  if (!item) return <span className="badge">{String(value ?? '—')}</span>;
  return <span className={`badge tone-${item.tone}`}>{item.label}</span>;
}
