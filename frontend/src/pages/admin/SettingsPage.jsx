// Dung Pham Anh: Màn hình tham số hệ thống (FR-28, NFR-08): các nhóm tham số mượn trả, phí phạt, đặt trước, thẻ
import PageHeader from '../../components/ui/PageHeader.jsx';
import Field from '../../components/ui/Field.jsx';
import LoadingBlock from '../../components/ui/LoadingBlock.jsx';
import ErrorNotice from '../../components/ui/ErrorNotice.jsx';
import { useSettings, SETTING_GROUPS } from './useSettings.js';

export default function SettingsPage() {
  const page = useSettings();
  if (page.error) return <ErrorNotice error={page.error} onRetry={page.reload} />;
  if (!page.ready) return <LoadingBlock />;
  const { definitions, values, isAdmin } = page;

  return (
    <form onSubmit={page.submit}>
      <PageHeader
        marker="FR-28"
        title="Tham số hệ thống"
        description={isAdmin ? 'Thay đổi có hiệu lực ngay, không cần triển khai lại phần mềm.' : 'Chỉ quản trị viên được thay đổi tham số.'}
        actions={
          isAdmin && (
            <button type="submit" className="btn btn-primary" disabled={page.busy || !page.changedCount}>
              {page.busy ? 'Đang lưu…' : `Lưu thay đổi${page.changedCount ? ` (${page.changedCount})` : ''}`}
            </button>
          )
        }
      />
      <div className="grid-2">
        {SETTING_GROUPS.map((group) => (
          <section key={group.title} className="card stack">
            <div className="card-title" style={{ margin: 0 }}>
              {group.title}
            </div>
            {group.keys.map((key) => (
              <Field key={key} label={definitions[key].label} hint={`${definitions[key].min} – ${definitions[key].max}`}>
                <input
                  className="input mono"
                  type="number"
                  min={definitions[key].min}
                  max={definitions[key].max}
                  required
                  disabled={!isAdmin}
                  value={values[key] ?? ''}
                  onChange={page.setValue(key)}
                />
              </Field>
            ))}
          </section>
        ))}
      </div>
    </form>
  );
}
