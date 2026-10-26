// Dung Pham Anh: Mã vạch CODE128 dạng SVG cho tem bản sao và thẻ độc giả
import { useBarcode } from './useBarcode.js';

export default function Barcode({ value, height = 48, fontSize = 13 }) {
  const ref = useBarcode(value, { height, fontSize });
  return <svg ref={ref} role="img" aria-label={`Mã vạch ${value}`} />;
}
