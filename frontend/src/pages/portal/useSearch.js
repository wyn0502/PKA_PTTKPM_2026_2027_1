// Dung Pham Anh: Logic tra cứu tài liệu (UC-05): bộ lọc từ khoá/thể loại/còn trên kệ, phân trang lưới kết quả
import { useState } from 'react';
import { catalogApi } from '../../api/index.js';
import { usePagedList } from '../../hooks/usePagedList.js';
import { useCatalogOptions } from '../../hooks/useCatalogOptions.js';

const PAGE_SIZE = 24;

export function useSearch() {
  const { categories } = useCatalogOptions();
  const [filters, setFilters] = useState({ q: '', categoryId: '', availableOnly: false, sort: 'title' });
  const list = usePagedList(catalogApi.titles, filters, PAGE_SIZE);
  const items = list.data?.items;

  return {
    categories,
    filters,
    setFilter: (key, value) => setFilters((f) => ({ ...f, [key]: value })),
    list,
    items,
    initialLoading: list.loading && !items,
    isEmpty: !list.loading && !items?.length,
  };
}
