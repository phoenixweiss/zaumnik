// Ключи YAML сохраняют знаки ударения: канонические названия хранятся без них.
export const normalizeWordKey = (value = '') =>
  value.toLocaleLowerCase('ru-RU').replace(/ё/g, 'е').trim()

// Поиск, ссылки и импорт Markdown дополнительно игнорируют ударения.
// Возвращаем NFC, чтобы не потерять й после разложения Unicode.
export const normalizeText = (value = '') =>
  normalizeWordKey(
    value
      .normalize('NFD')
      .replace(/\u0301/g, '')
      .normalize('NFC'),
  )
