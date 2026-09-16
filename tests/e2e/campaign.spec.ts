import { expect, test, type Page } from '@playwright/test';

interface SolutionEdit {
  readonly actor: 'Parcel robot' | 'Harbor bus' | 'Market cart';
  readonly choice: string;
}

const solutions: Readonly<Record<string, readonly SolutionEdit[]>> = {
  '01': [{ actor: 'Parcel robot', choice: 'Garden path' }],
  '02': [{ actor: 'Parcel robot', choice: 'Beat 2' }],
  '03': [{ actor: 'Harbor bus', choice: 'Quay path' }],
  '04': [{ actor: 'Parcel robot', choice: 'Direct route' }],
  '05': [{ actor: 'Parcel robot', choice: 'Side door' }],
  '06': [{ actor: 'Parcel robot', choice: 'Garden path' }, { actor: 'Market cart', choice: 'Quay path' }],
  '07': [{ actor: 'Parcel robot', choice: 'Garden path' }],
  '08': [{ actor: 'Parcel robot', choice: 'Beat 4' }],
  '09': [{ actor: 'Parcel robot', choice: 'Garden path' }],
  '10': [{ actor: 'Parcel robot', choice: 'Garden path' }, { actor: 'Market cart', choice: 'Quay path' }],
};

const dismissCampaignHelp = async (page: Page): Promise<void> => {
  const button = page.getByRole('button', { name: 'Got it', exact: true });
  if (await button.isVisible()) await button.click();
};

const skipLevelOneTutorial = async (page: Page): Promise<void> => {
  const skip = page.getByRole('button', { name: 'Skip tutorial', exact: true });
  if (await skip.isVisible()) await skip.click();
};

const chooseEdit = async (page: Page, edit: SolutionEdit): Promise<void> => {
  await page.getByRole('button', { name: 'Choose vehicle', exact: true }).click();
  await page.getByRole('button', { name: new RegExp(`^${edit.actor}`) }).click();
  await page.getByRole('button', { name: new RegExp(`^${edit.choice}`) }).click();
};

test('completes all ten levels through visible controls and reaches the ending', async ({ page }) => {
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/play/#/level/01?v=1');
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByLabel('Reduce motion').check();
  await page.getByRole('button', { name: 'Close settings' }).click();
  await skipLevelOneTutorial(page);
  await chooseEdit(page, solutions['01']![0]!);
  await page.getByRole('button', { name: 'Go', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Next level', exact: true })).toBeVisible({ timeout: 12_000 });
  await page.getByRole('button', { name: 'Next level', exact: true }).click();

  for (let levelNumber = 2; levelNumber <= 10; levelNumber += 1) {
    const id = String(levelNumber).padStart(2, '0');
    await expect(page.locator('.campaign-touch-shell')).toBeVisible();
    await dismissCampaignHelp(page);
    for (const edit of solutions[id]!) await chooseEdit(page, edit);
    await page.getByRole('button', { name: 'Go', exact: true }).click();
    const action = levelNumber === 10 ? 'Finish campaign' : 'Next level';
    await expect(page.getByRole('button', { name: action, exact: true })).toBeVisible({ timeout: 12_000 });
    await page.getByRole('button', { name: action, exact: true }).click();
  }

  await expect(page.getByRole('heading', { name: 'The harbor found its rhythm' })).toBeVisible();
});

test('every level explains a meaningful failing plan and preserves it for retry', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (let levelNumber = 2; levelNumber <= 10; levelNumber += 1) {
    const id = String(levelNumber).padStart(2, '0');
    await page.goto(`/play/#/level/${id}?v=1`);
    await dismissCampaignHelp(page);
    await page.getByRole('button', { name: 'Go', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Try again', exact: true }), `level ${id} should fail its original plan`).toBeVisible();
    await expect(page.locator('.touch-result-callout.failed')).toContainText(/arrived at beat|deadline/i);
    await page.getByRole('button', { name: 'Try again', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Go', exact: true })).toBeVisible();
  }
});

test('preserves an edit through reload and supports undo', async ({ page }) => {
  await page.goto('/play/#/level/01?v=1');
  await skipLevelOneTutorial(page);
  await chooseEdit(page, solutions['01']![0]!);
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Saved' })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Choose vehicle', exact: true }).click();
  await page.getByRole('button', { name: /^Parcel robot/ }).click();
  await expect(page.getByRole('button', { name: /^Garden path/ })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /^Market crossing/ }).click();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await page.getByRole('button', { name: 'Choose vehicle', exact: true }).click();
  await page.getByRole('button', { name: /^Parcel robot/ }).click();
  await expect(page.getByRole('button', { name: /^Garden path/ })).toHaveAttribute('aria-pressed', 'true');
});

test('opens help, text play, settings, and bad level recovery by keyboard', async ({ page }) => {
  await page.goto('/play/#/level/07?v=1');
  await dismissCampaignHelp(page);
  await page.getByRole('button', { name: 'Menu', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Help', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'How this harbor works' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to the puzzle' }).click();
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('button', { name: 'Show text view', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Event trace' })).toBeVisible();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
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
  await chooseEdit(page, solutions['01']![0]!);
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Saved' })).toBeVisible();
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Continue at level 01' })).toHaveCount(2);
});
