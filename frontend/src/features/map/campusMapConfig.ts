import type { StyleSpecification } from "maplibre-gl";

// OSM's mapped campus feature is used only as the map's initial camera center.
// It is not a surveyed coordinate for any of the ten tour locations.
export const CAMPUS_MAP_CENTER: [number, number] = [106.68214, 10.75968];

// Stadia's public style URL is safe to expose; production web apps should use
// domain-based authentication configured in the Stadia dashboard, not a key
// embedded in this client bundle.
export const MAP_TILE_TEMPLATE =
  import.meta.env.VITE_MAP_TILE_URL?.trim() ||
  "https://tiles.stadiamaps.com/tiles/alidade_bright/{z}/{x}/{y}.png";

export const MAP_ATTRIBUTION =
  '&copy; <a href="https://stadiamaps.com/attribution/" target="_blank" rel="noopener">Stadia Maps</a> ' +
  '&copy; <a href="https://openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> ' +
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';

export function createCampusMapStyle(
  tileTemplate = MAP_TILE_TEMPLATE,
): StyleSpecification {
  return {
    version: 8,
    sources: {
      basemap: {
        type: "raster",
        tiles: [tileTemplate],
        tileSize: 256,
        minzoom: 0,
        maxzoom: 20,
        attribution: MAP_ATTRIBUTION,
      },
    },
    layers: [
      {
        id: "basemap-raster",
        type: "raster",
        source: "basemap",
      },
    ],
  };
}
