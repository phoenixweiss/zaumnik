import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import content from '@originjs/vite-plugin-content'
import Vue from '@vitejs/plugin-vue'

import { getSiteConfig } from './config/site.js'

const appVersion = readFileSync(
  new URL('./VERSION', import.meta.url),
  'utf8',
).trim()

export default defineConfig(({ mode }) => {
  const site = getSiteConfig(mode)

  return {
    base: site.base,
    build: {
      // Сохраняем целевые браузеры Vite 5 при обновлении сборщика.
      target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    },
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
    },
    plugins: [
      Vue(),
      content(),
      {
        name: 'site-metadata',
        transformIndexHtml: {
          order: 'pre',
          handler: (html) => html.replaceAll('__SITE_URL__', site.url),
        },
      },
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
