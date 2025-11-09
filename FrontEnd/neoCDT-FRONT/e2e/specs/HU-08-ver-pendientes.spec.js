// e2e/specs/HU-08-ver-pendientes.spec.js
import { test, expect } from '@playwright/test';
import { loginAsAgente } from '../helpers/auth.helper.js';

test.describe('HU-08: Ver solicitudes pendientes', () => {
  test.beforeEach(async ({ page }) => {
    // Establecer estado inicial limpio
    await page.route('**/api/solicitudes**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([])
      });
    });
  });
  
  test('Escenario: Agente ve panel de solicitudes pendientes', async ({ page }) => {
    // GIVEN: El agente está autenticado en el panel de administración
    await loginAsAgente(page);
    
    // WHEN: Accede a la sección "Solicitudes pendientes"
    await expect(page.getByRole('heading', { name: /PANEL DE VALIDACIÓN/i }))
      .toBeVisible({ timeout: 10000 });
    
    // THEN: El sistema muestra un listado con solicitudes
    // Esperar primero que se carguen los datos
    await page.waitForResponse(
      response => response.url().includes('/api/solicitudes') && response.status() === 200,
      { timeout: 15000 }
    );
    
    // Verificar que existe la tabla y sus elementos
    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 10000 });
    
    // Verificar headers de la tabla
    const headers = [/Estado/i, /Monto/i, /Plazo/i, /Fecha/i];
    for (const header of headers) {
      await expect(
        page.getByRole('columnheader', { name: header })
      ).toBeVisible({ timeout: 5000 });
    }
    
    // Buscar solicitudes en validación
    const enValidacionBadges = page.getByText(/En validación/i);
    const count = await enValidacionBadges.count();
    
    if (count > 0) {
      // Si hay solicitudes, verificar que sean visibles y clicables
      const firstBadge = enValidacionBadges.first();
      await expect(firstBadge).toBeVisible({ timeout: 5000 });
      await expect(firstBadge).toBeEnabled();
      
      // Verificar que los botones de acción estén presentes
      const row = firstBadge.locator('..').locator('..'); // Subir al tr
      await expect(row.getByRole('button', { name: /Aprobar|Rechazar/i }))
        .toBeVisible({ timeout: 5000 });
    } else {
      // Si no hay solicitudes, debería haber un mensaje
      await expect(
        page.getByText(/No hay solicitudes pendientes|Sin solicitudes/i)
      ).toBeVisible({ timeout: 5000 });
    }
  });
  
  test('Escenario: Filtrar solicitudes por estado', async ({ page }) => {
    // GIVEN: El agente está en el panel de validación
    await loginAsAgente(page);
    await expect(page.getByRole('heading', { name: /PANEL DE VALIDACIÓN/i }))
      .toBeVisible({ timeout: 10000 });
      
    // WHEN: Filtra por estado "En validación"
    const filtroEstado = page.getByRole('combobox', { name: /Estado/i });
    await filtroEstado.selectOption({ label: /En validación/i });
    
    await page.getByRole('button', { name: /Aplicar/i }).click();
    
    // THEN: Solo se muestran solicitudes en ese estado
    await page.waitForResponse(
      response => response.url().includes('/api/solicitudes') && response.status() === 200,
      { timeout: 15000 }
    );
    
    const estadosBadges = page.getByText(/En validación/i);
    const count = await estadosBadges.count();
    
    if (count > 0) {
      // Verificar que todas las solicitudes visibles están en validación
      await expect(page.getByText(/Aprobada|Rechazada|Borrador/i)).not.toBeVisible();
    } else {
      await expect(
        page.getByText(/No hay solicitudes pendientes|Sin solicitudes/i)
      ).toBeVisible({ timeout: 5000 });
    }
  });
});