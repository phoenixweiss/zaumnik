import assert from 'node:assert/strict'
import test from 'node:test'

import { findClosestEntries, normalizeSearch } from '../../src/data/search.js'

const entries = [
  { name: 'Демаркация', slug: 'демаркация' },
  { name: 'Эквилибриум', slug: 'эквилибриум' },
  { name: 'Катарсис', slug: 'катарсис' },
]

test('нормализует регистр, ё и ударение', () => {
  assert.equal(normalizeSearch('  Дежавю́  '), 'дежавю')
  assert.equal(normalizeSearch('Ёмкость'), 'емкость')
})

test('находит слово при замене или перестановке букв', () => {
  assert.deepEqual(
    findClosestEntries(entries, 'деморкация').map((entry) => entry.name),
    ['Демаркация'],
  )
  assert.deepEqual(
    findClosestEntries(entries, 'катрасис').map((entry) => entry.name),
    ['Катарсис'],
  )
})

test('не предлагает слова для короткого или далёкого запроса', () => {
  assert.deepEqual(findClosestEntries(entries, 'ка'), [])
  assert.deepEqual(findClosestEntries(entries, 'прокрастинация'), [])
})
