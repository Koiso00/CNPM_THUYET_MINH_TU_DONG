import type { StyleSpecification } from "maplibre-gl";

// OSM's mapped campus feature is used only as the map's initial camera center.
// It is not a surveyed coordinate for any of the ten tour locations.
export const CAMPUS_MAP_CENTER: [number, number] = [106.68214, 10.75968];

export const OSM_TILE_TEMPLATE =
  import.meta.env.VITE_OSM_TILE_URL?.trim() ||
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export function createCampusMapStyle(
  tileTemplate = OSM_TILE_TEMPLATE,
): StyleSpecification {
  return {
    version: 8,
    sources: {
      openstreetmap: {
        type: "raster",
        tiles: [tileTemplate],
        tileSize: 256,
        minzoom: 0,
        maxzoom: 19,
        attribution: "© OpenStreetMap contributors",
      },
    },
    layers: [
      {
        id: "openstreetmap-raster",
        type: "raster",
        source: "openstreetmap",
      },
    ],
  };
}
