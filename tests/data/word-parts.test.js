import assert from 'node:assert/strict'
import test from 'node:test'

import { readWords } from '../../scripts/lib/wordFiles.js'
import { formatWord, wordParts } from '../../src/data/word.js'

test('ударение не повторяется на пробелах, дефисах и пунктуации', () => {
  assert.equal(formatWord('Дежавю — тест', [6, 8]), 'Дежавю́ — те́ст')
  assert.deepEqual(wordParts('Дежавю-тест!', [6, 8]), [
    { text: 'Дежав', stressed: false },
    { text: 'ю', stressed: true },
    { text: '-т', stressed: false },
    { text: 'е', stressed: true },
    { text: 'ст!', stressed: false },
  ])
  assert.equal(formatWord('Дежавю!', [6]), 'Дежавю́!')
})

test('части слова учитывают ё и пустое ударение', () => {
  assert.deepEqual(wordParts('Флёр', [3]), [{ text: 'Флёр', stressed: false }])
  assert.deepEqual(wordParts('Слово'), [{ text: 'Слово', stressed: false }])
  assert.deepEqual(wordParts(''), [])
})

test('отображение всех существующих статей сохраняется', () => {
  for (const { name, stress } of readWords()) {
    let position = 0
    const previousFormat = [...name]
      .map((character) => {
        if (/[А-ЯЁа-яё]/.test(character)) position += 1
        return stress.includes(position) && !/[Ёё]/.test(character)
          ? `${character}\u0301`
          : character
      })
      .join('')
    assert.equal(formatWord(name, stress), previousFormat, name)
    assert.equal(
      wordParts(name, stress)
        .map(({ text }) => text)
        .join(''),
      name,
    )
    for (const part of wordParts(name, stress).filter(
      ({ stressed }) => stressed,
    )) {
      assert.match(part.text, /^[АЕИОУЫЭЮЯаеиоуыэюя]$/)
    }
  }
})
