import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

function mockSpeechApis() {
  class MockSpeechSynthesisUtterance {
    text = ''
    onstart: (() => void) | null = null
    onend: (() => void) | null = null
    onerror: (() => void) | null = null

    constructor(text: string) {
      this.text = text
    }
  }

  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: () => [],
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
  })

  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    configurable: true,
    value: MockSpeechSynthesisUtterance,
  })
}

function createSessionDetails(sessionId: string) {
  return {
    sessionId,
    agentId: 'agent-1',
    agentName: 'Support Agent',
    botType: 1,
    userId: 'user-1',
    title: 'Existing Session',
    startedAt: '2026-05-12T12:00:00Z',
    lastMessageAt: '2026-05-12T12:01:00Z',
    status: 1,
    messages: [
      {
        id: 'message-1',
        role: 'assistant',
        content: `Message for ${sessionId}`,
        timestamp: '2026-05-12T12:01:00Z',
      },
    ],
  }
}

describe('ChatPage', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mockSpeechApis()
    sessionStorage.clear()
  })

  it('clears the active session when navigating to the new chat route', async () => {
    const currentSession = ref(createSessionDetails('session-1'))
    const sendingMessage = ref(false)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const sendMessage = vi.fn()
    const loadSession = vi.fn(async (sessionId: string) => {
      currentSession.value = createSessionDetails(sessionId)
    })
    const createSession = vi.fn()
    const clearSession = vi.fn(() => {
      currentSession.value = null
    })
    const agents = ref([
      {
        id: 'agent-1',
        name: 'Support Agent',
        description: 'General support',
      },
    ])
    const fetchAgents = vi.fn()

    vi.doMock('@/composables/useSessions', () => ({
      useChat: () => ({
        currentSession,
        sendingMessage,
        loading,
        error,
        sendMessage,
        loadSession,
        createSession,
        clearSession,
      }),
    }))

    vi.doMock('@/composables/useAgents', () => ({
      useAgents: () => ({
        agents,
        fetchAgents,
      }),
    }))

    const ChatPage = (await import('../pages/ChatPage.vue')).default
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/sessions/new', component: ChatPage },
        { path: '/sessions/:id', component: ChatPage },
      ],
    })

    await router.push('/sessions/session-1')
    await router.isReady()

    const wrapper = mount(ChatPage, {
      global: {
        plugins: [router],
        renderStubDefaultSlot: true,
        stubs: {
          'v-btn': true,
          'v-icon': true,
          'v-card': true,
          'v-card-title': true,
          'v-card-text': true,
          'v-avatar': true,
          'v-divider': true,
          'v-text-field': true,
          'v-progress-circular': true,
          'v-dialog': true,
          'v-list': true,
          'v-list-item': true,
          'v-list-item-title': true,
          'v-list-item-subtitle': true,
          'v-snackbar': true,
          'v-switch': true,
          MessageSpeechControls: {
            template: '<button data-test="speech-control">Listen</button>',
          },
        },
      },
    })

    await flushPromises()

    expect(loadSession).toHaveBeenCalledWith('session-1')
    expect(wrapper.text()).toContain('Message for session-1')

    await router.push('/sessions/new')
    await flushPromises()

    expect(clearSession).toHaveBeenCalled()
    expect(wrapper.text()).not.toContain('Message for session-1')
    expect(wrapper.text()).toContain('Start a conversation')
  })

  it('renders assistant markdown code fences in the message list', async () => {
    const currentSession = ref({
      ...createSessionDetails('session-2'),
      messages: [
        {
          id: 'message-md',
          role: 'assistant',
          content: '```js\nconst answer = 42\n```',
          timestamp: '2026-05-12T12:02:00Z',
        },
      ],
    })
    const sendingMessage = ref(false)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const sendMessage = vi.fn()
    const loadSession = vi.fn()
    const createSession = vi.fn()
    const clearSession = vi.fn()
    const agents = ref([{ id: 'agent-1', name: 'Support Agent', description: 'General support' }])
    const fetchAgents = vi.fn()

    vi.doMock('@/composables/useSessions', () => ({
      useChat: () => ({
        currentSession,
        sendingMessage,
        loading,
        error,
        sendMessage,
        loadSession,
        createSession,
        clearSession,
      }),
    }))

    vi.doMock('@/composables/useAgents', () => ({
      useAgents: () => ({
        agents,
        fetchAgents,
      }),
    }))

    const ChatPage = (await import('../pages/ChatPage.vue')).default
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/sessions/:id', component: ChatPage }],
    })

    await router.push('/sessions/session-2')
    await router.isReady()

    const wrapper = mount(ChatPage, {
      global: {
        plugins: [router],
        renderStubDefaultSlot: true,
        stubs: {
          'v-btn': true,
          'v-icon': true,
          'v-card': true,
          'v-card-title': true,
          'v-card-text': true,
          'v-avatar': true,
          'v-divider': true,
          'v-text-field': true,
          'v-progress-circular': true,
          'v-dialog': true,
          'v-list': true,
          'v-list-item': true,
          'v-list-item-title': true,
          'v-list-item-subtitle': true,
          'v-snackbar': true,
          'v-switch': true,
          MessageSpeechControls: {
            template: '<button data-test="speech-control">Listen</button>',
          },
        },
      },
    })

    await flushPromises()

    expect(wrapper.html()).toContain('<pre>')
    expect(wrapper.html()).toContain('<code>')
    expect(wrapper.text()).toContain('const answer = 42')
  })

  it('shows auto-read toggle and assistant speech controls', async () => {
    const currentSession = ref(createSessionDetails('session-3'))
    const sendingMessage = ref(false)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const sendMessage = vi.fn()
    const loadSession = vi.fn()
    const createSession = vi.fn()
    const clearSession = vi.fn()
    const agents = ref([{ id: 'agent-1', name: 'Support Agent', description: 'General support' }])
    const fetchAgents = vi.fn()

    vi.doMock('@/composables/useSessions', () => ({
      useChat: () => ({
        currentSession,
        sendingMessage,
        loading,
        error,
        sendMessage,
        loadSession,
        createSession,
        clearSession,
      }),
    }))

    vi.doMock('@/composables/useAgents', () => ({
      useAgents: () => ({
        agents,
        fetchAgents,
      }),
    }))

    const ChatPage = (await import('../pages/ChatPage.vue')).default
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/sessions/:id', component: ChatPage }],
    })

    await router.push('/sessions/session-3')
    await router.isReady()

    const wrapper = mount(ChatPage, {
      global: {
        plugins: [router],
        renderStubDefaultSlot: true,
        stubs: {
          'v-btn': true,
          'v-icon': true,
          'v-card': true,
          'v-card-title': true,
          'v-card-text': true,
          'v-avatar': true,
          'v-divider': true,
          'v-text-field': true,
          'v-progress-circular': true,
          'v-dialog': true,
          'v-list': true,
          'v-list-item': true,
          'v-list-item-title': true,
          'v-list-item-subtitle': true,
          'v-snackbar': true,
          'v-switch': true,
          MessageSpeechControls: {
            template: '<button data-test="speech-control">Listen</button>',
          },
        },
      },
    })

    await flushPromises()

    expect(wrapper.find('v-switch-stub').exists()).toBe(true)
    expect(wrapper.find('[data-test="speech-control"]').exists()).toBe(true)
  })
})
