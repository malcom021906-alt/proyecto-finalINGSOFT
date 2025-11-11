// e2e/specs/HU-01-login.spec.js
import { test, expect } from '@playwright/test';

test.describe('HU-01: Inicio de sesión', () => {
  
  test('Escenario: Login exitoso', async ({ page }) => {
    // GIVEN: El usuario está en la pantalla de login
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Sign in/i })).toBeVisible();
    
    // WHEN: Ingresa el correo electrónico y la contraseña válida
    await page.getByPlaceholder('Enter your email').fill('jorge_andres.medina@uao.edu.co');
    await page.getByPlaceholder('Enter your password').fill('MedinaInge519');
    
    // AND: Da clic en el botón iniciar sesión
    await page.getByRole('button', { name: /Sign in/i }).click();
    
    // THEN: Da acceso al usuario y redirige al panel CDT
    await page.waitForURL('**/solicitudes', { timeout: 15000 });
    await expect(page).toHaveURL(/\/solicitudes/);
    await expect(page.getByRole('heading', { name: /MIS SOLICITUDES CDT/i })).toBeVisible();
  });

  test('Escenario: Login fallido', async ({ page }) => {
    // GIVEN: El usuario está en la ventana de login
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Sign in/i })).toBeVisible();
    
    // WHEN: Ingresa correo o contraseña incorrectos
    await page.getByPlaceholder('Enter your email').fill('incorrecto@test.com');
    await page.getByPlaceholder('Enter your password').fill('passwordIncorrecto');
    
    // AND: Hace clic en iniciar sesión
    await page.getByRole('button', { name: /Sign in/i }).click();
    
    // THEN: El sistema muestra el mensaje de error
    await expect(
      page.getByText(/Request failed with status code 401/i)
    ).toBeVisible({ timeout: 10000 });
  });
});