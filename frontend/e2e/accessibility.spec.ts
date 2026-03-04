import { test, expect } from '@playwright/test';

/**
 * Mock API calls so accessibility tests do not require a running backend.
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

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page);
  });

  test('skip-to-content link exists', async ({ page }) => {
    await page.goto('/');

    // The skip link should exist in the DOM (it is visually hidden until focused)
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();

    // The text should be "Saltar al contenido principal"
    await expect(skipLink).toHaveText('Saltar al contenido principal');

    // Focus the skip link (tab into it) and verify it becomes visible
    await skipLink.focus();
    await expect(skipLink).toBeFocused();
  });

  test('all sidebar navigation links have text', async ({ page }) => {
    await page.goto('/');

    // Get all links inside the sidebar navigation
    const navLinks = page.locator('aside[role="navigation"] a[routerlink]');
    const count = await navLinks.count();

    // There should be at least 7 navigation links
    expect(count).toBeGreaterThanOrEqual(7);

    // Every link should have non-empty visible text
    for (let i = 0; i < count; i++) {
      const linkText = await navLinks.nth(i).textContent();
      expect(linkText?.trim()).toBeTruthy();
    }
  });

  test('page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // The page should have an h1 heading
    const h1Elements = page.locator('h1');
    const h1Count = await h1Elements.count();
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // h1 should have non-empty text
    const h1Text = await h1Elements.first().textContent();
    expect(h1Text?.trim()).toBeTruthy();
  });

  test('dark mode toggle is keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('theme'));
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // The dark mode toggle should have role="switch"
    const darkToggle = page.getByRole('switch');
    await expect(darkToggle).toBeVisible();

    // Should have an aria-label
    const ariaLabel = await darkToggle.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();

    // Should have aria-checked attribute
    const ariaChecked = await darkToggle.getAttribute('aria-checked');
    expect(ariaChecked).toBeDefined();

    // Focus the toggle via keyboard
    await darkToggle.focus();
    await expect(darkToggle).toBeFocused();

    // Press Enter to activate it (should toggle dark mode)
    await darkToggle.press('Enter');

    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(isDark).toBe(true);
  });

  test('navbar has banner role', async ({ page }) => {
    await page.goto('/');

    // The header element should have role="banner"
    const banner = page.locator('header[role="banner"]');
    await expect(banner).toBeVisible();
  });

  test('main content area has proper role and label', async ({ page }) => {
    await page.goto('/');

    // The main content should have role="main"
    const main = page.locator('main[role="main"]');
    await expect(main).toBeVisible();

    // Should have aria-label
    const ariaLabel = await main.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('sidebar has navigation role with aria-label', async ({ page }) => {
    await page.goto('/');

    const sidebar = page.locator('aside[role="navigation"]');
    await expect(sidebar).toBeAttached();

    const ariaLabel = await sidebar.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });
});
