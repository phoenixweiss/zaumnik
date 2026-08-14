import { resolve } from 'node:path'

import { readWords, wordsDirectory, writeWords } from './lib/wordFiles.js'

const args = process.argv.slice(2)
const name = args.shift()?.trim()

const usage = `
Добавление слова:
  yarn word:add -- "Слово" --stress "2" --definition "Определение"

Списки и связи (значения можно перечислять через запятую):
  --synonyms "Синоним 1, Синоним 2"
  --antonyms "Антоним 1, Антоним 2"
  --related "Слово 1, Слово 2"
  --opposite "Антоним"
  --confused "Похожее слово"
`.trim()

if (!name || name.startsWith('--')) {
  console.error(usage)
  process.exit(1)
}

const options = {
  definition: '',
  stress: [],
  synonyms: [],
  antonyms: [],
  related: [],
  opposite: [],
  confused: [],
}

for (let index = 0; index < args.length; index += 2) {
  const flag = args[index]
  const value = args[index + 1]
  if (!flag?.startsWith('--') || value === undefined) {
    console.error(`Некорректный аргумент: ${flag || '(пусто)'}\n\n${usage}`)
    process.exit(1)
  }

  const key = flag.slice(2)
  if (!(key in options)) {
    console.error(`Неизвестная опция: ${flag}\n\n${usage}`)
    process.exit(1)
  }

  if (key === 'definition') options[key] = value
  else if (key === 'stress')
    options[key] = value.split(',').map((item) => Number(item.trim()))
  else options[key] = value.split(',').map((item) => item.trim())
}

if (options.stress.some((position) => !Number.isInteger(position))) {
  console.error('Позиции ударения должны быть целыми числами.')
  process.exit(1)
}

const words = readWords()
const normalize = (value) =>
  value.toLocaleLowerCase('ru-RU').replace(/ё/g, 'е').trim()

if (words.some((word) => normalize(word.name) === normalize(name))) {
  console.error(`Слово «${name}» уже есть в словаре.`)
  process.exit(1)
}

const relations = [
  ...options.related.map((word) => ({ word, type: 'related' })),
  ...options.opposite.map((word) => ({ word, type: 'opposite' })),
  ...options.confused.map((word) => ({ word, type: 'confused' })),
]

words.push({
  name,
  stress: options.stress,
  definition: options.definition,
  synonyms: options.synonyms,
  antonyms: options.antonyms,
  relations,
})

const result = writeWords(words)
const letter = name[0].toLocaleLowerCase('ru-RU')
console.log(
  `Добавлено «${name}» в ${resolve(wordsDirectory, `${letter}.yaml`)}.`,
)
console.log(`В словаре теперь ${result.words} слов.`)
