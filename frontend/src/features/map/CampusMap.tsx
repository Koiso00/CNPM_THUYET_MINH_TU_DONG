import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import type { Place } from "../tours/content";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import { CAMPUS_MAP_CENTER, createCampusMapStyle } from "./campusMapConfig";
import { campusPoiMarkerSymbol } from "./campusPoiLocations";
import type { LocationFix } from "./geofence";

type MapStatus = "loading" | "ready" | "error";

export function CampusMap({
  places,
  selectedPlaceId,
  onSelectPlace,
  currentFix,
}: {
  places: Place[];
  selectedPlaceId: string | null;
  onSelectPlace: (placeId: string) => void;
  currentFix: LocationFix | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<{ remove: () => void }[]>([]);
  const userMarkerRef = useRef<{ remove: () => void } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<MapStatus>("loading");
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let map: MapLibreMap | null = null;
    let hadLoadError = false;
    setStatus("loading");
    setMapLoaded(false);

    if (typeof WebGL2RenderingContext === "undefined") {
      setStatus("error");
      return () => {
        cancelled = true;
      };
    }

    void import("maplibre-gl")
      .then(({ Map, NavigationControl, setWorkerUrl }) => {
        if (cancelled || !containerRef.current) return;

        setWorkerUrl(workerUrl);
        map = new Map({
          container: containerRef.current,
          style: createCampusMapStyle(),
          center: CAMPUS_MAP_CENTER,
          zoom: 17,
          minZoom: 14,
          maxZoom: 19,
          attributionControl: { compact: false },
          dragRotate: false,
          touchPitch: false,
          pitchWithRotate: false,
          maxPitch: 0,
        });
        mapRef.current = map;
        map.addControl(new NavigationControl({ showCompass: false }), "top-right");

        map.on("error", () => {
          hadLoadError = true;
          setStatus("error");
        });
        map.once("load", () => {
          if (!cancelled) setMapLoaded(true);
        });
        map.once("idle", () => {
          if (!cancelled && !hadLoadError) setStatus("ready");
        });
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current = null;
      map?.remove();
    };
  }, [attempt]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    let cancelled = false;

    void import("maplibre-gl").then(({ Marker }) => {
      if (cancelled || mapRef.current !== map) return;
      markersRef.current = places.flatMap((place, index) => {
        if (!place.location) return [];
        const element = document.createElement("button");
        element.type = "button";
        element.className = `campus-poi-marker${place.id === selectedPlaceId ? " is-selected" : ""}`;
        element.setAttribute("aria-label", `Điểm ${index + 1}: ${place.title}`);
        element.title = place.title;
        element.textContent = campusPoiMarkerSymbol(place.title);
        if (/^Khu [A-E]$/.test(place.title)) {
          element.classList.add("campus-poi-marker-letter");
        }
        element.addEventListener("click", () => onSelectPlace(place.id));

        return [
          new Marker({ element, anchor: "bottom" })
            .setLngLat(place.location.coordinates)
            .addTo(map),
        ];
      });
    });

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [mapLoaded, onSelectPlace, places, selectedPlaceId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !currentFix) {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      return;
    }

    let cancelled = false;
    userMarkerRef.current?.remove();
    void import("maplibre-gl").then(({ Marker }) => {
      if (cancelled || mapRef.current !== map) return;
      const element = document.createElement("span");
      element.className = `campus-user-location-marker is-${currentFix.source}`;
      element.setAttribute("role", "img");
      element.setAttribute(
        "aria-label",
        currentFix.source === "simulation" ? "Vị trí mô phỏng" : "Vị trí GPS hiện tại",
      );
      element.title = currentFix.source === "simulation" ? "Vị trí mô phỏng" : "Vị trí GPS hiện tại";
      userMarkerRef.current = new Marker({ element, anchor: "center" })
        .setLngLat(currentFix.coordinates)
        .addTo(map);
      map.easeTo({ center: currentFix.coordinates, duration: 450 });
    });

    return () => {
      cancelled = true;
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
    };
  }, [currentFix, mapLoaded]);

  return (
    <div className="campus-map-view">
      <div
        className="campus-map-canvas"
        ref={containerRef}
        role="application"
        aria-label="Bản đồ nền Stadia Maps khu vực cơ sở chính Đại học Sài Gòn"
      />
      <div className="campus-map-status" aria-live="polite">
        {status === "loading" && <span>Đang tải bản đồ khu vực cơ sở chính…</span>}
        {status === "error" && (
          <div role="alert">
            <span>Không tải được bản đồ. Kiểm tra kết nối Internet rồi thử lại.</span>
            <button type="button" onClick={() => setAttempt((value) => value + 1)}>
              Tải lại bản đồ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
