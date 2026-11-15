import { URL } from 'node:url'

export const getSiteConfig = (mode = 'production') => {
  const url =
    mode === 'domain'
      ? 'https://zaumnik.phoenixweiss.me/'
      : 'https://phoenixweiss.github.io/zaumnik/'

  return { url, base: new URL(url).pathname }
}
