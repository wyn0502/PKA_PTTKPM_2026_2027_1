// Dung Pham Anh: Logic lập biên lai phạt (UC-10): nhận gợi ý từ lượt trả hoặc tính theo phiếu mượn, chọn/sửa khoản phạt, thu ngay hoặc ghi nợ
import { useEffect, useState } from 'react';
import { fineApi } from '../../api/index.js';
import { useAsyncAction } from '../../hooks/useAsyncAction.js';
import { FINE_TYPE } from '../../utils/labels.js';

const MIN_AMOUNT = 1000;

export function useFineForm({ open, context, onCreated }) {
  const [manual, setManual] = useState({ loanId: '', barcode: '', fineType: 'Overdue' });
  const [drafts, setDrafts] = useState([]);
  const isManual = !context?.suggestedFines?.length;

  useEffect(() => {
    if (!open) return;
    setDrafts((context?.suggestedFines || []).map((s) => ({ ...s, selected: true })));
    setManual({ loanId: context?.loanId || '', barcode: context?.barcode || '', fineType: 'Overdue' });
  }, [open, context]);

  const loanId = isManual ? manual.loanId.trim() : context.loanId;
  const barcode = isManual ? manual.barcode.trim() || null : context.barcode;
  const selected = drafts.filter((d) => d.selected);
  const total = selected.reduce((sum, d) => sum + Number(d.amount || 0), 0);

  const suggestion = useAsyncAction(() => fineApi.suggest({ loanId, barcode, fineType: manual.fineType }), {
    onSuccess: (data) => {
      const reason = `${FINE_TYPE[manual.fineType].label}${data.overdueDays ? ` ${data.overdueDays} ngày` : ''}`;
      setDrafts([{ fineType: manual.fineType, amount: data.amount, reason, selected: true }]);
    },
  });

  const creation = useAsyncAction(
    async (payNow) => {
      const created = [];
      for (const d of selected) {
        created.push(await fineApi.create({ loanId, barcode, fineType: d.fineType, amount: Number(d.amount), reason: d.reason, payNow }));
      }
      return created;
    },
    {
      success: (created) => (created[0]?.isPaid ? 'Đã thu tiền phạt' : 'Đã ghi nhận nợ phạt, thẻ bị hạn chế mượn đến khi thanh toán'),
      onSuccess: onCreated,
    },
  );

  return {
    isManual,
    manual,
    setManualField: (key) => (event) => setManual((m) => ({ ...m, [key]: key === 'fineType' ? event.target.value : event.target.value.toUpperCase() })),
    drafts,
    updateDraft: (index, changes) => setDrafts((list) => list.map((d, i) => (i === index ? { ...d, ...changes } : d))),
    total,
    busy: creation.busy,
    canSuggest: manual.loanId.trim().length > 0,
    canSubmit: !creation.busy && !!loanId && selected.some((d) => Number(d.amount) >= MIN_AMOUNT && d.reason.trim()),
    suggest: () => suggestion.run(),
    collectNow: () => creation.run(true),
    recordDebt: () => creation.run(false),
  };
}
