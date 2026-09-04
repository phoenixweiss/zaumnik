<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'

import WordName from './WordName.vue'

const props = defineProps({
  entry: { type: Object, required: true },
})

defineEmits(['random', 'select-related'])

const copyState = ref('idle')
let resetCopyStateTimer

const copyText = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.readOnly = true
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.append(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  if (!copied) throw new Error('copy failed')
}

const copyWordLink = async () => {
  try {
    await copyText(window.location.href)
    copyState.value = 'copied'
    window.clearTimeout(resetCopyStateTimer)
    resetCopyStateTimer = window.setTimeout(() => {
      copyState.value = 'idle'
    }, 2500)
  } catch {
    copyState.value = 'error'
  }
}

watch(
  () => props.entry.slug,
  () => {
    copyState.value = 'idle'
    window.clearTimeout(resetCopyStateTimer)
  },
)

onBeforeUnmount(() => window.clearTimeout(resetCopyStateTimer))
</script>

<template>
  <article class="word-detail" aria-live="polite">
    <div class="detail-layout">
      <div class="detail-main">
        <header class="detail-heading">
          <span class="word-letter" aria-hidden="true">{{ entry.letter }}</span>
          <div>
            <h2><WordName :name="entry.name" :stress="entry.stress" /></h2>
          </div>
        </header>

        <div v-if="entry.hasDefinition" class="definition">
          <p>{{ entry.definition }}</p>
        </div>
        <div v-else class="definition draft-definition">
          <span>Черновик</span>
          <p>
            Определение ещё не добавлено. Слово уже в коллекции и ждёт
            внимательного описания.
          </p>
        </div>
      </div>

      <aside
        v-if="
          entry.relations.length ||
          entry.synonyms.length ||
          entry.antonyms.length
        "
        class="detail-aside"
        aria-label="Связи слова"
      >
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
            <strong>
              <WordName :name="relation.name" :stress="relation.stress" />
            </strong>
            <span aria-hidden="true">→</span>
          </button>
        </section>

        <div
          v-if="entry.synonyms.length || entry.antonyms.length"
          class="word-pairs"
        >
          <section
            v-if="entry.synonyms.length"
            class="synonyms"
            aria-labelledby="synonyms-title"
          >
            <p id="synonyms-title" class="eyebrow">Синонимы</p>
            <ul>
              <li v-for="synonym in entry.synonyms" :key="synonym">
                {{ synonym }}
              </li>
            </ul>
          </section>

          <section
            v-if="entry.antonyms.length"
            class="synonyms"
            aria-labelledby="antonyms-title"
          >
            <p id="antonyms-title" class="eyebrow">Антонимы</p>
            <ul>
              <li v-for="antonym in entry.antonyms" :key="antonym">
                {{ antonym }}
              </li>
            </ul>
          </section>
        </div>
      </aside>
    </div>

    <footer class="detail-footer">
      <div class="detail-actions">
        <button class="random-button" type="button" @click="$emit('random')">
          <span aria-hidden="true">↻</span>
          Другое слово
        </button>
        <button
          class="copy-link-button"
          type="button"
          :aria-label="
            copyState === 'copied'
              ? `Ссылка на слово «${entry.name}» скопирована`
              : `Скопировать ссылку на слово «${entry.name}»`
          "
          @click="copyWordLink"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="8" y="8" width="11" height="11" rx="1" />
            <path d="M16 8V5H5v11h3" />
          </svg>
          {{
            copyState === 'copied'
              ? 'Ссылка скопирована'
              : copyState === 'error'
                ? 'Попробовать ещё'
                : 'Скопировать ссылку'
          }}
        </button>
      </div>
      <span>{{
        entry.hasDefinition ? 'Определение заполнено' : 'Нужно дополнить'
      }}</span>
    </footer>
  </article>
</template>
