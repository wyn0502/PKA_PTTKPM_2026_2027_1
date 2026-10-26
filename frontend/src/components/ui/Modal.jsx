// Dung Pham Anh: Hộp thoại: đóng bằng Esc/nút X/bấm nền, khoá cuộn trang, dạng bottom-sheet trên điện thoại
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import { useModalEffects } from '../../hooks/useModalEffects.js';

export default function Modal({ open, title, onClose, children, footer, width = 560 }) {
  useModalEffects(open, onClose);
  if (!open) return null;
  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} style={{ '--modal-width': `${width}px` }}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Đóng">
            <FiX />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
