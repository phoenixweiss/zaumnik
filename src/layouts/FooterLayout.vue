<script setup>
const appVersion = import.meta.env.VITE_APP_VERSION
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
          Павел Ткачев</a
        >
        <span class="footer-handle">(@phoenixweiss)</span>.
      </small>
    </div>
  </footer>
</template>
