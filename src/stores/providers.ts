import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AIProviderDto, CreateAIProviderDto, UpdateAIProviderDto } from '@/types'
import { agenticApi } from '@/api'

export const useProvidersStore = defineStore('providers', () => {
  const providers = ref<AIProviderDto[]>([])
  const currentProvider = ref<AIProviderDto | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProviders() {
    loading.value = true
    error.value = null
    try {
      providers.value = await agenticApi.getProviders()
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch providers'
    } finally {
      loading.value = false
    }
  }

  async function fetchProvider(id: string) {
    loading.value = true
    error.value = null
    try {
      currentProvider.value = await agenticApi.getProvider(id)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch provider'
    } finally {
      loading.value = false
    }
  }

  async function createProvider(data: CreateAIProviderDto) {
    loading.value = true
    error.value = null
    try {
      const provider = await agenticApi.createProvider(data)
      providers.value.push(provider)
      return provider
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to create provider'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateProvider(id: string, data: UpdateAIProviderDto) {
    loading.value = true
    error.value = null
    try {
      const provider = await agenticApi.updateProvider(id, data)
      const index = providers.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        providers.value[index] = provider
      }
      currentProvider.value = provider
      return provider
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to update provider'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteProvider(id: string) {
    loading.value = true
    error.value = null
    try {
      await agenticApi.deleteProvider(id)
      providers.value = providers.value.filter((p) => p.id !== id)
      if (currentProvider.value?.id === id) {
        currentProvider.value = null
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to delete provider'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    providers,
    currentProvider,
    loading,
    error,
    fetchProviders,
    fetchProvider,
    createProvider,
    updateProvider,
    deleteProvider,
  }
})
