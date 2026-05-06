import { fileURLToPath } from 'node:url'
import { defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default defineConfig({
  ...viteConfig,
  test: {
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'e2e/**'],
    root: fileURLToPath(new URL('./', import.meta.url)),
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      reporter: ['text', 'html', 'json', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.config.{js,ts,mjs,cjs}',
        '**/*.d.ts',
        '**/*.test.{ts,tsx,js,jsx,vue}',
        '**/*.spec.{ts,tsx,js,jsx,vue}',
        'e2e/**',
        'src/**/__tests__/**',
        'src/**/env.d.ts',
        'env.d.ts',
      ],
      include: ['src/**/*.{ts,tsx,vue}'],
    },
  },
})