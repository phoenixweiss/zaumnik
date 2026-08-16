import assert from 'node:assert/strict'
import test from 'node:test'

import { createPinia, setActivePinia } from 'pinia'

import { useDictionaryStore } from '../../src/stores/dictionary.js'

test('выдача расширяется порциями по десять слов', () => {
  setActivePinia(createPinia())
  const store = useDictionaryStore()

  assert.equal(store.visibleCount, 10)
  store.showMore()
  assert.equal(store.visibleCount, 20)
  store.showMore()
  assert.equal(store.visibleCount, 30)
})

test('новый поиск возвращает размер первой порции', () => {
  setActivePinia(createPinia())
  const store = useDictionaryStore()

  store.showMore()
  store.setQuery('слово')

  assert.equal(store.visibleCount, 10)
})

test('полный список начинается с двадцати слов и расширяется по двадцать', () => {
  setActivePinia(createPinia())
  const store = useDictionaryStore()

  store.showAll()
  assert.equal(store.visibleCount, 20)

  store.showMore(20)
  assert.equal(store.visibleCount, 40)
})
