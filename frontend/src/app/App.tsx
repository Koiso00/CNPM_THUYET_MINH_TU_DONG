import { useEffect, useState, useSyncExternalStore } from "react";
import {
  AuthClient,
  authClient,
  authErrorMessage,
} from "../features/auth/client";
import { ExplorePage } from "../features/tours/ExplorePage";
import { AuthPage } from "../features/auth/AuthPage";
import { Brand, Icon } from "../shared/Icons";

const roles = {
  user: "Người tham quan",
  creator: "Người tạo nội dung",
  admin: "Quản trị viên",
};

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
    if (!["#/explore", "#/admin", "#/creator"].includes(route))
      window.location.hash = "/explore";
  }, [state.status, route]);

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
    (route === "#/admin" && user?.role !== "admin") ||
    (route === "#/creator" &&
      user?.role !== "creator" &&
      user?.role !== "admin");
  const management = route === "#/admin" || route === "#/creator";
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
            <span className="language-label">
              Tiếng Việt <span>VI</span>
            </span>
          )}
        </div>
      </header>
      <main id="main-content">
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
          <ExplorePage
            username={user.username}
            notice={logoutError || state.notice}
          />
        ) : (
          <div className="workspace">
            <nav className="workspace-nav" aria-label="Điều hướng">
              <a
                href="#/explore"
                aria-current={!management ? "page" : undefined}
              >
                <Icon name="headphones" />
                Khám phá
              </a>
              {user.role === "admin" && (
                <a
                  href="#/admin"
                  aria-current={route === "#/admin" ? "page" : undefined}
                >
                  <Icon name="grid" />
                  Quản trị
                </a>
              )}
              {(user.role === "creator" || user.role === "admin") && (
                <a
                  href="#/creator"
                  aria-current={route === "#/creator" ? "page" : undefined}
                >
                  <Icon name="audio" />
                  Nội dung
                </a>
              )}
              <span className="role-badge">{roles[user.role]}</span>
            </nav>
            {(logoutError || state.notice) && (
              <p role="alert" className="message error">
                {logoutError || state.notice}
              </p>
            )}
            <>
              <section className="workspace-hero">
                <div>
                  <p className="form-eyebrow">
                    {management
                      ? "KHÔNG GIAN LÀM VIỆC"
                      : "CHÀO MỪNG ĐẾN VỚI SGU"}
                  </p>
                  <h1>
                    {management
                      ? route === "#/admin"
                        ? "Không gian quản trị"
                        : "Nội dung của bạn"
                      : `Xin chào, ${user.username}.`}
                  </h1>
                  <p>
                    {management
                      ? "Bạn đã đăng nhập đúng vai trò. Các công cụ quản lý sẽ được bổ sung ở bước tiếp theo."
                      : "Tài khoản của bạn đã sẵn sàng. Hành trình khám phá khuôn viên đang được chuẩn bị."}
                  </p>
                </div>
                <span className="hero-icon">
                  <Icon name={management ? "grid" : "headphones"} size={44} />
                </span>
              </section>
              <section className="next-section" aria-labelledby="next-title">
                <div className="section-heading">
                  <h2 id="next-title">
                    {management ? "Công cụ quản lý" : "Hành trình sắp mở"}
                  </h2>
                  <span>Đang phát triển</span>
                </div>
                <div className="feature-grid">
                  {(management
                    ? [
                        {
                          icon: "pin" as const,
                          title: "Địa điểm & nội dung",
                          text: "Quản lý thông tin và kịch bản thuyết minh.",
                        },
                        {
                          icon: "audio" as const,
                          title: "Thư viện audio",
                          text: "Quản lý bản thu âm theo từng địa điểm.",
                        },
                        ...(user.role === "admin"
                          ? [
                              {
                                icon: "users" as const,
                                title: "Tài khoản & thống kê",
                                text: "Quản lý người dùng và xem số liệu hệ thống.",
                              },
                            ]
                          : []),
                      ]
                    : [
                        {
                          icon: "pin" as const,
                          title: "Khám phá địa điểm",
                          text: "Tìm hiểu các khu vực trong cơ sở chính.",
                        },
                        {
                          icon: "headphones" as const,
                          title: "Lắng nghe câu chuyện",
                          text: "Chọn một địa điểm và nghe thuyết minh.",
                        },
                      ]
                  ).map((item) => (
                    <article className="feature-card" key={item.title}>
                      <span className="feature-icon">
                        <Icon name={item.icon} size={24} />
                      </span>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                      <span className="coming-label">Sắp có</span>
                    </article>
                  ))}
                </div>
              </section>
            </>
          </div>
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
