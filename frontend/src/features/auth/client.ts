export type Role = "user" | "creator" | "admin";
export type PublicUser = { id: string; username: string; role: Role };
type Grant = {
  user: PublicUser;
  access_expires_at: string;
  session_expires_at: string;
  csrf_token: string;
};
export type AuthState = {
  status: "checking" | "anonymous" | "authenticated" | "unavailable";
  user: PublicUser | null;
  notice?: string;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: unknown,
  ) {
    super("API request failed");
  }
}
class Superseded extends Error {}
type Coordinator = <T>(work: () => Promise<T>) => Promise<T>;

const browserCoordinate: Coordinator = async (work) => {
  if (typeof navigator !== "undefined" && navigator.locks) {
    return await navigator.locks.request("sgu-auth-cookies", work);
  }
  return work();
};

export function authErrorMessage(
  error: unknown,
  operation: "login" | "register" | "logout" = "login",
) {
  if (!(error instanceof ApiError))
    return "Không thể kết nối máy chủ. Kiểm tra mạng và thử lại.";
  if (error.status === 409)
    return "Tên đăng nhập đã được sử dụng. Hãy chọn tên khác.";
  if (error.status === 401)
    return operation === "login"
      ? "Tên đăng nhập hoặc mật khẩu chưa đúng, hoặc tài khoản đã bị khóa."
      : "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (error.status === 403)
    return "Yêu cầu chưa được xác nhận. Hãy thử lại hoặc tải lại trang.";
  if (error.status === 422)
    return "Thông tin chưa hợp lệ. Kiểm tra tên đăng nhập và độ dài mật khẩu.";
  if (error.status === 503)
    return "Dịch vụ đang chưa sẵn sàng. Vui lòng thử lại sau.";
  return "Không thể hoàn tất yêu cầu. Vui lòng thử lại.";
}

/** Only public user data and expiry timestamps live in memory. Cookies belong to the browser. */
export class AuthClient {
  private state: AuthState = { status: "checking", user: null };
  private listeners = new Set<() => void>();
  private refreshing: Promise<Grant> | null = null;
  private restoring: Promise<void> | null = null;
  private generation = 0;
  private signingOut = false;
  private accessExpiry = 0;
  private sessionExpiry = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private users = 0;
  private channel: BroadcastChannel | null = null;

  constructor(
    private fetcher: typeof fetch = (...args) => fetch(...args),
    private coordinate: Coordinator = browserCoordinate,
  ) {}

  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private update(state: AuthState) {
    this.state = state;
    this.listeners.forEach((listener) => listener());
  }
  private assertCurrent(generation: number) {
    if (generation !== this.generation || this.signingOut)
      throw new Superseded();
  }
  private async raw<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await this.fetcher(`/api/v1${path}`, {
      ...init,
      credentials: "same-origin",
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new ApiError(response.status, body.detail);
    }
    return response.status === 204
      ? (undefined as T)
      : (response.json() as Promise<T>);
  }
  private async post<T>(path: string, body?: unknown): Promise<T> {
    for (let attempt = 0; attempt < 2; attempt++) {
      const csrf = await this.raw<{ csrf_token: string }>("/auth/csrf");
      try {
        return await this.raw<T>(path, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrf.csrf_token,
          },
          body: body === undefined ? undefined : JSON.stringify(body),
        });
      } catch (error) {
        // CSRF rejection happens before the handler; retry that rejection only, never a timeout.
        if (
          attempt === 0 &&
          error instanceof ApiError &&
          error.status === 403 &&
          error.detail === "Invalid or missing CSRF token."
        )
          continue;
        throw error;
      }
    }
    throw new Error("CSRF retry exhausted");
  }
  private accept(grant: Grant) {
    this.accessExpiry = Date.parse(grant.access_expires_at);
    this.sessionExpiry = Date.parse(grant.session_expires_at);
    this.update({ status: "authenticated", user: grant.user });
    this.schedule();
  }
  private anonymous(notice?: string) {
    clearTimeout(this.timer);
    this.accessExpiry = this.sessionExpiry = 0;
    this.update({ status: "anonymous", user: null, notice });
  }
  private schedule(delay?: number) {
    clearTimeout(this.timer);
    if (!this.users || this.state.status !== "authenticated" || this.signingOut)
      return;
    this.timer = setTimeout(
      () => {
        void this.refresh().catch((error) => {
          if (
            !(error instanceof Superseded) &&
            this.state.status === "authenticated"
          ) {
            this.update({
              ...this.state,
              notice:
                "Chưa thể gia hạn phiên. Kiểm tra kết nối; hệ thống sẽ thử lại.",
            });
            this.schedule(30000);
          }
        });
      },
      delay ??
        Math.max(
          1000,
          Math.min(this.accessExpiry, this.sessionExpiry) - Date.now() - 30000,
        ),
    );
  }
  refresh(): Promise<Grant> {
    if (this.signingOut) return Promise.reject(new Superseded());
    if (this.refreshing) return this.refreshing;
    const generation = this.generation;
    this.refreshing = this.coordinate(async () => {
      this.assertCurrent(generation);
      const grant = await this.post<Grant>("/auth/refresh");
      this.assertCurrent(generation);
      this.accept(grant);
      return grant;
    })
      .catch((error) => {
        if (
          generation === this.generation &&
          error instanceof ApiError &&
          error.status === 401
        ) {
          this.anonymous(
            "Phiên đăng nhập đã kết thúc. Vui lòng đăng nhập lại.",
          );
        }
        throw error;
      })
      .finally(() => {
        this.refreshing = null;
      });
    return this.refreshing;
  }
  restore(): Promise<void> {
    if (this.restoring) return this.restoring;
    this.restoring = this.refresh()
      .then(() => undefined)
      .catch((error) => {
        if (error instanceof Superseded) return;
        if (error instanceof ApiError && error.status === 401) {
          this.anonymous(); // No session on an initial visit is expected.
        } else if (!this.signingOut) {
          this.update({
            status: "unavailable",
            user: null,
            notice: authErrorMessage(error),
          });
        }
      })
      .finally(() => {
        this.restoring = null;
      });
    return this.restoring;
  }
  async login(username: string, password: string) {
    const generation = ++this.generation;
    const grant = await this.coordinate(() =>
      this.post<Grant>("/auth/login", { username, password }),
    );
    this.assertCurrent(generation);
    this.accept(grant);
    this.channel?.postMessage({ type: "signed-in" });
  }
  register(username: string, password: string) {
    return this.coordinate(() =>
      this.post<PublicUser>("/auth/register", { username, password }),
    );
  }
  async logout() {
    this.signingOut = true;
    ++this.generation; // A delayed refresh may no longer restore the UI after logout.
    clearTimeout(this.timer);
    try {
      // Wait for any in-flight cookie rotation, even where Web Locks is unavailable.
      await this.refreshing?.catch(() => undefined);
      await this.coordinate(() => this.post<void>("/auth/logout"));
      this.anonymous();
      this.channel?.postMessage({ type: "signed-out" });
    } finally {
      this.signingOut = false;
      this.schedule();
    }
  }
  async get<T>(path: string): Promise<T> {
    if (!path.startsWith("/") || path.startsWith("//"))
      throw new Error("Invalid API path");
    const generation = this.generation;
    try {
      return await this.raw<T>(path);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) throw error;
      this.assertCurrent(generation);
      await this.refresh();
      this.assertCurrent(generation);
      return this.raw<T>(path);
    }
  }
  private recheck = () => {
    if (
      document.visibilityState === "hidden" ||
      this.signingOut ||
      this.state.status !== "authenticated"
    )
      return;
    const generation = this.generation;
    void this.get<PublicUser>("/auth/me")
      .then((user) => {
        this.assertCurrent(generation);
        this.update({ ...this.state, user });
        if (Date.now() >= this.accessExpiry - 30000) this.schedule(1000);
      })
      .catch((error) => {
        if (
          !(error instanceof Superseded) &&
          this.state.status === "authenticated"
        ) {
          this.update({ ...this.state, notice: authErrorMessage(error) });
        }
      });
  };
  start = () => {
    this.users++;
    if (this.users === 1) {
      window.addEventListener("focus", this.recheck);
      document.addEventListener("visibilitychange", this.recheck);
      if (typeof BroadcastChannel !== "undefined") {
        this.channel = new BroadcastChannel("sgu-auth-state");
        this.channel.onmessage = (event: MessageEvent<{ type?: string }>) => {
          if (event.data.type === "signed-out") {
            ++this.generation;
            this.anonymous("Bạn đã đăng xuất ở một tab khác.");
          } else if (event.data.type === "signed-in") {
            ++this.generation;
            void (
              this.refreshing?.catch(() => undefined) ?? Promise.resolve()
            ).then(() => this.restore());
          }
        };
      }
      if (this.state.status === "checking") void this.restore();
      else this.schedule();
    }
    return () => {
      if (--this.users !== 0) return;
      clearTimeout(this.timer);
      window.removeEventListener("focus", this.recheck);
      document.removeEventListener("visibilitychange", this.recheck);
      this.channel?.close();
      this.channel = null;
    };
  };
}

export const authClient = new AuthClient();
