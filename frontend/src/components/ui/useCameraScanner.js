// Dung Pham Anh: Logic quét bằng camera: tải html5-qrcode khi cần, bật/tắt camera theo trạng thái mở, trả mã đầu tiên đọc được
import { useEffect, useId, useRef, useState } from 'react';

export function useCameraScanner(open, onDetected) {
  const regionId = `scanner-${useId().replace(/:/g, '')}`;
  const [error, setError] = useState('');
  const handlerRef = useRef(onDetected);
  handlerRef.current = onDetected;

  useEffect(() => {
    if (!open) return undefined;
    let scanner;
    let active = true;
    setError('');

    import('html5-qrcode').then(async ({ Html5Qrcode }) => {
      if (!active) return;
      scanner = new Html5Qrcode(regionId);
      try {
        await scanner.start({ facingMode: 'environment' }, { fps: 12, qrbox: { width: 260, height: 160 } }, (text) => {
          if (!active) return;
          active = false;
          scanner.stop().catch(() => {});
          handlerRef.current(text.trim());
        });
      } catch {
        setError('Không mở được camera. Hãy cấp quyền camera hoặc dùng máy quét/nhập tay.');
      }
    });

    return () => {
      active = false;
      if (scanner?.isScanning) scanner.stop().catch(() => {});
    };
  }, [open, regionId]);

  return { regionId, error };
}
