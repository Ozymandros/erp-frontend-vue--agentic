<script setup lang="ts">
import { computed, inject } from 'vue'
import { speechSynthesisKey, type SpeechSynthesisApi } from '@/composables/speechKeys'
import { markdownToPlainText } from '@/utils/markdownToPlainText'

const props = defineProps<{
  messageId: string
  content: string
  role: string
}>()

const emit = defineEmits<{
  beforeSpeak: []
  speakError: [message: string]
}>()

const speech = inject(speechSynthesisKey) as SpeechSynthesisApi | undefined

const isSupported = computed(() => speech?.isSupported.value ?? false)
const isActive = computed(() => speech?.speakingMessageId.value === props.messageId)
const speakableText = computed(() => markdownToPlainText(props.content))
const ariaLabel = computed(() =>
  isActive.value ? 'Stop reading message' : 'Listen to message'
)

async function handleToggle() {
  if (!speech || props.role !== 'assistant' || !isSupported.value) {
    return
  }

  if (isActive.value) {
    speech.stop()
    return
  }

  emit('beforeSpeak')

  if (!speakableText.value) {
    emit('speakError', 'There is no readable text in this message.')
    return
  }

  const started = await speech.toggle(props.messageId, speakableText.value)
  if (!started && speech.speakingMessageId.value !== props.messageId) {
    emit('speakError', speech.error.value ?? 'Could not start reading this message.')
  }
}
</script>

<template>
  <v-btn
    v-if="role === 'assistant' && isSupported"
    :icon="isActive ? 'mdi-stop-circle-outline' : 'mdi-volume-high'"
    variant="text"
    size="small"
    :aria-label="ariaLabel"
    :aria-pressed="isActive"
    @click="handleToggle"
  />
</template>
