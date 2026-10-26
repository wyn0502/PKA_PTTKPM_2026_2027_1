// Dung Pham Anh: Hook hành vi hộp thoại: đóng bằng phím Esc và khoá cuộn trang khi đang mở
import { useEffect, useRef } from 'react';

export function useModalEffects(open, onClose) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && closeRef.current?.();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);
}
