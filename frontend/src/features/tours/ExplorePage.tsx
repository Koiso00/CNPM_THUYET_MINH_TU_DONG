import { useState } from "react";
import { Icon } from "../../shared/Icons";
import type { Place } from "./content";
import { AudioPlayer } from "./AudioPlayer";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView?.({ behavior: "smooth" });
}

function CampusMapPreview({ title }: { title: string }) {
  return (
    <section
      className="campus-map-stage"
      aria-label="Vùng dành cho sơ đồ khuôn viên"
    >
      <div className="map-stage-topline">
        <span className="map-stage-label">
          <Icon name="pin" size={15} /> SƠ ĐỒ KHUÔN VIÊN
        </span>
        <span className="map-stage-status">Đang chờ ảnh sơ đồ chính thức</span>
      </div>
      <div className="map-placeholder">
        <span className="map-placeholder-icon">
          <Icon name="pin" size={32} />
        </span>
        <p className="map-placeholder-eyebrow">KHU VỰC BẢN ĐỒ</p>
        <h3>Sơ đồ tương tác sẽ hiển thị tại đây</h3>
        <p>
          Vùng này được để sẵn để thay bằng ảnh sơ đồ khuôn viên khi bạn cung
          cấp. Chưa có tọa độ khảo sát để đặt điểm lên bản đồ.
        </p>
      </div>
      <div className="map-stage-footer">
        <span>
          <i /> Chưa bật định vị GPS
        </span>
        <span>Đang chọn: {title}</span>
      </div>
    </section>
  );
}

export function ExplorePage({
  username,
  notice,
  places: campusPlaces,
  releaseId,
}: {
  username: string;
  notice?: string;
  places: Place[];
  releaseId: string;
}) {
  const [selectedId, setSelectedId] = useState<string>(campusPlaces[0].id);
  const selected =
    campusPlaces.find((place) => place.id === selectedId) ?? campusPlaces[0];

  function selectPlace(id: string, shouldScroll = false) {
    setSelectedId(id);
    if (shouldScroll) scrollToSection("campus-map");
  }

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
              Xin chào, <em>{username}</em>
            </h1>
            <p className="explore-lead">
              Xem nội dung giới thiệu các địa điểm trong khuôn viên và chọn nơi
              bạn muốn tìm hiểu. Sơ đồ sẽ được cập nhật khi có ảnh bản đồ và vị
              trí khảo sát.
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
                <Icon name="pin" size={15} /> Bản đồ đang cập nhật
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
              <h2>Sơ đồ tương tác & các điểm thuyết minh</h2>
            </div>
            <span className="source-state">Sơ đồ đang chờ bổ sung</span>
          </div>
          <div className="campus-explorer">
            <CampusMapPreview title={selected.title} />
            <aside className="place-detail" aria-live="polite">
              <div className="detail-cover">
                <img
                  src="/images/sgu-campus-wide.jpg"
                  alt="Ảnh tham khảo khuôn viên, không gắn với vị trí cụ thể"
                />
                <span>ẢNH THAM KHẢO · KHÔNG GẮN ĐỊA ĐIỂM</span>
                <strong>Khuôn viên SGU</strong>
              </div>
              <h3 className="detail-place-title">{selected.title}</h3>
              <div className="detail-meta">
                <span>Nội dung</span>
                <strong>Tiếng Việt</strong>
              </div>
              <p className="detail-source-note">
                Mô tả nguồn · chưa đối chiếu tọa độ thực địa
              </p>
              <p className="detail-description">{selected.description}</p>
              {selected.audio_id ? (
                <AudioPlayer
                  key={`${releaseId}/${selected.id}`}
                  src={`/api/v1/audio/${releaseId}/${selected.id}`}
                  title={selected.title}
                />
              ) : (
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
              <h2>Chọn một địa điểm để tìm hiểu</h2>
            </div>
            <span className="source-state">
              {campusPlaces.length} mô tả · Tiếng Việt
            </span>
          </div>
          <p className="source-disclaimer">
            Nội dung bên dưới được lấy từ tài liệu bạn cung cấp. Vị trí mô tả
            chưa được xác minh trên sơ đồ hoặc tại thực địa.
          </p>
          <div className="poi-grid">
            {campusPlaces.map((place, index) => (
              <article
                className={`poi-card${selectedId === place.id ? " is-selected" : ""}`}
                key={place.id}
                aria-labelledby={`poi-title-${place.id}`}
              >
                <div className="poi-card-heading">
                  <span className="poi-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="poi-language">VI · Nội dung</span>
                </div>
                <h3 id={`poi-title-${place.id}`}>{place.title}</h3>
                <p>{place.description}</p>
                <button
                  className="poi-select-button"
                  type="button"
                  aria-pressed={selectedId === place.id}
                  onClick={() => selectPlace(place.id, true)}
                >
                  {selectedId === place.id
                    ? "Đang xem địa điểm"
                    : "Xem nội dung"}
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
            <strong>Thông tin vị trí sẽ được bổ sung sau khi khảo sát</strong>
            <small>
              Hiện tại bạn có thể xem các mô tả nguồn; ứng dụng chưa dùng GPS để
              xác định hoặc tự phát điểm nghe.
            </small>
          </span>
        </aside>
      </div>
    </div>
  );
}
