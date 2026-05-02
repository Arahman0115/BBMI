import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/bbm-qt/',
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
