import { describe, expect, it } from "vitest";
import { campusPlaces } from "../src/features/tours/campusPlaces";
import { withCampusPoiLocations } from "../src/features/map/campusPoiLocations";
import {
  distanceMeters,
  GEOFENCE_DEFAULTS,
  GeofenceTracker,
  type LocationFix,
} from "../src/features/map/geofence";

const places = withCampusPoiLocations(campusPlaces.map((place) => ({
  ...place,
  source: "test",
  location: null,
})));
const now = 1_800_000_000_000;
const fixAt = (coordinates: [number, number], overrides: Partial<LocationFix> = {}): LocationFix => ({
  coordinates,
  accuracy: 5,
  timestamp: now,
  source: "gps",
  ...overrides,
});

describe("campus geofence shared location processor", () => {
  it("uses the documented initial thresholds and computes distance in meters", () => {
    expect(GEOFENCE_DEFAULTS).toMatchObject({
      enterRadiusMeters: 30,
      exitRadiusMeters: 45,
      maxAccuracyMeters: 25,
      maxAgeMs: 15_000,
      minProcessingIntervalMs: 5_000,
      confirmations: 2,
    });
    expect(distanceMeters([0, 0], [0, 0.0001])).toBeGreaterThan(11);
    expect(distanceMeters([0, 0], [0, 0.0001])).toBeLessThan(12);
  });

  it("requires two valid fixes before confirming the closest POI", () => {
    const tracker = new GeofenceTracker();
    const place = places.find(({ title }) => title === "Khu A")!;
    const first = tracker.ingest(fixAt(place.location!.coordinates), places, now);
    expect(first.confirmedPlaceId).toBeNull();
    expect(first.activePlaceId).toBeNull();

    const second = tracker.ingest(fixAt(place.location!.coordinates, { timestamp: now + 5_000 }), places, now + 5_000);
    expect(second.confirmedPlaceId).toBe(place.id);
    expect(second.activePlaceId).toBe(place.id);
  });

  it("chooses the closest candidate and resolves exact ties by tour order", () => {
    const first = places[0];
    const tied = { ...first, id: "tie-after-first", title: "Tie after first" };
    const second = { ...first, id: "nearer", title: "Nearest", location: {
      type: "Point" as const,
      coordinates: [first.location!.coordinates[0] + 0.00015, first.location!.coordinates[1]],
    } };
    const candidates = [first, tied, second];
    const tracker = new GeofenceTracker();
    const fix = fixAt(second.location!.coordinates);
    tracker.ingest(fix, candidates, now);
    const result = tracker.ingest({ ...fix, timestamp: now + 5_000 }, candidates, now + 5_000);
    expect(result.confirmedPlaceId).toBe(second.id);

    const tieTracker = new GeofenceTracker();
    const tieFix = fixAt(first.location!.coordinates);
    tieTracker.ingest(tieFix, [first, tied], now);
    const tieResult = tieTracker.ingest({ ...tieFix, timestamp: now + 5_000 }, [first, tied], now + 5_000);
    expect(tieResult.confirmedPlaceId).toBe(first.id);
  });

  it("rejects poor accuracy, stale, future, and malformed fixes", () => {
    const tracker = new GeofenceTracker();
    const coordinates = places[0].location!.coordinates;
    expect(tracker.ingest(fixAt(coordinates, { accuracy: 26 }), places, now).reason).toBe("inaccurate");
    expect(tracker.ingest(fixAt(coordinates, { timestamp: now - 15_001 }), places, now).reason).toBe("stale");
    expect(tracker.ingest(fixAt(coordinates, { timestamp: now + 2_001 }), places, now).reason).toBe("stale");
    expect(tracker.ingest(fixAt([200, 10]), places, now).reason).toBe("invalid");
  });

  it("keeps an active POI through the 45 m exit hysteresis, then clears it", () => {
    const tracker = new GeofenceTracker();
    const place = places.find(({ title }) => title === "Khu A")!;
    tracker.ingest(fixAt(place.location!.coordinates), places, now);
    tracker.ingest(fixAt(place.location!.coordinates, { timestamp: now + 5_000 }), places, now + 5_000);

    const withinExit = tracker.ingest(fixAt([place.location!.coordinates[0], place.location!.coordinates[1] + 0.00036], { timestamp: now + 10_000 }), places, now + 10_000);
    expect(withinExit.activePlaceId).toBe(place.id);

    const outside = tracker.ingest(fixAt([106.6809, 10.759122], { timestamp: now + 15_000 }), places, now + 15_000);
    expect(outside.activePlaceId).toBeNull();
  });

  it("processes GPS and simulation fixes through the same geofence path", () => {
    const tracker = new GeofenceTracker();
    const place = places[0];
    const gpsResult = tracker.ingest(fixAt(place.location!.coordinates), places, now);
    expect(gpsResult.accepted).toBe(true);
    expect(tracker.ingest(fixAt(place.location!.coordinates, { source: "simulation", timestamp: now + 1 }), places, now + 1).reason).toBe("throttled");
    const simulationResult = tracker.ingest(fixAt(place.location!.coordinates, {
      source: "simulation",
      timestamp: now + 5_000,
    }), places, now + 5_000);
    expect(simulationResult.confirmedPlaceId).toBe(place.id);
  });
});
