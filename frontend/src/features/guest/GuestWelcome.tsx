import { useEffect, useState } from "react";
import { Icon } from "../../shared/Icons";
import { GuestSession } from "./session";
import { translate, type AppLanguage } from "../../shared/i18n";

export function GuestWelcome({ session, onStarted, language = "vi", qrPlaceId }: { session: GuestSession; onStarted: () => void; language?: AppLanguage; qrPlaceId?: string | null }) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const [error, setError] = useState("");
  useEffect(() => {
    void session.recordVisit().catch(() =>
      setError("Chưa ghi nhận được lượt truy cập. Bạn vẫn có thể bắt đầu tham quan."),
    );
  }, [session]);

  async function start() {
    setError("");
    try {
      await session.startJourney();
      onStarted();
    } catch {
      setError("Chưa bắt đầu được hành trình. Kiểm tra kết nối và thử lại.");
    }
  }

  return (
    <div className="guest-welcome">
      <section className="guest-hero-copy" aria-labelledby="guest-welcome-title">
        <p className="guest-location-pill"><span /> {language === "en" ? "MAIN CAMPUS · SAIGON UNIVERSITY · 273 AN DUONG VUONG" : language === "ko" ? "본 캠퍼스 · 사이공대학교 · 273 안즈엉브엉" : "CƠ SỞ CHÍNH · ĐẠI HỌC SÀI GÒN · 273 AN DƯƠNG VƯƠNG"}</p>
        <h1 id="guest-welcome-title">{t("welcome")}<br /><em>{t("story")}</em></h1>
        <p className="guest-hero-lead">{t("welcomeLead")}</p>
        <div className="guest-feature-previews" aria-label={t("highlights")}>
          <article>
            <img src="/images/sgu-campus-courtyard.jpg" alt={language === "en" ? "A view of Saigon University campus" : language === "ko" ? "사이공대학교 캠퍼스 전경" : "Một góc khuôn viên Đại học Sài Gòn"} />
            <span><b>{t("place")}</b><strong>Khu A</strong><small>{t("content")}</small></span>
          </article>
          <article>
            <img src="/images/sgu-campus-wide.jpg" alt={language === "en" ? "Saigon University campus panorama" : language === "ko" ? "사이공대학교 캠퍼스 파노라마" : "Toàn cảnh khuôn viên Đại học Sài Gòn"} />
            <span><b>{t("campus")}</b><strong>{t("points")}</strong><small>{t("viAudio")}</small></span>
          </article>
        </div>
        <div className="guest-sound-note">
          <span className="guest-sound-bars" aria-hidden="true"><i /><i /><i /><i /><i /></span>
          <span><strong>{t("listenTitle")}</strong><small>{t("listenText")}</small></span>
        </div>
      </section>

      <section className="guest-start-card" aria-labelledby="guest-start-title">
        <p className="guest-card-eyebrow"><span /> {t("startEyebrow")}</p>
        <h2 id="guest-start-title">{t("welcomeTitle")}</h2>
        <p className="guest-card-intro">{t("welcomeIntro")}</p>
        {qrPlaceId && (
          <p className="message" role="status">
            {t("qrReady")}
          </p>
        )}
        {error && <p role="alert" className="message error">{error}</p>}
        <button className="guest-start-button" aria-label={language === "vi" ? "Bắt đầu tham quan" : t("start")} onClick={() => void start()}>
          <span className="guest-play-icon">▶</span> {t("start")} <Icon name="arrow" />
        </button>
        <div className="guest-benefits" aria-label={t("benefits")}>
          <span><Icon name="pin" size={17} /><b>{t("manual")}</b></span>
          <span><Icon name="arrow" size={17} /><b>{t("free")}</b></span>
          <span><Icon name="audio" size={17} /><b>{t("audio")}</b></span>
        </div>
        <div className="guest-offline-note"><Icon name="audio" size={16} /> <span>{t("online")}</span></div>
        <p className="guest-tip"><span>✦</span><span><b>{language === "vi" ? "Gợi ý:" : language === "en" ? "Tip:" : "안내:"}</b> {t("tip")}</span></p>
        <a className="guest-admin-link" href="#/login">{t("admin")}</a>
      </section>
    </div>
  );
}
