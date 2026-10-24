import type { Place } from "../tours/content";
import type { LocationFix } from "./geofence";
import type { AppLanguage } from "../../shared/i18n";

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
  language = "vi",
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
  language?: AppLanguage;
}) {
  const ko = language === "ko";
  const en = language === "en";
  const text = (vi: string, english: string, korean: string) => en ? english : ko ? korean : vi;
  const statusText = (value: string) => {
    if (!en && !ko) return value;
    if (value.startsWith("Chưa bật định vị")) return text(value, "Location is off. You can still select a stop on the map.", "위치 기능이 꺼져 있습니다. 지도에서 장소를 선택할 수 있습니다.");
    if (value.startsWith("Đang xin vị trí")) return text(value, "Requesting your location from the browser…", "브라우저에 위치 정보를 요청하는 중…");
    if (value.startsWith("Đang chờ vị trí GPS")) return text(value, "Waiting for GPS… Allow location access if prompted.", "GPS 대기 중… 요청이 표시되면 위치 접근을 허용하세요.");
    if (value.startsWith("Đã xác nhận gần ")) {
      const stop = value.match(/Đã xác nhận gần (.*?);/i)?.[1] ?? "";
      return text(value, `Confirmed near ${stop}; trying automatic audio playback. If blocked, tap Play.`, `${stop} 근처로 확인되었습니다. 오디오 자동 재생을 시도합니다. 차단되면 재생을 누르세요.`);
    }
    if (value.startsWith("Đang ở gần ")) {
      const stop = value.slice("Đang ở gần ".length).replace(/\.$/, "");
      return text(value, `Near ${stop}.`, `${stop} 근처입니다.`);
    }
    if (value.startsWith("Sai số ")) return text(value, value.replace("Sai số ", "Accuracy ").replace("; cần không quá", "; must be no more than"), value.replace("Sai số ", "오차 ").replace("; cần không quá", "; 최대 허용"));
    if (value.startsWith("Đang chờ hai mẫu")) return text(value, "Waiting for two valid location readings within 30 m of a stop.", "장소 30m 이내에서 유효한 위치 정보 두 개를 기다리는 중입니다.");
    if (value.startsWith("Đang mô phỏng đến ")) return text(value, value.replace("Đang mô phỏng đến ", "Simulating travel to ").replace("; cần hai mẫu liên tiếp để xác nhận.", "; two consecutive readings are needed to confirm."), value.replace("Đang mô phỏng đến ", "시뮬레이션 목적지: ").replace("; cần hai mẫu liên tiếp để xác nhận.", "; 확인하려면 연속된 위치 정보 두 개가 필요합니다."));
    if (value.startsWith("Bạn đã từ chối quyền vị trí")) return text(value, "You denied location access. You can use simulation or select a stop manually.", "위치 접근을 거부했습니다. 시뮬레이션을 사용하거나 장소를 직접 선택할 수 있습니다.");
    if (value.startsWith("Không lấy được vị trí GPS")) return text(value, "Could not get GPS location. Try again or select a stop manually.", "GPS 위치를 가져오지 못했습니다. 다시 시도하거나 장소를 직접 선택하세요.");
    if (value.startsWith("Đã dừng theo dõi")) return text(value, "Location tracking stopped.", "위치 추적을 중지했습니다.");
    return value;
  };
  return (
    <section className="location-controls" aria-label={text("Định vị và geofence", "Location and geofence", "위치 및 지오펜스")}>
      <div className="location-controls-heading">
        <div>
          <strong>{text("Định vị &amp; phát hiện địa điểm", "Location and stop detection", "위치 및 장소 감지")}</strong>
          <span>{text("Hai mẫu hợp lệ trong vùng 30 m sẽ mở nội dung và tự phát audio.", "Two valid readings within 30 m confirm a stop and attempt to play audio.", "30m 이내에서 유효한 위치가 두 번 확인되면 장소를 열고 오디오 재생을 시도합니다.")}</span>
        </div>
        {mode !== "off" && (
          <span className={`location-mode-badge is-${mode}`}>
            {mode === "gps" ? text("GPS thật", "Live GPS", "실제 GPS") : text("MÔ PHỎNG", "SIMULATION", "시뮬레이션")}
          </span>
        )}
      </div>
      <div className="location-control-actions">
        {mode === "off" ? (
          <button type="button" className="location-gps-button" onClick={onStartGps}>
            {text("Bật GPS & tự phát", "Enable GPS and autoplay", "GPS 켜기 및 자동 재생")}
          </button>
        ) : (
          <button type="button" className="location-stop-button" onClick={onStop}>
            {text("Dừng định vị", "Stop location", "위치 추적 중지")}
          </button>
        )}
        <label className="simulation-place-select">
          <span>{text("Điểm mô phỏng", "Simulation stop", "시뮬레이션 장소")}</span>
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
            {text("Mô phỏng & tự phát", "Simulate and autoplay", "시뮬레이션 및 자동 재생")}
          </button>
        )}
      </div>
      <p className="location-status" role="status" aria-live="polite">{statusText(message)}</p>
      {fix && (
        <p className="location-fix-meta">
          {fix.source === "simulation" ? text("Dữ liệu mô phỏng — không ghi vào thống kê thật", "Simulation data — excluded from real statistics", "시뮬레이션 데이터 — 실제 통계에 포함되지 않음") : text("GPS chỉ xử lý trong trình duyệt — không lưu hành trình vị trí", "GPS is processed in your browser — location history is not stored", "GPS는 브라우저에서 처리되며 위치 기록은 저장되지 않습니다")}
          {text(` · Sai số ±${Math.round(fix.accuracy)} m`, ` · Accuracy ±${Math.round(fix.accuracy)} m`, ` · 오차 ±${Math.round(fix.accuracy)} m`)}
        </p>
      )}
      <p className="location-threshold-note">
        {text("Ngưỡng geofence đang dùng: vào 30 m, ra 45 m, sai số tối đa 25 m. Trên một số điện thoại, trình duyệt có thể yêu cầu bạn nhấn Phát.", "Geofence: enter at 30 m, exit at 45 m, maximum accuracy error 25 m. Some mobile browsers may require you to tap Play.", "지오펜스: 진입 30m, 이탈 45m, 최대 오차 25m입니다. 일부 모바일 브라우저에서는 재생을 눌러야 할 수 있습니다.")}
      </p>
    </section>
  );
}
