import assert from 'node:assert/strict'
import test from 'node:test'

import { parseDictionary } from '../../src/data/parseDictionary.js'

test('парсер читает заголовки, определения и незаполненные статьи', () => {
  const entries = parseDictionary(
    [
      '# Словарь',
      'Вступление',
      '## А',
      '**Аберрация** — Искажение **наблюдения** .',
      'Абстиненция',
      '[Источник](https://example.com)',
      '## Б',
      'Блажь – Каприз.',
    ].join('\r\n'),
  )

  assert.deepEqual(
    entries.map(({ name, letter, definition, hasDefinition }) => ({
      name,
      letter,
      definition,
      hasDefinition,
    })),
    [
      {
        name: 'Аберрация',
        letter: 'А',
        definition: 'Искажение наблюдения.',
        hasDefinition: true,
      },
      {
        name: 'Абстиненция',
        letter: 'А',
        definition: '',
        hasDefinition: false,
      },
      {
        name: 'Блажь',
        letter: 'Б',
        definition: 'Каприз.',
        hasDefinition: true,
      },
    ],
  )
  assert.deepEqual(parseDictionary(''), [])
})

test('парсер сопоставляет ссылки без учёта регистра, ё и ударений', () => {
  const entries = parseDictionary(
    [
      '## Ф',
      '**Флёр** — Покров.',
      '**Фон** — Часто путают с **ФЛЕ́Р** и **флёр**; **Фон**.',
    ].join('\n'),
  )

  assert.deepEqual(entries[1].relations, [
    { slug: 'флер', name: 'Флёр', label: 'Часто путают' },
  ])
  assert.ok(
    entries.every((entry) => !('raw' in entry) && !('referenceNames' in entry)),
  )
})

test('парсер различает отсылки, парные названия и происхождение', () => {
  const entries = parseDictionary(
    [
      '## А',
      '**Альфа** — Начало.',
      '**Алиас (см. Альфа)**',
      '**Аналог (Альфа)**',
      '**Адрес** — (Альфа)',
      '**Антипод** — Противоположное **Альфа**.',
      '**Архе (от греч. начало)** — Основа.',
    ].join('\n'),
  )

  for (const entry of entries.slice(1, 4)) {
    assert.equal(entry.hasDefinition, false)
    assert.deepEqual(entry.relations, [
      { slug: 'альфа', name: 'Альфа', label: 'Связанное' },
    ])
  }
  assert.equal(entries[4].relations[0].label, 'Противоположное')
  assert.equal(entries[5].name, 'Архе')
  assert.equal(entries[5].definition, '(от греч. начало) — Основа.')
  assert.equal(entries[5].hasDefinition, true)
})

test('парсер сохраняет й в ссылке и исключает неразрешённые отсылки', () => {
  const [entry] = parseDictionary(
    '## И\n**Испанский стыд** — Связано с **Кринж**.',
  )
  assert.equal(entry.slug, 'испанский-стыд')
  assert.deepEqual(entry.relations, [])
})
