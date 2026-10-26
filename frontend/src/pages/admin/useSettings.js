// Dung Pham Anh: Logic tham số hệ thống (FR-28): tải tham số, theo dõi giá trị đã sửa, chỉ quản trị viên được lưu
import { useEffect, useState } from 'react';
import { adminApi } from '../../api/index.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useAsyncAction } from '../../hooks/useAsyncAction.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const SETTING_GROUPS = [
  { title: 'Mượn – trả', keys: ['loan_days_student', 'loan_days_lecturer', 'max_borrow_student', 'max_borrow_lecturer', 'max_renewals', 'renew_days'] },
  { title: 'Phí phạt', keys: ['fine_per_day', 'damage_fine', 'lost_fine'] },
  { title: 'Đặt trước', keys: ['hold_days', 'reservation_wait_days', 'max_reservations'] },
  { title: 'Thẻ & tài khoản', keys: ['card_valid_days', 'max_login_attempts'] },
];

export function useSettings() {
  const { isAdmin } = useAuth();
  const { data, error, loading, reload, setData } = useAsync(() => adminApi.settings(), []);
  const [values, setValues] = useState({});

  useEffect(() => {
    if (data) setValues(Object.fromEntries(data.map((s) => [s.key, s.value])));
  }, [data]);

  const definitions = Object.fromEntries((data || []).map((s) => [s.key, s]));
  const changed = (data || []).filter((s) => Number(values[s.key]) !== s.value);
  const save = useAsyncAction(() => adminApi.updateSettings(Object.fromEntries(changed.map((s) => [s.key, Number(values[s.key])]))), {
    success: 'Đã lưu tham số, áp dụng ngay cho các giao dịch mới',
    onSuccess: setData,
  });

  return {
    isAdmin,
    ready: !!data,
    loading,
    error,
    reload,
    definitions,
    values,
    setValue: (key) => (event) => setValues((v) => ({ ...v, [key]: event.target.value })),
    changedCount: changed.length,
    busy: save.busy,
    submit: (event) => {
      event.preventDefault();
      save.run();
    },
  };
}
