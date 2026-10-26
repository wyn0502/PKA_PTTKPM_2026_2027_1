// Dung Pham Anh: Logic biểu mẫu hồ sơ độc giả (UC-02): nạp dữ liệu sửa, chuẩn hoá hạn mức, gửi tạo/cập nhật
import { readerApi } from '../../api/index.js';
import { useAsyncAction } from '../../hooks/useAsyncAction.js';
import { useFormState } from '../../hooks/useFormState.js';

const EMPTY = { fullName: '', email: '', phone: '', studentCode: '', identityNumber: '', readerType: 'student', maxBorrowLimit: '' };

const toForm = (reader) =>
  reader
    ? { ...EMPTY, ...reader, phone: reader.phone || '', studentCode: reader.studentCode || '', identityNumber: reader.identityNumber || '' }
    : EMPTY;

export function useReaderForm({ open, reader, onSaved }) {
  const isEdit = !!reader;
  const form = useFormState(toForm(reader), { open, resetKey: reader?.readerId });
  const save = useAsyncAction(
    () => {
      const { values } = form;
      const payload = { ...values, maxBorrowLimit: values.maxBorrowLimit === '' ? undefined : Number(values.maxBorrowLimit) };
      return isEdit ? readerApi.update(reader.readerId, payload) : readerApi.create(payload);
    },
    { success: isEdit ? 'Đã cập nhật hồ sơ độc giả' : 'Đã tạo hồ sơ, thẻ và tài khoản độc giả', onSuccess: onSaved },
  );

  return {
    isEdit,
    values: form.values,
    field: form.field,
    busy: save.busy,
    submit: (event) => {
      event.preventDefault();
      save.run();
    },
  };
}
