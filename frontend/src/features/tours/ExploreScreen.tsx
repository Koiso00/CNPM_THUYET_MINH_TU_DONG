import { useEffect, useState } from "react";
import { ApiError, AuthClient } from "../auth/client";
import { ExplorePage } from "./ExplorePage";
import type { PublishedCampus } from "./content";
import type { GuestSession } from "../guest/session";
import { translate, type AppLanguage } from "../../shared/i18n";

export function ExploreScreen({
  client,
  username,
  notice,
  guest,
  language = "vi",
  initialPlaceId,
  initialQrEventId,
}: {
  client: AuthClient;
  username: string;
  notice?: string;
  guest?: GuestSession;
  language?: AppLanguage;
  initialPlaceId?: string | null;
  initialQrEventId?: string | null;
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
              ? translate(language, "noPublished")
              : translate(language, "loadError"),
          );
      });
    return () => {
      active = false;
    };
  }, [client, attempt, language]);
  if (error)
    return (
      <div className="state-panel">
        <p role="alert">{error}</p>
        <button className="primary" onClick={() => setAttempt(attempt + 1)}>
          {translate(language, "retry")}
        </button>
      </div>
    );
  if (!content)
    return (
      <div className="state-panel" role="status">
        {translate(language, "loading")}
      </div>
    );
  if (!content.places.length)
    return <div className="state-panel">{translate(language, "noPlaces")}</div>;
  return (
    <ExplorePage
      username={username}
      notice={notice}
      places={content.places}
      releaseId={content.release_id}
      guest={guest}
      language={language}
      initialPlaceId={initialPlaceId}
      initialQrEventId={initialQrEventId}
    />
  );
}
