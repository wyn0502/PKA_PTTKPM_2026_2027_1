// Dung Pham Anh: Logic thống kê – báo cáo (UC-11): chọn loại báo cáo và kỳ, tải số liệu, đánh số thứ hạng, xuất Excel
import { useState } from 'react';
import { reportApi } from '../api/index.js';
import { useAsync } from '../hooks/useAsync.js';
import { useAsyncAction } from '../hooks/useAsyncAction.js';
import { isoDaysAgo, isoToday } from '../utils/format.js';

export const RANGE_PRESETS = [
  { label: '7 ngày', days: 6 },
  { label: '30 ngày', days: 29 },
  { label: '90 ngày', days: 89 },
];

export function useReports() {
  const [type, setType] = useState('loans');
  const [range, setRange] = useState({ from: isoDaysAgo(29), to: isoToday() });
  const { data, error, loading, reload } = useAsync(() => reportApi.get(type, range), [type, range.from, range.to]);
  const exporting = useAsyncAction(() => reportApi.exportXlsx(type, range));
  const isCurrent = data?.type === type;

  return {
    type,
    setType,
    range,
    setFrom: (event) => event.target.value && setRange((r) => ({ ...r, from: event.target.value })),
    setTo: (event) => event.target.value && setRange((r) => ({ ...r, to: event.target.value })),
    applyPreset: (days) => setRange({ from: isoDaysAgo(days), to: isoToday() }),
    rows: isCurrent ? data.rows.map((r, i) => ({ ...r, rank: i + 1 })) : [],
    loading: loading || !isCurrent,
    error,
    reload,
    exporting: exporting.busy,
    exportXlsx: () => exporting.run(),
  };
}
