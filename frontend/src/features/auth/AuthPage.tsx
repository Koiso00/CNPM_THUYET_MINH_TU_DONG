import { useState } from "react";
import type { FormEvent } from "react";
import { Icon } from "../../shared/Icons";
import { AuthClient, authErrorMessage } from "./client";

export function AuthPage({
  client,
  mode,
  notice,
}: {
  client: AuthClient;
  mode: "login" | "register";
  notice?: string;
}) {
  const register = mode === "register";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setSuccess("");
    if (
      !username.trim() ||
      !username
        .trim()
        .split("")
        .every((c) => c.charCodeAt(0) >= 32)
    ) {
      setError("Hãy nhập tên đăng nhập hợp lệ.");
      return;
    }
    const length = Array.from(password).length;
    if (length < (register ? 15 : 1) || length > 128) {
      setError(
        register
          ? "Mật khẩu cần từ 15 đến 128 ký tự."
          : "Hãy nhập mật khẩu từ 1 đến 128 ký tự.",
      );
      return;
    }
    if (register && password !== confirmation) {
      setError("Mật khẩu nhập lại chưa khớp.");
      return;
    }
    setBusy(true);
    try {
      if (register) {
        await client.register(username, password);
        setPassword("");
        setConfirmation("");
        setSuccess("Tạo tài khoản thành công. Bạn có thể đăng nhập ngay.");
      } else {
        await client.login(username, password);
        setPassword("");
      }
    } catch (caught) {
      setError(authErrorMessage(caught, mode));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-form" aria-labelledby="auth-title">
      <div className="form-eyebrow">
        <span /> KHỞI ĐẦU HÀNH TRÌNH
      </div>
      <h1 id="auth-title">
        {register ? "Tạo tài khoản" : "Chào mừng bạn trở lại."}
      </h1>
      <p className="form-intro">
        {register
          ? "Một tài khoản để bắt đầu khám phá khuôn viên theo cách của bạn."
          : "Đăng nhập để tiếp tục hành trình khám phá Đại học Sài Gòn."}
      </p>
      <div className="auth-tabs" aria-label="Tài khoản">
        <a href="#/login" aria-current={!register ? "page" : undefined}>
          Đăng nhập
        </a>
        <a href="#/register" aria-current={register ? "page" : undefined}>
          Đăng ký
        </a>
      </div>
      {notice && !error && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="message error" id="form-error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="message success" role="status">
          <Icon name="check" />
          {success} <a href="#/login">Đăng nhập</a>
        </p>
      )}
      <form
        onSubmit={(event) => void submit(event)}
        aria-busy={busy}
        aria-describedby={error ? "form-error" : undefined}
      >
        <fieldset disabled={busy}>
          <label htmlFor="username">Tên đăng nhập</label>
          <div className="input-wrap">
            <Icon name="user" />
            <input
              id="username"
              name="username"
              autoComplete="username"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              maxLength={128}
              autoCapitalize="none"
              spellCheck={false}
            />
          </div>
          <div className="field-heading">
            <label htmlFor="password">Mật khẩu</label>
            {!register && <span>Giữ đăng nhập tối đa 7 ngày</span>}
          </div>
          <div className="input-wrap">
            <Icon name="lock" />
            <input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete={register ? "new-password" : "current-password"}
              placeholder={register ? "Ít nhất 15 ký tự" : "Nhập mật khẩu"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-describedby={register ? "password-hint" : undefined}
            />
            <button
              type="button"
              className="reveal"
              onClick={() => setShow(!show)}
              aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              aria-pressed={show}
            >
              <Icon name="eye" />
            </button>
          </div>
          {register && (
            <>
              <p id="password-hint" className="field-hint">
                15–128 ký tự. Có thể dùng tiếng Việt và dấu cách.
              </p>
              <label htmlFor="confirmation">Nhập lại mật khẩu</label>
              <div className="input-wrap">
                <Icon name="lock" />
                <input
                  id="confirmation"
                  name="confirmation"
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Nhập lại mật khẩu của bạn"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          <button className="primary submit" type="submit">
            {busy ? "Đang xử lý…" : register ? "Tạo tài khoản" : "Đăng nhập"}
            {!busy && <Icon name="arrow" />}
          </button>
        </fieldset>
      </form>
      <p className="form-switch">
        {register ? "Đã có tài khoản?" : "Bạn chưa có tài khoản?"}{" "}
        <a href={register ? "#/login" : "#/register"}>
          {register ? "Đăng nhập" : "Đăng ký ngay"}
        </a>
      </p>
      <div className="privacy-note">
        <Icon name="lock" size={15} />
        <span>
          Tài khoản cá nhân giúp bạn tiếp tục hành trình trên thiết bị này.
        </span>
      </div>
    </section>
  );
}
