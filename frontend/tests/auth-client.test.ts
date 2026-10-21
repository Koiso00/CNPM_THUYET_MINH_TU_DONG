import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, AuthClient } from "../src/features/auth/client";

export const grant = (role = "user") => ({
  user: { id: "test-user", username: "Phong", role },
  access_expires_at: new Date(Date.now() + 900000).toISOString(),
  session_expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
  csrf_token: "test-csrf",
});
export const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });
const run = <T>(work: () => Promise<T>) => work();
afterEach(() => vi.useRealTimers());

describe("AuthClient", () => {
  it("shares one in-flight refresh and keeps tokens out of browser storage", async () => {
    const storage = vi.spyOn(Storage.prototype, "setItem");
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(async (url) =>
        reply(String(url).endsWith("/csrf") ? { csrf_token: "csrf" } : grant()),
      );
    const client = new AuthClient(fetcher, run);
    await Promise.all([client.refresh(), client.refresh(), client.refresh()]);
    expect(
      fetcher.mock.calls.filter(([url]) => String(url).endsWith("/refresh")),
    ).toHaveLength(1);
    expect(client.getSnapshot().user?.username).toBe("Phong");
    expect(storage).not.toHaveBeenCalled();
    expect(fetcher.mock.calls[1][1]).toMatchObject({
      credentials: "same-origin",
      cache: "no-store",
      headers: { "X-CSRF-Token": "csrf" },
    });
  });

  it("refreshes once then retries protected GETs after 401", async () => {
    let reads = 0;
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (url) => {
      if (String(url).endsWith("/csrf")) return reply({ csrf_token: "csrf" });
      if (String(url).endsWith("/refresh")) return reply(grant());
      return ++reads === 1
        ? reply({ detail: "expired" }, 401)
        : reply({ value: 7 });
    });
    const client = new AuthClient(fetcher, run);
    expect(await client.get("/content/tours")).toEqual({ value: 7 });
    expect(reads).toBe(2);
  });

  it("does not retry a forbidden GET or endlessly retry 401", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(reply({ detail: "forbidden" }, 403));
    const client = new AuthClient(fetcher, run);
    await expect(client.get("/admin/users")).rejects.toBeInstanceOf(ApiError);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("reports server unavailability without pretending that the user logged out", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(async (url) =>
        reply(String(url).endsWith("/csrf") ? { csrf_token: "csrf" } : grant()),
      );
    const client = new AuthClient(fetcher, run);
    await client.login("Phong", "password");
    fetcher.mockRejectedValue(new TypeError("network error"));
    await expect(client.logout()).rejects.toThrow();
    expect(client.getSnapshot().status).toBe("authenticated");
  });

  it("prevents a late refresh from restoring the user after logout", async () => {
    let finish!: (value: Response) => void;
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (url) => {
      if (String(url).endsWith("/csrf")) return reply({ csrf_token: "csrf" });
      if (String(url).endsWith("/refresh"))
        return new Promise<Response>((resolve) => {
          finish = resolve;
        });
      return new Response(null, { status: 204 });
    });
    const client = new AuthClient(fetcher, run);
    const refreshing = client.refresh().catch(() => undefined);
    await vi.waitFor(() => expect(finish).toBeTypeOf("function"));
    const loggingOut = client.logout();
    finish(reply(grant()));
    await Promise.all([refreshing, loggingOut]);
    expect(client.getSnapshot().status).toBe("anonymous");
    expect(
      fetcher.mock.calls.filter(([url]) => String(url).endsWith("/logout")),
    ).toHaveLength(1);
  });

  it("retries only explicit CSRF failures, never a login timeout", async () => {
    let posts = 0;
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (url) => {
      if (String(url).endsWith("/csrf")) return reply({ csrf_token: "csrf" });
      return ++posts === 1
        ? reply({ detail: "Invalid or missing CSRF token." }, 403)
        : reply(grant());
    });
    const client = new AuthClient(fetcher, run);
    await client.login("Phong", "password");
    expect(posts).toBe(2);
    posts = 0;
    fetcher.mockImplementation(async (url) => {
      if (String(url).endsWith("/csrf")) return reply({ csrf_token: "csrf" });
      posts++;
      throw new TypeError("timeout");
    });
    await expect(client.login("Phong", "password")).rejects.toThrow();
    expect(posts).toBe(1);
  });

  it("restores the login form at absolute expiry and handles a later retry after network failure", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new TypeError("offline"));
    const client = new AuthClient(fetcher, run);
    await client.restore();
    expect(client.getSnapshot().status).toBe("unavailable");
    fetcher.mockImplementation(async (url) =>
      reply(
        String(url).endsWith("/csrf")
          ? { csrf_token: "csrf" }
          : { detail: "expired" },
        String(url).endsWith("/csrf") ? 200 : 401,
      ),
    );
    await client.restore();
    expect(client.getSnapshot().status).toBe("anonymous");
  });

  it("schedules renewal before expiry and cleans timers up on unmount", async () => {
    vi.useFakeTimers();
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(async (url) =>
        reply(String(url).endsWith("/csrf") ? { csrf_token: "csrf" } : grant()),
      );
    const client = new AuthClient(fetcher, run);
    const stop = client.start();
    await client.restore();
    expect(
      fetcher.mock.calls.filter(([url]) => String(url).endsWith("/refresh")),
    ).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(870000);
    expect(
      fetcher.mock.calls.filter(([url]) => String(url).endsWith("/refresh")),
    ).toHaveLength(2);
    stop();
    const calls = fetcher.mock.calls.length;
    await vi.advanceTimersByTimeAsync(900000);
    expect(fetcher.mock.calls).toHaveLength(calls);
  });
});
