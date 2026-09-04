<script setup>
import { computed } from 'vue'

import { formatWord, wordParts } from '../data/word'

const props = defineProps({
  name: { type: String, required: true },
  stress: { type: Array, default: () => [] },
})

const parts = computed(() => wordParts(props.name, props.stress))
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
