import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const password = "only-for-isolated-e2e-12345";

async function login(page: Page, username: string) {
  await page.goto("/#/login");
  await page.getByLabel("Tên đăng nhập").fill(username);
  await page.getByLabel("Mật khẩu", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: `Xin chào, ${username}.` }),
  ).toBeVisible();
}

test("register, login, reload, parallel tabs, logout and desktop/mobile layout", async ({
  page,
  context,
}, testInfo) => {
  const username = `demo_${testInfo.project.name}_${Date.now()}`;
  await page.goto("/#/register");
  await page.getByLabel("Tên đăng nhập").fill(username);
  await page.getByLabel("Mật khẩu", { exact: true }).fill(password);
  await page.getByLabel("Nhập lại mật khẩu").fill(password);
  await page
    .getByRole("button", { name: "Tạo tài khoản", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Tạo tài khoản thành công",
  );
  await page.getByLabel("Mật khẩu", { exact: true }).fill(password);
  await page.getByLabel("Nhập lại mật khẩu").fill(password);
  await page
    .getByRole("button", { name: "Tạo tài khoản", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("đã được sử dụng");
  await login(page, username);
  const cookies = await context.cookies();
  expect(cookies.find((cookie) => cookie.name === "sgu_access")?.httpOnly).toBe(
    true,
  );
  expect(
    cookies.find((cookie) => cookie.name === "sgu_refresh")?.httpOnly,
  ).toBe(true);
  expect(
    await page.evaluate(() => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
    })),
  ).toEqual({ local: [], session: [] });
  await context.clearCookies({ name: "sgu_access" });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: `Xin chào, ${username}.` }),
  ).toBeVisible();
  const other = await context.newPage();
  await other.goto("/#/explore");
  await expect(
    other.getByRole("heading", { name: `Xin chào, ${username}.` }),
  ).toBeVisible();
  const refreshStatuses: number[] = [];
  for (const tab of [page, other])
    tab.on("response", (response) => {
      if (response.url().endsWith("/auth/refresh"))
        refreshStatuses.push(response.status());
    });
  await Promise.all([page.reload(), other.reload()]);
  await expect(
    page.getByRole("heading", { name: `Xin chào, ${username}.` }),
  ).toBeVisible();
  await expect(
    other.getByRole("heading", { name: `Xin chào, ${username}.` }),
  ).toBeVisible();
  expect(refreshStatuses).toEqual([200, 200]);
  await page.goto("/#/admin");
  await expect(
    page.getByRole("heading", { name: "Bạn không có quyền truy cập" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Đăng xuất", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Chào mừng bạn trở lại." }),
  ).toBeVisible();
  await expect(
    other.getByRole("heading", { name: "Chào mừng bạn trở lại." }),
  ).toBeVisible();
  await expect(other.getByRole("status")).toContainText("tab khác");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("login.png"),
    fullPage: true,
  });
});

test("admin and creator use real roles; network errors keep form data", async ({
  page,
}) => {
  await login(page, "e2e_admin");
  await page.getByRole("link", { name: "Quản trị", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Không gian quản trị" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Đăng xuất", exact: true }).click();
  await login(page, "e2e_creator");
  await page.goto("/#/admin");
  await expect(
    page.getByRole("heading", { name: "Bạn không có quyền truy cập" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Nội dung", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Nội dung của bạn" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Đăng xuất", exact: true }).click();
  await page.getByLabel("Tên đăng nhập").fill("e2e_admin");
  await page.getByLabel("Mật khẩu", { exact: true }).fill("incorrect");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("chưa đúng");
  await page.getByLabel("Mật khẩu", { exact: true }).fill(password);
  await page.route("**/api/v1/auth/login", (route) => route.abort());
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Không thể kết nối");
  await expect(page.getByLabel("Tên đăng nhập")).toHaveValue("e2e_admin");
});
