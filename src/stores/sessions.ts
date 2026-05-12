import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SessionListItemDto, SessionDetailsResponse, StartSessionRequest, ProcessAgentMessageRequest, ProcessAgentMessageResponse } from '@/types'
import { agenticApi } from '@/api'

export const useSessionsStore = defineStore('sessions', () => {
  const sessions = ref<SessionListItemDto[]>([])
  const currentSession = ref<SessionDetailsResponse | null>(null)
  const loading = ref(false)
  const sendingMessage = ref(false)
  const error = ref<string | null>(null)

  const activeSessions = computed(() => 
    sessions.value.filter((s) => s.status === 1)
  )

  async function fetchSessions() {
    loading.value = true
    error.value = null
    try {
      sessions.value = await agenticApi.getSessions()
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch sessions'
    } finally {
      loading.value = false
    }
  }

  async function fetchSession(id: string) {
    loading.value = true
    error.value = null
    try {
      currentSession.value = await agenticApi.getSession(id)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch session'
    } finally {
      loading.value = false
    }
  }

  async function createSession(data: StartSessionRequest) {
    loading.value = true
    error.value = null
    try {
      const session = await agenticApi.createSession(data)
      sessions.value.unshift({
        sessionId: session.sessionId,
        agentId: session.agentId,
        agentName: session.agentName,
        botType: session.botType,
        title: session.title,
        startedAt: session.startedAt,
        lastMessageAt: session.startedAt,
        status: session.status,
        messageCount: 0,
      })
      return session
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to create session'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteSession(id: string) {
    loading.value = true
    error.value = null
    try {
      await agenticApi.deleteSession(id)
      sessions.value = sessions.value.filter((s) => s.sessionId !== id)
      if (currentSession.value?.sessionId === id) {
        currentSession.value = null
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to delete session'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function sendMessage(data: ProcessAgentMessageRequest): Promise<ProcessAgentMessageResponse> {
    sendingMessage.value = true
    error.value = null
    try {
      const response = await agenticApi.sendMessage(data)
      const targetSessionId = data.sessionId ?? response.sessionId

      if (currentSession.value && currentSession.value.sessionId === targetSessionId) {
        currentSession.value.messages.push({
          id: crypto.randomUUID(),
          role: 'user',
          content: data.message,
          timestamp: new Date().toISOString(),
        })
        currentSession.value.messages.push({
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.content || response.aiResponse,
          timestamp: response.timestamp,
        })
        currentSession.value.lastMessageAt = response.timestamp
      }
      return response
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to send message'
      throw e
    } finally {
      sendingMessage.value = false
    }
  }

  function clearCurrentSession() {
    currentSession.value = null
  }

  return {
    sessions,
    currentSession,
    loading,
    sendingMessage,
    error,
    activeSessions,
    fetchSessions,
    fetchSession,
    createSession,
    deleteSession,
    sendMessage,
    clearCurrentSession,
  }
})