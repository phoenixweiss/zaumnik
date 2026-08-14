<script setup>
defineProps({
  entries: { type: Array, required: true },
  selectedSlug: { type: String, default: '' },
  resultCount: { type: Number, required: true },
  canShowMore: { type: Boolean, default: false },
})

defineEmits(['select', 'show-more', 'reset'])
</script>

<template>
  <section class="word-list-panel" aria-labelledby="word-list-title">
    <header class="panel-heading">
      <div>
        <p class="eyebrow">Коллекция</p>
        <h2 id="word-list-title">
          {{ resultCount }} {{ resultCount === 1 ? 'слово' : 'слов' }}
        </h2>
      </div>
      <span class="list-key"><i class="ready-dot"></i> с определением</span>
    </header>

    <div v-if="entries.length" class="word-list">
      <button
        v-for="entry in entries"
        :key="entry.id"
        class="word-row"
        :class="{ selected: entry.slug === selectedSlug }"
        type="button"
        @click="$emit('select', entry)"
      >
        <span>
          <strong>{{ entry.displayName }}</strong>
          <small>{{
            entry.hasDefinition ? entry.definition : 'Определение в работе'
          }}</small>
        </span>
        <i
          :class="entry.hasDefinition ? 'ready-dot' : 'draft-dot'"
          aria-hidden="true"
        ></i>
      </button>

      <button
        v-if="canShowMore"
        class="show-more"
        type="button"
        @click="$emit('show-more')"
      >
        Показать ещё
      </button>
    </div>

    <div v-else class="empty-state">
      <span aria-hidden="true">∅</span>
      <h3>Такого слова пока нет</h3>
      <p>Попробуйте другую формулировку или вернитесь ко всему словарю.</p>
      <button class="text-button" type="button" @click="$emit('reset')">
        Сбросить поиск
      </button>
    </div>
  </section>
</template>
