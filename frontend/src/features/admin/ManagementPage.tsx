import { useEffect, useState } from "react";
import { AuthClient } from "../auth/client";
import { WorkspaceNav } from "../../shared/WorkspaceNav";
import { Icon } from "../../shared/Icons";

type Dashboard = {
  day: string;
  users: number;
  online_visitors: number;
  audio_assets: number;
  draft_places: number;
  published_places: number;
  published_tours: number;
  guest_visitors: number;
  guest_journeys: number;
  guest_audio_plays: number;
  guest_audio_by_place: { place_id: string; title: string; plays: number }[];
};
const metrics: {
  key: Exclude<keyof Dashboard, "guest_audio_by_place">;
  label: string;
  icon: "users" | "user" | "audio" | "pin" | "check" | "grid";
}[] = [
  { key: "online_visitors", label: "User đang hoạt động", icon: "user" },
  { key: "draft_places", label: "Địa điểm trong bản nháp", icon: "pin" },
  { key: "published_places", label: "Địa điểm đã công bố", icon: "check" },
  { key: "audio_assets", label: "Audio đã nhập", icon: "audio" },
  { key: "published_tours", label: "Tour đã công bố", icon: "grid" },
  { key: "guest_visitors", label: "Khách trong ngày", icon: "users" },
  { key: "guest_journeys", label: "Hành trình trong ngày", icon: "pin" },
  { key: "guest_audio_plays", label: "Lượt phát audio trong ngày", icon: "audio" },
];
export function ManagementPage({ client }: { client: AuthClient }) {
  const [stats, setStats] = useState<Dashboard | null>(null);
  const [statsError, setStatsError] = useState("");
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsVersion, setStatsVersion] = useState(0);
  const [statsDay, setStatsDay] = useState(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date()),
  );
  useEffect(() => {
    let active = true;
    setStatsLoading(true);
    setStatsError("");
    void client
      .get<Dashboard>(`/admin/dashboard?day=${statsDay}`)
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
  }, [client, statsVersion, statsDay]);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible")
        setStatsVersion((value) => value + 1);
    };
    const timer = window.setInterval(refresh, 30_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return (
    <div className="workspace admin-page">
      <WorkspaceNav role="admin" route="#/management" />
      <section className="workspace-hero">
        <div>
          <p className="form-eyebrow">KHÔNG GIAN LÀM VIỆC</p>
          <h1>Quản trị hệ thống</h1>
          <p>Theo dõi dữ liệu và thống kê hoạt động tham quan.</p>
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
          <div className="management-dashboard-controls">
            <label>
              Ngày thống kê
              <input
                aria-label="Ngày thống kê"
                type="date"
                value={statsDay}
                onChange={(event) => setStatsDay(event.target.value)}
              />
            </label>
            <button
              disabled={statsLoading}
              onClick={() => setStatsVersion((value) => value + 1)}
            >
              Làm mới số liệu
            </button>
          </div>
        </div>
        <p>
          Số liệu từ cơ sở dữ liệu. Khách được đếm theo ID trình duyệt trong ngày
          ICT ({stats?.day ?? "đang tải"}); không lưu vị trí GPS.
        </p>
        <p className="management-note">
          Người đang trên website được tính theo trình duyệt gửi tín hiệu trong 90 giây gần nhất.
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
                <strong>{stats[metric.key] ?? 0}</strong>
              </article>
            ))}
          </div>
        )}
        {stats && (
          <div className="management-audio-breakdown">
            <h3>Lượt phát audio theo địa điểm</h3>
            {stats.guest_audio_by_place?.length ? (
              <div className="management-audio-breakdown-list">
                {stats.guest_audio_by_place.map((place) => (
                  <div key={place.place_id}>
                    <span>{place.title}</span>
                    <strong>{place.plays}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p>Chưa có lượt phát audio trong ngày này.</p>
            )}
          </div>
        )}
        <p className="management-note">
          Audio đã nhập bao gồm các phiên bản file được giữ trong hệ thống.
        </p>
      </section>
    </div>
  );
}
