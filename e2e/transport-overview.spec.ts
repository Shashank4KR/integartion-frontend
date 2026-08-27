import { test, expect } from "@playwright/test";

test.describe("Transport Overview", () => {
  test.beforeEach(async ({ page }) => {
    // Inject mock auth token and user role in localStorage
    await page.addInitScript(() => {
      window.localStorage.setItem("edtech_access_token", "mock-token-123");
      window.localStorage.setItem(
        "edtech_user",
        JSON.stringify({
          role_id: "00000000-0000-0000-0000-000000000001", // ADMIN role id
          username: "admin",
          email: "admin@edtech.com",
        }),
      );
    });

    // Mock backend endpoints
    await page.route("**/api/transport/routes", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "r1",
            route_name: "Route 1",
            status: "active",
            student_count: 50,
          },
        ]),
      });
    });

    await page.route("**/api/transport/vehicles", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "v1",
            registration_number: "KA-01-MJ-1234",
            status: "active",
          },
        ]),
      });
    });

    await page.route("**/api/transport/drivers", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "d1",
            name: "John Doe",
            assigned: true,
          },
        ]),
      });
    });
  });

  test("page loads with summary cards and charts", async ({ page }) => {
    await page.goto("/dashboard/admin/transport");

    await expect(page.locator("text=Transport Overview")).toBeVisible();
    await expect(page.locator("text=Students on Route")).toBeVisible();
    await expect(page.locator("text=Routes On Time")).toBeVisible();
  });

  test("quick navigation cards render", async ({ page }) => {
    await page.goto("/dashboard/admin/transport");

    await expect(page.getByRole("link", { name: /Transport Management/ })).toBeVisible();
    await expect(page.locator("text=Live Tracking")).toBeVisible();
  });
});
