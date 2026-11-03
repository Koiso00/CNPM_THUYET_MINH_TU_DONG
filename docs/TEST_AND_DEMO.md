> **Cập nhật người dùng 03/11/2026:** Ghi nhận GPS/geofence đã khảo sát theo yêu cầu người dùng; không có số liệu hay biên bản khảo sát mới kèm theo. Dashboard đã được người dùng kiểm thử thực tế và xác nhận đạt; Render đã triển khai thành công theo xác nhận người dùng. Bỏ qua nghiệm thu tự phát Safari, hàng đợi audio và Docker. Các ghi chú cũ yêu cầu các phần này chỉ là lịch sử.



> **Quyết định ngày 27/10/2026:** Người dùng loại chức năng offline khỏi toàn bộ phạm vi dự án và kế hoạch dài hạn. Các mô tả trước đây về offline chỉ có giá trị lịch sử.

> *md).

# Kiểm thử và demo

## Cập nhật CI/CD — 26/10/2026

GitHub Actions run #3 trên `main`, commit `342d3e5`, đạt ở hai job Frontend checks và
Backend checks; frontend 61/61 test đạt. Ruff check và format check cũng đạt tại workspace.
Người dùng kiểm tra `/api/v1/health/ready` trên Render và nhận `{"status":"ready",
"database":"connected"}`. Đây là kiểm tra readiness API/Atlas, chưa phải nghiệm thu toàn
bộ giao diện, audio hoặc deploy đúng commit mới nhất. Auto-Deploy **After CI Checks Pass**
trên Render chưa được xác nhận. Xem [nhật ký CI/CD](test-reports/CI_CD_PROGRESS_2026_10_26.md).

## Cập nhật bản song ngữ — 24/10/2026

Người dùng duyệt bản dịch và audio English cho 10 POI. Atlas release `09d43a32-43d1-4f2b-85d0-cdae2ad29981` có đủ 10 bản dịch, 10 audio English và 10 audio Việt. API trả byte range 206 cho cả hai ngôn ngữ; frontend chọn audio theo locale và giữ icon POI theo tên gốc. Hồi quy: 181 backend test đạt, 16 integration test skip theo mặc định; 61 frontend test đạt; Ruff/typecheck/build đạt. Code mới hiện ở workspace. Tại thời điểm ghi nhận 24/10, Render báo service `sgu-campus-guide-demo` “Suspended by you”; xem cập nhật readiness/CI/CD ngày 26/10 ở đầu tài liệu.

## Cập nhật biên tập nội dung theo ngôn ngữ — 24/10/2026

Admin có bộ chọn Tiếng Việt/English/한국어 cho các trường tên địa điểm, thuyết minh và nguồn tư liệu. Danh sách và tải MP3 theo ngôn ngữ đang chọn; có thể nghe thử audio đã nhập. Bản dịch đang nhập dở được giữ trong biểu mẫu và không gửi như bản hợp lệ; sửa nội dung Việt làm checksum bản dịch cũ mất hiệu lực đến khi Admin cập nhật bản dịch. Tên tour hiện dùng chung giữa các ngôn ngữ. Build/typecheck và 61 frontend test đạt; backend 181 test đạt, 16 integration test bỏ qua theo mặc định. Xem [nhật ký Admin đa ngôn ngữ](test-reports/ADMIN_MULTILINGUAL_CONTENT_2026_10_24.md).

Trạng thái ghi nhận ngày 24/10/2026: khách không đăng nhập; Admin quản lý nội dung/audio và dashboard; Stadia, 10 marker, GPS opt-in/mô phỏng/geofence đã có. Người dùng đã thử GPS trên điện thoại, kiểm chứng tọa độ thực địa và xác nhận chạm điểm phát audio được. Tự phát theo geofence trên iPhone/Safari và ngưỡng thực tế còn chờ nghiệm thu. Dashboard có bộ lọc ngày ICT, tổng visit/journey/audio và lượt phát audio theo địa điểm từ sự kiện thật; người dùng xác nhận bản deploy hoạt động sau sửa lỗi aggregate async. Mô phỏng không ghi thống kê thật. Đợt hồi quy đa ngôn ngữ gần nhất: frontend 61 test; backend 181 test, 16 integration skip mặc định; Ruff/typecheck/build đạt. E2E 12/12 desktop/mobile là kết quả hồi quy trước đó. Tại thời điểm đó Render báo service “Suspended by you” và code workspace mới chưa deploy; cập nhật hiện hành về readiness/CI/CD xem phần 26/10 đầu tài liệu. Xem [nhật ký dashboard](test-reports/ADMIN_DASHBOARD_PROGRESS_2026_10_24.md), [OSM/GPS](test-reports/MAP_OSM_PROGRESS_2026_10_24.md), [đa ngôn ngữ](test-reports/MULTILINGUAL_UI_PROGRESS_2026_10_24.md), [Admin/audio](test-reports/DEMO_CONTENT_AUDIO_ADMIN.md) và [khách](test-reports/DEMO_GUEST_PROGRESS_2026_10_23.md).

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
| Auth/RBAC dài hạn |Đăng ký không tự chọn quyền; User không xem nháp; CSRF, hết hạn/thu hồi phiên.|
| Công bố | Từ chối/gửi lại; sửa nháp giữ nguyên release; bản dịch/audio đúng phiên bản; asset nháp không tải trái phép |
| GPS | Sai số, mẫu cũ, ranh giới vùng, vùng chồng nhau, từ chối quyền, ẩn/hiện trang |
| Audio | Một nguồn phát; không phát lặp; đổi ngôn ngữ; từng tầng fallback; thiếu giọng cục bộ; autoplay bị chặn |
| Jobs | Yêu cầu trùng, giới hạn đồng thời, provider lỗi, retry hữu hạn, restart và kết quả lỗi thời |
| Đăng xuất | Thu hồi phiên và kiểm tra hành vi nhiều tab |
| Dashboard | Bắt đầu tour/nghe hoàn tất đúng, sự kiện gửi lại không nhân đôi, loại mô phỏng khỏi dữ liệu thật |
| Triển khai | Secrets không vào frontend; HTTPS; restart không mất asset; phục hồi bản chạy trên máy |

Thiết bị chính: Chrome Android và Chrome/Edge máy tính.
Safari iPhone kiểm tra bổ sung, báo rõ kết quả; không tuyên bố hỗ trợ khi chưa thử.

## Kịch bản kế hoạch dài hạn

2. Admin duyệt; User chỉ thấy bản đã công bố.
3. User bắt đầu tour, bật mô phỏng và đi qua các điểm; không cần cấp GPS trong chế độ này.
4. Chuyển Việt/Anh, nghe lại thủ công, kiểm tra hàng đợi.
5. Kiểm tra dashboard không trộn dữ liệu mô phỏng và sự kiện gửi lại không nhân đôi.

GPS mô phỏng không thay thế khảo sát thực địa. Chuẩn bị bản local và tài nguyên từ trước,
không phụ thuộc dịch/TTS/Gemini trực tiếp trong buổi trình bày.

## Ghi nhận kết quả

Mỗi lần nghiệm thu lưu commit, trình duyệt/thiết bị, dữ liệu sử dụng, bước thực hiện,
kết quả thực tế và lỗi còn lại. Chưa có báo cáo nghiệm thu nghiệp vụ ở thời điểm tạo khung.
