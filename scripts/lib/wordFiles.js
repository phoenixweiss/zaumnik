import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import yaml from 'js-yaml'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
export const projectRoot = resolve(scriptDirectory, '../..')
export const wordsDirectory = process.env.ZAUMNIK_WORDS_DIRECTORY
  ? resolve(process.env.ZAUMNIK_WORDS_DIRECTORY)
  : resolve(projectRoot, 'src/data/words')

const collator = new Intl.Collator('ru', { sensitivity: 'base' })
const normalize = (value) =>
  value.trim().toLocaleLowerCase('ru-RU').replace(/ё/g, 'е')
const normalizeName = (value) => {
  const name = String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
  return name ? `${name[0].toLocaleUpperCase('ru-RU')}${name.slice(1)}` : ''
}

const cleanWord = (word) => ({
  name: normalizeName(word.name),
  stress: [...new Set((word.stress || []).map(Number))]
    .filter(Number.isInteger)
    .sort((left, right) => left - right),
  definition: String(word.definition || '')
    .replace(/\s+/g, ' ')
    .trim(),
  synonyms: [
    ...new Set((word.synonyms || []).map((item) => String(item).trim())),
  ]
    .filter(Boolean)
    .sort(collator.compare),
  antonyms: [
    ...new Set((word.antonyms || []).map((item) => String(item).trim())),
  ]
    .filter(Boolean)
    .sort(collator.compare),
  relations: (word.relations || [])
    .map((relation) => ({
      word: String(relation.word || '')
        .replace(/\s+/g, ' ')
        .trim(),
      type: relation.type || 'related',
    }))
    .filter((relation) => relation.word)
    .sort((left, right) => collator.compare(left.word, right.word)),
})

export const readWords = () => {
  if (!existsSync(wordsDirectory)) return []

  return readdirSync(wordsDirectory)
    .filter((fileName) => fileName.endsWith('.yaml'))
    .sort(collator.compare)
    .flatMap((fileName) => {
      const filePath = resolve(wordsDirectory, fileName)
      const section = yaml.load(readFileSync(filePath, 'utf8'))

      if (!section?.letter || !Array.isArray(section.words)) {
        throw new Error(`${fileName}: ожидаются поля letter и words`)
      }

      return section.words.map(cleanWord)
    })
}

export const writeWords = (sourceWords) => {
  mkdirSync(wordsDirectory, { recursive: true })

  const words = sourceWords.map(cleanWord).filter((word) => word.name)
  const names = new Set()

  for (const word of words) {
    const key = normalize(word.name)
    if (names.has(key)) throw new Error(`Повторяющееся слово: ${word.name}`)
    names.add(key)

    const letter = word.name[0].toLocaleUpperCase('ru-RU')
    if (!/^[А-ЯЁ]$/.test(letter))
      throw new Error(`Не удалось определить букву слова: ${word.name}`)

    const letters = [...word.name].filter((character) =>
      /[А-ЯЁа-яё]/.test(character),
    )
    for (const position of word.stress) {
      if (position < 1 || position > letters.length) {
        throw new Error(
          `${word.name}: позиция ударения ${position} выходит за пределы слова`,
        )
      }
      if (!/[АЕЁИОУЫЭЮЯаеёиоуыэюя]/.test(letters[position - 1])) {
        throw new Error(
          `${word.name}: позиция ударения ${position} должна указывать на гласную`,
        )
      }
    }

    for (const relation of word.relations) {
      if (!['related', 'opposite', 'confused'].includes(relation.type)) {
        throw new Error(`${word.name}: неизвестный тип связи ${relation.type}`)
      }
    }
  }

  for (const word of words) {
    for (const relation of word.relations) {
      if (!names.has(normalize(relation.word))) {
        throw new Error(
          `${word.name}: связанное слово «${relation.word}» отсутствует в словаре`,
        )
      }
    }
  }

  const groups = new Map()
  for (const word of words) {
    const letter = word.name[0].toLocaleUpperCase('ru-RU')
    if (!groups.has(letter)) groups.set(letter, [])
    groups.get(letter).push(word)
  }

  const targetFiles = new Set()
  for (const [letter, letterWords] of [...groups].sort(([left], [right]) =>
    collator.compare(left, right),
  )) {
    letterWords.sort((left, right) => collator.compare(left.name, right.name))
    const fileName = `${letter.toLocaleLowerCase('ru-RU')}.yaml`
    const filePath = resolve(wordsDirectory, fileName)
    const temporaryPath = `${filePath}.tmp`
    const content = yaml.dump(
      { letter, words: letterWords },
      { lineWidth: 100, noCompatMode: true, noRefs: true, sortKeys: false },
    )

    writeFileSync(temporaryPath, content, 'utf8')
    renameSync(temporaryPath, filePath)
    targetFiles.add(fileName)
  }

  for (const fileName of readdirSync(wordsDirectory)) {
    if (/^[а-яё]\.yaml$/i.test(fileName) && !targetFiles.has(fileName)) {
      unlinkSync(resolve(wordsDirectory, fileName))
    }
  }

  return { words: words.length, files: targetFiles.size }
}
