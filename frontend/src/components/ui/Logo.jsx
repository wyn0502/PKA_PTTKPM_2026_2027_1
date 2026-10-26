// Dung Pham Anh: Logo và tên hệ thống "Quản lý Thư viện"
import { Link } from 'react-router-dom';

export default function Logo({ to = '/', className = 'brand', compact = false }) {
  return (
    <Link to={to} className={className} aria-label="Quản lý Thư viện – trang chủ">
      <img src="/logo.svg" alt="" width="34" height="34" />
      {!compact && (
        <span className="brand-text">
          <small>Hệ thống</small>
          <strong className="text-ramp">Quản lý Thư viện</strong>
        </span>
      )}
    </Link>
  );
}
