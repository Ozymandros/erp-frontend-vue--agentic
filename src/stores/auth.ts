import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserDto } from '@/types'
import { authApi } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserDto | null>(null)
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)
  const fullName = computed(() => {
    if (!user.value) return ''
    return [user.value.firstName, user.value.lastName].filter(Boolean).join(' ') || user.value.username
  })

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const response = await authApi.login({ email, password })
      accessToken.value = response.accessToken
      refreshToken.value = response.refreshToken
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      if (response.user) {
        user.value = response.user
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Login failed'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function register(data: { email: string; username: string; password: string; passwordConfirm: string }) {
    loading.value = true
    error.value = null
    try {
      const response = await authApi.register(data)
      accessToken.value = response.accessToken
      refreshToken.value = response.refreshToken
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      if (response.user) {
        user.value = response.user
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Registration failed'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
    if (!accessToken.value) return
    try {
      user.value = await authApi.getCurrentUser()
    } catch {
      logout()
    }
  }

  function logout() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  return {
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    isAuthenticated,
    fullName,
    login,
    register,
    fetchUser,
    logout,
  }
})