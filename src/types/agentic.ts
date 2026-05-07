// Agent Types
export interface AgentListDto {
  id: string
  name: string
  description: string
  modelName: string
  botType: BotType
  isActive: boolean
  enableMemory: boolean
  enableRAG: boolean
}

export interface AgentDto {
  id: string
  name: string
  description: string
  providerId: string
  providerName: string
  modelId: string
  modelName: string
  botType: BotType
  systemPrompt: string
  temperature: number
  topK: number
  maxTokens: number
  embeddingDimensions: number
  enableMemory: boolean
  enableRAG: boolean
  embeddingModelName: string | null
  isActive: boolean
  tenantId: string | null
}

export interface CreateAgentDto {
  name: string
  description: string
  providerId: string
  modelId: string
  temperature: number
  systemPrompt: string
  tenantId?: string
  botType?: BotType
  topK?: number
  maxTokens?: number
  embeddingDimensions?: number
  enableMemory?: boolean
  enableRAG?: boolean
  embeddingModelName?: string
}

export interface UpdateAgentDto {
  name: string
  description: string
  providerId: string
  modelId: string
  temperature: number
  systemPrompt: string
  botType?: BotType | null
  topK?: number | null
  maxTokens?: number | null
  embeddingDimensions?: number | null
  enableMemory?: boolean | null
  enableRAG?: boolean | null
  embeddingModelName?: string | null
}

export type BotType = number

// Provider and Model Types
export interface AIProviderDto {
  id: string
  name: string
  baseUrl: string
  secretKeyName: string
}

export interface CreateAIProviderDto {
  name: string
  baseUrl: string
  secretKeyName: string
}

export interface UpdateAIProviderDto {
  name: string
  baseUrl: string
  secretKeyName: string
}

export interface AIModelDto {
  id: string
  providerId: string
  providerName: string
  commercialName: string
  technicalName: string
  tokenLimit: number
  capabilities: string
  defaultTemperature: number
  defaultTopK: number
  defaultMaxTokens: number
  defaultEmbeddingDimensions: number
  defaultEnableMemory: boolean
  defaultEnableRAG: boolean
  defaultEmbeddingModelName: string | null
  defaultBotType: BotType
  defaultSystemPrompt: string | null
}

export interface CreateAIModelDto {
  providerId: string
  commercialName: string
  technicalName: string
  tokenLimit: number
  capabilities: string
  defaultTemperature?: number
  defaultTopK?: number
  defaultMaxTokens?: number
  defaultEmbeddingDimensions?: number
  defaultEnableMemory?: boolean
  defaultEnableRAG?: boolean
  defaultEmbeddingModelName?: string | null
  defaultBotType?: BotType
  defaultSystemPrompt?: string | null
}

export interface UpdateAIModelDto {
  providerId: string
  commercialName: string
  technicalName: string
  tokenLimit: number
  capabilities: string
  defaultTemperature?: number
  defaultTopK?: number
  defaultMaxTokens?: number
  defaultEmbeddingDimensions?: number
  defaultEnableMemory?: boolean
  defaultEnableRAG?: boolean
  defaultEmbeddingModelName?: string | null
  defaultBotType?: BotType
  defaultSystemPrompt?: string | null
}

// Session Types
export interface SessionListItemDto {
  sessionId: string
  agentId: string
  agentName: string
  botType: BotType
  title: string | null
  startedAt: string
  lastMessageAt: string
  status: SessionStatus
  messageCount: number
}

export interface SessionDetailsResponse {
  sessionId: string
  agentId: string
  agentName: string
  botType: BotType
  userId: string
  title: string | null
  startedAt: string
  lastMessageAt: string
  status: SessionStatus
  messages: SessionMessageDto[]
}

export interface SessionMessageDto {
  id: string
  role: string
  content: string
  timestamp: string
}

export type SessionStatus = number

export interface StartSessionRequest {
  agentId?: string
  title?: string
}

export interface StartSessionResponse {
  sessionId: string
  agentId: string
  agentName: string
  botType: BotType
  userId: string
  title: string | null
  startedAt: string
  status: SessionStatus
}

// Message Types
export interface ProcessAgentMessageRequest {
  agentId: string
  message: string
  options?: AgentExecutionOptions | null
  sessionId?: string
}

export interface ProcessAgentMessageResponse {
  sessionId: string
  userId: string
  userMessage: string
  aiResponse: string
  timestamp: string
}

export interface AgentExecutionOptions {
  temperature?: number | null
  topK?: number | null
  maxTokens?: number | null
  enableMemory?: boolean | null
  enableRAG?: boolean | null
}

export interface SendMessageRequest {
  message: string
  options?: ProcessMessageOptions | null
}

export interface SendMessageResponse {
  messageId: string
  content: string
  timestamp: string
  toolCalls?: ToolCallResult[] | null
  sessionId: string
}

export interface ProcessMessageOptions {
  temperature?: number | null
  maxTokens?: number | null
  topK?: number | null
  enableMemory?: boolean | null
  enableRAG?: boolean | null
}

export interface ToolCallResult {
  toolName: string
  arguments: string
  result: string
  success: boolean
}

// Common Types
export interface ProblemDetails {
  type?: string | null
  title?: string | null
  status?: number | null
  detail?: string | null
  instance?: string | null
}