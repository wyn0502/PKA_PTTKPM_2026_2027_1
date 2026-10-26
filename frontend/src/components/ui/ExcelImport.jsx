// Dung Pham Anh: Hộp thoại nhập dữ liệu từ Excel: tải tệp mẫu, chọn tệp, xem kết quả từng dòng (thành công/lỗi)
import { FiDownload, FiUpload } from 'react-icons/fi';
import Modal from './Modal.jsx';
import { useExcelImport } from './useExcelImport.js';

export default function ExcelImport({ open, title, template, onImport, onClose, renderCreated }) {
  const excel = useExcelImport({ template, onImport, onClose });
  const { result } = excel;

  return (
    <Modal
      open={open}
      title={title}
      onClose={excel.close}
      width={620}
      footer={
        result ? (
          <button type="button" className="btn btn-primary" onClick={excel.close}>
            Xong
          </button>
        ) : (
          <>
            <button type="button" className="btn" onClick={excel.close}>
              Huỷ bỏ
            </button>
            <button type="button" className="btn btn-primary" onClick={excel.submit} disabled={!excel.file || excel.busy}>
              <FiUpload /> {excel.busy ? 'Đang nhập…' : 'Nhập dữ liệu'}
            </button>
          </>
        )
      }
    >
      {!result ? (
        <div className="stack">
          <p className="muted" style={{ margin: 0 }}>
            Dùng đúng tệp mẫu; dòng 1 là tiêu đề cột. Mỗi lần tối đa 1000 dòng, dòng lỗi được bỏ qua và báo lại.
          </p>
          <button type="button" className="btn" onClick={excel.downloadTemplate}>
            <FiDownload /> Tải tệp mẫu
          </button>
          <input type="file" accept=".xlsx" className="input" onChange={excel.selectFile} />
        </div>
      ) : (
        <div className="stack">
          <div className="alert tone-8">
            Thành công <strong>{result.created.length}</strong> dòng · lỗi <strong>{result.errors.length}</strong> dòng
          </div>
          {renderCreated?.(result.created)}
          {result.errors.length > 0 && (
            <ul className="list-plain scan-list">
              {result.errors.map((e) => (
                <li key={e.row}>
                  <span className="mono">Dòng {e.row}</span>
                  <span className="muted">{e.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  );
}
