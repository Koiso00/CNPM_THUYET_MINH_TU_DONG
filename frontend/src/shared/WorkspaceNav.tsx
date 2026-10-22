import type { Role } from "../features/auth/client";
import { Icon } from "./Icons";

export const roleLabels: Record<Role, string> = {
	user: "User",
	creator: "Creator",
	admin: "Admin",
};

export function WorkspaceNav({ role, route }: { role: Role; route: string }) {
  return (
    <nav className="workspace-nav" aria-label="Điều hướng">
      <a
        href="#/explore"
        aria-current={route === "#/explore" ? "page" : undefined}
      >
        <Icon name="headphones" /> Khám phá
      </a>
      {role === "admin" && (
        <a
          href="#/admin"
          aria-current={route === "#/admin" ? "page" : undefined}
        >
          <Icon name="audio" /> Nội dung
        </a>
      )}
      {role === "admin" && (
        <a
          href="#/management"
          aria-current={route === "#/management" ? "page" : undefined}
        >
          <Icon name="grid" /> Quản trị
        </a>
      )}
      {role === "creator" && (
        <a
          href="#/creator"
          aria-current={route === "#/creator" ? "page" : undefined}
        >
          <Icon name="audio" /> Nội dung
        </a>
      )}
      <span className="role-badge">{roleLabels[role]}</span>
    </nav>
  );
}
