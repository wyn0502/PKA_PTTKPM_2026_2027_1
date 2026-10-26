// Dung Pham Anh: Màn hình danh sách độc giả (UC-02): tìm kiếm, lọc loại thẻ/trạng thái, bảng độc giả, thêm mới và nhập Excel
import { FiPlus, FiUpload } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Field from '../../components/ui/Field.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import ErrorNotice from '../../components/ui/ErrorNotice.jsx';
import ExcelImport from '../../components/ui/ExcelImport.jsx';
import ReaderFormModal from '../../components/readers/ReaderFormModal.jsx';
import CredentialsModal from '../../components/readers/CredentialsModal.jsx';
import { useReaders } from './useReaders.js';
import { formatDate, formatMoney } from '../../utils/format.js';
import { CARD_STATUS, READER_TYPE, toOptions } from '../../utils/labels.js';

const COLUMNS = [
  { key: 'readerId', header: 'Mã thẻ', render: (r) => <span className="code-id">{r.readerId}</span> },
  {
    key: 'fullName',
    header: 'Họ tên',
    render: (r) => (
      <>
        <div style={{ fontWeight: 500 }}>{r.fullName}</div>
        <small className="muted">{r.studentCode || r.email}</small>
      </>
    ),
  },
  { key: 'readerType', header: 'Loại', render: (r) => READER_TYPE[r.readerType]?.label },
  {
    key: 'borrowing',
    header: 'Đang mượn',
    className: 'right',
    render: (r) => (
      <span className="num">
        {r.borrowingCount}/{r.maxBorrowLimit}
      </span>
    ),
  },
  { key: 'fine', header: 'Nợ phạt', className: 'right', render: (r) => (r.unpaidFineTotal ? <span className="num">{formatMoney(r.unpaidFineTotal)}</span> : '—') },
  { key: 'cardExpiryDate', header: 'Hạn thẻ', render: (r) => <span className="mono">{formatDate(r.cardExpiryDate)}</span> },
  { key: 'cardStatus', header: 'Thẻ', render: (r) => <StatusBadge map={CARD_STATUS} value={r.cardStatus} /> },
];

function ImportedAccounts({ created }) {
  if (!created.length) return null;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Mã thẻ</th>
            <th>Họ tên</th>
            <th>Tên đăng nhập</th>
            <th>Mật khẩu tạm</th>
          </tr>
        </thead>
        <tbody>
          {created.map((c) => (
            <tr key={c.readerId}>
              <td className="code-id">{c.readerId}</td>
              <td>{c.fullName}</td>
              <td className="mono">{c.username}</td>
              <td className="mono">{c.password}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ReadersPage() {
  const page = useReaders();
  const { filters, setFilter, list } = page;

  return (
    <>
      <PageHeader
        marker="UC-02"
        title="Độc giả"
        description="Hồ sơ độc giả, thẻ thư viện có thời hạn và tài khoản đăng nhập cổng độc giả."
        actions={
          <>
            <button type="button" className="btn" onClick={page.openImport}>
              <FiUpload /> Nhập Excel
            </button>
            <button type="button" className="btn btn-primary" onClick={page.openCreate}>
              <FiPlus /> Thêm độc giả
            </button>
          </>
        }
      />
      <div className="toolbar">
        <Field label="Tìm kiếm" className="grow">
          <SearchInput value={filters.q} onChange={(q) => setFilter('q', q)} placeholder="Họ tên, mã thẻ, mã SV, email, điện thoại" />
        </Field>
        <Field label="Loại thẻ">
          <select className="select" value={filters.type} onChange={(e) => setFilter('type', e.target.value)}>
            <option value="">Tất cả</option>
            {toOptions(READER_TYPE).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Trạng thái thẻ">
          <select className="select" value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
            <option value="">Tất cả</option>
            <option value="active">Còn hiệu lực</option>
            <option value="expired">Hết hạn</option>
            <option value="locked">Bị khoá</option>
          </select>
        </Field>
      </div>
      <ErrorNotice error={list.error} onRetry={list.reload} />
      <section className="card card-flush">
        <DataTable columns={COLUMNS} rows={list.data?.items} rowKey={(r) => r.readerId} loading={list.loading} onRowClick={page.openReader} empty="Không có độc giả phù hợp" />
        <Pagination page={list.page} pageSize={list.pageSize} total={list.data?.total} onChange={list.setPage} />
      </section>

      <ReaderFormModal open={page.creating} onClose={page.closeCreate} onSaved={page.onCreated} />
      <CredentialsModal credentials={page.credentials} onClose={page.closeCredentials} />
      <ExcelImport
        open={page.importing}
        title="Nhập độc giả từ Excel"
        template="readers"
        onImport={page.importReaders}
        onClose={page.closeImport}
        renderCreated={(created) => <ImportedAccounts created={created} />}
      />
    </>
  );
}
