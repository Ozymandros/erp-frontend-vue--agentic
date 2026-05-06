<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const authStore = useAuthStore()
const uiStore = useUiStore()

function handleLogout() {
  authStore.logout()
}
</script>

<template>
  <div>
    <h1 class="text-h4 mb-4">Settings</h1>
    
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Profile</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Username</v-list-item-title>
                <v-list-item-subtitle>{{ authStore.user?.username }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Email</v-list-item-title>
                <v-list-item-subtitle>{{ authStore.user?.email }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Name</v-list-item-title>
                <v-list-item-subtitle>{{ authStore.fullName || '-' }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Preferences</v-card-title>
          <v-card-text>
            <v-switch
              v-model="uiStore.currentTheme"
              label="Dark Mode"
              true-value="dark"
              false-value="light"
              color="primary"
              @update:model-value="uiStore.toggleTheme"
            />
            <v-select
              v-model="uiStore.currentLocale"
              :items="[{ title: 'English', value: 'en' }]"
              label="Language"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Account</v-card-title>
          <v-card-text>
            <v-btn color="error" @click="handleLogout">
              <v-icon icon="mdi-logout" start />Logout
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>