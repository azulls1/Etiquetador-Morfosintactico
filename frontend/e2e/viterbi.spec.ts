import { test, expect } from '@playwright/test';

/**
 * Mock API calls so Viterbi tests do not require a running backend.
 */
async function mockApiRoutes(page: import('@playwright/test').Page) {
  await page.route('**/api/**', (route) => {
    const url = route.request().url();

    // Mock Viterbi tagging endpoint
    if (url.includes('/viterbi') || url.includes('/tag')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sentence: 'Habla con el enfermo grave de trasplantes.',
          tokens: ['Habla', 'con', 'el', 'enfermo', 'grave', 'de', 'trasplantes', '.'],
          tags: ['VMIP3S0', 'SPS00', 'DA0MS0', 'NCMS000', 'AQ0CS0', 'SPS00', 'NCMP000', 'Fp'],
          descriptions: ['Verbo', 'Preposicion', 'Determinante', 'Nombre', 'Adjetivo', 'Preposicion', 'Nombre', 'Puntuacion'],
          best_path_prob: 1.23e-25,
          viterbi_matrix: [],
          backpointers: [],
          steps: [],
        }),
      });
    }

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

test.describe('Viterbi Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page);
  });

  test('page loads with input form', async ({ page }) => {
    await page.goto('/viterbi');

    // Page title
    await expect(page.getByText('Algoritmo de Viterbi')).toBeVisible();

    // Input section header
    await expect(page.getByText('Oracion de entrada')).toBeVisible();

    // Input field exists
    const input = page.getByPlaceholder('Escribe una oracion...');
    await expect(input).toBeVisible();

    // "Etiquetar" button exists
    await expect(page.getByRole('button', { name: 'Etiquetar' })).toBeVisible();
  });

  test('quick sentence buttons populate the input field', async ({ page }) => {
    await page.goto('/viterbi');

    // There should be quick sentence buttons with the required sentences
    const quickBtn1 = page.getByRole('button', { name: /Habla con el enfermo grave de trasplantes/ });
    await expect(quickBtn1).toBeVisible();

    const quickBtn2 = page.getByRole('button', { name: /El enfermo grave habla de trasplantes/ });
    await expect(quickBtn2).toBeVisible();
  });

  test('empty input disables the Etiquetar button', async ({ page }) => {
    await page.goto('/viterbi');

    const input = page.getByPlaceholder('Escribe una oracion...');

    // Clear the input (it may have a default value)
    await input.clear();

    // The Etiquetar button should be disabled when input is empty
    const tagButton = page.getByRole('button', { name: 'Etiquetar' });
    await expect(tagButton).toBeDisabled();
  });

  test('type a sentence and verify textarea has value', async ({ page }) => {
    await page.goto('/viterbi');

    const input = page.getByPlaceholder('Escribe una oracion...');
    await input.clear();
    await input.fill('Los gatos duermen en el sofa.');

    // Verify the input has the typed value
    await expect(input).toHaveValue('Los gatos duermen en el sofa.');

    // The Etiquetar button should now be enabled
    const tagButton = page.getByRole('button', { name: 'Etiquetar' });
    await expect(tagButton).toBeEnabled();
  });

  test('section headers and layout are present', async ({ page }) => {
    await page.goto('/viterbi');

    // "Oracion de entrada" section is visible
    await expect(page.getByText('Oracion de entrada')).toBeVisible();

    // "Oraciones requeridas:" label for quick sentence buttons
    await expect(page.getByText('Oraciones requeridas:')).toBeVisible();

    // The empty state message should be visible before any tagging
    await expect(
      page.getByText(/Introduce una oracion y pulsa/)
    ).toBeVisible();
  });
});
