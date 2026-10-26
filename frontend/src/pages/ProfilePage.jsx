// Dung Pham Anh: Trang tài khoản của tôi: thẻ thư viện (độc giả) hoặc thông tin nhân sự, và biểu mẫu đổi mật khẩu
import PageHeader from '../components/ui/PageHeader.jsx';
import Field from '../components/ui/Field.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Barcode from '../components/ui/Barcode.jsx';
import LoadingBlock from '../components/ui/LoadingBlock.jsx';
import { useMyCard, useProfile } from './useProfile.js';
import { formatDate, formatMoney } from '../utils/format.js';
import { CARD_STATUS, READER_TYPE, ROLE } from '../utils/labels.js';

function ReaderCard() {
  const { data: card } = useMyCard();
  if (!card) return <LoadingBlock />;
  return (
    <section className="card">
      <div className="card-title">
        Thẻ thư viện <StatusBadge map={CARD_STATUS} value={card.cardStatus} />
      </div>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <Barcode value={card.readerId} />
      </div>
      <dl className="kv">
        <dt>Họ tên</dt>
        <dd>{card.fullName}</dd>
        <dt>Loại thẻ</dt>
        <dd>{READER_TYPE[card.readerType]?.label}</dd>
        <dt>Mã SV/GV</dt>
        <dd className="code-id">{card.studentCode || '—'}</dd>
        <dt>Hạn thẻ</dt>
        <dd className="mono">{formatDate(card.cardExpiryDate)}</dd>
        <dt>Đang mượn</dt>
        <dd className="mono">
          {card.borrowingCount}/{card.maxBorrowLimit} cuốn
        </dd>
        <dt>Nợ phạt</dt>
        <dd className="mono">{formatMoney(card.unpaidFineTotal)}</dd>
      </dl>
    </section>
  );
}

function StaffInfo({ user }) {
  return (
    <section className="card">
      <div className="card-title">Thông tin</div>
      <dl className="kv">
        <dt>Tên đăng nhập</dt>
        <dd className="code-id">{user.username}</dd>
        <dt>Họ tên</dt>
        <dd>{user.fullName}</dd>
        <dt>Email</dt>
        <dd>{user.email}</dd>
        <dt>Mã nhân sự</dt>
        <dd className="code-id">{user.staffId || '—'}</dd>
      </dl>
    </section>
  );
}

export default function ProfilePage() {
  const profile = useProfile();
  const { user, values, field } = profile;

  return (
    <>
      <PageHeader marker="tài khoản" title="Tài khoản của tôi" description={`${user.fullName || user.username} · ${ROLE[user.role]?.label}`} />
      <div className="grid-2">
        {profile.isReader ? <ReaderCard /> : <StaffInfo user={user} />}
        <form className="card stack" onSubmit={profile.submit}>
          <div className="card-title" style={{ margin: 0 }}>
            Đổi mật khẩu
          </div>
          <Field label="Mật khẩu hiện tại">
            <input className="input" type="password" autoComplete="current-password" required value={values.currentPassword} onChange={field('currentPassword')} />
          </Field>
          <Field label="Mật khẩu mới" hint="Tối thiểu 8 ký tự, gồm cả chữ và số">
            <input className="input" type="password" autoComplete="new-password" required minLength={8} value={values.newPassword} onChange={field('newPassword')} />
          </Field>
          <Field label="Nhập lại mật khẩu mới" error={profile.mismatch ? 'Mật khẩu nhập lại không khớp' : ''}>
            <input className="input" type="password" autoComplete="new-password" required value={values.confirm} onChange={field('confirm')} />
          </Field>
          <div>
            <button type="submit" className="btn btn-primary" disabled={profile.busy || profile.mismatch}>
              {profile.busy ? 'Đang lưu…' : 'Đổi mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
