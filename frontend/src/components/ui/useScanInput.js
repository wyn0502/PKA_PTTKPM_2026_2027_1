// Dung Pham Anh: Logic ô quét mã: giữ giá trị nhập, gửi mã đã chuẩn hoá, mở/đóng camera, nhận mã từ camera
import { useState } from 'react';

export function useScanInput(onSubmit) {
  const [value, setValue] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);

  const submit = (code) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue('');
  };

  return {
    value,
    canSubmit: value.trim().length > 0,
    onChange: (event) => setValue(event.target.value),
    onFormSubmit: (event) => {
      event.preventDefault();
      submit(value);
    },
    cameraOpen,
    openCamera: () => setCameraOpen(true),
    closeCamera: () => setCameraOpen(false),
    onDetected: (code) => {
      setCameraOpen(false);
      submit(code);
    },
  };
}
