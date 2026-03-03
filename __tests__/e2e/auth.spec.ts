import { expect, test } from "@playwright/test";

test("forgot password page renders", async ({ page }) => {
  await page.goto("/forgot-password");

  await expect(page.getByRole("heading", { name: /forgot|reset|password/i })).toBeVisible();
  await expect(page.getByPlaceholder(/email/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /send|submit|reset/i })).toBeVisible();
});

test("forgot password form submission", async ({ page }) => {
  await page.goto("/forgot-password");

  const emailInput = page.getByPlaceholder(/email/i);
  await emailInput.fill("test@example.com");

  const submitButton = page.getByRole("button", { name: /send|submit|reset/i });
  await submitButton.click();

  // Wait for success message
  await expect(page.getByText(/check|email|sent|link/i)).toBeVisible({ timeout: 5000 });
});
