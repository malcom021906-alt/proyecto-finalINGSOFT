// e2e/specs/HU-08-ver-pendientes.spec.js
import { test, expect } from '@playwright/test';
import { loginAsAgente } from '../helpers/auth.helper.js';

test.describe('HU-08: Ver solicitudes pendientes', () => {
  async function mockSolicitudes(page) {
    const mockData = [
      {
        id: 'mock-001',
        cliente: 'Neo CDT',
        monto: 200000,
        plazo: 3,
        tasa: 5.2,
        estado: 'En validación',
        fecha: '2025-11-09',
      },
      {
        id: 'mock-002',
        cliente: 'Banco Test',
        monto: 500000,
        plazo: 6,
        tasa: 5.4,
        estado: 'Aprobada',
        fecha: '2025-11-08',
      },
    ];

    // ✅ Interceptar la URL real que usa el front
    await page.route('**/solicitudes/agente/pendientes**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData),
      });
    });
  }

  // -------------------------------------------------------
  // Escenario 1: Ver panel de solicitudes pendientes
  // -------------------------------------------------------
  test('Escenario: Agente ve panel de solicitudes pendientes', async ({ page }) => {
    await loginAsAgente(page);
    await mockSolicitudes(page);

    // Esperar heading principal
    await expect(page.getByText(/PANEL DE VALIDACIÓN/i)).toBeVisible({ timeout: 10000 });

    // Esperar a que la tabla cargue
    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 10000 });

    // Verificar que las columnas básicas existan (sin roles)
    const headers = ['Estado', 'Monto', 'Plazo', 'Fecha'];
    for (const header of headers) {
      await expect(page.locator(`table >> text=${header}`)).toBeVisible();
    }

    // Buscar solicitudes "En validación"
    const enValidacion = page.locator('table >> text=/En validación/i');
    const count = await enValidacion.count();

    if (count > 0) {
      const first = enValidacion.first();
      await expect(first).toBeVisible();
      const row = first.locator('..').locator('..');
      await expect(row.locator('button:has-text("Aprobar")')).toBeVisible();
      await expect(row.locator('button:has-text("Rechazar")')).toBeVisible();
    } else {
      await expect(page.getByText(/No hay solicitudes pendientes|Sin solicitudes/i))
        .toBeVisible({ timeout: 5000 });
    }
  });

  // -------------------------------------------------------
  // Escenario 2: Filtrar solicitudes por estado
  // -------------------------------------------------------
  test('Escenario: Filtrar solicitudes por estado', async ({ page }) => {
    await loginAsAgente(page);
    await mockSolicitudes(page);

    await expect(page.getByText(/PANEL DE VALIDACIÓN/i)).toBeVisible({ timeout: 10000 });

    // Seleccionar opción exacta
    const filtroEstado = page.locator('select'); // más genérico y seguro
    await filtroEstado.selectOption('En validación');
    await page.getByText(/Aplicar Filtros/i).click();

    // Esperar que la tabla se actualice
    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 10000 });

    // Verificar solo "En validación"
    const estados = page.locator('table >> text=/En validación/i');
    const count = await estados.count();

    if (count > 0) {
      await expect(page.locator('table >> text=/Aprobada|Rechazada|Borrador/i')).toHaveCount(0);
    } else {
      await expect(page.getByText(/No hay solicitudes pendientes|Sin solicitudes/i))
        .toBeVisible({ timeout: 5000 });
    }
  });
});
