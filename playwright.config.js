import { defineConfig } from '@playwright/test'

import { getSiteConfig } from './config/site.js'

const mode = process.env.ZAUMNIK_BUILD_MODE || 'production'
const site = getSiteConfig(mode)
const appUrl = `http://127.0.0.1:4173${site.base}`

export default defineConfig({
  testDir: './tests/browser',
  metadata: { siteUrl: site.url },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: appUrl,
    browserName: 'chromium',
    colorScheme: 'light',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `yarn preview --mode ${mode} --host 127.0.0.1 --port 4173 --strictPort`,
    url: appUrl,
    reuseExistingServer: false,
  },
})
