import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AgentListDto, AgentDto, CreateAgentDto, UpdateAgentDto } from '@/types'
import { agenticApi } from '@/api'

export const useAgentsStore = defineStore('agents', () => {
  const agents = ref<AgentListDto[]>([])
  const currentAgent = ref<AgentDto | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAgents() {
    loading.value = true
    error.value = null
    try {
      agents.value = await agenticApi.getAgents()
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch agents'
    } finally {
      loading.value = false
    }
  }

  async function fetchAgent(id: string) {
    loading.value = true
    error.value = null
    try {
      currentAgent.value = await agenticApi.getAgent(id)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch agent'
    } finally {
      loading.value = false
    }
  }

  async function createAgent(data: CreateAgentDto) {
    loading.value = true
    error.value = null
    try {
      const agent = await agenticApi.createAgent(data)
      agents.value.push(agent)
      return agent
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to create agent'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateAgent(id: string, data: UpdateAgentDto) {
    loading.value = true
    error.value = null
    try {
      const agent = await agenticApi.updateAgent(id, data)
      const index = agents.value.findIndex((a) => a.id === id)
      if (index !== -1) {
        agents.value[index] = { ...agent, description: agent.description, modelName: agent.modelName, botType: agent.botType, isActive: agent.isActive, enableMemory: agent.enableMemory, enableRAG: agent.enableRAG }
      }
      currentAgent.value = agent
      return agent
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to update agent'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteAgent(id: string) {
    loading.value = true
    error.value = null
    try {
      await agenticApi.deleteAgent(id)
      agents.value = agents.value.filter((a) => a.id !== id)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to delete agent'
      throw e
    } finally {
      loading.value = false
    }
  }

  function clearCurrentAgent() {
    currentAgent.value = null
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
    clearCurrentAgent,
  }
})