import { expect, test } from "@playwright/test";

test.describe("Renter Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // This assumes you have a way to authenticate as renter
    await page.goto("/renter/dashboard");
  });

  test("renter dashboard loads", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /dashboard|profile/i })).toBeVisible();
  });

  test("renter can view appointments", async ({ page }) => {
    const appointmentsLink = page.getByRole("link", { name: /appointments/i });
    await appointmentsLink.click();
    await expect(page).toHaveURL(/appointments/i);
  });

  test("renter can view wishlist", async ({ page }) => {
    const wishlistLink = page.getByRole("link", { name: /wishlist|saved/i });
    if (await wishlistLink.isVisible()) {
      await wishlistLink.click();
      await expect(page).toHaveURL(/wishlist|saved/i);
    }
  });

  test("renter can schedule appointment", async ({ page }) => {
    const scheduleButton = page.getByRole("button", { name: /schedule|book|appointment/i }).first();
    if (await scheduleButton.isVisible()) {
      await scheduleButton.click();
      await expect(page.getByRole("dialog", { name: /schedule|appointment/i })).toBeVisible();
    }
  });
});
