import { mkdir, rename, rm } from 'node:fs/promises';
import { chromium, type Page } from '@playwright/test';

const BASE_URL = process.env.RIPPLE_PREVIEW_URL ?? 'http://127.0.0.1:4173';
const OUTPUT_DIRECTORY = 'release/qa/campaign/review';

const selectRobot = async (page: Page): Promise<void> => {
  await page.getByRole('button', { name: 'Choose vehicle', exact: true }).click();
  await page.getByRole('button', { name: /^Parcel robot/ }).click();
};

await mkdir(OUTPUT_DIRECTORY, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
  recordVideo: { dir: OUTPUT_DIRECTORY, size: { width: 390, height: 844 } },
});
const page = await context.newPage();
await page.goto(`${BASE_URL}/play/#/level/09?v=1`);
await page.locator('.harbor-scene canvas').waitFor();
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUTPUT_DIRECTORY}/level-09-tutorial-390x844.png` });
await page.getByRole('button', { name: 'Got it', exact: true }).click();
await page.waitForTimeout(500);

await selectRobot(page);
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUTPUT_DIRECTORY}/level-09-route-chooser-390x844.png` });
await page.getByRole('button', { name: /^Upper lane/ }).click();
await page.waitForTimeout(650);
await page.getByRole('button', { name: 'Go', exact: true }).click();
await page.getByRole('button', { name: 'Try again', exact: true }).waitFor({ timeout: 15_000 });
await page.screenshot({ path: `${OUTPUT_DIRECTORY}/level-09-failed-future-390x844.png` });
await page.waitForTimeout(1_100);

await page.getByRole('button', { name: 'Try again', exact: true }).click();
await selectRobot(page);
await page.getByRole('button', { name: /^Garden path/ }).click();
await page.waitForTimeout(700);
await page.getByRole('button', { name: 'Go', exact: true }).click();
await page.getByRole('button', { name: 'Next level', exact: true }).waitFor({ timeout: 15_000 });
await page.screenshot({ path: `${OUTPUT_DIRECTORY}/level-09-success-390x844.png` });
await page.waitForTimeout(1_200);

const recording = page.video();
await context.close();
if (recording !== null) {
  const target = `${OUTPUT_DIRECTORY}/campaign-failed-future-correction-390x844.webm`;
  await rm(target, { force: true });
  await rename(await recording.path(), target);
}
await browser.close();
console.log(`Captured campaign review evidence in ${OUTPUT_DIRECTORY}.`);
