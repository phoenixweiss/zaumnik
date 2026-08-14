import { expect, test } from '@playwright/test'

test('показывает фирменное написание, большой поиск и алфавит', async ({
  page,
}) => {
  await page.goto('./')

  await expect(page).toHaveTitle(/Заумник/)
  await expect(
    page.getByRole('link', { name: 'Заумникъ — на главную' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', {
      name: 'Слова, которые интересно узнать.',
    }),
  ).toHaveCSS('font-family', /Merriweather/)
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    'href',
    '/zaumnik/favicon.svg',
  )
  await expect(page.getByRole('searchbox')).toHaveAttribute(
    'placeholder',
    /^Например, .+/,
  )
  await expect(page.getByText('слово или смысл', { exact: true })).toHaveCount(
    0,
  )
  await expect(
    page.getByRole('button', { name: 'А', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Э', exact: true }),
  ).toBeVisible()
})

test('показывает крупную багровую кнопку очистки поиска', async ({ page }) => {
  await page.goto('./')

  const search = page.getByRole('searchbox')
  await search.fill('слово')

  const clear = page.getByRole('button', { name: 'Очистить поиск' })
  await expect(clear).toBeVisible()
  await expect(clear).toHaveCSS('color', 'rgb(185, 88, 54)')
  await expect(clear).toHaveCSS('font-weight', '800')
  await clear.click()
  await expect(search).toHaveValue('')
  await expect(clear).toHaveCount(0)
})

test('предлагает подходящие слова и поддерживает выбор с клавиатуры', async ({
  page,
}) => {
  await page.goto('./')

  const search = page.getByRole('searchbox')
  await search.fill('абер')

  const suggestions = page.getByRole('listbox', { name: 'Подходящие слова' })
  await expect(suggestions).toBeVisible()
  await expect(suggestions.getByRole('option')).toHaveCount(1)
  await expect(suggestions.getByRole('option').first()).toHaveText('Аберрация')

  await search.press('ArrowDown')
  await search.press('Enter')
  await expect(search).toHaveValue('Аберрация')
  await expect(suggestions).toHaveCount(0)
  await expect(page).toHaveURL(/#\/word\/[^/]+$/)
  await expect(page.locator('.word-detail').getByRole('heading')).toHaveText(
    'Аберрация',
  )
})

test('ищет не только по названию, но и по тексту определения', async ({
  page,
}) => {
  await page.goto('./')

  const search = page.getByRole('searchbox')
  await search.fill('истинности')
  await search.press('Enter')

  const list = page.locator('.word-list-panel')
  await expect(list).toBeVisible()
  await expect(list.locator('.word-row')).toHaveCount(1)
  await expect(list.locator('.word-row')).toContainText('Аберрация')
})

test('показывает слова по букве и открывает словарную статью', async ({
  page,
}) => {
  await page.goto('./')

  const letter = page.getByRole('button', { name: 'Б', exact: true })
  await letter.click()

  const list = page.locator('.word-list-panel')
  await expect(letter).toHaveAttribute('aria-pressed', 'true')
  await expect(list).toBeVisible()
  await expect(list.locator('.word-row')).toHaveCount(2)
  await expect(list.locator('.word-row').first()).toContainText(/^Б/)

  await list.locator('.word-row').first().click()
  await expect(page).toHaveURL(/#\/word\//)
  await expect(page.locator('.word-detail')).toBeVisible()
  await expect(list).toHaveCount(0)
})

test('показывает результаты по десять и догружает следующую десятку', async ({
  page,
}) => {
  await page.goto('./')
  const search = page.getByRole('searchbox')
  await search.fill('а')
  await search.blur()

  const list = page.locator('.word-list-panel')
  const rows = list.locator('.word-row')
  const showMore = list.getByRole('button', { name: 'Показать ещё' })

  await expect(list.getByRole('heading')).toHaveText('30 слов')
  await expect(rows).toHaveCount(10)
  await showMore.click()
  await expect(rows).toHaveCount(20)
  await showMore.click()
  await expect(rows).toHaveCount(30)
  await expect(showMore).toHaveCount(0)
})

test('показывает прямой твёрдый знак и подпись только при наведении', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('./')

  const accent = page.locator('.hero-accent')
  const caption = page.getByRole('tooltip')
  const glyph = accent.locator('> span')
  await expect(glyph).toHaveText('Ъ')
  await expect(glyph).toHaveCSS('font-style', 'italic')
  await expect(glyph).toHaveCSS('font-weight', '800')
  await expect(accent).toHaveCSS('transform', 'none')
  await expect(caption).toBeHidden()
  await accent.hover()
  await expect(caption).toBeVisible()
})

test('оставляет только общее число слов и не показывает блок метрик', async ({
  page,
}) => {
  await page.goto('./')

  await expect(page.locator('.collection-count')).toHaveText(
    '38 слов в коллекции',
  )
  await expect(page.locator('.dictionary-summary')).toHaveCount(0)
  await expect(page.locator('.word-list-panel, .word-detail')).toHaveCount(0)
})

test('указывает автора в компактном подвале', async ({ page }) => {
  await page.setViewportSize({ width: 492, height: 652 })
  await page.goto('./')

  const footer = page.locator('.site-footer')
  await expect(footer).toContainText('Заумникъ · версия 0.1.0')
  await expect(footer).toContainText('Павел Ткачев (@phoenixweiss)')
  await expect(
    footer.getByRole('link', { name: /Павел Ткачев/ }),
  ).toHaveAttribute('href', 'https://phoenixweiss.me')
  await expect(footer.getByLabel('Технологии проекта')).toHaveText(
    /Vue\s*·\s*Vite\s*·\s*Sass/,
  )
  await expect(footer.getByRole('link', { name: 'Sass' })).toHaveAttribute(
    'href',
    'https://sass-lang.com/',
  )
  await expect(footer.getByRole('link', { name: 'GitHub' })).toHaveCount(0)
  expect((await footer.boundingBox()).height).toBeLessThanOrEqual(70)
})

test('укладывает алфавит в две строки на экране ноутбука', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('./')

  const letterBoxes = await page
    .locator('.letter-button')
    .evaluateAll((items) => items.map((item) => item.getBoundingClientRect()))
  const rows = new Set(letterBoxes.map((box) => Math.round(box.top)))
  const bottom = Math.max(...letterBoxes.map((box) => box.bottom))

  expect(rows.size).toBe(2)
  expect(bottom).toBeLessThanOrEqual(720)
})

test('фиксирует гильош по центру окна и медленно вращает его', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('./')

  const background = await page.evaluate(() => {
    const styles = getComputedStyle(document.body, '::before')
    return {
      position: styles.position,
      top: styles.top,
      left: styles.left,
      animationName: styles.animationName,
      animationDuration: styles.animationDuration,
    }
  })

  expect(background).toEqual({
    position: 'fixed',
    top: '360px',
    left: '640px',
    animationName: 'guilloche-rotation',
    animationDuration: '180s',
  })
})
