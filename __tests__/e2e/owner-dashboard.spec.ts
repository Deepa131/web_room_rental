import { expect, test } from "@playwright/test";

test.describe("Owner Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // This assumes you have a way to authenticate as owner
    // You might need to adjust based on your auth implementation
    await page.goto("/owner/dashboard");
  });

  test("owner dashboard loads", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /dashboard|overview/i })).toBeVisible();
  });

  test("owner can see property list", async ({ page }) => {
    const propertySection = page.getByRole("region", { name: /properties|listings/i });
    await expect(propertySection).toBeVisible();
  });

  test("owner can navigate to add room", async ({ page }) => {
    const addButton = page.getByRole("button", { name: /add|new|create/i });
    await addButton.click();
    await expect(page).toHaveURL(/add|create/i);
  });
});
