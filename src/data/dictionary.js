import { formatWord, slugify } from './word'

const wordFiles = import.meta.glob('./words/*.yaml', {
  eager: true,
  import: 'default',
})

const sections = Object.values(wordFiles).sort((left, right) =>
  left.letter.localeCompare(right.letter, 'ru'),
)

export const dictionary = sections.flatMap((section) =>
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
    relations: word.relations,
  })),
)

export const alphabet = sections.map((section) => section.letter)

export const dictionaryStats = {
  total: dictionary.length,
  ready: dictionary.filter((entry) => entry.hasDefinition).length,
  drafts: dictionary.filter((entry) => !entry.hasDefinition).length,
}
