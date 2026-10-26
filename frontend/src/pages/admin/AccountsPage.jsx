// Dung Pham Anh: Màn hình tài khoản & phân quyền (UC-12): bảng tài khoản, đổi vai trò tại chỗ, khoá/mở, đặt lại mật khẩu
import { FiPlus } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Field from '../../components/ui/Field.jsx';
import Modal from '../../components/ui/Modal.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import ErrorNotice from '../../components/ui/ErrorNotice.jsx';
import AccountFormModal, { STAFF_ROLES } from './AccountFormModal.jsx';
import { useAccounts } from './useAccounts.js';
import { formatDateTime } from '../../utils/format.js';
import { ACCOUNT_STATUS, ROLE, toOptions } from '../../utils/labels.js';

const buildColumns = (page) => [
  { key: 'username', header: 'Tên đăng nhập', render: (r) => <span className="code-id">{r.username}</span> },
  {
    key: 'fullName',
    header: 'Họ tên',
    render: (r) => (
      <>
        {r.fullName} <small className="muted">{r.email}</small>
      </>
    ),
  },
  {
    key: 'role',
    header: 'Vai trò',
    render: (r) =>
      r.staffId && r.accountId !== page.currentAccountId ? (
        <select className="select" style={{ minHeight: 30, padding: '2px 8px' }} value={r.role} onChange={(e) => page.changeRole(r, e.target.value)}>
          {STAFF_ROLES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <StatusBadge map={ROLE} value={r.role} />
      ),
  },
  {
    key: 'status',
    header: 'Trạng thái',
    render: (r) => (
      <>
        <StatusBadge map={ACCOUNT_STATUS} value={r.status} /> {r.failedLoginCount > 0 && <small className="muted">sai {r.failedLoginCount} lần</small>}
      </>
    ),
  },
  { key: 'createdAt', header: 'Ngày tạo', render: (r) => <span className="mono">{formatDateTime(r.createdAt)}</span> },
  {
    key: 'actions',
    header: '',
    className: 'actions',
    render: (r) => (
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        {r.staffId && (
          <button type="button" className="btn btn-sm" onClick={() => page.startEdit(r)}>
            Sửa
          </button>
        )}
        <button type="button" className="btn btn-sm" onClick={() => page.askReset(r)}>
          Đặt mật khẩu
        </button>
        {r.accountId !== page.currentAccountId && (
          <button type="button" className={`btn btn-sm ${r.status ? 'btn-danger' : ''}`} onClick={() => page.askToggle(r)}>
            {r.status ? 'Khoá' : 'Mở khoá'}
          </button>
        )}
      </div>
    ),
  },
];

const toggleMessage = (account) =>
  account.status
    ? `Khoá tài khoản ${account.username}? Người dùng sẽ bị đăng xuất và không thể đăng nhập.`
    : `Mở khoá tài khoản ${account.username} và xoá số lần đăng nhập sai?`;

export default function AccountsPage() {
  const page = useAccounts();
  const { filters, setFilter, list, toggling, resetting } = page;

  return (
    <>
      <PageHeader
        marker="UC-12"
        title="Tài khoản & phân quyền"
        description="Quản trị viên cấp tài khoản cho thủ thư; tài khoản độc giả được tạo khi thủ thư lập hồ sơ độc giả."
        actions={
          <button type="button" className="btn btn-primary" onClick={page.startCreate}>
            <FiPlus /> Thêm tài khoản
          </button>
        }
      />
      <div className="toolbar">
        <Field label="Tìm kiếm" className="grow">
          <SearchInput value={filters.q} onChange={(q) => setFilter('q', q)} placeholder="Tên đăng nhập hoặc họ tên" />
        </Field>
        <Field label="Vai trò">
          <select className="select" value={filters.role} onChange={(e) => setFilter('role', e.target.value)}>
            <option value="">Tất cả</option>
            {toOptions(ROLE).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <ErrorNotice error={list.error} onRetry={list.reload} />
      <section className="card card-flush">
        <DataTable columns={buildColumns(page)} rows={list.data?.items} rowKey={(r) => r.accountId} loading={list.loading} />
        <Pagination page={list.page} pageSize={list.pageSize} total={list.data?.total} onChange={list.setPage} />
      </section>

      {page.editing && <AccountFormModal account={page.editing} onClose={page.closeEdit} onSaved={page.onSaved} />}
      <ConfirmModal
        open={!!toggling}
        title={toggling?.status ? 'Khoá tài khoản' : 'Mở khoá tài khoản'}
        message={toggling && toggleMessage(toggling)}
        danger={toggling?.status}
        onConfirm={page.toggleStatus}
        onClose={page.closeToggle}
      />
      <Modal
        open={!!resetting}
        title={`Đặt lại mật khẩu – ${resetting?.username || ''}`}
        onClose={page.closeReset}
        width={420}
        footer={
          <button type="button" className="btn btn-primary" disabled={!page.canReset} onClick={page.resetPassword}>
            Lưu mật khẩu
          </button>
        }
      >
        <Field label="Mật khẩu mới" hint="Tối thiểu 8 ký tự, gồm cả chữ và số">
          <input className="input" type="password" autoComplete="new-password" value={page.newPassword} onChange={page.changeNewPassword} />
        </Field>
      </Modal>
    </>
  );
}
