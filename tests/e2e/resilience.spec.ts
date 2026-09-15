import { expect, test } from '@playwright/test';

const openRobotRoutes = async (page: import('@playwright/test').Page): Promise<void> => {
  const skip = page.getByRole('button', { name: 'Skip tutorial', exact: true });
  if (await skip.isVisible()) await skip.click();
  await page.getByRole('button', { name: 'Select vehicle', exact: true }).click();
  await page.getByRole('button', { name: 'Parcel robot', exact: true }).click();
};

test('works offline after the first complete load', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Playwright supports service workers only in Chromium.');
  await page.goto('/play/#/level/10?v=1');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect(page.locator('.harbor-scene canvas')).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Harbor in Harmony' })).toBeVisible();
  await expect(page.locator('.harbor-scene canvas')).toBeVisible();
});

test('supports recovery, reveal cancellation, scenarios, and playback keys', async ({ page }) => {
  await page.goto('/play/#/level/10?v=1');
  await page.getByRole('button', { name: 'Garden path', exact: true }).click();
  await page.getByRole('button', { name: 'Reset puzzle' }).click();
  await page.getByRole('button', { name: 'Restore my plan' }).click();
  await expect(page.getByRole('button', { name: 'Garden path', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Hint', exact: true }).click({ clickCount: 3 });
  await page.getByRole('button', { name: 'Show the solution' }).click();
  await expect(page.getByRole('dialog', { name: 'Replace your plan with the solution?' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Replace your plan with the solution?' })).toBeHidden();
  await page.getByRole('button', { name: 'Quay path', exact: true }).click();
  await page.getByRole('button', { name: 'Test plan', exact: true }).click();
  for (const label of ['Normal day', 'Upper lane closed', 'Early bus']) {
    await expect(page.getByRole('tab', { name: new RegExp(`${label} Passed`) })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Compare original plan' }).click();
  await page.keyboard.press('Space');
  await page.keyboard.press('z');
  await page.keyboard.press('y');
});

test('notifies a stale tab before it can overwrite progress', async ({ page, context }) => {
  await page.goto('/play/#/level/01?v=1');
  const other = await context.newPage();
  await other.goto('/play/#/level/01?v=1');
  await openRobotRoutes(page);
  await page.getByRole('button', { name: 'Garden path', exact: true }).click();
  await other.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(other.getByRole('status').filter({ hasText: 'Newer save found' })).toBeVisible();
  await other.close();
});

test('exports, previews, and imports progress through settings', async ({ page }) => {
  await page.goto('/play/#/level/01?v=1');
  await openRobotRoutes(page);
  await page.getByRole('button', { name: 'Garden path', exact: true }).click();
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export progress' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  if (path === null) throw new Error('The progress download had no local path.');
  const json = await import('node:fs/promises').then(({ readFile }) => readFile(path, 'utf8'));
  await page.locator('input[type="file"]').setInputFiles({ name: 'ripple-progress.json', mimeType: 'application/json', buffer: Buffer.from(json) });
  await expect(page.getByText(/completed puzzles and resumes at level/i)).toBeVisible();
  await page.getByRole('button', { name: 'Replace with this save' }).click();
  await expect(page.getByText('Progress imported.')).toBeVisible();
});

test('makes no cross-origin application requests', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await page.goto('/play/#/level/10?v=1');
  await page.locator('.harbor-scene canvas').waitFor();
  expect([...origins]).toEqual(['http://127.0.0.1:4173']);
});
