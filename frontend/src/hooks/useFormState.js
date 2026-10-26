// Dung Pham Anh: Hook trạng thái biểu mẫu: giá trị, gán theo trường, nạp lại giá trị ban đầu mỗi khi mở hoặc đổi bản ghi
import { useCallback, useEffect, useRef, useState } from 'react';

export function useFormState(initial, { open = true, resetKey } = {}) {
  const [values, setValues] = useState(initial);
  const initialRef = useRef(initial);
  initialRef.current = initial;

  useEffect(() => {
    if (open) setValues(initialRef.current);
  }, [open, resetKey]);

  const field = useCallback((key) => (event) => setValues((v) => ({ ...v, [key]: event.target.value })), []);
  const patch = useCallback((changes) => setValues((v) => ({ ...v, ...changes })), []);

  return { values, setValues, field, patch };
}
