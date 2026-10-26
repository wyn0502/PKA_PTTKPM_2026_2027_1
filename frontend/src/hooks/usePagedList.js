// Dung Pham Anh: Hook danh sách có phân trang + bộ lọc: về trang 1 khi đổi bộ lọc, trì hoãn ô tìm kiếm
import { useEffect, useState } from 'react';
import { useAsync } from './useAsync.js';
import { useDebounce } from './useDebounce.js';

export function usePagedList(fetcher, filters, pageSize = 20) {
  const [page, setPage] = useState(1);
  const debouncedFilters = useDebounce(filters, 300);
  const key = JSON.stringify(debouncedFilters);

  useEffect(() => setPage(1), [key]);

  const result = useAsync(() => fetcher({ ...debouncedFilters, page, pageSize }), [key, page]);
  return { ...result, page, setPage, pageSize };
}
