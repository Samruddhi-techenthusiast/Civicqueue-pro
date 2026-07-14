import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

<<<<<<< HEAD
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:5000', ws: true, changeOrigin: true },
    },
  },
=======
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
>>>>>>> b39a1f7edfb1750ee70940e959fef7d0938f56e2
})
