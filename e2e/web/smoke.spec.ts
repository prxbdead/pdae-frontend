import { test, expect } from '@playwright/test';

test('signs in through the demo API and reaches the guard', async ({
  page,
}) => {
  await page.goto('/login');

  await page.getByTestId('login-email').fill('learner@hodlo.app');
  await page.getByTestId('login-password').fill('password123');

  const submit = page.getByTestId('login-submit');
  await expect(submit).toBeEnabled();
  await submit.click();

  await page.waitForURL('**/learn');
  await expect(page.getByText('Your path starts here')).toBeVisible();
});
