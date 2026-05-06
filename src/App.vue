<script setup lang="ts">
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
</script>

<template>
  <v-app :theme="uiStore.currentTheme">
    <router-view />
  </v-app>
</template>