<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { loginSchema } from '@/schemas/auth'
import { validateSchema } from '@/schemas/validation'

const router = useRouter()
const route = useRoute()
const { login, loading, error: authError } = useAuth()

const form = ref({ email: '', password: '' })
const showPassword = ref(false)
const touched = ref<Record<string, boolean>>({})

const fieldErrors = computed(() => {
  const result = loginSchema.safeParse(form.value)
  if (result.success) return {}
  const errors: Record<string, string> = {}
  for (const err of result.error.issues) {
    errors[err.path.join('.')] = err.message
  }
  return errors
})

function touch(field: string) {
  touched.value[field] = true
}

async function handleLogin() {
  const result = validateSchema(loginSchema, form.value)
  if (!result.success) return

  try {
    await login(result.data!.email, result.data!.password)
    const redirect = route.query.redirect as string
    if (redirect) {
      router.push(redirect)
    }
  } catch {
    // Error handled by composable
  }
}
</script>

<template>
  <v-main class="bg-background">
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card class="pa-4">
              <v-card-title class="text-center text-h5 py-4">
                <v-icon icon="mdi-robot" size="large" color="primary" class="mr-2" />
                Agentic Dashboard
              </v-card-title>
              <v-card-text>
                <v-form @submit.prevent="handleLogin">
                  <v-text-field
                    v-model="form.email"
                    label="Email"
                    type="email"
                    prepend-inner-icon="mdi-email"
                    :error-messages="touched.email ? fieldErrors.email : undefined"
                    autocomplete="email"
                    @blur="touch('email')"
                  />
                  <v-text-field
                    v-model="form.password"
                    label="Password"
                    :type="showPassword ? 'text' : 'password'"
                    prepend-inner-icon="mdi-lock"
                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    autocomplete="current-password"
                    :error-messages="touched.password ? fieldErrors.password : undefined"
                    @blur="touch('password')"
                    @click:append-inner="showPassword = !showPassword"
                  />
                  <v-alert v-if="authError" type="error" variant="tonal" class="mb-4">
                    {{ authError }}
                  </v-alert>
                  <v-btn
                    type="submit"
                    color="primary"
                    block
                    size="large"
                    :loading="loading"
                  >
                    Login
                  </v-btn>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <span class="text-body-2">Don't have an account?</span>
                <v-btn variant="text" color="primary" to="/register">
                  Register
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
</template>