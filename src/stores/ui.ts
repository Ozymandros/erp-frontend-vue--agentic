import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(true)
  const sidebarMini = ref(false)
  const currentTheme = ref<'light' | 'dark'>('light')
  const currentLocale = ref('en')

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function toggleTheme() {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  }

  function setLocale(locale: string) {
    currentLocale.value = locale
  }

  return {
    sidebarOpen,
    sidebarMini,
    currentTheme,
    currentLocale,
    toggleSidebar,
    toggleTheme,
    setLocale,
  }
})