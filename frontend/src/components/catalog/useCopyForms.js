// Dung Pham Anh: Logic hộp thoại bản sao (UC-04): thêm hàng loạt, sửa vị trí/tình trạng, chuyển trạng thái được phép theo bảng 4.5
import { catalogApi } from '../../api/index.js';
import { useAsyncAction } from '../../hooks/useAsyncAction.js';
import { useFormState } from '../../hooks/useFormState.js';
import { MANUAL_COPY_TRANSITIONS } from '../../utils/labels.js';

const NEW_COPIES = { quantity: 1, shelfLocation: '', physicalCondition: 'Good' };

export function useAddCopies({ open, isbn, onAdded }) {
  const form = useFormState(NEW_COPIES, { open });
  const save = useAsyncAction(() => catalogApi.addCopies(isbn, { ...form.values, quantity: Number(form.values.quantity) }), {
    onSuccess: onAdded,
  });
  return {
    values: form.values,
    field: form.field,
    busy: save.busy,
    canSubmit: Number(form.values.quantity) >= 1 && !save.busy,
    submit: () => save.run(),
  };
}

export function useEditCopy({ copy, onSaved }) {
  const form = useFormState(
    { shelfLocation: copy?.shelfLocation || '', physicalCondition: copy?.physicalCondition || 'Good', status: '', note: '' },
    { open: !!copy, resetKey: copy?.barcode },
  );
  const { values } = form;
  const save = useAsyncAction(
    async () => {
      await catalogApi.updateCopy(copy.barcode, { shelfLocation: values.shelfLocation, physicalCondition: values.physicalCondition });
      if (values.status) await catalogApi.setCopyStatus(copy.barcode, { status: values.status, note: values.note });
    },
    { success: 'Đã cập nhật bản sao', onSuccess: onSaved },
  );
  return {
    values,
    field: form.field,
    transitions: copy ? MANUAL_COPY_TRANSITIONS[copy.loanStatus] : [],
    busy: save.busy,
    submit: () => save.run(),
  };
}
