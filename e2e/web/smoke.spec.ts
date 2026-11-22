import { test, expect } from '@playwright/test';

test('signs in through the demo API and reaches the guard', async ({
  page,
}) => {
  await page.goto('/login');

  await page.getByTestId('login-email').fill('learner@hodlo.app');
  await page.getByTestId('login-password').fill('password123');
  await page.getByTestId('login-submit').click();

  await expect(page.getByText('Set up your profile')).toBeVisible();
});
