import { test, expect } from '@playwright/test';

test('Escenario: Ver listado de solicitudes', async ({ page }) => {
  // GIVEN: Estoy en la vista "Mis solicitudes"
  await page.goto('/solicitudes'); // ajusta si tu test ya navega antes
  await expect(page.getByRole('heading', { name: /MIS SOLICITUDES CDT/i })).toBeVisible();

  // Esperamos un momento para que la página cargue datos (AJAX)
  // Si la tabla aparece, count > 0; si no aparece, revisamos el estado vacío.
  const tableLocator = page.locator('table');
  const tableCount = await tableLocator.count();

  if (tableCount > 0) {
    // Caso A: sí hay tabla(s) renderizada(s)
    const headerRow = tableLocator.locator('tr').first();
    await expect(headerRow).toBeVisible({ timeout: 5000 });

    // Validar títulos dentro de la primera fila (cabecera)
    await expect(headerRow.getByText(/ID/i)).toBeVisible();
    await expect(headerRow.getByText(/MONTO/i)).toBeVisible();
    await expect(headerRow.getByText(/PLAZO/i)).toBeVisible();
    await expect(headerRow.getByText(/TASA/i)).toBeVisible();
    await expect(headerRow.getByText(/ESTADO/i)).toBeVisible();
    await expect(headerRow.getByText(/FECHA DE CREACIÓN/i)).toBeVisible();
    await expect(headerRow.getByText(/ACCIONES/i)).toBeVisible();

    // Opcional: comprobar que hay al menos una fila de datos
    const firstDataRow = tableLocator.locator('tbody tr').first();
    await expect(firstDataRow).toBeVisible();
    await expect(firstDataRow.getByText(/\$/)).toBeVisible(); // valida que hay un monto en la fila
  } else {
    // Caso B: no hay tabla -> comprobar estado vacío en la UI
    // Buscamos exactamente el texto que muestra la UI. Ajusta la regex si tu texto varía.
    await expect(page.getByText(/Total:\s*0 solicitudes/i)).toBeVisible({ timeout: 5000 });

    // También puedes validar que los botones de paginación estén deshabilitados
    const prevBtn = page.getByRole('button', { name: /Anterior|← Anterior/i });
    if (await prevBtn.count() > 0) {
      await expect(prevBtn).toBeDisabled();
    }
  }
});
