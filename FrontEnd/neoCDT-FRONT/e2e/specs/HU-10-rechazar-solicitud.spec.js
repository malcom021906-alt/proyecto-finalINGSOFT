import { test, expect } from '@playwright/test';
import { loginAsCliente, loginAsAgente, waitForAlert } from '../helpers/auth.helper.js';
import { crearSolicitudCDT, enviarAValidacion } from '../helpers/solicitudes.helper.js';

test.describe('HU-10: Rechazar solicitudes', () => {
  test('Escenario: Rechazar solicitud con razón', async ({ browser }) => {
    const clienteContext = await browser.newContext();
    const agenteContext = await browser.newContext();

    const clientePage = await clienteContext.newPage();
    const agentePage = await agenteContext.newPage();

    try {
      // ===== CLIENTE CREA SOLICITUD =====
      await loginAsCliente(clientePage);

      const monto = 1500000;
      const plazo = 6;

      const alertPromise = waitForAlert(clientePage);
      await crearSolicitudCDT(clientePage, { monto, plazo });
      await alertPromise;
      await clientePage.waitForTimeout(2000);

      await enviarAValidacion(clientePage, monto);
      await clientePage.waitForTimeout(2000);

      // ===== AGENTE RECHAZA =====
      await loginAsAgente(agentePage);
      await expect(agentePage.getByText(/PANEL DE VALIDACIÓN/i)).toBeVisible({ timeout: 10000 });

      await expect(agentePage.locator('table')).toBeVisible({ timeout: 10000 });

      const rechazarBtn = agentePage.getByRole('button', { name: /Rechazar/i }).first();
      await rechazarBtn.click();

      await expect(agentePage.getByText(/Motivo del rechazo/i)).toBeVisible({ timeout: 5000 });

      await agentePage.getByPlaceholder(/Ingresa el motivo/i).fill('Documentación inválida');

      await agentePage.getByRole('button', { name: /Confirmar rechazo/i }).click();

      await expect(agentePage.getByText(/Solicitud rechazada/i)).toBeVisible({ timeout: 15000 });

      // ===== CLIENTE VERIFICA =====
      await clientePage.reload();
      await clientePage.waitForTimeout(3000);

      // Buscar texto "Rechazada" en la tabla del cliente
      const estadoRechazado = clientePage.locator('table >> text=Rechazada');
      await expect(estadoRechazado.first()).toBeVisible({ timeout: 10000 });

    } catch (error) {
      console.error('Error en la prueba HU-10:', error);
      throw error;
    } finally {
      if (!clientePage.isClosed()) await clienteContext.close();
      if (!agentePage.isClosed()) await agenteContext.close();
    }
  });
});
