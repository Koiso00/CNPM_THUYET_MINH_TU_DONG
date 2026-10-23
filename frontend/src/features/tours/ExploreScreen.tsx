import { useEffect, useState } from "react";
import { ApiError, AuthClient } from "../auth/client";
import { ExplorePage } from "./ExplorePage";
import type { PublishedCampus } from "./content";
import type { GuestSession } from "../guest/session";

export function ExploreScreen({
  client,
  username,
  notice,
  guest,
}: {
  client: AuthClient;
  username: string;
  notice?: string;
  guest?: GuestSession;
}) {
  const [content, setContent] = useState<PublishedCampus | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setError("");
    void client
      .get<PublishedCampus>("/content/campus")
      .then((data) => {
        if (active) setContent(data);
      })
      .catch((cause) => {
        if (active)
          setError(
            cause instanceof ApiError && cause.status === 404
              ? "Chưa có nội dung được công bố. Vui lòng quay lại sau."
              : "Chưa tải được nội dung. Kiểm tra kết nối và thử lại.",
          );
      });
    return () => {
      active = false;
    };
  }, [client, attempt]);
  if (error)
    return (
      <div className="state-panel">
        <p role="alert">{error}</p>
        <button className="primary" onClick={() => setAttempt(attempt + 1)}>
          Thử lại
        </button>
      </div>
    );
  if (!content)
    return (
      <div className="state-panel" role="status">
        Đang tải địa điểm…
      </div>
    );
  if (!content.places.length)
    return <div className="state-panel">Chưa có địa điểm.</div>;
  return (
    <ExplorePage
      username={username}
      notice={notice}
      places={content.places}
      releaseId={content.release_id}
      guest={guest}
    />
  );
}
