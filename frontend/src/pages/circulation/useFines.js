// Dung Pham Anh: Logic quản lý phí phạt (UC-10): lọc, phân trang, thu tiền nợ, lập phiếu phạt thủ công, mở biên lai
import { useState } from 'react';
import { fineApi } from '../../api/index.js';
import { usePagedList } from '../../hooks/usePagedList.js';
import { useToast } from '../../context/ToastContext.jsx';

export function useFines() {
  const toast = useToast();
  const [filters, setFilters] = useState({ q: '', paid: 'false' });
  const [paying, setPaying] = useState(null);
  const [creating, setCreating] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const list = usePagedList(fineApi.list, filters);

  return {
    filters,
    setFilter: (key, value) => setFilters((f) => ({ ...f, [key]: value })),
    list,
    paying,
    askPay: setPaying,
    closePay: () => setPaying(null),
    pay: async () => {
      const paid = await fineApi.pay(paying.fineId);
      toast.success('Đã thu tiền phạt, quyền mượn được khôi phục nếu không còn nợ');
      setReceipt([paid]);
      list.reload();
    },
    creating,
    openCreate: () => setCreating(true),
    closeCreate: () => setCreating(false),
    onCreated: (fines) => {
      setCreating(false);
      list.reload();
      if (fines.length) setReceipt(fines);
    },
    receipt,
    showReceipt: (fine) => setReceipt([fine]),
    closeReceipt: () => setReceipt(null),
  };
}
