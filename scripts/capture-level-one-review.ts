import { chromium, type Browser, type Page } from '@playwright/test';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = 'http://127.0.0.1:4173/play/#/level/01?v=1';
const OUTPUT_DIRECTORY = path.resolve('release/qa/level-01-premium');
const PHONE_SIZES = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
] as const;

async function dismissOfflineNotice(page: Page): Promise<void> {
  const dismiss = page.getByRole('button', { name: 'Dismiss', exact: true });
  if (await dismiss.isVisible()) await dismiss.click();
}

async function openLevel(page: Page): Promise<void> {
  await page.goto(BASE_URL);
  await dismissOfflineNotice(page);
  await page.locator('.harbor-scene canvas').waitFor();
  await page.waitForTimeout(1_200);
}

async function capturePhoneStates(browser: Browser, size: typeof PHONE_SIZES[number]) {
  const context = await browser.newContext({ viewport: size, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await openLevel(page);
  const prefix = `${size.width}x${size.height}`;

  await page.screenshot({ path: path.join(OUTPUT_DIRECTORY, `${prefix}-tutorial.png`) });
  const metrics = await page.evaluate(() => {
    interface ResourceEntry { readonly transferSize: number; readonly encodedBodySize: number; readonly decodedBodySize: number }
    interface WebGlContext {
      getExtension(name: string): { readonly UNMASKED_RENDERER_WEBGL: number } | null;
      getParameter(parameter: number): unknown;
    }
    interface CanvasElement { getContext(name: string): WebGlContext | null }
    interface SceneElement {
      readonly dataset: Record<string, string | undefined>;
      querySelector(selector: string): CanvasElement | null;
    }
    const browser = globalThis as unknown as {
      readonly document: {
        readonly documentElement: { readonly scrollWidth: number; readonly clientWidth: number; readonly scrollHeight: number; readonly clientHeight: number };
        querySelector(selector: string): SceneElement | null;
      };
      readonly innerWidth: number;
      readonly innerHeight: number;
      readonly navigator: { readonly userAgent: string; readonly maxTouchPoints: number };
      readonly performance: { getEntriesByType(type: string): ResourceEntry[] };
      matchMedia(query: string): { readonly matches: boolean };
    };
    const scene = browser.document.querySelector('.harbor-scene');
    const canvas = scene?.querySelector('canvas');
    const context = canvas?.getContext('webgl2') ?? canvas?.getContext('webgl');
    const debugInfo = context?.getExtension('WEBGL_debug_renderer_info');
    const resources = browser.performance.getEntriesByType('resource');
    return {
      viewport: { width: browser.innerWidth, height: browser.innerHeight },
      scrollOverflow: {
        horizontal: browser.document.documentElement.scrollWidth - browser.document.documentElement.clientWidth,
        vertical: browser.document.documentElement.scrollHeight - browser.document.documentElement.clientHeight,
      },
      scene: {
        fps: Number(scene?.dataset.fps ?? 0),
        frameMs: Number(scene?.dataset.frameMs ?? 0),
        drawCalls: Number(scene?.dataset.drawCalls ?? 0),
        triangles: Number(scene?.dataset.triangles ?? 0),
      },
      resources: {
        requests: resources.length,
        transferBytes: resources.reduce((total, resource) => total + resource.transferSize, 0),
        encodedBytes: resources.reduce((total, resource) => total + resource.encodedBodySize, 0),
        decodedBytes: resources.reduce((total, resource) => total + resource.decodedBodySize, 0),
      },
      environment: {
        userAgent: browser.navigator.userAgent,
        touchPoints: browser.navigator.maxTouchPoints,
        coarsePointer: browser.matchMedia('(pointer: coarse)').matches,
        renderer: debugInfo === undefined || debugInfo === null || context === undefined || context === null
          ? 'Unavailable'
          : String(context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)),
      },
    };
  });

  await page.getByRole('button', { name: 'Skip tutorial', exact: true }).click();
  await page.screenshot({ path: path.join(OUTPUT_DIRECTORY, `${prefix}-normal.png`) });
  await page.getByRole('button', { name: 'Choose vehicle', exact: true }).click();
  await page.getByRole('button', { name: 'Parcel robot', exact: true }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUTPUT_DIRECTORY, `${prefix}-routes.png`) });
  await page.getByRole('button', { name: 'Go', exact: true }).click();
  await page.getByRole('button', { name: 'Try again', exact: true }).waitFor({ timeout: 12_000 });
  await page.screenshot({ path: path.join(OUTPUT_DIRECTORY, `${prefix}-failure.png`) });
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await page.getByRole('button', { name: 'Garden path', exact: true }).click();
  await page.getByRole('button', { name: 'Go', exact: true }).click();
  await page.getByRole('button', { name: 'Next level', exact: true }).waitFor({ timeout: 12_000 });
  await page.screenshot({ path: path.join(OUTPUT_DIRECTORY, `${prefix}-success.png`) });
  await context.close();
  return metrics;
}

async function captureGameplayVideo(browser: Browser): Promise<void> {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    recordVideo: { dir: OUTPUT_DIRECTORY, size: { width: 390, height: 844 } },
  });
  const page = await context.newPage();
  await openLevel(page);
  await page.getByRole('button', { name: 'Skip tutorial', exact: true }).click();
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Choose vehicle', exact: true }).click();
  await page.getByRole('button', { name: 'Parcel robot', exact: true }).click();
  await page.waitForTimeout(1_200);
  await page.getByRole('button', { name: 'Garden path', exact: true }).click();
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Go', exact: true }).click();
  await page.getByRole('button', { name: 'Next level', exact: true }).waitFor({ timeout: 12_000 });
  await page.waitForTimeout(1_200);
  const video = page.video();
  await context.close();
  if (video !== null) {
    const outputPath = path.join(OUTPUT_DIRECTORY, 'portrait-gameplay.webm');
    const temporaryPath = await video.path();
    await video.saveAs(outputPath);
    if (temporaryPath !== outputPath) await rm(temporaryPath, { force: true });
  }
}

async function main(): Promise<void> {
  await mkdir(OUTPUT_DIRECTORY, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  const metrics = [];
  for (const size of PHONE_SIZES) metrics.push(await capturePhoneStates(browser, size));
  await captureGameplayVideo(browser);
  await browser.close();
  await writeFile(path.join(OUTPUT_DIRECTORY, 'metrics.json'), `${JSON.stringify(metrics, null, 2)}\n`, 'utf8');
}

await main();
