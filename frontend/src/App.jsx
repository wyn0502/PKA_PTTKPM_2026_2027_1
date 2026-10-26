// Dung Pham Anh: Định tuyến ứng dụng theo vai trò (thủ thư/quản trị viên/độc giả), tải trang theo nhu cầu
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import LoadingBlock from './components/ui/LoadingBlock.jsx';
import LoginPage from './pages/LoginPage.jsx';

const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const BorrowPage = lazy(() => import('./pages/circulation/BorrowPage.jsx'));
const ReturnPage = lazy(() => import('./pages/circulation/ReturnPage.jsx'));
const LoansPage = lazy(() => import('./pages/circulation/LoansPage.jsx'));
const ReservationsPage = lazy(() => import('./pages/circulation/ReservationsPage.jsx'));
const FinesPage = lazy(() => import('./pages/circulation/FinesPage.jsx'));
const TitlesPage = lazy(() => import('./pages/catalog/TitlesPage.jsx'));
const TitleDetailPage = lazy(() => import('./pages/catalog/TitleDetailPage.jsx'));
const CatalogPage = lazy(() => import('./pages/catalog/CatalogPage.jsx'));
const ReadersPage = lazy(() => import('./pages/readers/ReadersPage.jsx'));
const ReaderDetailPage = lazy(() => import('./pages/readers/ReaderDetailPage.jsx'));
const ReportsPage = lazy(() => import('./pages/ReportsPage.jsx'));
const AccountsPage = lazy(() => import('./pages/admin/AccountsPage.jsx'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage.jsx'));
const AuditLogPage = lazy(() => import('./pages/admin/AuditLogPage.jsx'));
const SearchPage = lazy(() => import('./pages/portal/SearchPage.jsx'));
const BookPage = lazy(() => import('./pages/portal/BookPage.jsx'));
const MyLoansPage = lazy(() => import('./pages/portal/MyLoansPage.jsx'));
const MyReservationsPage = lazy(() => import('./pages/portal/MyReservationsPage.jsx'));
const MyFinesPage = lazy(() => import('./pages/portal/MyFinesPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

const STAFF = ['librarian', 'admin'];

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={<LoadingBlock />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route element={<ProtectedRoute roles={STAFF} />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="borrow" element={<BorrowPage />} />
                    <Route path="return" element={<ReturnPage />} />
                    <Route path="loans" element={<LoansPage />} />
                    <Route path="reservations" element={<ReservationsPage />} />
                    <Route path="fines" element={<FinesPage />} />
                    <Route path="titles" element={<TitlesPage />} />
                    <Route path="titles/:isbn" element={<TitleDetailPage />} />
                    <Route path="catalog" element={<CatalogPage />} />
                    <Route path="readers" element={<ReadersPage />} />
                    <Route path="readers/:id" element={<ReaderDetailPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>
                  <Route element={<ProtectedRoute roles={['admin']} />}>
                    <Route path="accounts" element={<AccountsPage />} />
                    <Route path="audit" element={<AuditLogPage />} />
                  </Route>
                  <Route element={<ProtectedRoute roles={['reader']} />}>
                    <Route path="search" element={<SearchPage />} />
                    <Route path="books/:isbn" element={<BookPage />} />
                    <Route path="my/loans" element={<MyLoansPage />} />
                    <Route path="my/reservations" element={<MyReservationsPage />} />
                    <Route path="my/fines" element={<MyFinesPage />} />
                  </Route>
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
