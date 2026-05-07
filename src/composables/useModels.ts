import { computed } from 'vue'
import { useModelsStore } from '@/stores/models'

export function useModels() {
  const modelsStore = useModelsStore()

  const models = computed(() => modelsStore.models)
  const modelsByProvider = computed(() => modelsStore.modelsByProvider)
  const currentModel = computed(() => modelsStore.currentModel)
  const loading = computed(() => modelsStore.loading)
  const error = computed(() => modelsStore.error)

  async function fetchModels() {
    await modelsStore.fetchModels()
  }

  async function fetchModelsByProvider(providerId: string) {
    await modelsStore.fetchModelsByProvider(providerId)
  }

  async function fetchModel(id: string) {
    await modelsStore.fetchModel(id)
  }

  async function createModel(data: Parameters<typeof modelsStore.createModel>[0]) {
    return await modelsStore.createModel(data)
  }

  async function updateModel(id: string, data: Parameters<typeof modelsStore.updateModel>[1]) {
    return await modelsStore.updateModel(id, data)
  }

  async function deleteModel(id: string) {
    await modelsStore.deleteModel(id)
  }

  function clearModelsByProvider() {
    modelsStore.clearModelsByProvider()
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
}
