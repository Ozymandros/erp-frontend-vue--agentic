<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useProviders } from '@/composables/useProviders'
import type { AIProviderDto } from '@/types'
import { providerSchema } from '@/schemas/management'
import { getFieldError, validateSchema } from '@/schemas/validation'

const {
  providers,
  loading,
  error,
  fetchProviders,
  createProvider,
  updateProvider,
  deleteProvider,
} = useProviders()

const search = ref('')
const dialog = ref(false)
const deleteDialog = ref(false)
const editingProvider = ref<AIProviderDto | null>(null)
const providerToDelete = ref<AIProviderDto | null>(null)
const saving = ref(false)
const touched = ref<Record<string, boolean>>({})

function baseDefaults() {
  return {
    defaultTemperature: 0.7,
    defaultTopK: 3,
    defaultMaxTokens: 2048,
    defaultEmbeddingDimensions: 1536,
    defaultEnableMemory: true,
    defaultEnableRAG: true,
    defaultEmbeddingModelName: '',
    defaultBotType: 1,
    defaultSystemPrompt: '',
  }
}

const form = ref({
  name: '',
  baseUrl: '',
  apiKey: '',
  ...baseDefaults(),
})

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Base URL', key: 'baseUrl' },
  { title: 'Api Key', key: 'apiKey' },
  { title: 'Actions', key: 'actions' },
]

const fieldErrors = computed(() => {
  const result = providerSchema.safeParse(form.value)
  if (result.success) return {}
  const errors: Record<string, string> = {}
  for (const err of result.error.issues) {
    errors[err.path.join('.')] = err.message
  }
  return errors
})

onMounted(() => {
  fetchProviders()
})

function openCreateDialog() {
  editingProvider.value = null
  touched.value = {}
  form.value = {
    name: '',
    baseUrl: '',
    apiKey: '',
    ...baseDefaults(),
  }
  dialog.value = true
}

function openEditDialog(provider: AIProviderDto) {
  editingProvider.value = provider
  touched.value = {}
  form.value = {
    name: provider.name,
    baseUrl: provider.baseUrl,
    apiKey: provider.apiKey,
    defaultTemperature: provider.defaultTemperature,
    defaultTopK: provider.defaultTopK,
    defaultMaxTokens: provider.defaultMaxTokens,
    defaultEmbeddingDimensions: provider.defaultEmbeddingDimensions,
    defaultEnableMemory: provider.defaultEnableMemory,
    defaultEnableRAG: provider.defaultEnableRAG,
    defaultEmbeddingModelName: provider.defaultEmbeddingModelName ?? '',
    defaultBotType: provider.defaultBotType,
    defaultSystemPrompt: provider.defaultSystemPrompt ?? '',
  }
  dialog.value = true
}

function touch(field: string) {
  touched.value[field] = true
}

function confirmDelete(provider: AIProviderDto) {
  providerToDelete.value = provider
  deleteDialog.value = true
}

async function submitForm() {
  const result = validateSchema(providerSchema, form.value)
  if (!result.success) {
    Object.keys(form.value).forEach((key) => {
      touched.value[key] = true
    })
    return
  }

  const payload = result.data
  if (!payload) return

  saving.value = true
  try {
    const normalizedPayload = {
      ...payload,
      defaultEmbeddingModelName: payload.defaultEmbeddingModelName || null,
      defaultSystemPrompt: payload.defaultSystemPrompt || null,
    }

    if (editingProvider.value) {
      await updateProvider(editingProvider.value.id, normalizedPayload)
    } else {
      await createProvider(normalizedPayload)
    }
    await fetchProviders()
    dialog.value = false
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (!providerToDelete.value) return
  await deleteProvider(providerToDelete.value.id)
  deleteDialog.value = false
  providerToDelete.value = null
}
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h4">Providers</h1>
      <v-btn color="primary" @click="openCreateDialog">
        <v-icon icon="mdi-plus" start />New Provider
      </v-btn>
    </div>

    <v-card>
      <v-card-title>
        <v-text-field
          v-model="search"
          label="Search providers..."
          prepend-inner-icon="mdi-magnify"
          single-line
          hide-details
          density="compact"
        />
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="
          providers?.map((item) => ({
            ...item,
            apiKey: item.apiKey ? `sk-...${item.apiKey?.substring(item.apiKey.length - 4)}` : '',
          }))
        "
        :search="search"
        :loading="loading"
        :items-per-page="10"
      >
        <template #[`item.actions`]="{ item }">
          <v-btn icon="mdi-pencil" size="small" variant="text" @click="openEditDialog(item)" />
          <v-btn
            icon="mdi-delete"
            size="small"
            variant="text"
            color="error"
            @click="confirmDelete(item)"
          />
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="900">
      <v-card>
        <v-card-title>{{ editingProvider ? 'Edit Provider' : 'Create Provider' }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="submitForm">
            <v-text-field
              v-model="form.name"
              label="Name"
              :error-messages="
                getFieldError(fieldErrors, 'name') ||
                (touched.name && !form.name ? ['Provider name is required'] : [])
              "
              @blur="touch('name')"
            />
            <v-text-field
              v-model="form.baseUrl"
              label="Base URL"
              :error-messages="
                getFieldError(fieldErrors, 'baseUrl') ||
                (touched.baseUrl && !form.baseUrl ? ['Base URL is required'] : [])
              "
              @blur="touch('baseUrl')"
            />
            <v-text-field
              v-model="form.apiKey"
              label="Api Key"
              type="password"
              :error-messages="
                getFieldError(fieldErrors, 'apiKey') ||
                (touched.apiKey && !form.apiKey ? ['Secret key name is required'] : [])
              "
              @blur="touch('apiKey')"
            />

            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.defaultTemperature"
                  label="Default Temperature"
                  type="number"
                  step="0.1"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.defaultTopK"
                  label="Default Top K"
                  type="number"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.defaultMaxTokens"
                  label="Default Max Tokens"
                  type="number"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.defaultEmbeddingDimensions"
                  label="Default Embedding Dimensions"
                  type="number"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="form.defaultBotType"
                  label="Default Bot Type"
                  type="number"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.defaultEmbeddingModelName"
                  label="Default Embedding Model Name"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="form.defaultEnableMemory"
                  label="Default Enable Memory"
                  color="primary"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="form.defaultEnableRAG"
                  label="Default Enable RAG"
                  color="primary"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="form.defaultSystemPrompt"
                  label="Default System Prompt"
                  rows="4"
                />
              </v-col>
            </v-row>

            <div class="d-flex justify-end mt-4">
              <v-btn variant="text" class="mr-2" @click="dialog = false">Cancel</v-btn>
              <v-btn type="submit" color="primary" :loading="saving">Save</v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete Provider?</v-card-title>
        <v-card-text> Are you sure you want to delete {{ providerToDelete?.name }}? </v-card-text>
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
