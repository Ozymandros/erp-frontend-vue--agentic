<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAgents } from '@/composables/useAgents'
import { useProviders } from '@/composables/useProviders'
import { useModels } from '@/composables/useModels'
import { createAgentSchema, updateAgentSchema } from '@/schemas/agent'
import { validateSchema, getFieldError } from '@/schemas/validation'

const route = useRoute()
const router = useRouter()
const { currentAgent, error: storeError, fetchAgent, createAgent, updateAgent } = useAgents()
const { providers, fetchProviders } = useProviders()
const { modelsByProvider, fetchModelsByProvider, clearModelsByProvider } = useModels()

const isEdit = computed(() => !!route.params.id)
const agentId = computed(() => route.params.id as string)

const form = ref({
  name: '',
  description: '',
  providerId: '',
  modelId: '',
  temperature: 0.7,
  systemPrompt: '',
  botType: 1,
  topK: 3,
  maxTokens: 2048,
  embeddingDimensions: 1536,
  enableMemory: true,
  enableRAG: true,
  embeddingModelName: '',
})

const touched = ref<Record<string, boolean>>({})
const saving = ref(false)
const isInitializing = ref(false)

const schema = computed(() => (isEdit.value ? updateAgentSchema : createAgentSchema))

const fieldErrors = computed(() => {
  const result = schema.value.safeParse(form.value)
  if (result.success) return {}
  const errors: Record<string, string> = {}
  for (const err of result.error.issues) {
    errors[err.path.join('.')] = err.message
  }
  return errors
})

const botTypes = [
  { title: 'General', value: 0 },
  { title: 'Chat', value: 1 },
  { title: 'RAG', value: 2 },
  { title: 'Assistant', value: 3 },
]

const providerOptions = computed(() =>
  providers.value.map((provider) => ({
    title: provider.name,
    value: provider.id,
  })),
)

const modelOptions = computed(() =>
  modelsByProvider.value.map((model) => ({
    title: `${model.commercialName} (${model.technicalName})`,
    value: model.id,
  })),
)

const isModelDisabled = computed(() => !form.value.providerId)
const modelSelectKey = computed(() => `${form.value.providerId}:${modelOptions.value.length}:${form.value.modelId}`)

onMounted(async () => {
  isInitializing.value = true
  await fetchProviders()

  if (isEdit.value) {
    await fetchAgent(agentId.value)
    if (currentAgent.value) {
      form.value = {
        name: currentAgent.value.name,
        description: currentAgent.value.description,
        providerId: currentAgent.value.providerId,
        modelId: '',
        temperature: currentAgent.value.temperature,
        systemPrompt: currentAgent.value.systemPrompt,
        botType: currentAgent.value.botType,
        topK: currentAgent.value.topK,
        maxTokens: currentAgent.value.maxTokens,
        embeddingDimensions: currentAgent.value.embeddingDimensions,
        enableMemory: currentAgent.value.enableMemory,
        enableRAG: currentAgent.value.enableRAG,
        embeddingModelName: currentAgent.value.embeddingModelName || '',
      }

      await loadModelsForProvider(currentAgent.value.providerId)
      await nextTick()
      form.value.modelId = currentAgent.value.modelId
    }
  }

  isInitializing.value = false
})

function touch(field: string) {
  touched.value[field] = true
}

async function loadModelsForProvider(providerId: string) {
  if (!providerId) {
    clearModelsByProvider()
    return
  }
  await fetchModelsByProvider(providerId)
}

function applyModelDefaults(modelId: string) {
  const model = modelsByProvider.value.find((item) => item.id === modelId)
  if (!model) return

  form.value.temperature = model.defaultTemperature
  form.value.topK = model.defaultTopK
  form.value.maxTokens = model.defaultMaxTokens
  form.value.embeddingDimensions = model.defaultEmbeddingDimensions
  form.value.enableMemory = model.defaultEnableMemory
  form.value.enableRAG = model.defaultEnableRAG
  form.value.botType = model.defaultBotType
  form.value.systemPrompt = model.defaultSystemPrompt ?? ''
  form.value.embeddingModelName = model.defaultEmbeddingModelName ?? ''
}

watch(
  () => form.value.providerId,
  async (providerId, previousProviderId) => {
    if (providerId === previousProviderId || isInitializing.value) return

    form.value.modelId = ''
    clearModelsByProvider()

    await loadModelsForProvider(providerId)
  },
)

watch(
  () => form.value.modelId,
  (modelId) => {
    if (!modelId) return
    applyModelDefaults(modelId)
  },
)

async function handleSubmit() {
  const result = validateSchema(schema.value, form.value)
  if (!result.success) {
    Object.keys(form.value).forEach((key) => (touched.value[key] = true))
    return
  }

  saving.value = true
  try {
    const data = result.data
    if (!data) return

    const payload = {
      name: data.name || '',
      description: data.description || '',
      providerId: data.providerId || '',
      modelId: data.modelId || '',
      temperature: data.temperature ?? 0.7,
      systemPrompt: data.systemPrompt || '',
      botType: data.botType ?? 1,
      topK: data.topK ?? 3,
      maxTokens: data.maxTokens ?? 2048,
      embeddingDimensions: data.embeddingDimensions ?? 1536,
      enableMemory: data.enableMemory ?? true,
      enableRAG: data.enableRAG ?? true,
      embeddingModelName: data.embeddingModelName || undefined,
    }

    if (isEdit.value) {
      await updateAgent(agentId.value, payload)
    } else {
      await createAgent(payload)
    }
    router.push('/agents')
  } catch {
    // Error handled by store
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h4">{{ isEdit ? 'Edit Agent' : 'Create Agent' }}</h1>
      <v-btn variant="text" to="/agents">Cancel</v-btn>
    </div>

    <v-card>
      <v-card-text>
        <v-form @submit.prevent="handleSubmit">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.name"
                label="Name"
                :error-messages="
                  getFieldError(fieldErrors, 'name') ||
                  (touched.name && !form.name ? ['Name is required'] : [])
                "
                @blur="touch('name')"
              />
            </v-col>
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
              <v-select
                :key="modelSelectKey"
                v-model="form.modelId"
                :items="modelOptions"
                item-title="title"
                item-value="value"
                label="Model"
                :disabled="isModelDisabled"
                :error-messages="getFieldError(fieldErrors, 'modelId')"
                @blur="touch('modelId')"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model.number="form.botType" :items="botTypes" label="Bot Type" />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="form.description"
                label="Description"
                :error-messages="getFieldError(fieldErrors, 'description')"
                @blur="touch('description')"
                rows="3"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="form.temperature"
                label="Temperature"
                type="number"
                step="0.1"
                min="0"
                max="2"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="form.systemPrompt"
                label="System Prompt"
                :error-messages="getFieldError(fieldErrors, 'systemPrompt')"
                @blur="touch('systemPrompt')"
                rows="5"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model.number="form.topK" label="Top K" type="number" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model.number="form.maxTokens" label="Max Tokens" type="number" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="form.embeddingDimensions"
                label="Embedding Dimensions"
                type="number"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-switch v-model="form.enableMemory" label="Enable Memory" color="primary" />
            </v-col>
            <v-col cols="12" md="6">
              <v-switch v-model="form.enableRAG" label="Enable RAG" color="primary" />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="form.embeddingModelName" label="Embedding Model Name" />
            </v-col>
          </v-row>
          <v-btn type="submit" color="primary" :loading="saving">
            {{ isEdit ? 'Update' : 'Create' }} Agent
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <v-snackbar :model-value="!!storeError" color="error">
      {{ storeError }}
    </v-snackbar>
  </div>
</template>
