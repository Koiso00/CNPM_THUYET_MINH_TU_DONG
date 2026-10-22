import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const password = "only-for-isolated-e2e-12345";

test("manages a disposable account from the separate system page", async ({
  page,
}, info) => {
  await login(page);
  const username = `managed_${info.project.name}_${Date.now()}`;
  const csrf = await page.request.get("/api/v1/auth/csrf");
  const created = await page.request.post("/api/v1/auth/register", {
    headers: { "X-CSRF-Token": (await csrf.json()).csrf_token },
    data: { username, password },
  });
  expect(created.status()).toBe(201);
  await page.getByRole("link", { name: "Admin", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Quản trị hệ thống" }),
  ).toBeVisible();
  await expect(page.getByLabel("Vai trò e2e_admin")).toBeDisabled();
  await page.getByLabel(`Vai trò ${username}`).selectOption("creator");
  await page.getByLabel(`Hoạt động ${username}`).uncheck();
  await page
    .getByRole("button", { name: `Lưu ${username}`, exact: true })
    .click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: `Đã cập nhật tài khoản ${username}` }),
  ).toBeVisible();
  const users = await page.request.get(
    "/api/v1/admin/users?offset=0&limit=100",
  );
  const stored = (await users.json()).find(
    (item: { username: string }) => item.username === username,
  );
  expect(stored.role).toBe("creator");
  expect(stored.is_active).toBe(false);
  await expect(page.getByRole("button", { name: "Làm mới số liệu" })).toBeEnabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: info.outputPath("management.png"),
    fullPage: true,
  });
  await page.goto("/#/admin");
  await expect(
    page.getByRole("heading", { name: "Nội dung khuôn viên" }),
  ).toBeVisible();
  await expect(page.getByRole("region", { name: "Dashboard" })).toHaveCount(0);
  await expect(
    page.getByRole("region", { name: "Quản lý tài khoản" }),
  ).toHaveCount(0);
});


async function login(page: import("@playwright/test").Page) {
  await page.goto("/#/login");
  await page.getByLabel("Tên đăng nhập").fill("e2e_admin");
  await page.getByLabel("Mật khẩu", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Xin chào, e2e_admin" }),
  ).toBeVisible();
}

test("plays actual GridFS audio, switches place, edits draft and publishes from UI", async ({
  page,
}, info) => {
  await login(page);
  const audio = page.locator("audio");
  await audio.evaluate(async (node: HTMLAudioElement) => {
    await node.play();
  });
  await expect
    .poll(() => audio.evaluate((node: HTMLAudioElement) => node.currentTime))
    .toBeGreaterThan(0);
  await audio.evaluate((node: HTMLAudioElement) => node.pause());
  await page
    .getByRole("article", { name: "Khu B", exact: true })
    .getByRole("button")
    .click();
  await expect(page.getByLabel("Nghe Khu B")).toBeVisible();
  expect(await page.locator("audio").count()).toBe(1);
  await page.goto("/#/admin");
  const description = page.getByLabel("Nội dung thuyết minh");
  const original = await description.inputValue();
  await description.fill(
    original + "\nNội dung kiểm thử riêng, sẽ được khôi phục.",
  );
  await expect(
    page.getByRole("button", { name: "Công bố phiên bản đã lưu" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Lưu bản nháp" }).click();
  await expect(page.getByRole("status")).toContainText("Đã lưu bản nháp");
  const published = await page.request.get("/api/v1/content/campus");
  expect((await published.json()).places[0].description).toBe(original);
  // Restore selected source, then replace its MP3 through the browser file input.
  await description.fill(original);
  await page.getByRole("button", { name: "Lưu bản nháp" }).click();
  await expect(
    page.getByRole("button", { name: "Công bố phiên bản đã lưu" }),
  ).toBeEnabled();
  const directory = resolve("..", "data", "generated", "audio", "vi-male");
  const manifest = JSON.parse(
    readFileSync(resolve(directory, "manifest.json"), "utf8"),
  );
  await page
    .getByLabel("Thay MP3 Khu A", { exact: true })
    .setInputFiles(resolve(directory, manifest.entries[0].file));
  await expect(page.getByRole("status")).toContainText("Đã tải MP3");
  await page.getByRole("button", { name: "Công bố phiên bản đã lưu" }).click();
  await expect(page.getByRole("status")).toContainText("Đã công bố");
  await expect(
    page.getByRole("button", { name: "Tải lại bản nháp" }),
  ).toBeEnabled();
  await page.getByRole("link", { name: "Quản trị", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Quản trị hệ thống" }),
  ).toBeVisible();
  await expect(page.getByRole("region", { name: "Dashboard" })).toContainText(
    "10",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: info.outputPath("admin-demo.png"),
    fullPage: true,
  });
  await page.getByRole("link", { name: "Khám phá", exact: true }).click();
  await page.locator("audio").evaluate(async (node: HTMLAudioElement) => {
    await node.play();
  });
  await expect
    .poll(() =>
      page
        .locator("audio")
        .evaluate((node: HTMLAudioElement) => node.currentTime),
    )
    .toBeGreaterThan(0);
  await page
    .locator("audio")
    .evaluate((node: HTMLAudioElement) => node.pause());
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: info.outputPath("explore-demo.png"),
    fullPage: true,
  });
});

test("Creator submits a full-tour proposal for Admin review before publication", async ({ page }) => {
  await page.goto("/#/login");
  await page.getByLabel("Tên đăng nhập").fill("e2e_creator");
  await page.getByLabel("Mật khẩu", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Xin chào, e2e_creator" })).toBeVisible();
  const publishedBefore = await page.request.get("/api/v1/content/campus");
  const publicDescription = (await publishedBefore.json()).places[0].description;
  await page.goto("/#/creator");
  await page.getByRole("button", { name: "Tạo từ bản nháp hiện tại" }).click();
  const proposalTitle = `Đề xuất-${Date.now()}`;
  const proposalMarker = `Nội dung Creator ${Date.now()}`;
  const originalTitle = await page.getByLabel("Tên tour").inputValue();
  await page.getByLabel("Tên tour").fill(proposalTitle);
  const description = page.getByLabel("Nội dung thuyết minh").first();
  const original = await description.inputValue();
  await description.fill(original + `\n${proposalMarker}`);
  await page.getByRole("button", { name: "Lưu đề xuất" }).click();
  await expect(page.getByRole("status")).toContainText("Đã lưu đề xuất riêng");
  await page.getByRole("button", { name: "Gửi Admin duyệt" }).click();
  await expect(page.getByRole("status")).toContainText("Đã gửi toàn bộ đề xuất");
  await page.getByRole("button", { name: "Đăng xuất" }).click();

  await page.getByLabel("Tên đăng nhập").fill("e2e_admin");
  await page.getByLabel("Mật khẩu", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Xin chào, e2e_admin" })).toBeVisible();
  await page.goto("/#/explore");
  await page.getByRole("link", { name: "Admin", exact: true }).click();
  await page.getByRole("link", { name: "Nội dung", exact: true }).click();
  await page.getByRole("button", { name: `${proposalTitle} · 10 địa điểm` }).click();
  await page.getByRole("button", { name: "Duyệt đề xuất" }).click();
  await page.getByRole("button", { name: "Đưa vào nháp Nội dung" }).click();
  await expect(page.getByText("Đã đưa đề xuất vào nháp Nội dung. Công bố vẫn cần thao tác riêng.")).toBeVisible();
  const publicBeforePublish = await page.request.get("/api/v1/content/campus");
  expect((await publicBeforePublish.json()).places[0].description).toBe(publicDescription);
  const publishResponse = page.waitForResponse((response) =>
    response.url().endsWith("/api/v1/admin/campus/publish"),
  );
  await page.getByRole("button", { name: "Công bố phiên bản đã lưu" }).click();
  const publishedResult = await publishResponse;
  expect(publishedResult.status(), await publishedResult.text()).toBe(200);
  await expect(page.getByText("Đã công bố phiên bản mới cho người tham quan.")).toBeVisible();
  const publicAfterPublish = await page.request.get("/api/v1/content/campus");
  expect((await publicAfterPublish.json()).places[0].description).toBe(original + `\n${proposalMarker}`);
  // Restore this isolated fixture so the next viewport can exercise its matching audio.
  await page.getByLabel("Tên tour").fill(originalTitle);
  await page.getByLabel("Nội dung thuyết minh").fill(original);
  await page.getByRole("button", { name: "Lưu bản nháp" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Đã lưu bản nháp" })).toBeVisible();
  await page.getByRole("button", { name: "Công bố phiên bản đã lưu" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Đã công bố" })).toBeVisible();
});

