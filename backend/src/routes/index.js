// Dung Pham Anh: Khai báo toàn bộ endpoint REST /api và quyền truy cập theo vai trò
import { Router } from 'express';
import { authenticate, authorize, STAFF } from '../middlewares/auth.js';
import { uploadExcel } from '../middlewares/upload.js';
import { authController } from '../controllers/auth.controller.js';
import { accountController } from '../controllers/account.controller.js';
import { readerController } from '../controllers/reader.controller.js';
import { catalogController } from '../controllers/catalog.controller.js';
import { circulationController } from '../controllers/circulation.controller.js';
import { reservationController } from '../controllers/reservation.controller.js';
import { fineController } from '../controllers/fine.controller.js';
import { reportController } from '../controllers/report.controller.js';
import { systemController } from '../controllers/system.controller.js';
import { meController } from '../controllers/me.controller.js';

const router = Router();
const staff = authorize(...STAFF);
const admin = authorize('admin');
const reader = authorize('reader');

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.post('/auth/login', authController.login);

router.use(authenticate);

router.get('/auth/me', authController.me);
router.post('/auth/change-password', authController.changePassword);
router.post('/auth/logout', authController.logout);

router.get('/me/profile', reader, meController.profile);
router.get('/me/loans', reader, meController.loans);
router.get('/me/reservations', reader, meController.reservations);
router.get('/me/fines', reader, meController.fines);

router.get('/categories', catalogController.listCategories);
router.post('/categories', staff, catalogController.createCategory);
router.put('/categories/:id', staff, catalogController.updateCategory);
router.delete('/categories/:id', staff, catalogController.deleteCategory);

router.get('/publishers', catalogController.listPublishers);
router.post('/publishers', staff, catalogController.createPublisher);
router.put('/publishers/:id', staff, catalogController.updatePublisher);
router.delete('/publishers/:id', staff, catalogController.deletePublisher);

router.get('/titles', catalogController.searchTitles);
router.post('/titles/import', staff, uploadExcel, catalogController.importTitles);
router.get('/titles/:isbn', catalogController.getTitle);
router.post('/titles', staff, catalogController.createTitle);
router.put('/titles/:isbn', staff, catalogController.updateTitle);
router.delete('/titles/:isbn', staff, catalogController.deleteTitle);
router.post('/titles/:isbn/copies', staff, catalogController.addCopies);

router.get('/copies/:barcode', staff, catalogController.getCopy);
router.put('/copies/:barcode', staff, catalogController.updateCopy);
router.patch('/copies/:barcode/status', staff, catalogController.changeCopyStatus);

router.get('/readers', staff, readerController.list);
router.post('/readers/import', staff, uploadExcel, readerController.importExcel);
router.post('/readers', staff, readerController.create);
router.get('/readers/:id', staff, readerController.detail);
router.put('/readers/:id', staff, readerController.update);
router.patch('/readers/:id/lock', staff, readerController.setLocked);
router.post('/readers/:id/renew-card', staff, readerController.renewCard);
router.post('/readers/:id/reset-password', staff, readerController.resetPassword);

router.get('/circulation/readers/:code', staff, circulationController.checkReader);
router.get('/circulation/copies/:barcode', staff, circulationController.checkCopy);
router.post('/circulation/return', staff, circulationController.returnCopy);
router.post('/circulation/lost', staff, circulationController.reportLost);

router.get('/loans', staff, circulationController.listLoans);
router.post('/loans', staff, circulationController.createLoan);
router.get('/loans/:id', circulationController.getLoan);
router.post('/loans/:id/renew', circulationController.renew);

router.get('/reservations', staff, reservationController.list);
router.post('/reservations', reader, reservationController.create);
router.post('/reservations/:id/cancel', reservationController.cancel);

router.get('/fines', staff, fineController.list);
router.get('/fines/suggest', staff, fineController.suggest);
router.post('/fines', staff, fineController.create);
router.get('/fines/:id', fineController.get);
router.post('/fines/:id/pay', staff, fineController.pay);

router.get('/reports/summary', staff, reportController.summary);
router.get('/reports/:type/export', staff, reportController.exportXlsx);
router.get('/reports/:type', staff, reportController.get);

router.get('/templates/:type', staff, systemController.template);

router.get('/accounts', admin, accountController.list);
router.post('/accounts', admin, accountController.create);
router.put('/accounts/:id', admin, accountController.update);
router.patch('/accounts/:id/status', admin, accountController.setStatus);
router.patch('/accounts/:id/role', admin, accountController.setRole);
router.post('/accounts/:id/reset-password', admin, accountController.resetPassword);

router.get('/settings', staff, systemController.listSettings);
router.put('/settings', admin, systemController.updateSettings);
router.get('/audit-logs', admin, systemController.auditLogs);

export default router;
