import { slugify } from './word.js'

const cleanMarkdown = (value = '') =>
  value
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim()

const normalize = (value = '') =>
  value
    .normalize('NFD')
    .replace(/\u0301/g, '')
    .normalize('NFC')
    .toLocaleLowerCase('ru-RU')
    .replace(/ё/g, 'е')
    .trim()

const relationLabel = (source) => {
  const normalized = normalize(source)

  if (normalized.includes('противополож')) return 'Противоположное'
  if (normalized.includes('часто путают')) return 'Часто путают'
  return 'Связанное'
}

const parseRow = (source, letter, order) => {
  const boldName = source.match(/^\*\*(.+?)\*\*/)
  let nameSource = ''
  let definitionSource = ''

  if (boldName) {
    nameSource = boldName[1]
    definitionSource = source
      .slice(boldName[0].length)
      .replace(/^\s*[—–-]\s*/, '')
  } else {
    const definitionMatch = source.match(/^(.*?)\s+[—–-]\s*(.*)$/)
    nameSource = definitionMatch ? definitionMatch[1] : source
    definitionSource = definitionMatch ? definitionMatch[2] : ''
  }

  const references = []
  const seeReference = nameSource.match(/^(.+?)\s*\(см\.\s*([^)]+)\)$/i)
  const pairedName = nameSource.match(/^(.+?)\s*\(([А-ЯЁ][^)]+)\)$/)
  const etymologyInName = nameSource.match(/^(.+?)\s+(\(от\s+.+\))$/i)

  if (seeReference || pairedName) {
    const match = seeReference || pairedName
    nameSource = match[1]
    references.push(match[2])
  } else if (etymologyInName) {
    nameSource = etymologyInName[1]
    definitionSource = `${etymologyInName[2]} — ${definitionSource}`
  }

  for (const match of definitionSource.matchAll(/\*\*([^*]+)\*\*/g)) {
    references.push(match[1])
  }

  const definitionOnlyReference = definitionSource.match(/^\(([^)]+)\)$/)
  if (definitionOnlyReference) references.push(definitionOnlyReference[1])

  const definition = cleanMarkdown(definitionSource).replace(/^—\s*/, '')
  const isReferenceOnly = /^\([^)]+\)$/.test(definition)
  const name = cleanMarkdown(nameSource)

  return {
    id: `${letter}-${order}`,
    name,
    slug: slugify(name),
    letter,
    definition,
    hasDefinition: Boolean(definition) && !isReferenceOnly,
    raw: source,
    referenceNames: references.map(cleanMarkdown),
    relations: [],
  }
}

export const parseDictionary = (markdown) => {
  const entries = []
  let letter = ''

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim()
    const heading = line.match(/^##\s+([А-ЯЁ])$/)

    if (heading) {
      letter = heading[1]
      continue
    }

    if (!letter || !line || line.startsWith('#') || line.startsWith('['))
      continue
    entries.push(parseRow(line, letter, entries.length))
  }

  const byName = new Map(entries.map((entry) => [normalize(entry.name), entry]))

  for (const entry of entries) {
    const seen = new Set()
    entry.relations = entry.referenceNames
      .map((referenceName) =>
        byName.get(normalize(referenceName.replace(/^см\.\s*/i, ''))),
      )
      .filter((related) => related && related.id !== entry.id)
      .filter((related) => {
        if (seen.has(related.id)) return false
        seen.add(related.id)
        return true
      })
      .map((related) => ({
        slug: related.slug,
        name: related.name,
        label: relationLabel(entry.raw),
      }))
    delete entry.referenceNames
    delete entry.raw
  }

  return entries
}
