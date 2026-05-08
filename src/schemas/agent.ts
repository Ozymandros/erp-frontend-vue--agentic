import { z } from 'zod'

export const createAgentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters'),
  providerId: z.uuid('Provider is required'),
  modelId: z.uuid('Invalid Model ID format'),
  temperature: z.coerce
    .number()
    .min(0, 'Temperature must be at least 0')
    .max(2, 'Temperature must be at most 2'),
  systemPrompt: z
    .string()
    .min(1, 'System prompt is required')
    .max(5000, 'System prompt must be less than 5000 characters'),
  botType: z.coerce.number().int().min(0).max(3),
  topK: z.coerce.number().int().min(1).max(100).optional(),
  maxTokens: z.coerce.number().int().min(1).max(32000).optional(),
  embeddingDimensions: z.coerce.number().int().min(1).max(4096).optional(),
  enableMemory: z.boolean(),
  enableRAG: z.boolean(),
  embeddingModelName: z.string().max(100).optional(),
})

export type CreateAgentInput = z.infer<typeof createAgentSchema>

export const updateAgentSchema = createAgentSchema.partial().extend({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  providerId: z.uuid('Provider is required'),
  modelId: z.uuid('Invalid Model ID format'),
  temperature: z.coerce.number().min(0).max(2),
  systemPrompt: z.string().min(1, 'System prompt is required').max(5000),
})

export type UpdateAgentInput = z.infer<typeof updateAgentSchema>

export const agentIdSchema = z.uuid('Invalid Agent ID format')
