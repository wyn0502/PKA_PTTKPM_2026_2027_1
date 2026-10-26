// Dung Pham Anh: Đọc/ghi localStorage an toàn: trả về giá trị mặc định khi trình duyệt chặn lưu trữ
export const safeStorage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      return false;
    }
    return true;
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      return false;
    }
    return true;
  },
};
