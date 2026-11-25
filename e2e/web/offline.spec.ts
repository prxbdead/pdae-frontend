import { test, expect } from '@playwright/test';

const LESSON_URL = '/lesson/foundations-1';

test('a lesson URL survives a refresh with the network offline', async ({
  page,
  context,
}) => {
  await page.goto('/login');
  await page.getByTestId('login-email').fill('learner@hodlo.app');
  await page.getByTestId('login-password').fill('password123');
  await page.getByTestId('login-submit').click();
  await page.waitForURL('**/learn');

  await page.goto(LESSON_URL);
  await expect(page.getByTestId('start-lesson')).toBeVisible();

  // The worker must control the page before the network drops, or the reload
  // below would fall through to the server.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() =>
      page.evaluate(() => navigator.serviceWorker.controller !== null),
    )
    .toBe(true);

  await context.setOffline(true);
  await page.reload();

  await expect(page).toHaveURL(new RegExp(`${LESSON_URL}$`));
  await expect(page.getByTestId('start-lesson')).toBeVisible();
});
