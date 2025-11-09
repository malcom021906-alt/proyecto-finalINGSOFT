// e2e/specs/HU-09-aprobar-solicitud.spec.js
import { test, expect } from '@playwright/test';
import { loginAsCliente, loginAsAgente, waitForAlert } from '../helpers/auth.helper.js';
import { crearSolicitudCDT } from '../helpers/solicitudes.helper.js';

test.describe('HU-09: Aprobar solicitud en estado Borrador', () => {
  test('Escenario: El agente aprueba una solicitud que está en estado Borrador', async ({ browser }) => {
    // Crear contextos separados para cliente y agente
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
      // GIVEN: El agente ve una solicitud en estado "Borrador"
      await loginAsAgente(agentePage);

      // Esperar a que se cargue la lista de solicitudes (puedes ajustar el texto según tu interfaz)
      await expect(agentePage.getByText(/Borrador/i)).toBeVisible({ timeout: 10000 });
      await agentePage.waitForTimeout(3000);

      // WHEN: Hace clic en "Aprobar"
      const aprobarBtn = agentePage.getByRole('button', { name: /✅ Aprobar/i }).first();
      await aprobarBtn.click();

      // Esperar modal de confirmación
      await expect(agentePage.getByText(/¿Estás seguro de aprobar/i)).toBeVisible({ timeout: 5000 });
      await agentePage.getByRole('button', { name: /Confirmar Aprobación/i }).click();

      // THEN: El sistema cambia el estado a "Aprobada"
      await expect(agentePage.getByText(/Solicitud aprobada/i)).toBeVisible({ timeout: 15000 });

      // AND: Envía notificación al cliente
      await clientePage.reload();
      await clientePage.waitForTimeout(3000);
      await expect(clientePage.getByText(/Aprobada/i).first()).toBeVisible({ timeout: 10000 });

    } finally {
      await clienteContext.close();
      await agenteContext.close();
    }
  });
});
