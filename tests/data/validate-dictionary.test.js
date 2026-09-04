import assert from 'node:assert/strict'
import test from 'node:test'

import { validateDictionary } from '../../src/data/validateDictionary.js'

const word = (overrides = {}) => ({
  name: 'Блажь',
  stress: [],
  definition: '',
  synonyms: [],
  antonyms: [],
  relations: [],
  ...overrides,
})
const section = (entry) => ({ 'б.yaml': { letter: 'Б', words: [entry] } })

test('проверка допускает черновик и не изменяет исходные данные', () => {
  const files = section(word())
  const before = structuredClone(files)
  assert.equal(validateDictionary(files), 1)
  assert.deepEqual(files, before)
})

test('ошибки полей содержат файл, номер и название статьи', () => {
  for (const overrides of [
    { definition: 42 },
    { definition: null },
    { definition: undefined },
    { stress: null },
    { stress: ['3'] },
    { stress: [2] },
    { synonyms: [42] },
    { antonyms: 'каприз' },
    { relations: undefined },
    { relations: [null] },
    { relations: [{ word: 'Блажь', type: 'unknown' }] },
  ]) {
    assert.throws(
      () => validateDictionary(section(word(overrides))),
      /б\.yaml, статья 1 «Блажь»:/,
    )
  }
})

test('проверка отклоняет неверную структуру секции и статьи', () => {
  for (const value of [null, [], { letter: 1, words: [] }, { letter: 'Б' }]) {
    assert.throws(
      () => validateDictionary({ 'б.yaml': value }),
      /б\.yaml: ожидаются letter/,
    )
  }
  for (const entry of [
    null,
    42,
    {},
    word({ name: '' }),
    word({ name: 'Бла́жь' }),
  ]) {
    assert.throws(() => validateDictionary(section(entry)), /б\.yaml, статья 1/)
  }
})

test('битая связь не отбрасывается молча', () => {
  assert.throws(
    () =>
      validateDictionary(section(word({ relations: [{ word: 'Каприз' }] }))),
    /б\.yaml, статья 1 «Блажь»: связанное слово «Каприз» отсутствует/,
  )
})

test('связи разрешаются между файлами по тем же адресам, что в интерфейсе', () => {
  const files = {
    ...section(word({ relations: [{ word: 'флер' }] })),
    'ф.yaml': { letter: 'Ф', words: [word({ name: 'Флёр', stress: [3] })] },
  }
  assert.equal(validateDictionary(files), 2)
})

test('совпадающие адреса не перезаписывают статьи молча', () => {
  assert.throws(
    () =>
      validateDictionary({
        'ф.yaml': {
          letter: 'Ф',
          words: [word({ name: 'Флёр' }), word({ name: 'Флер' })],
        },
      }),
    /ф\.yaml, статья 2 «Флер»: адрес слова совпадает со статьёй ф\.yaml, статья 1 «Флёр»/,
  )
})
