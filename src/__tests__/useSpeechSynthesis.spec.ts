import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { useSpeechSynthesis } from '../composables/useSpeechSynthesis'

class MockSpeechSynthesisUtterance {
  text = ''
  lang = ''
  rate = 1
  voice: SpeechSynthesisVoice | null = null
  onstart: (() => void) | null = null
  onend: (() => void) | null = null
  onerror: (() => void) | null = null

  constructor(text: string) {
    this.text = text
  }
}

describe('useSpeechSynthesis', () => {
  const cancel = vi.fn()
  const speak = vi.fn()

  beforeEach(() => {
    cancel.mockReset()
    speak.mockReset()

    class MockSpeechSynthesis {
      cancel = cancel
      speak = speak
      getVoices = () => [{ lang: 'en-US', name: 'English' } as SpeechSynthesisVoice]
      addEventListener = vi.fn()
      removeEventListener = vi.fn()
    }

    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: new MockSpeechSynthesis(),
    })

    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: MockSpeechSynthesisUtterance,
    })
  })

  it('speaks text and tracks the active message id', async () => {
    const wrapper = mount(defineComponent({
      setup() {
        const speech = useSpeechSynthesis()
        return { speech }
      },
      template: '<div />',
    }))

    const speech = wrapper.vm.speech as ReturnType<typeof useSpeechSynthesis>
    await speech.speak('message-1', 'Hello assistant')

    expect(speak).toHaveBeenCalledTimes(1)
    expect(cancel).toHaveBeenCalled()

    const utterance = speak.mock.calls[0]?.[0] as MockSpeechSynthesisUtterance
    expect(utterance.text).toBe('Hello assistant')
    utterance.onstart?.()
    await nextTick()
    expect(speech.speakingMessageId.value).toBe('message-1')
  })

  it('stops speaking and clears state', async () => {
    const wrapper = mount(defineComponent({
      setup() {
        const speech = useSpeechSynthesis()
        return { speech }
      },
      template: '<div />',
    }))

    const speech = wrapper.vm.speech as ReturnType<typeof useSpeechSynthesis>
    await speech.speak('message-2', 'Stop me')
    const utterance = speak.mock.calls[0]?.[0] as MockSpeechSynthesisUtterance
    utterance.onstart?.()
    await nextTick()

    speech.stop()
    expect(cancel).toHaveBeenCalled()
    expect(speech.speakingMessageId.value).toBeNull()
  })

  it('cancels the previous utterance when speaking a new message', async () => {
    const wrapper = mount(defineComponent({
      setup() {
        const speech = useSpeechSynthesis()
        return { speech }
      },
      template: '<div />',
    }))

    const speech = wrapper.vm.speech as ReturnType<typeof useSpeechSynthesis>
    await speech.speak('message-1', 'First')
    await speech.speak('message-2', 'Second')

    expect(cancel).toHaveBeenCalled()
    expect(speak).toHaveBeenCalledTimes(2)
  })
})
