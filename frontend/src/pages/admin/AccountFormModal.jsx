// Dung Pham Anh: Hộp thoại thêm/sửa tài khoản nhân sự (UC-12): tên đăng nhập, vai trò, mật khẩu, hồ sơ thủ thư
import Modal from '../../components/ui/Modal.jsx';
import Field from '../../components/ui/Field.jsx';
import { useAccountForm } from './useAccounts.js';
import { ROLE, toOptions } from '../../utils/labels.js';

export const STAFF_ROLES = toOptions(ROLE).filter((o) => o.value !== 'reader');

export default function AccountFormModal({ account, onClose, onSaved }) {
  const form = useAccountForm({ account, onSaved });
  const { values, field } = form;

  return (
    <Modal
      open
      title={form.isEdit ? `Sửa tài khoản ${account.username}` : 'Thêm tài khoản nhân sự'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Huỷ bỏ
          </button>
          <button type="submit" form="account-form" className="btn btn-primary" disabled={form.busy}>
            Lưu
          </button>
        </>
      }
    >
      <form id="account-form" className="stack" onSubmit={form.submit}>
        {!form.isEdit && (
          <div className="grid-2">
            <Field label="Tên đăng nhập *" hint="Chữ, số, dấu . _ -">
              <input className="input mono" required pattern="[a-zA-Z0-9._\-]{3,50}" value={values.username} onChange={field('username')} />
            </Field>
            <Field label="Vai trò *">
              <select className="select" value={values.role} onChange={field('role')}>
                {STAFF_ROLES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Mật khẩu *" error={form.weakPassword ? 'Tối thiểu 8 ký tự, gồm cả chữ và số' : ''}>
              <input className="input" type="password" autoComplete="new-password" required value={values.password} onChange={field('password')} />
            </Field>
          </div>
        )}
        <Field label="Họ tên *">
          <input className="input" required maxLength={100} value={values.fullName} onChange={field('fullName')} />
        </Field>
        <div className="grid-2">
          <Field label="Email *">
            <input className="input" type="email" required maxLength={100} value={values.email} onChange={field('email')} />
          </Field>
          <Field label="Phòng ban">
            <input className="input" maxLength={100} value={values.department} onChange={field('department')} />
          </Field>
        </div>
      </form>
    </Modal>
  );
}
