const normalize = (value = '') =>
  value
    .normalize('NFD')
    .replace(/\u0301/g, '')
    .normalize('NFC')
    .toLocaleLowerCase('ru-RU')
    .replace(/ё/g, 'е')
    .trim()

export const slugify = (value) =>
  normalize(value)
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

export const formatWord = (name, stress = []) => {
  const positions = new Set(stress)
  let letterPosition = 0

  return [...name]
    .map((character) => {
      if (/[А-ЯЁа-яё]/.test(character)) letterPosition += 1
      return positions.has(letterPosition) && !/[Ёё]/.test(character)
        ? `${character}\u0301`
        : character
    })
    .join('')
}
