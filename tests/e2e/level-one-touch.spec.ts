import { expect, test, type Browser } from '@playwright/test';

const PHONE_SIZES = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
] as const;

const dismissOfflineNotice = async (page: import('@playwright/test').Page): Promise<void> => {
  const dismiss = page.getByRole('button', { name: 'Dismiss', exact: true });
  if (await dismiss.isVisible()) await dismiss.click();
};

const openTouchPage = async (browser: Browser, size: typeof PHONE_SIZES[number]) => {
  const context = await browser.newContext({ viewport: size, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await page.goto('/play/#/level/01?v=1');
  await dismissOfflineNotice(page);
  return { context, page };
};

test('Level 1 fits portrait touch screens without page scrolling', async ({ browser, browserName }) => {
  test.skip(browserName !== 'chromium', 'Chromium provides the touch emulation used for exact portrait checks.');
  for (const size of PHONE_SIZES) {
    const { context, page } = await openTouchPage(browser, size);
    await expect(page.locator('.harbor-scene canvas')).toBeVisible();
    const metrics = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      height: document.documentElement.scrollHeight - document.documentElement.clientHeight,
      touchPoints: navigator.maxTouchPoints,
      coarse: matchMedia('(pointer: coarse)').matches,
    }));
    expect(metrics.width).toBeLessThanOrEqual(1);
    expect(metrics.height).toBeLessThanOrEqual(1);
    expect(metrics.touchPoints).toBeGreaterThan(0);
    expect(metrics.coarse).toBe(true);
    const targets = await page.locator('button:visible').evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect()).map(({ width, height }) => ({ width, height })));
    expect(targets.every(({ width, height }) => width >= 48 && height >= 48)).toBe(true);
    await context.close();
  }
});

test('the robot can be selected directly from the harbor', async ({ browser, browserName }) => {
  test.skip(browserName !== 'chromium', 'Chromium provides the touch emulation used for direct model selection.');
  const { context, page } = await openTouchPage(browser, PHONE_SIZES[1]);
  await expect(page.locator('.harbor-scene canvas')).toBeVisible();
  await page.waitForTimeout(300);
  await page.touchscreen.tap(123, 338);
  await expect(page.getByRole('heading', { name: 'Choose a route' })).toBeVisible();
  await context.close();
});

test('first play teaches the conflict, preserves a retry, and saves completion', async ({ browser, browserName }) => {
  test.skip(browserName !== 'chromium', 'The first-play story is recorded against the Chromium touch implementation.');
  test.setTimeout(35_000);
  const { context, page } = await openTouchPage(browser, PHONE_SIZES[1]);
  await page.getByRole('button', { name: 'Go', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Select robot', exact: true })).toBeVisible({ timeout: 8_000 });
  await page.getByRole('button', { name: 'Select robot', exact: true }).click();
  await page.getByRole('button', { name: 'Market crossing', exact: true }).click();
  await page.getByRole('button', { name: 'Go', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Try again', exact: true })).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await page.getByRole('button', { name: 'Garden path', exact: true }).click();
  await page.getByRole('button', { name: 'Go', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Next level', exact: true })).toBeVisible({ timeout: 8_000 });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Skip tutorial', exact: true })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Go', exact: true })).toBeVisible();
  await context.close();
});

test('an interrupted tutorial reloads at a safe teaching step', async ({ browser, browserName }) => {
  test.skip(browserName !== 'chromium', 'The interrupted touch story is checked once in Chromium.');
  test.setTimeout(20_000);
  const { context, page } = await openTouchPage(browser, PHONE_SIZES[0]);
  await page.getByRole('button', { name: 'Go', exact: true }).click();
  await page.waitForTimeout(500);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Go', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Go', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Select robot', exact: true })).toBeVisible({ timeout: 8_000 });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Select robot', exact: true })).toBeVisible();
  await context.close();
});
