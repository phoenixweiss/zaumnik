import assert from 'node:assert/strict'
import test from 'node:test'

import { ESLint } from 'eslint'

const eslint = new ESLint()
const globalsProbe = 'console.log(window, document, process, Buffer)'
const undefinedNames = async (filePath, code = globalsProbe) => {
  const [result] = await eslint.lintText(code, { filePath })
  assert.ok(result.messages.every((message) => message.ruleId === 'no-undef'))
  return result.messages.map((message) => message.message).sort()
}

test('ESLint не разрешает Node globals в JS и Vue приложения', async () => {
  const expected = ["'Buffer' is not defined.", "'process' is not defined."]
  assert.deepEqual(await undefinedNames('src/lint-probe.js'), expected)
  assert.deepEqual(
    await undefinedNames(
      'src/LintProbe.vue',
      `<script setup>${globalsProbe}</script>`,
    ),
    expected,
  )
})

test('ESLint не разрешает DOM globals в скриптах, конфигах и Node-тестах', async () => {
  for (const filePath of [
    'scripts/lint-probe.js',
    'vite.config.js',
    'playwright.config.js',
    'eslint.config.js',
    'tests/data/lint-probe.test.js',
    'tests/scripts/lint-probe.test.js',
    'tests/release/lint-probe.js',
  ]) {
    assert.deepEqual(
      await undefinedNames(filePath),
      ["'document' is not defined.", "'window' is not defined."],
      filePath,
    )
  }
})

test('ESLint допускает оба окружения в browser-тестах, но проверяет неизвестные имена', async () => {
  assert.deepEqual(await undefinedNames('tests/browser/lint-probe.spec.js'), [])
  assert.deepEqual(
    await undefinedNames(
      'tests/browser/lint-probe.spec.js',
      'console.log(unknownLintProbe)',
    ),
    ["'unknownLintProbe' is not defined."],
  )
})
