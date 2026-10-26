// Dung Pham Anh: Ô tìm kiếm có biểu tượng kính lúp
import { FiSearch } from 'react-icons/fi';

export default function SearchInput({ value, onChange, placeholder = 'Tìm kiếm…', autoFocus }) {
  return (
    <div style={{ position: 'relative' }}>
      <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
      <input
        className="input"
        style={{ paddingLeft: 36 }}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
    </div>
  );
}
