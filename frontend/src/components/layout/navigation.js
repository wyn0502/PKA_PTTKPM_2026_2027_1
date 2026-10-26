// Dung Pham Anh: Cấu hình menu theo vai trò: nhóm mục, đường dẫn, biểu tượng, mục nào hiện trên thanh tab điện thoại
import {
  FiGrid,
  FiLogIn,
  FiLogOut,
  FiFileText,
  FiBookmark,
  FiDollarSign,
  FiBook,
  FiTag,
  FiUsers,
  FiBarChart2,
  FiShield,
  FiSliders,
  FiActivity,
  FiSearch,
  FiUser,
} from 'react-icons/fi';

const STAFF_NAV = [
  {
    group: 'Lưu thông',
    items: [
      { to: '/', label: 'Tổng quan', short: 'Tổng quan', icon: FiGrid, end: true, tab: true },
      { to: '/borrow', label: 'Lập phiếu mượn', short: 'Mượn', icon: FiLogOut, tab: true },
      { to: '/return', label: 'Ghi nhận trả', short: 'Trả', icon: FiLogIn, tab: true },
      { to: '/loans', label: 'Phiếu mượn', icon: FiFileText },
      { to: '/reservations', label: 'Đặt trước', icon: FiBookmark },
      { to: '/fines', label: 'Phí phạt', icon: FiDollarSign },
    ],
  },
  {
    group: 'Danh mục',
    items: [
      { to: '/titles', label: 'Đầu sách & bản sao', short: 'Đầu sách', icon: FiBook, tab: true },
      { to: '/catalog', label: 'Thể loại & NXB', icon: FiTag },
      { to: '/readers', label: 'Độc giả', icon: FiUsers },
    ],
  },
  {
    group: 'Quản trị',
    items: [
      { to: '/reports', label: 'Thống kê – báo cáo', icon: FiBarChart2 },
      { to: '/accounts', label: 'Tài khoản', icon: FiShield, roles: ['admin'] },
      { to: '/settings', label: 'Tham số hệ thống', icon: FiSliders },
      { to: '/audit', label: 'Nhật ký thao tác', icon: FiActivity, roles: ['admin'] },
    ],
  },
];

const READER_NAV = [
  {
    group: 'Cổng độc giả',
    items: [
      { to: '/search', label: 'Tra cứu tài liệu', short: 'Tra cứu', icon: FiSearch, tab: true },
      { to: '/my/loans', label: 'Sách đang mượn', short: 'Đang mượn', icon: FiBook, tab: true },
      { to: '/my/reservations', label: 'Đặt trước', short: 'Đặt trước', icon: FiBookmark, tab: true },
      { to: '/my/fines', label: 'Phí phạt', short: 'Phí phạt', icon: FiDollarSign, tab: true },
      { to: '/profile', label: 'Tài khoản của tôi', short: 'Tài khoản', icon: FiUser, tab: true },
    ],
  },
];

export function navigationFor(role) {
  const groups = role === 'reader' ? READER_NAV : STAFF_NAV;
  let index = 0;
  return groups
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => !item.roles || item.roles.includes(role))
        .map((item) => ({ ...item, tone: index++ % 9 })),
    }))
    .filter((group) => group.items.length);
}

export const homePathFor = (role) => (role === 'reader' ? '/search' : '/');
