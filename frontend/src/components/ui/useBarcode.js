// Dung Pham Anh: Logic vẽ mã vạch CODE128 vào phần tử SVG mỗi khi giá trị đổi
import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

export function useBarcode(value, { height, fontSize }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && value) {
      JsBarcode(ref.current, value, { format: 'CODE128', height, fontSize, margin: 4, width: 1.6, font: 'JetBrains Mono' });
    }
  }, [value, height, fontSize]);
  return ref;
}
