import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use environment variable or default to localhost for local development
const backendUrl = process.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true
      }
    }
  }
})
