import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  username: z.string().min(1, 'Username is required').min(3, 'Username must be at least 3 characters'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
  passwordConfirm: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Passwords do not match',
  path: ['passwordConfirm'],
})

export type RegisterInput = z.infer<typeof registerSchema>