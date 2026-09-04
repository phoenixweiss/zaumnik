import assert from 'node:assert/strict'
import test from 'node:test'

import { readWords } from '../../scripts/lib/wordFiles.js'
import { normalizeText, normalizeWordKey } from '../../src/data/normalize.js'
import { normalizeSearch } from '../../src/data/search.js'
import { slugify } from '../../src/data/word.js'

test('нормализация поиска сохраняет й, пробелы и дефисы', () => {
  assert.equal(normalizeSearch, normalizeText)
  for (const [input, expected] of [
    [undefined, ''],
    ['', ''],
    ['  ДЕЖАВЮ́  ', 'дежавю'],
    ['Ё́лка', 'елка'],
    ['ЙОД'.normalize('NFD'), 'йод'],
    ['Испа́нский сты́д', 'испанский стыд'],
    ['  ТЕСТ-СЛО́ВО  ', 'тест-слово'],
    ['Два  слова', 'два  слова'],
  ]) {
    assert.equal(normalizeText(input), expected)
    assert.equal(normalizeText(normalizeText(input)), expected)
  }
})

test('ключи YAML сохраняют прежнее отличие от пользовательского поиска', () => {
  assert.equal(normalizeWordKey('  ФЛЁР  '), 'флер')
  assert.equal(normalizeWordKey('ФЛЁ́Р'), 'фле́р')
  assert.equal(normalizeText('ФЛЁ́Р'), 'флер')
})

test('поиск, ключи и адреса всех статей остаются прежними', () => {
  for (const { name, definition } of readWords()) {
    for (const value of [name, definition]) {
      const previous = value
        .normalize('NFD')
        .replace(/\u0301/g, '')
        .normalize('NFC')
        .toLocaleLowerCase('ru-RU')
        .replace(/ё/g, 'е')
        .trim()
      assert.equal(normalizeText(value), previous)
      assert.equal(
        normalizeWordKey(value),
        value.trim().toLocaleLowerCase('ru-RU').replace(/ё/g, 'е'),
      )
    }
    const previousSlug = name
      .normalize('NFD')
      .replace(/\u0301/g, '')
      .normalize('NFC')
      .toLocaleLowerCase('ru-RU')
      .replace(/ё/g, 'е')
      .trim()
      .replace(/[^а-яa-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    assert.equal(slugify(name), previousSlug)
  }
})
