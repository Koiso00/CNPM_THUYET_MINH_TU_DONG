import { useCallback, useRef, useState } from "react";
import { Icon } from "../../shared/Icons";
import type { Place } from "./content";
import { AudioPlayer, type AudioPlayerHandle } from "./AudioPlayer";
import type { GuestSession } from "../guest/session";
import { CampusMap } from "../map/CampusMap";
import { campusPoiMarkerSymbol, withCampusPoiLocations } from "../map/campusPoiLocations";
import { LocationControls } from "../map/LocationControls";
import { useCampusLocation } from "../map/useCampusLocation";
import type { LocationFix } from "../map/geofence";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView?.({ behavior: "smooth" });
}

function CampusMapPreview({
  title,
  places,
  selectedPlaceId,
  onSelectPlace,
  currentFix,
}: {
  title?: string;
  places: Place[];
  selectedPlaceId: string | null;
  onSelectPlace: (placeId: string) => void;
  currentFix: LocationFix | null;
}) {
  return (
    <section
      className="campus-map-stage"
      aria-label="Bản đồ khuôn viên"
    >
      <div className="map-stage-topline">
        <span className="map-stage-label">
          <Icon name="pin" size={15} /> BẢN ĐỒ KHUÔN VIÊN
        </span>
        <span className="map-stage-status">Nền Stadia Maps · cần Internet</span>
      </div>
      <CampusMap
        places={places}
        selectedPlaceId={selectedPlaceId}
        onSelectPlace={onSelectPlace}
        currentFix={currentFix}
      />
      <div className="map-stage-footer">
        <span>
          <i /> 10 tọa độ do người dùng cung cấp · đã kiểm chứng thực địa
        </span>
        <span>{title ? `Đang chọn: ${title}` : "Chọn biểu tượng trên bản đồ để xem mô tả"}</span>
      </div>
    </section>
  );
}

export function ExplorePage({
  username,
  notice,
  places: campusPlaces,
  releaseId,
  guest,
}: {
  username: string;
  notice?: string;
  places: Place[];
  releaseId: string;
  guest?: GuestSession;
}) {
  const mappedPlaces = withCampusPoiLocations(campusPlaces);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [autoPlayRequest, setAutoPlayRequest] = useState<{ placeId: string; id: number } | null>(null);
  const audioPlayerRef = useRef<AudioPlayerHandle>(null);
  const selectedIdRef = useRef<string | null>(null);
  const selected =
    mappedPlaces.find((place) => place.id === selectedId) ?? null;
  const audioPlace = selected?.audio_id ? selected : mappedPlaces.find((place) => place.audio_id) ?? null;

  const selectPlace = useCallback((id: string, shouldScroll = false) => {
    const place = mappedPlaces.find((item) => item.id === id);
    selectedIdRef.current = id;
    setSelectedId(id);
    setAutoPlayRequest(null);
    if (place?.audio_id) {
      audioPlayerRef.current?.playFromUserGesture(`/api/v1/audio/${releaseId}/${place.id}`);
    }
    if (shouldScroll) scrollToSection("campus-map");
  }, [mappedPlaces, releaseId]);
  const handlePlaceDetected = useCallback((id: string) => {
    selectedIdRef.current = id;
    setSelectedId(id);
    setAutoPlayRequest((request) => ({ placeId: id, id: (request?.id ?? 0) + 1 }));
  }, []);
  const location = useCampusLocation(mappedPlaces, handlePlaceDetected);

  return (
    <div className="explore-page" id="explore-top">
      <div className="explore-content">
        {notice && (
          <p role="alert" className="message error explore-notice">
            {notice}
          </p>
        )}

        <section className="explore-hero" aria-labelledby="explore-title">
          <div className="explore-hero-copy">
            <p className="explore-eyebrow">
              <span /> KHÁM PHÁ CƠ SỞ CHÍNH · ĐẠI HỌC SÀI GÒN
            </p>
            <h1 id="explore-title">
              {username ? <>Xin chào, <em>{username}</em></> : "Xin chào"}
            </h1>
            <p className="explore-lead">
              Xem nội dung giới thiệu các địa điểm trong khuôn viên, chọn nơi
              bạn muốn tìm hiểu và mở vị trí trên bản đồ.
            </p>
            <div
              className="explore-facts"
              aria-label="Thông tin nội dung hiện có"
            >
              <span>
                <i /> {campusPlaces.length} mô tả địa điểm từ nguồn
              </span>
              <span>
                <Icon name="audio" size={15} /> Tiếng Việt
              </span>
              <span>
                <Icon name="pin" size={15} /> 10 vị trí trên bản đồ
              </span>
            </div>
            <div className="explore-actions">
              <button
                className="explore-primary"
                onClick={() => scrollToSection("audio-tours")}
              >
                <Icon name="headphones" size={17} />
                Xem các địa điểm
              </button>
              <button
                className="explore-secondary"
                onClick={() => scrollToSection("campus-map")}
              >
                <Icon name="pin" size={17} />
                Sơ đồ khuôn viên
              </button>
            </div>
          </div>
          <div className="explore-hero-art" aria-label="Ảnh khuôn viên">
            <img
              src="/images/sgu-campus-wide.jpg"
              alt="Ảnh khuôn viên do người dùng cung cấp"
            />
            <div className="hero-audio-badge">
              <span className="hero-audio-symbol">
                <Icon name="headphones" size={36} />
              </span>
              <strong>SGU Campus Guide</strong>
              <span>Khám phá theo nhịp riêng của bạn</span>
            </div>
          </div>
        </section>

        <section className="map-section" id="campus-map">
          <div className="explore-section-heading map-section-heading">
            <div>
              <p className="section-kicker">
                <Icon name="pin" size={15} /> BẢN ĐỒ KHUÔN VIÊN
              </p>
              <h2>Bản đồ khuôn viên & các điểm thuyết minh</h2>
            </div>
            <span className="source-state">10 vị trí do người dùng cung cấp</span>
          </div>
          <div className="campus-explorer">
            <CampusMapPreview
              title={selected?.title}
              places={mappedPlaces}
              selectedPlaceId={selectedId}
              onSelectPlace={selectPlace}
              currentFix={location.fix}
            />
            <LocationControls
              places={mappedPlaces}
              mode={location.mode}
              message={location.message}
              simulationPlaceId={location.simulationPlaceId}
              fix={location.fix}
              onSimulationPlaceChange={location.setSimulationPlaceId}
              onStartGps={() => {
                audioPlayerRef.current?.prepareForAutomaticPlayback();
                location.startGps();
              }}
              onStartSimulation={() => {
                audioPlayerRef.current?.prepareForAutomaticPlayback();
                location.startSimulation();
              }}
              onStop={() => location.stop()}
            />
            <aside className="place-detail" aria-live="polite" hidden={!selected}>
              {selected && <>
              <div className="detail-cover">
                <img
                  src="/images/sgu-campus-wide.jpg"
                  alt="Ảnh tham khảo khuôn viên, không gắn với vị trí cụ thể"
                />
                <span>ẢNH THAM KHẢO · KHÔNG GẮN ĐỊA ĐIỂM</span>
                <strong>Khuôn viên SGU</strong>
              </div>
              <h3 className="detail-place-title">{selected.title}</h3>
                <button
                  className="detail-dismiss"
                  type="button"
                  onClick={() => {
                    selectedIdRef.current = null;
                    setSelectedId(null);
                    setAutoPlayRequest(null);
                  }}
                >
                Đóng mô tả
              </button>
              <div className="detail-meta">
                <span>Nội dung</span>
                <strong>Tiếng Việt</strong>
              </div>
              <p className="detail-source-note">
                Mô tả nguồn · tọa độ đã kiểm chứng thực địa
              </p>
              <p className="detail-description">{selected.description}</p>
              </>}
              {audioPlace && <div hidden={!!selected && !selected.audio_id}>
                <AudioPlayer
                  ref={audioPlayerRef}
                  src={`/api/v1/audio/${releaseId}/${audioPlace.id}`}
                  title={audioPlace.title}
                  autoPlayRequestId={selected?.audio_id && autoPlayRequest?.placeId === selected.id ? autoPlayRequest.id : null}
                  onPlay={(trigger) => {
                    const playingPlaceId = selectedIdRef.current;
                    if (!playingPlaceId) return;
                    if (trigger === "manual" || location.fix?.source === "gps") {
                      void guest?.recordAudio(playingPlaceId, releaseId);
                    }
                  }}
                />
              </div>}
              {selected && !selected.audio_id && (
                <p className="audio-hint">
                  Địa điểm này chưa có audio được công bố.
                </p>
              )}
            </aside>
          </div>
        </section>

        <section className="poi-section" id="audio-tours">
          <div className="explore-section-heading poi-section-heading">
            <div>
              <p className="section-kicker">NỘI DUNG THUYẾT MINH</p>
              <h2>Các khu và nội dung thuyết minh</h2>
            </div>
            <span className="source-state">
              {campusPlaces.length} mô tả · Tiếng Việt
            </span>
          </div>
          <p className="source-disclaimer">
            Nội dung lấy từ tài liệu bạn cung cấp; tọa độ marker đã được bạn kiểm chứng
            tại thực địa.
          </p>
          <div className="poi-grid">
            {campusPlaces.map((place) => (
              <article
                className={`poi-card${selectedId === place.id ? " is-selected" : ""}`}
                key={place.id}
                aria-labelledby={`poi-title-${place.id}`}
              >
                <div className="poi-card-heading">
                  <span
                    className={`poi-number${/^Khu [A-E]$/.test(place.title) ? " poi-number-letter" : ""}`}
                    aria-hidden="true"
                  >
                    {campusPoiMarkerSymbol(place.title)}
                  </span>
                  <span className="poi-language">VI · Nội dung</span>
                </div>
                <h3 id={`poi-title-${place.id}`}>{place.title}</h3>
                <p className="poi-card-description">{place.description}</p>
                <button
                  className="poi-select-button"
                  type="button"
                  aria-pressed={selectedId === place.id}
                  onClick={() => selectPlace(place.id, true)}
                >
                  {selectedId === place.id
                    ? "Đang chọn địa điểm"
                    : place.audio_id ? "Nghe thuyết minh" : "Xem nội dung"}
                  <Icon name="arrow" size={15} />
                </button>
              </article>
            ))}
          </div>
        </section>

        <aside className="explore-tip">
          <span className="tip-icon">
            <Icon name="check" size={19} />
          </span>
          <span>
            <strong>GPS và mô phỏng đều dùng cùng geofence</strong>
            <small>
              GPS chỉ bắt đầu khi bạn nhấn bật; vị trí không gửi lên máy chủ. Mô phỏng được gắn nhãn và không ghi thống kê thật. Geofence thử tự phát audio; nếu trình duyệt chặn, bạn có thể phát thủ công.
            </small>
          </span>
        </aside>
      </div>
    </div>
  );
}
