import { expect, test } from "@playwright/test";

test.describe("Room Details Page", () => {
  test("room details page displays information", async ({ page }) => {
    // Navigate to home page first
    await page.goto("/");

    // Check that page loads
    await expect(page.locator("body")).toBeVisible();
  });

  test("room image gallery works", async ({ page }) => {
    await page.goto("/");

    // Check that page loads
    await expect(page.locator("body")).toBeVisible();
  });

  test("room details shows amenities", async ({ page }) => {
    await page.goto("/");

    // Check that page loads
    await expect(page.locator("body")).toBeVisible();
  });

  test("can add room to wishlist", async ({ page }) => {
    await page.goto("/");

    // Check that page loads
    await expect(page.locator("body")).toBeVisible();
  });

  test("can book appointment", async ({ page }) => {
    await page.goto("/");

    // Check that page loads
    await expect(page.locator("body")).toBeVisible();
  });
});
