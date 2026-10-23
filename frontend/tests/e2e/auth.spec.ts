import { expect, test } from "@playwright/test";

const password = "only-for-isolated-e2e-12345";

test("guest routes stay public and the retired signup route returns to login", async ({ page }) => {
  await page.goto("/#/management");
  await expect(page.getByRole("heading", { name: /mỗi góc trường/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Quản trị hệ thống" })).toHaveCount(0);

  await page.goto("/#/register");
  await expect(page).toHaveURL(/#\/login$/);
  await expect(page.getByRole("heading", { name: "Chào mừng bạn trở lại." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tạo tài khoản" })).toHaveCount(0);
});

test("Admin session refreshes from its HttpOnly cookie and logout returns to guest welcome", async ({
  page,
  context,
}) => {
  await page.goto("/#/login");
  await page.getByLabel("Tên đăng nhập").fill("e2e_admin");
  await page.getByLabel("Mật khẩu", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Xin chào, e2e_admin" })).toBeVisible();

  const cookies = await context.cookies();
  expect(cookies.find((cookie) => cookie.name === "sgu_access")?.httpOnly).toBe(true);
  expect(cookies.find((cookie) => cookie.name === "sgu_refresh")?.httpOnly).toBe(true);
  expect(
    await page.evaluate(() =>
      [...Object.keys(localStorage), ...Object.keys(sessionStorage)].filter((key) =>
        /token|csrf/i.test(key),
      ),
    ),
  ).toEqual([]);

  await page.getByRole("link", { name: "Admin", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Quản trị hệ thống" })).toBeVisible();
  await context.clearCookies({ name: "sgu_access" });
  await page.reload();
  await expect(page.getByRole("heading", { name: "Quản trị hệ thống" })).toBeVisible();

  await page.getByRole("button", { name: "Đăng xuất", exact: true }).click();
  await expect(page.getByRole("heading", { name: /mỗi góc trường/i })).toBeVisible();
});
