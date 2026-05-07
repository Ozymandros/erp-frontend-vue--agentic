import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AIModelDto, CreateAIModelDto, UpdateAIModelDto } from '@/types'
import { agenticApi } from '@/api'

export const useModelsStore = defineStore('models', () => {
  const models = ref<AIModelDto[]>([])
  const modelsByProvider = ref<AIModelDto[]>([])
  const currentModel = ref<AIModelDto | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchModels() {
    loading.value = true
    error.value = null
    try {
      models.value = await agenticApi.getModels()
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch models'
    } finally {
      loading.value = false
    }
  }

  async function fetchModelsByProvider(providerId: string) {
    loading.value = true
    error.value = null
    try {
      modelsByProvider.value = await agenticApi.getModelsByProvider(providerId)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch models by provider'
    } finally {
      loading.value = false
    }
  }

  async function fetchModel(id: string) {
    loading.value = true
    error.value = null
    try {
      currentModel.value = await agenticApi.getModel(id)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch model'
    } finally {
      loading.value = false
    }
  }

  async function createModel(data: CreateAIModelDto) {
    loading.value = true
    error.value = null
    try {
      const model = await agenticApi.createModel(data)
      models.value.push(model)
      return model
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to create model'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateModel(id: string, data: UpdateAIModelDto) {
    loading.value = true
    error.value = null
    try {
      const model = await agenticApi.updateModel(id, data)
      const index = models.value.findIndex((m) => m.id === id)
      if (index !== -1) {
        models.value[index] = model
      }
      const providerIndex = modelsByProvider.value.findIndex((m) => m.id === id)
      if (providerIndex !== -1) {
        modelsByProvider.value[providerIndex] = model
      }
      currentModel.value = model
      return model
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to update model'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteModel(id: string) {
    loading.value = true
    error.value = null
    try {
      await agenticApi.deleteModel(id)
      models.value = models.value.filter((m) => m.id !== id)
      modelsByProvider.value = modelsByProvider.value.filter((m) => m.id !== id)
      if (currentModel.value?.id === id) {
        currentModel.value = null
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to delete model'
      throw e
    } finally {
      loading.value = false
    }
  }

  function clearModelsByProvider() {
    modelsByProvider.value = []
  }

  return {
    models,
    modelsByProvider,
    currentModel,
    loading,
    error,
    fetchModels,
    fetchModelsByProvider,
    fetchModel,
    createModel,
    updateModel,
    deleteModel,
    clearModelsByProvider,
  }
})
