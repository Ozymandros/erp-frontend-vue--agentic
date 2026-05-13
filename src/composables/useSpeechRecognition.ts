import { onMounted, onUnmounted, ref } from 'vue'

interface SpeechRecognitionEvent extends Event {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string
      }
    }
  }
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onstart: () => void
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: SpeechRecognitionErrorEvent) => void
  onend: () => void
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognition

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}

export function useSpeechRecognition(onTranscript: (text: string) => void) {
  const isSupported = ref(false)
  const isListening = ref(false)
  const error = ref<string | null>(null)
  let recognition: SpeechRecognition | null = null

  function stop() {
    recognition?.stop()
    isListening.value = false
  }

  function toggle() {
    if (!isSupported.value || !recognition) {
      error.value = 'Speech recognition is not supported in this browser.'
      return
    }

    if (isListening.value) {
      stop()
      return
    }

    try {
      error.value = null
      recognition.start()
    } catch {
      isListening.value = false
      error.value = 'Could not start microphone. It might already be in use.'
    }
  }

  onMounted(() => {
    const speechWindow = window as WindowWithSpeechRecognition
    const SpeechRecognitionCtor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition

    if (!SpeechRecognitionCtor) {
      return
    }

    isSupported.value = true
    const rec = new SpeechRecognitionCtor() as SpeechRecognition
    rec.continuous = false
    rec.interimResults = false
    rec.lang = navigator.language || 'en-US'

    rec.onstart = () => {
      isListening.value = true
      error.value = null
    }

    rec.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim()
      if (transcript) {
        onTranscript(transcript)
      }
    }

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') {
        error.value = 'No speech was detected. Please try again.'
      } else if (event.error === 'not-allowed') {
        error.value = 'Microphone access denied. Please check permissions.'
      } else {
        error.value = `Speech error: ${event.error}`
      }
      isListening.value = false
    }

    rec.onend = () => {
      isListening.value = false
    }

    recognition = rec
  })

  onUnmounted(() => {
    stop()
  })

  return {
    isSupported,
    isListening,
    error,
    toggle,
    stop,
  }
}
