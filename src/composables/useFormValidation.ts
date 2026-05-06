import { ref, computed } from 'vue'
import { z } from 'zod'

export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const formData = ref<Record<string, unknown>>({})
  const touched = ref<Record<string, boolean>>({})

  const errors = computed(() => {
    const result = schema.safeParse(formData.value)
    if (result.success) return {}
    const errs: Record<string, string> = {}
    for (const err of result.error.issues) {
      errs[err.path.join('.')] = err.message
    }
    return errs
  })

  const isValid = computed(() => Object.keys(errors.value).length === 0)

  function validate(): boolean {
    const result = schema.safeParse(formData.value)
    return result.success
  }

  function setField(field: string, value: unknown) {
    formData.value[field] = value
  }

  function touch(field: string) {
    touched.value[field] = true
  }

  function reset() {
    formData.value = {}
    touched.value = {}
  }

  return {
    formData,
    errors,
    touched,
    isValid,
    validate,
    setField,
    touch,
    reset,
  }
}