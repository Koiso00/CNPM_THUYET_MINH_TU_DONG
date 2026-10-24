import type { Place } from "../tours/content";
import type { LocationFix } from "./geofence";

export function LocationControls({
  places,
  mode,
  message,
  simulationPlaceId,
  fix,
  onSimulationPlaceChange,
  onStartGps,
  onStartSimulation,
  onStop,
}: {
  places: Place[];
  mode: "off" | "gps" | "simulation";
  message: string;
  simulationPlaceId: string;
  fix: LocationFix | null;
  onSimulationPlaceChange: (placeId: string) => void;
  onStartGps: () => void;
  onStartSimulation: () => void;
  onStop: () => void;
}) {
  return (
    <section className="location-controls" aria-label="Định vị và geofence">
      <div className="location-controls-heading">
        <div>
          <strong>Định vị &amp; phát hiện địa điểm</strong>
          <span>Hai mẫu hợp lệ trong vùng 30 m sẽ mở nội dung và tự phát audio.</span>
        </div>
        {mode !== "off" && (
          <span className={`location-mode-badge is-${mode}`}>
            {mode === "gps" ? "GPS thật" : "MÔ PHỎNG"}
          </span>
        )}
      </div>
      <div className="location-control-actions">
        {mode === "off" ? (
          <button type="button" className="location-gps-button" onClick={onStartGps}>
            Bật GPS &amp; tự phát
          </button>
        ) : (
          <button type="button" className="location-stop-button" onClick={onStop}>
            Dừng định vị
          </button>
        )}
        <label className="simulation-place-select">
          <span>Điểm mô phỏng</span>
          <select
            value={simulationPlaceId}
            onChange={(event) => onSimulationPlaceChange(event.target.value)}
            disabled={mode !== "off"}
          >
            {places.filter((place) => place.location).map((place) => (
              <option key={place.id} value={place.id}>{place.title}</option>
            ))}
          </select>
        </label>
        {mode === "off" && (
          <button type="button" className="location-simulation-button" onClick={onStartSimulation}>
            Mô phỏng &amp; tự phát
          </button>
        )}
      </div>
      <p className="location-status" role="status" aria-live="polite">{message}</p>
      {fix && (
        <p className="location-fix-meta">
          {fix.source === "simulation" ? "Dữ liệu mô phỏng — không ghi vào thống kê thật" : "GPS chỉ xử lý trong trình duyệt — không lưu hành trình vị trí"}
          {` · Sai số ±${Math.round(fix.accuracy)} m`}
        </p>
      )}
      <p className="location-threshold-note">
        Ngưỡng geofence đang dùng: vào 30 m, ra 45 m, sai số tối đa 25 m. Trên một số điện thoại, trình duyệt có thể yêu cầu bạn nhấn Phát.
      </p>
    </section>
  );
}
