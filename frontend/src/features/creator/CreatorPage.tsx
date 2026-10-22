import { useEffect, useState } from "react";
import { ApiError, AuthClient } from "../auth/client";
import type { CampusDraft, ManagedCampus, Place } from "../tours/content";
import { WorkspaceNav } from "../../shared/WorkspaceNav";

type Submission = {
  id: string;
  draft: CampusDraft;
  base_revision: number;
  revision: number;
  status: "draft" | "pending" | "approved" | "rejected" | "applied";
  review_note: string | null;
};

function errorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 409)
    return "Đề xuất hoặc bản nội dung gốc đã thay đổi. Tải lại để đối chiếu trước khi lưu.";
  if (error instanceof ApiError && error.status === 404)
    return "Chưa có bản nháp khuôn viên. Admin cần nhập nội dung trước.";
  return "Chưa hoàn tất thao tác. Kiểm tra kết nối; nội dung đang nhập vẫn được giữ.";
}

const statusLabels: Record<Submission["status"], string> = {
  draft: "Bản nháp riêng",
  pending: "Đang chờ Admin duyệt",
  approved: "Đã duyệt, chờ đưa vào bản nháp",
  rejected: "Cần chỉnh sửa",
  applied: "Đã đưa vào bản nháp quản trị",
};

export function CreatorPage({ client }: { client: AuthClient }) {
  const [source, setSource] = useState<ManagedCampus | null>(null);
  const [items, setItems] = useState<Submission[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CampusDraft | null>(null);
  const [revision, setRevision] = useState(0);
  const [baseRevision, setBaseRevision] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setError("");
    try {
      const [campus, submissions] = await Promise.all([
        client.get<ManagedCampus>("/creator/campus"),
        client.get<Submission[]>("/creator/submissions"),
      ]);
      setSource(campus);
      setItems(submissions);
      const editable = submissions.find(
        (item) => item.status === "draft" || item.status === "rejected",
      );
      if (editable) {
        setSelectedId(editable.id);
        setDraft(editable.draft);
        setRevision(editable.revision);
        setBaseRevision(editable.base_revision);
      } else {
        setSelectedId(null);
        setDraft(null);
        setRevision(0);
        setBaseRevision(campus.revision);
      }
      setDirty(false);
    } catch (cause) {
      setError(errorMessage(cause));
    }
  }

  useEffect(() => {
    void load();
  }, [client]);

  function updatePlace(index: number, key: keyof Place, value: string) {
    if (!draft) return;
    setDraft({
      ...draft,
      places: draft.places.map((place, placeIndex) =>
        placeIndex === index ? { ...place, [key]: value } : place,
      ),
    });
    setDirty(true);
  }

  async function save() {
    if (!draft || !source || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const saved = await client.mutate<Submission>(
        selectedId ? `/creator/submissions/${selectedId}` : "/creator/submissions",
        {
          ...(selectedId ? { revision } : {}),
          base_revision: baseRevision,
          draft,
        },
        selectedId ? "PUT" : "POST",
      );
      setSelectedId(saved.id);
      setRevision(saved.revision);
      setBaseRevision(saved.base_revision);
      setItems((previous) => [saved, ...previous.filter((item) => item.id !== saved.id)]);
      setDirty(false);
      setNotice("Đã lưu đề xuất riêng. Bản đang công bố chưa thay đổi.");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!selectedId || dirty || busy) return;
    setBusy(true);
    setError("");
    try {
      const saved = await client.mutate<Submission>(
        `/creator/submissions/${selectedId}/submit`,
        { revision },
      );
      setItems((previous) => previous.map((item) => item.id === saved.id ? saved : item));
      setSelectedId(null);
      setDraft(null);
      setNotice("Đã gửi toàn bộ đề xuất cho Admin xem xét.");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  function newProposal() {
    if (!source || busy) return;
    if (dirty && !window.confirm("Bỏ các thay đổi chưa lưu để tạo đề xuất mới?"))
      return;
    const editable = items.find((item) => item.status === "draft" || item.status === "rejected");
    if (editable) {
      setSelectedId(editable.id);
      setDraft(editable.draft);
      setRevision(editable.revision);
      setBaseRevision(editable.base_revision);
      setDirty(false);
      return;
    }
    setSelectedId(null);
    setDraft(structuredClone(source.draft));
    setRevision(0);
    setBaseRevision(source.revision);
    setDirty(true);
    setNotice("Đang tạo bản đề xuất độc lập từ nháp khuôn viên hiện tại.");
  }

  function addPlace() {
    if (!draft) return;
    setDraft({
      ...draft,
      places: [
        ...draft.places,
        {
          id: crypto.randomUUID(),
          title: "",
          description: "",
          source: "",
          location: null,
        },
      ],
    });
    setDirty(true);
  }

  function removePlace(placeId: string) {
    if (!draft) return;
    setDraft({
      ...draft,
      places: draft.places.filter((place) => place.id !== placeId),
    });
    setDirty(true);
  }

  return (
    <div className="workspace">
      <WorkspaceNav role="creator" route="#/creator" />
      <section className="workspace-hero">
        <div>
          <p className="form-eyebrow">KHÔNG GIAN CREATOR</p>
          <h1>Đề xuất nội dung toàn tour</h1>
          <p>Chỉnh sửa bản riêng, lưu nháp và gửi Admin duyệt. Nội dung đang công bố không bị thay đổi.</p>
        </div>
      </section>
      <section className="admin-section creator-editor" aria-label="Soạn đề xuất">
        <div className="creator-toolbar">
          <h2>Đề xuất của bạn</h2>
          <button disabled={!source || busy} onClick={newProposal}>Tạo từ bản nháp hiện tại</button>
        </div>
        {error && <p className="message error" role="alert">{error}</p>}
        {notice && <p className="message" role="status">{notice}</p>}
        <label>Trạng thái
          <select
            value={selectedId ?? ""}
            onChange={(event) => {
              const item = items.find((candidate) => candidate.id === event.target.value);
              if (!item) return;
              if (dirty && !window.confirm("Bỏ các thay đổi chưa lưu?")) return;
              setSelectedId(item.id);
              setDraft(item.status === "draft" || item.status === "rejected" ? item.draft : null);
              setRevision(item.revision);
              setBaseRevision(item.base_revision);
              setDirty(false);
              setNotice(item.review_note ?? "");
            }}
          >
            <option value="">Chưa có đề xuất đang sửa</option>
            {items.map((item) => <option key={item.id} value={item.id}>{statusLabels[item.status]}</option>)}
          </select>
        </label>
        {draft ? (
          <>
            <label>Tên tour
              <input value={draft.title} maxLength={200} disabled={busy} onChange={(event) => { setDraft({ ...draft, title: event.target.value }); setDirty(true); }} />
            </label>
            <p>{draft.places.length} địa điểm · Vị trí giữ nguyên theo dữ liệu gốc</p>
            <button disabled={busy} onClick={addPlace}>Thêm địa điểm</button>
            <div className="creator-place-list">
              {draft.places.map((place, index) => (
                <details key={place.id} open={index === 0}>
                  <summary>{String(index + 1).padStart(2, "0")} · {place.title}</summary>
                  <label>Tên địa điểm
                    <input value={place.title} maxLength={200} disabled={busy} onChange={(event) => updatePlace(index, "title", event.target.value)} />
                  </label>
                  <label>Nội dung thuyết minh
                    <textarea rows={8} value={place.description} maxLength={20000} disabled={busy} onChange={(event) => updatePlace(index, "description", event.target.value)} />
                  </label>
                  <label>Nguồn tư liệu
                    <textarea rows={2} value={place.source} maxLength={2000} disabled={busy} onChange={(event) => updatePlace(index, "source", event.target.value)} />
                  </label>
                  <button disabled={busy} onClick={() => removePlace(place.id)}>Xóa khỏi đề xuất</button>
                </details>
              ))}
            </div>
            <div className="admin-actions">
              <button className="primary" disabled={busy || !dirty} onClick={() => void save()}>Lưu đề xuất</button>
              <button disabled={busy || dirty || !selectedId} onClick={() => void submit()}>Gửi Admin duyệt</button>
            </div>
          </>
        ) : (
          <p>Chọn một đề xuất hoặc tạo bản mới từ nháp khuôn viên hiện tại.</p>
        )}
        <h3>Lịch sử đề xuất</h3>
        {items.length ? <ul>{items.map((item) => <li key={item.id}>{statusLabels[item.status]} · {item.draft.title}{item.review_note ? ` · ${item.review_note}` : ""}</li>)}</ul> : <p>Chưa có đề xuất nào.</p>}
        <button disabled={busy} onClick={() => void load()}>Tải lại</button>
      </section>
    </div>
  );
}
