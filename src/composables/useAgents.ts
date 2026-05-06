import { computed } from 'vue'
import { useAgentsStore } from '@/stores/agents'

export function useAgents() {
  const agentsStore = useAgentsStore()

  const agents = computed(() => agentsStore.agents)
  const currentAgent = computed(() => agentsStore.currentAgent)
  const loading = computed(() => agentsStore.loading)
  const error = computed(() => agentsStore.error)

  async function fetchAgents() {
    await agentsStore.fetchAgents()
  }

  async function fetchAgent(id: string) {
    await agentsStore.fetchAgent(id)
  }

  async function createAgent(data: Parameters<typeof agentsStore.createAgent>[0]) {
    return await agentsStore.createAgent(data)
  }

  async function updateAgent(id: string, data: Parameters<typeof agentsStore.updateAgent>[1]) {
    return await agentsStore.updateAgent(id, data)
  }

  async function deleteAgent(id: string) {
    await agentsStore.deleteAgent(id)
  }

  return {
    agents,
    currentAgent,
    loading,
    error,
    fetchAgents,
    fetchAgent,
    createAgent,
    updateAgent,
    deleteAgent,
  }
}