import { useEffect, useRef, useState } from "react";
import { ApiError, AuthClient } from "../auth/client";
import type { CampusDraft, ManagedCampus } from "../tours/content";
import { AudioPlayer } from "../tours/AudioPlayer";
import { WorkspaceNav } from "../../shared/WorkspaceNav";
import { SubmissionReviewPanel } from "./SubmissionReviewPanel";

type AudioStatus = {
  place_id: string;
  title: string;
  audio_id: string | null;
  duration_seconds: number | null;
};
function message(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 409)
      return "Dữ liệu đã thay đổi hoặc tài khoản quản trị được bảo vệ. Tải lại để kiểm tra; nội dung đang nhập vẫn được giữ.";
    if (error.status === 404)
      return "Chưa có dữ liệu khuôn viên. Cần nhập bộ nội dung demo vào hệ thống trước.";
    if (error.status === 403)
      return "Tài khoản không có quyền thực hiện thao tác này.";
    if (error.status === 422)
      return "Kiểm tra các trường bắt buộc và độ dài nội dung.";
  }
  return "Chưa hoàn tất thao tác. Kiểm tra kết nối; dữ liệu đang nhập vẫn được giữ.";
}

export function ContentPage({ client }: { client: AuthClient }) {
  const [campus, setCampus] = useState<ManagedCampus | null>(null);
  const [draft, setDraft] = useState<CampusDraft | null>(null);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [audio, setAudio] = useState<AudioStatus[]>([]);
  const [preview, setPreview] = useState<AudioStatus | null>(null);
  const [selected, setSelected] = useState(0);
  const revisionRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    void client
      .get<ManagedCampus>("/admin/campus")
      .then((data) => {
        if (active) {
          revisionRef.current = data.revision;
          setCampus(data);
          setDraft(data.draft);
        }
      })
      .catch((cause) => {
        if (active) setError(message(cause));
      });
    void client
      .get<AudioStatus[]>("/admin/audio")
      .then((data) => {
        if (active) setAudio(data);
      })
      .catch(() => {
        /* An uninitialized draft is already explained by the editor. */
      });
    return () => {
      active = false;
    };
  }, [client]);
  async function refreshSummary() {
    try {
      setAudio(await client.get<AudioStatus[]>("/admin/audio"));
    } catch {
      setError(
        "Thao tác đã hoàn tất nhưng chưa cập nhật được audio. Tải lại bản nháp để kiểm tra.",
      );
    }
  }
  async function action(kind: "save" | "publish" | "unpublish") {
    if (!campus || !draft || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const revision = revisionRef.current ?? campus.revision;
      const data = await client.mutate<ManagedCampus>(
        kind === "save" ? "/admin/campus" : `/admin/campus/${kind}`,
        kind === "save"
          ? { revision, draft }
          : { revision },
        kind === "save" ? "PUT" : "POST",
      );
      revisionRef.current = data.revision;
      setCampus(data);
      setDraft(data.draft);
      setDirty(false);
      setNotice(
        kind === "save"
          ? "Đã lưu bản nháp. Bản công bố vẫn giữ nguyên."
          : kind === "publish"
            ? "Đã công bố phiên bản mới cho người tham quan."
            : "Đã gỡ công bố.",
      );
      await refreshSummary();
    } catch (cause) {
      setError(message(cause));
    } finally {
      setBusy(false);
    }
  }
  function changePlace(
    field: "title" | "description" | "source",
    value: string,
  ) {
    if (!draft) return;
    setDraft({
      ...draft,
      places: draft.places.map((place, index) =>
        index === selected ? { ...place, [field]: value } : place,
      ),
    });
    setDirty(true);
  }
  async function reloadDraft() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const data = await client.get<ManagedCampus>("/admin/campus");
      revisionRef.current = data.revision;
      setCampus(data);
      setDraft(data.draft);
      setDirty(false);
      setSelected(0);
      await refreshSummary();
    } catch (cause) {
      setError(message(cause));
    } finally {
      setBusy(false);
    }
  }
  async function uploadAudio(placeId: string, file: File) {
    if (!campus || dirty || busy) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("MP3 tối đa 10 MB/file.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await client.mutate(
        `/admin/campus/places/${placeId}/audio?revision=${revisionRef.current ?? campus.revision}`,
        new Blob([file], { type: "audio/mpeg" }),
        "PUT",
      );
      setNotice(
        "Đã tải MP3. Nghe thử và công bố lại để áp dụng cho người tham quan.",
      );
      setPreview(null);
      await refreshSummary();
    } catch (cause) {
      setError(message(cause));
    } finally {
      setBusy(false);
    }
  }
  const place = draft?.places[selected];
  return (
    <div className="workspace admin-page">
      <WorkspaceNav role="admin" route="#/admin" />
      <h1>Nội dung khuôn viên</h1>
      <SubmissionReviewPanel
        client={client}
        campus={campus}
        disabled={busy || dirty}
        onApplyingChange={setBusy}
        onApplied={(result) => {
          revisionRef.current = result.revision;
          setCampus(result);
          setDraft(result.draft);
          setDirty(false);
          void refreshSummary();
        }}
      />
      {error && (
        <p className="message error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="message" role="status">
          {notice}
        </p>
      )}
      <section className="admin-section" aria-label="Địa điểm và nội dung">
        <h2>Địa điểm và nội dung tiếng Việt</h2>
        <p>
          Chỉnh sửa bản nháp, lưu rồi công bố. Vị trí có thể để trống đến khi
          khảo sát.
        </p>
        <div className="admin-actions">
          <button
            disabled={busy}
            onClick={() => {
              if (
                !dirty ||
                window.confirm("Bỏ thay đổi chưa lưu và tải lại bản nháp?")
              )
                void reloadDraft();
            }}
          >
            Tải lại bản nháp
          </button>
          <a href="#/explore">Xem bản công bố</a>
        </div>
        {draft && campus && (
          <>
            <p>
              Phiên bản nháp: {campus.revision} ·{" "}
              {dirty ? "Có thay đổi chưa lưu" : "Đã đồng bộ"} ·{" "}
              {campus.published_release_id
                ? "Đang có bản công bố"
                : "Chưa công bố"}
            </p>
            <label>
              Tên tour
              <input
                value={draft.title}
                maxLength={200}
                disabled={busy}
                onChange={(event) => {
                  setDraft({ ...draft, title: event.target.value });
                  setDirty(true);
                }}
              />
            </label>
            <div className="admin-editor">
              <div className="admin-place-list">
                {draft.places.map((item, index) => (
                  <button
                    key={item.id}
                    disabled={busy}
                    aria-pressed={selected === index}
                    onClick={() => setSelected(index)}
                  >
                    {index + 1}. {item.title}
                  </button>
                ))}
                <button
                  disabled={busy || draft.places.length >= 100}
                  onClick={() => {
                    setDraft({
                      ...draft,
                      places: [
                        ...draft.places,
                        {
                          id: crypto.randomUUID(),
                          title: "Địa điểm mới",
                          description: "",
                          source: "",
                          location: null,
                        },
                      ],
                    });
                    setSelected(draft.places.length);
                    setDirty(true);
                  }}
                >
                  Thêm địa điểm
                </button>
              </div>
              {place && (
                <div className="admin-place-fields">
                  <label>
                    Tên địa điểm
                    <input
                      value={place.title}
                      maxLength={200}
                      disabled={busy}
                      onChange={(event) =>
                        changePlace("title", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    Nội dung thuyết minh
                    <textarea
                      rows={9}
                      value={place.description}
                      maxLength={20000}
                      disabled={busy}
                      onChange={(event) =>
                        changePlace("description", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    Nguồn tư liệu
                    <textarea
                      rows={2}
                      value={place.source}
                      maxLength={2000}
                      disabled={busy}
                      onChange={(event) =>
                        changePlace("source", event.target.value)
                      }
                    />
                  </label>
                  <p>
                    {place.location
                      ? "Đã có tọa độ lưu trong dữ liệu."
                      : "Chưa có tọa độ khảo sát."}
                  </p>
                  <button
                    disabled={busy}
                    onClick={() => {
                      if (!window.confirm(`Xóa ${place.title} khỏi bản nháp?`))
                        return;
                      setDraft({
                        ...draft,
                        places: draft.places.filter(
                          (item) => item.id !== place.id,
                        ),
                      });
                      setSelected(0);
                      setDirty(true);
                    }}
                  >
                    Xóa khỏi bản nháp
                  </button>
                </div>
              )}
            </div>
            <div className="admin-actions">
              <button
                className="primary"
                disabled={busy || !dirty}
                onClick={() => void action("save")}
              >
                Lưu bản nháp
              </button>
              <button
                disabled={busy || dirty || !draft.places.length}
                onClick={() => void action("publish")}
              >
                Công bố phiên bản đã lưu
              </button>
              <button
                disabled={busy || dirty || !campus.published_release_id}
                onClick={() => void action("unpublish")}
              >
                Gỡ công bố
              </button>
            </div>
          </>
        )}
      </section>
      <section className="admin-section" aria-label="Thư viện audio">
        <h2>Audio theo nội dung đã lưu</h2>
        <p>
          Audio chỉ dùng khi khớp chính xác văn bản. Sau khi nhập audio, công bố
          lại để người tham quan nghe được.
        </p>
        <div className="admin-audio-list">
          {audio.map((item) => (
            <div key={item.place_id}>
              <span>
                {item.title} ·{" "}
                {item.audio_id
                  ? `${item.duration_seconds} giây`
                  : "Chưa có audio khớp nội dung"}
              </span>
              {item.audio_id && (
                <button onClick={() => setPreview(item)}>
                  Nghe thử {item.title}
                </button>
              )}
              <label>
                Thay MP3 {item.title}
                <input
                  type="file"
                  accept=".mp3,audio/mpeg"
                  disabled={busy || dirty}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadAudio(item.place_id, file);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
          ))}
        </div>
        {preview?.audio_id && (
          <AudioPlayer
            key={preview.audio_id}
            title={preview.title}
            src={`/api/v1/admin/audio/${preview.audio_id}`}
          />
        )}
      </section>
    </div>
  );
}
