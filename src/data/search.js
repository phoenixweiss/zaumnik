export const normalizeSearch = (value = '') =>
  value
    .normalize('NFD')
    .replace(/\u0301/g, '')
    .normalize('NFC')
    .toLocaleLowerCase('ru-RU')
    .replace(/ё/g, 'е')
    .trim()

const editDistance = (left, right) => {
  const rows = Array.from({ length: left.length + 1 }, (_, row) =>
    Array.from({ length: right.length + 1 }, (_, column) =>
      row === 0 ? column : column === 0 ? row : 0,
    ),
  )

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const substitutionCost = left[row - 1] === right[column - 1] ? 0 : 1

      rows[row][column] = Math.min(
        rows[row - 1][column] + 1,
        rows[row][column - 1] + 1,
        rows[row - 1][column - 1] + substitutionCost,
      )

      if (
        row > 1 &&
        column > 1 &&
        left[row - 1] === right[column - 2] &&
        left[row - 2] === right[column - 1]
      ) {
        rows[row][column] = Math.min(
          rows[row][column],
          rows[row - 2][column - 2] + 1,
        )
      }
    }
  }

  return rows[left.length][right.length]
}

export const findClosestEntries = (entries, query, limit = 3) => {
  const normalizedQuery = normalizeSearch(query)
  if (normalizedQuery.length < 3) return []

  const maximumDistance =
    normalizedQuery.length <= 4 ? 1 : normalizedQuery.length <= 8 ? 2 : 3

  return entries
    .map((entry) => ({
      entry,
      distance: editDistance(normalizedQuery, normalizeSearch(entry.name)),
    }))
    .filter(({ distance }) => distance > 0 && distance <= maximumDistance)
    .sort(
      (left, right) =>
        left.distance - right.distance ||
        left.entry.name.localeCompare(right.entry.name, 'ru-RU'),
    )
    .slice(0, limit)
    .map(({ entry }) => entry)
}
