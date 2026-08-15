<script setup>
import { computed, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AlphabetFilter from '@/components/AlphabetFilter.vue'
import SearchField from '@/components/SearchField.vue'
import WordDetail from '@/components/WordDetail.vue'
import WordList from '@/components/WordList.vue'
import { alphabet, dictionary, dictionaryStats } from '@/data/dictionary'
import { useDictionaryStore } from '@/stores/dictionary'

const store = useDictionaryStore()
const route = useRoute()
const router = useRouter()
const resultsPanel = ref(null)

const readyEntries = dictionary.filter((entry) => entry.hasDefinition)
const exampleEntry =
  readyEntries[Math.floor(Math.random() * readyEntries.length)]
const exampleName = `${exampleEntry.displayName[0].toLocaleLowerCase('ru-RU')}${exampleEntry.displayName.slice(1)}`
const searchPlaceholder = `Например, ${exampleName}`

const normalizeSearch = (value) =>
  value
    .normalize('NFD')
    .replace(/\u0301/g, '')
    .normalize('NFC')
    .toLocaleLowerCase('ru-RU')
    .replace(/ё/g, 'е')
    .trim()

const selectedEntry = computed(() =>
  dictionary.find((entry) => entry.slug === route.params.slug),
)

const activeAlphabetLetter = computed(() => {
  const search = normalizeSearch(store.query)
  const normalized = search.toLocaleUpperCase('ru-RU')

  if (search.length === 1 && alphabet.includes(normalized)) {
    const hasMatches = dictionary.some(
      (entry) => entry.letter === normalized,
    )
    if (hasMatches) return normalized
  }

  return store.letter
})

const filteredEntries = computed(() => {
  const search = normalizeSearch(store.query)

  if (search) {
    if (search.length === 1 && activeAlphabetLetter.value) {
      return dictionary.filter(
        (entry) => entry.letter === activeAlphabetLetter.value,
      )
    }

    const nameMatches = dictionary.filter((entry) =>
      normalizeSearch(entry.name).includes(search),
    )

    if (search.length <= 2 || nameMatches.length) {
      return nameMatches
    }

    return dictionary.filter((entry) =>
      [entry.name, entry.definition, ...entry.synonyms, ...entry.antonyms].some(
        (value) => normalizeSearch(value).includes(search),
      ),
    )
  }

  if (store.letter) {
    return dictionary.filter((entry) => entry.letter === store.letter)
  }

  return []
})

const visibleEntries = computed(() =>
  filteredEntries.value.slice(0, store.visibleCount),
)
const showResults = computed(
  () => Boolean(store.query.trim() || store.letter) && !selectedEntry.value,
)
const showResultArea = computed(
  () => showResults.value || Boolean(selectedEntry.value),
)

const searchSuggestions = computed(() => {
  const search = normalizeSearch(store.query)
  if (!search) return []

  return dictionary
    .filter((entry) => normalizeSearch(entry.name).includes(search))
    .sort((left, right) => {
      const leftStarts = normalizeSearch(left.name).startsWith(search)
      const rightStarts = normalizeSearch(right.name).startsWith(search)
      if (leftStarts !== rightStarts) return leftStarts ? -1 : 1
      return left.name.localeCompare(right.name, 'ru-RU')
    })
    .slice(0, 7)
    .map((entry) => entry.displayName)
})

const scrollToResults = async () => {
  await nextTick()
  await new Promise((resolve) =>
    window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)),
  )
  resultsPanel.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const updateQuery = (value) => {
  store.setQuery(value)
  if (route.name === 'word') router.replace({ name: 'dictionary' })
}

const selectEntry = async (entry) => {
  await router.push({ name: 'word', params: { slug: entry.slug } })
  await scrollToResults()
}

const selectSearchSuggestion = (suggestion) => {
  const entry = dictionary.find(
    (item) => normalizeSearch(item.displayName) === normalizeSearch(suggestion),
  )
  if (!entry) return
  store.setQuery(entry.displayName)
  selectEntry(entry)
}

const selectLetter = async (letter) => {
  store.setLetter(letter)
  if (route.name === 'word') await router.replace({ name: 'dictionary' })
  if (store.letter) await scrollToResults()
}

const resetResults = async () => {
  store.reset()
  if (route.name === 'word') await router.push({ name: 'dictionary' })
}

const selectRelated = (slug) => {
  const entry = dictionary.find((item) => item.slug === slug)
  if (!entry) return
  store.reset()
  selectEntry(entry)
}

const selectRandom = () => {
  const candidates = dictionary.filter((entry) => entry.hasDefinition)
  const entry = candidates[Math.floor(Math.random() * candidates.length)]
  store.reset()
  selectEntry(entry)
}
</script>

<template>
  <main>
    <section class="hero container">
      <div class="hero-copy">
        <p class="eyebrow">Редкие · сложные · необычные</p>
        <h1>Слова, которые интересно узнать.</h1>
        <p class="hero-lead">
          Не строгая энциклопедия, а живая коллекция русского языка для тех, кто
          любит открывать новые слова.
        </p>
      </div>
      <div
        class="hero-accent"
        tabindex="0"
        aria-describedby="hard-sign-caption"
      >
        <span aria-hidden="true">Ъ</span>
        <p id="hard-sign-caption" role="tooltip">
          твёрдый знак<br />мягкого любопытства
        </p>
      </div>
      <div class="search-wrap">
        <SearchField
          :model-value="store.query"
          :placeholder="searchPlaceholder"
          :suggestions="searchSuggestions"
          @update:model-value="updateQuery"
          @select="selectSearchSuggestion"
          @submit="scrollToResults"
        />
      </div>
      <div class="hero-alphabet">
        <p class="eyebrow">Или начните с буквы</p>
      <AlphabetFilter
        :letters="alphabet"
        :active-letter="activeAlphabetLetter"
        @select="selectLetter"
      />
        <p class="collection-count">
          <strong>{{ dictionaryStats.total }}</strong> слов в коллекции
        </p>
      </div>
    </section>

    <section
      v-if="showResultArea"
      ref="resultsPanel"
      class="dictionary-results container"
      :class="{ 'detail-only': selectedEntry && !showResults }"
      aria-label="Результаты словаря"
    >
      <WordList
        v-if="showResults"
        :entries="visibleEntries"
        :selected-slug="selectedEntry?.slug"
        :result-count="filteredEntries.length"
        :can-show-more="visibleEntries.length < filteredEntries.length"
        @select="selectEntry"
        @show-more="store.showMore"
        @reset="resetResults"
      />
      <WordDetail
        v-if="selectedEntry"
        :entry="selectedEntry"
        @random="selectRandom"
        @select-related="selectRelated"
      />
    </section>
  </main>
</template>
