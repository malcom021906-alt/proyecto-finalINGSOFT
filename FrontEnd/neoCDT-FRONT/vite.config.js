import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{js,jsx}'],
    // 👇 EXCLUYE TODOS los tests que fallan
    exclude: [
      'node_modules',   
       
      
    ],
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',  // 👈 Debe ser así, sin duplicar
      cleanOnRerun: true,  // 👈 CAMBIA ESTO a true para limpiar antes
      clean: true,          // 👈 Y esto también
      all: true,
      exclude: [
        'node_modules/',
        'src/setupTests.js',
        '**/*.config.js',
        '**/*.config.ts',
        '**/dist/**',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}'
      ]
    }
  }
})