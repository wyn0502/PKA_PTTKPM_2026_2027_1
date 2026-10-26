// Dung Pham Anh: Logic ghi nhận trả (UC-08): trả bản sao theo tình trạng, báo mất, mở tính phạt (UC-10) khi có vi phạm, in biên lai
import { useRef, useState } from 'react';
import { circulationApi } from '../../api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { beep } from '../../utils/beep.js';

const MAX_SESSION_RESULTS = 20;

export function useReturn() {
  const toast = useToast();
  const [damaged, setDamaged] = useState(false);
  const [results, setResults] = useState([]);
  const [fineContext, setFineContext] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [lostCode, setLostCode] = useState('');
  const [confirmLost, setConfirmLost] = useState(false);
  const inputRef = useRef(null);

  const handleResult = (result) => {
    setResults((list) => [result, ...list].slice(0, MAX_SESSION_RESULTS));
    if (result.suggestedFines.length) {
      beep({ frequency: 660 });
      setFineContext(result);
    } else {
      toast.success(`Đã nhận trả ${result.barcode}`);
    }
    if (result.heldForReservation) toast.info('Bản sao được giữ cho độc giả đã đặt trước – đặt vào kệ giữ chỗ');
  };

  const returnCopy = async (barcode) => {
    try {
      handleResult(await circulationApi.returnCopy({ barcode, condition: damaged ? 'Damaged' : 'Good' }));
      setDamaged(false);
    } catch (error) {
      beep();
      toast.error(error);
    } finally {
      inputRef.current?.focus();
    }
  };

  const reportLost = async () => {
    handleResult(await circulationApi.reportLost({ barcode: lostCode.trim() }));
    setLostCode('');
  };

  const finishFines = (fines) => {
    setFineContext(null);
    if (fines.length) setReceipt(fines);
    inputRef.current?.focus();
  };

  return {
    inputRef,
    damaged,
    toggleDamaged: (event) => setDamaged(event.target.checked),
    results,
    returnCopy,
    lostCode,
    changeLostCode: (event) => setLostCode(event.target.value.toUpperCase()),
    confirmLost,
    openConfirmLost: () => setConfirmLost(true),
    closeConfirmLost: () => setConfirmLost(false),
    reportLost,
    fineContext,
    finishFines,
    skipFines: () => finishFines([]),
    receipt,
    closeReceipt: () => setReceipt(null),
  };
}
