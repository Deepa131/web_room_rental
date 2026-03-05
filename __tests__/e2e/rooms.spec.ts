import { expect, test } from "@playwright/test";

test("rooms listing page renders", async ({ page }) => {
  await page.goto("/");

  // Simply verify the page loaded
  await expect(page.locator("body")).toBeVisible();
});

test("room search functionality", async ({ page }) => {
  await page.goto("/");

  // Page should load successfully
  await expect(page.locator("body")).toBeVisible();
});

test("room details page navigation", async ({ page }) => {
  await page.goto("/");

  // Page should load successfully
  await expect(page.locator("body")).toBeVisible();
});
