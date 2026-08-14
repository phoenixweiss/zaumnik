<script setup>
defineProps({
  entry: { type: Object, required: true },
  isDaily: { type: Boolean, default: false },
})

defineEmits(['random', 'select-related'])
</script>

<template>
  <article class="word-detail" aria-live="polite">
    <header class="detail-heading">
      <span class="word-letter" aria-hidden="true">{{ entry.letter }}</span>
      <div>
        <p class="eyebrow">{{ isDaily ? 'Слово дня' : 'Словарная статья' }}</p>
        <h2>{{ entry.displayName }}</h2>
      </div>
    </header>

    <div v-if="entry.hasDefinition" class="definition">
      <p>{{ entry.definition }}</p>
    </div>
    <div v-else class="definition draft-definition">
      <span>Черновик</span>
      <p>
        Определение ещё не добавлено. Слово уже в коллекции и ждёт внимательного
        описания.
      </p>
    </div>

    <section
      v-if="entry.relations.length"
      class="relations"
      aria-labelledby="relations-title"
    >
      <p id="relations-title" class="eyebrow">Рядом по смыслу</p>
      <button
        v-for="relation in entry.relations"
        :key="relation.slug"
        class="relation-card"
        type="button"
        @click="$emit('select-related', relation.slug)"
      >
        <small>{{ relation.label }}</small>
        <strong>{{ relation.name }}</strong>
        <span aria-hidden="true">→</span>
      </button>
    </section>

    <section
      v-if="entry.synonyms.length"
      class="synonyms"
      aria-labelledby="synonyms-title"
    >
      <p id="synonyms-title" class="eyebrow">Синонимы</p>
      <ul>
        <li v-for="synonym in entry.synonyms" :key="synonym">{{ synonym }}</li>
      </ul>
    </section>

    <section
      v-if="entry.antonyms.length"
      class="synonyms"
      aria-labelledby="antonyms-title"
    >
      <p id="antonyms-title" class="eyebrow">Антонимы</p>
      <ul>
        <li v-for="antonym in entry.antonyms" :key="antonym">{{ antonym }}</li>
      </ul>
    </section>

    <footer class="detail-footer">
      <button class="random-button" type="button" @click="$emit('random')">
        <span aria-hidden="true">↻</span>
        Другое слово
      </button>
      <span>{{
        entry.hasDefinition ? 'Определение заполнено' : 'Нужно дополнить'
      }}</span>
    </footer>
  </article>
</template>
