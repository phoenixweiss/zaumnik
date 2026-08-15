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

const expectedSeedWords = [
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
  'Лаг',
  'Либерализм',
  'Манифестация',
  'Манчкин',
  'Натиформа',
  'Неглект',
  'Одиозный',
  'Огульный',
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
  'Цугцванг',
  'Штрейкбрехер',
  'Штрибан',
  'Эгида',
  'Эгрегор',
]

test('импортирован полный набор названий из исходной подборки', () => {
  assert.equal(sections.length, 20)
  assert.equal(words.length, 218)

  const names = new Set(words.map((word) => word.name))
  for (const expectedWord of expectedSeedWords) {
    assert.ok(names.has(expectedWord), `Не найдено слово «${expectedWord}»`)
  }
})

test('согласованные заголовки хранятся в единой форме', () => {
  const names = new Set(words.map((word) => word.name))

  for (const name of [
    'Аффирмация',
    'Предтеча',
    'Лаг',
    'Каданс',
    'Эквилибриум',
    'Экивоки',
  ]) {
    assert.ok(names.has(name), `Не найдено слово «${name}»`)
  }

  for (const legacyName of [
    'Аффирмации',
    'Предтечи',
    'Лаг, временной лаг',
    'Каденс',
  ]) {
    assert.ok(
      !names.has(legacyName),
      `Остался старый заголовок «${legacyName}»`,
    )
  }
})

test('все слова получили определения', () => {
  for (const word of words) {
    assert.ok(word.definition)
  }
})

test('подтверждённые синонимы заполнены без самоссылок', () => {
  assert.equal(words.filter((word) => word.synonyms.length).length, 152)

  for (const word of words) {
    const name = word.name.toLocaleLowerCase('ru-RU').replace(/ё/g, 'е')
    for (const synonym of word.synonyms) {
      assert.notEqual(
        synonym.toLocaleLowerCase('ru-RU').replace(/ё/g, 'е'),
        name,
        `${word.name}: синоним не должен повторять само слово`,
      )
    }
  }
})

test('подтверждённые антонимы заполнены без самоссылок', () => {
  assert.equal(words.filter((word) => word.antonyms.length).length, 29)

  for (const word of words) {
    const name = word.name.toLocaleLowerCase('ru-RU').replace(/ё/g, 'е')
    for (const antonym of word.antonyms) {
      assert.notEqual(
        antonym.toLocaleLowerCase('ru-RU').replace(/ё/g, 'е'),
        name,
        `${word.name}: антоним не должен повторять само слово`,
      )
    }
  }
})

test('смысловые связи ведут к словам и работают в обе стороны', () => {
  assert.equal(
    words.reduce((total, word) => total + word.relations.length, 0),
    30,
  )

  const normalize = (value) =>
    value.toLocaleLowerCase('ru-RU').replace(/ё/g, 'е')
  const byName = new Map(words.map((word) => [normalize(word.name), word]))

  for (const word of words) {
    for (const relation of word.relations) {
      const target = byName.get(normalize(relation.word))
      assert.ok(target, `${word.name}: не найдено связанное слово`)

      const reciprocal = target.relations.find(
        (candidate) => normalize(candidate.word) === normalize(word.name),
      )
      assert.equal(
        reciprocal?.type,
        relation.type,
        `${word.name} ↔ ${target.name}: связь должна быть взаимной`,
      )
    }
  }
})

test('для каждого слова указано ударение', () => {
  assert.deepEqual(
    words.filter((word) => word.stress.length === 0),
    [],
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
  assert.equal(
    formatWord('Когнитивный диссонанс', [7, 18]),
    'Когнити́вный диссона́нс',
  )
})

test('однословные статьи показывают выбранный вариант ударения', () => {
  const wordsByName = new Map(words.map((word) => [word.name, word]))
  const expectedForms = new Map([
    ['Дискурс', 'Ди́скурс'],
    ['Катарсис', 'Ката́рсис'],
    ['Эгрегор', 'Эгре́гор'],
    ['Экзальтированный', 'Экзальти́рованный'],
    ['Эмпатия', 'Эмпа́тия'],
  ])

  for (const [name, expected] of expectedForms) {
    const word = wordsByName.get(name)
    assert.equal(formatWord(word.name, word.stress), expected)
  }
})

test('буква ё не получает лишний знак ударения', () => {
  assert.equal(formatWord('Флёр', [3]), 'Флёр')
})

test('позиции ударения указывают только на гласные', () => {
  for (const word of words) {
    const letters = [...word.name].filter((character) =>
      /[А-ЯЁа-яё]/.test(character),
    )

    for (const position of word.stress) {
      assert.match(
        letters[position - 1],
        /[АЕЁИОУЫЭЮЯаеёиоуыэюя]/,
        `${word.name}: ударение ${position} должно приходиться на гласную`,
      )
    }
  }
})
