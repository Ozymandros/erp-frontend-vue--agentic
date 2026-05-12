import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'

const DEFAULT_CACHE_TTL_MS = 60_000
const CACHEABLE_METHOD = 'get'
const MUTATION_METHODS = new Set(['post', 'put', 'patch', 'delete'])
const AGENTIC_CACHE_EXCLUSIONS = [
  /^\/api\/agentic\/providers(?:\/|$)/,
  /^\/api\/agentic\/sessions(?:\/|$)/,
  /^\/api\/agentic\/messages(?:\/|$)/,
]

type ClientKind = 'auth' | 'agentic'

interface CacheEntry {
  data: AxiosResponse['data']
  status: AxiosResponse['status']
  statusText: AxiosResponse['statusText']
  headers: AxiosResponse['headers']
  expiresAt: number
  path: string
}

interface CacheMetadata {
  key?: string
  fromCache?: boolean
}

type CacheRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
  cacheMetadata?: CacheMetadata
}

const getApiOrigin = () => {
  return import.meta.env.VITE_API_ORIGIN || 'http://localhost:5000'
}

const getAuthApiBaseUrl = () => {
  return import.meta.env.VITE_AUTH_API_BASE_URL || `${getApiOrigin()}/auth`
}

const getAgenticApiBaseUrl = () => {
  return import.meta.env.VITE_AGENTIC_API_BASE_URL || `${getApiOrigin()}/agentic`
}

const normalizeValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(normalizeValue)
  }

  if (value && Object.prototype.toString.call(value) === '[object Object]') {
    const record = value as Record<string, unknown>

    return Object.keys(record)
      .sort()
      .reduce<Record<string, unknown>>((normalized, key) => {
        normalized[key] = normalizeValue(record[key])
        return normalized
      }, {})
  }

  return value
}

const serializeParams = (params: unknown) => {
  return JSON.stringify(normalizeValue(params) ?? null)
}

const cloneData = <T>(data: T): T => {
  if (typeof structuredClone !== 'function') {
    return data
  }

  try {
    return structuredClone(data)
  } catch {
    return data
  }
}

class ApiClient {
  private authClient: AxiosInstance
  private agenticClient: AxiosInstance
  private responseCache = new Map<string, CacheEntry>()

  constructor() {
    this.authClient = axios.create({
      baseURL: getAuthApiBaseUrl(),
      headers: { 'Content-Type': 'application/json' },
    })

    this.agenticClient = axios.create({
      baseURL: getAgenticApiBaseUrl(),
      headers: { 'Content-Type': 'application/json' },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.setupClientInterceptors(this.authClient, 'auth')
    this.setupClientInterceptors(this.agenticClient, 'agentic')
  }

  private setupClientInterceptors(client: AxiosInstance, clientKind: ClientKind) {
    client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      return this.prepareRequest(config as CacheRequestConfig, clientKind)
    })

    client.interceptors.response.use(
      (response) => this.handleSuccessfulResponse(response, clientKind),
      async (error) => this.handleFailedResponse(error, client)
    )
  }

  private prepareRequest(config: CacheRequestConfig, clientKind: ClientKind) {
    this.attachAccessToken(config)
    return this.attachCachedAdapter(config, clientKind)
  }

  private attachAccessToken(config: InternalAxiosRequestConfig) {
    const token = localStorage.getItem('accessToken')

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  private attachCachedAdapter(config: CacheRequestConfig, clientKind: ClientKind) {
    if (!this.shouldCacheRequest(clientKind, config)) {
      return config
    }

    const cacheKey = this.getCacheKey(config)
    const cachedEntry = this.responseCache.get(cacheKey)

    config.cacheMetadata = {
      key: cacheKey,
      fromCache: false,
    }

    if (!cachedEntry) {
      return config
    }

    if (cachedEntry.expiresAt <= Date.now()) {
      this.responseCache.delete(cacheKey)
      return config
    }

    config.cacheMetadata = {
      key: cacheKey,
      fromCache: true,
    }

    config.adapter = async () => ({
      data: cloneData(cachedEntry.data),
      status: cachedEntry.status,
      statusText: cachedEntry.statusText,
      headers: cachedEntry.headers,
      config,
      request: undefined,
    })

    return config
  }

  private handleSuccessfulResponse(response: AxiosResponse, clientKind: ClientKind) {
    const config = response.config as CacheRequestConfig

    if (this.shouldCacheRequest(clientKind, config) && !config.cacheMetadata?.fromCache) {
      this.storeResponse(config, response)
    }

    if (clientKind === 'agentic' && this.isMutationRequest(config)) {
      this.invalidateAgenticCache(config)
    }

    return response
  }

  private storeResponse(config: CacheRequestConfig, response: AxiosResponse) {
    const cacheKey = config.cacheMetadata?.key ?? this.getCacheKey(config)

    this.responseCache.set(cacheKey, {
      data: cloneData(response.data),
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      expiresAt: Date.now() + DEFAULT_CACHE_TTL_MS,
      path: this.getRequestPath(config),
    })
  }

  private isMutationRequest(config: InternalAxiosRequestConfig) {
    return MUTATION_METHODS.has(this.getMethod(config))
  }

  private invalidateAgenticCache(config: InternalAxiosRequestConfig) {
    const path = this.getRequestPath(config)
    const invalidationPrefixes = this.getInvalidationPrefixes(path)

    if (invalidationPrefixes.length === 0) {
      this.responseCache.clear()
      return
    }

    for (const [cacheKey, cacheEntry] of this.responseCache.entries()) {
      if (invalidationPrefixes.some((prefix) => cacheEntry.path.startsWith(prefix))) {
        this.responseCache.delete(cacheKey)
      }
    }
  }

  private getInvalidationPrefixes(path: string) {
    if (path.startsWith('/api/agentic/agents')) {
      return ['/api/agentic/agents']
    }

    if (path.startsWith('/api/agentic/models')) {
      return ['/api/agentic/models']
    }

    if (path.startsWith('/api/agentic/providers')) {
      return ['/api/agentic/providers']
    }

    if (path.startsWith('/api/agentic/sessions') || path.startsWith('/api/agentic/messages')) {
      return ['/api/agentic/sessions', '/api/agentic/messages']
    }

    return []
  }

  private shouldCacheRequest(clientKind: ClientKind, config: InternalAxiosRequestConfig) {
    if (clientKind === 'auth') {
      return false
    }

    if (this.getMethod(config) !== CACHEABLE_METHOD) {
      return false
    }

    const path = this.getRequestPath(config)

    return !AGENTIC_CACHE_EXCLUSIONS.some((pattern) => pattern.test(path))
  }

  private getCacheKey(config: InternalAxiosRequestConfig) {
    const requestUrl = this.getRequestUrl(config)
    const serializedParams = serializeParams(config.params)
    const authHeader = this.getHeaderValue(config, 'Authorization')

    return [this.getMethod(config), requestUrl, serializedParams, authHeader].join('|')
  }

  private getMethod(config: InternalAxiosRequestConfig) {
    return config.method?.toLowerCase() ?? CACHEABLE_METHOD
  }

  private getHeaderValue(config: InternalAxiosRequestConfig, headerName: string) {
    const headers = config.headers as
      | (Record<string, unknown> & { get?: (name: string) => string | undefined })
      | undefined

    const headerFromGetter = headers?.get?.(headerName)

    if (typeof headerFromGetter === 'string') {
      return headerFromGetter
    }

    const headerValue = headers?.[headerName] ?? headers?.[headerName.toLowerCase()] ?? headers?.[headerName.toUpperCase()]

    if (Array.isArray(headerValue)) {
      return headerValue.join(',')
    }

    return typeof headerValue === 'string' ? headerValue : ''
  }

  private getRequestUrl(config: InternalAxiosRequestConfig) {
    const requestUrl = config.url ?? ''

    try {
      return new URL(requestUrl, config.baseURL ?? window.location.origin).toString()
    } catch {
      return `${config.baseURL ?? ''}${requestUrl}`
    }
  }

  private getRequestPath(config: InternalAxiosRequestConfig) {
    try {
      return new URL(this.getRequestUrl(config)).pathname
    } catch {
      return config.url ?? ''
    }
  }

  private async handleFailedResponse(error: unknown, client: AxiosInstance) {
    const responseError = error as {
      config?: CacheRequestConfig
      response?: { status?: number }
    }
    const originalRequest = responseError.config

    if (responseError.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refreshToken')

      if (refreshToken) {
        try {
          const response = await axios.post(`${getAuthApiBaseUrl()}/api/Auth/refresh`, {
            refreshToken,
          })
          const { accessToken, refreshToken: newRefreshToken } = response.data

          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
          }

          return client(originalRequest)
        } catch {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  }

  get auth() {
    return this.authClient
  }

  get agentic() {
    return this.agenticClient
  }
}

export const apiClient = new ApiClient()
export default apiClient