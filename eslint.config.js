import globals from 'globals'
import pluginJs from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'

export default [
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
  },
  {
    ignores: ['**/dist/*', '**/node_modules/*'],
  },
  {
    files: ['src/**/*.{js,mjs,cjs,vue}'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: [
      'scripts/**/*.{js,mjs,cjs}',
      'tests/**/*.{js,mjs,cjs}',
      '*.config.{js,mjs,cjs}',
    ],
    languageOptions: { globals: globals.node },
  },
  {
    // Файл теста выполняется в Node, callbacks evaluate/addInitScript — в браузере.
    files: ['tests/browser/**/*.{js,mjs,cjs}'],
    languageOptions: { globals: globals.browser },
  },
  pluginJs.configs.recommended,
  // Vue preset сам добавляет browser globals: ограничиваем весь preset компонентами.
  ...pluginVue.configs['flat/essential'].map((config) => ({
    ...config,
    files: ['src/**/*.vue'],
  })),
]
