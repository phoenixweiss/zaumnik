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

const filteredEntries = computed(() => {
  const search = normalizeSearch(store.query)

  if (search) {
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
  const entry = readyEntries[Math.floor(Math.random() * readyEntries.length)]
  store.reset()
  selectEntry(entry)
}
</script>

<template>
  <main>
    <section class="container dictionary-intro">
      <p>
        <strong>{{ dictionaryStats.total }}</strong> слов в коллекции
      </p>
      <SearchField
        :model-value="store.query"
        :placeholder="searchPlaceholder"
        :suggestions="searchSuggestions"
        @update:model-value="updateQuery"
        @select="selectSearchSuggestion"
        @submit="scrollToResults"
      />
      <AlphabetFilter
        :letters="alphabet"
        :active-letter="store.letter"
        @select="selectLetter"
      />
    </section>

    <section
      v-if="showResults || selectedEntry"
      ref="resultsPanel"
      class="container dictionary-results"
      aria-label="Результаты словаря"
    >
      <WordList
        v-if="showResults"
        :entries="visibleEntries"
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
