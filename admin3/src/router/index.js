import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  { path: '/index', name: 'index', component: () => import('../views/IndexView.vue') },
  { path: '/individus/:reference', name: 'fiche', component: () => import('../views/FicheView.vue'), props: true },
  { path: '/search', name: 'search', component: () => import('../views/SearchView.vue') },
  { path: '/search/advanced', name: 'advanced-search', component: () => import('../views/AdvancedSearchView.vue') },
  { path: '/search/mongo', name: 'mongo-search', component: () => import('../views/MongoSearchView.vue') },
  { path: '/edit/:reference?', name: 'edit', component: () => import('../views/EditView.vue'), props: true },
  { path: '/delete/:reference', name: 'delete', component: () => import('../views/DeleteView.vue'), props: true },
  { path: '/drafts', name: 'drafts', component: () => import('../views/DraftView.vue') },
  { path: '/users', name: 'users', component: () => import('../views/UserView.vue') },
  { path: '/dumps', name: 'dumps', component: () => import('../views/DumpView.vue') },
  { path: '/supervision', name: 'supervision', component: () => import('../views/SupervisionView.vue') },
  { path: '/contact', name: 'contact', component: () => import('../views/ContactView.vue') },
  { path: '/help', name: 'help', component: () => import('../views/HelpView.vue') },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue') },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
