import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // base: '/tis-dashboard/' — only needed for GitHub Pages, not Vercel
  // Vercel serves from root so no base path required
})
