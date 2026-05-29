import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Optional: If you want to change port or other settings later
  server: {
    port: 5173,
  },
});