import { test, expect } from "@playwright/test";

test.describe("Hostel Management", () => {
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
    await page.route("**/api/hostel/dashboard/stats", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          total_rooms: 100,
          total_blocks: 4,
          active_allocations: 150,
          occupied_beds: 150,
          occupancy_percentage: 75,
          available_beds: 50,
          total_beds: 200,
        }),
      });
    });

    await page.route("**/api/hostel/blocks", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "b1",
            block_name: "Block A",
            block_type: "BOYS",
            total_rooms: 25,
            status: "ACTIVE",
          },
        ]),
      });
    });

    await page.route("**/api/hostel/rooms", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.route("**/api/hostel/allocations", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "a1",
            student_id: "s1",
            bed_id: "bed-1",
            check_in_date: "2026-08-01",
            status: "ALLOCATED",
          },
        ]),
      });
    });
  });

  test("page loads with summary cards and tables", async ({ page }) => {
    await page.goto("/dashboard/admin/hostel/management");

    await expect(page.getByRole("heading", { name: "Hostel Management" })).toBeVisible();
    await expect(page.locator("span").filter({ hasText: "Total Rooms" })).toBeVisible();
    await expect(page.locator("span").filter({ hasText: "Vacant Beds" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Student ID" })).toBeVisible();
  });
});
