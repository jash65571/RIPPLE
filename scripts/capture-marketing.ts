import { mkdir, rename, rm } from 'node:fs/promises';
import { chromium, type Page } from '@playwright/test';

const BASE_URL = process.env.RIPPLE_PREVIEW_URL ?? 'http://127.0.0.1:4173';
const VIDEO_SIZES = [
  { name: 'trailer-15s', seconds: 15 },
  { name: 'trailer-30s', seconds: 30 },
] as const;

const openPuzzle = async (page: Page, id: string): Promise<void> => {
  await page.goto(`${BASE_URL}/play/#/level/${id}?v=1`);
  await page.locator('.harbor-scene canvas').waitFor();
};

const dismissTutorial = async (page: Page): Promise<void> => {
  const button = page.getByRole('button', { name: 'Got it' });
  if (await button.isVisible()) await button.click();
};

const dismissNotice = async (page: Page): Promise<void> => {
  const button = page.getByRole('button', { name: 'Dismiss' });
  if (await button.isVisible()) await button.click();
};

const prepareCapture = async (page: Page): Promise<void> => {
  await dismissTutorial(page);
  await dismissNotice(page);
};

const showCaption = async (page: Page, caption: string): Promise<void> => {
  await page.evaluate((text) => {
    const browser = globalThis as unknown as {
      readonly document: {
        querySelector(selector: string): { remove(): void } | null;
        createElement(tagName: string): { dataset: Record<string, string>; textContent: string; style: Record<string, string> };
        body: { append(element: unknown): void };
      };
    };
    browser.document.querySelector('[data-capture-caption]')?.remove();
    const element = browser.document.createElement('div');
    element.dataset.captureCaption = 'true';
    element.textContent = text;
    Object.assign(element.style, {
      position: 'fixed', left: '50%', bottom: '26px', zIndex: '1000', transform: 'translateX(-50%)',
      maxWidth: 'min(900px, calc(100vw - 48px))', padding: '14px 22px', borderRadius: '16px',
      background: 'rgba(21, 31, 43, 0.94)', color: '#ffffff', font: '700 24px/1.3 system-ui',
      textAlign: 'center', boxShadow: '0 8px 28px rgba(0, 0, 0, 0.3)'
    });
    browser.document.body.append(element);
  }, caption);
};

await mkdir('public/marketing', { recursive: true });
await mkdir('release/marketing', { recursive: true });
await mkdir('release/marketing/video-source', { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
await openPuzzle(page, '10');
await prepareCapture(page);
const board = await page.locator('.board-panel').boundingBox();
if (board === null) throw new Error('The harbor board was not visible for capture.');
await page.screenshot({ path: 'public/marketing/harbor-hero.png', clip: { x: Math.max(0, board.x - 8), y: board.y, width: 800, height: 640 } });
await page.screenshot({ path: 'release/marketing/screenshot-level-10-desktop.png', fullPage: true });
await page.getByRole('button', { name: 'Parcel robot', exact: true }).click();
await page.getByRole('button', { name: 'Next event', exact: true }).click();
await page.screenshot({ path: 'release/marketing/screenshot-inspection-desktop.png', fullPage: true });
await page.getByRole('button', { name: 'Upper lane', exact: true }).nth(0).click();
await page.getByRole('button', { name: 'Upper lane', exact: true }).nth(1).click();
await page.getByRole('button', { name: 'Test plan', exact: true }).click();
await page.screenshot({ path: 'release/marketing/screenshot-multiple-futures-desktop.png', fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await openPuzzle(page, '07');
await prepareCapture(page);
await page.screenshot({ path: 'release/marketing/screenshot-level-07-phone.png', fullPage: true });
await page.setViewportSize({ width: 1440, height: 1000 });
await openPuzzle(page, '01');
await prepareCapture(page);
await page.getByRole('button', { name: 'Test plan', exact: true }).click();
await page.screenshot({ path: 'release/marketing/screenshot-causal-delay-desktop.png', fullPage: true });
await page.setViewportSize({ width: 1080, height: 1080 });
await openPuzzle(page, '06');
await prepareCapture(page);
await page.locator('.play-layout').scrollIntoViewIfNeeded();
await page.screenshot({ path: 'release/marketing/promo-square-1080.png' });
await page.setViewportSize({ width: 1080, height: 1920 });
await openPuzzle(page, '07');
await prepareCapture(page);
await page.screenshot({ path: 'release/marketing/promo-portrait-1080x1920.png' });
await page.setViewportSize({ width: 1200, height: 630 });
await openPuzzle(page, '09');
await prepareCapture(page);
await page.locator('.play-layout').scrollIntoViewIfNeeded();
await page.screenshot({ path: 'release/marketing/promo-wide-1200x630.png' });
await page.setViewportSize({ width: 1600, height: 900 });
await openPuzzle(page, '03');
await prepareCapture(page);
await page.locator('.play-layout').scrollIntoViewIfNeeded();
await page.screenshot({ path: 'release/marketing/promo-wide-1600x900.png' });

for (const video of process.env.RIPPLE_SKIP_VIDEO === '1' ? [] : VIDEO_SIZES) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: 'release/marketing/video-source', size: { width: 1280, height: 720 } } });
  const videoPage = await context.newPage();
  await openPuzzle(videoPage, video.name === 'trailer-15s' ? '01' : '10');
  await prepareCapture(videoPage);
  if (video.name === 'trailer-15s') {
    await showCaption(videoPage, 'Watch the delay reach the parcel robot.');
    await videoPage.getByRole('button', { name: 'Test plan', exact: true }).click();
    await videoPage.waitForTimeout(3500);
    await showCaption(videoPage, 'Change the bus to Garden path.');
    await videoPage.getByRole('button', { name: 'Garden path', exact: true }).click();
    await videoPage.waitForTimeout(3000);
    await showCaption(videoPage, 'Test again. The whole morning clears.');
    await videoPage.getByRole('button', { name: 'Test plan', exact: true }).click();
    await videoPage.waitForTimeout(7250);
  } else {
    await showCaption(videoPage, 'One plan must survive three possible days.');
    await videoPage.waitForTimeout(4000);
    await videoPage.getByRole('button', { name: 'Upper lane', exact: true }).nth(0).click();
    await videoPage.getByRole('button', { name: 'Upper lane', exact: true }).nth(1).click();
    await showCaption(videoPage, 'It passes two days, but the closure still fails.');
    await videoPage.getByRole('button', { name: 'Test plan', exact: true }).click();
    await videoPage.waitForTimeout(6500);
    await videoPage.getByRole('tab', { name: /Upper lane closed/ }).click();
    await videoPage.waitForTimeout(3500);
    await showCaption(videoPage, 'Move off the closed lane and use the quay.');
    await videoPage.getByRole('button', { name: 'Garden path', exact: true }).click();
    await videoPage.getByRole('button', { name: 'Quay path', exact: true }).click();
    await videoPage.waitForTimeout(3500);
    await videoPage.getByRole('button', { name: 'Test plan', exact: true }).click();
    await showCaption(videoPage, 'Watch the delay. Change the plan.');
    await videoPage.waitForTimeout(11000);
  }
  const recording = videoPage.video();
  await context.close();
  if (recording !== null) {
    const target = `release/marketing/${video.name}.webm`;
    await rm(target, { force: true });
    await rename(await recording.path(), target);
  }
}

await browser.close();
console.log(process.env.RIPPLE_SKIP_VIDEO === '1' ? 'Captured gameplay screenshots and promo images.' : 'Captured gameplay screenshots, promo images, and two WebM trailer sources.');
