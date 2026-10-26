// Dung Pham Anh: Hook nạp danh sách thể loại và nhà xuất bản cho các ô chọn
import { useAsync } from './useAsync.js';
import { catalogApi } from '../api/index.js';

export function useCatalogOptions() {
  const { data, reload } = useAsync(() => Promise.all([catalogApi.categories(), catalogApi.publishers()]), []);
  return { categories: data?.[0] ?? [], publishers: data?.[1] ?? [], reload };
}

export const categoryLabel = (c) => (c.parentName ? `${c.parentName} › ${c.categoryName}` : c.categoryName);
