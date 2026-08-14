import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import content from '@originjs/vite-plugin-content'
import Vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/zaumnik/',
  plugins: [Vue(), content()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
