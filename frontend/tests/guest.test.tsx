import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { GuestWelcome } from "../src/features/guest/GuestWelcome";
import { GuestSession } from "../src/features/guest/session";

it("records a visit and starts a guest journey without authentication", async () => {
  const fetcher = vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
    new Response(JSON.stringify({ accepted: true }), { status: 200 }),
  );
  localStorage.clear();
  const session = new GuestSession();
  const started = vi.fn();
  render(<GuestWelcome session={session} onStarted={started} />);
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByRole("button", { name: /bắt đầu tham quan/i }));
  await waitFor(() => expect(started).toHaveBeenCalledOnce());
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(session.journeyId).toBeTruthy();
  fetcher.mockRestore();
});

it("reuses the browser visitor id", () => {
  localStorage.clear();
  const first = new GuestSession();
  const second = new GuestSession();
  expect(second.visitorId).toBe(first.visitorId);
});
