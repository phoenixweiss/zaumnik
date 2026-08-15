<script setup>
import { computed } from 'vue'

import { formatWord } from '../data/word'

const props = defineProps({
  name: { type: String, required: true },
  stress: { type: Array, default: () => [] },
})

const parts = computed(() => {
  const positions = new Set(props.stress)
  const result = []
  let letterPosition = 0

  for (const character of props.name) {
    if (/[А-ЯЁа-яё]/.test(character)) letterPosition += 1
    const stressed = positions.has(letterPosition) && !/[Ёё]/.test(character)
    const previous = result.at(-1)

    if (!stressed && previous && !previous.stressed) {
      previous.text += character
    } else {
      result.push({ text: character, stressed })
    }
  }

  return result
})
</script>

<template>
  <span class="word-name" :aria-label="formatWord(name, stress)">
    <span aria-hidden="true">
      <template v-for="(part, index) in parts" :key="index">
        <span v-if="part.stressed" class="stress-mark">{{ part.text }}</span>
        <template v-else>{{ part.text }}</template>
      </template>
    </span>
  </span>
</template>
