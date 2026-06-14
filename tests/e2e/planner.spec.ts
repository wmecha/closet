import { expect, test } from "@playwright/test";

test("operator creates, edits, saves, reopens and compares scenarios", async ({
  page,
}) => {
  await page.goto("/planner");
  await expect(
    page.getByRole("heading", { name: "Stock Buy Planner" }),
  ).toBeVisible();
  await expect(page.getByText("Draft saved")).toBeVisible();

  await page.getByLabel("Scenario name").fill("KES 30,000 Test Buy");
  await page.getByLabel("Available startup capital").fill("30000");
  await page.getByLabel("Planned stock budget").fill("18000");

  await page.getByRole("tab", { name: "Expenses" }).click();
  await page.getByLabel("Expense 1 amount").fill("2000");

  await page.getByRole("tab", { name: "Category allocation" }).click();
  await page.getByLabel("Category 1 name").fill("Dresses premium");

  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Draft saved")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Scenario name")).toHaveValue(
    "KES 30,000 Test Buy",
  );
  await expect(page.getByLabel("Available startup capital")).toHaveValue(
    "30000",
  );

  await page.getByRole("button", { name: "More scenario actions" }).click();
  await page.getByRole("menuitem", { name: "Duplicate" }).click();
  await expect(page.getByLabel("Scenario name")).toHaveValue(
    "KES 30,000 Test Buy copy",
  );

  await page.getByRole("tab", { name: "Comparison" }).click();
  await expect(page.getByText("Select up to four scenarios")).toBeVisible();
  await expect(
    page.getByRole("columnheader", {
      name: "KES 30,000 Test Buy",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", {
      name: "KES 30,000 Test Buy copy",
      exact: true,
    }),
  ).toBeVisible();
});
