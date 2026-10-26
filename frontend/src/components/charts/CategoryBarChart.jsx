// Dung Pham Anh: Biểu đồ cột ngang một chuỗi (lượt mượn theo thể loại), nhãn giá trị ở đầu cột
import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartTooltip from './ChartTooltip.jsx';

const TICK = { fontSize: 12, fill: 'rgb(var(--ink))' };

export default function CategoryBarChart({ data, labelKey, valueKey, valueName }) {
  const height = Math.max(160, data.length * 36 + 24);
  return (
    <div style={{ width: '100%', height }} role="img" aria-label={`Biểu đồ ${valueName.toLowerCase()} theo ${labelKey}`}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 8 }} barCategoryGap={10}>
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis type="category" dataKey={labelKey} width={150} tick={TICK} tickLine={false} axisLine={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgb(var(--elevated))' }} />
          <Bar dataKey={valueKey} name={valueName} fill="var(--chart-1)" barSize={14} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            <LabelList dataKey={valueKey} position="right" style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fill: 'rgb(var(--ink))' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
