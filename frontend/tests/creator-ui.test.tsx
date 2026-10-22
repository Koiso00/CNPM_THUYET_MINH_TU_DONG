import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { AuthClient } from "../src/features/auth/client";
import { CreatorPage } from "../src/features/creator/CreatorPage";

const place = {
  id: "04baf991-4a9d-44cc-9802-fc634711ed35",
  title: "Khu A",
  description: "Bản mô tả gốc",
  source: "Tư liệu nguồn",
  location: null,
};
const source = {
  revision: 4,
  draft: { title: "Tour khuôn viên", language: "vi" as const, places: [place] },
  published_release_id: "release-old",
};

it("saves a separate full-tour proposal before sending it for review", async () => {
  const client = new AuthClient();
  const get = vi.spyOn(client, "get").mockImplementation(async (path) =>
    path === "/creator/campus" ? source : [],
  );
  const mutate = vi.spyOn(client, "mutate").mockImplementation(async (path, body) => ({
    id: "c7e84b6a-171f-4313-898a-1a94a5c37cd4",
    draft: (body as { draft?: typeof source.draft }).draft ?? source.draft,
    base_revision: 4,
    revision: path.endsWith("/submit") ? 2 : 1,
    status: path.endsWith("/submit") ? "pending" : "draft",
    review_note: null,
  }));

  render(<CreatorPage client={client} />);
  expect(await screen.findByRole("heading", { name: "Đề xuất nội dung toàn tour" })).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Tạo từ bản nháp hiện tại" }));
  await userEvent.click(screen.getByRole("button", { name: "Lưu đề xuất" }));
  expect(await screen.findByText("Đã lưu đề xuất riêng. Bản đang công bố chưa thay đổi.")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Gửi Admin duyệt" }));
  expect(await screen.findByText("Đã gửi toàn bộ đề xuất cho Admin xem xét.")).toBeInTheDocument();
  expect(get).toHaveBeenCalledWith("/creator/campus");
  expect(mutate).toHaveBeenNthCalledWith(1, "/creator/submissions", expect.objectContaining({ base_revision: 4 }), "POST");
  expect(mutate).toHaveBeenNthCalledWith(2, "/creator/submissions/c7e84b6a-171f-4313-898a-1a94a5c37cd4/submit", { revision: 1 });
});
