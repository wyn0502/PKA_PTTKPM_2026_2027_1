// Dung Pham Anh: Hộp thoại quét mã vạch/QR bằng camera
import Modal from './Modal.jsx';
import { useCameraScanner } from './useCameraScanner.js';

export default function ScannerModal({ open, title = 'Quét mã bằng camera', onDetected, onClose }) {
  const { regionId, error } = useCameraScanner(open, onDetected);
  return (
    <Modal open={open} title={title} onClose={onClose} width={480}>
      {error ? <div className="alert tone-3">{error}</div> : <div id={regionId} className="scanner-region" />}
    </Modal>
  );
}
