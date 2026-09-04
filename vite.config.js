import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import content from '@originjs/vite-plugin-content'
import Vue from '@vitejs/plugin-vue'

const appVersion = readFileSync(
  new URL('./VERSION', import.meta.url),
  'utf8',
).trim()

export default defineConfig({
  base: '/zaumnik/',
  build: {
    // Сохраняем целевые браузеры Vite 5 при обновлении сборщика.
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
  },
  plugins: [Vue(), content()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
