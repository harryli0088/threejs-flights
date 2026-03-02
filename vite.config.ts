import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

console.log("base",process.env.BASE_URL || "")

// https://vite.dev/config/
export default defineConfig({
  base: process.env.BASE_URL || "",
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
})
