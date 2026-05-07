import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/pages/RegisterPage.vue'),
    meta: { guest: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/pages/DashboardPage.vue'),
      },
      {
        path: 'agents',
        name: 'agents',
        component: () => import('@/pages/AgentsPage.vue'),
      },
      {
        path: 'agents/new',
        name: 'agent-create',
        component: () => import('@/pages/AgentFormPage.vue'),
      },
      {
        path: 'agents/:id',
        name: 'agent-edit',
        component: () => import('@/pages/AgentFormPage.vue'),
        props: true,
      },
      {
        path: 'providers',
        name: 'providers',
        component: () => import('@/pages/ProvidersPage.vue'),
      },
      {
        path: 'models',
        name: 'models',
        component: () => import('@/pages/ModelsPage.vue'),
      },
      {
        path: 'sessions',
        name: 'sessions',
        component: () => import('@/pages/SessionsPage.vue'),
      },
      {
        path: 'sessions/new',
        name: 'session-create',
        component: () => import('@/pages/ChatPage.vue'),
      },
      {
        path: 'sessions/:id',
        name: 'session-chat',
        component: () => import('@/pages/ChatPage.vue'),
        props: true,
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/pages/SettingsPage.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guest && isAuthenticated) {
    return { name: 'dashboard' }
  }

  return true
})

export default router