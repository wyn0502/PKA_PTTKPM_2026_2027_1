// Dung Pham Anh: Logic trang tài khoản của tôi: thông tin phiên, thẻ thư viện của độc giả, đổi mật khẩu
import { authApi, meApi } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { useAsyncAction } from '../hooks/useAsyncAction.js';
import { useFormState } from '../hooks/useFormState.js';

const EMPTY = { currentPassword: '', newPassword: '', confirm: '' };

export function useMyCard() {
  return useAsync(() => meApi.profile(), []);
}

export function useProfile() {
  const { user } = useAuth();
  const form = useFormState(EMPTY);
  const { values } = form;
  const mismatch = !!values.confirm && values.confirm !== values.newPassword;
  const change = useAsyncAction(() => authApi.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }), {
    success: 'Đổi mật khẩu thành công',
    onSuccess: () => form.setValues(EMPTY),
  });

  return {
    user,
    isReader: user.role === 'reader',
    values,
    field: form.field,
    mismatch,
    busy: change.busy,
    submit: (event) => {
      event.preventDefault();
      if (!mismatch) change.run();
    },
  };
}
