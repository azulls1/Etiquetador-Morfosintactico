import { test, expect } from '@playwright/test';

/**
 * Mock all API calls so tests do not depend on a running backend.
 */
async function mockApiRoutes(page: import('@playwright/test').Page) {
  // Health check
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
        body: JSON.stringify({ tags: [], total_tokens: 0 }),
      });
    }

    // Default: return empty success
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'ok' }),
    });
  });

  // Root health endpoint
  await page.route('**/localhost:8000/', (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'ok' }),
    });
  });
}

test.describe('App Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page);
  });

  test('home page loads with dashboard content', async ({ page }) => {
    await page.goto('/');
    // Dashboard has the hero title
    await expect(page.getByText('Etiquetador Morfosintactico')).toBeVisible();
    // Has the subtitle
    await expect(page.getByText('HMM + Viterbi')).toBeVisible();
    // Has "Acciones Rapidas" section
    await expect(page.getByText('Acciones Rapidas')).toBeVisible();
  });

  test('navigate to Corpus page via sidebar', async ({ page }) => {
    await page.goto('/');
    // Click on "Corpus" link in the sidebar
    await page.getByRole('link', { name: 'Corpus' }).click();
    await expect(page).toHaveURL(/\/corpus/);
    // Verify corpus page content
    await expect(page.getByText('Gestion del Corpus')).toBeVisible({ timeout: 10000 });
  });

  test('navigate to Probabilities page via sidebar', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Probabilidades' }).click();
    await expect(page).toHaveURL(/\/probabilities/);
  });

  test('navigate to Viterbi page via sidebar', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Viterbi' }).click();
    await expect(page).toHaveURL(/\/viterbi/);
    await expect(page.getByText('Algoritmo de Viterbi')).toBeVisible();
  });

  test('navigate to Analysis page via sidebar', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Analisis' }).click();
    await expect(page).toHaveURL(/\/analysis/);
  });

  test('navigate to Eagles reference page via sidebar', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Etiquetas EAGLES' }).click();
    await expect(page).toHaveURL(/\/eagles/);
  });

  test('navigate to Exports page via sidebar', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Entregables' }).click();
    await expect(page).toHaveURL(/\/exports/);
  });

  test('dark mode toggle works', async ({ page }) => {
    await page.goto('/');

    // Initially should not have .dark class (default is light)
    await page.evaluate(() => localStorage.removeItem('theme'));
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Find the dark mode toggle button by its role="switch"
    const darkToggle = page.getByRole('switch');
    await expect(darkToggle).toBeVisible();

    // Verify initial state: no .dark on <html>
    const htmlHasDarkBefore = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(htmlHasDarkBefore).toBe(false);

    // Click the toggle to enable dark mode
    await darkToggle.click();

    // Verify .dark class is now on <html>
    const htmlHasDarkAfter = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(htmlHasDarkAfter).toBe(true);

    // localStorage should be updated
    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBe('dark');

    // Click again to toggle back to light
    await darkToggle.click();

    const htmlHasDarkFinal = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(htmlHasDarkFinal).toBe(false);

    const storedThemeFinal = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedThemeFinal).toBe('light');
  });
});
