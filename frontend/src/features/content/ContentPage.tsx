import { useEffect, useRef, useState } from "react";
import { ApiError, AuthClient } from "../auth/client";
import type {
  CampusDraft,
  LocalizedPlace,
  ManagedCampus,
  Place,
} from "../tours/content";
import { AudioPlayer } from "../tours/AudioPlayer";
import { WorkspaceNav } from "../../shared/WorkspaceNav";

type AudioStatus = {
  place_id: string;
  title: string;
  audio_id: string | null;
  duration_seconds: number | null;
  language: ContentLanguage;
  content_available: boolean;
};
type ContentLanguage = "vi" | "en" | "ko";
const languageNames: Record<ContentLanguage, string> = {
  vi: "Tiếng Việt",
  en: "English",
  ko: "한국어",
};

function completeTranslation(value: LocalizedPlace | undefined) {
  return Boolean(
    value?.title.trim() && value.description.trim() && value.source.trim(),
  );
}

async function sourceChecksum(value: string) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function translationFor(place: Place, language: ContentLanguage) {
  return language === "vi"
    ? place
    : place.translations?.[language] ?? {
        title: "",
        description: "",
        source: "",
        source_text_sha256: "",
      };
}
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
  const [contentLanguage, setContentLanguage] = useState<ContentLanguage>("vi");
  const revisionRef = useRef<number | null>(null);
  const editedTranslationsRef = useRef(new Set<string>());

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
    return () => {
      active = false;
    };
  }, [client]);
  useEffect(() => {
    let active = true;
    void client
      .get<AudioStatus[]>(`/admin/audio?language=${contentLanguage}`)
      .then((data) => {
        if (active) setAudio(data);
      })
      .catch(() => {
        if (active) setAudio([]);
      });
    return () => {
      active = false;
    };
  }, [client, contentLanguage]);
  async function refreshSummary(language = contentLanguage) {
    try {
      setAudio(
        await client.get<AudioStatus[]>(`/admin/audio?language=${language}`),
      );
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
      const outgoingDraft = structuredClone(draft);
      const incompleteTranslations = new Set<string>();
      for (const place of outgoingDraft.places) {
        for (const language of ["en", "ko"] as const) {
          const localized = place.translations?.[language];
          if (!localized) continue;
          const key = `${place.id}:${language}`;
          if (!completeTranslation(localized)) {
            incompleteTranslations.add(key);
            delete place.translations?.[language];
          } else if (editedTranslationsRef.current.has(key)) {
            localized.source_text_sha256 = await sourceChecksum(
              place.description,
            );
          }
        }
      }
      const data = await client.mutate<ManagedCampus>(
        kind === "save" ? "/admin/campus" : `/admin/campus/${kind}`,
        kind === "save"
          ? { revision, draft: outgoingDraft }
          : { revision },
        kind === "save" ? "PUT" : "POST",
      );
      revisionRef.current = data.revision;
      setCampus(data);
      const returnedDraft = structuredClone(data.draft);
      for (const oldPlace of draft.places) {
        const returnedPlace = returnedDraft.places.find(
          (item) => item.id === oldPlace.id,
        );
        if (!returnedPlace) continue;
        for (const language of ["en", "ko"] as const) {
          const key = `${oldPlace.id}:${language}`;
          const pending = oldPlace.translations?.[language];
          if (incompleteTranslations.has(key) && pending) {
            returnedPlace.translations ??= {};
            returnedPlace.translations[language] = pending;
          }
        }
      }
      setDraft(returnedDraft);
      setDirty(incompleteTranslations.size > 0);
      editedTranslationsRef.current.clear();
      setNotice(
        kind === "save"
          ? incompleteTranslations.size
            ? "Đã lưu các nội dung hợp lệ. Bản dịch đang nhập dở vẫn được giữ trên màn hình; hãy hoàn tất rồi lưu tiếp."
            : "Đã lưu bản nháp. Bản công bố vẫn giữ nguyên."
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
      places: draft.places.map((place, index) => {
        if (index !== selected) return place;
        if (contentLanguage === "vi") return { ...place, [field]: value };
        const localized = translationFor(place, contentLanguage);
        editedTranslationsRef.current.add(`${place.id}:${contentLanguage}`);
        return {
          ...place,
          translations: {
            ...place.translations,
            [contentLanguage]: { ...localized, [field]: value },
          },
        };
      }),
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
      editedTranslationsRef.current.clear();
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
        `/admin/campus/places/${placeId}/audio?revision=${revisionRef.current ?? campus.revision}&language=${contentLanguage}`,
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
  const localizedPlace = place
    ? translationFor(place, contentLanguage)
    : null;
  const hasTranslation = Boolean(
    place &&
      contentLanguage !== "vi" &&
      completeTranslation(place.translations?.[contentLanguage]),
  );
  return (
    <div className="workspace admin-page">
      <WorkspaceNav role="admin" route="#/admin" />
      <h1>Nội dung khuôn viên</h1>
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
        <h2>Địa điểm và nội dung</h2>
        <p>
          Chọn ngôn ngữ để biên tập tên, nội dung thuyết minh và nguồn tư liệu
          riêng cho từng địa điểm. Lưu bản nháp rồi công bố để áp dụng.
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
            <label className="admin-language-picker">
              Ngôn ngữ nội dung
              <select
                value={contentLanguage}
                disabled={busy}
                onChange={(event) => {
                  setContentLanguage(event.target.value as ContentLanguage);
                  setPreview(null);
                }}
              >
                {(Object.keys(languageNames) as ContentLanguage[]).map(
                  (language) => (
                    <option key={language} value={language}>
                      {languageNames[language]}
                    </option>
                  ),
                )}
              </select>
            </label>
            {contentLanguage === "vi" ? (
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
            ) : (
              <p>Tên tour hiện dùng chung; các trường bên dưới được biên tập riêng theo ngôn ngữ.</p>
            )}
            <div className="admin-editor">
              <div className="admin-place-list">
                {draft.places.map((item, index) => (
                  <button
                    key={item.id}
                    disabled={busy}
                    aria-pressed={selected === index}
                    onClick={() => setSelected(index)}
                  >
                    {index + 1}. {translationFor(item, contentLanguage).title || item.title}
                  </button>
                ))}
              </div>
              {place && (
                <div className="admin-place-fields">
                  {contentLanguage !== "vi" && (
                    <p className="message" role="status">
                      {hasTranslation
                        ? `Đang sửa bản ${languageNames[contentLanguage]}. Khi lưu, bản dịch được gắn với nội dung tiếng Việt hiện tại.`
                        : `Chưa có bản ${languageNames[contentLanguage]} cho địa điểm này. Nhập đủ ba trường để lưu bản dịch.`}
                    </p>
                  )}
                  <label>
                    Tên địa điểm
                    <input
                      value={localizedPlace?.title ?? ""}
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
                      value={localizedPlace?.description ?? ""}
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
                      value={localizedPlace?.source ?? ""}
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
                      : "Chưa có tọa độ lưu trong dữ liệu."}
                  </p>
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
        <h2>Audio · {languageNames[contentLanguage]}</h2>
        <p>
          Danh sách và tải MP3 áp dụng cho ngôn ngữ đang chọn. Audio chỉ dùng khi
          khớp chính xác nội dung; hãy công bố lại để người tham quan nghe được.
        </p>
        <div className="admin-audio-list">
          {audio.map((item) => (
            <div key={item.place_id}>
              <span>
                {item.title} ·{" "}
                {item.audio_id
                  ? `${item.duration_seconds} giây`
                  : item.content_available
                    ? "Chưa có audio khớp nội dung"
                    : "Hãy lưu bản dịch trước khi thêm audio"}
              </span>
              {item.audio_id && (
                <button onClick={() => setPreview(item)}>
                  Nghe thử {item.title}
                </button>
              )}
              <label>
                Tải MP3 {item.title} · {languageNames[contentLanguage]}
                <input
                  type="file"
                  accept=".mp3,audio/mpeg"
                disabled={busy || dirty || !item.content_available}
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
