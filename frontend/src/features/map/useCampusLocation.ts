import { useCallback, useEffect, useRef, useState } from "react";
import type { Place } from "../tours/content";
import {
  GeofenceTracker,
  type LocationFix,
} from "./geofence";

type TrackingMode = "off" | "gps" | "simulation";
type LocationView = {
  mode: TrackingMode;
  fix: LocationFix | null;
  activePlaceId: string | null;
  message: string;
};

const initialView: LocationView = {
  mode: "off",
  fix: null,
  activePlaceId: null,
  message: "Chưa bật định vị. Bạn vẫn có thể chọn điểm thủ công trên bản đồ.",
};

export function useCampusLocation(
  places: Place[],
  onPlaceDetected: (placeId: string) => void,
) {
  const trackerRef = useRef(new GeofenceTracker());
  const watchIdRef = useRef<number | null>(null);
  const simulationTimerRef = useRef<number | null>(null);
  const [view, setView] = useState<LocationView>(initialView);
  const [simulationPlaceId, setSimulationPlaceId] = useState(places[0]?.id ?? "");

  useEffect(() => {
    setSimulationPlaceId((current) =>
      places.some((place) => place.id === current)
        ? current
        : places.find((place) => place.location)?.id ?? "",
    );
  }, [places]);

  const stop = useCallback((message = "Đã dừng theo dõi vị trí.") => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (simulationTimerRef.current !== null) {
      window.clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
    trackerRef.current.reset();
    setView((current) => ({ ...current, mode: "off", fix: null, activePlaceId: null, message }));
  }, []);

  const ingest = useCallback((fix: LocationFix) => {
    const result = trackerRef.current.ingest(fix, places);
    if (!result.accepted) {
      const message = result.reason === "inaccurate"
        ? `Sai số ${Math.round(fix.accuracy)} m; cần không quá 25 m.`
        : result.reason === "stale"
          ? "Mẫu vị trí đã cũ; đang chờ cập nhật mới."
          : result.reason === "throttled"
            ? "Đang giới hạn xử lý tối đa một mẫu mỗi 5 giây."
            : "Mẫu vị trí không hợp lệ; đang chờ cập nhật mới.";
      setView((current) => ({ ...current, fix, message }));
      return;
    }
    setView((current) => ({
      ...current,
      fix,
      activePlaceId: result.activePlaceId,
      message: result.confirmedPlaceId
        ? `Đã xác nhận gần ${places.find((place) => place.id === result.confirmedPlaceId)?.title ?? "địa điểm"}; đang thử phát audio tự động. Nếu bị chặn, hãy nhấn phát thủ công.`
        : result.activePlaceId
          ? `Đang ở gần ${places.find((place) => place.id === result.activePlaceId)?.title ?? "địa điểm"}.`
          : "Đang chờ hai mẫu vị trí hợp lệ trong phạm vi 30 m của một điểm.",
    }));
    if (result.confirmedPlaceId) onPlaceDetected(result.confirmedPlaceId);
  }, [onPlaceDetected, places]);

  const startGps = useCallback(() => {
    stop("Đang xin vị trí từ trình duyệt…");
    trackerRef.current.reset();
    if (!navigator.geolocation) {
      setView({ ...initialView, message: "Trình duyệt này không hỗ trợ định vị. Bạn có thể dùng mô phỏng hoặc chọn điểm thủ công." });
      return;
    }
    setView({ mode: "gps", fix: null, activePlaceId: null, message: "Đang chờ vị trí GPS… Hãy cho phép quyền vị trí nếu trình duyệt hỏi." });
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => ingest({
        coordinates: [position.coords.longitude, position.coords.latitude],
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
        source: "gps",
      }),
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? "Bạn đã từ chối quyền vị trí. Có thể bật mô phỏng hoặc chọn điểm thủ công."
          : error.code === error.TIMEOUT
            ? "Hết thời gian chờ GPS. Hãy thử lại ngoài trời hoặc chọn điểm thủ công."
            : "Không lấy được vị trí GPS. Hãy thử lại hoặc chọn điểm thủ công.";
        stop(message);
      },
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 20_000 },
    );
  }, [ingest, stop]);

  const startSimulation = useCallback(() => {
    const destination = places.find((place) => place.id === simulationPlaceId);
    if (!destination?.location) return;
    stop("Đang khởi động mô phỏng vị trí…");
    trackerRef.current.reset();
    const sendSample = () => ingest({
      coordinates: [...destination.location!.coordinates],
      accuracy: 5,
      timestamp: Date.now(),
      source: "simulation",
    });
    setView({ mode: "simulation", fix: null, activePlaceId: null, message: `Đang mô phỏng đến ${destination.title}; cần hai mẫu liên tiếp để xác nhận.` });
    sendSample();
    simulationTimerRef.current = window.setInterval(sendSample, 5_000);
  }, [ingest, places, simulationPlaceId, stop]);

  useEffect(() => () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    if (simulationTimerRef.current !== null) window.clearInterval(simulationTimerRef.current);
  }, []);

  return {
    ...view,
    simulationPlaceId,
    setSimulationPlaceId,
    startGps,
    startSimulation,
    stop,
  };
}
