import { createRouter, createWebHashHistory } from 'vue-router'

import AboutView from '@/views/AboutView.vue'
import DictionaryView from '@/views/DictionaryView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dictionary', component: DictionaryView },
    { path: '/word/:slug', name: 'word', component: DictionaryView },
    { path: '/about', name: 'about', component: AboutView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to) {
    if (to.name === 'word') {
      return { el: '.dictionary-results', top: 16 }
    }

    return { top: 0 }
  },
})

export default router
