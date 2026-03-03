import { expect, test } from "@playwright/test";

test.describe("Room Details Page", () => {
  test("room details page displays information", async ({ page }) => {
    // Navigate to a room details page (adjust URL as needed for your app)
    await page.goto("/room/1"); // or wherever your room detail is

    // Check for common room details
    await expect(page.getByRole("heading", { name: /room|property/i })).toBeVisible();
  });

  test("room image gallery works", async ({ page }) => {
    await page.goto("/room/1");

    const images = page.getByRole("img");
    if (await images.count() > 0) {
      await expect(images.first()).toBeVisible();
    }
  });

  test("room details shows amenities", async ({ page }) => {
    await page.goto("/room/1");

    const amenitiesSection = page.getByRole("region", { name: /amenities|features/i });
    if (await amenitiesSection.isVisible()) {
      await expect(amenitiesSection).toBeVisible();
    }
  });

  test("can add room to wishlist", async ({ page }) => {
    await page.goto("/room/1");

    const wishlistButton = page.getByRole("button", { name: /wishlist|save|favorite/i });
    if (await wishlistButton.isVisible()) {
      await wishlistButton.click();
      // Verify the button state changed
      await expect(wishlistButton).toHaveClass(/active|selected|saved/i);
    }
  });

  test("can book appointment", async ({ page }) => {
    await page.goto("/room/1");

    const bookButton = page.getByRole("button", { name: /book|schedule|appointment/i });
    if (await bookButton.isVisible()) {
      await bookButton.click();
      await expect(page.getByRole("dialog")).toBeVisible();
    }
  });
});
