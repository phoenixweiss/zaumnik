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
  await search.fill('искажения изображения')
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

test('кнопка другого слова не возвращает текущую статью', async ({ page }) => {
  await page.goto('./#/word/аберрация')

  const detail = page.locator('.word-detail')
  const heading = detail.getByRole('heading')
  await expect(heading).toHaveText('Аберрация')

  await detail.getByRole('button', { name: 'Другое слово' }).click()

  await expect(heading).not.toHaveText('Аберрация')
  await expect(page).not.toHaveURL(
    /#\/word\/%D0%B0%D0%B1%D0%B5%D1%80%D1%80%D0%B0%D1%86%D0%B8%D1%8F$/,
  )
})

test('ставит знак ударения над самой гласной', async ({ page }) => {
  await page.goto('./#/word/дежавю')

  const heading = page.locator('.word-detail').getByRole('heading')
  const word = heading.locator('.word-name')

  await expect(heading).toHaveText('Дежавю')
  await expect(word).toHaveAttribute('aria-label', 'Дежавю́')
  await expect(word.locator('.stress-mark')).toHaveText('ю')
})

test('объясняет отсутствие слова с известной буквой и предлагает его добавить', async ({
  page,
}) => {
  await page.goto('./#/word/прокрастинация')

  const missingWord = page.locator('.missing-word')
  await expect(missingWord).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0)
  await expect(missingWord.getByRole('heading')).toHaveText('«Прокрастинация»')
  await expect(missingWord).toContainText('Возможно, в написании есть опечатка')

  const issue = missingWord.getByRole('link', {
    name: /Предложить слово в Issue/,
  })
  await expect(issue).toHaveAttribute(
    'href',
    /github\.com\/phoenixweiss\/zaumnik\/issues\/new\?/,
  )
  await expect(issue).toHaveAttribute(
    'href',
    /title=%5B%D0%A1%D0%BB%D0%BE%D0%B2%D0%BE%5D/,
  )

  await expect(
    missingWord.getByRole('link', { name: /Добавить слово в YAML/ }),
  ).toHaveAttribute('href', /edit\/dev\/src\/data\/words\/%D0%BF\.yaml$/)

  const email = missingWord.getByRole('link', { name: /Написать автору/ })
  await expect(email).toHaveAttribute('href', /^mailto:phoenixweiss@ya\.ru\?/)
  await expect(email).toHaveAttribute(
    'href',
    /subject=%5B%D0%97%D0%B0%D1%83%D0%BC%D0%BD%D0%B8%D0%BA%D1%8A%5D/,
  )
})

test('объясняет, как создать YAML для ещё не представленной буквы', async ({
  page,
}) => {
  await page.goto('./#/word/юстировка')

  const missingWord = page.locator('.missing-word')
  const yaml = missingWord.getByRole('link', {
    name: /Создать YAML для буквы «Ю»/,
  })

  await expect(yaml).toBeVisible()
  await expect(yaml).toHaveAttribute(
    'href',
    /blob\/dev\/docs\/data-format\.md#.*$/,
  )
  await expect(yaml).toContainText('Команда word:add создаст его локально')
})

test('предлагает добавить слово из пустой поисковой выдачи', async ({
  page,
}) => {
  await page.goto('./')

  const search = page.getByRole('searchbox')
  await search.fill('Прокрастинация')

  const emptyState = page.locator('.empty-state')
  const propose = emptyState.getByRole('button', {
    name: 'Предложить добавить «Прокрастинация»',
  })
  await expect(propose).toBeVisible()

  await propose.click()
  await expect(page).toHaveURL(
    /#\/word\/%D0%BF%D1%80%D0%BE%D0%BA%D1%80%D0%B0%D1%81%D1%82%D0%B8%D0%BD%D0%B0%D1%86%D0%B8%D1%8F$/,
  )
  await expect(page.locator('.missing-word')).toBeVisible()
})

test('открывает предложение слова по Enter из поиска', async ({ page }) => {
  await page.goto('./')

  const search = page.getByRole('searchbox')
  await search.fill('Прокрастинация')
  await search.press('Enter')

  await expect(page).toHaveURL(
    /#\/word\/%D0%BF%D1%80%D0%BE%D0%BA%D1%80%D0%B0%D1%81%D1%82%D0%B8%D0%BD%D0%B0%D1%86%D0%B8%D1%8F$/,
  )
  await expect(page.locator('.missing-word')).toBeVisible()
})

test('считает запрос из одной буквы фильтром по алфавиту', async ({ page }) => {
  await page.goto('./')
  const search = page.getByRole('searchbox')
  await search.fill('а')
  await search.blur()

  const list = page.locator('.word-list-panel')
  const rows = list.locator('.word-row')
  const showMore = list.getByRole('button', { name: 'Показать ещё' })

  await expect(list.getByRole('heading')).toHaveText('31 слово')
  await expect(rows).toHaveCount(10)
  await expect(rows.first()).toContainText(/^А/)
  await showMore.click()
  await expect(rows).toHaveCount(20)
  await showMore.click()
  await expect(rows).toHaveCount(30)
  await showMore.click()
  await expect(rows).toHaveCount(31)
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
    '218 слов в коллекции',
  )
  await expect(page.locator('.dictionary-summary')).toHaveCount(0)
  await expect(page.locator('.word-list-panel, .word-detail')).toHaveCount(0)
})

test('указывает автора в компактном подвале', async ({ page }) => {
  await page.setViewportSize({ width: 492, height: 652 })
  await page.goto('./')

  const footer = page.locator('.site-footer')
  await expect(footer).toContainText('Заумникъ · версия 0.1.0')
  await expect(footer).toContainText(/Павел Ткачев\s*\(@phoenixweiss\)/)
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
