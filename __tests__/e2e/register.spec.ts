import { expect, test } from "@playwright/test";

test("register page renders form controls", async ({ page }) => {
  await page.goto("/register");

  await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();
  await expect(page.getByPlaceholder("Enter your full name")).toBeVisible();
  await expect(page.getByPlaceholder("Enter your email")).toBeVisible();
  await expect(page.getByPlaceholder("••••••••")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign Up" })).toBeVisible();
});

test("register form validation", async ({ page }) => {
  await page.goto("/register");

  const submitButton = page.getByRole("button", { name: "Sign Up" });
  await submitButton.click();

  // Expect validation errors
  await expect(page.getByText(/required/i)).toBeVisible();
});
