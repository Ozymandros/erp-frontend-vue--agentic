import { computed } from 'vue'
import { useSessionsStore } from '@/stores/sessions'

export function useSessions() {
  const sessionsStore = useSessionsStore()

  const sessions = computed(() => sessionsStore.sessions)
  const currentSession = computed(() => sessionsStore.currentSession)
  const loading = computed(() => sessionsStore.loading)
  const sendingMessage = computed(() => sessionsStore.sendingMessage)
  const error = computed(() => sessionsStore.error)
  const activeSessions = computed(() => sessionsStore.activeSessions)

  async function fetchSessions() {
    await sessionsStore.fetchSessions()
  }

  async function fetchSession(id: string) {
    await sessionsStore.fetchSession(id)
  }

  async function createSession(data: Parameters<typeof sessionsStore.createSession>[0]) {
    return await sessionsStore.createSession(data)
  }

  async function deleteSession(id: string) {
    await sessionsStore.deleteSession(id)
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
  }
}

export function useChat() {
  const sessionsStore = useSessionsStore()

  const currentSession = computed(() => sessionsStore.currentSession)
  const sendingMessage = computed(() => sessionsStore.sendingMessage)
  const error = computed(() => sessionsStore.error)

  async function sendMessage(agentId: string, message: string, sessionId?: string) {
    return await sessionsStore.sendMessage({ agentId, message, sessionId })
  }

  async function loadSession(id: string) {
    await sessionsStore.fetchSession(id)
  }

  function clearSession() {
    sessionsStore.clearCurrentSession()
  }

  return {
    currentSession,
    sendingMessage,
    error,
    sendMessage,
    loadSession,
    clearSession,
  }
}