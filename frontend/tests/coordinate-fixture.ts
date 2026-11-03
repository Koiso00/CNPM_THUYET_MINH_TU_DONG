import type { Place } from "../src/features/tours/content";

const coordinates: Record<string, [number, number]> = {
  "Khu A": [106.682541, 10.759122], "Khu B": [106.682356, 10.759491],
  "Khu C": [106.682195, 10.759942], "Khu D": [106.681817, 10.760213],
  "Khu E": [106.681905, 10.759035], "Khu Hiệu bộ": [106.682482, 10.760319],
  "Khu KLF và khu tự học": [106.682597, 10.75985], "Căng tin": [106.682031, 10.759639],
  "Bãi giữ xe": [106.681704, 10.75941], "Khu sân thể thao": [106.681597, 10.7597],
};

export function withTestLocations(places: Place[]): Place[] {
  return places.map((place) => ({
    ...place,
    location: { type: "Point", coordinates: coordinates[place.title] },
  }));
}
