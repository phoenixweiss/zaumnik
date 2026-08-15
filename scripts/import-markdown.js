import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { projectRoot, writeWords } from './lib/wordFiles.js'
import { parseDictionary } from '../src/data/parseDictionary.js'

const mode = process.argv[2]
const usage = `
Импорт исходного Markdown:
  yarn words:import -- --seed       # первые два слова на букву, два определения
  yarn words:import -- --all        # вся исходная подборка со старыми данными
  yarn words:import -- --names-only # вся исходная подборка, только названия
`.trim()

if (!['--seed', '--all', '--names-only'].includes(mode)) {
  console.error(usage)
  process.exit(1)
}

const sourcePath = process.env.ZAUMNIK_SOURCE_PATH
  ? resolve(process.env.ZAUMNIK_SOURCE_PATH)
  : resolve(projectRoot, 'tmp/Словарь за-умных слов.md')

if (!existsSync(sourcePath)) {
  console.error(`Исходный файл не найден: ${sourcePath}`)
  process.exit(1)
}

const typeByLabel = {
  Противоположное: 'opposite',
  'Часто путают': 'confused',
  Связанное: 'related',
}

const nameOverrides = new Map([
  ['Аль-денте', 'Альденте'],
  ['Диферамб', 'Дифирамб'],
  ['Инсенуация', 'Инсинуация'],
  ['Конгламерат', 'Конгломерат'],
  ['Коньюктура', 'Конъюнктура'],
  ['Паттернализм', 'Патернализм'],
  ['Препон', 'Препона'],
  ['Рекеровка', 'Рокировка'],
])

const normalizeName = (name) => nameOverrides.get(name) ?? name

const extractStress = (sourceName) => {
  let position = 0
  const stress = []
  let name = ''

  for (const character of sourceName.normalize('NFD')) {
    if (character === '\u0301') {
      if (position) stress.push(position)
      continue
    }
    if (/[А-ЯЁа-яё]/.test(character)) position += 1
    name += character
  }

  return { name: name.normalize('NFC'), stress }
}

const parsedEntries = parseDictionary(readFileSync(sourcePath, 'utf8'))
const selectedEntries =
  mode !== '--seed'
    ? parsedEntries
    : parsedEntries.filter((entry) => {
        const earlierInSection = parsedEntries
          .slice(0, parsedEntries.indexOf(entry))
          .filter((candidate) => candidate.letter === entry.letter)
        return earlierInSection.length < 2
      })

const selectedNames = new Set(selectedEntries.map((entry) => entry.name))
let definitionsLeft = mode === '--seed' ? 2 : Number.POSITIVE_INFINITY
const namesOnly = mode === '--names-only'

const words = selectedEntries.map((entry) => {
  const stressedName = extractStress(entry.name)
  const keepDefinition =
    !namesOnly && entry.hasDefinition && definitionsLeft > 0
  if (keepDefinition) definitionsLeft -= 1

  return {
    name: normalizeName(stressedName.name),
    stress: namesOnly ? [] : stressedName.stress,
    definition: keepDefinition ? entry.definition : '',
    synonyms: [],
    antonyms: [],
    relations: namesOnly
      ? []
      : entry.relations
          .filter((relation) => selectedNames.has(relation.name))
          .map((relation) => ({
            word: normalizeName(extractStress(relation.name).name),
            type: typeByLabel[relation.label],
          })),
  }
})

if (mode === '--all') {
  const relationOverrides = [
    ['Инцидент', 'Прецедент', 'confused'],
    ['Прецедент', 'Инцидент', 'confused'],
    ['Инцест', 'Эксцесс', 'confused'],
    ['Эксцесс', 'Инцест', 'confused'],
  ]

  for (const [sourceName, targetName, type] of relationOverrides) {
    const word = words.find((entry) => entry.name === sourceName)
    if (!word) continue
    if (!word.relations.some((relation) => relation.word === targetName)) {
      word.relations.push({ word: targetName, type })
    }
  }
}

const result = writeWords(words)
console.log(`Импортировано: ${result.words} слов в ${result.files} файлов.`)
