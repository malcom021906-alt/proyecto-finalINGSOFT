// e2e/specs/HU-10-rechazar-solicitud.spec.js
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
      // GIVEN: El agente identifica datos incompletos en la solicitud
      await loginAsAgente(agentePage);
      await expect(agentePage.getByText(/PANEL DE VALIDACIÓN/i)).toBeVisible();
      await agentePage.waitForTimeout(4000);
      
      // WHEN: Hace clic en "Rechazar"
      const rechazarBtn = agentePage.getByRole('button', { name: /❌ Rechazar/i }).first();
      await rechazarBtn.click();
      
      // Esperar modal de rechazo
      await expect(agentePage.getByText(/Motivo del rechazo/i)).toBeVisible({ timeout: 5000 });
      
      // AND: Ingresa la razón "Documentación inválida"
      await agentePage.getByPlaceholder(/Ingresa el motivo/i).fill('Documentación inválida');
      
      // AND: Confirma
      await agentePage.getByRole('button', { name: /Confirmar Rechazo/i }).click();
      
      // THEN: El sistema cambia el estado a "Rechazada"
      await expect(agentePage.getByText(/Solicitud rechazada/i)).toBeVisible({ timeout: 15000 });
      
      // AND: Guarda la razón (verificado en backend)
      // AND: Notifica al cliente
      await clientePage.reload();
      await clientePage.waitForTimeout(3000);
      await expect(clientePage.getByText(/Rechazada/i).first()).toBeVisible({ timeout: 10000 });
      
    } finally {
      await clienteContext.close();
      await agenteContext.close();
    }
  });
});