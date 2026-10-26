// Dung Pham Anh: Trang báo không tìm thấy đường dẫn
import { Link } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { homePathFor } from '../components/layout/navigation.js';

export default function NotFoundPage() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader marker="404" title="Không tìm thấy trang" description="Đường dẫn không tồn tại hoặc bạn không có quyền truy cập." />
      <Link className="btn" to={homePathFor(user?.role)}>
        Về trang chính
      </Link>
    </>
  );
}
