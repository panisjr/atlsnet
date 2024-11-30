// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env,
  },
  test: {
    environment: 'jsdom',
    globals: true, // Makes testing-library functions like render globally available
    setupFiles: ['./src/setupTests.ts'], // Optional: For global setup (like jest-dom)
  },
});



