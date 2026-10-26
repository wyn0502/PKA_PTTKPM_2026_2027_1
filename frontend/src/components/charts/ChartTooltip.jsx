// Dung Pham Anh: Tooltip dùng chung cho biểu đồ: tiêu đề, vạch màu nhận diện chuỗi, giá trị dạng mono
export default function ChartTooltip({ active, payload, label, labelFormatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div style={{ marginBottom: 4, fontWeight: 600 }}>{labelFormatter ? labelFormatter(label) : label}</div>
      {payload.map((entry) => (
        <div key={entry.dataKey}>
          <span className="swatch" style={{ background: entry.color }} />
          {entry.name}: <span className="mono">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}
