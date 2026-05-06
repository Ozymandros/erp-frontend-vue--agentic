<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAgentsStore } from '@/stores/agents'
import { useSessionsStore } from '@/stores/sessions'

const authStore = useAuthStore()
const agentsStore = useAgentsStore()
const sessionsStore = useSessionsStore()

const userName = computed(() => authStore.fullName)
const agentsCount = computed(() => agentsStore.agents.length)
const sessionsCount = computed(() => sessionsStore.sessions.length)
const activeSessionsCount = computed(() => sessionsStore.activeSessions.length)

onMounted(async () => {
  await Promise.all([agentsStore.fetchAgents(), sessionsStore.fetchSessions()])
})
</script>

<template>
  <div>
    <h1 class="text-h4 mb-4">Welcome, {{ userName }}</h1>
    
    <v-row>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="d-flex align-center">
            <v-avatar color="primary" size="56" class="mr-4">
              <v-icon icon="mdi-robot" size="32" />
            </v-avatar>
            <div>
              <div class="text-h4">{{ agentsCount }}</div>
              <div class="text-body-2 text-grey">Total Agents</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="d-flex align-center">
            <v-avatar color="info" size="56" class="mr-4">
              <v-icon icon="mdi-forum" size="32" />
            </v-avatar>
            <div>
              <div class="text-h4">{{ sessionsCount }}</div>
              <div class="text-body-2 text-grey">Total Sessions</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="d-flex align-center">
            <v-avatar color="success" size="56" class="mr-4">
              <v-icon icon="mdi-message" size="32" />
            </v-avatar>
            <div>
              <div class="text-h4">{{ activeSessionsCount }}</div>
              <div class="text-body-2 text-grey">Active Sessions</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Quick Actions</v-card-title>
          <v-card-text>
            <v-btn color="primary" class="mr-2" to="/agents/new">
              <v-icon icon="mdi-plus" start />New Agent
            </v-btn>
            <v-btn color="info" to="/sessions/new">
              <v-icon icon="mdi-chat-plus" start />New Chat
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Recent Sessions</v-card-title>
          <v-card-text>
            <v-list v-if="sessionsStore.sessions.length > 0">
              <v-list-item
                v-for="session in sessionsStore.sessions.slice(0, 5)"
                :key="session.sessionId"
                :to="`/sessions/${session.sessionId}`"
              >
                <v-list-item-title>{{ session.title || 'Untitled Session' }}</v-list-item-title>
                <v-list-item-subtitle>{{ session.agentName }} - {{ session.messageCount }} messages</v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <div v-else class="text-body-2 text-grey">No sessions yet</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>