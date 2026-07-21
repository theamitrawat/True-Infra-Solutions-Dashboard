import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // ⚠️  Replace 'tis-dashboard' with your actual GitHub repository name.
  // GitHub Pages serves the site from https://<username>.github.io/<repo-name>/
  // so Vite needs to know the base path to resolve assets and routes correctly.
  base: '/tis-dashboard/',
})
