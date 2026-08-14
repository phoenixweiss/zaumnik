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

export const formatWord = (name, stress = []) => {
  const positions = new Set(stress)
  let letterPosition = 0

  return [...name]
    .map((character) => {
      if (/[А-ЯЁа-яё]/.test(character)) letterPosition += 1
      return positions.has(letterPosition) ? `${character}\u0301` : character
    })
    .join('')
}
