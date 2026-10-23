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
  users: 3,
  active_users: 2,
  audio_assets: 1,
  draft_places: 1,
  published_places: 0,
  published_tours: 0,
};

function adminClient() {
  const client = new AuthClient();
  vi.spyOn(client, "get").mockImplementation(async (path) => {
    if (path === "/admin/campus") return structuredClone(campus);
    if (path === "/admin/dashboard") return stats;
    if (path === "/admin/audio")
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
  expect(screen.getByRole("button", { name: "Thêm địa điểm" })).toBeEnabled();
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
  expect(client.get).not.toHaveBeenCalledWith("/admin/dashboard");
  expect(client.get).not.toHaveBeenCalledWith(
    expect.stringContaining("/admin/users"),
  );
});


it("sends selected user role and lock state without password fields", async () => {
  const client = adminClient();
  const mutate = vi.spyOn(client, "mutate").mockResolvedValue({
    id: "user-1",
    username: "visitor",
    role: "admin",
    is_active: false,
  });
  render(<ManagementPage client={client} />);
  await screen.findByLabelText("Vai trò visitor");
  fireEvent.change(screen.getByLabelText("Vai trò visitor"), {
    target: { value: "admin" },
  });
  await userEvent.click(screen.getByLabelText("Hoạt động visitor"));
  await userEvent.click(screen.getByRole("button", { name: "Lưu visitor" }));
  expect(mutate).toHaveBeenCalledWith(
    "/admin/users/user-1",
    { role: "admin", is_active: false },
    "PUT",
  );
});

it("unmounts the previous audio source when the selected place changes", async () => {
  const pause = vi
    .spyOn(HTMLMediaElement.prototype, "pause")
    .mockImplementation(() => {});
  const places = [
    { ...place, audio_id: "audio-1" },
    { ...place, id: "place-2", title: "Khu B", audio_id: "audio-2" },
  ];
  render(
    <ExplorePage username="phong" places={places} releaseId="release-1" />,
  );
  await userEvent.click(screen.getAllByRole("button", { name: "Xem nội dung" })[0]);
  expect(screen.getByLabelText("Nghe Khu A")).toHaveAttribute(
    "src",
    "/api/v1/audio/release-1/place-1",
  );
  await userEvent.click(screen.getByRole("button", { name: "Xem nội dung" }));
  expect(pause).toHaveBeenCalled();
  expect(screen.queryByLabelText("Nghe Khu A")).not.toBeInTheDocument();
  expect(screen.getByLabelText("Nghe Khu B")).toHaveAttribute(
    "src",
    "/api/v1/audio/release-1/place-2",
  );
});

it("loads dashboard and accounts independently from campus content", async () => {
  const client = adminClient();
  render(<ManagementPage client={client} />);
  await screen.findByLabelText("Vai trò visitor");
  const dashboard = screen.getByRole("region", { name: "Dashboard" });
  expect(dashboard).toHaveTextContent("Tổng tài khoản3");
  expect(
    screen.queryByLabelText("Nội dung thuyết minh"),
  ).not.toBeInTheDocument();
  expect(client.get).not.toHaveBeenCalledWith("/admin/campus");
  expect(client.get).not.toHaveBeenCalledWith("/admin/audio");
  expect(
    screen.getByRole("link", { name: "Quản trị", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});

it("keeps account edits after a failed save and prevents leaving a dirty page", async () => {
  const client = adminClient();
  vi.spyOn(client, "mutate").mockRejectedValue(new TypeError("offline"));
  render(<ManagementPage client={client} />);
  const role = await screen.findByLabelText("Vai trò visitor");
  fireEvent.change(role, { target: { value: "admin" } });
  await userEvent.click(screen.getByRole("button", { name: "Lưu visitor" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "thay đổi đang nhập vẫn được giữ",
  );
  expect(role).toHaveValue("admin");
  expect(screen.getByRole("button", { name: "Trang sau" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Lưu visitor" })).toBeEnabled();
});

it("shows a dashboard failure and retries without inventing counts", async () => {
  const client = adminClient();
  const get = vi.spyOn(client, "get");
  get.mockImplementation(async (path) => {
    if (path === "/admin/dashboard") throw new TypeError("offline");
    return [];
  });
  render(<ManagementPage client={client} />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Chưa tải được số liệu mới",
  );
  expect(document.querySelectorAll(".admin-stats article")).toHaveLength(0);
  get.mockImplementation(async (path) =>
    path === "/admin/dashboard" ? stats : [],
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Làm mới số liệu" }),
  );
  await waitFor(() =>
    expect(document.querySelectorAll(".admin-stats article")).toHaveLength(9),
  );
});

it("disables editing protected administrators", async () => {
  const client = adminClient();
  vi.spyOn(client, "get").mockImplementation(async (path) =>
    path === "/admin/dashboard"
      ? stats
      : [
          {
            id: "admin-id",
            username: "operator",
            role: "admin",
            is_active: true,
            is_protected: true,
          },
        ],
  );
  render(<ManagementPage client={client} />);
  expect(await screen.findByLabelText("Vai trò operator")).toBeDisabled();
  expect(screen.getByLabelText("Hoạt động operator")).toBeDisabled();
  expect(screen.getByRole("button", { name: "Lưu operator" })).toBeDisabled();
});

it("retries loading accounts without treating a failed request as an empty list", async () => {
  const client = adminClient();
  const get = vi.spyOn(client, "get").mockImplementation(async (path) => {
    if (path === "/admin/dashboard") return stats;
    throw new TypeError("offline");
  });
  render(<ManagementPage client={client} />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Chưa tải được danh sách",
  );
  expect(
    screen.queryByText("Không có tài khoản trong trang này."),
  ).not.toBeInTheDocument();
  get.mockImplementation(async (path) =>
    path === "/admin/dashboard"
      ? stats
      : [{ id: "user-1", username: "visitor", role: "user", is_active: true }],
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Thử tải lại tài khoản" }),
  );
  expect(await screen.findByLabelText("Vai trò visitor")).toBeInTheDocument();
});

it("pages through accounts without keeping rows from the previous page", async () => {
  const client = adminClient();
  const accounts = Array.from({ length: 21 }, (_, index) => ({
    id: `user-${index}`,
    username: `visitor${index}`,
    role: "user",
    is_active: true,
  }));
  vi.spyOn(client, "get").mockImplementation(async (path) =>
    path === "/admin/dashboard"
      ? stats
      : path.includes("offset=20")
        ? accounts.slice(20)
        : accounts.slice(0, 20),
  );
  render(<ManagementPage client={client} />);
  await screen.findByLabelText("Vai trò visitor0");
  await userEvent.click(screen.getByRole("button", { name: "Trang sau" }));
  expect(await screen.findByLabelText("Vai trò visitor20")).toBeInTheDocument();
  expect(screen.queryByLabelText("Vai trò visitor0")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Trang sau" })).toBeDisabled();
  await userEvent.click(screen.getByRole("button", { name: "Trang trước" }));
  expect(await screen.findByLabelText("Vai trò visitor0")).toBeInTheDocument();
});
