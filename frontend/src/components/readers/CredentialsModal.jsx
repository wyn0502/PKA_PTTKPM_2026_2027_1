// Dung Pham Anh: Hiển thị một lần tên đăng nhập và mật khẩu tạm vừa cấp cho độc giả
import Modal from '../ui/Modal.jsx';
import { useCredentials } from './useCredentials.js';

export default function CredentialsModal({ credentials, onClose }) {
  const { copy } = useCredentials(credentials);

  return (
    <Modal
      open={!!credentials}
      title="Tài khoản đăng nhập của độc giả"
      onClose={onClose}
      width={440}
      footer={
        <>
          <button type="button" className="btn" onClick={copy}>
            Sao chép
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Đã ghi lại
          </button>
        </>
      }
    >
      {credentials && (
        <div className="stack">
          <div className="alert tone-1">Mật khẩu tạm chỉ hiển thị một lần. Hãy đưa cho độc giả và nhắc đổi mật khẩu sau khi đăng nhập.</div>
          <dl className="kv">
            <dt>Tên đăng nhập</dt>
            <dd className="code-id">{credentials.username}</dd>
            <dt>Mật khẩu tạm</dt>
            <dd className="mono" style={{ fontSize: 18, fontWeight: 600 }}>
              {credentials.password}
            </dd>
          </dl>
        </div>
      )}
    </Modal>
  );
}
