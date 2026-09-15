import { expect, test } from '@playwright/test';

const layouts = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 1000 },
] as const;

for (const layout of layouts) {
  test(`all levels fit the ${layout.name} layout`, async ({ page, browserName }) => {
    await page.setViewportSize({ width: layout.width, height: layout.height });
    for (let level = 1; level <= 10; level += 1) {
      const id = String(level).padStart(2, '0');
      await page.goto(`/play/#/level/${id}?v=1`);
      await expect(page.locator('.harbor-scene canvas')).toBeVisible({ timeout: 15_000 });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `level ${id} has horizontal overflow`).toBeLessThanOrEqual(1);
      if (browserName === 'chromium') {
        await page.screenshot({ path: `release/qa/${layout.name}/level-${id}.png`, fullPage: true });
      }
    }
  });
}
