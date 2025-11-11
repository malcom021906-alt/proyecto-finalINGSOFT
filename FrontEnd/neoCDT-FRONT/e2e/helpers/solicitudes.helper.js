// e2e/helpers/solicitudes.helper.js
import { expect } from '@playwright/test';

/**
 * HELPER: Retry click con espera y manejo de errores
 */
async function retryClick(page, selector, options = {}) {
  const { timeout = 5000, retries = 3, delay = 1000 } = options;
  
  for (let i = 0; i < retries; i++) {
    try {
      const element = page.locator(selector).first();
      await element.waitFor({ state: 'visible', timeout });
      await element.click();
      return;
    } catch (e) {
      if (i === retries - 1) throw e;
      await page.waitForTimeout(delay);
    }
  }
}

/**
 * HELPER: Crear solicitud CDT
 */
export async function crearSolicitudCDT(page, { monto, plazo }) {
  // Click en Nueva Solicitud con retry
  await retryClick(page, 'button:has-text("+ Nueva Solicitud")');
  await expect(page.getByRole('heading', { name: /Nueva Solicitud/i })).toBeVisible();
  
  // Llenar formulario con retry
  await page.getByLabel(/Monto del CDT/i).fill(monto.toString());
  await page.getByLabel(/Plazo en meses/i).fill(plazo.toString());
  
  // Click en Crear con retry
  await retryClick(page, 'button:has-text("Crear Solicitud")');
  
  // Esperar diálogo y aceptar si aparece
  try {
    const dialog = await page.waitForEvent('dialog', { timeout: 5000 });
    await dialog.accept();
  } catch (e) {
    console.log('No se encontró diálogo, continuando...');
  }
  
  // Esperar a que se cierre el modal
  await page.waitForTimeout(1000);
}

/**
 * HELPER: Formatear monto según formato colombiano
 */
export function formatMonto(monto) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(monto);
}

/**
 * HELPER: Obtener fila de solicitud por monto
 */
export async function getSolicitudRowByMonto(page, monto, timeout = 10000) {
  const montoFormatted = formatMonto(monto);
  
  // Esperar a que la tabla se actualice
  await page.waitForTimeout(2000);
  
  // Buscar la fila con retry y timeout
  const row = page.locator('tr').filter({ hasText: montoFormatted }).first();
  try {
    await row.waitFor({ state: 'visible', timeout });
  } catch (e) {
    throw new Error(`No se encontró la solicitud con monto ${montoFormatted} después de ${timeout}ms`);
  }
  
  return row;
}

/**
 * HELPER: Enviar solicitud a validación
 */
export async function enviarAValidacion(page, monto) {
  const row = await getSolicitudRowByMonto(page, monto);
  await retryClick(page, `tr:has-text("${formatMonto(monto)}") button:has-text("Enviar")`);
  
  // Esperar actualización de estado
  await page.waitForTimeout(2000);
}

/**
 * HELPER: Verificar estado de solicitud
 */
export async function verificarEstado(page, monto, estadoEsperado, timeout = 10000) {
  const row = await getSolicitudRowByMonto(page, monto);
  await expect(row.getByText(estadoEsperado, { exact: false }))
    .toBeVisible({ timeout });
}

/**
 * HELPER: Editar solicitud
 */
export async function editarSolicitud(page, monto, nuevosDatos) {
  const row = await getSolicitudRowByMonto(page, monto);
  await retryClick(page, `tr:has-text("${formatMonto(monto)}") button:has-text("Editar")`);
  
  await expect(page.getByRole('heading', { name: /Editar Solicitud/i })).toBeVisible();
  
  if (nuevosDatos.monto) {
    const montoInput = page.getByLabel(/Monto del CDT/i);
    await montoInput.clear();
    await montoInput.fill(nuevosDatos.monto.toString());
  }
  
  if (nuevosDatos.plazo) {
    const plazoInput = page.getByLabel(/Plazo en meses/i);
    await plazoInput.clear();
    await plazoInput.fill(nuevosDatos.plazo.toString());
  }
  
  await retryClick(page, 'button:has-text("Actualizar")');
  await page.waitForTimeout(1000);
}

/**
 * HELPER: Cancelar solicitud
 */
export async function cancelarSolicitud(page, monto, razon = 'Cambio de planes') {
  const row = await getSolicitudRowByMonto(page, monto);
  await retryClick(page, `tr:has-text("${formatMonto(monto)}") button:has-text("Cancelar")`);
  
  // Si hay un diálogo de confirmación, aceptarlo
  try {
    const dialog = await page.waitForEvent('dialog', { timeout: 5000 });
    await dialog.accept();
  } catch (e) {
    console.log('No se encontró diálogo de confirmación, continuando...');
  }
  
  await page.waitForTimeout(1000);
}

/**
 * HELPER: Filtrar por estado
 */
export async function filtrarPorEstado(page, estado) {
  await page.getByRole('combobox').selectOption(estado);
  await retryClick(page, 'button:has-text("Aplicar")');
  await page.waitForTimeout(2000); // Esperar actualización de tabla
}