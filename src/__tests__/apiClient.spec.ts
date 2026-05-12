import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

type RequestHandler = (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>
type ResponseFulfilledHandler = (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>
type ResponseRejectedHandler = (error: unknown) => unknown

interface MockAxiosInstance {
  (config: InternalAxiosRequestConfig): Promise<AxiosResponse>
  interceptors: {
    request: {
      use: (fulfilled: RequestHandler) => number
    }
    response: {
      use: (fulfilled: ResponseFulfilledHandler, rejected?: ResponseRejectedHandler) => number
    }
  }
  requestHandlers: RequestHandler[]
  responseHandlers: Array<{
    fulfilled: ResponseFulfilledHandler
    rejected?: ResponseRejectedHandler
  }>
}

const axiosMockState = vi.hoisted(() => ({
  clients: [] as MockAxiosInstance[],
}))

function createMockAxiosInstance(): MockAxiosInstance {
  const requestHandlers: RequestHandler[] = []
  const responseHandlers: MockAxiosInstance['responseHandlers'] = []
  const client = vi.fn(async (config: InternalAxiosRequestConfig) => {
    return {
      data: null,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      request: undefined,
    }
  }) as unknown as MockAxiosInstance

  client.requestHandlers = requestHandlers
  client.responseHandlers = responseHandlers
  client.interceptors = {
    request: {
      use: (fulfilled: RequestHandler) => {
        requestHandlers.push(fulfilled)
        return requestHandlers.length - 1
      },
    },
    response: {
      use: (fulfilled: ResponseFulfilledHandler, rejected?: ResponseRejectedHandler) => {
        responseHandlers.push({ fulfilled, rejected })
        return responseHandlers.length - 1
      },
    },
  }

  return client
}

vi.mock('axios', () => {
  const create = vi.fn(() => {
    const client = createMockAxiosInstance()
    axiosMockState.clients.push(client)
    return client
  })
  const post = vi.fn()

  return {
    default: { create, post },
    create,
    post,
  }
})

function createConfig(overrides: Partial<InternalAxiosRequestConfig> = {}): InternalAxiosRequestConfig {
  return {
    baseURL: 'http://localhost:5000/agentic',
    url: '/api/agentic/agents',
    method: 'get',
    headers: {},
    ...overrides,
  } as InternalAxiosRequestConfig
}

function createResponse(config: InternalAxiosRequestConfig, data: unknown, status = 200): AxiosResponse {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config,
    request: undefined,
  }
}

describe('apiClient caching', () => {
  let authClient: MockAxiosInstance
  let agenticClient: MockAxiosInstance

  beforeEach(async () => {
    vi.resetModules()
    vi.useRealTimers()
    axiosMockState.clients.length = 0

    const module = await import('../utils/apiClient')
    expect(module.apiClient).toBeDefined()

    ;[authClient, agenticClient] = axiosMockState.clients
  })

  it('reuses cached responses for eligible agentic GET requests', async () => {
    localStorage.setItem('accessToken', 'token-1')

    const requestHandler = agenticClient.requestHandlers[0]
    const responseHandler = agenticClient.responseHandlers[0].fulfilled

    const firstRequest = await requestHandler(createConfig())
    expect(firstRequest.adapter).toBeUndefined()

    await responseHandler(createResponse(firstRequest, [{ id: 'agent-1' }]))

    const secondRequest = await requestHandler(createConfig())
    expect(secondRequest.adapter).toBeTypeOf('function')

    const cachedResponse = await secondRequest.adapter?.(secondRequest)
    expect(cachedResponse?.data).toEqual([{ id: 'agent-1' }])
  })

  it('normalizes query params when building cache keys', async () => {
    localStorage.setItem('accessToken', 'token-1')

    const requestHandler = agenticClient.requestHandlers[0]
    const responseHandler = agenticClient.responseHandlers[0].fulfilled
    const firstRequest = await requestHandler(
      createConfig({
        params: {
          page: 1,
          sort: 'name',
        },
      })
    )

    await responseHandler(createResponse(firstRequest, [{ id: 'agent-1' }]))

    const secondRequest = await requestHandler(
      createConfig({
        params: {
          sort: 'name',
          page: 1,
        },
      })
    )

    expect(secondRequest.adapter).toBeTypeOf('function')
  })

  it('skips caching for auth and session endpoints', async () => {
    localStorage.setItem('accessToken', 'token-1')

    const authRequestHandler = authClient.requestHandlers[0]
    const authResponseHandler = authClient.responseHandlers[0].fulfilled
    const authRequest = await authRequestHandler(
      createConfig({
        baseURL: 'http://localhost:5000/auth',
        url: '/api/Auth/currentuser',
      })
    )

    await authResponseHandler(createResponse(authRequest, { id: 'user-1' }))

    const repeatedAuthRequest = await authRequestHandler(
      createConfig({
        baseURL: 'http://localhost:5000/auth',
        url: '/api/Auth/currentuser',
      })
    )
    expect(repeatedAuthRequest.adapter).toBeUndefined()

    const agenticRequestHandler = agenticClient.requestHandlers[0]
    const agenticResponseHandler = agenticClient.responseHandlers[0].fulfilled
    const sessionRequest = await agenticRequestHandler(
      createConfig({
        url: '/api/agentic/sessions/123',
      })
    )

    await agenticResponseHandler(createResponse(sessionRequest, { sessionId: '123', messages: [] }))

    const repeatedSessionRequest = await agenticRequestHandler(
      createConfig({
        url: '/api/agentic/sessions/123',
      })
    )
    expect(repeatedSessionRequest.adapter).toBeUndefined()
  })

  it('expires cached responses after the TTL window', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-12T12:00:00Z'))
    localStorage.setItem('accessToken', 'token-1')

    const requestHandler = agenticClient.requestHandlers[0]
    const responseHandler = agenticClient.responseHandlers[0].fulfilled
    const firstRequest = await requestHandler(createConfig())

    await responseHandler(createResponse(firstRequest, [{ id: 'agent-1' }]))

    vi.advanceTimersByTime(60_001)

    const expiredRequest = await requestHandler(createConfig())
    expect(expiredRequest.adapter).toBeUndefined()
  })

  it('invalidates matching cached resources after agentic mutations', async () => {
    localStorage.setItem('accessToken', 'token-1')

    const requestHandler = agenticClient.requestHandlers[0]
    const responseHandler = agenticClient.responseHandlers[0].fulfilled
    const firstRequest = await requestHandler(
      createConfig({
        url: '/api/agentic/models',
      })
    )

    await responseHandler(createResponse(firstRequest, [{ id: 'model-1' }]))

    const cachedRequest = await requestHandler(
      createConfig({
        url: '/api/agentic/models',
      })
    )
    expect(cachedRequest.adapter).toBeTypeOf('function')

    const mutationRequest = await requestHandler(
      createConfig({
        url: '/api/agentic/models',
        method: 'post',
      })
    )

    await responseHandler(createResponse(mutationRequest, { id: 'model-2' }, 201))

    const afterInvalidationRequest = await requestHandler(
      createConfig({
        url: '/api/agentic/models',
      })
    )
    expect(afterInvalidationRequest.adapter).toBeUndefined()
  })
})
