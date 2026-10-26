// Dung Pham Anh: Logic sách đang mượn của độc giả: tải phiếu và lịch sử, tách phiếu đang mượn, gia hạn (UC-09)
import { useState } from 'react';
import { circulationApi, meApi } from '../../api/index.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatDate } from '../../utils/format.js';

export function useMyLoans() {
  const toast = useToast();
  const { data, error, loading, reload } = useAsync(() => meApi.loans(), []);
  const [renewing, setRenewing] = useState(null);

  return {
    error,
    loading: loading && !data,
    reload,
    current: data?.loans.filter((l) => l.status === 'Borrowing') ?? [],
    history: data?.history ?? [],
    renewing,
    askRenew: setRenewing,
    closeRenew: () => setRenewing(null),
    renew: async () => {
      const result = await circulationApi.renew(renewing.loanId);
      toast.success(`Gia hạn thành công, hạn trả mới ${formatDate(result.newDueDate)}`);
      reload();
    },
  };
}
