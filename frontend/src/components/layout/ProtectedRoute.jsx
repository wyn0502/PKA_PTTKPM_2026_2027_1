// Dung Pham Anh: Chặn truy cập trang khi chưa đăng nhập hoặc sai vai trò, điều hướng về trang phù hợp
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { homePathFor } from './navigation.js';
import LoadingBlock from '../ui/LoadingBlock.jsx';

export default function ProtectedRoute({ roles }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <LoadingBlock />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homePathFor(user.role)} replace />;
  return <Outlet />;
}
