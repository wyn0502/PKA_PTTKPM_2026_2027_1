// Dung Pham Anh: Hook trì hoãn giá trị (dùng cho ô tìm kiếm để không gọi API mỗi lần gõ phím)
import { useEffect, useState } from 'react';

export function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
