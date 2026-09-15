import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { chromium } from '@playwright/test';

interface BrowserNavigator {
  readonly serviceWorker: {
    readonly ready: Promise<unknown>;
    getRegistration(): Promise<{ update(): Promise<void> } | undefined>;
  };
}

const runBuild = (buildId: string): void => {
  const environment = { ...process.env, RIPPLE_BUILD_ID: buildId };
  const typecheck = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '-b'], { stdio: 'inherit', env: environment });
  if (typecheck.status !== 0) throw new Error(`TypeScript build ${buildId} failed.`);
  const bundle = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build'], { stdio: 'inherit', env: environment });
  if (bundle.status !== 0) throw new Error(`Vite build ${buildId} failed.`);
};

const waitForPreview = (process: ChildProcess): Promise<void> => new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('Preview server did not start.')), 15_000);
  process.stdout?.on('data', (data: Buffer) => {
    if (data.toString().includes('Local:')) { clearTimeout(timer); resolve(); }
  });
  process.on('exit', (code) => reject(new Error(`Preview server exited with ${code}.`)));
});

runBuild('update-a');
const preview = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4180'], { stdio: ['ignore', 'pipe', 'pipe'] });

try {
  await waitForPreview(preview);
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4180/play/#/level/01?v=1');
  await page.evaluate(async () => { await (navigator as unknown as BrowserNavigator).serviceWorker.ready; });
  await page.reload();
  const skipTutorial = page.getByRole('button', { name: 'Skip tutorial', exact: true });
  if (await skipTutorial.isVisible()) await skipTutorial.click();
  await page.getByRole('button', { name: 'Choose vehicle', exact: true }).click();
  await page.getByRole('button', { name: 'Parcel robot', exact: true }).click();
  await page.getByRole('button', { name: 'Garden path', exact: true }).click();
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'Saved' }).waitFor();
  runBuild('update-b');
  await page.evaluate(async () => { await (await (navigator as unknown as BrowserNavigator).serviceWorker.getRegistration())?.update(); });
  const updateButton = page.getByRole('button', { name: 'Update now' });
  await updateButton.waitFor({ timeout: 20_000 });
  await updateButton.click();
  await page.getByRole('button', { name: 'Choose vehicle', exact: true }).click();
  await page.getByRole('button', { name: 'Parcel robot', exact: true }).click();
  const selectedGardenRoute = page.getByRole('button', { name: /^Garden path/ });
  await selectedGardenRoute.waitFor();
  if (await selectedGardenRoute.getAttribute('aria-pressed') !== 'true') throw new Error('The save did not survive the update.');
  await browser.close();
  console.log('Verified update prompt, controlled activation, reload, and save retention.');
} finally {
  preview.kill();
}
