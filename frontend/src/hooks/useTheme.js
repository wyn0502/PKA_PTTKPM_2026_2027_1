// Dung Pham Anh: Hook chế độ sáng/tối: mặc định sáng, chỉ đổi khi người dùng chọn, lưu lựa chọn trên trình duyệt
import { useCallback, useState } from 'react';
import { safeStorage } from '../utils/storage.js';

const KEY = 'qltv.theme';

export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'light');

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      safeStorage.set(KEY, next);
      return next;
    });
  }, []);

  return { theme, toggle };
}
