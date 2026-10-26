// Dung Pham Anh: Bao controller async để lỗi được chuyển tới middleware xử lý lỗi
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
