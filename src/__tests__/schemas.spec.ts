import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema } from '../schemas/auth'
import { createAgentSchema, updateAgentSchema, agentIdSchema } from '../schemas/agent'
import { validateSchema, getFieldError } from '../schemas/validation'

describe('auth schemas', () => {
  describe('loginSchema', () => {
    it('validates correct login data', () => {
      const valid = { email: 'user@example.com', password: 'password123' }
      const result = loginSchema.safeParse(valid)
      expect(result.success).toBe(true)
      expect(result.success && result.data).toEqual(valid)
    })

    it('rejects missing email', () => {
      const result = loginSchema.safeParse({ password: 'password123' })
      expect(result.success).toBe(false)
    })

    it('rejects invalid email format', () => {
      const result = loginSchema.safeParse({ email: 'not-an-email', password: 'password123' })
      expect(result.success).toBe(false)
    })

    it('rejects missing password', () => {
      const result = loginSchema.safeParse({ email: 'user@example.com' })
      expect(result.success).toBe(false)
    })

    it('rejects empty email string', () => {
      const result = loginSchema.safeParse({ email: '', password: 'password123' })
      expect(result.success).toBe(false)
    })

    it('rejects empty password string', () => {
      const result = loginSchema.safeParse({ email: 'user@example.com', password: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('registerSchema', () => {
    const validData = {
      email: 'user@example.com',
      username: 'testuser',
      password: 'password123',
      passwordConfirm: 'password123',
    }

    it('validates correct registration data', () => {
      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects mismatched passwords', () => {
      const result = registerSchema.safeParse({
        ...validData,
        passwordConfirm: 'different',
      })
      expect(result.success).toBe(false)
    })

    it('rejects short username', () => {
      const result = registerSchema.safeParse({
        ...validData,
        username: 'ab',
      })
      expect(result.success).toBe(false)
    })

    it('rejects short password', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: '123',
        passwordConfirm: '123',
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid email format', () => {
      const result = registerSchema.safeParse({
        ...validData,
        email: 'not-an-email',
      })
      expect(result.success).toBe(false)
    })

    it('rejects missing username', () => {
      const result = registerSchema.safeParse({
        ...validData,
        username: '',
      })
      expect(result.success).toBe(false)
    })

    it('accepts exactly 3 character username', () => {
      const result = registerSchema.safeParse({
        ...validData,
        username: 'abc',
      })
      expect(result.success).toBe(true)
    })

    it('accepts exactly 6 character password', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: '123456',
        passwordConfirm: '123456',
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('agent schemas', () => {
  const validAgentData = {
    name: 'Test Agent',
    description: 'A test agent for testing',
    modelId: '550e8400-e29b-41d4-a716-446655440000',
    temperature: 0.7,
    systemPrompt: 'You are a helpful AI assistant.',
  }

  describe('createAgentSchema', () => {
    it('validates correct agent data', () => {
      const result = createAgentSchema.safeParse(validAgentData)
      expect(result.success).toBe(true)
    })

    it('rejects missing name', () => {
      const result = createAgentSchema.safeParse({ ...validAgentData, name: '' })
      expect(result.success).toBe(false)
    })

    it('rejects name exceeding max length', () => {
      const result = createAgentSchema.safeParse({
        ...validAgentData,
        name: 'a'.repeat(101),
      })
      expect(result.success).toBe(false)
    })

    it('rejects missing description', () => {
      const result = createAgentSchema.safeParse({ ...validAgentData, description: '' })
      expect(result.success).toBe(false)
    })

    it('rejects description exceeding max length', () => {
      const result = createAgentSchema.safeParse({
        ...validAgentData,
        description: 'a'.repeat(501),
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid UUID for modelId', () => {
      const result = createAgentSchema.safeParse({
        ...validAgentData,
        modelId: 'not-a-uuid',
      })
      expect(result.success).toBe(false)
    })

    it('rejects temperature below 0', () => {
      const result = createAgentSchema.safeParse({
        ...validAgentData,
        temperature: -0.1,
      })
      expect(result.success).toBe(false)
    })

    it('rejects temperature above 2', () => {
      const result = createAgentSchema.safeParse({
        ...validAgentData,
        temperature: 2.1,
      })
      expect(result.success).toBe(false)
    })

    it('accepts temperature at boundaries', () => {
      const zeroTemp = createAgentSchema.safeParse({
        ...validAgentData,
        temperature: 0,
      })
      expect(zeroTemp.success).toBe(true)

      const maxTemp = createAgentSchema.safeParse({
        ...validAgentData,
        temperature: 2,
      })
      expect(maxTemp.success).toBe(true)
    })

    it('rejects missing system prompt', () => {
      const result = createAgentSchema.safeParse({
        ...validAgentData,
        systemPrompt: '',
      })
      expect(result.success).toBe(false)
    })

    it('rejects system prompt exceeding max length', () => {
      const result = createAgentSchema.safeParse({
        ...validAgentData,
        systemPrompt: 'a'.repeat(5001),
      })
      expect(result.success).toBe(false)
    })

    it('coerces string temperature to number', () => {
      const result = createAgentSchema.safeParse({
        ...validAgentData,
        temperature: '0.8',
      })
      expect(result.success).toBe(true)
      expect(result.success && result.data.temperature).toBe(0.8)
      expect(result.success && typeof result.data.temperature).toBe('number')
    })

    it('coerces string botType to number', () => {
      const result = createAgentSchema.safeParse({
        ...validAgentData,
        botType: '2',
      })
      expect(result.success).toBe(true)
      expect(result.success && result.data.botType).toBe(2)
    })

    it('rejects botType outside range', () => {
      const result = createAgentSchema.safeParse({
        ...validAgentData,
        botType: 4,
      })
      expect(result.success).toBe(false)
    })

    it('accepts optional topK field', () => {
      const result = createAgentSchema.safeParse({
        ...validAgentData,
        topK: 50,
      })
      expect(result.success).toBe(true)
    })

    it('rejects topK outside valid range', () => {
      const result = createAgentSchema.safeParse({
        ...validAgentData,
        topK: 101,
      })
      expect(result.success).toBe(false)
    })

    it('accepts optional maxTokens field', () => {
      const result = createAgentSchema.safeParse({
        ...validAgentData,
        maxTokens: 2000,
      })
      expect(result.success).toBe(true)
    })

    it('rejects maxTokens outside valid range', () => {
      const result = createAgentSchema.safeParse({
        ...validAgentData,
        maxTokens: 32001,
      })
      expect(result.success).toBe(false)
    })

    it('defaults temperature to 0.7', () => {
      const data = { ...validAgentData }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (data as any).temperature
      const result = createAgentSchema.safeParse(data)
      expect(result.success).toBe(true)
      expect(result.success && result.data.temperature).toBe(0.7)
    })

    it('defaults botType to 1', () => {
      const data = { ...validAgentData }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (data as any).botType
      const result = createAgentSchema.safeParse(data)
      expect(result.success).toBe(true)
      expect(result.success && result.data.botType).toBe(1)
    })

    it('defaults enableMemory to true', () => {
      const data = { ...validAgentData }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (data as any).enableMemory
      const result = createAgentSchema.safeParse(data)
      expect(result.success).toBe(true)
      expect(result.success && result.data.enableMemory).toBe(true)
    })

    it('defaults enableRAG to true', () => {
      const data = { ...validAgentData }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (data as any).enableRAG
      const result = createAgentSchema.safeParse(data)
      expect(result.success).toBe(true)
      expect(result.success && result.data.enableRAG).toBe(true)
    })
  })

  describe('updateAgentSchema', () => {
    it('validates with all fields provided', () => {
      const result = updateAgentSchema.safeParse(validAgentData)
      expect(result.success).toBe(true)
    })

    it('allows partial updates with required fields', () => {
      const result = updateAgentSchema.safeParse({
        name: 'Updated Name',
        description: 'Updated description',
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        temperature: 0.8,
        systemPrompt: 'Updated prompt',
      })
      expect(result.success).toBe(true)
    })

    it('requires name when provided', () => {
      const result = updateAgentSchema.safeParse({
        name: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('agentIdSchema', () => {
    it('validates valid UUID', () => {
      const result = agentIdSchema.safeParse('550e8400-e29b-41d4-a716-446655440000')
      expect(result.success).toBe(true)
    })

    it('rejects invalid UUID', () => {
      const result = agentIdSchema.safeParse('not-a-uuid')
      expect(result.success).toBe(false)
    })

    it('rejects non-string input', () => {
      const result = agentIdSchema.safeParse(123)
      expect(result.success).toBe(false)
    })
  })
})

describe('validation helpers', () => {
  describe('validateSchema', () => {
    it('returns success with data on valid input', () => {
      const data = { email: 'user@example.com', password: 'password123' }
      const result = validateSchema(loginSchema, data)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(data)
      expect(result.errors).toBeUndefined()
    })

    it('returns errors object on invalid input', () => {
      const result = validateSchema(loginSchema, { email: 'invalid-email' })
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.data).toBeUndefined()
    })

    it('maps field paths to error messages', () => {
      const result = validateSchema(loginSchema, { email: '' })
      expect(result.success).toBe(false)
      expect(result.errors?.['email']).toBeDefined()
    })

    it('handles multiple validation errors', () => {
      const result = validateSchema(registerSchema, {
        email: 'invalid',
        username: 'ab',
        password: '123',
        passwordConfirm: 'different',
      })
      expect(result.success).toBe(false)
      expect(result.errors && Object.keys(result.errors).length).toBeGreaterThan(0)
    })
  })

  describe('getFieldError', () => {
    it('returns error message for specific field', () => {
      const errors = { email: 'Invalid email format', password: 'Password is required' }
      expect(getFieldError(errors, 'email')).toBe('Invalid email format')
    })

    it('returns undefined for non-existent field', () => {
      const errors = { email: 'Invalid email format' }
      expect(getFieldError(errors, 'password')).toBeUndefined()
    })

    it('returns undefined when errors object is undefined', () => {
      expect(getFieldError(undefined, 'email')).toBeUndefined()
    })

    it('returns undefined from empty errors object', () => {
      expect(getFieldError({}, 'email')).toBeUndefined()
    })

    it('handles nested field paths', () => {
      const errors = { 'address.street': 'Street is required' }
      expect(getFieldError(errors, 'address.street')).toBe('Street is required')
    })
  })
})