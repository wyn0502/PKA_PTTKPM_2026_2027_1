// Dung Pham Anh: Logic quản lý tài khoản (UC-12): lọc, phân trang, khoá/mở, đổi vai trò, đặt lại mật khẩu, biểu mẫu nhân sự
import { useState } from 'react';
import { adminApi } from '../../api/index.js';
import { usePagedList } from '../../hooks/usePagedList.js';
import { useAsyncAction } from '../../hooks/useAsyncAction.js';
import { useFormState } from '../../hooks/useFormState.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const EMPTY_ACCOUNT = { username: '', password: '', role: 'librarian', fullName: '', email: '', department: '' };

export function useAccounts() {
  const { user } = useAuth();
  const toast = useToast();
  const [filters, setFilters] = useState({ q: '', role: '' });
  const [editing, setEditing] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [resetting, setResetting] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const list = usePagedList(adminApi.accounts, filters);

  const roleChange = useAsyncAction((accountId, role) => adminApi.setRole(accountId, role), {
    success: 'Đã đổi vai trò',
    onSuccess: list.reload,
  });
  const passwordReset = useAsyncAction(() => adminApi.resetPassword(resetting.accountId, newPassword), {
    success: 'Đã đặt lại mật khẩu',
    onSuccess: () => {
      setResetting(null);
      setNewPassword('');
    },
  });

  return {
    currentAccountId: user.accountId,
    filters,
    setFilter: (key, value) => setFilters((f) => ({ ...f, [key]: value })),
    list,
    changeRole: (account, role) => roleChange.run(account.accountId, role),
    editing,
    startCreate: () => setEditing({}),
    startEdit: setEditing,
    closeEdit: () => setEditing(null),
    onSaved: () => {
      setEditing(null);
      list.reload();
    },
    toggling,
    askToggle: setToggling,
    closeToggle: () => setToggling(null),
    toggleStatus: async () => {
      await adminApi.setStatus(toggling.accountId, !toggling.status);
      toast.success('Đã cập nhật trạng thái');
      list.reload();
    },
    resetting,
    askReset: setResetting,
    closeReset: () => {
      setResetting(null);
      setNewPassword('');
    },
    newPassword,
    changeNewPassword: (event) => setNewPassword(event.target.value),
    canReset: PASSWORD_RE.test(newPassword) && !passwordReset.busy,
    resetPassword: () => passwordReset.run(),
  };
}

export function useAccountForm({ account, onSaved }) {
  const isEdit = !!account.accountId;
  const form = useFormState({ ...EMPTY_ACCOUNT, ...account, department: account.department || '' }, { resetKey: account.accountId });
  const { values } = form;
  const weakPassword = !isEdit && !!values.password && !PASSWORD_RE.test(values.password);
  const save = useAsyncAction(() => (isEdit ? adminApi.updateAccount(account.accountId, values) : adminApi.createAccount(values)), {
    success: isEdit ? 'Đã cập nhật tài khoản' : 'Cấp tài khoản thành công',
    onSuccess: onSaved,
  });

  return {
    isEdit,
    values,
    field: form.field,
    weakPassword,
    busy: save.busy,
    submit: (event) => {
      event.preventDefault();
      if (!weakPassword) save.run();
    },
  };
}
