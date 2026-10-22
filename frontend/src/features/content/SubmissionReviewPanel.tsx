import { useEffect, useState } from "react";
import { ApiError, AuthClient } from "../auth/client";
import type { CampusDraft, ManagedCampus } from "../tours/content";

type Submission = {
  id: string;
  draft: CampusDraft;
  revision: number;
  base_revision: number;
  status: "pending" | "approved" | "rejected" | "applied";
  review_note: string | null;
  applied_revision: number | null;
};

export function SubmissionReviewPanel({
  client,
  campus,
  onApplied,
  disabled,
  onApplyingChange,
}: {
  client: AuthClient;
  campus: ManagedCampus | null;
  onApplied: (campus: ManagedCampus) => void;
  disabled: boolean;
  onApplyingChange: (applying: boolean) => void;
}) {
  const [queue, setQueue] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setQueue(await client.get<Submission[]>("/admin/submissions"));
      setError("");
    } catch {
      setError("Chưa tải được danh sách đề xuất. Thử tải lại.");
    }
  }

  useEffect(() => {
    void load();
  }, [client]);

  async function review(decision: "approved" | "rejected") {
    if (!selected || busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await client.mutate<Submission>(
        `/admin/submissions/${selected.id}/review`,
        { revision: selected.revision, decision, note },
      );
      setSelected(result);
      setQueue((items) => items.filter((item) => item.id !== result.id));
      setNotice(decision === "approved" ? "Đã duyệt đề xuất." : "Đã trả đề xuất để Creator chỉnh sửa.");
    } catch (cause) {
      setError(cause instanceof ApiError && cause.status === 409
        ? "Đề xuất vừa được thay đổi hoặc duyệt. Tải lại danh sách."
        : "Chưa lưu được quyết định duyệt. Thử lại.");
    } finally {
      setBusy(false);
    }
  }

  async function apply() {
    if (!selected || selected.status !== "approved" || !campus || busy || disabled) return;
    setBusy(true);
    onApplyingChange(true);
    setError("");
    try {
      const result = await client.mutate<{ submission: Submission; campus: ManagedCampus }>(
        `/admin/submissions/${selected.id}/apply`,
        { revision: campus.revision },
      );
      setSelected(result.submission);
      onApplied(result.campus);
      setNotice("Đã đưa đề xuất vào nháp Nội dung. Công bố vẫn cần thao tác riêng.");
    } catch (cause) {
      setError(cause instanceof ApiError && cause.status === 409
        ? "Bản nháp quản trị đã thay đổi hoặc đề xuất đã được áp dụng. Tải lại Nội dung và đối chiếu."
        : "Chưa đưa được đề xuất vào bản nháp quản trị.");
    } finally {
      setBusy(false);
      onApplyingChange(false);
    }
  }

  return (
    <section className="admin-section submission-review" aria-label="Duyệt đề xuất Creator">
      <h2>Đề xuất chờ duyệt</h2>
      <p>Đề xuất được duyệt chỉ đi vào bản nháp. Admin cần kiểm tra và công bố riêng.</p>
      {error && <p className="message error" role="alert">{error}</p>}
      {notice && <p className="message" role="status">{notice}</p>}
      <button disabled={busy} onClick={() => void load()}>Tải lại danh sách</button>
      {queue.length === 0 ? <p>Hiện không có đề xuất chờ duyệt.</p> : (
        <ul className="submission-queue">
          {queue.map((item) => (
            <li key={item.id}>
              <button aria-pressed={selected?.id === item.id} onClick={() => { setSelected(item); setNote(""); }}>
                {item.draft.title} · {item.draft.places.length} địa điểm
              </button>
            </li>
          ))}
        </ul>
      )}
      {selected && (
        <div className="submission-detail">
          <h3>{selected.draft.title}</h3>
          <ol>{selected.draft.places.map((place) => (
            <li key={place.id}><strong>{place.title}</strong><p>{place.description}</p><small>Nguồn: {place.source}</small></li>
          ))}</ol>
          {selected.status === "pending" && <>
            <label>Ghi chú cho Creator<textarea rows={3} maxLength={2000} value={note} onChange={(event) => setNote(event.target.value)} /></label>
            <div className="admin-actions">
              <button className="primary" disabled={busy} onClick={() => void review("approved")}>Duyệt đề xuất</button>
              <button disabled={busy} onClick={() => void review("rejected")}>Trả để chỉnh sửa</button>
            </div>
          </>}
          {selected.status === "approved" && <button className="primary" disabled={busy || disabled || !campus} onClick={() => void apply()}>Đưa vào nháp Nội dung</button>}
          {selected.status === "applied" && <p>Đã áp dụng ở phiên bản nháp {selected.applied_revision}.</p>}
          {selected.status === "rejected" && <p>Đã trả cho Creator để chỉnh sửa.</p>}
        </div>
      )}
    </section>
  );
}
