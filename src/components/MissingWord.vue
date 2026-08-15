<script setup>
import { computed } from 'vue'

import { alphabet } from '@/data/dictionary'

const props = defineProps({
  word: { type: String, required: true },
})

defineEmits(['reset'])

const repositoryUrl = 'https://github.com/phoenixweiss/zaumnik'

const normalizedWord = computed(() => props.word.replace(/-/g, ' ').trim())
const wordLetter = computed(() =>
  normalizedWord.value[0]?.toLocaleUpperCase('ru-RU'),
)
const hasLetterFile = computed(() => alphabet.includes(wordLetter.value))
const displayWord = computed(() => {
  const word = normalizedWord.value
  if (!word) return 'Неизвестное слово'
  return `${word[0].toLocaleUpperCase('ru-RU')}${word.slice(1)}`
})

const issueUrl = computed(() => {
  const params = new URLSearchParams({
    title: `[Слово] ${displayWord.value}`,
    body: [
      '### Слово',
      '',
      displayWord.value,
      '',
      '### Что оно значит',
      '',
      '<!-- Коротко опишите значение своими словами. -->',
      '',
      '### Источник или пример употребления',
      '',
      '<!-- Добавьте ссылку на источник или пример фразы, если они есть. -->',
    ].join('\n'),
  })

  return `${repositoryUrl}/issues/new?${params}`
})

const yamlUrl = computed(() => {
  if (!hasLetterFile.value)
    return `${repositoryUrl}/blob/dev/docs/data-format.md#служебные-команды`

  return `${repositoryUrl}/edit/dev/src/data/words/${encodeURIComponent(
    wordLetter.value.toLocaleLowerCase('ru-RU'),
  )}.yaml`
})

const yamlAction = computed(() =>
  hasLetterFile.value
    ? 'Добавить слово в YAML'
    : `Создать YAML для буквы «${wordLetter.value || '?'}»`,
)

const yamlHint = computed(() =>
  hasLetterFile.value
    ? 'Внесите запись по принятой структуре в файл нужной буквы и отправьте pull request.'
    : `Файла «${wordLetter.value?.toLocaleLowerCase('ru-RU') || '?'}.yaml» пока нет. Команда word:add создаст его локально — останется отправить pull request.`,
)

const emailUrl = computed(() => {
  const subject = `[Заумникъ] Предлагаю добавить слово — ${normalizedWord.value}`
  const body = [
    `Слово: ${displayWord.value}`,
    '',
    'Что оно значит:',
    '',
    'Источник или пример употребления:',
  ].join('\n')

  return `mailto:phoenixweiss@ya.ru?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`
})
</script>

<template>
  <article class="missing-word" aria-labelledby="missing-word-title">
    <header class="missing-word-heading">
      <span aria-hidden="true">?</span>
      <div>
        <p class="eyebrow">В словаре пока нет</p>
        <h2 id="missing-word-title">«{{ displayWord }}»</h2>
      </div>
    </header>

    <p class="missing-word-lead">
      Возможно, в написании есть опечатка. А возможно, этого слова просто ещё
      нет в моей коллекции — тогда его, пожалуй, стоит добавить.
    </p>

    <div class="missing-word-actions">
      <a :href="issueUrl" target="_blank" rel="noreferrer">
        <small>Если вы пользуетесь GitHub</small>
        <strong>Предложить слово в Issue</strong>
        <span>
          Откроется готовая форма: останется описать значение и привести пример.
        </span>
        <i aria-hidden="true">→</i>
      </a>

      <a :href="yamlUrl" target="_blank" rel="noreferrer">
        <small>Если вы умеете кодить</small>
        <strong>{{ yamlAction }}</strong>
        <span>{{ yamlHint }}</span>
        <i aria-hidden="true">→</i>
      </a>

      <a :href="emailUrl">
        <small>Если GitHub вам не близок</small>
        <strong>Написать автору</strong>
        <span>
          Откроется письмо с уже заполненной темой и небольшой заготовкой.
        </span>
        <i aria-hidden="true">→</i>
      </a>
    </div>

    <button class="text-button" type="button" @click="$emit('reset')">
      Вернуться к поиску
    </button>
  </article>
</template>
