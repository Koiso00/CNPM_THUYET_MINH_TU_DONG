import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { QrScanner } from "../src/features/qr/QrScanner";
import { parsePlaceQrCode, parseQrRoute } from "../src/features/qr/qr";

const publishedIds = new Set(["place-1"]);
const appUrl = "https://guide.example/index.html#/admin";
const qrUrl = "https://guide.example/index.html#/welcome?poi=place-1";

it("accepts only same-app QR links for currently published places", () => {
  expect(parsePlaceQrCode(qrUrl, publishedIds, appUrl)).toBe("place-1");
  expect(
    parsePlaceQrCode(
      "https://other.example/index.html#/welcome?poi=place-1",
      publishedIds,
      appUrl,
    ),
  ).toBeNull();
  expect(
    parsePlaceQrCode(
      "https://guide.example/index.html#/welcome?poi=not-published",
      publishedIds,
      appUrl,
    ),
  ).toBeNull();
  expect(
    parsePlaceQrCode(
      "https://guide.example/index.html#/welcome?poi=place-1&next=https://evil.example",
      publishedIds,
      appUrl,
    ),
  ).toBe("place-1");
});

it("reads QR route state and ignores malformed event ids", () => {
  expect(
    parseQrRoute(
      "#/explore?poi=place-1&qrEvent=795fbf48-0c8f-4a83-b3b2-25e42203c7b5",
    ),
  ).toEqual({
    placeId: "place-1",
    eventId: "795fbf48-0c8f-4a83-b3b2-25e42203c7b5",
  });
  expect(parseQrRoute("#/welcome?poi=place-1&qrEvent=bad").eventId).toBeNull();
  expect(parseQrRoute("#/welcome?poi=a&poi=b").placeId).toBeNull();
});

it("explains when camera access is unavailable and lets the visitor close the scanner", async () => {
  const onClose = vi.fn();
  render(
    <QrScanner
      language="en"
      onDetected={vi.fn()}
      onClose={onClose}
    />,
  );

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Camera is unavailable",
  );
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(onClose).toHaveBeenCalledOnce();
});
