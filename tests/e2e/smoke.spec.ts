import { expect, test } from "@playwright/test";

test("wine learning app smoke test", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Guided Wine Tasting Log" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Wine Log" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Scan label/ })).toBeVisible();
  await expect(page.getByText("Upload label", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save to Sheet" })).toBeVisible();
});
