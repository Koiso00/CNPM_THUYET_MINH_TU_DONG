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

it("records a QR scan against the active visitor journey", async () => {
  const fetcher = vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
    new Response(JSON.stringify({ accepted: true }), { status: 200 }),
  );
  localStorage.clear();
  const session = new GuestSession();
  await session.startJourney();
  const eventId = "795fbf48-0c8f-4a83-b3b2-25e42203c7b5";

  await session.recordQr("place-1", "release-1", eventId);

  expect(JSON.parse(String(fetcher.mock.calls.at(-1)?.[1]?.body))).toEqual({
    event_id: eventId,
    visitor_id: session.visitorId,
    journey_id: session.journeyId,
    place_id: "place-1",
    release_id: "release-1",
    event_type: "qr_scanned",
  });
  fetcher.mockRestore();
});
