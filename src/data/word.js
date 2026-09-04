import { normalizeText } from './normalize.js'

export const slugify = (value) =>
  normalizeText(value)
    .replace(/[^а-яa-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const wordForm = (count) => {
  const mod100 = count % 100
  const mod10 = count % 10

  if (mod100 >= 11 && mod100 <= 14) return 'слов'
  if (mod10 === 1) return 'слово'
  if (mod10 >= 2 && mod10 <= 4) return 'слова'
  return 'слов'
}

export const wordParts = (name, stress = []) => {
  const positions = new Set(stress)
  const parts = []
  let letterPosition = 0

  for (const character of name) {
    const isLetter = /[А-ЯЁа-яё]/.test(character)
    if (isLetter) letterPosition += 1
    const stressed =
      isLetter && positions.has(letterPosition) && !/[Ёё]/.test(character)
    const previous = parts.at(-1)

    if (!stressed && previous && !previous.stressed) previous.text += character
    else parts.push({ text: character, stressed })
  }

  return parts
}

export const formatWord = (name, stress = []) =>
  wordParts(name, stress)
    .map(({ text, stressed }) => (stressed ? `${text}\u0301` : text))
    .join('')
