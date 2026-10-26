// Dung Pham Anh: Logic chi tiết phiếu mượn: tải phiếu theo mã, gia hạn (UC-09), mở/đóng bản in
import { useState } from 'react';
import { circulationApi } from '../../api/index.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useAsyncAction } from '../../hooks/useAsyncAction.js';
import { formatDate } from '../../utils/format.js';

export function useLoanDetail(loanId, onChanged) {
  const { data: loan, loading, reload } = useAsync(() => (loanId ? circulationApi.loan(loanId) : Promise.resolve(null)), [loanId]);
  const [printing, setPrinting] = useState(false);
  const renewal = useAsyncAction(() => circulationApi.renew(loanId), {
    success: (result) => `Gia hạn thành công, hạn trả mới ${formatDate(result.newDueDate)}`,
    onSuccess: () => {
      reload();
      onChanged?.();
    },
  });

  return {
    loan,
    loading: loading || !loan,
    canRenew: loan?.status === 'Borrowing',
    renewing: renewal.busy,
    renew: () => renewal.run(),
    printing,
    openPrint: () => setPrinting(true),
    closePrint: () => setPrinting(false),
  };
}
