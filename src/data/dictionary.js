import { formatWord, slugify } from './word'
import { validateDictionary } from './validateDictionary.js'

const wordFiles = import.meta.glob('./words/*.yaml', {
  eager: true,
  import: 'default',
})

validateDictionary(wordFiles)

const sections = Object.values(wordFiles).sort((left, right) =>
  left.letter.localeCompare(right.letter, 'ru'),
)

const rawEntries = sections.flatMap((section) =>
  section.words.map((word, index) => ({
    id: `${section.letter}-${index}`,
    letter: section.letter,
    name: word.name,
    displayName: formatWord(word.name, word.stress),
    stress: word.stress,
    slug: slugify(word.name),
    definition: word.definition,
    hasDefinition: Boolean(word.definition.trim()),
    synonyms: word.synonyms,
    antonyms: word.antonyms,
    relationData: word.relations,
  })),
)

const bySlug = new Map(rawEntries.map((entry) => [entry.slug, entry]))

export const dictionary = rawEntries.map((entry) => ({
  ...entry,
  relations: entry.relationData.map((relation) => {
    const related = bySlug.get(slugify(relation.word))
    return {
      slug: related.slug,
      name: related.name,
      stress: related.stress,
      label: {
        opposite: 'Противоположное',
        confused: 'Часто путают',
        related: 'Связанное',
      }[relation.type || 'related'],
    }
  }),
  relationData: undefined,
}))

export const alphabet = [...new Set(dictionary.map((entry) => entry.letter))]

export const dictionaryStats = {
  total: dictionary.length,
}
