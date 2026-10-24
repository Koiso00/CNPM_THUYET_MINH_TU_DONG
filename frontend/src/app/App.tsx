import { useEffect, useState, useSyncExternalStore } from "react";
import {
  AuthClient,
  authClient,
  authErrorMessage,
} from "../features/auth/client";
import { ExploreScreen } from "../features/tours/ExploreScreen";
import { ContentPage } from "../features/content/ContentPage";
import { ManagementPage } from "../features/admin/ManagementPage";
import { AuthPage } from "../features/auth/AuthPage";
import { Brand, Icon } from "../shared/Icons";
import { roleLabels as roles } from "../shared/WorkspaceNav";
import { GuestWelcome } from "../features/guest/GuestWelcome";
import { GuestSession } from "../features/guest/session";
import { languageNames, readLanguage, saveLanguage, translate, type AppLanguage } from "../shared/i18n";

const guestSession = new GuestSession();

function Introduction() {
  return (
    <aside className="introduction">
      <div className="intro-content">
        <span className="campus-tag">
          <span /> CƠ SỞ CHÍNH · ĐẠI HỌC SÀI GÒN
        </span>
        <h2>
          Mỗi góc trường, <br />
          một <em>câu chuyện.</em>
        </h2>
        <p>
          Chậm lại một chút, lắng nghe và khám phá
          <br className="desktop-break" /> những điều thân thuộc theo một cách
          mới.
        </p>
        <div className="campus-highlights">
          <article className="campus-photo-card">
            <img
              src="/images/sgu-campus-courtyard.jpg"
              alt="Một góc hành lang trong khuôn viên Đại học Sài Gòn"
            />
            <span className="photo-caption">
              <span>KHÔNG GIAN KHUÔN VIÊN</span>
              Những góc quen thuộc, câu chuyện mới
            </span>
          </article>
          <div className="listen-note">
            <span className="listen-icon">
              <Icon name="headphones" size={19} />
            </span>
            <span>
              <strong>Lắng nghe theo cách của bạn</strong>
              <small>Khám phá các địa điểm và câu chuyện tại SGU</small>
            </span>
            <span className="sound-bars" aria-hidden="true">
              {[8, 18, 26, 14, 30, 19, 10].map((height, i) => (
                <i key={i} style={{ height }} />
              ))}
            </span>
          </div>
        </div>
      </div>
      <span className="illustration-caption">
        Ảnh khuôn viên do người dùng cung cấp
      </span>
    </aside>
  );
}

export function App({ client = authClient }: { client?: AuthClient }) {
  const state = useSyncExternalStore(client.subscribe, client.getSnapshot);
  const [route, setRoute] = useState(window.location.hash || "#/welcome");
  const [logoutError, setLogoutError] = useState("");
  const [busy, setBusy] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [language, setLanguage] = useState<AppLanguage>(readLanguage);
  function changeLanguage(next: AppLanguage) {
    setLanguage(next);
    saveLanguage(next);
    setLanguageOpen(false);
  }
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  useEffect(() => client.start(), [client]);
  useEffect(() => {
    const changed = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", changed);
    return () => window.removeEventListener("hashchange", changed);
  }, []);
  useEffect(() => {
    if (route === "#/register") {
      window.location.hash = "/login";
      return;
    }
    if (state.status !== "authenticated") return;
    if (route === "#/creator") {
      window.location.replace(state.user?.role === "admin" ? "#/admin" : "#/explore");
      return;
    }
    if (!["#/welcome", "#/explore", "#/login", "#/admin", "#/management", "#/creator"].includes(route))
      window.location.hash = "/explore";
  }, [state.status, state.user?.role, route]);

  async function logout() {
    setBusy(true);
    setLogoutError("");
    try {
      await client.logout();
      // Người nghe là khách; sau khi Admin đăng xuất, đưa về trang chào
      // thay vì buộc mọi người quay lại màn hình đăng nhập.
      window.location.hash = "/welcome";
    } catch (error) {
      setLogoutError(
        authErrorMessage(error, "logout") + " Bạn chưa đăng xuất thành công.",
      );
    } finally {
      setBusy(false);
    }
  }
  const user = state.user;
  const guestJourney = !user && Boolean(guestSession.journeyId);
  const restricted =
    (["#/admin", "#/management"].includes(route) && user?.role !== "admin") ||
    (route === "#/creator" && user?.role !== "admin");
  const management = ["#/admin", "#/management", "#/creator"].includes(route);
  const authRoute = route === "#/login" || route === "#/register";
  const explore = (Boolean(user) || guestJourney) && !management && !authRoute && route !== "#/welcome";
  const guest = !user && !["#/login", "#/register"].includes(route);
  return (
    <div className={`site${state.status === "anonymous" && (route === "#/welcome" || !guestJourney || authRoute) ? " site-auth" : ""}`}>
      <a className="skip-link" href="#main-content">
        {translate(language, "skip")}
      </a>
      <header className={`site-header${explore ? " explore-header" : ""}`}>
        <Brand />
        {explore && (
          <nav className="explore-nav" aria-label="Điều hướng chính">
            <button
              type="button"
              aria-current="page"
              onClick={() =>
                document
                  .getElementById("explore-top")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Icon name="headphones" size={15} /> {translate(language, "explore")}
            </button>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("campus-map")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Icon name="pin" size={15} /> {translate(language, "mapNav")}
            </button>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("audio-tours")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Icon name="audio" size={15} /> {translate(language, "contentNav")}
            </button>
          </nav>
        )}
        <div className="header-right">
          {user ? (
            <>
              {user.role === "admin" ? (
                <a className="explore-role" href="#/management">
                  {roles[user.role]}
                </a>
              ) : explore && (
                <span className="explore-role">{roles[user.role]}</span>
              )}
              <span className="account-label">
                <Icon name="user" size={17} />
                {user.username}
              </span>
              <button
                className="logout-button"
                onClick={() => void logout()}
                disabled={busy}
              >
                <Icon name="logout" size={17} />
                {busy ? "Đang đăng xuất…" : "Đăng xuất"}
              </button>
            </>
          ) : (
            (guest || !explore) && <>
              <div className="language-picker">
                <button
                  type="button"
                  className="language-label"
                  aria-expanded={languageOpen}
                  aria-haspopup="listbox"
                  onClick={() => setLanguageOpen((open) => !open)}
                >
                  <Icon name="globe" size={16} />
                  <span>{translate(language, "language")}:</span>
                  <strong>{languageNames[language]} ({language.toUpperCase()})</strong>
                  <span aria-hidden="true">⌄</span>
                </button>
                {languageOpen && (
                  <div className="language-menu" role="listbox" aria-label={translate(language, "language")}>
                    {(["vi", "en", "ko"] as AppLanguage[]).map((option) => (
                      <button key={option} type="button" role="option" aria-selected={language === option} onClick={() => changeLanguage(option)}>
                        <span>{languageNames[option]}</span><small>{language === option ? "✓" : option.toUpperCase()}</small>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </header>
      <main id="main-content">
        {user && management && (logoutError || state.notice) && (
          <p role="alert" className="message error">
            {logoutError || state.notice}
          </p>
        )}
        {state.status === "checking" ? (
          <div className="state-panel" role="status">
            <span className="spinner" />
            <h1>Đang kiểm tra phiên đăng nhập…</h1>
          </div>
        ) : state.status === "unavailable" ? (
          <div className="state-panel">
            <Icon name="headphones" size={35} />
            <h1>Chưa thể kết nối</h1>
            <p role="alert">{state.notice}</p>
            <button className="primary" onClick={() => void client.restore()}>
              Thử kết nối lại <Icon name="arrow" />
            </button>
          </div>
        ) : !user && !guest ? (
          <div className="auth-layout">
            <Introduction />
            <AuthPage
              key={route === "#/register" ? "register" : "login"}
              client={client}
              mode={route === "#/register" ? "register" : "login"}
              notice={state.notice}
            />
          </div>
        ) : !user ? (
          route === "#/explore" && guestSession.journeyId ? (
            <ExploreScreen
              client={client}
              username=""
              guest={guestSession}
              notice={state.notice}
              language={language}
            />
          ) : (
            <GuestWelcome
              session={guestSession}
              language={language}
              onStarted={() => {
                window.location.hash = "/explore";
              }}
            />
          )
        ) : restricted ? (
          <div className="workspace">
            <section className="state-panel">
              <Icon name="lock" size={35} />
              <h1>Bạn không có quyền truy cập</h1>
              <p>Tài khoản hiện tại không được phép mở khu vực này.</p>
              <a className="primary" href="#/explore">
                Về trang khám phá <Icon name="arrow" />
              </a>
            </section>
          </div>
        ) : !management ? (
          <ExploreScreen
            client={client}
            username={user.username}
            notice={logoutError || state.notice}
            language={language}
          />
        ) : route === "#/admin" ? (
          <ContentPage client={client} />
        ) : (
          <ManagementPage client={client} />
        )}
      </main>
      <footer className="site-footer">
        <span>
          SGU Campus Guide <span className="footer-dot">·</span> {translate(language, "footer")}
        </span>
        <span>{language === "en" ? "Main Campus · Saigon University" : language === "ko" ? "본 캠퍼스 · 사이공대학교" : "Cơ sở chính · Đại học Sài Gòn"}</span>
      </footer>
    </div>
  );
}
