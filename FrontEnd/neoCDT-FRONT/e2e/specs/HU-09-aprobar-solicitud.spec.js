import { test, expect } from '@playwright/test';
import { loginAsCliente, loginAsAgente, waitForAlert } from '../helpers/auth.helper.js';
import { crearSolicitudCDT } from '../helpers/solicitudes.helper.js';

test.describe('HU-09: Aprobar solicitud en estado Borrador', () => {
  test('Escenario: El agente aprueba una solicitud que está en estado Borrador', async ({ browser }) => {
    const clienteContext = await browser.newContext();
    const agenteContext = await browser.newContext();
    const clientePage = await clienteContext.newPage();
    const agentePage = await agenteContext.newPage();

    try {
      // ===== PARTE 1: CLIENTE CREA SOLICITUD =====
      await loginAsCliente(clientePage);

      const monto = 2000000;
      const plazo = 12;

      const alertPromise = waitForAlert(clientePage);
      await crearSolicitudCDT(clientePage, { monto, plazo });
      await alertPromise;
      await clientePage.waitForTimeout(2000);

      // 🔸 No se envía a validación, queda en estado "Borrador"

      // ===== PARTE 2: AGENTE APRUEBA =====
      await loginAsAgente(agentePage);

      // Esperar a que cargue la tabla y verificar que hay al menos una solicitud en estado Borrador
      const estadoBorrador = agentePage.locator('span.estado', { hasText: 'Borrador' });
      await expect(estadoBorrador.first()).toBeVisible({ timeout: 10000 });

      await agentePage.waitForTimeout(3000);

      // WHEN: Hace clic en "Aprobar"
      const aprobarBtn = agentePage.getByRole('button', { name: /Aprobar/i }).first();
      await aprobarBtn.click();

      // Esperar modal de confirmación
      await expect(agentePage.getByText(/¿Estás seguro de aprobar/i)).toBeVisible({ timeout: 5000 });
      await agentePage.getByRole('button', { name: /Confirmar Aprobación/i }).click();

      // THEN: El sistema cambia el estado a "Aprobada"
      await expect(agentePage.getByText(/Solicitud aprobada/i)).toBeVisible({ timeout: 15000 });

      // AND: El cliente ve el estado actualizado
      await clientePage.reload();
      await clientePage.waitForTimeout(3000);

      const estadoAprobado = clientePage.locator('table >> text=Aprobada');
      await expect(estadoAprobado.first()).toBeVisible({ timeout: 10000 });

    } catch (error) {
      console.error('Error en la prueba HU-09:', error);
      throw error;
    } finally {
      if (!clientePage.isClosed()) await clienteContext.close();
      if (!agentePage.isClosed()) await agenteContext.close();
    }
  });
});
