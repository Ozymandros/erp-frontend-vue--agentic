<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useModels } from '@/composables/useModels'
import { useProviders } from '@/composables/useProviders'
import type { AIModelDto } from '@/types'
import { modelSchema } from '@/schemas/management'
import { getFieldError, validateSchema } from '@/schemas/validation'

const { models, loading, error, fetchModels, createModel, updateModel, deleteModel } = useModels()
const { providers, fetchProviders } = useProviders()

const search = ref('')
const dialog = ref(false)
const deleteDialog = ref(false)
const editingModel = ref<AIModelDto | null>(null)
const modelToDelete = ref<AIModelDto | null>(null)
const saving = ref(false)
const touched = ref<Record<string, boolean>>({})

const providerOptions = computed(() =>
  providers.value.map((provider) => ({ title: provider.name, value: provider.id }))
)

const headers = [
  { title: 'Commercial Name', key: 'commercialName' },
  { title: 'Technical Name', key: 'technicalName' },
  { title: 'Provider', key: 'providerName' },
  { title: 'Token Limit', key: 'tokenLimit' },
  { title: 'Actions', key: 'actions' },
]

const form = ref({
  providerId: '',
  commercialName: '',
  technicalName: '',
  tokenLimit: 1,
  capabilities: '',
  defaultTemperature: 0.7,
  defaultTopK: 3,
  defaultMaxTokens: 2048,
  defaultEmbeddingDimensions: 1536,
  defaultEnableMemory: true,
  defaultEnableRAG: true,
  defaultEmbeddingModelName: '',
  defaultBotType: 1,
  defaultSystemPrompt: '',
})

const modelDefaultsTouched = ref(false)
const applyingProviderDefaults = ref(false)

function createBaseModelDefaults() {
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

function applyDefaultConfiguration(defaults: ReturnType<typeof createBaseModelDefaults>) {
  applyingProviderDefaults.value = true
  form.value.defaultTemperature = defaults.defaultTemperature
  form.value.defaultTopK = defaults.defaultTopK
  form.value.defaultMaxTokens = defaults.defaultMaxTokens
  form.value.defaultEmbeddingDimensions = defaults.defaultEmbeddingDimensions
  form.value.defaultEnableMemory = defaults.defaultEnableMemory
  form.value.defaultEnableRAG = defaults.defaultEnableRAG
  form.value.defaultEmbeddingModelName = defaults.defaultEmbeddingModelName
  form.value.defaultBotType = defaults.defaultBotType
  form.value.defaultSystemPrompt = defaults.defaultSystemPrompt
  applyingProviderDefaults.value = false
}

onMounted(async () => {
  await Promise.all([fetchProviders(), fetchModels()])
})

function openCreateDialog() {
  editingModel.value = null
  modelDefaultsTouched.value = false
  touched.value = {}
  form.value = {
    providerId: '',
    commercialName: '',
    technicalName: '',
    tokenLimit: 1,
    capabilities: '',
    ...createBaseModelDefaults(),
  }
  dialog.value = true
}

function openEditDialog(model: AIModelDto) {
  editingModel.value = model
  modelDefaultsTouched.value = true
  touched.value = {}
  form.value = {
    providerId: model.providerId,
    commercialName: model.commercialName,
    technicalName: model.technicalName,
    tokenLimit: model.tokenLimit,
    capabilities: model.capabilities,
    defaultTemperature: model.defaultTemperature,
    defaultTopK: model.defaultTopK,
    defaultMaxTokens: model.defaultMaxTokens,
    defaultEmbeddingDimensions: model.defaultEmbeddingDimensions,
    defaultEnableMemory: model.defaultEnableMemory,
    defaultEnableRAG: model.defaultEnableRAG,
    defaultEmbeddingModelName: model.defaultEmbeddingModelName ?? '',
    defaultBotType: model.defaultBotType,
    defaultSystemPrompt: model.defaultSystemPrompt ?? '',
  }
  dialog.value = true
}

function confirmDelete(model: AIModelDto) {
  modelToDelete.value = model
  deleteDialog.value = true
}

async function submitForm() {
  const result = validateSchema(modelSchema, form.value)
  if (!result.success) {
    Object.keys(form.value).forEach((key) => { touched.value[key] = true })
    return
  }

  const data = result.data
  if (!data) return

  saving.value = true
  try {
    const payload = {
      ...data,
      defaultEmbeddingModelName: data.defaultEmbeddingModelName || null,
      defaultSystemPrompt: data.defaultSystemPrompt || null,
    }
    if (editingModel.value) {
      await updateModel(editingModel.value.id, payload)
    } else {
      await createModel(payload)
    }
    dialog.value = false
    await fetchModels()
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (!modelToDelete.value) return
  await deleteModel(modelToDelete.value.id)
  deleteDialog.value = false
  modelToDelete.value = null
}

function copyDefaultsFromProvider(providerId: string) {
  const providerModel = models.value.find((model) => model.providerId === providerId)
  if (!providerModel) {
    applyDefaultConfiguration(createBaseModelDefaults())
    return
  }

  applyDefaultConfiguration({
    defaultTemperature: providerModel.defaultTemperature,
    defaultTopK: providerModel.defaultTopK,
    defaultMaxTokens: providerModel.defaultMaxTokens,
    defaultEmbeddingDimensions: providerModel.defaultEmbeddingDimensions,
    defaultEnableMemory: providerModel.defaultEnableMemory,
    defaultEnableRAG: providerModel.defaultEnableRAG,
    defaultEmbeddingModelName: providerModel.defaultEmbeddingModelName ?? '',
    defaultBotType: providerModel.defaultBotType,
    defaultSystemPrompt: providerModel.defaultSystemPrompt ?? '',
  })
}

watch(
  () => form.value.providerId,
  (providerId) => {
    if (!dialog.value || editingModel.value || modelDefaultsTouched.value || !providerId) return
    copyDefaultsFromProvider(providerId)
  }
)

watch(
  () => [
    form.value.defaultTemperature,
    form.value.defaultTopK,
    form.value.defaultMaxTokens,
    form.value.defaultEmbeddingDimensions,
    form.value.defaultEnableMemory,
    form.value.defaultEnableRAG,
    form.value.defaultEmbeddingModelName,
    form.value.defaultBotType,
    form.value.defaultSystemPrompt,
  ],
  () => {
    if (!dialog.value || editingModel.value || applyingProviderDefaults.value) return
    modelDefaultsTouched.value = true
  }
)

const fieldErrors = computed(() => {
  const result = modelSchema.safeParse(form.value)
  if (result.success) return {}
  const errors: Record<string, string> = {}
  for (const err of result.error.issues) {
    errors[err.path.join('.')] = err.message
  }
  return errors
})

function touch(field: string) {
  touched.value[field] = true
}
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h4">Models</h1>
      <v-btn color="primary" @click="openCreateDialog">
        <v-icon icon="mdi-plus" start />New Model
      </v-btn>
    </div>

    <v-card>
      <v-card-title>
        <v-text-field
          v-model="search"
          label="Search models..."
          prepend-inner-icon="mdi-magnify"
          single-line
          hide-details
          density="compact"
        />
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="models"
        :search="search"
        :loading="loading"
        :items-per-page="10"
      >
        <template #[`item.actions`]="{ item }">
          <v-btn icon="mdi-pencil" size="small" variant="text" @click="openEditDialog(item)" />
          <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="confirmDelete(item)" />
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="900">
      <v-card>
        <v-card-title>{{ editingModel ? 'Edit Model' : 'Create Model' }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="submitForm">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.providerId"
                  :items="providerOptions"
                  item-title="title"
                  item-value="value"
                  label="Provider"
                  :error-messages="getFieldError(fieldErrors, 'providerId')"
                  @blur="touch('providerId')"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.commercialName"
                  label="Commercial Name"
                  :error-messages="getFieldError(fieldErrors, 'commercialName')"
                  @blur="touch('commercialName')"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.technicalName"
                  label="Technical Name"
                  :error-messages="getFieldError(fieldErrors, 'technicalName')"
                  @blur="touch('technicalName')"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="form.tokenLimit" label="Token Limit" type="number" required />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="form.capabilities" label="Capabilities" required />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model.number="form.defaultTemperature" label="Default Temperature" type="number" step="0.1" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model.number="form.defaultTopK" label="Default Top K" type="number" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model.number="form.defaultMaxTokens" label="Default Max Tokens" type="number" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model.number="form.defaultEmbeddingDimensions" label="Default Embedding Dimensions" type="number" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model.number="form.defaultBotType" label="Default Bot Type" type="number" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="form.defaultEmbeddingModelName" label="Default Embedding Model Name" />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch v-model="form.defaultEnableMemory" label="Default Enable Memory" color="primary" />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch v-model="form.defaultEnableRAG" label="Default Enable RAG" color="primary" />
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="form.defaultSystemPrompt" label="Default System Prompt" rows="4" />
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
        <v-card-title>Delete Model?</v-card-title>
        <v-card-text>
          Are you sure you want to delete {{ modelToDelete?.commercialName }}?
        </v-card-text>
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
