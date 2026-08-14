<script setup>
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Найти слово' },
  suggestions: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'select', 'submit'])
const searchInput = ref(null)
const isOpen = ref(false)
const activeIndex = ref(-1)

const showSuggestions = computed(
  () =>
    isOpen.value &&
    Boolean(props.modelValue.trim()) &&
    props.suggestions.length > 0,
)

watch(
  () => props.modelValue,
  (value) => {
    activeIndex.value = -1
    if (!value.trim()) isOpen.value = false
  },
)

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
  isOpen.value = true
}

const selectSuggestion = async (suggestion) => {
  emit('select', suggestion)
  isOpen.value = false
  await nextTick()
  searchInput.value?.focus()
}

const handleKeydown = (event) => {
  if (event.key === 'ArrowDown' && props.suggestions.length) {
    event.preventDefault()
    isOpen.value = true
    activeIndex.value = Math.min(
      activeIndex.value + 1,
      props.suggestions.length - 1,
    )
  } else if (event.key === 'ArrowUp' && props.suggestions.length) {
    event.preventDefault()
    isOpen.value = true
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    const suggestion = props.suggestions[activeIndex.value]
    if (suggestion) selectSuggestion(suggestion)
    else emit('submit')
  } else if (event.key === 'Escape') {
    isOpen.value = false
  }
}

const clearSearch = async () => {
  emit('update:modelValue', '')
  isOpen.value = false
  await nextTick()
  searchInput.value?.focus()
}
</script>

<template>
  <div class="search-field">
    <label class="visually-hidden" for="dictionary-search">
      Найти слово или текст в определении
    </label>
    <svg class="search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.25 15.25 4.75 4.75" />
    </svg>
    <input
      id="dictionary-search"
      ref="searchInput"
      :value="modelValue"
      type="search"
      :placeholder="placeholder"
      autocomplete="off"
      aria-autocomplete="list"
      aria-controls="search-suggestions"
      :aria-expanded="showSuggestions"
      :aria-activedescendant="
        activeIndex >= 0 ? `search-suggestion-${activeIndex}` : undefined
      "
      @input="handleInput"
      @focus="isOpen = true"
      @blur="isOpen = false"
      @keydown="handleKeydown"
    />
    <button
      v-if="modelValue"
      class="search-clear"
      type="button"
      aria-label="Очистить поиск"
      @click="clearSearch"
    >
      ×
    </button>
    <ul
      v-if="showSuggestions"
      id="search-suggestions"
      class="search-suggestions"
      role="listbox"
      aria-label="Подходящие слова"
    >
      <li
        v-for="(suggestion, index) in suggestions"
        :id="`search-suggestion-${index}`"
        :key="suggestion"
        role="option"
        :aria-selected="index === activeIndex"
        :class="{ active: index === activeIndex }"
        @mousedown.prevent
        @click="selectSuggestion(suggestion)"
      >
        {{ suggestion }}
      </li>
    </ul>
  </div>
</template>
