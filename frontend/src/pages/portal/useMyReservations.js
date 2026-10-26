// Dung Pham Anh: Logic đặt trước của độc giả: danh sách có phân trang, các yêu cầu sách đã về, huỷ yêu cầu
import { useState } from 'react';
import { meApi, reservationApi } from '../../api/index.js';
import { usePagedList } from '../../hooks/usePagedList.js';
import { useToast } from '../../context/ToastContext.jsx';

const NO_FILTERS = {};

export function useMyReservations() {
  const toast = useToast();
  const [cancelling, setCancelling] = useState(null);
  const list = usePagedList(meApi.reservations, NO_FILTERS);

  return {
    list,
    ready: list.data?.items.filter((r) => r.status === 'Ready') ?? [],
    cancelling,
    askCancel: setCancelling,
    closeCancel: () => setCancelling(null),
    cancel: async () => {
      await reservationApi.cancel(cancelling.reserveId);
      toast.success('Đã huỷ đặt trước');
      list.reload();
    },
  };
}
