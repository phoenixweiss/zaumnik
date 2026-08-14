import { defineStore } from 'pinia'

export const useDictionaryStore = defineStore('dictionary', {
  state: () => ({
    query: '',
    letter: '',
    visibleCount: 10,
  }),
  actions: {
    setQuery(value) {
      this.query = value
      this.letter = ''
      this.visibleCount = 10
    },
    setLetter(value) {
      this.letter = this.letter === value ? '' : value
      this.query = ''
      this.visibleCount = 10
    },
    reset() {
      this.query = ''
      this.letter = ''
      this.visibleCount = 10
    },
    showMore() {
      this.visibleCount += 10
    },
  },
})
