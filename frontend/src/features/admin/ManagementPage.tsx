import { useEffect, useState } from "react";
import { ApiError, AuthClient, type Role } from "../auth/client";
import { WorkspaceNav } from "../../shared/WorkspaceNav";
import { Icon } from "../../shared/Icons";

type Account = {
  id: string;
  username: string;
  role: Role;
  is_active: boolean;
  is_protected?: boolean;
};
type Dashboard = {
  users: number;
  active_users: number;
  audio_assets: number;
  draft_places: number;
  published_places: number;
  published_tours: number;
};
const metrics: {
  key: keyof Dashboard;
  label: string;
  icon: "users" | "user" | "audio" | "pin" | "check" | "grid";
}[] = [
  { key: "users", label: "Tổng tài khoản", icon: "users" },
  { key: "active_users", label: "Tài khoản đang hoạt động", icon: "user" },
  { key: "draft_places", label: "Địa điểm trong bản nháp", icon: "pin" },
  { key: "published_places", label: "Địa điểm đã công bố", icon: "check" },
  { key: "audio_assets", label: "Audio đã nhập", icon: "audio" },
  { key: "published_tours", label: "Tour đã công bố", icon: "grid" },
];
const PAGE_SIZE = 20;
function accountMessage(cause: unknown) {
  if (cause instanceof ApiError) {
    if (cause.status === 409)
      return "Tài khoản quản trị được bảo vệ hoặc dữ liệu đã thay đổi. Tải lại danh sách để kiểm tra.";
    if (cause.status === 403)
      return "Bạn không có quyền quản lý tài khoản này.";
    if (cause.status === 401)
      return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  }
  return "Chưa cập nhật được tài khoản. Kiểm tra kết nối và thử lại; thay đổi đang nhập vẫn được giữ.";
}

export function ManagementPage({ client }: { client: AuthClient }) {
  const [stats, setStats] = useState<Dashboard | null>(null);
  const [statsError, setStatsError] = useState("");
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsVersion, setStatsVersion] = useState(0);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [savedAccounts, setSavedAccounts] = useState<Account[]>([]);
  const [offset, setOffset] = useState(0);
  const [pageVersion, setPageVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setStatsLoading(true);
    setStatsError("");
    void client
      .get<Dashboard>("/admin/dashboard")
      .then((data) => {
        if (active) setStats(data);
      })
      .catch(() => {
        if (active)
          setStatsError(
            "Chưa tải được số liệu mới. Kiểm tra kết nối và thử lại.",
          );
      })
      .finally(() => {
        if (active) setStatsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [client, statsVersion]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");
    setSaveError("");
    setNotice("");
    void client
      .get<Account[]>(`/admin/users?offset=${offset}&limit=${PAGE_SIZE}`)
      .then((data) => {
        if (active) {
          setAccounts(data);
          setSavedAccounts(data);
        }
      })
      .catch(() => {
        if (active)
          setLoadError(
            "Chưa tải được danh sách tài khoản. Kiểm tra kết nối và thử lại.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [client, offset, pageVersion]);

  function changed(account: Account) {
    const saved = savedAccounts.find((item) => item.id === account.id);
    return (
      saved?.role !== account.role || saved?.is_active !== account.is_active
    );
  }
  const dirty = accounts.some(changed);
  function reloadAccounts() {
    if (
      dirty &&
      !window.confirm("Bỏ thay đổi chưa lưu và tải lại danh sách tài khoản?")
    )
      return;
    setLoading(true);
    setPageVersion((value) => value + 1);
  }
  function editAccount(
    id: string,
    patch: Partial<Pick<Account, "role" | "is_active">>,
  ) {
    setAccounts((items) =>
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }
  async function save(account: Account) {
    if (saving || loading || !changed(account)) return;
    setSaving(account.id);
    setSaveError("");
    setNotice("");
    try {
      const updated = await client.mutate<Account>(
        `/admin/users/${account.id}`,
        { role: account.role, is_active: account.is_active },
        "PUT",
      );
      setAccounts((items) =>
        items.map((item) => (item.id === updated.id ? updated : item)),
      );
      setSavedAccounts((items) =>
        items.map((item) => (item.id === updated.id ? updated : item)),
      );
      setNotice(`Đã cập nhật tài khoản ${updated.username}.`);
      setStatsVersion((value) => value + 1);
    } catch (cause) {
      setSaveError(accountMessage(cause));
    } finally {
      setSaving(null);
    }
  }
  function changePage(next: number) {
    setLoading(true);
    setAccounts([]);
    setSavedAccounts([]);
    setOffset(next);
  }
  return (
    <div className="workspace admin-page">
      <WorkspaceNav role="admin" route="#/management" />
      <section className="workspace-hero">
        <div>
          <p className="form-eyebrow">KHÔNG GIAN LÀM VIỆC</p>
          <h1>Quản trị hệ thống</h1>
          <p>Theo dõi dữ liệu và quản lý quyền truy cập của các tài khoản.</p>
        </div>
        <span className="hero-icon">
          <Icon name="grid" size={44} />
        </span>
      </section>
      <section
        aria-label="Dashboard"
        className="admin-section"
        aria-busy={statsLoading}
      >
        <div className="management-heading">
          <h2>Tổng quan hệ thống</h2>
          <button
            disabled={statsLoading}
            onClick={() => setStatsVersion((value) => value + 1)}
          >
            Làm mới số liệu
          </button>
        </div>
        <p>
          Số liệu từ cơ sở dữ liệu. Chưa thống kê lượt nghe hoặc lượt đến theo
          GPS.
        </p>
        {statsLoading && <p role="status">Đang tải số liệu…</p>}
        {statsError && (
          <p role="alert" className="message error">
            {statsError}
            {stats ? " Số liệu bên dưới là lần tải thành công trước." : ""}
          </p>
        )}
        {stats && (
          <div className="admin-stats">
            {metrics.map((metric) => (
              <article key={metric.key}>
                <span className="management-stat-label">
                  <Icon name={metric.icon} size={18} />
                  {metric.label}
                </span>
                <strong>{stats[metric.key]}</strong>
              </article>
            ))}
          </div>
        )}
        <p className="management-note">
          Audio đã nhập bao gồm các phiên bản file được giữ trong hệ thống.
        </p>
      </section>
      <section
        className="admin-section"
        aria-label="Quản lý tài khoản"
        aria-busy={loading}
      >
        <div className="management-heading">
          <h2>Tài khoản và phân quyền</h2>
          <button
            disabled={loading || Boolean(saving)}
            onClick={reloadAccounts}
          >
            Tải lại danh sách
          </button>
        </div>
        <p>
          Thay đổi vai trò hoặc trạng thái rồi lưu từng tài khoản. Khóa tài
          khoản sẽ thu hồi các phiên đăng nhập.
        </p>
        <p className="management-note">
          Admin đang hoạt động được bảo vệ khỏi khóa hoặc hạ quyền trên web.
        </p>
        {notice && (
          <p role="status" className="message">
            {notice}
          </p>
        )}
        {saveError && (
          <p role="alert" className="message error">
            {saveError}
          </p>
        )}
        {loading ? (
          <p role="status">Đang tải tài khoản…</p>
        ) : loadError ? (
          <div>
            <p role="alert" className="message error">
              {loadError}
            </p>
            <button onClick={reloadAccounts}>Thử tải lại tài khoản</button>
          </div>
        ) : (
          <>
            {!accounts.length && <p>Không có tài khoản trong trang này.</p>}
            <div className="admin-users">
              {accounts.map((account) => {
                const protectedAccount =
                  account.is_protected ||
                  account.id === client.getSnapshot().user?.id;
                const disabled = Boolean(saving) || protectedAccount;
                return (
                  <div className="admin-account" key={account.id}>
                    <div className="management-account-name">
                      <strong>{account.username}</strong>
                      <span>
                        {protectedAccount
                          ? "Được bảo vệ"
                          : changed(account)
                            ? "Chưa lưu thay đổi"
                            : account.is_active
                              ? "Đang hoạt động"
                              : "Đã khóa"}
                      </span>
                    </div>
                    <select
                      aria-label={`Vai trò ${account.username}`}
                      value={account.role}
                      disabled={disabled}
                      onChange={(event) =>
                        editAccount(account.id, {
                          role: event.target.value as Role,
                        })
                      }
                    >
                      <option value="user">Người tham quan</option>
                      <option value="creator">Người tạo nội dung</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                    <label>
                      <input
                        type="checkbox"
                        aria-label={`Hoạt động ${account.username}`}
                        checked={account.is_active}
                        disabled={disabled}
                        onChange={(event) =>
                          editAccount(account.id, {
                            is_active: event.target.checked,
                          })
                        }
                      />{" "}
                      Hoạt động
                    </label>
                    <button
                      disabled={disabled || !changed(account)}
                      onClick={() => void save(account)}
                    >
                      {saving === account.id
                        ? "Đang lưu…"
                        : `Lưu ${account.username}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
        {dirty && (
          <p className="management-note">
            Lưu thay đổi hoặc tải lại danh sách trước khi chuyển trang.
          </p>
        )}
        <div className="admin-actions">
          <button
            disabled={loading || Boolean(saving) || dirty || offset === 0}
            onClick={() => changePage(Math.max(0, offset - PAGE_SIZE))}
          >
            Trang trước
          </button>
          <span>Trang {offset / PAGE_SIZE + 1}</span>
          <button
            disabled={
              loading ||
              Boolean(saving) ||
              dirty ||
              Boolean(loadError) ||
              accounts.length < PAGE_SIZE
            }
            onClick={() => changePage(offset + PAGE_SIZE)}
          >
            Trang sau
          </button>
        </div>
      </section>
    </div>
  );
}
