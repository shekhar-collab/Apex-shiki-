import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getBackendTarget() {
  return process.env.VITE_API_PROXY_TARGET || process.env.VITE_API_URL || 'http://localhost:5001';
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: getBackendTarget(),
        changeOrigin: true,
      },
    },
  },
});
