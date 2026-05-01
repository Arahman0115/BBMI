import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/dist-serve/',
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
