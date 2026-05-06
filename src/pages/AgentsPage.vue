<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAgents } from '@/composables/useAgents'

const { agents, loading, error, fetchAgents, deleteAgent } = useAgents()

const search = ref('')
const deleteDialog = ref(false)
const agentToDelete = ref<string | null>(null)

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Description', key: 'description' },
  { title: 'Model', key: 'modelName' },
  { title: 'Type', key: 'botType' },
  { title: 'Active', key: 'isActive' },
  { title: 'Actions', key: 'actions' },
]

onMounted(() => {
  fetchAgents()
})

function confirmDelete(id: string) {
  agentToDelete.value = id
  deleteDialog.value = true
}

async function handleDelete() {
  if (agentToDelete.value) {
    await deleteAgent(agentToDelete.value)
    deleteDialog.value = false
    agentToDelete.value = null
  }
}
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h4">Agents</h1>
      <v-btn color="primary" to="/agents/new">
        <v-icon icon="mdi-plus" start />New Agent
      </v-btn>
    </div>

    <v-card>
      <v-card-title>
        <v-text-field
          v-model="search"
          label="Search agents..."
          prepend-inner-icon="mdi-magnify"
          single-line
          hide-details
          density="compact"
        />
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="agents"
        :search="search"
        :loading="loading"
        :items-per-page="10"
      >
        <template #[`item.isActive`]="{ value }">
          <v-chip :color="value ? 'success' : 'grey'" size="small">
            {{ value ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>
        <template #[`item.actions`]="{ value }">
          <v-btn icon="mdi-pencil" size="small" variant="text" :to="`/agents/${value.id}`" />
          <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="confirmDelete(value.id)" />
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete Agent?</v-card-title>
        <v-card-text>Are you sure you want to delete this agent? This action cannot be undone.</v-card-text>
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