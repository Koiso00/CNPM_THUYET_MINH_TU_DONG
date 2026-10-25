export type QrRoute = { placeId: string | null; eventId: string | null };

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function buildPlaceQrUrl(placeId: string, pageUrl: string) {
  const appUrl = new URL(pageUrl);
  return `${appUrl.origin}${appUrl.pathname}#/welcome?poi=${encodeURIComponent(placeId)}`;
}

export function parseQrRoute(hash: string): QrRoute {
  const queryIndex = hash.indexOf("?");
  if (queryIndex < 0) return { placeId: null, eventId: null };

  const query = new URLSearchParams(hash.slice(queryIndex + 1));
  const placeIds = query.getAll("poi");
  const eventIds = query.getAll("qrEvent");
  const eventId = eventIds[0];
  return {
    placeId: placeIds.length === 1 ? placeIds[0] : null,
    eventId:
      eventIds.length === 1 && eventId && UUID_PATTERN.test(eventId)
        ? eventId
        : null,
  };
}

export function parsePlaceQrCode(
  value: string,
  allowedPlaceIds: ReadonlySet<string>,
  pageUrl: string,
): string | null {
  try {
    const candidate = new URL(value);
    const currentPage = new URL(pageUrl);
    if (
      candidate.origin !== currentPage.origin ||
      candidate.pathname !== currentPage.pathname
    )
      return null;

    const hash = candidate.hash.slice(1);
    const queryIndex = hash.indexOf("?");
    if (queryIndex < 0 || hash.slice(0, queryIndex) !== "/welcome")
      return null;

    const query = new URLSearchParams(hash.slice(queryIndex + 1));
    const placeIds = query.getAll("poi");
    if (placeIds.length !== 1 || !allowedPlaceIds.has(placeIds[0]))
      return null;
    return placeIds[0];
  } catch {
    return null;
  }
}

export async function createPlaceQrAssets(
  placeId: string,
  pageUrl: string,
) {
  const QRCode = await import("qrcode");
  const url = buildPlaceQrUrl(placeId, pageUrl);
  const [png, svg] = await Promise.all([
    QRCode.toDataURL(url, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 1024,
    }),
    QRCode.toString(url, { errorCorrectionLevel: "M", margin: 2, type: "svg" }),
  ]);
  return { png, svg };
}
