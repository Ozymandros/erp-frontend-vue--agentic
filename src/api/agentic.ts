import { apiClient } from '@/utils/apiClient'
import type {
  AgentListDto,
  AgentDto,
  CreateAgentDto,
  UpdateAgentDto,
  SessionListItemDto,
  SessionDetailsResponse,
  StartSessionRequest,
  StartSessionResponse,
  ProcessAgentMessageRequest,
  ProcessAgentMessageResponse,
} from '@/types'

export const agenticApi = {
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