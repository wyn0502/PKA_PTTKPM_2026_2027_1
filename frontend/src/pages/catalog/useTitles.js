// Dung Pham Anh: Logic danh mục đầu sách: bộ lọc, phân trang, mở biểu mẫu thêm, nhập Excel, chuyển sang trang chi tiết
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { catalogApi } from '../../api/index.js';
import { usePagedList } from '../../hooks/usePagedList.js';
import { useCatalogOptions } from '../../hooks/useCatalogOptions.js';

export function useTitles() {
  const navigate = useNavigate();
  const { categories } = useCatalogOptions();
  const [filters, setFilters] = useState({ q: '', categoryId: '', availableOnly: false });
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const list = usePagedList(catalogApi.titles, filters);
  const openTitle = (title) => navigate(`/titles/${title.isbn}`);

  return {
    categories,
    filters,
    setFilter: (key, value) => setFilters((f) => ({ ...f, [key]: value })),
    list,
    openTitle,
    creating,
    openCreate: () => setCreating(true),
    closeCreate: () => setCreating(false),
    onCreated: (saved) => {
      setCreating(false);
      openTitle(saved);
    },
    importing,
    openImport: () => setImporting(true),
    closeImport: () => {
      setImporting(false);
      list.reload();
    },
    importTitles: catalogApi.importTitles,
  };
}
