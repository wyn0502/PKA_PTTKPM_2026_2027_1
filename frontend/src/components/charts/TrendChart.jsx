// Dung Pham Anh: Biểu đồ đường lượt mượn và lượt trả theo ngày (2 chuỗi, một trục, có chú giải và tooltip)
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartTooltip from './ChartTooltip.jsx';
import { formatDate } from '../../utils/format.js';

const SERIES = [
  { key: 'borrowed', name: 'Lượt mượn', color: 'var(--chart-1)' },
  { key: 'returned', name: 'Lượt trả', color: 'var(--chart-2)' },
];
const AXIS = { fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'rgb(var(--muted))' };
const shortDate = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

export default function TrendChart({ data }) {
  return (
    <div>
      <div className="legend" aria-hidden="true">
        {SERIES.map((s) => (
          <span key={s.key}>
            <span className="swatch" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
      <div className="chart-box" role="img" aria-label="Biểu đồ lượt mượn và lượt trả theo ngày">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 16, right: 24, bottom: 0, left: -18 }}>
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
            <XAxis dataKey="day" tickFormatter={shortDate} tick={AXIS} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTooltip labelFormatter={formatDate} />} cursor={{ stroke: 'rgb(var(--muted))', strokeDasharray: '3 3' }} />
            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="linear"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: 'rgb(var(--canvas))', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
