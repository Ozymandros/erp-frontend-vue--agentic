import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuth, useAuthGuard } from '../composables/useAuth'
import { useAgents } from '../composables/useAgents'
import { useSessions, useChat } from '../composables/useSessions'
import { useFormValidation } from '../composables/useFormValidation'
import { useAuthStore } from '../stores/auth'
import { useSessionsStore } from '../stores/sessions'
import { loginSchema } from '../schemas/auth'
import { createAgentSchema } from '../schemas/agent'
import * as authApi from '../api/auth'
import * as agenticApi from '../api/agentic'

// Mock the API modules and router
// @formatter:off
// eslint-disable eslint-plugin-vitest/require-mock-type-parameters
vi.mock('../api/auth', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}))

vi.mock('../api/agentic', () => ({
  agenticApi: {
    getAgents: vi.fn(),
    getAgent: vi.fn(),
    createAgent: vi.fn(),
    updateAgent: vi.fn(),
    deleteAgent: vi.fn(),
    getSessions: vi.fn(),
    getSession: vi.fn(),
    createSession: vi.fn(),
    deleteSession: vi.fn(),
    sendMessage: vi.fn(),
  },
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))
// eslint-enable eslint-plugin-vitest/require-mock-type-parameters
// @formatter:on

describe('composables', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('useAuth', () => {
    it('returns reactive state from store', () => {
      const { isAuthenticated, user, loading, error } = useAuth()
      expect(isAuthenticated.value).toBe(false)
      expect(user.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('calls login and navigates on success', async () => {
      const mockUser = { id: '1', username: 'test', email: 'test@test.com', firstName: null, lastName: null, createdAt: '', createdBy: '' }
      vi.mocked(authApi.authApi.login).mockResolvedValue({
        accessToken: 'token',
        refreshToken: 'refresh',
        user: mockUser,
      })

      const { login } = useAuth()
      await login('test@test.com', 'password')

      expect(authApi.authApi.login).toHaveBeenCalled()
    })

    it('calls register and navigates on success', async () => {
      const mockUser = { id: '1', username: 'newuser', email: 'new@test.com', firstName: null, lastName: null, createdAt: '', createdBy: '' }
      vi.mocked(authApi.authApi.register).mockResolvedValue({
        accessToken: 'token',
        refreshToken: 'refresh',
        user: mockUser,
      })

      const { register } = useAuth()
      const data = {
        email: 'new@test.com',
        username: 'newuser',
        password: 'password123',
        passwordConfirm: 'password123',
      }
      await register(data)

      expect(authApi.authApi.register).toHaveBeenCalledWith(data)
    })

    it('logout clears auth and navigates', () => {
      const { logout } = useAuth()
      logout()
      expect(localStorage.getItem('accessToken')).toBeNull()
    })
  })

  describe('useAuthGuard', () => {
    it('requiresAuth returns false when not authenticated', () => {
      const { requiresAuth } = useAuthGuard()
      const result = requiresAuth()
      expect(result).toBe(false)
    })

    it('requiresAuth returns true when authenticated', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const authStore = useAuthStore()
      authStore.accessToken = 'test-token'
      
      // Create a fresh guard with the updated store state
      const { requiresAuth } = useAuthGuard()
      expect(requiresAuth()).toBe(true)
    })

    it('guestOnly returns false when authenticated', () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const authStore = useAuthStore()
      authStore.accessToken = 'test-token'
      
      const { guestOnly } = useAuthGuard()
      expect(guestOnly()).toBe(false)
    })

    it('guestOnly returns true when not authenticated', () => {
      const { guestOnly } = useAuthGuard()
      expect(guestOnly()).toBe(true)
    })
  })

  describe('useAgents', () => {
    it('returns reactive agents state', () => {
      const { agents, currentAgent, loading, error } = useAgents()
      expect(agents.value).toEqual([])
      expect(currentAgent.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('fetches agents list', async () => {
      const mockAgents = [
        { id: '1', name: 'Agent 1', modelName: 'gpt-4', botType: 1, isActive: true, enableMemory: true, enableRAG: true },
      ]
      vi.mocked(agenticApi.agenticApi.getAgents).mockResolvedValue(mockAgents)

      const { fetchAgents } = useAgents()
      await fetchAgents()

      expect(agenticApi.agenticApi.getAgents).toHaveBeenCalled()
    })

    it('fetches single agent', async () => {
      const mockAgent = {
        id: '1',
        name: 'Agent',
        description: 'desc',
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        modelName: 'gpt-4',
        temperature: 0.7,
        systemPrompt: 'prompt',
        botType: 1,
        isActive: true,
        enableMemory: true,
        enableRAG: true,
        createdAt: '2024-01-01',
        createdBy: 'system',
      }
      vi.mocked(agenticApi.agenticApi.getAgent).mockResolvedValue(mockAgent)

      const { fetchAgent } = useAgents()
      await fetchAgent('1')

      expect(agenticApi.agenticApi.getAgent).toHaveBeenCalledWith('1')
    })

    it('creates agent', async () => {
      const mockAgent = {
        id: '1',
        name: 'New Agent',
        description: 'desc',
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        modelName: 'gpt-4',
        temperature: 0.7,
        systemPrompt: 'prompt',
        botType: 1,
        isActive: true,
        enableMemory: true,
        enableRAG: true,
        createdAt: '2024-01-01',
        createdBy: 'system',
      }
      vi.mocked(agenticApi.agenticApi.createAgent).mockResolvedValue(mockAgent)

      const { createAgent } = useAgents()
      const result = await createAgent({
        name: 'New Agent',
        description: 'desc',
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        temperature: 0.7,
        systemPrompt: 'prompt',
      })

      expect(result).toEqual(mockAgent)
    })

    it('updates agent', async () => {
      const mockAgent = {
        id: '1',
        name: 'Updated',
        description: 'desc',
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        modelName: 'gpt-4',
        temperature: 0.7,
        systemPrompt: 'prompt',
        botType: 1,
        isActive: true,
        enableMemory: true,
        enableRAG: true,
        createdAt: '2024-01-01',
        createdBy: 'system',
      }
      vi.mocked(agenticApi.agenticApi.updateAgent).mockResolvedValue(mockAgent)

      const { updateAgent } = useAgents()
      const result = await updateAgent('1', { name: 'Updated' })

      expect(agenticApi.agenticApi.updateAgent).toHaveBeenCalledWith('1', { name: 'Updated' })
      expect(result).toEqual(mockAgent)
    })

    it('deletes agent', async () => {
      vi.mocked(agenticApi.agenticApi.deleteAgent).mockResolvedValue(undefined)

      const { deleteAgent } = useAgents()
      await deleteAgent('1')

      expect(agenticApi.agenticApi.deleteAgent).toHaveBeenCalledWith('1')
    })
  })

  describe('useSessions', () => {
    it('returns reactive sessions state', () => {
      const { sessions, currentSession, loading, error } = useSessions()
      expect(sessions.value).toEqual([])
      expect(currentSession.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('fetches sessions', async () => {
      const mockSessions = [
        { sessionId: '1', agentId: 'a1', agentName: 'Agent', botType: 1, title: 'Session', startedAt: '2024-01-01', lastMessageAt: '2024-01-01', status: 1, messageCount: 0 },
      ]
      vi.mocked(agenticApi.agenticApi.getSessions).mockResolvedValue(mockSessions)

      const { fetchSessions } = useSessions()
      await fetchSessions()

      expect(agenticApi.agenticApi.getSessions).toHaveBeenCalled()
    })

    it('fetches single session', async () => {
      const mockSession = {
        sessionId: '1',
        agentId: 'a1',
        agentName: 'Agent',
        title: 'Session',
        startedAt: '2024-01-01',
        status: 1,
        messages: [],
        lastMessageAt: '2024-01-01',
      }
      vi.mocked(agenticApi.agenticApi.getSession).mockResolvedValue(mockSession)

      const { fetchSession } = useSessions()
      await fetchSession('1')

      expect(agenticApi.agenticApi.getSession).toHaveBeenCalledWith('1')
    })

    it('creates session', async () => {
      const mockSession = {
        sessionId: 's1',
        agentId: 'a1',
        agentName: 'Agent',
        botType: 1,
        title: 'New Session',
        startedAt: '2024-01-01',
        status: 1,
        messages: [],
        lastMessageAt: '2024-01-01',
      }
      vi.mocked(agenticApi.agenticApi.createSession).mockResolvedValue(mockSession)

      const { createSession } = useSessions()
      const result = await createSession({ agentId: 'a1' })

      expect(result).toEqual(mockSession)
    })

    it('deletes session', async () => {
      vi.mocked(agenticApi.agenticApi.deleteSession).mockResolvedValue(undefined)

      const { deleteSession } = useSessions()
      await deleteSession('1')

      expect(agenticApi.agenticApi.deleteSession).toHaveBeenCalledWith('1')
    })
  })

  describe('useChat', () => {
    it('returns chat state', () => {
      const { currentSession, sendingMessage, error } = useChat()
      expect(currentSession.value).toBeNull()
      expect(sendingMessage.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('sends message via store', async () => {
      const mockResponse = {
        aiResponse: 'Hello!',
        timestamp: '2024-01-01T10:00:00Z',
      }
      vi.mocked(agenticApi.agenticApi.sendMessage).mockResolvedValue(mockResponse)

      const { sendMessage } = useChat()
      const result = await sendMessage('a1', 'Hi')

      expect(agenticApi.agenticApi.sendMessage).toHaveBeenCalled()
      expect(result).toEqual(mockResponse)
    })

    it('loads session', async () => {
      const mockSession = {
        sessionId: '1',
        agentId: 'a1',
        agentName: 'Agent',
        title: 'Session',
        startedAt: '2024-01-01',
        status: 1,
        messages: [],
        lastMessageAt: '2024-01-01',
      }
      vi.mocked(agenticApi.agenticApi.getSession).mockResolvedValue(mockSession)

      const { loadSession } = useChat()
      await loadSession('1')

      expect(agenticApi.agenticApi.getSession).toHaveBeenCalledWith('1')
    })

    it('clears session', () => {
      const sessionsStore = useSessionsStore()
      sessionsStore.currentSession = {
        sessionId: '1',
        agentId: 'a1',
        agentName: 'Agent',
        title: 'Session',
        startedAt: '2024-01-01',
        status: 1,
        messages: [],
        lastMessageAt: '2024-01-01',
      }

      const { clearSession } = useChat()
      clearSession()

      expect(sessionsStore.currentSession).toBeNull()
    })
  })

  describe('useFormValidation', () => {
    it('validates form with schema', () => {
      const validation = useFormValidation(loginSchema)
      validation.setField('email', 'test@test.com')
      validation.setField('password', 'password')
      expect(validation.isValid.value).toBe(true)
      expect(Object.keys(validation.errors.value)).toHaveLength(0)
    })

    it('returns validation errors', () => {
      const validation = useFormValidation(loginSchema)
      validation.setField('email', 'invalid')
      validation.setField('password', '')
      expect(validation.errors.value).toBeDefined()
      expect(Object.keys(validation.errors.value).length).toBeGreaterThan(0)
    })

    it('resets form validation', () => {
      const { formData, reset, setField } = useFormValidation(loginSchema)
      setField('email', 'test@test.com')
      reset()
      expect(formData.value).toEqual({})
    })

    it('touches fields', () => {
      const { touched, touch } = useFormValidation(loginSchema)
      touch('email')
      expect(touched.value.email).toBe(true)
    })

    it('works with agent schema', () => {
      const validation = useFormValidation(createAgentSchema)
      validation.setField('name', 'Agent')
      validation.setField('description', 'desc')
      validation.setField('modelId', '550e8400-e29b-41d4-a716-446655440000')
      validation.setField('temperature', 0.7)
      validation.setField('systemPrompt', 'prompt')
      expect(validation.isValid.value).toBe(true)
    })

    it('handles validation with coercion', () => {
      const { isValid, setField } = useFormValidation(createAgentSchema)
      setField('name', 'Agent')
      setField('description', 'desc')
      setField('modelId', '550e8400-e29b-41d4-a716-446655440000')
      setField('temperature', '0.7') // String that should coerce to number
      setField('systemPrompt', 'prompt')
      expect(isValid.value).toBe(true)
    })

    it('validates form method', () => {
      const { validate, setField } = useFormValidation(loginSchema)
      setField('email', 'test@test.com')
      setField('password', 'password')
      expect(validate()).toBe(true)
    })

    it('validates invalid form', () => {
      const { validate, setField } = useFormValidation(loginSchema)
      setField('email', 'invalid')
      setField('password', '')
      expect(validate()).toBe(false)
    })
  })
})