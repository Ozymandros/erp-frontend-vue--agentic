import { z } from 'zod'

export const providerSchema = z.object({
  name: z.string().min(1, 'Provider name is required'),
  baseUrl: z.string().min(1, 'Base URL is required').url('Base URL must be a valid URL'),
  secretKeyName: z.string().min(1, 'Secret key name is required'),
  defaultTemperature: z.coerce.number().min(0).max(2),
  defaultTopK: z.coerce.number().int().min(1),
  defaultMaxTokens: z.coerce.number().int().min(1),
  defaultEmbeddingDimensions: z.coerce.number().int().min(1),
  defaultEnableMemory: z.boolean(),
  defaultEnableRAG: z.boolean(),
  defaultEmbeddingModelName: z.string().optional(),
  defaultBotType: z.coerce.number().int().min(0).max(3),
  defaultSystemPrompt: z.string().optional(),
})

export const modelSchema = z.object({
  providerId: z.uuid('Provider is required'),
  commercialName: z.string().min(1, 'Commercial name is required'),
  technicalName: z.string().min(1, 'Technical name is required'),
  tokenLimit: z.coerce.number().int().min(1, 'Token limit must be greater than 0'),
  capabilities: z.string().min(1, 'Capabilities are required'),
  defaultTemperature: z.coerce.number().min(0).max(2),
  defaultTopK: z.coerce.number().int().min(1),
  defaultMaxTokens: z.coerce.number().int().min(1),
  defaultEmbeddingDimensions: z.coerce.number().int().min(1),
  defaultEnableMemory: z.boolean(),
  defaultEnableRAG: z.boolean(),
  defaultEmbeddingModelName: z.string().optional(),
  defaultBotType: z.coerce.number().int().min(0).max(3),
  defaultSystemPrompt: z.string().optional(),
})

export type ProviderInput = z.infer<typeof providerSchema>
export type ModelInput = z.infer<typeof modelSchema>
