<script setup>
import { APP_NAME, APP_TAGLINE } from '@/constants'
</script>

<template>
  <header class="site-header">
    <nav class="header-inner" aria-label="Основная навигация">
      <RouterLink class="brand" to="/" :aria-label="`${APP_NAME} — на главную`">
        <strong>{{ APP_NAME }}</strong>
      </RouterLink>
      <span class="header-tagline">{{ APP_TAGLINE }}</span>
    </nav>
  </header>
</template>
