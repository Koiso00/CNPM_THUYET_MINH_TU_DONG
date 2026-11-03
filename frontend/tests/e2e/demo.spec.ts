import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const password = "only-for-isolated-e2e-12345";

test("guest returns to welcome, starts a journey, reloads and reuses visitor id across tabs", async ({
  page,
  context,
}) => {
  const visitRequest = page.waitForResponse((response) =>
    response.url().includes("/api/v1/events/guest") && response.request().method() === "POST",
  );
  await page.goto("/#/welcome");
  await expect(page.getByRole("heading", { name: /mỗi góc trường/i })).toBeVisible();
  await visitRequest;
  const visitorId = await page.evaluate(() => localStorage.getItem("sgu.guest.visitor_id"));
  expect(visitorId).toBeTruthy();

  const firstJourneyRequest = page.waitForResponse((response) =>
    response.url().includes("/api/v1/events/guest") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Bắt đầu tham quan" }).click();
  const firstEvent = await firstJourneyRequest;
  expect((await firstEvent.json()).accepted).toBe(true);
  await expect(page).toHaveURL(/#\/explore$/);
  const firstJourneyId = await page.evaluate(() => localStorage.getItem("sgu.guest.journey_id"));
  expect(firstJourneyId).toBeTruthy();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Xin chào" })).toBeVisible();
  const secondTab = await context.newPage();
  await secondTab.goto("/#/welcome");
  await expect(secondTab.getByRole("heading", { name: /mỗi góc trường/i })).toBeVisible();
  expect(await secondTab.evaluate(() => localStorage.getItem("sgu.guest.visitor_id"))).toBe(visitorId);
  expect(await secondTab.evaluate(() => localStorage.getItem("sgu.guest.journey_id"))).toBe(firstJourneyId);

  const secondJourneyRequest = secondTab.waitForResponse((response) =>
    response.url().includes("/api/v1/events/guest") && response.request().method() === "POST",
  );
  await secondTab.getByRole("button", { name: "Bắt đầu tham quan" }).click();
  const secondEvent = await secondJourneyRequest;
  expect((await secondEvent.json()).accepted).toBe(true);
  const secondJourneyId = await secondTab.evaluate(() => localStorage.getItem("sgu.guest.journey_id"));
  expect(secondJourneyId).toBeTruthy();
  expect(secondJourneyId).not.toBe(firstJourneyId);
});

test("shows dashboard without account management", async ({ page }, info) => {
  await login(page);
  await page.getByRole("link", { name: "Admin", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Quản trị hệ thống" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Quản lý tài khoản" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Làm mới số liệu" })).toBeEnabled();
  await page.screenshot({ path: info.outputPath("management.png"), fullPage: true });
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

test("retired Creator route opens Admin authoring without a review queue", async ({ page }) => {
  await login(page);
  await page.goto("/#/creator");
  await expect(page.getByRole("heading", { name: "Nội dung khuôn viên" })).toBeVisible();
  await expect(page).toHaveURL(/#\/admin$/);
  await expect(page.getByRole("button", { name: "Lưu bản nháp" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Duyệt đề xuất" })).toHaveCount(0);
  expect((await page.request.get("/api/v1/creator/campus")).status()).toBe(404);
  expect((await page.request.get("/api/v1/admin/submissions")).status()).toBe(404);
});
