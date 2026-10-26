// Dung Pham Anh: Ô quét mã: nhận mã từ máy quét (Enter), nhập tay hoặc camera; tự xoá và giữ focus sau mỗi lần quét
import { forwardRef } from 'react';
import { FiCamera } from 'react-icons/fi';
import ScannerModal from './ScannerModal.jsx';
import { useScanInput } from './useScanInput.js';

const ScanInput = forwardRef(function ScanInput({ placeholder, onSubmit, disabled, buttonLabel = 'Thêm' }, ref) {
  const scan = useScanInput(onSubmit);
  return (
    <>
      <form className="input-group" onSubmit={scan.onFormSubmit}>
        <input
          ref={ref}
          className="input input-scan"
          value={scan.value}
          onChange={scan.onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          spellCheck="false"
        />
        <button type="button" className="btn btn-icon" onClick={scan.openCamera} disabled={disabled} aria-label="Quét bằng camera">
          <FiCamera />
        </button>
        <button type="submit" className="btn btn-primary" disabled={disabled || !scan.canSubmit}>
          {buttonLabel}
        </button>
      </form>
      <ScannerModal open={scan.cameraOpen} onClose={scan.closeCamera} onDetected={scan.onDetected} />
    </>
  );
});

export default ScanInput;
