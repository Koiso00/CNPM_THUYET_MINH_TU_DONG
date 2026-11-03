import { useCallback, useRef, useState } from "react";
import { Icon } from "../../shared/Icons";
import type { Place } from "./content";
import { AudioPlayer, type AudioPlayerHandle } from "./AudioPlayer";
import type { GuestSession } from "../guest/session";
import { CampusMap } from "../map/CampusMap";
import { campusPoiMarkerSymbol } from "../map/campusPoiLocations";
import { LocationControls } from "../map/LocationControls";
import { useCampusLocation } from "../map/useCampusLocation";
import type { LocationFix } from "../map/geofence";
import { translate, type AppLanguage } from "../../shared/i18n";
import { getCampusEnglishDraft } from "./campusEnglishDraft";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView?.({ behavior: "smooth" });
}

function CampusMapPreview({
  title,
  places,
  selectedPlaceId,
  onSelectPlace,
  currentFix,
  language,
}: {
  title?: string;
  places: Place[];
  selectedPlaceId: string | null;
  onSelectPlace: (placeId: string) => void;
  currentFix: LocationFix | null;
  language: AppLanguage;
}) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  return (
    <section
      className="campus-map-stage"
      aria-label={t("mapNav")}
    >
      <div className="map-stage-topline">
        <span className="map-stage-label">
          <Icon name="pin" size={15} /> {t("mapLabel")}
        </span>
        <span className="map-stage-status">{t("mapStatus")}</span>
      </div>
      <CampusMap
        places={places}
        selectedPlaceId={selectedPlaceId}
        onSelectPlace={onSelectPlace}
        currentFix={currentFix}
        language={language}
      />
      <div className="map-stage-footer">
        <span>
          <i /> 10 {t("manualPoints")}
        </span>
        <span>{title ? `${t("selected")}: ${title}` : t("selectMap")}</span>
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
  language = "vi",
}: {
  username: string;
  notice?: string;
  places: Place[];
  releaseId: string;
  guest?: GuestSession;
  language?: AppLanguage;
}) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const mappedPlaces = campusPlaces;
  const translationFor = (place: Place) =>
    language === "en" ? place.translations?.en : language === "ko" ? place.translations?.ko : undefined;
  const localized = (place: Place) => {
    const persisted = translationFor(place);
    const fallback = language === "en" ? getCampusEnglishDraft(place.id, place.title) : undefined;
    return persisted ?? fallback ?? place;
  };
  const audioLanguage = (place: Place): "vi" | "en" | "ko" | null => {
    if (language !== "vi" && place.audio_by_language?.[language]) return language;
    if (place.audio_id) return "vi";
    return null;
  };
  const audioUrl = (place: Place, targetLanguage: "vi" | "en" | "ko") =>
    `/api/v1/audio/${releaseId}/${place.id}?language=${targetLanguage}`;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [autoPlayRequest, setAutoPlayRequest] = useState<{ placeId: string; id: number } | null>(null);
  const audioPlayerRef = useRef<AudioPlayerHandle>(null);
  const selectedIdRef = useRef<string | null>(null);
  const selected =
    mappedPlaces.find((place) => place.id === selectedId) ?? null;
  const audioPlace = selected && audioLanguage(selected)
    ? selected
    : mappedPlaces.find((place) => audioLanguage(place)) ?? null;

  const selectPlace = useCallback((id: string, shouldScroll = false) => {
    const place = mappedPlaces.find((item) => item.id === id);
    selectedIdRef.current = id;
    setSelectedId(id);
    setAutoPlayRequest(null);
    const targetLanguage = place ? audioLanguage(place) : null;
    if (place && targetLanguage) {
      audioPlayerRef.current?.playFromUserGesture(audioUrl(place, targetLanguage));
    }
    if (shouldScroll) scrollToSection("campus-map");
  }, [mappedPlaces, releaseId, language]);
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
              <span /> {language === "vi" ? "KHÁM PHÁ CƠ SỞ CHÍNH · ĐẠI HỌC SÀI GÒN" : language === "en" ? "EXPLORE THE MAIN CAMPUS · SAIGON UNIVERSITY" : "본 캠퍼스 둘러보기 · 사이공대학교"}
            </p>
          <h1 id="explore-title">
              {username ? <>{t("hello")}, <em>{username}</em></> : t("hello")}
            </h1>
            <p className="explore-lead">
              {t("exploreLead")}
            </p>
            <div
              className="explore-facts"
              aria-label={language === "vi" ? "Thông tin nội dung hiện có" : language === "en" ? "Available content" : "이용 가능한 콘텐츠 정보"}
            >
              <span>
                <i /> {language === "ko" ? `출처 설명 ${campusPlaces.length}개` : `${campusPlaces.length} ${t("descriptions")}`}
              </span>
              <span>
                <Icon name="audio" size={15} /> {t("contentLanguage")}
              </span>
              <span>
                <Icon name="pin" size={15} /> {language === "ko" ? "지도 위치 10개" : `10 ${t("mapPlaces")}`}
              </span>
            </div>
            <div className="explore-actions">
              <button
                className="explore-primary"
                onClick={() => scrollToSection("audio-tours")}
              >
                <Icon name="headphones" size={17} />
                {t("viewPlaces")}
              </button>
              <button
                className="explore-secondary"
                onClick={() => scrollToSection("campus-map")}
              >
                <Icon name="pin" size={17} />
                {t("campusMap")}
              </button>
            </div>
          </div>
          <div className="explore-hero-art" aria-label={language === "en" ? "Campus photo" : language === "ko" ? "캠퍼스 사진" : "Ảnh khuôn viên"}>
            <img
              src="/images/sgu-campus-wide.jpg"
              alt={language === "en" ? "Campus photo provided by the user" : language === "ko" ? "사용자가 제공한 캠퍼스 사진" : "Ảnh khuôn viên do người dùng cung cấp"}
            />
            <div className="hero-audio-badge">
              <span className="hero-audio-symbol">
                <Icon name="headphones" size={36} />
              </span>
              <strong>SGU Campus Guide</strong>
              <span>{t("footer")}</span>
            </div>
          </div>
        </section>

        <section className="map-section" id="campus-map">
          <div className="explore-section-heading map-section-heading">
            <div>
              <p className="section-kicker">
                <Icon name="pin" size={15} /> {t("mapLabel")}
              </p>
              <h2>{t("mapTitle")}</h2>
            </div>
              <span className="source-state">10 {t("mapSource")}</span>
          </div>
          <div className="campus-explorer">
            <CampusMapPreview
              title={selected ? localized(selected).title : undefined}
              places={mappedPlaces}
              selectedPlaceId={selectedId}
              onSelectPlace={selectPlace}
              currentFix={location.fix}
              language={language}
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
              language={language}
            />
            <aside className="place-detail" aria-live="polite" hidden={!selected}>
              {selected && <>
              <div className="detail-cover">
                <img
                  src="/images/sgu-campus-wide.jpg"
                  alt={language === "en" ? "Reference campus photo, not tied to a specific place" : language === "ko" ? "특정 장소와 연결되지 않은 참고 캠퍼스 사진" : "Ảnh tham khảo khuôn viên, không gắn với vị trí cụ thể"}
                />
                <span>{language === "en" ? "REFERENCE PHOTO · NO SPECIFIC PLACE" : language === "ko" ? "참고 사진 · 특정 장소 아님" : "ẢNH THAM KHẢO · KHÔNG GẮN ĐỊA ĐIỂM"}</span>
                <strong>{language === "en" ? "SGU Campus" : language === "ko" ? "SGU 캠퍼스" : "Khuôn viên SGU"}</strong>
              </div>
              <h3 className="detail-place-title">{localized(selected).title}</h3>
                <button
                  className="detail-dismiss"
                  type="button"
                  onClick={() => {
                    selectedIdRef.current = null;
                    setSelectedId(null);
                    setAutoPlayRequest(null);
                  }}
                >
                {t("close")}
              </button>
              <div className="detail-meta">
                <span>{language === "en" ? "Content" : language === "ko" ? "콘텐츠" : "Nội dung"}</span>
                <strong>{translationFor(selected) ? (language === "en" ? "English" : "한국어") : t("contentLanguage")}</strong>
              </div>
              <p className="detail-source-note">
                {t("sourceNote")}
              </p>
              <p className="detail-description">{localized(selected).description}</p>
              {language === "en" && !translationFor(selected) && <p className="audio-hint">{t("englishAudioNote")}</p>}
              </>}
              {audioPlace && <div hidden={!!selected && !audioLanguage(selected)}>
                <AudioPlayer
                  ref={audioPlayerRef}
                  src={audioUrl(audioPlace, audioLanguage(audioPlace) ?? "vi")}
                  title={localized(audioPlace).title}
                  autoPlayRequestId={selected && audioLanguage(selected) && autoPlayRequest?.placeId === selected.id ? autoPlayRequest.id : null}
                  language={language}
                  onPlay={(trigger) => {
                    const playingPlaceId = selectedIdRef.current;
                    if (!playingPlaceId) return;
                    if (trigger === "manual" || location.fix?.source === "gps") {
                      void guest?.recordAudio(playingPlaceId, releaseId);
                    }
                  }}
                />
              </div>}
              {selected && !audioLanguage(selected) && (
                <p className="audio-hint">
                  {t("noAudio")}
                </p>
              )}
            </aside>
          </div>
        </section>

        <section className="poi-section" id="audio-tours">
          <div className="explore-section-heading poi-section-heading">
            <div>
              <p className="section-kicker">{t("narration")}</p>
              <h2>{t("placesTitle")}</h2>
            </div>
              <span className="source-state">
              {campusPlaces.length} · {t("contentLanguage")}
            </span>
          </div>
          <p className="source-disclaimer">
            {t("disclaimer")}
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
                  <span className="poi-language">{translationFor(place) ? (language === "en" ? "EN · Approved" : "KO · 승인됨") : `VI · ${language === "en" ? "Content" : language === "ko" ? "콘텐츠" : "Nội dung"}`}</span>
                </div>
                <h3 id={`poi-title-${place.id}`}>{localized(place).title}</h3>
                <p className="poi-card-description">{localized(place).description}</p>
                <button
                  className="poi-select-button"
                  type="button"
                  aria-pressed={selectedId === place.id}
                  onClick={() => selectPlace(place.id, true)}
                >
                  {selectedId === place.id
                    ? t("chosen")
                    : audioLanguage(place) ? t("listen") : t("view")}
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
            <strong>{t("geofenceTitle")}</strong>
            <small>
              {t("geofenceText")}
            </small>
          </span>
        </aside>
      </div>
    </div>
  );
}
