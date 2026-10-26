// Dung Pham Anh: Logic danh sách phiếu mượn: bộ lọc (khởi tạo từ ?overdue=true), phân trang, chọn phiếu xem chi tiết
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { circulationApi } from '../../api/index.js';
import { usePagedList } from '../../hooks/usePagedList.js';

export function useLoans() {
  const [params] = useSearchParams();
  const [filters, setFilters] = useState({ q: '', status: '', overdue: params.get('overdue') === 'true' });
  const [selectedId, setSelectedId] = useState(null);
  const list = usePagedList(circulationApi.loans, filters);

  return {
    filters,
    setFilter: (key, value) => setFilters((f) => ({ ...f, [key]: value })),
    list,
    selectedId,
    select: (loan) => setSelectedId(loan.loanId),
    closeDetail: () => setSelectedId(null),
  };
}
