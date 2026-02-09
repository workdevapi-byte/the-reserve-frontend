import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    proxy: {
      '/api': {
        target: 'https://workdevapi-byte-the-reserve-backend-pezh56wn4.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});


