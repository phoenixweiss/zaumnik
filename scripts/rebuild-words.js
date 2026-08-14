import { readWords, writeWords } from './lib/wordFiles.js'

const result = writeWords(readWords())
console.log(`Готово: ${result.words} слов, ${result.files} файлов по буквам.`)
