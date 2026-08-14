<script setup>
defineProps({ entry: { type: Object, required: true } })

defineEmits(['random', 'select-related'])
</script>

<template>
  <article class="word-detail" aria-live="polite">
    <p>{{ entry.letter }}</p>
    <h2>{{ entry.displayName }}</h2>

    <p v-if="entry.hasDefinition">{{ entry.definition }}</p>
    <p v-else>Определение ещё не добавлено.</p>

    <section v-if="entry.relations.length" aria-label="Связанные слова">
      <button
        v-for="relation in entry.relations"
        :key="relation.slug"
        type="button"
        @click="$emit('select-related', relation.slug)"
      >
        {{ relation.label }}: {{ relation.name }}
      </button>
    </section>

    <p v-if="entry.synonyms.length">
      <strong>Синонимы:</strong> {{ entry.synonyms.join(', ') }}
    </p>
    <p v-if="entry.antonyms.length">
      <strong>Антонимы:</strong> {{ entry.antonyms.join(', ') }}
    </p>

    <button type="button" @click="$emit('random')">Другое слово</button>
  </article>
</template>
