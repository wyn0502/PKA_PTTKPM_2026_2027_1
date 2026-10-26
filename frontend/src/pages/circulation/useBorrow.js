// Dung Pham Anh: Logic lập phiếu mượn (UC-07): kiểm tra thẻ, kiểm tra từng bản sao, chặn vượt hạn mức, lưu phiếu trong một giao dịch
import { useEffect, useRef, useState } from 'react';
import { circulationApi } from '../../api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { beep } from '../../utils/beep.js';

const describeProblems = (error) =>
  error.details?.problems ? `${error.message}: ${error.details.problems.map((p) => `${p.barcode} – ${p.reason}`).join('; ')}` : error.message;

export function useBorrow() {
  const toast = useToast();
  const [info, setInfo] = useState(null);
  const [cart, setCart] = useState([]);
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const readerInput = useRef(null);
  const copyInput = useRef(null);

  const canScanCopies = !!info && info.blockers.length === 0;
  const limitReached = !!info && cart.length >= info.remaining;

  useEffect(() => {
    (canScanCopies ? copyInput : readerInput).current?.focus();
  }, [canScanCopies]);

  const fail = (message) => {
    beep();
    toast.error(message);
  };

  const reset = () => {
    setInfo(null);
    setCart([]);
    setTimeout(() => readerInput.current?.focus(), 0);
  };

  const scanReader = async (code) => {
    try {
      const data = await circulationApi.checkReader(code);
      setInfo(data);
      setCart([]);
      if (data.blockers.length) beep();
    } catch (error) {
      fail(error);
    }
  };

  const scanCopy = async (code) => {
    if (limitReached) {
      beep();
      toast.warning('Độc giả đã đạt số lượng mượn tối đa');
      return;
    }
    if (cart.some((c) => c.barcode === code.toUpperCase())) {
      toast.warning('Bản sao đã có trong danh sách mượn');
      return;
    }
    try {
      const { copy, canBorrow, reason } = await circulationApi.checkCopy(code, info.reader.readerId);
      if (canBorrow) setCart((list) => [...list, copy]);
      else fail(reason);
    } catch (error) {
      fail(error);
    } finally {
      copyInput.current?.focus();
    }
  };

  const complete = async () => {
    setBusy(true);
    try {
      const loan = await circulationApi.createLoan({ readerId: info.reader.readerId, barcodes: cart.map((c) => c.barcode) });
      toast.success(`Đã lập phiếu ${loan.loanId}`);
      setReceipt(loan);
      reset();
    } catch (error) {
      fail(describeProblems(error));
    } finally {
      setBusy(false);
    }
  };

  return {
    info,
    cart,
    busy,
    receipt,
    readerInput,
    copyInput,
    canScanCopies,
    limitReached,
    canComplete: cart.length > 0 && !busy && canScanCopies,
    scanReader,
    scanCopy,
    removeCopy: (barcode) => setCart((list) => list.filter((c) => c.barcode !== barcode)),
    complete,
    reset,
    closeReceipt: () => setReceipt(null),
  };
}
