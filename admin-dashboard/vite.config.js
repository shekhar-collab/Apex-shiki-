import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function getBackendTarget() {
  return process.env.VITE_API_PROXY_TARGET || process.env.VITE_API_URL || 'http://localhost:5000';
}

export default defineConfig({
  plugins: [react()],
  base: '/admin/',
  server: {
    host: '0.0.0.0',
    port: 8000,
    strictPort: true,
    proxy: {
      '/api': {
        target: getBackendTarget(),
        changeOrigin: true,
      },
    },
  },
});
