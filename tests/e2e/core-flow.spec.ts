import { expect, test } from "@playwright/test";

test("homepage, discovery, and local watchlist flow", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const addButton = page.getByRole("button", { name: /افزودن به فهرست من/ }).first();
  await addButton.click();
  await page.getByRole("link", { name: /فهرست من/ }).click();
  await expect(page.getByRole("heading", { name: "فهرست من" })).toBeVisible();
  await expect(page.locator("article")).toHaveCount(1);
});

test("search opens from the header", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "بازکردن جستجو" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("combobox", { name: "عبارت جستجو" }).fill("Dune");
  await expect(page.getByText(/نتیجه پیدا شد|در حال جستجو/).first()).toBeVisible();
});
