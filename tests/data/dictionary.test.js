import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import test from 'node:test'

import yaml from 'js-yaml'

import { formatWord, slugify, wordForm } from '../../src/data/word.js'

const wordsDirectory = new URL('../../src/data/words/', import.meta.url)

const sections = readdirSync(wordsDirectory)
  .filter((file) => file.endsWith('.yaml'))
  .map((file) => yaml.load(readFileSync(new URL(file, wordsDirectory), 'utf8')))
  .sort((left, right) => left.letter.localeCompare(right.letter, 'ru'))

const words = sections.flatMap((section) =>
  section.words.map((word) => ({ ...word, letter: section.letter })),
)

// Снимок согласованной коллекции. Обновлять только при намеренном изменении
// данных, не вычислять из YAML: эти значения защищают от случайной потери статей.
const expectedDictionaryCounts = {
  letterSections: 21,
  words: 282,
  wordsWithSynonyms: 199, // Число статей, не отдельных синонимов.
  wordsWithAntonyms: 42, // Число статей, не отдельных антонимов.
  directedRelations: 92, // Взаимная связь А ↔ Б считается как два перехода.
}

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
  'Апофения',
  'Палимпсест',
  'Трюизм',
  'Фронда',
  'Идиосинкразия',
  'Обскурантизм',
  'Коннотация',
  'Лиминальный',
  'Канон',
  'Ремиссия',
  'Сиквел',
  'Приквел',
  'Кринж',
  'Испанский стыд',
  'Экспромт',
  'Ремарка',
  'Казус',
  'Амбиция',
  'Памфлет',
  'Сенсация',
  'Сессия',
  'Фасилитация',
  'Импровизация',
  'Пролептический',
  'Конторсия',
  'Драндулет',
  'Каракули',
  'Манатки',
  'Аллюзия',
  'Импакт',
  'Нарратив',
  'Проспективный',
  'Ретроспективный',
  'Гуинплен',
  'Отроверт',
  'Кураж',
  'Рожон',
  'Рефрен',
  'Тритагонист',
  'Интрига',
  'Бенефис',
  'Адюльтер',
  'Синекура',
  'Перипетия',
  'Абориген',
  'Бутуз',
  'Автохтон',
  'Аллохтон',
  'Опрессия',
  'Карапуз',
  'Вернисаж',
  'Конференция',
  'Конфронтация',
  'Дилетант',
  'Диссидент',
  'Цимес',
  'Идиома',
  'Дивергент',
  'Конструкт',
  'Контингент',
  'Бойкот',
  'Конвергент',
]

test('словарь содержит исходную подборку и согласованные дополнения', () => {
  assert.equal(sections.length, expectedDictionaryCounts.letterSections)
  assert.equal(words.length, expectedDictionaryCounts.words)

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
  assert.equal(
    words.filter((word) => word.synonyms.length).length,
    expectedDictionaryCounts.wordsWithSynonyms,
  )

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
  assert.equal(
    words.filter((word) => word.antonyms.length).length,
    expectedDictionaryCounts.wordsWithAntonyms,
  )

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
    expectedDictionaryCounts.directedRelations,
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

test('новые статьи сохраняют согласованные ударения и смысловые связи', () => {
  const byName = new Map(words.map((word) => [word.name, word]))
  const expectedForms = new Map([
    ['Ремиссия', 'Реми́ссия'],
    ['Сиквел', 'Си́квел'],
    ['Приквел', 'При́квел'],
    ['Кринж', 'Кри́нж'],
    ['Испанский стыд', 'Испа́нский сты́д'],
    ['Гуинплен', 'Гуинпле́н'],
    ['Отроверт', 'Отрове́рт'],
    ['Кураж', 'Кура́ж'],
    ['Рожон', 'Рожо́н'],
    ['Рефрен', 'Рефре́н'],
    ['Тритагонист', 'Тритагони́ст'],
    ['Интрига', 'Интри́га'],
    ['Бенефис', 'Бенефи́с'],
    ['Адюльтер', 'Адюльте́р'],
    ['Синекура', 'Синеку́ра'],
    ['Перипетия', 'Перипети́я'],
    ['Абориген', 'Абориге́н'],
    ['Бутуз', 'Буту́з'],
    ['Автохтон', 'Автохто́н'],
    ['Аллохтон', 'Аллохто́н'],
    ['Опрессия', 'Опре́ссия'],
    ['Карапуз', 'Карапу́з'],
    ['Вернисаж', 'Верниса́ж'],
    ['Конференция', 'Конфере́нция'],
    ['Конфронтация', 'Конфронта́ция'],
    ['Дилетант', 'Дилета́нт'],
    ['Диссидент', 'Диссиде́нт'],
    ['Цимес', 'Ци́мес'],
    ['Идиома', 'Идио́ма'],
    ['Дивергент', 'Диверге́нт'],
    ['Конструкт', 'Констру́кт'],
    ['Контингент', 'Континге́нт'],
    ['Бойкот', 'Бойко́т'],
    ['Конвергент', 'Конверге́нт'],
  ])

  for (const [name, expected] of expectedForms) {
    const word = byName.get(name)
    assert.equal(formatWord(word.name, word.stress), expected)
  }

  for (const name of ['Ремиссия', 'Кринж', 'Испанский стыд']) {
    assert.deepEqual(byName.get(name).synonyms, [])
  }

  for (const [name, relatedNames] of [
    ['Ремиссия', []],
    ['Сиквел', ['Приквел']],
    ['Приквел', ['Сиквел']],
    ['Кринж', ['Испанский стыд', 'Моветон']],
    ['Испанский стыд', ['Кринж']],
    ['Карапуз', ['Бутуз']],
    ['Диссидент', ['Фронда']],
    ['Идиома', ['Семантика']],
  ]) {
    assert.deepEqual(
      byName.get(name).relations,
      relatedNames.map((word) => ({ word, type: 'related' })),
    )
  }

  assert.deepEqual(byName.get('Конференция').relations, [
    { word: 'Саммит', type: 'confused' },
  ])
  assert.deepEqual(byName.get('Саммит').relations, [
    { word: 'Конференция', type: 'confused' },
  ])
  assert.deepEqual(byName.get('Дивергент').relations, [
    { word: 'Конвергент', type: 'opposite' },
  ])
  assert.deepEqual(byName.get('Конвергент').relations, [
    { word: 'Дивергент', type: 'opposite' },
  ])
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

test('счётчики слов используют правильное склонение', () => {
  for (const [count, expected] of [
    [0, 'слов'],
    [1, 'слово'],
    [2, 'слова'],
    [4, 'слова'],
    [5, 'слов'],
    [11, 'слов'],
    [12, 'слов'],
    [14, 'слов'],
    [21, 'слово'],
    [111, 'слов'],
    [114, 'слов'],
    [229, 'слов'],
    [234, 'слова'],
  ]) {
    assert.equal(wordForm(count), expected)
  }
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
