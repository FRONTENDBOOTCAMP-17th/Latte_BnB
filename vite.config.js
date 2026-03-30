import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        landing: resolve(__dirname, 'index.html'),
        signup: resolve(__dirname, 'signup/index.html'),
        roomsDetail: resolve(__dirname, 'rooms-detail/index.html'),
      },
    },
  },
});
