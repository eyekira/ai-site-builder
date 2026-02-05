import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'a6865e35-5791-42ef-a662-1956763250e0-00-9dvwii6p9j91.worf.replit.dev'
    ]
  }
});