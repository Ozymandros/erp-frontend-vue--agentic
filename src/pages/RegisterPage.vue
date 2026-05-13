<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { registerSchema } from '@/schemas/auth'
import { validateSchema } from '@/schemas/validation'

const { register, loading, error: authError } = useAuth()

const form = ref({ email: '', username: '', password: '', passwordConfirm: '' })
const showPassword = ref(false)
const touched = ref<Record<string, boolean>>({})

const fieldErrors = computed(() => {
  const result = registerSchema.safeParse(form.value)
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

async function handleRegister() {
  const result = validateSchema(registerSchema, form.value)
  if (!result.success) return

  try {
    await register(result.data!)
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
                <v-icon icon="mdi-account-plus" size="large" color="primary" class="mr-2" />
                Register
              </v-card-title>
              <v-card-text>
                <v-form @submit.prevent="handleRegister">
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
                    v-model="form.username"
                    label="Username"
                    prepend-inner-icon="mdi-account"
                    :error-messages="touched.username ? fieldErrors.username : undefined"
                    autocomplete="username"
                    @blur="touch('username')"
                  />
                  <v-text-field
                    v-model="form.password"
                    label="Password"
                    :type="showPassword ? 'text' : 'password'"
                    prepend-inner-icon="mdi-lock"
                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    :error-messages="touched.password ? fieldErrors.password : undefined"
                    autocomplete="new-password"
                    @blur="touch('password')"
                    @click:append-inner="showPassword = !showPassword"
                  />
                  <v-text-field
                    v-model="form.passwordConfirm"
                    label="Confirm Password"
                    :type="showPassword ? 'text' : 'password'"
                    prepend-inner-icon="mdi-lock-check"
                    :error-messages="touched.passwordConfirm ? fieldErrors.passwordConfirm : undefined"
                    autocomplete="new-password"
                    @blur="touch('passwordConfirm')"
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
                    Register
                  </v-btn>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <span class="text-body-2">Already have an account?</span>
                <v-btn variant="text" color="primary" to="/login">
                  Login
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
</template>