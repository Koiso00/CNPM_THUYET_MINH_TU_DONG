import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { App } from "../src/app/App";
import { AuthPage } from "../src/features/auth/AuthPage";
import { AuthClient } from "../src/features/auth/client";

const password = "mật khẩu demo 12345";
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });
const makeGrant = (role: string) => ({
  user: { id: "user-id", username: "Phong", role },
  access_expires_at: new Date(Date.now() + 900000).toISOString(),
  session_expires_at: new Date(Date.now() + 604800000).toISOString(),
  csrf_token: "csrf",
});
const coordinate = <T,>(work: () => Promise<T>) => work();
beforeEach(() => {
  window.location.hash = "/login";
});

it("validates registration confirmation without calling the API", async () => {
  const client = new AuthClient();
  const register = vi.spyOn(client, "register");
  render(<AuthPage client={client} mode="register" />);
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Tên đăng nhập"), "Phong");
  await user.type(screen.getByLabelText("Mật khẩu", { exact: true }), password);
  await user.type(
    screen.getByLabelText("Nhập lại mật khẩu"),
    "different password",
  );
  await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));
  expect(screen.getByRole("alert")).toHaveTextContent("chưa khớp");
  expect(register).not.toHaveBeenCalled();
});

it("registers with username/password only, clears passwords and offers login", async () => {
  const fetcher = vi
    .fn<typeof fetch>()
    .mockImplementation(async (url) =>
      reply(
        String(url).endsWith("/csrf")
          ? { csrf_token: "csrf" }
          : { id: "id", username: "Phong", role: "user" },
        String(url).endsWith("/register") ? 201 : 200,
      ),
    );
  const client = new AuthClient(fetcher, coordinate);
  render(<AuthPage client={client} mode="register" />);
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Tên đăng nhập"), "Phong");
  await user.type(screen.getByLabelText("Mật khẩu", { exact: true }), password);
  await user.type(screen.getByLabelText("Nhập lại mật khẩu"), password);
  await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Tạo tài khoản thành công",
  );
  expect(screen.getByLabelText("Mật khẩu", { exact: true })).toHaveValue("");
  expect(client.getSnapshot().user).toBeNull();
  const request = fetcher.mock.calls.find(([url]) =>
    String(url).endsWith("/register"),
  );
  expect(JSON.parse(String(request?.[1]?.body))).toEqual({
    username: "Phong",
    password,
  });
});

it("keeps form values and provides a Vietnamese message on network error", async () => {
  const client = new AuthClient(
    vi.fn<typeof fetch>().mockRejectedValue(new TypeError("network failure")),
    coordinate,
  );
  render(<AuthPage client={client} mode="login" />);
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Tên đăng nhập"), "Phong");
  await user.type(screen.getByLabelText("Mật khẩu", { exact: true }), password);
  await user.click(
    screen.getByRole("button", { name: "Đăng nhập", exact: true }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Không thể kết nối",
  );
  expect(screen.getByLabelText("Tên đăng nhập")).toHaveValue("Phong");
});

it("allows showing the password without submitting the form", async () => {
  const client = new AuthClient();
  render(<AuthPage client={client} mode="login" />);
  await userEvent.click(screen.getByRole("button", { name: "Hiện mật khẩu" }));
  expect(screen.getByLabelText("Mật khẩu", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  expect(screen.getByRole("button", { name: "Ẩn mật khẩu" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

it("prevents double submission while login is pending", async () => {
  let finish!: () => void;
  const client = new AuthClient();
  const login = vi.spyOn(client, "login").mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  render(<AuthPage client={client} mode="login" />);
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Tên đăng nhập"), "Phong");
  await user.type(screen.getByLabelText("Mật khẩu", { exact: true }), password);
  await user.dblClick(
    screen.getByRole("button", { name: "Đăng nhập", exact: true }),
  );
  expect(login).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("button", { name: "Đang xử lý…" })).toBeDisabled();
  await act(async () => finish());
});

it("rejects short registration passwords before sending a request", async () => {
  const client = new AuthClient();
  const register = vi.spyOn(client, "register");
  render(<AuthPage client={client} mode="register" />);
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Tên đăng nhập"), "Phong");
  await user.type(screen.getByLabelText("Mật khẩu", { exact: true }), "short");
  await user.type(screen.getByLabelText("Nhập lại mật khẩu"), "short");
  await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));
  expect(screen.getByRole("alert")).toHaveTextContent("15 đến 128");
  expect(register).not.toHaveBeenCalled();
});

it.each(["user", "creator", "admin"])(
  "renders role %s and blocks direct admin navigation",
  async (role) => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(async (url) =>
        reply(
          String(url).endsWith("/csrf")
            ? { csrf_token: "csrf" }
            : makeGrant(role),
        ),
      );
    const client = new AuthClient(fetcher, coordinate);
    await client.login("Phong", password);
    window.location.hash = "/admin";
    render(<App client={client} />);
    if (role === "admin") {
      expect(
        await screen.findByRole("heading", { name: "Không gian quản trị" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Quản trị", exact: true }),
      ).toBeInTheDocument();
    } else {
      expect(
        await screen.findByRole("heading", {
          name: "Bạn không có quyền truy cập",
        }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: "Quản trị", exact: true }),
      ).not.toBeInTheDocument();
    }
  },
);

it("shows an unavailable screen then lets the user retry", async () => {
  const fetcher = vi
    .fn<typeof fetch>()
    .mockRejectedValue(new TypeError("offline"));
  const client = new AuthClient(fetcher, coordinate);
  render(<App client={client} />);
  expect(
    await screen.findByRole("heading", { name: "Chưa thể kết nối" }),
  ).toBeInTheDocument();
  fetcher.mockImplementation(async (url) =>
    reply(
      String(url).endsWith("/csrf")
        ? { csrf_token: "csrf" }
        : { detail: "missing" },
      String(url).endsWith("/csrf") ? 200 : 401,
    ),
  );
  await act(async () => {
    await userEvent.click(
      screen.getByRole("button", { name: /Thử kết nối lại/ }),
    );
  });
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: "Chào mừng bạn trở lại." }),
    ).toBeInTheDocument(),
  );
});
