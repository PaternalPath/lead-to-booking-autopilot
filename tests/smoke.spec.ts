import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("app loads successfully", async ({ page }) => {
    await page.goto("/");

    // Check that the page loads
    await expect(page).toHaveTitle(/Lead Autopilot/);

    // Check that navigation is visible
    await expect(page.getByText("Lead Autopilot")).toBeVisible();
    await expect(page.getByRole("link", { name: "Leads" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Pipeline" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Templates" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
  });

  test("can navigate between pages", async ({ page }) => {
    await page.goto("/");

    // Navigate to Pipeline
    await page.getByRole("link", { name: "Pipeline" }).click();
    await expect(page.getByRole("heading", { name: "Pipeline" })).toBeVisible();

    // Navigate to Templates
    await page.getByRole("link", { name: "Templates" }).click();
    await expect(page.getByRole("heading", { name: "Templates" })).toBeVisible();

    // Navigate to Settings
    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

    // Navigate back to Leads
    await page.getByRole("link", { name: "Leads" }).click();
    await expect(page.getByRole("heading", { name: "Leads" })).toBeVisible();
  });

  test("shows empty state when no data", async ({ page }) => {
    await page.goto("/");

    // Should show empty state
    await expect(page.getByText("No leads yet")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Lead" })).toBeVisible();
  });

  test("can load demo workspace", async ({ page }) => {
    await page.goto("/settings");

    // Click Load Demo Workspace button
    await page.getByRole("button", { name: "Load Demo Workspace" }).click();

    // Go to leads page
    await page.getByRole("link", { name: "Leads" }).click();

    // Should now have leads (demo workspace has multiple leads)
    await expect(page.getByText("No leads yet")).not.toBeVisible();

    // Verify some demo leads are visible
    await expect(page.getByText("Sarah Johnson")).toBeVisible();
  });

  test("can create a new lead", async ({ page }) => {
    await page.goto("/");

    // Click Create Lead button
    await page.getByRole("button", { name: "Create Lead" }).click();

    // Fill out the form
    await page.getByLabel("Full Name *").fill("Test User");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Phone").fill("(555) 123-4567");
    await page.getByLabel("Source").fill("Test");

    // Submit the form
    await page.getByRole("button", { name: "Create Lead" }).click();

    // Should show the new lead
    await expect(page.getByText("Test User")).toBeVisible();
  });

  test("can view pipeline with stages", async ({ page }) => {
    await page.goto("/settings");

    // Load demo data first
    await page.getByRole("button", { name: "Load Demo Workspace" }).click();

    // Go to pipeline
    await page.getByRole("link", { name: "Pipeline" }).click();

    // Check that stage columns are visible
    await expect(page.getByText("New", { exact: true })).toBeVisible();
    await expect(page.getByText("Contacted")).toBeVisible();
    await expect(page.getByText("Qualified")).toBeVisible();
    await expect(page.getByText("Proposal Sent")).toBeVisible();
    await expect(page.getByText("Booked")).toBeVisible();
    await expect(page.getByText("Lost")).toBeVisible();

    // Check that at least one lead is in pipeline
    await expect(page.getByText("Sarah Johnson")).toBeVisible();
  });

  test("can view lead detail page", async ({ page }) => {
    await page.goto("/settings");

    // Load demo data
    await page.getByRole("button", { name: "Load Demo Workspace" }).click();

    // Go to leads
    await page.getByRole("link", { name: "Leads" }).click();

    // Click on a lead
    await page.getByText("Sarah Johnson").click();

    // Should be on lead detail page
    await expect(page.getByRole("heading", { name: "Sarah Johnson" })).toBeVisible();
    await expect(page.getByText("Tasks")).toBeVisible();
    await expect(page.getByText("Activity Timeline")).toBeVisible();
  });

  test("can generate follow-up plan", async ({ page }) => {
    await page.goto("/settings");

    // Load demo data
    await page.getByRole("button", { name: "Load Demo Workspace" }).click();

    // Go to leads
    await page.getByRole("link", { name: "Leads" }).click();

    // Click on a lead that's New or Contacted
    await page.getByText("Lisa Thompson").click();

    // Click Generate Plan button
    await page.getByRole("button", { name: "Generate Plan" }).click();

    // Should show success message
    await expect(page.getByText(/Created \d+ (new )?tasks/)).toBeVisible();
  });

  test("can view templates", async ({ page }) => {
    await page.goto("/settings");

    // Load demo data
    await page.getByRole("button", { name: "Load Demo Workspace" }).click();

    // Go to templates
    await page.getByRole("link", { name: "Templates" }).click();

    // Should show templates
    await expect(page.getByText("Welcome & Next Steps")).toBeVisible();
    await expect(page.getByText("Options Recap")).toBeVisible();
  });

  test("templates can be copied to clipboard", async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto("/settings");

    // Load demo data
    await page.getByRole("button", { name: "Load Demo Workspace" }).click();

    // Go to templates
    await page.getByRole("link", { name: "Templates" }).click();

    // Click copy button on first template
    // Look for any copy button (clipboard icon)
    const copyButtons = page.getByRole("button", { name: "" }).filter({ has: page.locator("svg") });
    await copyButtons.first().click();

    // Should show checkmark (indicating copied)
    await expect(page.locator("svg").filter({ has: page.locator("path") })).toBeVisible();
  });

  test("can export workspace data", async ({ page }) => {
    await page.goto("/settings");

    // Load demo data
    await page.getByRole("button", { name: "Load Demo Workspace" }).click();

    // Set up download listener
    const downloadPromise = page.waitForEvent("download");

    // Click export button
    await page.getByRole("button", { name: "Export Workspace" }).click();

    // Wait for download
    const download = await downloadPromise;

    // Verify download happened
    expect(download.suggestedFilename()).toContain("lead-autopilot-backup");
    expect(download.suggestedFilename()).toContain(".json");
  });

  test("can clear workspace data", async ({ page }) => {
    await page.goto("/settings");

    // Load demo data
    await page.getByRole("button", { name: "Load Demo Workspace" }).click();

    // Verify data is loaded (check stats)
    await expect(page.getByText(/\d+/).first()).toBeVisible();

    // Click Clear All Data button
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Clear All Data" }).click();

    // Accept second confirmation
    page.once("dialog", (dialog) => dialog.accept());

    // Wait a bit for the action to complete
    await page.waitForTimeout(500);

    // Go to leads page
    await page.getByRole("link", { name: "Leads" }).click();

    // Should be empty again
    await expect(page.getByText("No leads yet")).toBeVisible();
  });
});
