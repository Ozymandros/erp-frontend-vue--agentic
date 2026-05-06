<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import menuConfig from '@/config/menu'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUiStore()

const drawerOpen = computed({
  get: () => uiStore.sidebarOpen,
  set: (val) => (uiStore.sidebarOpen = val),
})

const isMini = computed({
  get: () => uiStore.sidebarMini,
  set: (val) => (uiStore.sidebarMini = val),
})

const userMenu = [
  { title: 'Profile', icon: 'mdi-account', to: '/settings/profile' },
  { title: 'Settings', icon: 'mdi-cog', to: '/settings' },
  { title: 'Logout', icon: 'mdi-logout', action: 'logout' },
]

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

function navigateTo(path?: string) {
  if (path) router.push(path)
}
</script>

<template>
  <v-layout>
    <v-app-bar elevation="1" color="white">
      <v-app-bar-nav-icon @click="uiStore.toggleSidebar" />
      <v-app-bar-title>Agentic Dashboard</v-app-bar-title>
      <v-spacer />
      <v-menu>
        <template #activator="{ props }">
          <v-btn icon="mdi-account" v-bind="props" />
        </template>
        <v-list>
          <v-list-item
            v-for="(item, i) in userMenu"
            :key="i"
            :prepend-icon="item.icon"
            :title="item.title"
            @click="item.action === 'logout' ? handleLogout() : navigateTo(item.to)"
          />
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawerOpen"
      :rail="isMini"
      :permanent="!$vuetify.display.mobile"
      color="grey-lighten-5"
    >
      <v-list density="compact" nav>
        <template v-for="(item, i) in menuConfig" :key="i">
          <v-list-group v-if="item.children" :value="item.title">
            <template #activator="{ props }">
              <v-list-item v-bind="props" :prepend-icon="item.icon" :title="item.title" />
            </template>
            <v-list-item
              v-for="(child, j) in item.children"
              :key="j"
              :prepend-icon="child.icon"
              :title="child.title"
              :to="child.to"
              :active="route.path === child.to"
              @click="navigateTo(child.to)"
            />
          </v-list-group>
          <v-list-item
            v-else
            :prepend-icon="item.icon"
            :title="item.title"
            :to="item.to"
            :active="route.path === item.to"
            @click="navigateTo(item.to)"
          />
        </template>
      </v-list>

      <template #append>
        <v-list-item
          :prepend-icon="isMini ? 'mdi-chevron-right' : 'mdi-chevron-left'"
          :title="isMini ? '' : 'Collapse'"
          @click="isMini = !isMini"
        />
      </template>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid class="pa-4">
        <router-view />
      </v-container>
    </v-main>
  </v-layout>
</template>