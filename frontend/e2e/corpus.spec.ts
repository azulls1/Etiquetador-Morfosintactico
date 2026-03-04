import { test, expect } from '@playwright/test';

/**
 * Mock API calls so Corpus tests do not require a running backend.
 */
async function mockApiRoutes(page: import('@playwright/test').Page) {
  await page.route('**/api/**', (route) => {
    const url = route.request().url();

    if (url.includes('/corpus/stats')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          is_loaded: true,
          total_tokens: 50000,
          total_sentences: 2500,
          total_documents: 100,
          unique_tags: 85,
          unique_words: 12000,
          processed_files: 100,
        }),
      });
    }

    if (url.includes('/corpus/distribution')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tags: [
            { tag: 'NCMS000', count: 5000, percentage: 10.0 },
            { tag: 'SPS00', count: 4000, percentage: 8.0 },
            { tag: 'DA0MS0', count: 3500, percentage: 7.0 },
          ],
          total_tokens: 50000,
        }),
      });
    }

    if (url.includes('/corpus/search')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          word: 'casa',
          total_occurrences: 42,
          tags: { NCFS000: 38, VMIP3S0: 4 },
        }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'ok' }),
    });
  });

  await page.route('**/localhost:8000/', (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'ok' }),
    });
  });
}

test.describe('Corpus Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page);
  });

  test('page loads with tabs', async ({ page }) => {
    await page.goto('/corpus');

    // Page heading
    await expect(page.getByRole('heading', { name: /Gestion del Corpus/i })).toBeVisible({ timeout: 10000 });

    // All four tabs should be visible
    await expect(page.getByRole('button', { name: 'Carga del Corpus' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Estad/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Explorador de Palabras/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Distribuci/i })).toBeVisible();
  });

  test('can switch to Statistics tab', async ({ page }) => {
    await page.goto('/corpus');

    // Click on "Estadisticas" tab
    await page.getByRole('button', { name: /Estad/i }).click();

    // Should show stat cards (corpus is loaded per mock)
    await expect(page.getByText('Tokens totales')).toBeVisible({ timeout: 10000 });
  });

  test('can switch to Search tab and see input field', async ({ page }) => {
    await page.goto('/corpus');

    // Click on "Explorador de Palabras" tab
    await page.getByRole('button', { name: /Explorador de Palabras/i }).click();

    // The search section should be visible
    await expect(page.getByText('Buscar Palabra')).toBeVisible();

    // There should be a search input
    const searchInput = page.getByPlaceholder(/Ingrese una palabra/i);
    await expect(searchInput).toBeVisible();

    // There should be a "Buscar" button
    await expect(page.getByRole('button', { name: 'Buscar' })).toBeVisible();
  });

  test('can switch to Distribution tab', async ({ page }) => {
    await page.goto('/corpus');

    // Click on "Distribucion de Etiquetas" tab
    await page.getByRole('button', { name: /Distribuci/i }).click();

    // Should show the distribution heading
    await expect(page.getByText(/Distribuci.*Etiquetas/i)).toBeVisible({ timeout: 10000 });
  });

  test('Upload tab has process button', async ({ page }) => {
    await page.goto('/corpus');

    // Default tab is "Carga del Corpus" (index 0)
    await expect(page.getByText('Procesar Corpus')).toBeVisible();

    // The "Iniciar Procesamiento" button should be visible
    await expect(page.getByRole('button', { name: /Iniciar Procesamiento/i })).toBeVisible();
  });
});
