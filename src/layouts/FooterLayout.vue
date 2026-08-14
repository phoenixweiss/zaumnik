<script setup>
import packageMetadata from '../../package.json'

const appVersion = packageMetadata.version
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <small class="footer-version">
        <strong>Заумникъ</strong> · версия {{ appVersion }}
      </small>
      <small class="footer-stack" aria-label="Технологии проекта">
        <a href="https://vuejs.org/" target="_blank" rel="noreferrer">Vue</a>
        <span aria-hidden="true">·</span>
        <a href="https://vite.dev/" target="_blank" rel="noreferrer">Vite</a>
        <span aria-hidden="true">·</span>
        <a href="https://sass-lang.com/" target="_blank" rel="noreferrer"
          >Sass</a
        >
      </small>
      <small class="footer-credit">
        &copy; {{ currentYear }}
        <a href="https://phoenixweiss.me" target="_blank" rel="noreferrer">
          Павел Ткачев <em>(@phoenixweiss)</em></a
        >.
      </small>
    </div>
  </footer>
</template>
