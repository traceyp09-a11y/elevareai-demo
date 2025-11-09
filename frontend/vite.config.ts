import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use environment variable or default to localhost for local development
const backendUrl = process.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true
      }
    }
  }
})
