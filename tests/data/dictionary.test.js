import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import test from 'node:test'

import yaml from 'js-yaml'

import { formatWord, slugify } from '../../src/data/word.js'

const wordsDirectory = new URL('../../src/data/words/', import.meta.url)

const sections = readdirSync(wordsDirectory)
  .filter((file) => file.endsWith('.yaml'))
  .map((file) => yaml.load(readFileSync(new URL(file, wordsDirectory), 'utf8')))
  .sort((left, right) => left.letter.localeCompare(right.letter, 'ru'))

const words = sections.flatMap((section) =>
  section.words.map((word) => ({ ...word, letter: section.letter })),
)

const expectedWords = [
  'Аберрация',
  'Абстиненция',
  'Блажь',
  'Бифуркация',
  'Вендинг',
  'Вербальный',
  'Гауляйтер',
  'Гештальт',
  'Девиант',
  'Дежавю',
  'Имплементация',
  'Импликация',
  'Кабала',
  'Каверза',
  'Лаг, временной лаг',
  'Либерализм',
  'Манифестация',
  'Манчкин',
  'Натиформа',
  'Неглект',
  'Одиозный',
  'огульный',
  'Паритет',
  'Парнас',
  'Рандеву',
  'Реверанс',
  'Сакральный',
  'Саммит',
  'Тавтология',
  'Теодицея',
  'Фарс',
  'Фарт',
  'Хтонь',
  'Цуцванг',
  'Штрейкбрехер',
  'Штрибан',
  'Эгида',
  'Эгрегор',
]

test('начальный набор взят из первых строк буквенных разделов исходника', () => {
  assert.equal(sections.length, 20)
  assert.equal(words.length, 38)
  assert.deepEqual(
    words
      .map((word) => word.name)
      .sort((left, right) => left.localeCompare(right, 'ru')),
    expectedWords.sort((left, right) => left.localeCompare(right, 'ru')),
  )
})

test('определения оставлены только у двух первых готовых статей', () => {
  assert.deepEqual(
    words.filter((word) => word.definition).map((word) => word.name),
    ['Аберрация', 'Бифуркация'],
  )
})

test('каждая запись содержит расширяемые словарные поля', () => {
  for (const word of words) {
    assert.ok(word.name)
    assert.ok(Array.isArray(word.stress))
    assert.equal(typeof word.definition, 'string')
    assert.ok(Array.isArray(word.synonyms))
    assert.ok(Array.isArray(word.antonyms))
    assert.ok(Array.isArray(word.relations))
  }
})

test('названия уникальны', () => {
  const names = new Set(
    words.map((word) =>
      word.name.toLocaleLowerCase('ru-RU').replace(/ё/g, 'е'),
    ),
  )

  assert.equal(names.size, words.length)
})

test('адрес слова сохраняет русскую букву й', () => {
  assert.equal(slugify('Амбивалентный'), 'амбивалентный')
})

test('ударения нумеруются только по буквам', () => {
  assert.equal(formatWord('Лаг, временной лаг', [6]), 'Лаг, вре́менной лаг')
})
