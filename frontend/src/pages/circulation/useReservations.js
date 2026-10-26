// Dung Pham Anh: Logic hàng đợi đặt trước phía thủ thư: lọc theo trạng thái, phân trang, huỷ yêu cầu
import { useState } from 'react';
import { reservationApi } from '../../api/index.js';
import { usePagedList } from '../../hooks/usePagedList.js';
import { useToast } from '../../context/ToastContext.jsx';

export const STATUS_FILTERS = [
  { value: 'Pending,Ready', label: 'Đang hiệu lực' },
  { value: 'Ready', label: 'Sách đã về (đang giữ chỗ)' },
  { value: 'Pending', label: 'Đang chờ' },
  { value: 'Fulfilled,Cancelled,Expired', label: 'Đã kết thúc' },
  { value: '', label: 'Tất cả' },
];

export function useReservations() {
  const toast = useToast();
  const [status, setStatus] = useState('Pending,Ready');
  const [cancelling, setCancelling] = useState(null);
  const list = usePagedList(reservationApi.list, { status });

  return {
    status,
    setStatus,
    list,
    cancelling,
    askCancel: setCancelling,
    closeCancel: () => setCancelling(null),
    cancel: async () => {
      await reservationApi.cancel(cancelling.reserveId);
      toast.success('Đã huỷ yêu cầu đặt trước');
      list.reload();
    },
  };
}
