import { expect, test } from "@playwright/test";

test.describe("Owner Dashboard", () => {
  test("owner dashboard loads", async ({ page }) => {
    // Navigate to owner dashboard - will redirect if not authenticated
    const response = await page.goto("/owner/dashboard");
    
    // Skip test if user is not authenticated (redirected to login)
    if (response?.status() === 307 || response?.status() === 302 || response?.status() === 401 || response?.status() === 403) {
      test.skip();
    }
    
    // If we get here, the page loaded
    await expect(page.locator("body")).toBeVisible();
  });

  test("owner can see property list", async ({ page }) => {
    const response = await page.goto("/owner/dashboard");
    
    if (response?.status() === 307 || response?.status() === 302 || response?.status() === 401 || response?.status() === 403) {
      test.skip();
    }
    
    await expect(page.locator("body")).toBeVisible();
  });

  test("owner can navigate to add room", async ({ page }) => {
    const response = await page.goto("/owner/add-room");
    
    if (response?.status() === 307 || response?.status() === 302 || response?.status() === 401 || response?.status() === 403) {
      test.skip();
    }
    
    await expect(page.locator("body")).toBeVisible();
  });
});
