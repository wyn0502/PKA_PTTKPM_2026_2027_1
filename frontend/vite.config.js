// Dung Pham Anh: Cấu hình Vite: plugin React, proxy /api sang backend Express khi phát triển, tách chunk thư viện lớn
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: { '/api': env.VITE_PROXY_TARGET || 'http://localhost:4000' },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            charts: ['recharts'],
            scanner: ['html5-qrcode'],
          },
        },
      },
    },
  };
});
