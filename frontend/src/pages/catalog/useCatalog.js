// Dung Pham Anh: Logic thể loại & nhà xuất bản (FR-03): chọn tab, mở biểu mẫu thêm/sửa, lưu, xoá khi chưa được dùng
import { useState } from 'react';
import { catalogApi } from '../../api/index.js';
import { useCatalogOptions } from '../../hooks/useCatalogOptions.js';
import { useAsyncAction } from '../../hooks/useAsyncAction.js';
import { useToast } from '../../context/ToastContext.jsx';

export const ENTITIES = {
  category: {
    label: 'thể loại',
    idKey: 'categoryId',
    nameKey: 'categoryName',
    empty: { categoryName: '', parentId: '', description: '' },
    save: catalogApi.saveCategory,
    remove: catalogApi.deleteCategory,
  },
  publisher: {
    label: 'nhà xuất bản',
    idKey: 'publisherId',
    nameKey: 'publisherName',
    empty: { publisherName: '', address: '', contactEmail: '', phone: '' },
    save: catalogApi.savePublisher,
    remove: catalogApi.deletePublisher,
  },
};

export function useCatalog() {
  const toast = useToast();
  const { categories, publishers, reload } = useCatalogOptions();
  const [tab, setTab] = useState('category');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const entity = ENTITIES[tab];

  const save = useAsyncAction(() => entity.save(editing[entity.idKey], editing), {
    success: `Đã lưu ${entity.label}`,
    onSuccess: () => {
      setEditing(null);
      reload();
    },
  });

  return {
    tab,
    selectTab: (key) => {
      setTab(key);
      setEditing(null);
    },
    entity,
    rows: tab === 'category' ? categories : publishers,
    categories,
    editing,
    setEditing,
    editField: (key) => (event) => setEditing((current) => ({ ...current, [key]: event.target.value })),
    startCreate: () => setEditing({ ...entity.empty }),
    closeEdit: () => setEditing(null),
    saving: save.busy,
    submit: (event) => {
      event.preventDefault();
      save.run();
    },
    deleting,
    askDelete: setDeleting,
    closeDelete: () => setDeleting(null),
    remove: async () => {
      await entity.remove(deleting[entity.idKey]);
      toast.success(`Đã xoá ${entity.label}`);
      reload();
    },
  };
}
