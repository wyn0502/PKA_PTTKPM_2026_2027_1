// Dung Pham Anh: Hộp thoại xem trước và in (phiếu mượn, biên lai phạt, tem mã vạch); chỉ vùng .print-area được in
import Modal from '../ui/Modal.jsx';
import { FiPrinter } from 'react-icons/fi';

export default function PrintModal({ open, title, onClose, children, width = 520 }) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      width={width}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Đóng
          </button>
          <button type="button" className="btn btn-primary" onClick={() => window.print()}>
            <FiPrinter /> In
          </button>
        </>
      }
    >
      <div className="print-area">{children}</div>
    </Modal>
  );
}
