// Dung Pham Anh: Điểm khởi chạy API: lắng nghe cổng, chạy định kỳ việc hết hạn đặt trước, tắt êm khi dừng
import { createApp } from './app.js';
import { env } from './config/env.js';
import { pool } from './db/pool.js';
import { reservationService } from './services/reservation.service.js';

const EXPIRE_INTERVAL_MS = 10 * 60 * 1000;

const expireReservations = () =>
  reservationService.expireOverdue().catch((error) => console.error('Lỗi xử lý hết hạn đặt trước:', error.message));

const server = createApp().listen(env.port, () => {
  console.log(`API Quản lý Thư viện chạy tại http://localhost:${env.port}/api`);
  expireReservations();
});
const timer = setInterval(expireReservations, EXPIRE_INTERVAL_MS);

const shutdown = () => {
  clearInterval(timer);
  server.close(() => pool.end().finally(() => process.exit(0)));
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
