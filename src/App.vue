<script setup lang="ts">
import { watch } from 'vue'
import { useTheme } from 'vuetify'
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
const theme = useTheme()

watch(
  () => uiStore.currentTheme,
  (name) => {
    theme.change(name)
    document.documentElement.classList.toggle('dark', name === 'dark')
  },
  { immediate: true },
)
</script>

<template>
  <v-app :theme="uiStore.currentTheme">
    <router-view />
  </v-app>
</template>