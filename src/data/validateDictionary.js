import { slugify } from './word.js'

const isObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
const isText = (value) => typeof value === 'string' && value.trim().length > 0

// Проверяем исходные значения без исправления или заполнения пропусков.
export const validateDictionary = (files) => {
  const entries = []
  const bySlug = new Map()
  const fail = (context, message) => {
    throw new Error(`${context}: ${message}`)
  }

  for (const [file, section] of Object.entries(files)) {
    if (
      !isObject(section) ||
      typeof section.letter !== 'string' ||
      !/^[А-ЯЁ]$/.test(section.letter) ||
      !Array.isArray(section.words)
    ) {
      fail(file, 'ожидаются letter (заглавная русская буква) и words (массив)')
    }

    for (const [index, word] of section.words.entries()) {
      const context = `${file}, статья ${index + 1}${isText(word?.name) ? ` «${word.name}»` : ''}`
      if (!isObject(word) || !isText(word.name)) {
        fail(context, 'name должно быть непустой строкой')
      }
      if (/\u0301/.test(word.name)) {
        fail(context, 'name хранится без знака ударения; используйте stress')
      }
      if (typeof word.definition !== 'string') {
        fail(context, 'definition должно быть строкой (для черновика — "")')
      }
      for (const field of ['stress', 'synonyms', 'antonyms', 'relations']) {
        if (!Array.isArray(word[field])) {
          fail(context, `${field} должно быть массивом (допустим [])`)
        }
      }
      for (const field of ['synonyms', 'antonyms']) {
        if (!word[field].every(isText)) {
          fail(context, `${field} должно содержать только непустые строки`)
        }
      }
      const letters = [...word.name].filter((character) =>
        /[А-ЯЁа-яё]/.test(character),
      )
      for (const position of word.stress) {
        if (
          !Number.isInteger(position) ||
          position < 1 ||
          position > letters.length ||
          !/[АЕЁИОУЫЭЮЯаеёиоуыэюя]/.test(letters[position - 1])
        ) {
          fail(
            context,
            'stress должно содержать целые позиции гласных, начиная с 1',
          )
        }
      }
      for (const relation of word.relations) {
        if (!isObject(relation) || !isText(relation.word)) {
          fail(context, 'relations: word должно быть непустой строкой')
        }
        if (
          relation.type !== undefined &&
          !['related', 'opposite', 'confused'].includes(relation.type)
        ) {
          fail(
            context,
            'relations: type должно быть related, opposite или confused',
          )
        }
      }

      const slug = slugify(word.name)
      if (!slug) fail(context, 'name не образует адрес слова')
      if (bySlug.has(slug)) {
        fail(context, `адрес слова совпадает со статьёй ${bySlug.get(slug)}`)
      }
      bySlug.set(slug, context)
      entries.push({ word, context })
    }
  }

  for (const { word, context } of entries) {
    for (const relation of word.relations) {
      if (!bySlug.has(slugify(relation.word))) {
        fail(
          context,
          `связанное слово «${relation.word}» отсутствует в словаре`,
        )
      }
    }
  }

  return entries.length
}
