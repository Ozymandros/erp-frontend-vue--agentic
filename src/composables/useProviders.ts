import { computed } from 'vue'
import { useProvidersStore } from '@/stores/providers'

export function useProviders() {
  const providersStore = useProvidersStore()

  const providers = computed(() => providersStore.providers)
  const currentProvider = computed(() => providersStore.currentProvider)
  const loading = computed(() => providersStore.loading)
  const error = computed(() => providersStore.error)

  async function fetchProviders() {
    await providersStore.fetchProviders()
  }

  async function fetchProvider(id: string) {
    await providersStore.fetchProvider(id)
  }

  async function createProvider(data: Parameters<typeof providersStore.createProvider>[0]) {
    return await providersStore.createProvider(data)
  }

  async function updateProvider(id: string, data: Parameters<typeof providersStore.updateProvider>[1]) {
    return await providersStore.updateProvider(id, data)
  }

  async function deleteProvider(id: string) {
    await providersStore.deleteProvider(id)
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
}
