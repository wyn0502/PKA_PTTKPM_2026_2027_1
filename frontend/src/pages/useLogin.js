// Dung Pham Anh: Logic đăng nhập (UC-01): kiểm tra nhập đủ, gọi xác thực, điều hướng theo vai trò hoặc về trang trước đó
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { homePathFor } from '../components/layout/navigation.js';

export function useLogin() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!values.username.trim() || !values.password) {
      setError('Vui lòng nhập đủ tên đăng nhập và mật khẩu');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const sessionUser = await login(values);
      const from = location.state?.from;
      navigate(from && from !== '/login' ? from : homePathFor(sessionUser.role), { replace: true });
    } catch (err) {
      setError(err.message);
      setValues((v) => ({ ...v, password: '' }));
    } finally {
      setBusy(false);
    }
  };

  return {
    redirectTo: user ? homePathFor(user.role) : null,
    values,
    field: (key) => (event) => setValues((v) => ({ ...v, [key]: event.target.value })),
    showPassword,
    togglePassword: () => setShowPassword((v) => !v),
    error,
    busy,
    submit,
  };
}
