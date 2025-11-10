// e2e/specs/HU-06-editar-solicitud.spec.js
import { test, expect } from '@playwright/test';
import { loginAsCliente, waitForAlert } from '../helpers/auth.helper.js';
import { crearSolicitudCDT, getSolicitudRowByMonto, editarSolicitud, enviarAValidacion } from '../helpers/solicitudes.helper.js';

test.describe('HU-06: Editar solicitud en borrador', () => {
  
  test.beforeEach(async ({ page }) => {
    await loginAsCliente(page);
  });

  test('Escenario: Edición permitida', async ({ page }) => {
    // GIVEN: Existe una solicitud en estado "Borrador"
    const montoInicial = 300000;
    const plazoInicial = 12;
    
    const alertPromise = waitForAlert(page);
    await crearSolicitudCDT(page, { monto: montoInicial, plazo: plazoInicial });
    await alertPromise;
    await page.waitForTimeout(2000);
    
    // Verificar estado Borrador
    const row = await getSolicitudRowByMonto(page, montoInicial);
    await expect(row.getByText('Borrador')).toBeVisible();
    
    // WHEN: El cliente modifica el campo "Plazo" a 60 días (≈ 2 meses)
    const nuevoPlazo = 2; // 2 meses ≈ 60 días
    
    const editAlertPromise = waitForAlert(page);
    await editarSolicitud(page, montoInicial, { plazo: nuevoPlazo });
    await editAlertPromise;
    await page.waitForTimeout(2000);
    
    // THEN: El sistema guarda los cambios
    await expect(page.getByRole('heading', { name: /Editar Solicitud/i })).not.toBeVisible();
    
    // AND: Mantiene la solicitud en estado "Borrador"
    await expect(row.getByText('Borrador')).toBeVisible();
    
    // AND: Plazo actualizado
    await expect(row.getByText(new RegExp(`${nuevoPlazo}.*meses`, 'i'))).toBeVisible();
  });

});