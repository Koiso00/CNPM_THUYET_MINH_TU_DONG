import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export type AudioPlayerHandle = {
  prepareForAutomaticPlayback: () => void;
  playFromUserGesture: (src: string) => void;
};

export const AudioPlayer = forwardRef<AudioPlayerHandle, {
  src: string;
  title: string;
  onPlay?: (trigger: "automatic" | "manual") => void;
  autoPlayRequestId?: number | null;
}>(function AudioPlayer({
  src,
  title,
  onPlay,
  autoPlayRequestId,
}, playerRef) {
  const ref = useRef<HTMLAudioElement>(null);
  const automaticPlayRef = useRef(false);
  const preparedRef = useRef(false);
  const [failed, setFailed] = useState(false);
  const [autoPlayBlocked, setAutoPlayBlocked] = useState(false);
  useImperativeHandle(playerRef, () => ({
    prepareForAutomaticPlayback() {
      const audio = ref.current;
      if (!audio || preparedRef.current) return;
      // Safari requires the first media load to happen inside a user gesture.
      audio.load();
      preparedRef.current = true;
    },
    playFromUserGesture(nextSrc) {
      const audio = ref.current;
      if (!audio) return;
      automaticPlayRef.current = false;
      setFailed(false);
      setAutoPlayBlocked(false);
      audio.src = nextSrc;
      audio.load();
      preparedRef.current = true;
      try {
        void Promise.resolve(audio.play()).catch(() => setAutoPlayBlocked(true));
      } catch {
        setAutoPlayBlocked(true);
      }
    },
  }), []);
  useEffect(() => {
    const audio = ref.current;
    return () => {
      audio?.pause();
    };
  }, []);

  useEffect(() => {
    automaticPlayRef.current = false;
    setFailed(false);
    setAutoPlayBlocked(false);
  }, [src]);

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
});
