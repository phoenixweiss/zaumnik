<script setup>
defineProps({
  letters: { type: Array, required: true },
  activeLetter: { type: String, default: '' },
})

defineEmits(['select'])
</script>

<template>
  <div class="alphabet" aria-label="Фильтр по первой букве">
    <button
      v-for="letter in letters"
      :key="letter"
      class="letter-button"
      :class="{ active: letter === activeLetter }"
      type="button"
      :aria-pressed="letter === activeLetter"
      @click="$emit('select', letter)"
    >
      {{ letter }}
    </button>
  </div>
</template>
