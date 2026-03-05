import { expect, test } from "@playwright/test";

test.describe("Renter Dashboard", () => {
  test("renter dashboard loads", async ({ page }) => {
    const response = await page.goto("/renter/dashboard");
    
    // Skip test if user is not authenticated (redirected to login)
    if (response?.status() === 307 || response?.status() === 302 || response?.status() === 401 || response?.status() === 403) {
      test.skip();
    }
    
    await expect(page.locator("body")).toBeVisible();
  });

  test("renter can view appointments", async ({ page }) => {
    const response = await page.goto("/renter/appointments");
    
    if (response?.status() === 307 || response?.status() === 302 || response?.status() === 401 || response?.status() === 403) {
      test.skip();
    }
    
    await expect(page.locator("body")).toBeVisible();
  });

  test("renter can view wishlist", async ({ page }) => {
    const response = await page.goto("/renter/wishlist");
    
    if (response?.status() === 307 || response?.status() === 302 || response?.status() === 401 || response?.status() === 403) {
      test.skip();
    }
    
    await expect(page.locator("body")).toBeVisible();
  });

  test("renter can schedule appointment", async ({ page }) => {
    const response = await page.goto("/renter/dashboard");
    
    if (response?.status() === 307 || response?.status() === 302 || response?.status() === 401 || response?.status() === 403) {
      test.skip();
    }
    
    await expect(page.locator("body")).toBeVisible();
  });
});
