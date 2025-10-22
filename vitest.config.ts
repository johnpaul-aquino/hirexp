import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv('test', process.cwd(), '')

  return {
    plugins: [react()],
    test: {
      environment: 'happy-dom',
      globals: true,
      setupFiles: ['__tests__/setup/vitest.setup.ts'],
      include: ['__tests__/**/*.test.{ts,tsx}'],
      fileParallelism: false, // Disable parallel file execution to prevent database deadlocks
      env: {
        DATABASE_URL: env.DATABASE_URL || 'postgresql://hirexp:hirexp_dev_password@localhost:5432/hirexp_test?schema=public',
        REDIS_URL: env.REDIS_URL || 'redis://localhost:6379',
        NODE_ENV: 'test',
        NEXTAUTH_URL: 'http://localhost:3000',
        NEXTAUTH_SECRET: 'test-secret-key-for-testing-only',
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          '__tests__/setup/',
          '*.config.{ts,js}',
          '.next/',
          'out/',
        ],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
  }
})
