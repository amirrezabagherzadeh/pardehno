import { expect, test } from "@playwright/test";

test("mobile navigation and filter sheets are keyboard-accessible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/movies");
  await page.getByRole("button", { name: "بازکردن منو" }).click();
  await expect(page.getByRole("dialog", { name: "پرده‌نو" })).toBeVisible();
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "فیلتر و مرتب‌سازی" }).click();
  await expect(page.getByRole("dialog", { name: "فیلتر و مرتب‌سازی" })).toBeVisible();
  await page.keyboard.press("Escape");
});

test("Persian canonical detail URL settles without a redirect loop", async ({ page }) => {
  await page.goto("/movie/693134/%D8%AA%D9%84-%D9%85%D8%A7%D8%B3%D9%87-%D8%A8%D8%AE%D8%B4-%D8%AF%D9%88%D9%85");
  await expect(page.getByRole("heading", { name: "تل‌ماسه: بخش دوم", level: 1 })).toBeVisible();
});
