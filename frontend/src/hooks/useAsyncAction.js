// Dung Pham Anh: Hook chạy một thao tác bất đồng bộ: trạng thái đang xử lý, báo lỗi/thành công bằng toast, gọi tiếp khi xong
import { useCallback, useRef, useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';

export function useAsyncAction(action, { success, onSuccess, rethrow = false } = {}) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const latest = useRef({ action, success, onSuccess });
  latest.current = { action, success, onSuccess };

  const run = useCallback(
    async (...args) => {
      const current = latest.current;
      setBusy(true);
      try {
        const result = await current.action(...args);
        if (current.success) toast.success(typeof current.success === 'function' ? current.success(result) : current.success);
        await current.onSuccess?.(result);
        return result;
      } catch (error) {
        toast.error(error);
        if (rethrow) throw error;
        return undefined;
      } finally {
        setBusy(false);
      }
    },
    [toast, rethrow],
  );

  return { run, busy };
}
