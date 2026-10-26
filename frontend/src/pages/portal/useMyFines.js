// Dung Pham Anh: Logic phí phạt của độc giả: danh sách có phân trang và tổng nợ chưa thanh toán trên trang
import { meApi } from '../../api/index.js';
import { usePagedList } from '../../hooks/usePagedList.js';

const NO_FILTERS = {};

export function useMyFines() {
  const list = usePagedList(meApi.fines, NO_FILTERS);
  const unpaidTotal = list.data?.items.filter((f) => !f.isPaid).reduce((sum, f) => sum + f.amount, 0) ?? 0;
  return { list, unpaidTotal };
}
