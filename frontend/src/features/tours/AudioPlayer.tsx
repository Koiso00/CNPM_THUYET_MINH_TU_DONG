import { useEffect, useRef, useState } from "react";

export function AudioPlayer({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const audio = ref.current;
    return () => {
      audio?.pause();
    };
  }, []);
  return (
    <div className="campus-audio">
      <audio
        ref={ref}
        controls
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
    </div>
  );
}
