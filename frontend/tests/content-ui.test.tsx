import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { AuthClient, ApiError } from "../src/features/auth/client";
import { ContentPage } from "../src/features/content/ContentPage";
import { ManagementPage } from "../src/features/admin/ManagementPage";
import { ExploreScreen } from "../src/features/tours/ExploreScreen";
import { ExplorePage } from "../src/features/tours/ExplorePage";

const place = {
  id: "place-1",
  title: "Khu A",
  description: "Nội dung được công bố",
  source: "Nguồn do người dùng cung cấp",
  location: null,
};
const campus = {
  revision: 1,
  draft: { title: "Tour khuôn viên", language: "vi" as const, places: [place] },
  published_release_id: null,
};
const stats = {
  day: "2026-10-24",
  users: 3,
  online_visitors: 2,
  audio_assets: 1,
  draft_places: 1,
  published_places: 0,
  published_tours: 0,
  guest_visitors: 0,
  guest_journeys: 0,
  guest_audio_plays: 0,
  guest_audio_by_place: [],
};

function adminClient() {
  const client = new AuthClient();
  vi.spyOn(client, "get").mockImplementation(async (path) => {
    if (path === "/admin/campus") return structuredClone(campus);
    if (path.startsWith("/admin/dashboard")) return stats;
    if (path.startsWith("/admin/audio"))
      return [
        {
          place_id: place.id,
          title: place.title,
          audio_id: null,
          duration_seconds: null,
        },
      ];
    if (path === "/admin/submissions") return [];
    return [
      { id: "user-1", username: "visitor", role: "user", is_active: true },
    ];
  });
  return client;
}

it("authors directly as Admin without loading a Creator review queue", async () => {
  const client = adminClient();
  render(<ContentPage client={client} />);
  await screen.findByLabelText("Nội dung thuyết minh");
  expect(screen.queryByRole("button", { name: "Thêm địa điểm" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Xóa khỏi bản nháp" })).not.toBeInTheDocument();
  expect(screen.getByLabelText("Tên địa điểm")).toHaveValue("Khu A");
  expect(screen.queryByRole("button", { name: "Duyệt đề xuất" })).not.toBeInTheDocument();
  expect(client.get).not.toHaveBeenCalledWith("/admin/submissions");
});

it("loads only published API content and shows no static fallback on errors", async () => {
  const client = new AuthClient();
  const get = vi
    .spyOn(client, "get")
    .mockRejectedValue(new ApiError(404, "No release"));
  render(<ExploreScreen client={client} username="phong" />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Chưa có nội dung được công bố",
  );
  expect(screen.queryAllByRole("article")).toHaveLength(0);
  get.mockResolvedValue({
    release_id: "release",
    title: "Tour",
    language: "vi",
    places: [place],
  });
  await userEvent.click(screen.getByRole("button", { name: "Thử lại" }));
  expect(
    await screen.findByRole("article", { name: "Khu A" }),
  ).toBeInTheDocument();
});

it("keeps failed draft edits and blocks publishing unsaved changes", async () => {
  const client = adminClient();
  const mutate = vi
    .spyOn(client, "mutate")
    .mockRejectedValue(new TypeError("offline"));
  render(<ContentPage client={client} />);
  const description = await screen.findByLabelText("Nội dung thuyết minh");
  fireEvent.change(description, { target: { value: "Bản nháp mới" } });
  expect(
    screen.getByRole("button", { name: "Công bố phiên bản đã lưu" }),
  ).toBeDisabled();
  await userEvent.click(screen.getByRole("button", { name: "Lưu bản nháp" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "dữ liệu đang nhập vẫn được giữ",
  );
  expect(description).toHaveValue("Bản nháp mới");
  expect(mutate).toHaveBeenCalledWith(
    "/admin/campus",
    expect.objectContaining({ revision: 1 }),
    "PUT",
  );
});

it("saves before publishing and keeps account management separate", async () => {
  const client = adminClient();
  const mutate = vi
    .spyOn(client, "mutate")
    .mockImplementation(async (_path, body) => {
      return {
        ...campus,
        revision: 2,
        draft: (body as typeof campus).draft ?? campus.draft,
      };
    });
  render(<ContentPage client={client} />);
  const field = await screen.findByLabelText("Tên địa điểm");
  fireEvent.change(field, { target: { value: "Tên mới" } });
  await userEvent.click(screen.getByRole("button", { name: "Lưu bản nháp" }));
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Công bố phiên bản đã lưu" }),
    ).toBeEnabled(),
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Công bố phiên bản đã lưu" }),
  );
  expect(mutate).toHaveBeenLastCalledWith(
    "/admin/campus/publish",
    { revision: 2 },
    "POST",
  );
  expect(
    screen.queryByRole("region", { name: "Dashboard" }),
  ).not.toBeInTheDocument();
  expect(client.get).not.toHaveBeenCalledWith(expect.stringContaining("/admin/dashboard"));
  expect(client.get).not.toHaveBeenCalledWith(
    expect.stringContaining("/admin/users"),
  );
});



it("reuses the audio element and starts the newly selected place from the visitor tap", async () => {
  const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
    fireEvent.play(this);
    return Promise.resolve();
  });
  const load = vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
  const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  const places = [
    { ...place, audio_id: "audio-1" },
    { ...place, id: "place-2", title: "Khu B", audio_id: "audio-2" },
  ];
  const view = render(
    <ExplorePage username="phong" places={places} releaseId="release-1" />,
  );
  const audioBeforeSelection = screen.getByLabelText("Nghe Khu A");
  await userEvent.click(screen.getAllByRole("button", { name: "Nghe thuyết minh" })[0]);
  expect(play).toHaveBeenCalledOnce();
  expect(screen.getByLabelText("Nghe Khu A")).toHaveAttribute(
    "src",
    "/api/v1/audio/release-1/place-1?language=vi",
  );
  await userEvent.click(screen.getByRole("button", { name: "Nghe thuyết minh" }));
  expect(play).toHaveBeenCalledTimes(2);
  expect(pause).not.toHaveBeenCalled();
  expect(screen.getByLabelText("Nghe Khu B")).toBe(audioBeforeSelection);
  expect(screen.getByLabelText("Nghe Khu B")).toHaveAttribute(
    "src",
    "/api/v1/audio/release-1/place-2?language=vi",
  );
  view.unmount();
  play.mockRestore();
  load.mockRestore();
  pause.mockRestore();
});

it("loads dashboard without account management or campus content", async () => {
  const client = adminClient();
  render(<ManagementPage client={client} />);
  await screen.findByText("Lượt phát audio theo địa điểm");
  expect(screen.queryByRole("region", { name: "Quản lý tài khoản" })).not.toBeInTheDocument();
  expect(client.get).not.toHaveBeenCalledWith(expect.stringContaining("/admin/users"));
  const dashboard = screen.getByRole("region", { name: "Dashboard" });
  expect(dashboard).not.toHaveTextContent("Tổng tài khoản");
  expect(dashboard).toHaveTextContent("Lượt phát audio theo địa điểm");
  const get = vi.mocked(client.get);
  expect(get).toHaveBeenCalledWith(expect.stringMatching(/\/admin\/dashboard\?day=\d{4}-\d{2}-\d{2}/));
  fireEvent.change(screen.getByLabelText("Ngày thống kê"), {
    target: { value: "2026-10-20" },
  });
  await waitFor(() =>
    expect(get).toHaveBeenCalledWith("/admin/dashboard?day=2026-10-20"),
  );
  expect(
    screen.queryByLabelText("Nội dung thuyết minh"),
  ).not.toBeInTheDocument();
  expect(client.get).not.toHaveBeenCalledWith("/admin/campus");
  expect(client.get).not.toHaveBeenCalledWith("/admin/audio");
  expect(
    screen.getByRole("link", { name: "Quản trị", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});


it("shows a dashboard failure and retries without inventing counts", async () => {
  const client = adminClient();
  const get = vi.spyOn(client, "get");
  get.mockImplementation(async (path) => {
    if (path.startsWith("/admin/dashboard")) throw new TypeError("offline");
    return [];
  });
  render(<ManagementPage client={client} />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Chưa tải được số liệu mới",
  );
  expect(document.querySelectorAll(".admin-stats article")).toHaveLength(0);
  get.mockImplementation(async (path) =>
    path.startsWith("/admin/dashboard") ? stats : [],
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Làm mới số liệu" }),
  );
  await waitFor(() =>
    expect(document.querySelectorAll(".admin-stats article")).toHaveLength(8),
  );
});
