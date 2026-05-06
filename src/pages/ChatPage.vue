<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChat } from '@/composables/useSessions'
import { useAgents } from '@/composables/useAgents'

const route = useRoute()
const router = useRouter()
const { currentSession, sendingMessage, error, sendMessage, loadSession } = useChat()
const { agents, fetchAgents } = useAgents()

const sessionId = computed(() => route.params.id as string | undefined)
const messageInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const messageList = ref<{ id: string; role: string; content: string; timestamp: string }[]>([])

const selectedAgentId = ref<string>('')
const showAgentSelect = ref(false)

onMounted(async () => {
  await fetchAgents()
  if (sessionId.value) {
    await loadSession(sessionId.value)
    if (currentSession.value) {
      messageList.value = [...currentSession.value.messages]
      await scrollToBottom()
    }
  }
})

watch(() => currentSession.value?.messages, (newMessages) => {
  if (newMessages) {
    messageList.value = [...newMessages]
    nextTick(scrollToBottom)
  }
}, { deep: true })

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

async function handleSend() {
  if (!messageInput.value.trim()) return

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
  showAgentSelect.value = true
}

function selectAgent(agentId: string) {
  selectedAgentId.value = agentId
  showAgentSelect.value = false
}
</script>

<template>
  <div class="chat-container d-flex flex-column" style="height: calc(100vh - 100px)">
    <div class="d-flex justify-space-between align-center mb-2">
      <h1 class="text-h4">
        {{ currentSession?.title || currentSession?.agentName || 'New Chat' }}
      </h1>
      <v-btn v-if="!sessionId" color="primary" variant="tonal" @click="startNewChat">
        <v-icon icon="mdi-plus" start />New Chat
      </v-btn>
    </div>

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
            {{ message.content }}
          </div>
          <div class="message-time text-caption text-grey mt-1">
            {{ formatTime(message.timestamp) }}
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
            :disabled="sendingMessage || (!selectedAgentId && !currentSession)"
            @keyup.enter="handleSend"
          >
            <template #append-inner>
              <v-btn
                icon="mdi-send"
                variant="text"
                color="primary"
                :disabled="!messageInput.trim() || sendingMessage"
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

.dark .messages-area {
  background: rgb(30, 30, 30);
}

.dark .message-assistant .message-content {
  background: #424242;
  color: white;
}
</style>