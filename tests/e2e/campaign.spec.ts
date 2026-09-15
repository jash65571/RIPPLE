import { expect, test, type Page } from '@playwright/test';

const solutions: readonly (readonly string[])[] = [
  ['Garden path'], ['Beat 2'], ['Quay path'], ['Direct route'], ['Side door'],
  ['Garden path', 'Quay path'], ['Garden path'], ['Beat 4'], ['Garden path'], ['Garden path', 'Quay path'],
];

const resetStorage = async (page: Page): Promise<void> => {
  await page.goto('/play/');
  await page.getByRole('button', { name: 'Start with Market Morning', exact: true }).waitFor();
};

const skipLevelOneTutorial = async (page: Page): Promise<void> => {
  const skip = page.getByRole('button', { name: 'Skip tutorial', exact: true });
  if (await skip.isVisible()) await skip.click();
};

const openRobotRoutes = async (page: Page): Promise<void> => {
  await page.getByRole('button', { name: 'Choose vehicle', exact: true }).click();
  await page.getByRole('button', { name: 'Parcel robot', exact: true }).click();
};

const enableReducedMotion = async (page: Page): Promise<void> => {
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByLabel('Reduce motion').check();
  await page.getByRole('button', { name: 'Close settings' }).click();
};

test('completes all ten levels through visible controls and reaches the ending', async ({ page }) => {
  test.setTimeout(90_000);
  await resetStorage(page);
  await page.goto('/play/#/level/01?v=1');
  await enableReducedMotion(page);
  await skipLevelOneTutorial(page);
  await openRobotRoutes(page);
  await page.getByRole('button', { name: 'Garden path', exact: true }).click();
  await page.getByRole('button', { name: 'Go', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Next level', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next level', exact: true }).click();
  for (let index = 1; index < solutions.length; index += 1) {
    await expect(page.getByRole('heading', { name: new RegExp(`Level ${String(index + 1).padStart(2, '0')}`, 'i') }).or(page.locator('.game-header h1'))).toBeVisible();
    for (const choice of solutions[index]!) await page.getByRole('button', { name: choice, exact: true }).click();
    await page.getByRole('button', { name: 'Test plan', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Plan works for every day' })).toBeVisible();
    await page.getByRole('button', { name: 'Next puzzle', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'The harbor found its rhythm' })).toBeVisible();
});

test('preserves an edit through reload and supports undo', async ({ page }) => {
  await resetStorage(page);
  await page.goto('/play/#/level/01?v=1');
  await enableReducedMotion(page);
  await skipLevelOneTutorial(page);
  await openRobotRoutes(page);
  await page.getByRole('button', { name: 'Garden path', exact: true }).click();
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Saved' })).toBeVisible();
  await page.reload();
  await openRobotRoutes(page);
  await expect(page.getByRole('button', { name: /^Garden path/ })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Market crossing', exact: true }).click();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await openRobotRoutes(page);
  await expect(page.getByRole('button', { name: /^Garden path/ })).toHaveAttribute('aria-pressed', 'true');
});

test('opens help, text play, settings, and bad level recovery by keyboard', async ({ page }) => {
  await page.goto('/play/#/level/07?v=1');
  await page.getByRole('button', { name: 'Help', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'How this harbor works' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to the puzzle' }).click();
  await page.getByRole('button', { name: 'Show text view' }).click();
  await expect(page.getByRole('heading', { name: 'Event trace' })).toBeVisible();
  await page.getByRole('button', { name: 'Settings', exact: true }).first().click();
  await expect(page.getByRole('dialog', { name: 'Settings and progress' })).toBeVisible();
  await page.getByLabel('Reduce motion').check();
  await page.getByRole('button', { name: 'Close settings' }).click();
  await page.goto('/play/#/level/99?v=1');
  await expect(page.getByRole('heading', { name: 'Puzzle not found' })).toBeVisible();
});

test('loads every public page directly', async ({ page }) => {
  for (const path of ['/', '/about/', '/how-to-play/', '/accessibility/', '/privacy/', '/terms/', '/support/', '/credits/', '/404.html']) {
    const response = await page.goto(path);
    expect(response?.ok()).toBe(true);
    await expect(page.locator('h1')).toBeVisible();
  }
});

test('shows Continue on the landing page after local progress exists', async ({ page }) => {
  await page.goto('/play/#/level/01?v=1');
  await skipLevelOneTutorial(page);
  await openRobotRoutes(page);
  await page.getByRole('button', { name: 'Garden path', exact: true }).click();
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Saved' })).toBeVisible();
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Continue at level 01' })).toHaveCount(2);
});
