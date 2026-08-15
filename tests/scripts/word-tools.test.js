import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import test from 'node:test'

import yaml from 'js-yaml'

const temporaryWords = () => mkdtempSync(resolve(tmpdir(), 'zaumnik-words-'))

test('команда добавляет слово и сохраняет полную схему', () => {
  const wordsDirectory = temporaryWords()
  const environment = {
    ...process.env,
    ZAUMNIK_WORDS_DIRECTORY: wordsDirectory,
  }

  execFileSync(
    process.execPath,
    [
      'scripts/add-word.js',
      'Абулия',
      '--stress',
      '4',
      '--definition',
      'Состояние ослабленной воли.',
      '--synonyms',
      'безволие',
      '--antonyms',
      'воля',
    ],
    { cwd: resolve('.'), env: environment },
  )

  const section = yaml.load(
    readFileSync(resolve(wordsDirectory, 'а.yaml'), 'utf8'),
  )
  assert.deepEqual(section.words[0], {
    name: 'Абулия',
    stress: [4],
    definition: 'Состояние ослабленной воли.',
    synonyms: ['безволие'],
    antonyms: ['воля'],
    relations: [],
  })
})

test('пересборка сортирует слова и удаляет дубликаты в списках', () => {
  const wordsDirectory = temporaryWords()
  const environment = {
    ...process.env,
    ZAUMNIK_WORDS_DIRECTORY: wordsDirectory,
  }

  writeFileSync(
    resolve(wordsDirectory, 'б.yaml'),
    yaml.dump({
      letter: 'Б',
      words: [
        {
          name: 'Блажь',
          stress: [],
          definition: '',
          synonyms: ['каприз', 'каприз'],
          antonyms: [],
          relations: [],
        },
        {
          name: 'бифуркация',
          stress: [],
          definition: '',
          synonyms: [],
          antonyms: [],
          relations: [],
        },
      ],
    }),
  )

  execFileSync(process.execPath, ['scripts/rebuild-words.js'], {
    cwd: resolve('.'),
    env: environment,
  })

  const section = yaml.load(
    readFileSync(resolve(wordsDirectory, 'б.yaml'), 'utf8'),
  )
  assert.deepEqual(
    section.words.map((word) => word.name),
    ['Бифуркация', 'Блажь'],
  )
  assert.deepEqual(section.words[1].synonyms, ['каприз'])
})

test('безопасный импорт берёт два слова на букву и два определения', () => {
  const fixtureDirectory = temporaryWords()
  const wordsDirectory = temporaryWords()
  const sourcePath = resolve(fixtureDirectory, 'source.md')
  const environment = {
    ...process.env,
    ZAUMNIK_WORDS_DIRECTORY: wordsDirectory,
    ZAUMNIK_SOURCE_PATH: sourcePath,
  }

  writeFileSync(
    sourcePath,
    [
      '## А',
      '**Аберрация** — Первое определение.',
      'Абстиненция',
      '**Аванс** — Не должен импортироваться.',
      '',
      '## Б',
      'Блажь',
      '**Бифуркация** — Второе определение.',
      '**Бонус** — Не должен импортироваться.',
    ].join('\n'),
  )

  execFileSync(process.execPath, ['scripts/import-markdown.js', '--seed'], {
    cwd: resolve('.'),
    env: environment,
  })

  const imported = ['а.yaml', 'б.yaml'].flatMap(
    (file) =>
      yaml.load(readFileSync(resolve(wordsDirectory, file), 'utf8')).words,
  )
  assert.equal(imported.length, 4)
  assert.deepEqual(
    imported.filter((word) => word.definition).map((word) => word.name),
    ['Аберрация', 'Бифуркация'],
  )
})

test('импорт полного списка названий очищает редакционные поля', () => {
  const fixtureDirectory = temporaryWords()
  const wordsDirectory = temporaryWords()
  const sourcePath = resolve(fixtureDirectory, 'source.md')
  const environment = {
    ...process.env,
    ZAUMNIK_WORDS_DIRECTORY: wordsDirectory,
    ZAUMNIK_SOURCE_PATH: sourcePath,
  }

  writeFileSync(
    sourcePath,
    [
      '## А',
      '**Аберра́ция** — Первое определение.',
      'Абстиненция',
      '',
      '## Б',
      '**Бифуркация** — Второе определение.',
    ].join('\n'),
  )

  execFileSync(
    process.execPath,
    ['scripts/import-markdown.js', '--names-only'],
    { cwd: resolve('.'), env: environment },
  )

  const imported = ['а.yaml', 'б.yaml'].flatMap(
    (file) =>
      yaml.load(readFileSync(resolve(wordsDirectory, file), 'utf8')).words,
  )

  assert.deepEqual(
    imported.map((word) => word.name),
    ['Аберрация', 'Абстиненция', 'Бифуркация'],
  )
  for (const word of imported) {
    assert.deepEqual(word.stress, [])
    assert.equal(word.definition, '')
    assert.deepEqual(word.synonyms, [])
    assert.deepEqual(word.antonyms, [])
    assert.deepEqual(word.relations, [])
  }
})

test('импорт исправляет согласованные написания слов', () => {
  const fixtureDirectory = temporaryWords()
  const wordsDirectory = temporaryWords()
  const sourcePath = resolve(fixtureDirectory, 'source.md')
  const environment = {
    ...process.env,
    ZAUMNIK_WORDS_DIRECTORY: wordsDirectory,
    ZAUMNIK_SOURCE_PATH: sourcePath,
  }

  writeFileSync(
    sourcePath,
    [
      '## А',
      'Аль-денте',
      '## Д',
      'Диферамб',
      '## И',
      'Инсенуация',
      '## К',
      'Конгламерат',
      'Коньюктура',
      '## П',
      'Паттернализм',
      'Препон',
      '## Р',
      'Рекеровка',
    ].join('\n'),
  )

  execFileSync(
    process.execPath,
    ['scripts/import-markdown.js', '--names-only'],
    { cwd: resolve('.'), env: environment },
  )

  const imported = readdirSync(wordsDirectory)
    .filter((file) => file.endsWith('.yaml'))
    .flatMap(
      (file) =>
        yaml.load(readFileSync(resolve(wordsDirectory, file), 'utf8')).words,
    )

  assert.deepEqual(
    imported
      .map((word) => word.name)
      .sort((left, right) => left.localeCompare(right, 'ru')),
    [
      'Альденте',
      'Дифирамб',
      'Инсинуация',
      'Конгломерат',
      'Конъюнктура',
      'Патернализм',
      'Препона',
      'Рокировка',
    ].sort((left, right) => left.localeCompare(right, 'ru')),
  )
})

test('импорт без явного режима не изменяет словарные файлы', () => {
  const wordsDirectory = temporaryWords()
  const environment = {
    ...process.env,
    ZAUMNIK_WORDS_DIRECTORY: wordsDirectory,
  }

  assert.throws(() =>
    execFileSync(process.execPath, ['scripts/import-markdown.js'], {
      cwd: resolve('.'),
      env: environment,
      stdio: 'pipe',
    }),
  )
  assert.deepEqual(readdirSync(wordsDirectory), [])
})
