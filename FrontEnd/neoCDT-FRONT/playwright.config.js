// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/specs',
  
  // Ejecutar pruebas secuencialmente para evitar conflictos
  fullyParallel: false,
  
  forbidOnly: !!process.env.CI,
  
  retries: process.env.CI ? 2 : 0,
  
  workers: 1,
  
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Aumentar timeouts para mayor estabilidad
    actionTimeout: 30000,
    navigationTimeout: 45000,
    
    // Esperar a que la red esté inactiva
    navigationWaitUntil: 'networkidle',
    
    // Esperar a que los elementos sean visibles y estables
    expect: {
      timeout: 10000,
      toHaveScreenshot: {
        maxDiffPixelRatio: 0.1
      }
    },
    
    // Viewport más grande para evitar problemas de responsive
    viewport: { width: 1920, height: 1080 },
    
    // Mejorar estabilidad de las pruebas
    serviceWorkers: 'block',
    isMobile: false,
    hasTouch: false,
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});