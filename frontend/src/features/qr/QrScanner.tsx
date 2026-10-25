import { useEffect, useRef, useState } from "react";
import { translate, type AppLanguage } from "../../shared/i18n";

export function QrScanner({
  language,
  onDetected,
  onClose,
}: {
  language: AppLanguage;
  onDetected: (value: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let stream: MediaStream | null = null;
    let frame = 0;

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(translate(language, "qrCameraUnavailable"));
        return;
      }
      let jsQR: typeof import("jsqr").default;
      try {
        ({ default: jsQR } = await import("jsqr"));
      } catch {
        if (active) setError(translate(language, "qrScannerLoadError"));
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" } },
        });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const video = videoRef.current;
        if (!video) {
          stream.getTracks().forEach((track) => track.stop());
          setError(translate(language, "qrCameraError"));
          return;
        }
        video.srcObject = stream;
        try {
          await video.play();
        } catch {
          if (active) {
            stream.getTracks().forEach((track) => track.stop());
            video.srcObject = null;
            setError(translate(language, "qrCameraError"));
          }
          return;
        }

        const scanFrame = () => {
          if (!active) return;
          const canvas = canvasRef.current;
          const context = canvas?.getContext("2d", { willReadFrequently: true });
          if (!canvas || !context || !video.videoWidth || !video.videoHeight) {
            frame = requestAnimationFrame(scanFrame);
            return;
          }
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
          const result = jsQR(pixels.data, pixels.width, pixels.height);
          if (result) {
            onDetected(result.data);
            return;
          }
          frame = requestAnimationFrame(scanFrame);
        };
        frame = requestAnimationFrame(scanFrame);
      } catch (cause) {
        if (!active) return;
        setError(
          cause instanceof DOMException && cause.name === "NotAllowedError"
            ? translate(language, "qrCameraDenied")
            : translate(language, "qrCameraError"),
        );
      }
    }

    void startCamera();
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((track) => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [language, onDetected]);

  return (
    <div className="qr-overlay">
      <section
        className="qr-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-dialog-title"
      >
        <div className="qr-dialog-heading">
          <div>
            <h2 id="qr-dialog-title">{translate(language, "qrScan")}</h2>
            <p>{translate(language, "qrInstructions")}</p>
          </div>
          <button type="button" onClick={onClose}>
            {translate(language, "qrClose")}
          </button>
        </div>
        <video
          ref={videoRef}
          className="qr-camera"
          aria-label={translate(language, "qrCamera")}
          autoPlay
          muted
          playsInline
        />
        <canvas ref={canvasRef} hidden />
        {error && (
          <p className="message error" role="alert">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}
