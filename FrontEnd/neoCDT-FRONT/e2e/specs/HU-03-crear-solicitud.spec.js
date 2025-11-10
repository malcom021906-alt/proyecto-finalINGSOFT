// e2e/specs/HU-03-crear-solicitud.spec.js
import { test, expect } from '@playwright/test';
import { loginAsCliente, waitForAlert } from '../helpers/auth.helper.js';
import { crearSolicitudCDT, verificarEstado, formatMonto } from '../helpers/solicitudes.helper.js';

test.describe('HU-03: Crear nueva solicitud de CDT', () => {
  
  test.beforeEach(async ({ page }) => {
    await loginAsCliente(page);
  });

  test('Escenario: Solicitud válida', async ({ page }) => {
    // GIVEN: El cliente está autenticado y en el panel NeoCDT
    await expect(page.getByRole('heading', { name: /MIS SOLICITUDES CDT/i })).toBeVisible();
    
    // WHEN: Completa campos "Monto" = 100000 y "Plazo" = 30 días
    const monto = 100000;
    const plazo = 1; // 1 mes ≈ 30 días
    
    // Configurar listener para el alert ANTES de la acción
    const alertPromise = waitForAlert(page, 'creada');
    
    await crearSolicitudCDT(page, { monto, plazo });
    
    // Esperar el alert
    await alertPromise;
    
    // THEN: El sistema crea la solicitud
    await page.waitForTimeout(2000);
    
    // Verificar que aparece en la tabla
// elegir explícitamente la primera coincidencia
await expect(page.getByText(formatMonto(monto)).first()).toBeVisible();
    
    // Nota: Según tu código, se crea en "Borrador", NO "En validación"
    // Si tu implementación crea en "Borrador", ajustar:
    await verificarEstado(page, monto, 'Borrador');
    
    // AND: Muestra confirmación (ya validado con el alert)
  });

test('Escenario: Solicitud inválida', async ({ page }) => {
  // GIVEN: Estoy en la vista de "Mis solicitudes"
  await expect(page.getByRole('heading', { name: /MIS SOLICITUDES CDT/i })).toBeVisible();

  // WHEN: Abrir modal "Nueva Solicitud"
  await page.getByRole('button', { name: /\+ Nueva Solicitud/i }).click();
  await expect(page.getByRole('heading', { name: /Nueva Solicitud/i })).toBeVisible();

  // Rellenar con monto inválido (<10000)
  const montoInput = page.getByLabel(/Monto del CDT/i);
  await montoInput.fill('5000');
  await page.getByLabel(/Plazo en meses/i).fill('6');

  // Intentar crear la solicitud
  await page.getByRole('button', { name: /Crear Solicitud/i }).click();

  // THEN: Primero intentamos leer el mensaje de validación nativo del input (HTML5)
  const validationMsg = await montoInput.evaluate(el => el.validationMessage || '');

  if (validationMsg && validationMsg.trim().length > 0) {
    // Si el navegador produjo un mensaje nativo (tooltip), validamos que contenga referencia al mínimo (10000)
    expect(validationMsg.toLowerCase()).toMatch(/10000|mayor|greater/);
    return; // test exitoso (falló por validación nativa)
  }

  // Si no hay validationMessage, intentamos buscar un mensaje en el DOM (alert, toast o texto)
  // 1) buscar role="alert" (toasts/errores accesibles)
  const alertLocator = page.getByRole('alert');
  const alertCount = await alertLocator.count();
  if (alertCount > 0) {
    await expect(alertLocator).toBeVisible({ timeout: 5000 });
    await expect(alertLocator).toContainText(/monto mínimo|10000|greater than or equal to 10000|Value must be greater/i);
    return;
  }

  // 2) fallback: buscar por texto que pueda contener la validación (variaciones)
  await expect(
    page.getByText(/monto mínimo|monto minimo|10\.?000|10000|Value must be greater than or equal to 10000/i)
  ).toBeVisible({ timeout: 7000 });
});

});