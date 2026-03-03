import { expect, test } from "@playwright/test";

test("rooms listing page renders", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /rooms|properties/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /search|browse/i })).toBeVisible();
});

test("room search functionality", async ({ page }) => {
  await page.goto("/");

  const searchInput = page.getByPlaceholder(/search|location/i).first();
  await searchInput.fill("New York");
  
  const searchButton = page.getByRole("button", { name: /search/i }).first();
  await searchButton.click();

  // Wait for results to load
  await page.waitForTimeout(1000);
  await expect(page).toHaveURL(/search|filter/i);
});

test("room details page navigation", async ({ page }) => {
  await page.goto("/");

  const roomCards = page.getByRole("article");
  if (await roomCards.count() > 0) {
    await roomCards.first().click();
    await expect(page).toHaveURL(/room|property/i);
  }
});
