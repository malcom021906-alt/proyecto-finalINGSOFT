// e2e/helpers/auth.helper.js
import { expect } from '@playwright/test';

/**
 * HELPER: Retry una acción con espera entre intentos
 */
async function retryAction(page, action, options = {}) {
  const { 
    maxRetries = 3,
    delayMs = 1000,
    timeout = 5000,
    description = 'acción'
  } = options;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await action();
      return;
    } catch (error) {
      if (attempt === maxRetries) {
        throw new Error(`Falló ${description} después de ${maxRetries} intentos: ${error.message}`);
      }
      console.log(`Intento ${attempt} fallido, reintentando en ${delayMs}ms...`);
      await page.waitForTimeout(delayMs);
    }
  }
}

/**
 * HELPER: Esperar y hacer clic en un botón
 */
async function waitAndClick(page, selector, options = {}) {
  const element = page.getByRole('button', { name: selector });
  await element.waitFor({ state: 'visible', timeout: options.timeout || 5000 });
  await element.click();
}

/**
 * HELPER: Login base con retry
 */
async function loginBase(page, email, password, expectedPath) {
  await page.goto('/login');
  
  // Esperar que la página esté lista
  await retryAction(page, async () => {
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /Sign in/i })).toBeVisible();
  }, { description: 'espera página login' });
  
  // Llenar credenciales
  await retryAction(page, async () => {
    await page.getByPlaceholder('Enter your email').fill(email);
    await page.getByPlaceholder('Enter your password').fill(password);
  }, { description: 'llenar credenciales' });
  
  // Intentar login
  await retryAction(page, async () => {
    await waitAndClick(page, /Sign in/i);
    await page.waitForURL(`**/${expectedPath}`, { timeout: 15000 });
  }, { 
    description: 'login y redirección',
    timeout: 15000,
    maxRetries: 2 
  });
}

/**
 * HELPER: Login como Cliente
 */
export async function loginAsCliente(page) {
  await loginBase(
    page,
    'jorge_andres.medina@uao.edu.co',
    'MedinaInge519',
    'solicitudes'
  );
}

/**
 * HELPER: Login como Agente
 */
export async function loginAsAgente(page) {
  await loginBase(
    page,
    'admin@neocdt.banco.com',
    'admin',
    'agente'
  );
}

/**
 * HELPER: Aceptar alert/dialog con retry
 */
export async function waitForAlert(page, expectedText = null, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`No se encontró alerta con texto "${expectedText}" después de ${timeout}ms`));
    }, timeout);
    
    page.once('dialog', async dialog => {
      clearTimeout(timeoutId);
      const message = dialog.message();
      
      if (expectedText && !message.toLowerCase().includes(expectedText.toLowerCase())) {
        reject(new Error(`Texto de alerta "${message}" no contiene "${expectedText}"`));
        return;
      }
      
      try {
        await dialog.accept();
        resolve(message);
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * HELPER: Aceptar prompt con texto y retry
 */
export async function acceptPrompt(page, textToEnter, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`No se encontró prompt para ingresar "${textToEnter}" después de ${timeout}ms`));
    }, timeout);
    
    page.once('dialog', async dialog => {
      clearTimeout(timeoutId);
      try {
        await dialog.accept(textToEnter);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}