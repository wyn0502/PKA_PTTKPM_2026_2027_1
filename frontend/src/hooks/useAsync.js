// Dung Pham Anh: Hook tải dữ liệu bất đồng bộ: trạng thái loading/error, tải lại, bỏ qua kết quả cũ khi tham số đổi
import { useCallback, useEffect, useRef, useState } from 'react';

export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const requestId = useRef(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const depsKey = JSON.stringify(deps);

  const run = useCallback(async () => {
    const id = ++requestId.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await loaderRef.current();
      if (id === requestId.current) setState({ data, error: null, loading: false });
    } catch (error) {
      if (id === requestId.current) setState((prev) => ({ ...prev, error, loading: false }));
    }
  }, []);

  useEffect(() => {
    run();
  }, [run, depsKey]);

  const setData = useCallback((updater) => {
    setState((prev) => ({ ...prev, data: typeof updater === 'function' ? updater(prev.data) : updater }));
  }, []);

  return { ...state, reload: run, setData };
}
