import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import test from 'node:test'

import yaml from 'js-yaml'

const fixture = (t, overrides = {}) => {
  const directory = mkdtempSync(resolve(tmpdir(), 'zaumnik-check-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const file = resolve(directory, 'б.yaml')
  const source = yaml.dump({
    letter: 'Б',
    words: [
      {
        name: 'Блажь',
        stress: [],
        definition: '',
        synonyms: [],
        antonyms: [],
        relations: [],
        ...overrides,
      },
    ],
  })
  writeFileSync(file, source)
  return {
    file,
    source,
    options: {
      cwd: resolve('.'),
      env: { ...process.env, ZAUMNIK_WORDS_DIRECTORY: directory },
      encoding: 'utf8',
      timeout: 30000,
    },
    assertUnchanged() {
      assert.deepEqual(readdirSync(directory), ['б.yaml'])
      assert.equal(readFileSync(file, 'utf8'), source)
    },
  }
}

test('words:check принимает черновик и не пересобирает YAML', (t) => {
  const data = fixture(t)
  const result = spawnSync(
    process.execPath,
    ['scripts/check-words.js'],
    data.options,
  )
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /Словарь проверен\. Статей: 1; файлов: 1/)
  data.assertUnchanged()
})

test('обычная сборка останавливается до Vite при неверном определении или связи', (t) => {
  for (const overrides of [
    { definition: 42 },
    { relations: [{ word: 'Каприз' }] },
  ]) {
    const data = fixture(t, overrides)
    const result = spawnSync('yarn', ['build'], data.options)
    assert.equal(result.error, undefined)
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /Ошибка словаря: .*б\.yaml, статья 1 «Блажь»:/)
    assert.doesNotMatch(result.stdout, /building client|built in/)
    data.assertUnchanged()
  }
})

test('ошибка синтаксиса YAML указывает файл и не изменяет его', (t) => {
  const data = fixture(t)
  const invalidYaml = 'letter: Б\nwords: [\n'
  writeFileSync(data.file, invalidYaml)
  const result = spawnSync(
    process.execPath,
    ['scripts/check-words.js'],
    data.options,
  )
  assert.equal(result.status, 1)
  assert.match(result.stderr, /Ошибка словаря:/)
  assert.match(result.stderr, /б\.yaml/)
  assert.equal(readFileSync(data.file, 'utf8'), invalidYaml)
})
