import { z } from 'zod'

export type FormValidationResult<T> = {
  success: boolean
  data?: T
  errors?: Record<string, string>
}

export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): FormValidationResult<T> {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const errors: Record<string, string> = {}
  for (const error of result.error.issues) {
    const path = error.path.join('.')
    errors[path] = error.message
  }

  return { success: false, errors }
}

export function getFieldError(errors: Record<string, string> | undefined, field: string): string | undefined {
  if (!errors) return undefined
  return errors[field]
}