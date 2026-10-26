// Dung Pham Anh: Logic sao chép tên đăng nhập và mật khẩu tạm của độc giả vào bộ nhớ tạm
import { useToast } from '../../context/ToastContext.jsx';

export function useCredentials(credentials) {
  const toast = useToast();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Tên đăng nhập: ${credentials.username}\nMật khẩu: ${credentials.password}`);
      toast.success('Đã sao chép');
    } catch {
      toast.warning('Không sao chép được, hãy ghi lại thủ công');
    }
  };
  return { copy };
}
