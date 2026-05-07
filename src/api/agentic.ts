import { apiClient } from '@/utils/apiClient'
import type {
  AIModelDto,
  AIProviderDto,
  AgentListDto,
  AgentDto,
  CreateAIModelDto,
  CreateAIProviderDto,
  CreateAgentDto,
  UpdateAgentDto,
  UpdateAIModelDto,
  UpdateAIProviderDto,
  SessionListItemDto,
  SessionDetailsResponse,
  StartSessionRequest,
  StartSessionResponse,
  ProcessAgentMessageRequest,
  ProcessAgentMessageResponse,
} from '@/types'

export const agenticApi = {
  // Providers
  getProviders: async (): Promise<AIProviderDto[]> => {
    const response = await apiClient.agentic.get<AIProviderDto[]>('/api/agentic/providers')
    return response.data
  },

  getProvider: async (id: string): Promise<AIProviderDto> => {
    const response = await apiClient.agentic.get<AIProviderDto>(`/api/agentic/providers/${id}`)
    return response.data
  },

  createProvider: async (data: CreateAIProviderDto): Promise<AIProviderDto> => {
    const response = await apiClient.agentic.post<AIProviderDto>('/api/agentic/providers', data)
    return response.data
  },

  updateProvider: async (id: string, data: UpdateAIProviderDto): Promise<AIProviderDto> => {
    const response = await apiClient.agentic.put<AIProviderDto>(`/api/agentic/providers/${id}`, data)
    return response.data
  },

  deleteProvider: async (id: string): Promise<void> => {
    await apiClient.agentic.delete(`/api/agentic/providers/${id}`)
  },

  // Models
  getModels: async (): Promise<AIModelDto[]> => {
    const response = await apiClient.agentic.get<AIModelDto[]>('/api/agentic/models')
    return response.data
  },

  getModelsByProvider: async (providerId: string): Promise<AIModelDto[]> => {
    const response = await apiClient.agentic.get<AIModelDto[]>(`/api/agentic/models/by-provider/${providerId}`)
    return response.data
  },

  getModel: async (id: string): Promise<AIModelDto> => {
    const response = await apiClient.agentic.get<AIModelDto>(`/api/agentic/models/${id}`)
    return response.data
  },

  createModel: async (data: CreateAIModelDto): Promise<AIModelDto> => {
    const response = await apiClient.agentic.post<AIModelDto>('/api/agentic/models', data)
    return response.data
  },

  updateModel: async (id: string, data: UpdateAIModelDto): Promise<AIModelDto> => {
    const response = await apiClient.agentic.put<AIModelDto>(`/api/agentic/models/${id}`, data)
    return response.data
  },

  deleteModel: async (id: string): Promise<void> => {
    await apiClient.agentic.delete(`/api/agentic/models/${id}`)
  },

  // Agents
  getAgents: async (): Promise<AgentListDto[]> => {
    const response = await apiClient.agentic.get<AgentListDto[]>('/api/agentic/agents')
    return response.data
  },

  getAgent: async (id: string): Promise<AgentDto> => {
    const response = await apiClient.agentic.get<AgentDto>(`/api/agentic/agents/${id}`)
    return response.data
  },

  createAgent: async (data: CreateAgentDto): Promise<AgentDto> => {
    const response = await apiClient.agentic.post<AgentDto>('/api/agentic/agents', data)
    return response.data
  },

  updateAgent: async (id: string, data: UpdateAgentDto): Promise<AgentDto> => {
    const response = await apiClient.agentic.put<AgentDto>(`/api/agentic/agents/${id}`, data)
    return response.data
  },

  deleteAgent: async (id: string): Promise<void> => {
    await apiClient.agentic.delete(`/api/agentic/agents/${id}`)
  },

  // Sessions
  getSessions: async (): Promise<SessionListItemDto[]> => {
    const response = await apiClient.agentic.get<SessionListItemDto[]>('/api/agentic/sessions')
    return response.data
  },

  getSession: async (id: string): Promise<SessionDetailsResponse> => {
    const response = await apiClient.agentic.get<SessionDetailsResponse>(`/api/agentic/sessions/${id}`)
    return response.data
  },

  createSession: async (data: StartSessionRequest): Promise<StartSessionResponse> => {
    const response = await apiClient.agentic.post<StartSessionResponse>('/api/agentic/sessions', data)
    return response.data
  },

  deleteSession: async (id: string): Promise<void> => {
    await apiClient.agentic.delete(`/api/agentic/sessions/${id}`)
  },

  // Messages
  getSessionMessages: async (id: string): Promise<SessionDetailsResponse> => {
    const response = await apiClient.agentic.get<SessionDetailsResponse>(`/api/agentic/sessions/${id}/messages`)
    return response.data
  },

  sendMessage: async (data: ProcessAgentMessageRequest): Promise<ProcessAgentMessageResponse> => {
    const response = await apiClient.agentic.post<ProcessAgentMessageResponse>('/api/agentic/messages', data)
    return response.data
  },
}

export default agenticApi