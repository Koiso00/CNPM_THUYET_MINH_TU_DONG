import { useEffect, useState } from "react";
import { createPlaceQrAssets } from "./qr";

export function PlaceQrCode({
  placeId,
  title,
}: {
  placeId: string;
  title: string;
}) {
  const [assets, setAssets] = useState<{ png: string; svg: string } | null>(
    null,
  );
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setAssets(null);
    setError("");
    void createPlaceQrAssets(placeId, window.location.href)
      .then((result) => {
        if (active) setAssets(result);
      })
      .catch(() => {
        if (active) setError("Chưa tạo được mã QR. Vui lòng thử lại.");
      });
    return () => {
      active = false;
    };
  }, [placeId]);

  return (
    <section className="place-qr" aria-label={`Mã QR ${title}`}>
      <h3>Mã QR địa điểm</h3>
      <p>In hoặc tải mã để khách mở đúng địa điểm trong bản công bố.</p>
      {error ? (
        <p className="message error" role="alert">
          {error}
        </p>
      ) : assets ? (
        <>
          <img className="place-qr-preview" src={assets.png} alt={`Mã QR ${title}`} />
          <div className="place-qr-actions">
            <a href={assets.png} download={`sgu-${placeId}.png`}>
              Tải PNG
            </a>
            <a
              href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(assets.svg)}`}
              download={`sgu-${placeId}.svg`}
            >
              Tải SVG
            </a>
          </div>
        </>
      ) : (
        <p role="status">Đang tạo mã QR…</p>
      )}
    </section>
  );
}
