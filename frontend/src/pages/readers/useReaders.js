// Dung Pham Anh: Logic danh sách độc giả (UC-02): bộ lọc, phân trang, tạo hồ sơ và hiện mật khẩu tạm, nhập Excel
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { readerApi } from '../../api/index.js';
import { usePagedList } from '../../hooks/usePagedList.js';

export function useReaders() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ q: '', type: '', status: '' });
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const list = usePagedList(readerApi.list, filters);

  return {
    filters,
    setFilter: (key, value) => setFilters((f) => ({ ...f, [key]: value })),
    list,
    openReader: (reader) => navigate(`/readers/${reader.readerId}`),
    creating,
    openCreate: () => setCreating(true),
    closeCreate: () => setCreating(false),
    onCreated: (result) => {
      setCreating(false);
      setCredentials(result.credentials);
      list.reload();
    },
    credentials,
    closeCredentials: () => setCredentials(null),
    importing,
    openImport: () => setImporting(true),
    closeImport: () => {
      setImporting(false);
      list.reload();
    },
    importReaders: readerApi.importExcel,
  };
}
