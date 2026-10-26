// Dung Pham Anh: Logic khung ứng dụng: menu theo vai trò, các mục trên thanh tab điện thoại, bảng "Thêm", đổi giao diện, đăng xuất
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigationFor } from './navigation.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../hooks/useTheme.js';

export function useAppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const groups = navigationFor(user.role);
  const items = groups.flatMap((g) => g.items);
  const tabs = items.filter((i) => i.tab);
  const hasMore = items.length > tabs.length;

  return {
    user,
    groups,
    tabs: hasMore ? tabs.slice(0, 4) : tabs.slice(0, 5),
    hasMore,
    theme,
    toggleTheme: toggle,
    moreOpen,
    openMore: () => setMoreOpen(true),
    closeMore: () => setMoreOpen(false),
    signOut: async () => {
      await logout();
      navigate('/login', { replace: true });
    },
  };
}
