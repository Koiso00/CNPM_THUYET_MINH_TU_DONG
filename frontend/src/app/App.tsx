import { useEffect, useState, useSyncExternalStore } from "react";
import {
  AuthClient,
  authClient,
  authErrorMessage,
} from "../features/auth/client";
import { ExploreScreen } from "../features/tours/ExploreScreen";
import { ContentPage } from "../features/content/ContentPage";
import { ManagementPage } from "../features/admin/ManagementPage";
import { CreatorPage } from "../features/creator/CreatorPage";
import { AuthPage } from "../features/auth/AuthPage";
import { Brand, Icon } from "../shared/Icons";
import { roleLabels as roles } from "../shared/WorkspaceNav";

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
  const [route, setRoute] = useState(window.location.hash);
  const [logoutError, setLogoutError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => client.start(), [client]);
  useEffect(() => {
    const changed = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", changed);
    return () => window.removeEventListener("hashchange", changed);
  }, []);
  useEffect(() => {
    if (state.status !== "authenticated") return;
    if (route === "#/creator" && state.user?.role === "admin") {
      window.location.replace("#/management");
      return;
    }
    if (!["#/explore", "#/admin", "#/management", "#/creator"].includes(route))
      window.location.hash = "/explore";
  }, [state.status, state.user?.role, route]);

  async function logout() {
    setBusy(true);
    setLogoutError("");
    try {
      await client.logout();
      window.location.hash = "/login";
    } catch (error) {
      setLogoutError(
        authErrorMessage(error, "logout") + " Bạn chưa đăng xuất thành công.",
      );
    } finally {
      setBusy(false);
    }
  }
  const user = state.user;
  const restricted =
    (["#/admin", "#/management"].includes(route) && user?.role !== "admin") ||
    (route === "#/creator" &&
      user?.role !== "creator" &&
      user?.role !== "admin");
  const management = ["#/admin", "#/management", "#/creator"].includes(route);
  const explore = Boolean(user) && !management;
  return (
    <div className={`site${state.status === "anonymous" ? " site-auth" : ""}`}>
      <a className="skip-link" href="#main-content">
        Đến nội dung chính
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
              <Icon name="headphones" size={15} /> Khám phá
            </button>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("campus-map")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Icon name="pin" size={15} /> Bản đồ khuôn viên
            </button>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("audio-tours")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Icon name="audio" size={15} /> Nội dung thuyết minh
            </button>
          </nav>
        )}
        <div className="header-right">
          {user ? (
            <>
              {explore && (
                user.role === "admin" || user.role === "creator" ? (
                  <a
                    className="explore-role"
                    href={user.role === "admin" ? "#/management" : "#/creator"}
                  >
                    {roles[user.role]}
                  </a>
                ) : (
                  <span className="explore-role">{roles[user.role]}</span>
                )
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
            <span className="language-label">
              Tiếng Việt <span>VI</span>
            </span>
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
        ) : !user ? (
          <div className="auth-layout">
            <Introduction />
            <AuthPage
              key={route === "#/register" ? "register" : "login"}
              client={client}
              mode={route === "#/register" ? "register" : "login"}
              notice={state.notice}
            />
          </div>
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
          />
        ) : route === "#/admin" ? (
          <ContentPage client={client} />
        ) : route === "#/management" || user.role === "admin" ? (
          <ManagementPage client={client} />
        ) : (
          <CreatorPage client={client} />
        )}
      </main>
      <footer className="site-footer">
        <span>
          SGU Campus Guide <span className="footer-dot">·</span> Khám phá theo
          cách của bạn
        </span>
        <span>Cơ sở chính · Đại học Sài Gòn</span>
      </footer>
    </div>
  );
}
