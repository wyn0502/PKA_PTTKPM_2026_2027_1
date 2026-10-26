// Dung Pham Anh: Khung ứng dụng sau đăng nhập: thanh bên, thanh trên (đổi giao diện, hồ sơ), tab dưới + bảng "Thêm" trên điện thoại
import { Suspense } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { FiMoon, FiSun, FiLogOut, FiMoreHorizontal, FiUser } from 'react-icons/fi';
import Logo from '../ui/Logo.jsx';
import Modal from '../ui/Modal.jsx';
import LoadingBlock from '../ui/LoadingBlock.jsx';
import { useAppLayout } from './useAppLayout.js';
import { initials } from '../../utils/format.js';
import { ROLE } from '../../utils/labels.js';

const toneStyle = (tone) => ({ '--nav-color': `var(--ramp-${tone})` });

function NavItem({ item, onClick }) {
  const Icon = item.icon;
  return (
    <NavLink to={item.to} end={item.end} className="nav-link" style={toneStyle(item.tone)} title={item.label} onClick={onClick}>
      <Icon aria-hidden="true" />
      <span>{item.label}</span>
    </NavLink>
  );
}

function NavGroups({ groups, onNavigate }) {
  return groups.map((group) => (
    <div key={group.group}>
      <div className="nav-group">{group.group}</div>
      {group.items.map((item) => (
        <NavItem key={item.to} item={item} onClick={onNavigate} />
      ))}
    </div>
  ));
}

export default function AppLayout() {
  const layout = useAppLayout();
  const location = useLocation();
  const { user } = layout;

  return (
    <div className="app">
      <aside className="sidebar">
        <Logo />
        <nav className="nav" aria-label="Điều hướng chính">
          <NavGroups groups={layout.groups} />
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <NavLink to="/profile" className="avatar" title="Tài khoản của tôi">
              {initials(user.fullName || user.username)}
            </NavLink>
            <div className="meta">
              <strong>{user.fullName || user.username}</strong>
              <small>{ROLE[user.role]?.label}</small>
            </div>
            <button type="button" className="btn btn-ghost btn-icon" onClick={layout.signOut} title="Đăng xuất" aria-label="Đăng xuất">
              <FiLogOut />
            </button>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <Logo className="brand mobile-brand" compact />
          <button type="button" className="btn btn-ghost btn-icon" onClick={layout.toggleTheme} aria-label="Đổi giao diện sáng/tối">
            {layout.theme === 'dark' ? <FiSun /> : <FiMoon />}
          </button>
          <NavLink to="/profile" className="btn btn-ghost btn-icon" aria-label="Tài khoản của tôi">
            <FiUser />
          </NavLink>
        </header>
        <main className="content" key={location.pathname}>
          <Suspense fallback={<LoadingBlock />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <nav className="tabbar" aria-label="Điều hướng nhanh">
        {layout.tabs.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} end={item.end} style={toneStyle(item.tone)} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon aria-hidden="true" />
              {item.short}
            </NavLink>
          );
        })}
        {layout.hasMore && (
          <button type="button" onClick={layout.openMore}>
            <FiMoreHorizontal aria-hidden="true" />
            Thêm
          </button>
        )}
      </nav>

      <Modal open={layout.moreOpen} title="Tất cả chức năng" onClose={layout.closeMore}>
        <div className="more-sheet nav">
          <NavGroups groups={layout.groups} onNavigate={layout.closeMore} />
          <button type="button" className="btn" style={{ marginTop: 16, width: '100%' }} onClick={layout.signOut}>
            <FiLogOut /> Đăng xuất
          </button>
        </div>
      </Modal>
    </div>
  );
}
