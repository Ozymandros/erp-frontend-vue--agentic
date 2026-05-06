import { computed, type ComputedRef } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const isAuthenticated: ComputedRef<boolean> = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.user)
  const loading = computed(() => authStore.loading)
  const error = computed(() => authStore.error)

  async function login(email: string, password: string) {
    await authStore.login(email, password)
    router.push('/dashboard')
  }

  async function register(data: { email: string; username: string; password: string; passwordConfirm: string }) {
    await authStore.register(data)
    router.push('/dashboard')
  }

  function logout() {
    authStore.logout()
    router.push('/login')
  }

  return {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    register,
    logout,
  }
}

export function useAuthGuard() {
  const authStore = useAuthStore()
  const router = useRouter()

  function requiresAuth() {
    if (!authStore.isAuthenticated) {
      router.push('/login')
      return false
    }
    return true
  }

  function guestOnly() {
    if (authStore.isAuthenticated) {
      router.push('/dashboard')
      return false
    }
    return true
  }

  return {
    requiresAuth,
    guestOnly,
  }
}