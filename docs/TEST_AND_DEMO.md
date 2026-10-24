> **Trạng thái demo 23/10/2026:** khách không đăng nhập; welcome, ID khách/hành trình, nội dung/audio công khai, Admin và thống kê visit/journey/audio đã triển khai. QR vẫn hoãn. Chi tiết tại [kế hoạch khách/QR](DEMO_GUEST_QR_PLAN.md) và [báo cáo tiến độ](test-reports/DEMO_GUEST_PROGRESS_2026_10_23.md).

# Kiểm thử và demo

Trạng thái 24/10/2026: khách không đăng nhập; Admin quản lý nội dung/audio và dashboard; Stadia, 10 marker, GPS opt-in/mô phỏng/geofence đã có. Người dùng đã thử GPS/điện thoại, kiểm chứng tọa độ và xác nhận chạm điểm phát audio được. Nghiệm thu GPS tự nhận diện/tự phát và ngưỡng thực tế có thể để sau. Dashboard Admin hiện có bộ lọc ngày ICT, tổng visit/journey/audio và lượt phát audio theo địa điểm từ sự kiện thật. Đây là phần thống kê nền ưu tiên trước QR. Vị trí chỉ ở trình duyệt; mô phỏng không ghi thống kê thật. Frontend hiện 57 test đạt; build/typecheck đạt. Backend unit chạy được 166 test nhưng 7 test lỗi do quyền truy cập file/cấu hình trong môi trường; kiểm thử integration/Atlas chưa chạy. E2E hồi quy trước đó 12/12 desktop/mobile. Xem [báo cáo OSM/GPS](test-reports/MAP_OSM_PROGRESS_2026_10_24.md), [báo cáo Admin/audio](test-reports/DEMO_CONTENT_AUDIO_ADMIN.md) và [báo cáo khách](test-reports/DEMO_GUEST_PROGRESS_2026_10_23.md).

## Kiểm tra khung

Typecheck/build frontend; kiểm tra cú pháp và lint Python; smoke test health/OpenAPI.
Kiểm tra frontend build được phục vụ cùng nguồn FastAPI.
Những kiểm tra này không xác nhận chức năng nghiệp vụ, kết nối MongoDB hoặc Docker.

### Kết quả khung ngày 21/10/2026

- Đạt: TypeScript và production build với React 19.2.9, Vite 7.3.7, Node.js 24.19.0.
- Đạt: lint, kiểm tra định dạng và biên dịch Python 3.12.10.
- Đạt: smoke test health/OpenAPI bằng TestClient; router chưa triển khai trả 404.
- Đạt: FastAPI phục vụ frontend đã build và các tài nguyên JS/CSS cùng nguồn với API.
- Đạt: liên kết Markdown nội bộ; bản kế hoạch gốc trùng nội dung byte với file được chọn.
- Đạt: cấu trúc YAML của Compose đọc được. Chưa chạy Docker vì máy chưa có Docker.
- Chưa kiểm thử: MongoDB/GridFS, auth/RBAC, GPS, audio, PWA/offline, AI hoặc triển khai cloud.

Đây là kết quả kiểm tra nền tảng, không phải báo cáo nghiệm thu sản phẩm.

## Ma trận nghiệm thu mục tiêu

Cập nhật 22/10: xem [báo cáo demo nội dung/audio/quản trị](test-reports/DEMO_CONTENT_AUDIO_ADMIN.md)

Cập nhật 23/10: khách công khai, ID khách/hành trình và thống kê cơ bản đã có trong
[báo cáo demo khách](test-reports/DEMO_GUEST_PROGRESS_2026_10_23.md). QR/camera vẫn hoãn.
Các số lượng và giới hạn theo từng mốc cũ bên dưới là lịch sử kiểm thử.

Cập nhật UI 23/10: `#/welcome` luôn là trang chào độc lập; `#/explore` chỉ mở sau khi
khách bắt đầu. Explore không hiển thị Languages hoặc đăng nhập quản trị; Admin đã
đăng nhập vẫn có link `Admin` vào `#/management`. Đăng ký không còn trong UI và route
`#/register` chuyển về login. English/한국어 mới chỉ có menu trạng thái “Sắp có”.

Kết quả từng phần được cập nhật riêng: [P1.1 MongoDB](test-reports/P1_1_MONGODB.md).
P1.1 đã có 34 test cục bộ đạt và một integration test ping Atlas thật đạt.
P1.2: [User/session và index](test-reports/P1_2_USER_SESSIONS.md), 69 test cục bộ
và 12 test Atlas đạt; đã tạo index ứng dụng. Chưa nghiệm thu luồng đăng nhập HTTP.
P1.3: [API xác thực](test-reports/P1_3_AUTH.md), 124 test cục bộ và 14 test Atlas đạt.
Luồng HTTP đã kiểm thử. Demo ưu tiên mới theo [DEMO_2_DAYS](DEMO_2_DAYS.md).
P1.4: [UI auth và trạng thái phiên](test-reports/P1_4_AUTH_UI.md), 18 test frontend
và 4 test Edge/Atlas tạm đạt; desktop 1366×900, mobile viewport 390×844.
Chưa thử trên điện thoại vật lý; màn hình quản trị mới là khung, chưa có nghiệp vụ.
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
