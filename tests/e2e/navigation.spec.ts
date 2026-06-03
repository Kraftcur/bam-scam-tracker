import { expect, test } from "@playwright/test";

async function openSpineMode(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Timeline Watch Mode" })).toBeVisible();
  await page.getByRole("button", { name: "Continuous Case Spine" }).click();
  await expect(page.locator('.spine-shell[data-spine-ready="true"]')).toBeVisible();
}

test("dashboard loads source-first tracker", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Timeline Watch Mode" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Watch Story Recap" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continuous Case Spine" })).toBeVisible();
  await page.getByRole("button", { name: "Continuous Case Spine" }).click();
  await expect(page.getByRole("heading", { name: /story, on one scroll/i })).toBeVisible();
  await expect(page.locator(".spine-track")).toBeVisible();
  await expect(page.getByLabel("Timeline source legend")).toContainText("Social signals show public discussion, not verified facts.");
  await expect(page.getByLabel("Primary navigation")).toHaveCount(0);
  await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute("href", "/feed.xml");
  await page.goto("/timeline");
  await expect(page.getByRole("heading", { name: /Every dated item/i })).toBeVisible();
});

test("watch mode uses matching video for June 1 police rebuttal", async ({ page }) => {
  await page.goto("/?view=play&step=17");
  await expect(page.getByRole("heading", { name: "Timeline Watch Mode" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "RecklessBen responds to American Fork police" })).toBeVisible();
  await expect(page.locator(".step-count-badge")).toContainText("Step 17");
  await expect(page.locator("iframe")).toHaveAttribute("src", /2YEzhDn0jY8/);
  await expect(page.locator("iframe")).not.toHaveAttribute("src", /cxZPfj8AlmY/);
});

test("floating people drawers show story roles", async ({ page }) => {
  await openSpineMode(page);
  await page.getByRole("button", { name: "People + owners" }).click();
  await expect(page.getByLabel("People + owners").getByRole("heading", { name: "Benjamin Schneider / RecklessBen" })).toBeVisible();
  await expect(page.getByLabel("People + owners").getByText("Creator-investigator and main lawsuit defendant")).toBeVisible();
  await expect(page.getByLabel("People + owners").getByRole("heading", { name: "Baker Bricks / Josh Johnson / Brandon Best" })).toBeVisible();
  await expect(page.getByLabel("People + owners").getByRole("heading", { name: "Chrystal Law/Gorman and Benjamin Gorman" })).toBeVisible();
  await page.getByRole("button", { name: "Organizations" }).click();
  await expect(page.getByLabel("Organizations").getByRole("heading", { name: "BAM Franchising / Bricks & Minifigs leadership" })).toBeVisible();
  await expect(page.getByLabel("Organizations").getByText("Franchisor, official speaker, plaintiff")).toBeVisible();
});

test("homepage spine supports keyboard expansion", async ({ page }) => {
  await openSpineMode(page);
  const statementNode = page.getByRole("button", { name: /BAM publishes detailed official statement/i });
  await statementNode.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#spine-panel-evt-bam-statement-may28")).toBeVisible();
});

test("homepage spine has no mobile horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Timeline Watch Mode" })).toBeVisible();
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
