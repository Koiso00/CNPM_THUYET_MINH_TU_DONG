import { useEffect, useState } from "react";
import { Icon } from "../../shared/Icons";
import { GuestSession } from "./session";

export function GuestWelcome({ session, onStarted }: { session: GuestSession; onStarted: () => void }) {
  const [error, setError] = useState("");
  useEffect(() => {
    void session.recordVisit().catch(() =>
      setError("Chưa ghi nhận được lượt truy cập. Bạn vẫn có thể bắt đầu tham quan."),
    );
  }, [session]);

  async function start() {
    setError("");
    try {
      await session.startJourney();
      onStarted();
    } catch {
      setError("Chưa bắt đầu được hành trình. Kiểm tra kết nối và thử lại.");
    }
  }

  return (
    <div className="guest-welcome">
      <section className="guest-hero-copy" aria-labelledby="guest-welcome-title">
        <p className="guest-location-pill"><span /> CƠ SỞ CHÍNH · ĐẠI HỌC SÀI GÒN · 273 AN DƯƠNG VƯƠNG</p>
        <h1 id="guest-welcome-title">Mỗi góc trường,<br /><em>một câu chuyện.</em></h1>
        <p className="guest-hero-lead">Chậm lại một chút, bật âm thanh và khám phá từng mảng kiến trúc của Đại học Sài Gòn theo một cách hoàn toàn mới.</p>
        <div className="guest-feature-previews" aria-label="Một số điểm nổi bật">
          <article>
            <img src="/images/sgu-campus-courtyard.jpg" alt="Một góc khuôn viên Đại học Sài Gòn" />
            <span><b>ĐỊA ĐIỂM</b><strong>Khu A</strong><small>Nội dung thuyết minh</small></span>
          </article>
          <article>
            <img src="/images/sgu-campus-wide.jpg" alt="Toàn cảnh khuôn viên Đại học Sài Gòn" />
            <span><b>KHÔNG GIAN KHUÔN VIÊN</b><strong>10 điểm đang có</strong><small>Tiếng Việt · nghe thủ công</small></span>
          </article>
        </div>
        <div className="guest-sound-note">
          <span className="guest-sound-bars" aria-hidden="true"><i /><i /><i /><i /><i /></span>
          <span><strong>Một khuôn viên. Nhiều điều để nghe.</strong><small>Chọn điểm bất kỳ và bắt đầu hành trình theo nhịp riêng.</small></span>
        </div>
      </section>

      <section className="guest-start-card" aria-labelledby="guest-start-title">
        <p className="guest-card-eyebrow"><span /> KHỞI ĐẦU HÀNH TRÌNH DI SẢN</p>
        <h2 id="guest-start-title">Chào mừng bạn đến với SGU Campus Guide</h2>
        <p className="guest-card-intro">Không cần đăng nhập tài khoản. Bạn có thể tự do khám phá các địa điểm và nghe những bài thuyết minh tiếng Việt.</p>
        {error && <p role="alert" className="message error">{error}</p>}
        <button className="guest-start-button" aria-label="Bắt đầu tham quan" onClick={() => void start()}>
          <span className="guest-play-icon">▶</span> Bắt đầu cuộc hành trình <Icon name="arrow" />
        </button>
        <div className="guest-benefits" aria-label="Tính năng hiện có">
          <span><Icon name="pin" size={17} /><b>Phát thủ công</b></span>
          <span><Icon name="arrow" size={17} /><b>Vào tự do</b></span>
          <span><Icon name="audio" size={17} /><b>Audio MP3</b></span>
        </div>
        <div className="guest-offline-note"><Icon name="audio" size={16} /> <span>Nghe nội dung trực tuyến</span></div>
        <p className="guest-tip"><span>✦</span><span><b>Gợi ý:</b> Bạn có thể chọn bất kỳ địa điểm nào trong danh sách sau khi bắt đầu. GPS và offline sẽ được bổ sung ở giai đoạn sau.</span></p>
        <a className="guest-admin-link" href="#/login">Đăng nhập quản trị</a>
      </section>
    </div>
  );
}
