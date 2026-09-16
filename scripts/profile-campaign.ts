import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const BASE_URL = process.env.RIPPLE_PREVIEW_URL ?? 'http://127.0.0.1:4173';
const PHONE_SIZES = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
] as const;

const browser = await chromium.launch({ channel: 'chrome' });
const browserVersion = browser.version();
const samples = [];
const coldLoads = [];
let environment: Record<string, unknown> | undefined;

for (const size of PHONE_SIZES) {
  const context = await browser.newContext({ viewport: size, hasTouch: true, isMobile: true, deviceScaleFactor: 1, serviceWorkers: 'block' });
  const page = await context.newPage();
  for (let levelNumber = 1; levelNumber <= 10; levelNumber += 1) {
    const levelId = String(levelNumber).padStart(2, '0');
    await page.goto(`${BASE_URL}/play/?profile=${size.width}-${levelId}#/level/${levelId}?v=1`);
    await page.locator('.harbor-scene canvas').waitFor();
    await page.waitForTimeout(1_250);
    const sample = await page.evaluate(() => {
      type TimingEntry = { transferSize: number; encodedBodySize: number; decodedBodySize: number };
      const runtime = globalThis as unknown as {
        document: { querySelector(selector: string): { dataset: Record<string, string | undefined> } | null; documentElement: { scrollWidth: number; clientWidth: number; scrollHeight: number; clientHeight: number } };
        performance: { getEntriesByType(type: string): TimingEntry[] };
      };
      const scene = runtime.document.querySelector('[data-draw-calls]');
      const entries = runtime.performance.getEntriesByType('resource');
      const navigation = runtime.performance.getEntriesByType('navigation')[0];
      return {
        fps: Number(scene?.dataset.fps ?? 0),
        frameMs: Number(scene?.dataset.frameMs ?? 0),
        drawCalls: Number(scene?.dataset.drawCalls ?? 0),
        triangles: Number(scene?.dataset.triangles ?? 0),
        transferBytes: entries.reduce((total, entry) => total + entry.transferSize, navigation?.transferSize ?? 0),
        encodedBytes: entries.reduce((total, entry) => total + entry.encodedBodySize, navigation?.encodedBodySize ?? 0),
        decodedBytes: entries.reduce((total, entry) => total + entry.decodedBodySize, navigation?.decodedBodySize ?? 0),
        overflowX: runtime.document.documentElement.scrollWidth - runtime.document.documentElement.clientWidth,
        overflowY: runtime.document.documentElement.scrollHeight - runtime.document.documentElement.clientHeight,
      };
    });
    samples.push({ levelId, ...size, ...sample });

    if (environment === undefined) {
      environment = await page.evaluate(() => {
        type RendererInfo = { UNMASKED_VENDOR_WEBGL: number; UNMASKED_RENDERER_WEBGL: number };
        type GraphicsContext = { getExtension(name: string): RendererInfo | null; getParameter(parameter: number): unknown };
        const runtime = globalThis as unknown as {
          document: { querySelector(selector: string): { getContext(type: string): GraphicsContext | null } | null };
          navigator: { userAgent: string; hardwareConcurrency: number; deviceMemory?: number; maxTouchPoints: number };
        };
        const canvas = runtime.document.querySelector('canvas');
        const context = canvas?.getContext('webgl2') ?? canvas?.getContext('webgl');
        const extension = context?.getExtension('WEBGL_debug_renderer_info');
        return {
          userAgent: runtime.navigator.userAgent,
          hardwareConcurrency: runtime.navigator.hardwareConcurrency,
          deviceMemoryGiB: runtime.navigator.deviceMemory ?? null,
          webglVendor: context != null && extension != null ? context.getParameter(extension.UNMASKED_VENDOR_WEBGL) : 'unavailable',
          webglRenderer: context != null && extension != null ? context.getParameter(extension.UNMASKED_RENDERER_WEBGL) : 'unavailable',
          touchPoints: runtime.navigator.maxTouchPoints,
        };
      });
    }
  }
  await context.close();
}

for (const levelId of ['01', '10']) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, serviceWorkers: 'block' });
  const page = await context.newPage();
  const session = await context.newCDPSession(page);
  await session.send('Network.enable');
  await session.send('Network.setCacheDisabled', { cacheDisabled: true });
  await page.goto(`${BASE_URL}/play/?cold=${levelId}-${Date.now()}#/level/${levelId}?v=1`);
  await page.locator('.harbor-scene canvas').waitFor();
  coldLoads.push(await page.evaluate((id) => {
    type TimingEntry = { transferSize: number; encodedBodySize: number; decodedBodySize: number };
    const runtime = globalThis as unknown as { performance: { getEntriesByType(type: string): TimingEntry[] } };
    const entries = runtime.performance.getEntriesByType('resource');
    const navigation = runtime.performance.getEntriesByType('navigation')[0];
    return {
      levelId: id,
      requests: entries.length + (navigation === undefined ? 0 : 1),
      transferBytes: entries.reduce((total, entry) => total + entry.transferSize, navigation?.transferSize ?? 0),
      encodedBytes: entries.reduce((total, entry) => total + entry.encodedBodySize, navigation?.encodedBodySize ?? 0),
      decodedBytes: entries.reduce((total, entry) => total + entry.decodedBodySize, navigation?.decodedBodySize ?? 0),
    };
  }, levelId));
  await context.close();
}

await browser.close();
await mkdir('release/qa/campaign', { recursive: true });
await writeFile('release/qa/campaign/performance.json', `${JSON.stringify({
  measuredAt: new Date().toISOString(),
  browserVersion,
  conditions: 'Warm local production preview in headless desktop Chrome with touch and portrait viewport emulation. This is not physical phone testing.',
  environment,
  coldLoads,
  samples,
}, null, 2)}\n`);
console.log('Wrote 30 campaign performance samples to release/qa/campaign/performance.json.');
