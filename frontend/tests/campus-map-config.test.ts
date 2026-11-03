import { describe, expect, it } from "vitest";
import { CAMPUS_MAP_CENTER, createCampusMapStyle } from "../src/features/map/campusMapConfig";
import { campusPoiMarkerSymbol } from "../src/features/map/campusPoiLocations";
import { withTestLocations } from "./coordinate-fixture";
import { campusPlaces } from "../src/features/tours/campusPlaces";

describe("campus map configuration", () => {
  it("centers on the mapped main campus", () => {
    expect(CAMPUS_MAP_CENTER).toEqual([106.68214, 10.75968]);
  });

  it("maps the ten user-provided latitude/longitude pairs to GeoJSON order", () => {
    const places = withTestLocations(campusPlaces.map((place) => ({
      ...place,
      source: "user supplied",
      location: null,
    })));

    expect(places.map(({ title, location }) => [title, location?.coordinates])).toEqual([
      ["Khu A", [106.682541, 10.759122]],
      ["Khu B", [106.682356, 10.759491]],
      ["Khu C", [106.682195, 10.759942]],
      ["Khu D", [106.681817, 10.760213]],
      ["Khu E", [106.681905, 10.759035]],
      ["Khu Hiệu bộ", [106.682482, 10.760319]],
      ["Khu KLF và khu tự học", [106.682597, 10.75985]],
      ["Căng tin", [106.682031, 10.759639]],
      ["Bãi giữ xe", [106.681704, 10.75941]],
      ["Khu sân thể thao", [106.681597, 10.7597]],
    ]);
    expect(places).toHaveLength(10);
    expect(places.every(({ location }) => location?.type === "Point")).toBe(true);
  });

  it("uses Stadia raster tiles with required provider and data attribution", () => {
    const style = createCampusMapStyle("https://tiles.example/{z}/{x}/{y}.png");

    expect(style.sources.basemap).toMatchObject({
      type: "raster",
      tiles: ["https://tiles.example/{z}/{x}/{y}.png"],
      tileSize: 256,
      maxzoom: 20,
    });
    expect(style.sources.basemap.attribution).toContain("Stadia Maps");
    expect(style.sources.basemap.attribution).toContain("OpenMapTiles");
    expect(style.sources.basemap.attribution).toContain("OpenStreetMap");
    expect(style.layers).toEqual([
      {
        id: "basemap-raster",
        type: "raster",
        source: "basemap",
      },
    ]);
  });

  it("defaults to Stadia Maps Alidade Bright tiles", () => {
    const style = createCampusMapStyle();
    expect(style.sources.basemap.tiles).toEqual([
      "https://tiles.stadiamaps.com/tiles/alidade_bright/{z}/{x}/{y}.png",
    ]);
  });

  it("uses letters for campus blocks and recognizable symbols for other POIs", () => {
    expect(["A", "B", "C", "D", "E"].map((letter) => campusPoiMarkerSymbol(`Khu ${letter}`))).toEqual(["A", "B", "C", "D", "E"]);
    expect(campusPoiMarkerSymbol("Căng tin")).toBe("🍴");
    expect(campusPoiMarkerSymbol("Khu KLF và khu tự học")).toBe("📚");
    expect(campusPoiMarkerSymbol("Bãi giữ xe")).toBe("🅿️");
    expect(campusPoiMarkerSymbol("Khu sân thể thao")).toBe("⚽");
  });
});
