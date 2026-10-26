// Dung Pham Anh: AccountDTO: thông tin tài khoản không bao gồm mật khẩu băm
export const toAccountDTO = (row) => ({
  accountId: row.account_id,
  username: row.username,
  role: row.role,
  status: row.status,
  failedLoginCount: row.failed_login_count,
  createdAt: row.created_at,
  fullName: row.full_name,
  email: row.email,
  staffId: row.staff_id,
  department: row.department,
  readerId: row.reader_id,
});
