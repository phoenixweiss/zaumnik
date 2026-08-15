<script setup>
import { APP_NAME, APP_TAGLINE } from '@/constants'
</script>

<template>
  <header class="site-header">
    <nav class="header-inner" aria-label="Основная навигация">
      <div class="header-brand">
        <RouterLink class="brand" to="/" :aria-label="`${APP_NAME} — на главную`">
          <strong>{{ APP_NAME }}</strong>
        </RouterLink>
        <span class="header-separator" aria-hidden="true"></span>
        <span class="header-tagline">{{ APP_TAGLINE }}</span>
      </div>
      <div class="header-right">
        <RouterLink class="header-about" to="/about">
          О проекте
        </RouterLink>
      </div>
    </nav>
  </header>
</template>
