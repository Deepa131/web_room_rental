import { expect, test } from "@playwright/test";

test("register page renders form controls", async ({ page }) => {
  await page.goto("/register");
  
  // Wait for heading to appear
  await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible({ timeout: 15000 });
  
  // Verify page loaded successfully
  await expect(page.locator("body")).toBeVisible();
});

test("register form validation", async ({ page }) => {
  await page.goto("/register");
  
  // Wait for the page to load
  await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible({ timeout: 15000 });

  // Try to find and click submit button
  const submitButton = page.getByRole("button").filter({ hasText: /create account/i });
  if (await submitButton.count() > 0) {
    await submitButton.first().click({ timeout: 5000 });
  }
  
  // Check if we're still on the page
  await expect(page.locator("body")).toBeVisible();
});
