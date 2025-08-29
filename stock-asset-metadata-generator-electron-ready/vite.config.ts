import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚠️ এখানে অবশ্যই তোমার GitHub repo নাম বসাও
export default defineConfig({
  plugins: [react()],
  base: '/stock-asset-metadata-generator/',
})
