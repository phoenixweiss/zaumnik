import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

import yaml from 'js-yaml'

import { validateDictionary } from '../src/data/validateDictionary.js'
import { wordsDirectory } from './lib/wordFiles.js'

try {
  const files = readdirSync(wordsDirectory)
    .filter((file) => file.endsWith('.yaml'))
    .sort()
  if (!files.length)
    throw new Error(`${wordsDirectory}: нет YAML-файлов словаря`)

  const sections = Object.fromEntries(
    files.map((file) => {
      const filename = resolve(wordsDirectory, file)
      return [filename, yaml.load(readFileSync(filename, 'utf8'), { filename })]
    }),
  )
  const count = validateDictionary(sections)
  console.log(`Словарь проверен. Статей: ${count}; файлов: ${files.length}.`)
} catch (error) {
  console.error(`Ошибка словаря: ${error.message}`)
  process.exitCode = 1
}
