import { apiClient } from '@/utils/apiClient'
import type {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  TokenResponseDto,
  UserDto,
} from '@/types'

export const authApi = {
  login: async (data: LoginDto): Promise<TokenResponseDto> => {
    const response = await apiClient.auth.post<TokenResponseDto>('/api/Auth/login', data)
    return response.data
  },

  register: async (data: RegisterDto): Promise<TokenResponseDto> => {
    const response = await apiClient.auth.post<TokenResponseDto>('/api/Auth/register', data)
    return response.data
  },

  refresh: async (data: RefreshTokenDto): Promise<TokenResponseDto> => {
    const response = await apiClient.auth.post<TokenResponseDto>('/api/Auth/refresh', data)
    return response.data
  },

  logout: async (): Promise<void> => {
    await apiClient.auth.post('/api/Auth/logout')
  },

  getCurrentUser: async (): Promise<UserDto> => {
    const response = await apiClient.auth.get<UserDto>('/api/Auth/currentuser')
    return response.data
  },
}

export default authApi