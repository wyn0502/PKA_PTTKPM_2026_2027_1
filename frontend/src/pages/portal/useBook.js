// Dung Pham Anh: Logic chi tiết tài liệu cho độc giả: tải đầu sách, tính bản khả dụng/vị trí kệ/hạn trả gần nhất, đặt trước (UC-06)
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { catalogApi, reservationApi } from '../../api/index.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useToast } from '../../context/ToastContext.jsx';

function summarizeCopies(copies) {
  const available = copies.filter((c) => c.loanStatus === 'Available');
  return {
    hasAvailable: available.length > 0,
    shelves: [...new Set(available.map((c) => c.shelfLocation).filter(Boolean))],
    nextReturn: copies
      .map((c) => c.dueDate)
      .filter(Boolean)
      .sort()[0],
  };
}

export function useBook() {
  const { isbn } = useParams();
  const toast = useToast();
  const { data: book, error, loading, reload } = useAsync(() => catalogApi.title(isbn), [isbn]);
  const [confirming, setConfirming] = useState(false);

  return {
    book,
    error,
    loading: loading && !book,
    reload,
    ...(book ? summarizeCopies(book.copies) : { hasAvailable: false, shelves: [], nextReturn: null }),
    confirming,
    askReserve: () => setConfirming(true),
    closeReserve: () => setConfirming(false),
    reserve: async () => {
      const reservation = await reservationApi.create(isbn);
      toast.success(`Đặt trước thành công, bạn đứng thứ ${reservation.queuePosition} trong hàng chờ`);
      reload();
    },
  };
}
