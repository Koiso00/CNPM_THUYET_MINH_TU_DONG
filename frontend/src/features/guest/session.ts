import { ApiError } from "../auth/client";

const VISITOR_KEY = "sgu.guest.visitor_id";
const JOURNEY_KEY = "sgu.guest.journey_id";
const VISIT_DAY_KEY = "sgu.guest.visit_day";

function newId(): string {
  return crypto.randomUUID();
}

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage-disabled/private browsing still supports the current session.
  }
}

async function post(body: Record<string, unknown>) {
  const response = await fetch("/api/v1/events/guest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new ApiError(response.status, await response.text());
  return (await response.json()) as { accepted: boolean };
}

export class GuestSession {
  visitorId = read(VISITOR_KEY) ?? newId();
  journeyId = read(JOURNEY_KEY);

  constructor() {
    write(VISITOR_KEY, this.visitorId);
  }

  async recordVisit() {
    const day = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(new Date());
    if (read(VISIT_DAY_KEY) === day) return;
    await post({ event_id: newId(), visitor_id: this.visitorId, event_type: "visit" });
    write(VISIT_DAY_KEY, day);
  }

  async startJourney() {
    const journeyId = newId();
    await post({
      event_id: newId(),
      visitor_id: this.visitorId,
      journey_id: journeyId,
      event_type: "journey_started",
    });
    this.journeyId = journeyId;
    write(JOURNEY_KEY, journeyId);
  }

  async recordAudio(placeId: string, releaseId: string) {
    if (!this.journeyId) return;
    await post({
      event_id: newId(),
      visitor_id: this.visitorId,
      journey_id: this.journeyId,
      place_id: placeId,
      release_id: releaseId,
      event_type: "audio_played",
    });
  }

  async recordQr(placeId: string, releaseId: string, eventId = newId()) {
    if (!this.journeyId) return;
    await post({
      event_id: eventId,
      visitor_id: this.visitorId,
      journey_id: this.journeyId,
      place_id: placeId,
      release_id: releaseId,
      event_type: "qr_scanned",
    });
  }
}
