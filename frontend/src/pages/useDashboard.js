// Dung Pham Anh: Logic trang tổng quan: tải số liệu tức thời, xu hướng 30 ngày và danh sách quá hạn song song
import { reportApi } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { isoDaysAgo, isoToday } from '../utils/format.js';

const OVERDUE_PREVIEW = 8;

export function useDashboard() {
  const { user } = useAuth();
  const today = isoToday();
  const range = { from: isoDaysAgo(29), to: today };
  const summary = useAsync(() => reportApi.summary(), []);
  const trend = useAsync(() => reportApi.get('loans', range), [range.from, range.to]);
  const overdue = useAsync(() => reportApi.get('overdue', range), [today]);

  return {
    userName: user.fullName || user.username,
    today,
    summary,
    trendRows: trend.data?.rows,
    overdueRows: overdue.data?.rows.slice(0, OVERDUE_PREVIEW),
    overdueLoading: overdue.loading,
  };
}
