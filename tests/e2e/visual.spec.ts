import { expect, test } from '@playwright/test';

const PHONE_SIZES = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
] as const;

for (const size of PHONE_SIZES) {
  test(`all levels fit ${size.width}x${size.height} without page scrolling`, async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Campaign captures use Chromium touch emulation.');
    await page.setViewportSize(size);
    for (let level = 1; level <= 10; level += 1) {
      const id = String(level).padStart(2, '0');
      await page.goto(`/play/#/level/${id}?v=1`);
      await expect(page.locator('.harbor-scene canvas')).toBeVisible({ timeout: 15_000 });
      const firstPlayAction = level === 1
        ? page.getByRole('button', { name: 'Skip tutorial', exact: true })
        : page.getByRole('button', { name: 'Got it', exact: true });
      if (await firstPlayAction.isVisible()) await firstPlayAction.click();
      const metrics = await page.evaluate(() => ({
        horizontal: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        vertical: document.documentElement.scrollHeight - document.documentElement.clientHeight,
        actionBottom: document.querySelector('.touch-action-bar')?.getBoundingClientRect().bottom ?? 0,
        viewportHeight: window.innerHeight,
      }));
      expect(metrics.horizontal, `level ${id} has horizontal overflow`).toBeLessThanOrEqual(1);
      expect(metrics.vertical, `level ${id} has vertical overflow`).toBeLessThanOrEqual(1);
      expect(metrics.actionBottom, `level ${id} action bar is clipped`).toBeLessThanOrEqual(metrics.viewportHeight + 1);
      const targets = await page.locator('.level-one-touch-shell button:visible').evaluateAll((buttons) => buttons.map((button) => {
        const bounds = button.getBoundingClientRect();
        return { width: bounds.width, height: bounds.height, label: button.textContent?.trim() ?? '' };
      }));
      expect(targets.filter(({ width, height }) => width < 48 || height < 48), `level ${id} has undersized touch targets`).toEqual([]);
      await page.screenshot({ path: `release/qa/campaign/${size.width}x${size.height}/level-${id}.png` });
    }
  });
}

test('campaign controls fit with larger text', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'The larger text layout is checked once in Chromium.');
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/play/#/level/10?v=1');
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByLabel('Text size').selectOption('1.25');
  await page.getByRole('button', { name: 'Close settings' }).click();
  const help = page.getByRole('button', { name: 'Got it', exact: true });
  if (await help.isVisible()) await help.click();
  const overflow = await page.evaluate(() => ({
    horizontal: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    vertical: document.documentElement.scrollHeight - document.documentElement.clientHeight,
  }));
  expect(overflow).toEqual({ horizontal: 0, vertical: 0 });
  await expect(page.getByRole('button', { name: 'Go', exact: true })).toBeVisible();
});
