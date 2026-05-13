<script setup lang="ts">
import { ref, computed, provide, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChat } from '@/composables/useSessions'
import { useAgents } from '@/composables/useAgents'
import { useSpeechRecognition } from '@/composables/useSpeechRecognition'
import { useSpeechSynthesis } from '@/composables/useSpeechSynthesis'
import { speechSynthesisKey } from '@/composables/speechKeys'
import ChatMessageContent from '@/components/ChatMessageContent.vue'
import MessageSpeechControls from '@/components/MessageSpeechControls.vue'
import { markdownToPlainText } from '@/utils/markdownToPlainText'

const AUTO_READ_STORAGE_KEY = 'chat:autoReadResponses'

const route = useRoute()
const router = useRouter()
const { currentSession, sendingMessage, loading: sessionLoading, error: chatError, sendMessage, loadSession, createSession, clearSession } = useChat()
const { agents, fetchAgents } = useAgents()

const speech = useSpeechSynthesis()
provide(speechSynthesisKey, speech)

const sttError = ref('')
const ttsError = ref('')
const speechStatus = ref('')
const error = computed(() => chatError.value || sttError.value || ttsError.value)

const sessionId = computed(() => route.params.id as string | undefined)
const messageInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const messageList = ref<{ id: string; role: string; content: string; timestamp: string }[]>([])

const selectedAgentId = ref<string>('')
const showAgentSelect = ref(false)
const autoReadResponses = ref(false)
const lastAutoReadMessageId = ref<string | null>(null)
const skipAutoReadForLoadedHistory = ref(true)
const knownMessageIds = ref<Set<string>>(new Set())

const {
  isSupported: isSpeechSupported,
  isListening,
  error: recognitionError,
  toggle: toggleSpeechToText,
  stop: stopSpeechRecognition,
} = useSpeechRecognition((transcript) => {
  messageInput.value = (messageInput.value + ' ' + transcript).trim()
})

watch(recognitionError, (value) => {
  sttError.value = value ?? ''
})

watch(() => speech.error.value, (value) => {
  if (value) {
    ttsError.value = value
  }
})

watch(() => speech.speakingMessageId.value, (messageId) => {
  speechStatus.value = messageId ? 'Reading assistant message aloud.' : ''
})

onMounted(async () => {
  autoReadResponses.value = sessionStorage.getItem(AUTO_READ_STORAGE_KEY) === 'true'
  await fetchAgents()
})

watch(autoReadResponses, (enabled) => {
  sessionStorage.setItem(AUTO_READ_STORAGE_KEY, String(enabled))
})

watch(() => currentSession.value?.messages, (newMessages) => {
  if (newMessages) {
    messageList.value = [...newMessages]
    nextTick(scrollToBottom)
  } else {
    messageList.value = []
  }
}, { deep: true })

watch(messageList, async (messages) => {
  if (skipAutoReadForLoadedHistory.value) {
    knownMessageIds.value = new Set(messages.map((message) => message.id))
    return
  }

  if (!autoReadResponses.value) {
    knownMessageIds.value = new Set(messages.map((message) => message.id))
    return
  }

  const newAssistantMessages = messages.filter(
    (message) =>
      message.role === 'assistant'
      && !knownMessageIds.value.has(message.id)
      && message.id !== lastAutoReadMessageId.value
  )

  knownMessageIds.value = new Set(messages.map((message) => message.id))

  const latestAssistantMessage = newAssistantMessages.at(-1)
  if (!latestAssistantMessage) {
    return
  }

  await speakAssistantMessage(latestAssistantMessage.id, latestAssistantMessage.content, true)
}, { deep: true })

watch(sessionId, async (newSessionId) => {
  await syncRouteSession(newSessionId)
}, { immediate: true })

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

async function syncRouteSession(newSessionId?: string) {
  messageInput.value = ''
  sttError.value = ''
  ttsError.value = ''
  speech.stop()
  stopSpeechRecognition()
  clearSession()
  selectedAgentId.value = ''
  messageList.value = []
  lastAutoReadMessageId.value = null
  skipAutoReadForLoadedHistory.value = true
  knownMessageIds.value = new Set()

  if (!newSessionId) {
    showAgentSelect.value = true
    return
  }

  showAgentSelect.value = false
  await loadSession(newSessionId)

  if (currentSession.value) {
    selectedAgentId.value = currentSession.value.agentId
    messageList.value = [...currentSession.value.messages]
    knownMessageIds.value = new Set(messageList.value.map((message) => message.id))
    await nextTick()
    scrollToBottom()
    skipAutoReadForLoadedHistory.value = false
  }
}

async function speakAssistantMessage(messageId: string, content: string, isAutoRead = false) {
  stopSpeechRecognition()
  speech.stop()
  ttsError.value = ''

  const speakableText = markdownToPlainText(content)
  if (!speakableText) {
    if (!isAutoRead) {
      ttsError.value = 'There is no readable text in this message.'
    }
    return
  }

  const started = await speech.speak(messageId, speakableText)
  if (started) {
    lastAutoReadMessageId.value = messageId
  }
}

function handleBeforeSpeak() {
  stopSpeechRecognition()
  speech.stop()
  ttsError.value = ''
}

function handleSpeakError(message: string) {
  ttsError.value = message
}

async function handleSend() {
  if (!messageInput.value.trim()) return

  speech.stop()
  stopSpeechRecognition()

  const userMessage = messageInput.value
  messageInput.value = ''

  messageList.value.push({
    id: crypto.randomUUID(),
    role: 'user',
    content: userMessage,
    timestamp: new Date().toISOString(),
  })
  await nextTick(scrollToBottom)

  if (sessionId.value && selectedAgentId.value) {
    await sendMessage(selectedAgentId.value, userMessage, sessionId.value)
  } else if (selectedAgentId.value) {
    await sendMessage(selectedAgentId.value, userMessage)
    if (currentSession.value) {
      router.replace(`/sessions/${currentSession.value.sessionId}`)
    }
  }
}

function startNewChat() {
  speech.stop()
  stopSpeechRecognition()
  selectedAgentId.value = ''
  messageInput.value = ''
  messageList.value = []
  showAgentSelect.value = true
}

async function selectAgent(agentId: string) {
  selectedAgentId.value = agentId
  showAgentSelect.value = false
  sttError.value = ''

  if (sessionId.value) return

  try {
    const createdSession = await createSession(agentId)
    await router.replace(`/sessions/${createdSession.sessionId}`)
    await loadSession(createdSession.sessionId)
    if (currentSession.value) {
      selectedAgentId.value = currentSession.value.agentId
      messageList.value = [...currentSession.value.messages]
      knownMessageIds.value = new Set(messageList.value.map((message) => message.id))
      skipAutoReadForLoadedHistory.value = false
    }
  } catch {
    // Error is surfaced via store/computed error snackbar
  }
}

function handleToggleSpeechToText() {
  if (isListening.value) {
    stopSpeechRecognition()
    return
  }

  speech.stop()
  toggleSpeechToText()
}
</script>

<template>
  <div class="chat-container d-flex flex-column" style="height: calc(100vh - 100px)">
    <div class="d-flex justify-space-between align-center mb-2 flex-wrap ga-2">
      <h1 class="text-h4">
        {{ currentSession?.title || currentSession?.agentName || 'New Chat' }}
      </h1>
      <div class="d-flex align-center ga-3">
        <v-switch
          v-if="speech.isSupported.value"
          v-model="autoReadResponses"
          label="Auto-read responses"
          density="compact"
          hide-details
          inset
        />
        <v-btn v-if="!sessionId" color="primary" variant="tonal" @click="startNewChat">
          <v-icon icon="mdi-plus" start />New Chat
        </v-btn>
      </div>
    </div>

    <span class="sr-only" aria-live="polite">{{ speechStatus }}</span>

    <v-card class="flex-grow-1 d-flex flex-column">
      <v-card-title v-if="selectedAgentId || currentSession" class="d-flex align-center py-2">
        <v-avatar size="32" color="primary" class="mr-2">
          <v-icon icon="mdi-robot" size="18" />
        </v-avatar>
        {{ currentSession?.agentName || agents.find(a => a.id === selectedAgentId)?.name }}
      </v-card-title>

      <div ref="messagesContainer" class="messages-area flex-grow-1 overflow-y-auto pa-4">
        <div v-if="messageList.length === 0" class="text-center text-grey py-8">
          <v-icon icon="mdi-message-text" size="64" class="mb-4" />
          <p>Start a conversation</p>
        </div>

        <div
          v-for="message in messageList"
          :key="message.id"
          class="message-bubble mb-4"
          :class="{ 'message-user': message.role === 'user', 'message-assistant': message.role === 'assistant' }"
        >
          <div class="message-content pa-3 rounded-lg">
            <ChatMessageContent :content="message.content" :role="message.role" />
          </div>
          <div class="message-meta d-flex align-center ga-1 mt-1">
            <div class="message-time text-caption text-grey">
              {{ formatTime(message.timestamp) }}
            </div>
            <MessageSpeechControls
              :message-id="message.id"
              :content="message.content"
              :role="message.role"
              @before-speak="handleBeforeSpeak"
              @speak-error="handleSpeakError"
            />
          </div>
        </div>

        <div v-if="sendingMessage" class="message-bubble message-assistant">
          <div class="message-content pa-3 rounded-lg">
            <v-progress-circular indeterminate size="16" width="2" />
          </div>
        </div>
      </div>

      <v-divider />

      <v-card-text class="pa-2">
        <div class="d-flex align-center">
          <v-text-field
            v-model="messageInput"
            placeholder="Type a message..."
            variant="solo-filled"
            density="compact"
            hide-details
            :disabled="sendingMessage || sessionLoading || (!selectedAgentId && !currentSession)"
            @keyup.enter="handleSend"
          >
            <template #append-inner>
              <v-btn
                v-if="isSpeechSupported"
                :icon="isListening ? 'mdi-microphone' : 'mdi-microphone-outline'"
                variant="text"
                :color="isListening ? 'error' : 'primary'"
                :disabled="sendingMessage || sessionLoading || (!selectedAgentId && !currentSession)"
                class="mr-1"
                :aria-label="isListening ? 'Stop voice input' : 'Start voice input'"
                :aria-pressed="isListening"
                @click="handleToggleSpeechToText"
              />
              <v-btn
                icon="mdi-send"
                variant="text"
                color="primary"
                :disabled="!messageInput.trim() || sendingMessage || sessionLoading"
                aria-label="Send message"
                @click="handleSend"
              />
            </template>
          </v-text-field>
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="showAgentSelect" max-width="400">
      <v-card>
        <v-card-title>Select an Agent</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="agent in agents"
              :key="agent.id"
              @click="selectAgent(agent.id)"
            >
              <v-list-item-title>{{ agent.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ agent.description }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-snackbar :model-value="!!error" color="error">
      {{ error }}
    </v-snackbar>
  </div>
</template>

<style scoped>
.messages-area {
  background: rgb(248, 248, 248);
}

.message-bubble {
  max-width: 70%;
}

.message-user {
  margin-left: auto;
}

.message-user .message-content {
  background: #1976D2;
  color: white;
}

.message-assistant {
  margin-right: auto;
}

.message-assistant .message-content {
  background: #e0e0e0;
  color: black;
}

.message-meta {
  min-height: 28px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.dark .messages-area {
  background: rgb(30, 30, 30);
}

.dark .message-assistant .message-content {
  background: #424242;
  color: white;
}
</style>
