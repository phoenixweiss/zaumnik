import { expect, test } from '@playwright/test'

test('показывает поиск, доступные буквы и объём коллекции', async ({
  page,
}) => {
  await page.goto('./')

  await expect(page).toHaveTitle(/Заумник/)
  await expect(
    page.getByRole('link', { name: 'Заумникъ — на главную' }),
  ).toBeVisible()
  await expect(page.getByRole('searchbox')).toHaveAttribute(
    'placeholder',
    /^Например, .+/,
  )
  await expect(page.getByText('38 слов в коллекции')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'А', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Э', exact: true }),
  ).toBeVisible()
  await expect(page.locator('.word-list-panel, .word-detail')).toHaveCount(0)
})

test('предлагает слова и открывает выбранную статью с клавиатуры', async ({
  page,
}) => {
  await page.goto('./')

  const search = page.getByRole('searchbox')
  await search.fill('абер')
  const suggestions = page.getByRole('listbox', { name: 'Подходящие слова' })
  await expect(suggestions.getByRole('option')).toHaveCount(1)

  await search.press('ArrowDown')
  await search.press('Enter')
  await expect
    .poll(() => decodeURIComponent(new URL(page.url()).hash))
    .toBe('#/word/аберрация')
  await expect(page.locator('.word-detail').getByRole('heading')).toHaveText(
    'Аберрация',
  )
})

test('ищет по тексту определения', async ({ page }) => {
  await page.goto('./')

  const search = page.getByRole('searchbox')
  await search.fill('истинности')
  await search.blur()

  const list = page.locator('.word-list-panel')
  await expect(list.getByRole('heading')).toHaveText('1 слово')
  await expect(list.locator('.word-row')).toContainText('Аберрация')
})

test('фильтрует по букве и открывает черновую статью', async ({ page }) => {
  await page.goto('./')

  const letter = page.getByRole('button', { name: 'Б', exact: true })
  await letter.click()

  const list = page.locator('.word-list-panel')
  await expect(letter).toHaveAttribute('aria-pressed', 'true')
  await expect(list.locator('.word-row')).toHaveCount(2)
  await list.getByRole('button', { name: /Блажь/ }).click()
  await expect
    .poll(() => decodeURIComponent(new URL(page.url()).hash))
    .toBe('#/word/блажь')
  await expect(page.locator('.word-detail')).toContainText(
    'Определение ещё не добавлено',
  )
})

test('показывает результаты десятками', async ({ page }) => {
  await page.goto('./')

  const search = page.getByRole('searchbox')
  await search.fill('а')
  await search.blur()

  const list = page.locator('.word-list-panel')
  const rows = list.locator('.word-row')
  await expect(list.getByRole('heading')).toHaveText('30 слов')
  await expect(rows).toHaveCount(10)
  await list.getByRole('button', { name: 'Показать ещё' }).click()
  await expect(rows).toHaveCount(20)
})

test('очищает поисковый запрос', async ({ page }) => {
  await page.goto('./')

  const search = page.getByRole('searchbox')
  await search.fill('слово')
  await page.getByRole('button', { name: 'Очистить поиск' }).click()
  await expect(search).toHaveValue('')
  await expect(page.locator('.word-list-panel')).toHaveCount(0)
})
