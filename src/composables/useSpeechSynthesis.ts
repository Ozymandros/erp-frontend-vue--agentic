import { computed, onMounted, onUnmounted, ref } from 'vue'

export interface SpeakOptions {
  lang?: string
  rate?: number
}

function getPreferredVoice(lang: string) {
  const voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) {
    return null
  }

  const normalizedLang = lang.toLowerCase()
  return (
    voices.find((voice) => voice.lang.toLowerCase() === normalizedLang)
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith(normalizedLang.split('-')[0] ?? normalizedLang))
    ?? voices[0]
    ?? null
  )
}

function waitForVoices(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  const existingVoices = window.speechSynthesis.getVoices()
  if (existingVoices.length > 0) {
    return Promise.resolve(existingVoices)
  }

  return new Promise((resolve) => {
    let settled = false

    const finish = () => {
      if (settled) return
      settled = true
      window.speechSynthesis.removeEventListener('voiceschanged', finish)
      resolve(window.speechSynthesis.getVoices())
    }

    window.speechSynthesis.addEventListener('voiceschanged', finish)
    window.setTimeout(finish, timeoutMs)
  })
}

export function useSpeechSynthesis() {
  const isSupported = ref(typeof window !== 'undefined' && 'speechSynthesis' in window)
  const speakingMessageId = ref<string | null>(null)
  const error = ref<string | null>(null)
  let currentUtterance: SpeechSynthesisUtterance | null = null

  const isSpeaking = computed(() => speakingMessageId.value !== null)

  function clearSpeakingState() {
    speakingMessageId.value = null
    currentUtterance = null
  }

  function stop() {
    if (!isSupported.value) return
    window.speechSynthesis.cancel()
    clearSpeakingState()
  }

  async function speak(messageId: string, text: string, options: SpeakOptions = {}) {
    if (!isSupported.value) {
      error.value = 'Text-to-speech is not supported in this browser.'
      return false
    }

    const speakableText = text.trim()
    if (!speakableText) {
      error.value = 'There is no readable text in this message.'
      return false
    }

    stop()
    error.value = null

    await waitForVoices()

    const utterance = new SpeechSynthesisUtterance(speakableText)
    const lang = options.lang ?? (navigator.language || 'en-US')
    utterance.lang = lang
    utterance.rate = options.rate ?? 1

    const preferredVoice = getPreferredVoice(lang)
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    utterance.onstart = () => {
      speakingMessageId.value = messageId
      currentUtterance = utterance
    }

    utterance.onend = () => {
      if (currentUtterance === utterance) {
        clearSpeakingState()
      }
    }

    utterance.onerror = () => {
      if (currentUtterance === utterance) {
        clearSpeakingState()
        error.value = 'Speech playback was interrupted.'
      }
    }

    window.speechSynthesis.speak(utterance)
    return true
  }

  async function toggle(messageId: string, text: string, options?: SpeakOptions) {
    if (speakingMessageId.value === messageId) {
      stop()
      return false
    }

    return speak(messageId, text, options)
  }

  onMounted(() => {
    void waitForVoices()
  })

  onUnmounted(() => {
    stop()
  })

  return {
    isSupported,
    isSpeaking,
    speakingMessageId,
    error,
    speak,
    stop,
    toggle,
  }
}
