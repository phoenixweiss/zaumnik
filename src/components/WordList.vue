<script setup>
defineProps({
  entries: { type: Array, required: true },
  resultCount: { type: Number, required: true },
  canShowMore: { type: Boolean, default: false },
})

defineEmits(['select', 'show-more', 'reset'])
</script>

<template>
  <section class="word-list-panel" aria-labelledby="word-list-title">
    <h2 id="word-list-title">
      {{ resultCount }} {{ resultCount === 1 ? 'слово' : 'слов' }}
    </h2>

    <div v-if="entries.length" class="word-list">
      <button
        v-for="entry in entries"
        :key="entry.id"
        class="word-row"
        type="button"
        @click="$emit('select', entry)"
      >
        <strong>{{ entry.displayName }}</strong>
        <small>{{
          entry.hasDefinition ? entry.definition : 'Определение в работе'
        }}</small>
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
      <h3>Такого слова пока нет</h3>
      <button type="button" @click="$emit('reset')">Сбросить поиск</button>
    </div>
  </section>
</template>
