// Dung Pham Anh: Bảng dữ liệu theo cấu hình cột, có trạng thái đang tải và rỗng, cuộn ngang trên màn hình hẹp
import { FiInbox } from 'react-icons/fi';
import LoadingBlock from './LoadingBlock.jsx';

export default function DataTable({ columns, rows, rowKey, onRowClick, loading, empty = 'Không có dữ liệu' }) {
  if (loading && !rows?.length) return <LoadingBlock />;
  if (!rows?.length) {
    return (
      <div className="empty">
        <FiInbox />
        {empty}
      </div>
    );
  }
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.className}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className={onRowClick ? 'clickable' : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td key={col.key} className={col.className}>
                  {col.render ? col.render(row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
