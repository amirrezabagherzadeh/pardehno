import { test } from "@playwright/test";

test("capture key responsive surfaces", async ({ page }) => {
  await page.goto("/");
  await page.screenshot({ path: "artifacts/home.png", fullPage: true });
  await page.goto("/movies");
  await page.screenshot({ path: "artifacts/movies.png", fullPage: true });
  await page.goto("/watchlist");
  await page.screenshot({ path: "artifacts/watchlist.png", fullPage: true });
});
