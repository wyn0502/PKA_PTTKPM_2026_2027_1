// Dung Pham Anh: Ngữ cảnh thông báo nổi (thành công/lỗi/cảnh báo) tự ẩn sau vài giây
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);
const TONES = { success: 'tone-8', error: 'tone-3', warning: 'tone-1', info: 'tone-6' };
let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((type, message) => {
    const id = nextId++;
    setToasts((list) => [...list.slice(-3), { id, type, message }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), type === 'error' ? 6000 : 3500);
  }, []);

  const toast = useMemo(
    () => ({
      success: (message) => push('success', message),
      error: (error) => push('error', error?.message || error || 'Đã có lỗi xảy ra'),
      warning: (message) => push('warning', message),
      info: (message) => push('info', message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${TONES[t.type]}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
