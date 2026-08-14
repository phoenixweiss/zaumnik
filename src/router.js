import { createRouter, createWebHashHistory } from 'vue-router'

import DictionaryView from '@/views/DictionaryView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dictionary', component: DictionaryView },
    { path: '/word/:slug', name: 'word', component: DictionaryView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
