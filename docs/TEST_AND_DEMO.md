> **Ảnh chụp ngày 23/10/2026 — lịch sử:** khách không đăng nhập; welcome, hành trình, nội dung/audio và dashboard đã có; QR còn hoãn tại thời điểm đó. Trạng thái mới nhất xem ở phần cập nhật 24/10 dưới đây và [kế hoạch khách/QR](DEMO_GUEST_QR_PLAN.md).

# Kiểm thử và demo

## Cập nhật bản song ngữ — 24/10/2026

Người dùng duyệt bản dịch và audio English cho 10 POI. Atlas release `09d43a32-43d1-4f2b-85d0-cdae2ad29981` có đủ 10 bản dịch, 10 audio English và 10 audio Việt. API trả byte range 206 cho cả hai ngôn ngữ; frontend chọn audio theo locale và giữ icon POI theo tên gốc. Hồi quy: 181 backend test đạt, 16 integration test skip theo mặc định; 61 frontend test đạt; Ruff/typecheck/build đạt. Code mới hiện ở workspace. Render báo service `sgu-campus-guide-demo` “Suspended by you”, nên chưa deploy code lên đó.

## Cập nhật biên tập nội dung theo ngôn ngữ — 24/10/2026

Admin có bộ chọn Tiếng Việt/English/한국어 cho các trường tên địa điểm, thuyết minh và nguồn tư liệu. Danh sách và tải MP3 theo ngôn ngữ đang chọn; có thể nghe thử audio đã nhập. Bản dịch đang nhập dở được giữ trong biểu mẫu và không gửi như bản hợp lệ; sửa nội dung Việt làm checksum bản dịch cũ mất hiệu lực đến khi Admin cập nhật bản dịch. Tên tour hiện dùng chung giữa các ngôn ngữ. Build/typecheck và 61 frontend test đạt; backend 181 test đạt, 16 integration test bỏ qua theo mặc định. Xem [nhật ký Admin đa ngôn ngữ](test-reports/ADMIN_MULTILINGUAL_CONTENT_2026_10_24.md).

Trạng thái 24/10/2026: khách không đăng nhập; Admin quản lý nội dung/audio và dashboard; Stadia, 10 marker, GPS opt-in/mô phỏng/geofence đã có. Người dùng đã thử GPS trên điện thoại, kiểm chứng tọa độ thực địa và xác nhận chạm điểm phát audio được. Tự phát theo geofence trên iPhone/Safari và ngưỡng thực tế còn chờ nghiệm thu. Dashboard có bộ lọc ngày ICT, tổng visit/journey/audio và lượt phát audio theo địa điểm từ sự kiện thật; người dùng xác nhận bản deploy hoạt động sau sửa lỗi aggregate async. Mô phỏng không ghi thống kê thật. Đợt hồi quy đa ngôn ngữ gần nhất: frontend 61 test; backend 181 test, 16 integration skip mặc định; Ruff/typecheck/build đạt. E2E 12/12 desktop/mobile là kết quả hồi quy trước đó. Render hiện báo service “Suspended by you”; code workspace mới chưa deploy lên đó. Xem [nhật ký dashboard](test-reports/ADMIN_DASHBOARD_PROGRESS_2026_10_24.md), [OSM/GPS](test-reports/MAP_OSM_PROGRESS_2026_10_24.md), [đa ngôn ngữ](test-reports/MULTILINGUAL_UI_PROGRESS_2026_10_24.md), [Admin/audio](test-reports/DEMO_CONTENT_AUDIO_ADMIN.md) và [khách](test-reports/DEMO_GUEST_PROGRESS_2026_10_23.md).

## Kiểm tra khung

Typecheck/build frontend; kiểm tra cú pháp và lint Python; smoke test health/OpenAPI.
Kiểm tra frontend build được phục vụ cùng nguồn FastAPI.
Những kiểm tra này không xác nhận chức năng nghiệp vụ, kết nối MongoDB hoặc Docker.

### Kết quả khung ngày 21/10/2026 — lịch sử

- Đạt: TypeScript và production build với React 19.2.9, Vite 7.3.7, Node.js 24.19.0.
- Đạt: lint, kiểm tra định dạng và biên dịch Python 3.12.10.
- Đạt: smoke test health/OpenAPI bằng TestClient; router chưa triển khai trả 404.
- Đạt: FastAPI phục vụ frontend đã build và các tài nguyên JS/CSS cùng nguồn với API.
- Đạt: liên kết Markdown nội bộ; bản kế hoạch gốc trùng nội dung byte với file được chọn.
- Đạt: cấu trúc YAML của Compose đọc được. Chưa chạy Docker vì máy chưa có Docker.
- Tại thời điểm đó chưa kiểm thử MongoDB/GridFS, auth/RBAC, GPS, audio, PWA/offline, AI hoặc triển khai cloud. Các phần đã thực hiện sau đó có báo cáo riêng.

Đây là kết quả kiểm tra nền tảng, không phải báo cáo nghiệm thu sản phẩm.

## Ma trận nghiệm thu mục tiêu

Cập nhật 22/10: xem [báo cáo demo nội dung/audio/quản trị](test-reports/DEMO_CONTENT_AUDIO_ADMIN.md)

Cập nhật 23/10: khách công khai, ID khách/hành trình và thống kê cơ bản đã có trong
[báo cáo demo khách](test-reports/DEMO_GUEST_PROGRESS_2026_10_23.md). QR/camera vẫn hoãn.
Các số lượng và giới hạn theo từng mốc cũ bên dưới là lịch sử kiểm thử.

Mốc UI 23/10: `#/welcome` tách khỏi `#/explore`, khách không đăng nhập; route đăng ký cũ chuyển về login. Trạng thái 24/10: bộ chọn VI/EN/KO hoạt động tại Welcome và giữ lựa chọn trong hành trình; header mobile hiển thị bộ chọn. Cập nhật 26/10: release đã duyệt có nội dung/audio POI tiếng Việt, English và Korean cho đủ 10 điểm. Xem [báo cáo đa ngôn ngữ](test-reports/MULTILINGUAL_UI_PROGRESS_2026_10_24.md) và [nhật ký audio Hàn](test-reports/DEMO_AUDIO_KO_DRAFT_2026_10_26.md).

Kết quả từng phần được cập nhật riêng: [P1.1 MongoDB](test-reports/P1_1_MONGODB.md).
P1.1 đã có 34 test cục bộ đạt và một integration test ping Atlas thật đạt.
P1.2: [User/session và index](test-reports/P1_2_USER_SESSIONS.md), 69 test cục bộ
và 12 test Atlas đạt; đã tạo index ứng dụng. Chưa nghiệm thu luồng đăng nhập HTTP.
P1.3: [API xác thực](test-reports/P1_3_AUTH.md), 124 test cục bộ và 14 test Atlas đạt.
Luồng HTTP đã kiểm thử. Demo ưu tiên mới theo [DEMO_2_DAYS](DEMO_2_DAYS.md).
P1.4: [UI auth và trạng thái phiên](test-reports/P1_4_AUTH_UI.md), 18 test frontend
và 4 test Edge/Atlas tạm đạt; desktop 1366×900, mobile viewport 390×844.
Các số kiểm thử P1.4 bên trên thuộc mốc ban đầu. Người dùng đã kiểm tra bản đồ/audio và tọa độ trên điện thoại; trang Admin và dashboard hiện có nghiệp vụ. Các nghiệm thu còn lại được nêu trong trạng thái 24/10 ở đầu tài liệu.
Chuẩn bị audio: [10 MP3 tiếng Việt giọng nam](test-reports/DEMO_AUDIO_VI_MALE.md),
131 test cục bộ đạt; 10/10 file khớp checksum/nguồn và có thời lượng MP3 hợp lệ.
Chưa nghe duyệt hoặc kiểm thử trình phát.

| Nhóm | Tình huống cần chứng minh |
| --- | --- |
| Auth/RBAC dài hạn | Đăng ký không tự chọn quyền; User không xem nháp; Creator không sửa nội dung ngoài quyền; CSRF, hết hạn/thu hồi phiên. Creator workflow chưa thuộc demo hiện hành. |
| Công bố | Từ chối/gửi lại; sửa nháp giữ nguyên release; bản dịch/audio đúng phiên bản; asset nháp không tải trái phép |
| GPS | Sai số, mẫu cũ, ranh giới vùng, vùng chồng nhau, từ chối quyền, ẩn/hiện trang |
| Audio | Một nguồn phát; không phát lặp; đổi ngôn ngữ; từng tầng fallback; thiếu giọng cục bộ; autoplay bị chặn |
| Jobs | Yêu cầu trùng, giới hạn đồng thời, provider lỗi, retry hữu hạn, restart và kết quả lỗi thời |
| Offline | Chỉ tải Việt vẫn dùng được khi tắt mạng/đóng mở lại; thêm Anh không tải lại bản đồ/ảnh hợp lệ; ngôn ngữ chưa tải báo thiếu; tải dở/checksum sai/cập nhật lỗi/browser xóa dữ liệu không báo sẵn sàng |
| Đăng xuất | Xóa cache/quyền theo tài khoản, nhiều tab, đăng xuất offline rồi kết nối lại |
| Dashboard | Bắt đầu tour/nghe hoàn tất đúng, sự kiện gửi lại không nhân đôi, loại mô phỏng khỏi dữ liệu thật |
| Triển khai | Secrets không vào frontend; HTTPS; restart không mất asset; phục hồi bản chạy trên máy |

Thiết bị chính: Chrome Android và Chrome/Edge máy tính.
Safari iPhone kiểm tra bổ sung, báo rõ kết quả; không tuyên bố hỗ trợ khi chưa thử.

## Kịch bản kế hoạch dài hạn

1. Creator nhập một điểm có nguồn, Việt–Anh, ảnh và audio; gửi duyệt.
2. Admin duyệt; User chỉ thấy bản đã công bố.
3. User bắt đầu tour, bật mô phỏng và đi qua các điểm; không cần cấp GPS trong chế độ này.
4. Chuyển Việt/Anh, nghe lại thủ công, kiểm tra hàng đợi.
5. Chỉ tải gói tiếng Việt; tắt mạng, đóng/mở lại vẫn xem bản đồ/nghe Việt. Chọn Anh chưa tải phải báo thiếu.
   Có mạng lại, tải bổ sung Anh và kiểm tra không tải lại tài nguyên chung còn hợp lệ; thử cả hai offline.
6. Có mạng lại, đồng bộ sự kiện một lần; dashboard không trộn dữ liệu mô phỏng.
7. Thử đăng xuất offline, kết nối lại và xác nhận phiên không tự khôi phục ngoài ý muốn.

GPS mô phỏng không thay thế khảo sát thực địa. Chuẩn bị bản local và tài nguyên từ trước,
không phụ thuộc dịch/TTS/Gemini trực tiếp trong buổi trình bày.

## Ghi nhận kết quả

Mỗi lần nghiệm thu lưu commit, trình duyệt/thiết bị, dữ liệu sử dụng, bước thực hiện,
kết quả thực tế và lỗi còn lại. Chưa có báo cáo nghiệm thu nghiệp vụ ở thời điểm tạo khung.
