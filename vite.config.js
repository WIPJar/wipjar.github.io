import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  homepage: "https://wipjar.github.io/",
  base: '/',
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})
