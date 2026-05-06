// Auth Types
export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  username: string
  password: string
  passwordConfirm: string
  firstName?: string
  lastName?: string
}

export interface TokenResponseDto {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
  user?: UserDto | null
}

export interface RefreshTokenDto {
  refreshToken: string
}

export interface UserDto {
  id: string
  username: string
  email: string
  firstName?: string | null
  lastName?: string | null
  createdAt: string
  createdBy: string
  updatedAt?: string | null
  updatedBy?: string | null
}

export interface RoleDto {
  id: string
  name?: string | null
  description?: string | null
  createdAt: string
  createdBy: string
  updatedAt?: string | null
  updatedBy?: string | null
}

export interface PermissionDto {
  id: string
  name?: string | null
  description?: string | null
  createdAt: string
  createdBy: string
  updatedAt?: string | null
  updatedBy?: string | null
}

export interface PaginatedResultOfUserDto {
  items: UserDto[]
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface PaginatedResultOfRoleDto {
  items: RoleDto[]
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface PaginatedResultOfPermissionDto {
  items: PermissionDto[]
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}