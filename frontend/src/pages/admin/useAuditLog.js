// Dung Pham Anh: Logic nhật ký thao tác: lọc theo loại thao tác và phân trang
import { useState } from 'react';
import { adminApi } from '../../api/index.js';
import { usePagedList } from '../../hooks/usePagedList.js';

const PAGE_SIZE = 30;

export function useAuditLog() {
  const [action, setAction] = useState('');
  const list = usePagedList(adminApi.auditLogs, { action }, PAGE_SIZE);
  return { action, setAction, list };
}
