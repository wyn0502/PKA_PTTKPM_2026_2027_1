// Dung Pham Anh: Trang đăng nhập (UC-01): giới thiệu hệ thống và biểu mẫu đăng nhập
import { Navigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Field from '../components/ui/Field.jsx';
import { useLogin } from './useLogin.js';

const FEATURES = [
  'Tra cứu đầu sách và số bản sao khả dụng',
  'Lập phiếu mượn – trả bằng quét mã vạch',
  'Đặt trước, gia hạn và theo dõi phí phạt',
  'Thống kê lượt mượn, quá hạn, tồn kho',
];

export default function LoginPage() {
  const login = useLogin();
  if (login.redirectTo) return <Navigate to={login.redirectTo} replace />;

  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <div className="row">
          <img src="/logo.svg" alt="" width="40" height="40" />
          <span className="marker">{'// quản lý thư viện'}</span>
        </div>
        <div>
          <h1 className="text-ramp">Thư viện, gọn trong một màn hình.</h1>
          <ul>
            {FEATURES.map((text, i) => (
              <li key={text}>
                <span className="marker">{String(i + 1).padStart(2, '0')}</span> {text}
              </li>
            ))}
          </ul>
        </div>
        <span className="marker">Nhóm 9 · Phân tích và thiết kế hệ thống thông tin</span>
      </aside>

      <div className="auth-form-wrap">
        <form className="auth-form stack" onSubmit={login.submit} noValidate>
          <div>
            <img src="/logo.svg" alt="" width="48" height="48" />
            <h2 className="text-ramp" style={{ fontSize: 26, marginTop: 12 }}>
              Đăng nhập
            </h2>
            <p className="muted" style={{ margin: '4px 0 0' }}>
              Hệ thống Quản lý Thư viện
            </p>
          </div>
          {login.error && (
            <div className="alert tone-3" role="alert">
              {login.error}
            </div>
          )}
          <Field label="Tên đăng nhập">
            <input className="input" autoComplete="username" autoFocus value={login.values.username} onChange={login.field('username')} />
          </Field>
          <Field label="Mật khẩu">
            <div className="input-group">
              <input
                className="input"
                type={login.showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={login.values.password}
                onChange={login.field('password')}
              />
              <button type="button" className="btn btn-icon" onClick={login.togglePassword} aria-label={login.showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
                {login.showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </Field>
          <button type="submit" className="btn btn-primary" disabled={login.busy} style={{ minHeight: 42 }}>
            {login.busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
          <p className="muted" style={{ margin: 0, fontSize: 12.5 }}>
            Quên mật khẩu? Liên hệ thủ thư (độc giả) hoặc quản trị viên (nhân sự) để được cấp lại.
          </p>
        </form>
      </div>
    </div>
  );
}
