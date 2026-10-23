import type { Place } from "../tours/content";

// Coordinates supplied by the user on 24/10/2026. Input was latitude,
// longitude; GeoJSON and MapLibre use longitude, latitude.
const suppliedCoordinates = {
  "Khu A": [106.682541, 10.759122],
  "Khu B": [106.682356, 10.759491],
  "Khu C": [106.682195, 10.759942],
  "Khu Hiệu bộ": [106.682482, 10.760319],
  "Khu D": [106.681817, 10.760213],
  "Khu E": [106.681905, 10.759035],
  "Căng tin": [106.682031, 10.759639],
  "Khu KLF và khu tự học": [106.682597, 10.75985],
  "Bãi giữ xe": [106.681704, 10.75941],
  "Khu sân thể thao": [106.681597, 10.7597],
} as const satisfies Record<string, readonly [number, number]>;

export function withCampusPoiLocations(places: Place[]): Place[] {
  return places.map((place) => {
    const coordinates =
      suppliedCoordinates[place.title as keyof typeof suppliedCoordinates];
    if (!coordinates) return place;
    return {
      ...place,
      location: { type: "Point", coordinates: [...coordinates] },
    };
  });
}

export function campusPoiMarkerSymbol(title: string): string {
  const campusBlock = title.match(/^Khu ([A-E])$/);
  if (campusBlock) return campusBlock[1];
  if (title === "Căng tin") return "🍴";
  if (title.toLowerCase().includes("klf")) return "📚";
  if (title === "Bãi giữ xe") return "🅿️";
  if (title.toLowerCase().includes("thể thao")) return "⚽";
  return "🏫";
}
