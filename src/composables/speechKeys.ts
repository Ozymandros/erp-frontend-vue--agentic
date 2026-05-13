import type { InjectionKey } from 'vue'
import type { useSpeechSynthesis } from '@/composables/useSpeechSynthesis'

export type SpeechSynthesisApi = ReturnType<typeof useSpeechSynthesis>

export const speechSynthesisKey: InjectionKey<SpeechSynthesisApi> = Symbol('speechSynthesis')
