// Dung Pham Anh: Hộp thoại xác nhận thao tác (xoá, khoá, huỷ…): giữ mở và báo lỗi nếu thao tác thất bại
import Modal from './Modal.jsx';
import { useAsyncAction } from '../../hooks/useAsyncAction.js';

export default function ConfirmModal({ open, title, message, confirmLabel = 'Xác nhận', danger, onConfirm, onClose }) {
  const { run, busy } = useAsyncAction(onConfirm, { onSuccess: onClose });
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      width={440}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose} disabled={busy}>
            Huỷ bỏ
          </button>
          <button type="button" className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => run()} disabled={busy}>
            {busy ? 'Đang xử lý…' : confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ margin: 0 }}>{message}</p>
    </Modal>
  );
}
