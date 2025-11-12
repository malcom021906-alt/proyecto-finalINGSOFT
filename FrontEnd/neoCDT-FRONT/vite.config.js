import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    // ❌ NO incluyas archivos de código fuente aquí
    // ✅ Solo archivos de test
    include: ['src/**/*.test.{js,jsx}', 'src/**/*.spec.{js,jsx}'],
    exclude: [
      'node_modules',   
    ],
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      cleanOnRerun: true,
      clean: true,
      all: true,
      // ✅ SOLO cubrir components, pages y router
      include: [
        'src/components/**/*.{js,jsx}',
        'src/pages/**/*.{js,jsx}',
        'src/router/**/*.{js,jsx}'
      ],
      exclude: [
        'node_modules/',
        'src/setupTests.js',
        '**/*.config.js',
        '**/*.config.ts',
        '**/dist/**',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}',
        'src/services/**',
        'src/context/**',
        'src/utils/**',
        'src/mocks/**',
        'e2e/**',
        'src/App.jsx',
        'src/main.jsx',
        '**/router/**'
      ]
    }
  }
})