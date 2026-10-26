// Dung Pham Anh: Đọc biến môi trường và gom cấu hình dùng chung cho backend
import 'dotenv/config';

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Thiếu biến môi trường ${name} (xem backend/.env.example)`);
  return value;
};

export const env = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: required('DATABASE_URL'),
  databaseSsl: process.env.DATABASE_SSL === 'true',
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  corsOrigin: process.env.CORS_ORIGIN === '*' ? '*' : (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim()),
  isProduction: process.env.NODE_ENV === 'production',
};
