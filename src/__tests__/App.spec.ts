import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from '../App.vue'

describe('App', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('mounts and renders', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          'router-view': true,
          'v-app': true,
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
