// Dung Pham Anh: Logic hồ sơ độc giả: tải hồ sơ, chọn tab, khoá/mở thẻ, gia hạn thẻ, cấp lại mật khẩu, sửa hồ sơ, in thẻ, xem phiếu
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { readerApi } from '../../api/index.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useToast } from '../../context/ToastContext.jsx';

export const READER_TABS = [
  { key: 'loans', label: 'Phiếu mượn' },
  { key: 'reservations', label: 'Đặt trước' },
  { key: 'fines', label: 'Phí phạt' },
];

function buildActions(id, locked, setCredentials) {
  return {
    lock: {
      title: locked ? 'Mở khoá thẻ' : 'Khoá thẻ',
      message: locked ? 'Mở khoá thẻ và tài khoản của độc giả?' : 'Khoá thẻ do vi phạm? Độc giả sẽ không thể đăng nhập, mượn hoặc đặt trước.',
      danger: !locked,
      run: () => readerApi.setLocked(id, { locked: !locked }),
      done: locked ? 'Đã mở khoá thẻ' : 'Đã khoá thẻ',
    },
    renew: {
      title: 'Gia hạn thẻ',
      message: 'Gia hạn thẻ thêm một kỳ theo tham số “Thời hạn thẻ thư viện”?',
      run: () => readerApi.renewCard(id),
      done: 'Đã gia hạn thẻ',
    },
    reset: {
      title: 'Cấp lại mật khẩu',
      message: 'Tạo mật khẩu tạm mới cho độc giả? Mật khẩu cũ sẽ không dùng được nữa.',
      run: async () => setCredentials(await readerApi.resetPassword(id)),
      done: 'Đã cấp mật khẩu tạm',
    },
  };
}

export function useReaderDetail() {
  const { id } = useParams();
  const toast = useToast();
  const { data: reader, error, loading, reload } = useAsync(() => readerApi.detail(id), [id]);
  const [tab, setTab] = useState('loans');
  const [editing, setEditing] = useState(false);
  const [actionKey, setActionKey] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [printing, setPrinting] = useState(false);
  const [loanId, setLoanId] = useState(null);

  const locked = reader?.cardStatus === 'Locked';
  const action = actionKey ? buildActions(id, locked, setCredentials)[actionKey] : null;

  return {
    reader,
    error,
    loading: loading && !reader,
    reload,
    locked,
    tab,
    setTab,
    editing,
    openEdit: () => setEditing(true),
    closeEdit: () => setEditing(false),
    onEdited: () => {
      setEditing(false);
      reload();
    },
    action,
    askAction: setActionKey,
    closeAction: () => setActionKey(null),
    runAction: async () => {
      await action.run();
      toast.success(action.done);
      reload();
    },
    credentials,
    closeCredentials: () => setCredentials(null),
    printing,
    openPrint: () => setPrinting(true),
    closePrint: () => setPrinting(false),
    loanId,
    openLoan: (loan) => setLoanId(loan.loanId),
    closeLoan: () => setLoanId(null),
  };
}
