// Dung Pham Anh: Logic biểu mẫu đầu sách (UC-03): nạp dữ liệu sửa, kiểm tra ISBN, gửi tạo/cập nhật
import { catalogApi } from '../../api/index.js';
import { useAsyncAction } from '../../hooks/useAsyncAction.js';
import { useFormState } from '../../hooks/useFormState.js';
import { useCatalogOptions } from '../../hooks/useCatalogOptions.js';
import { isValidIsbn, normalizeIsbn } from '../../utils/isbn.js';

const EMPTY = {
  isbn: '',
  title: '',
  author: '',
  categoryId: '',
  publisherId: '',
  publishYear: '',
  description: '',
  initialCopies: 1,
  shelfLocation: '',
};

const toForm = (title) =>
  title ? { ...EMPTY, ...title, publishYear: title.publishYear ?? '', description: title.description ?? '' } : EMPTY;

export function useTitleForm({ open, title, onSaved }) {
  const isEdit = !!title;
  const { categories, publishers } = useCatalogOptions();
  const form = useFormState(toForm(title), { open, resetKey: title?.isbn });
  const isbn = normalizeIsbn(form.values.isbn);
  const isbnError = form.values.isbn && !isValidIsbn(isbn) ? 'ISBN-10/13 không hợp lệ (sai chữ số kiểm tra)' : '';

  const save = useAsyncAction(
    () => {
      const payload = { ...form.values, isbn };
      return isEdit ? catalogApi.updateTitle(title.isbn, payload) : catalogApi.createTitle(payload);
    },
    {
      success: (saved) =>
        isEdit ? 'Đã cập nhật đầu sách' : `Đã thêm đầu sách${saved.createdBarcodes?.length ? ` và ${saved.createdBarcodes.length} bản sao` : ''}`,
      onSuccess: onSaved,
    },
  );

  return {
    isEdit,
    values: form.values,
    field: form.field,
    categories,
    publishers,
    isbnError,
    busy: save.busy,
    submit: (event) => {
      event.preventDefault();
      if (!isbnError) save.run();
    },
  };
}
