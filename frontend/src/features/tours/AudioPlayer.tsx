import { useEffect, useRef, useState } from "react";

export function AudioPlayer({
  src,
  title,
  onPlay,
  autoPlayRequestId,
}: {
  src: string;
  title: string;
  onPlay?: (trigger: "automatic" | "manual") => void;
  autoPlayRequestId?: number | null;
}) {
  const ref = useRef<HTMLAudioElement>(null);
  const automaticPlayRef = useRef(false);
  const [failed, setFailed] = useState(false);
  const [autoPlayBlocked, setAutoPlayBlocked] = useState(false);
  useEffect(() => {
    const audio = ref.current;
    return () => {
      audio?.pause();
    };
  }, []);

  useEffect(() => {
    if (autoPlayRequestId == null) return;
    const audio = ref.current;
    if (!audio) return;
    let cancelled = false;
    automaticPlayRef.current = true;
    setAutoPlayBlocked(false);
    void audio.play().catch(() => {
      automaticPlayRef.current = false;
      if (!cancelled) setAutoPlayBlocked(true);
    });
    return () => {
      cancelled = true;
    };
  }, [autoPlayRequestId]);

  return (
    <div className="campus-audio">
      <audio
        ref={ref}
        controls
        onPlay={() => {
          const trigger = automaticPlayRef.current ? "automatic" : "manual";
          automaticPlayRef.current = false;
          setAutoPlayBlocked(false);
          onPlay?.(trigger);
        }}
        preload="none"
        src={src}
        aria-label={`Nghe ${title}`}
        onError={() => setFailed(true)}
        onCanPlay={() => setFailed(false)}
      />
      {failed && (
        <div>
          <p role="alert">Chưa phát được audio. Kiểm tra kết nối và thử lại.</p>
          <button
            type="button"
            onClick={() => {
              setFailed(false);
              ref.current?.load();
            }}
          >
            Tải lại audio
          </button>
        </div>
      )}
      {autoPlayBlocked && !failed && (
        <p className="audio-autoplay-fallback" role="status">
          Trình duyệt đã chặn tự phát. Nhấn nút phát trên trình nghe để tiếp tục.
        </p>
      )}
    </div>
  );
}
