// Dung Pham Anh: Logic nhập Excel: chọn tệp, tải tệp mẫu, gửi tệp và giữ kết quả từng dòng
import { useState } from 'react';
import { adminApi } from '../../api/index.js';
import { useAsyncAction } from '../../hooks/useAsyncAction.js';

export function useExcelImport({ template, onImport, onClose }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const upload = useAsyncAction(() => onImport(file), {
    success: (data) => `Đã nhập ${data.created.length} dòng`,
    onSuccess: setResult,
  });
  const download = useAsyncAction(() => adminApi.downloadTemplate(template));

  return {
    file,
    result,
    busy: upload.busy,
    selectFile: (event) => setFile(event.target.files?.[0] || null),
    submit: () => upload.run(),
    downloadTemplate: () => download.run(),
    close: () => {
      setFile(null);
      setResult(null);
      onClose();
    },
  };
}
