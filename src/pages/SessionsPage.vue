<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSessions } from '@/composables/useSessions'

const { sessions, loading, error, fetchSessions, deleteSession } = useSessions()

const search = ref('')
const deleteDialog = ref(false)
const sessionToDelete = ref<string | null>(null)

const headers = [
  { title: 'Title', key: 'title' },
  { title: 'Agent', key: 'agentName' },
  { title: 'Messages', key: 'messageCount' },
  { title: 'Status', key: 'status' },
  { title: 'Started', key: 'startedAt' },
  { title: 'Actions', key: 'actions' },
]

onMounted(() => {
  fetchSessions()
})

function getStatusName(status: number): string {
  const statuses: Record<number, string> = { 0: 'Pending', 1: 'Active', 2: 'Completed', 3: 'Cancelled' }
  return statuses[status] || 'Unknown'
}

function getStatusColor(status: number): string {
  const colors: Record<number, string> = { 0: 'warning', 1: 'success', 2: 'info', 3: 'error' }
  return colors[status] || 'grey'
}

function formatDate(date: string): string {
  return new Date(date).toLocaleString()
}

function confirmDelete(id: string) {
  sessionToDelete.value = id
  deleteDialog.value = true
}

async function handleDelete() {
  if (sessionToDelete.value) {
    await deleteSession(sessionToDelete.value)
    deleteDialog.value = false
    sessionToDelete.value = null
  }
}
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h4">Sessions</h1>
      <v-btn color="primary" to="/sessions/new">
        <v-icon icon="mdi-chat-plus" start />New Chat
      </v-btn>
    </div>

    <v-card>
      <v-card-title>
        <v-text-field
          v-model="search"
          label="Search sessions..."
          prepend-inner-icon="mdi-magnify"
          single-line
          hide-details
          density="compact"
        />
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="sessions"
        :search="search"
        :loading="loading"
        :items-per-page="10"
      >
        <template #[`item.status`]="{ value }">
          <v-chip :color="getStatusColor(value)" size="small">
            {{ getStatusName(value) }}
          </v-chip>
        </template>
        <template #[`item.startedAt`]="{ value }">
          {{ formatDate(value) }}
        </template>
        <template #[`item.actions`]="{ item }">
          <v-btn icon="mdi-chat" size="small" variant="text" :to="`/sessions/${item.sessionId}`" />
          <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="confirmDelete(item.sessionId)" />
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete Session?</v-card-title>
        <v-card-text>Are you sure you want to delete this session? This action cannot be undone.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="handleDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar :model-value="!!error" color="error">
      {{ error }}
    </v-snackbar>
  </div>
</template>