import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const runtimePortFile = path.resolve(__dirname, '../backend/.runtime-port');

function getBackendTarget() {
  try {
    if (existsSync(runtimePortFile)) {
      const port = readFileSync(runtimePortFile, 'utf8').trim();
      if (port) {
        return `http://localhost:${port}`;
      }
    }
  } catch (error) {
    console.warn('[vite] Could not read backend port file, falling back to default target', error.message);
  }

  return process.env.VITE_API_PROXY_TARGET || 'http://localhost:5000';
}

export default defineConfig({
  plugins: [react()],
  base: '/member/',
  server: {
    host: '0.0.0.0',
    port: 5175,
    proxy: {
      '/api': {
        target: getBackendTarget(),
        changeOrigin: true,
      },
    },
  },
});
