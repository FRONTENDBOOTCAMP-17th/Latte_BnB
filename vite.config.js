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
        login: resolve(__dirname, 'login/index.html'),
        wishlist: resolve(__dirname, 'wishlist/index.html'),
        profile: resolve(__dirname, 'profile/index.html'),
        reservationCheck: resolve(__dirname, 'reservations-check/index.html'),
        accommodationsDetail: resolve(
          __dirname,
          'accommodations-detail/index.html',
        ),
        reservationRequest: resolve(
          __dirname,
          'reservation-request/index.html',
        ),
        adminLogin: resolve(__dirname, 'admin/login/index.html'),
        adminAdd: resolve(__dirname, 'admin/add/index.html'),
      },
    },
  },
});
