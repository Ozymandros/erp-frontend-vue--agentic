import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

const getApiOrigin = () => {
  return import.meta.env.VITE_API_ORIGIN || 'http://localhost:5000'
}

const getAuthApiBaseUrl = () => {
  return import.meta.env.VITE_AUTH_API_BASE_URL || `${getApiOrigin()}/auth`
}

const getAgenticApiBaseUrl = () => {
  return import.meta.env.VITE_AGENTIC_API_BASE_URL || `${getApiOrigin()}/agentic`
}

class ApiClient {
  private authClient: AxiosInstance
  private agenticClient: AxiosInstance

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
    this.authClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('accessToken')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    this.agenticClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('accessToken')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    this.authClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config
        if (error.response?.status === 401 && !originalRequest._retry) {
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
              return this.authClient(originalRequest)
            } catch {
              localStorage.removeItem('accessToken')
              localStorage.removeItem('refreshToken')
              window.location.href = '/login'
            }
          }
        }
        return Promise.reject(error)
      }
    )

    this.agenticClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config
        if (error.response?.status === 401 && !originalRequest._retry) {
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
              return this.agenticClient(originalRequest)
            } catch {
              localStorage.removeItem('accessToken')
              localStorage.removeItem('refreshToken')
              window.location.href = '/login'
            }
          }
        }
        return Promise.reject(error)
      }
    )
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