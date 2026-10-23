import type { Place } from "../tours/content";

export type LocationSource = "gps" | "simulation";
export type LocationFix = {
  coordinates: [number, number];
  accuracy: number;
  timestamp: number;
  source: LocationSource;
};

export const GEOFENCE_DEFAULTS = {
  enterRadiusMeters: 30,
  exitRadiusMeters: 45,
  maxAccuracyMeters: 25,
  maxAgeMs: 15_000,
  minProcessingIntervalMs: 5_000,
  confirmations: 2,
} as const;

export type GeofenceResult = {
  accepted: boolean;
  reason: "accepted" | "invalid" | "inaccurate" | "stale" | "throttled";
  activePlaceId: string | null;
  confirmedPlaceId: string | null;
  distanceMeters: number | null;
};

export function distanceMeters(
  first: readonly [number, number],
  second: readonly [number, number],
): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const [longitude1, latitude1] = first;
  const [longitude2, latitude2] = second;
  const latitudeDelta = radians(latitude2 - latitude1);
  const longitudeDelta = radians(longitude2 - longitude1);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(latitude1)) *
      Math.cos(radians(latitude2)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export class GeofenceTracker {
  private activePlaceId: string | null = null;
  private pendingPlaceId: string | null = null;
  private pendingCount = 0;
  private lastProcessedAt: number | null = null;

  reset() {
    this.activePlaceId = null;
    this.pendingPlaceId = null;
    this.pendingCount = 0;
    this.lastProcessedAt = null;
  }

  ingest(
    fix: LocationFix,
    places: Place[],
    now = Date.now(),
  ): GeofenceResult {
    const invalid =
      !fix.coordinates.every(Number.isFinite) ||
      fix.coordinates[0] < -180 ||
      fix.coordinates[0] > 180 ||
      fix.coordinates[1] < -90 ||
      fix.coordinates[1] > 90 ||
      !Number.isFinite(fix.accuracy) ||
      !Number.isFinite(fix.timestamp);
    const rejected = (reason: GeofenceResult["reason"]): GeofenceResult => ({
      accepted: false,
      reason,
      activePlaceId: this.activePlaceId,
      confirmedPlaceId: null,
      distanceMeters: null,
    });

    if (invalid) return rejected("invalid");
    if (fix.accuracy > GEOFENCE_DEFAULTS.maxAccuracyMeters) {
      return rejected("inaccurate");
    }
    if (
      fix.timestamp > now + 2_000 ||
      now - fix.timestamp > GEOFENCE_DEFAULTS.maxAgeMs
    ) {
      return rejected("stale");
    }
    if (
      this.lastProcessedAt !== null &&
      fix.timestamp - this.lastProcessedAt < GEOFENCE_DEFAULTS.minProcessingIntervalMs
    ) {
      return rejected("throttled");
    }
    this.lastProcessedAt = fix.timestamp;

    const candidates = places.flatMap((place, index) => {
      const coordinates = place.location?.coordinates;
      if (!coordinates) return [];
      return [{
        place,
        index,
        distance: distanceMeters(fix.coordinates, coordinates),
      }];
    });
    const nearestEntry = candidates
      .filter(({ distance }) => distance <= GEOFENCE_DEFAULTS.enterRadiusMeters)
      .sort((first, second) => first.distance - second.distance || first.index - second.index)[0];
    const active = candidates.find(({ place }) => place.id === this.activePlaceId);

    if (!nearestEntry && active && active.distance <= GEOFENCE_DEFAULTS.exitRadiusMeters) {
      this.pendingPlaceId = null;
      this.pendingCount = 0;
      return {
        accepted: true,
        reason: "accepted",
        activePlaceId: this.activePlaceId,
        confirmedPlaceId: null,
        distanceMeters: active.distance,
      };
    }

    if (!nearestEntry) {
      this.activePlaceId = null;
      this.pendingPlaceId = null;
      this.pendingCount = 0;
      return {
        accepted: true,
        reason: "accepted",
        activePlaceId: null,
        confirmedPlaceId: null,
        distanceMeters: null,
      };
    }

    if (nearestEntry.place.id === this.activePlaceId) {
      this.pendingPlaceId = null;
      this.pendingCount = 0;
      return {
        accepted: true,
        reason: "accepted",
        activePlaceId: this.activePlaceId,
        confirmedPlaceId: null,
        distanceMeters: nearestEntry.distance,
      };
    }

    if (nearestEntry.place.id === this.pendingPlaceId) {
      this.pendingCount += 1;
    } else {
      this.pendingPlaceId = nearestEntry.place.id;
      this.pendingCount = 1;
    }

    let confirmedPlaceId: string | null = null;
    if (this.pendingCount >= GEOFENCE_DEFAULTS.confirmations) {
      confirmedPlaceId = nearestEntry.place.id;
      this.activePlaceId = confirmedPlaceId;
      this.pendingPlaceId = null;
      this.pendingCount = 0;
    }

    return {
      accepted: true,
      reason: "accepted",
      activePlaceId: this.activePlaceId,
      confirmedPlaceId,
      distanceMeters: nearestEntry.distance,
    };
  }
}
