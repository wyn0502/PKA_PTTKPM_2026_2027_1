// Dung Pham Anh: Màn hình nhật ký thao tác (NFR-06): bảng ai làm gì, lúc nào, trên bản ghi nào
import PageHeader from '../../components/ui/PageHeader.jsx';
import Field from '../../components/ui/Field.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import ErrorNotice from '../../components/ui/ErrorNotice.jsx';
import { useAuditLog } from './useAuditLog.js';
import { formatDateTime } from '../../utils/format.js';
import { AUDIT_ACTIONS } from '../../utils/labels.js';

const COLUMNS = [
  { key: 'createdAt', header: 'Thời gian', render: (r) => <span className="mono">{formatDateTime(r.createdAt)}</span> },
  { key: 'username', header: 'Tài khoản', render: (r) => <span className="code-id">{r.username || '—'}</span> },
  { key: 'action', header: 'Thao tác', render: (r) => AUDIT_ACTIONS[r.action] || r.action },
  { key: 'entityId', header: 'Đối tượng', render: (r) => (r.entityId ? <span className="mono">{r.entityId}</span> : '—') },
  { key: 'detail', header: 'Chi tiết', render: (r) => (r.detail ? <small className="mono muted">{JSON.stringify(r.detail).slice(0, 120)}</small> : '—') },
];

export default function AuditLogPage() {
  const { action, setAction, list } = useAuditLog();

  return (
    <>
      <PageHeader marker="NFR-06" title="Nhật ký thao tác" description="Mọi thay đổi dữ liệu mượn – trả, danh mục và tài khoản đều được ghi kèm người thực hiện." />
      <div className="toolbar">
        <Field label="Thao tác">
          <select className="select" value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="">Tất cả</option>
            {Object.entries(AUDIT_ACTIONS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <ErrorNotice error={list.error} onRetry={list.reload} />
      <section className="card card-flush">
        <DataTable columns={COLUMNS} rows={list.data?.items} rowKey={(r) => r.logId} loading={list.loading} />
        <Pagination page={list.page} pageSize={list.pageSize} total={list.data?.total} onChange={list.setPage} />
      </section>
    </>
  );
}
