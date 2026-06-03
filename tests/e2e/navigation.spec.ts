import { expect, test } from "@playwright/test";

test("dashboard loads source-first tracker", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /The LEGO case got weird/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Screenshots you can actually orient around/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /The tracker checks trusted sources/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Start With Evidence" })).toBeVisible();
  await page.getByLabel("Primary navigation").getByRole("link", { name: "Archive" }).click();
  await expect(page.getByRole("heading", { name: /Every dated item/i })).toBeVisible();
});

test("timeline filtering works", async ({ page }) => {
  await page.goto("/timeline");
  await page.getByPlaceholder("party, filing, statement, report").fill("Dexerto");
  await expect(page.getByRole("heading", { name: "National entertainment coverage summarizes dispute" })).toBeVisible();
});

test("submission form validates required fields", async ({ page }) => {
  await page.goto("/submit");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.locator("input:invalid, textarea:invalid").first()).toBeVisible();
});
