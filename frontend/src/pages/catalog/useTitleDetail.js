// Dung Pham Anh: Logic chi tiết đầu sách: tải đầu sách và bản sao, sửa/xoá mềm, thêm bản sao, sửa bản sao, chọn tem để in
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { catalogApi } from '../../api/index.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useToast } from '../../context/ToastContext.jsx';

export function useTitleDetail() {
  const { isbn } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: title, error, loading, reload } = useAsync(() => catalogApi.title(isbn), [isbn]);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingCopy, setEditingCopy] = useState(null);
  const [labels, setLabels] = useState(null);

  return {
    isbn,
    title,
    error,
    loading: loading && !title,
    reload,
    editing,
    openEdit: () => setEditing(true),
    closeEdit: () => setEditing(false),
    onEdited: () => {
      setEditing(false);
      reload();
    },
    deleting,
    askDelete: () => setDeleting(true),
    closeDelete: () => setDeleting(false),
    remove: async () => {
      await catalogApi.deleteTitle(isbn);
      toast.success('Đã xoá đầu sách (xoá mềm)');
      navigate('/titles');
    },
    adding,
    openAdd: () => setAdding(true),
    closeAdd: () => setAdding(false),
    onCopiesAdded: (result) => {
      setAdding(false);
      reload();
      setLabels(result.barcodes);
    },
    editingCopy,
    editCopy: setEditingCopy,
    closeCopy: () => setEditingCopy(null),
    onCopySaved: () => {
      setEditingCopy(null);
      reload();
    },
    labels,
    printLabels: (barcodes) => setLabels(barcodes),
    printAllLabels: () => setLabels(title.copies.map((c) => c.barcode)),
    closeLabels: () => setLabels(null),
  };
}
