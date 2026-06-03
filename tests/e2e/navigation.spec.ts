import { expect, test } from "@playwright/test";

test("dashboard loads source-first tracker", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /story, on one scroll/i })).toBeVisible();
  await expect(page.locator(".spine-track")).toBeVisible();
  await expect(page.getByLabel("Timeline source legend")).toContainText("Social signals show public discussion, not verified facts.");
  await expect(page.getByRole("button", { name: /Collection enters the dispute/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Utah lawsuit is live/i })).toBeVisible();
  const lawsuitBox = await page.getByRole("button", { name: /Utah lawsuit is live/i }).boundingBox();
  const originBox = await page.getByRole("button", { name: /Collection enters the dispute/i }).boundingBox();
  expect(lawsuitBox?.y ?? 0).toBeLessThan(originBox?.y ?? 0);
  await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute("href", "/feed.xml");
  await page.getByLabel("Primary navigation").getByRole("link", { name: "Archive" }).click();
  await expect(page.getByRole("heading", { name: /Every dated item/i })).toBeVisible();
});

test("homepage spine nodes expand and collapse", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('.spine-shell[data-spine-ready="true"]')).toBeVisible();
  const socialNode = page.getByRole("button", { name: /Social posts widen picture/i });
  const socialPanel = page.locator("#spine-panel-spine-social");
  await expect(socialPanel).toBeHidden();
  await socialNode.click();
  await expect(socialPanel).toBeVisible();
  await expect(socialPanel).toContainText("What remains disputed");
  await expect(socialPanel).toContainText("Social posts are not treated as verified facts");
  await socialNode.click();
  await expect(socialPanel).toBeHidden();
});

test("floating people drawers show story roles", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('.spine-shell[data-spine-ready="true"]')).toBeVisible();
  await page.getByRole("button", { name: "People" }).click();
  await expect(page.getByLabel("People").getByRole("heading", { name: "Benjamin Schneider / RecklessBen" })).toBeVisible();
  await expect(page.getByLabel("People").getByText("Creator-investigator and main lawsuit defendant")).toBeVisible();
  await page.getByRole("button", { name: "Organizations" }).click();
  await expect(page.getByLabel("Organizations").getByRole("heading", { name: "BAM Franchising / Bricks & Minifigs leadership" })).toBeVisible();
  await expect(page.getByLabel("Organizations").getByText("Franchisor, official speaker, plaintiff")).toBeVisible();
});

test("homepage spine supports keyboard expansion", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('.spine-shell[data-spine-ready="true"]')).toBeVisible();
  const statementNode = page.getByRole("button", { name: /BAM publishes responses/i });
  await statementNode.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#spine-panel-spine-official-response")).toBeVisible();
});

test("homepage spine has no mobile horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /story, on one scroll/i })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
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
