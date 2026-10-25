> **Ảnh chụp trạng thái 24/10/2026 — lịch sử:** khách không cần đăng nhập; Admin quản lý nội dung/audio tại `#/admin` và dashboard/tài khoản tại `#/management`. Stadia Maps, 10 tọa độ đã kiểm chứng thực địa, GPS opt-in/mô phỏng/geofence frontend và phát audio khi chạm điểm đã được người dùng thử. iPhone/Safari vẫn có thể chặn tự phát theo geofence; nghiệm thu ngưỡng GPS/geofence được để sau. Dashboard thống kê đã hoạt động trên bản deploy theo xác nhận người dùng. QR là bước phát triển kế tiếp sau dashboard và đa ngôn ngữ.

> **Đa ngôn ngữ — 24/10/2026:** giao diện khách VI/EN/KO; lựa chọn ngôn ngữ được giữ qua các trang. Admin biên tập POI/audio theo ngôn ngữ. Người dùng đã duyệt 10 bản dịch POI English và 10 MP3 English; Atlas có release song ngữ `09d43a32-43d1-4f2b-85d0-cdae2ad29981`, audio Việt được giữ nguyên. Nội dung/audio POI tiếng Hàn chưa có. Frontend 61 test, backend 181 test (16 integration skip mặc định), typecheck/build/Ruff đạt theo đợt hồi quy tương ứng. Render báo `sgu-campus-guide-demo` “Suspended by you”; code mới trong workspace chưa được deploy lên Render.

> **Atlas ứng dụng — 24/10/2026:** `phong` là Admin active; không còn tài khoản User/Creator legacy. Giữ nguyên tour, release và audio.

> **Cập nhật workspace 25/10/2026:** QR PNG/SVG cho địa điểm đã công bố, quét camera trong hành trình và thống kê QR theo điểm đã được triển khai trong code. Chưa kiểm thử camera trên điện thoại thật hoặc deploy; không ghi thành trạng thái nghiệm thu.

# Hướng dẫn cho AI và người đóng góp

## Đọc trước khi làm việc

1. Đọc [README](README.md), [bối cảnh](docs/PROJECT_CONTEXT.md) và [kiến trúc](docs/ARCHITECTURE.md).
2. Tra [kế hoạch gốc](docs/PROJECT_PLAN.md) để xác định phạm vi dài hạn.
3. Đọc thêm tài liệu dữ liệu/API, runtime, nội dung hoặc kiểm thử liên quan trực tiếp đến nhiệm vụ.

## Nguồn quyết định và ưu tiên

- Kế hoạch gốc 10 tuần và ba vai trò User / Creator / Admin vẫn là hướng dài hạn. Demo hiện tại gộp Creator vào Admin; xem [kế hoạch demo khách/QR](docs/DEMO_GUEST_QR_PLAN.md).
- Dashboard Admin đã hoàn thiện phần thống kê nền và người dùng đã xác nhận bản deploy hoạt động. Nội dung POI English và audio English cho 10 điểm đã được duyệt/công bố. QR đã có code trong workspace; nghiệm thu camera và triển khai còn chờ.
- Nghiệm thu GPS tự nhận diện, tự phát theo geofence và hiệu chỉnh ngưỡng thực địa được để sau; hoàn tất trước khi nghiệm thu demo chính thức. Offline và AI chưa triển khai.
- Offline dài hạn đã chốt theo ngôn ngữ tự chọn, tải thêm ngôn ngữ sau và dùng chung bản đồ/ảnh; offline tiếp tục hoãn trong demo hiện tại.
- Yêu cầu mới trực tiếp từ người dùng có thể thay đổi phạm vi. Cập nhật bối cảnh và tài liệu liên quan; không ghi đề xuất thành quyết định đã chốt.

## Quy tắc triển khai

- Backend: router xử lý HTTP, service xử lý nghiệp vụ, repository truy cập MongoDB/GridFS.
- Frontend chia theo feature; chỉ đưa thành phần dùng chung thực tế vào `shared`.
- JWT nằm trong HttpOnly cookie; không lưu token/CSRF trong localStorage. Giữ CSRF và RBAC ở backend.
- Không để người nghe lấy bản nháp hoặc asset chưa được phép; không sửa trực tiếp snapshot đã công bố.
- GPS thật và mô phỏng dùng chung luồng geofence/audio; số liệu mô phỏng không tính vào thống kê thật.
- Không bịa lịch sử, tọa độ, bản dịch đã duyệt hoặc kết quả kiểm thử. Gắn nhãn dữ liệu mô phỏng.
- Không commit secrets, dữ liệu tài khoản, MP3 hoặc PMTiles lớn. Dùng biến môi trường và GridFS khi triển khai.
- Không cài thư viện cho tính năng chưa thực hiện chỉ để làm đầy danh sách công nghệ.

## Trạng thái demo và kiểm thử

- `#/welcome`: khách chọn ngôn ngữ và bắt đầu hành trình; `#/explore`: bản đồ, nội dung và audio công khai.
- `#/admin`: Admin biên tập địa điểm, nội dung và audio theo ngôn ngữ, lưu nháp/công bố.
- `#/management`: dashboard theo ngày ICT và quản lý tài khoản. Creator UI/API và quy trình gửi/duyệt đã gỡ khỏi demo.
- Admin tải PNG/SVG QR của địa điểm trong release đang công bố; khách mở QR ngoài trước khi bắt đầu hoặc quét QR trong `#/explore`. Dashboard có tổng lượt quét và phân rã theo địa điểm. Chưa kiểm thử camera thiết bị thật.
- Bản đồ Stadia, GPS opt-in/mô phỏng/geofence đã tích hợp. Tọa độ 10 điểm đã kiểm chứng thực địa; chạm điểm và phát audio thủ công đã hoạt động trên điện thoại. Safari tự phát khi vào vùng và ngưỡng 30/45 m chưa nghiệm thu.
- Nội dung English và audio English đã công bố cùng tiếng Việt. Giao diện tiếng Hàn có; nội dung/audio tiếng Hàn chưa có.
- Theo dõi phần việc tại [WORK_BREAKDOWN](docs/WORK_BREAKDOWN.md), chọn kiểm tra phù hợp theo [TEST_AND_DEMO](docs/TEST_AND_DEMO.md), ghi kết quả mới tại `docs/test-reports/`.
- Báo rõ kiểm tra nào đã chạy/chưa chạy và giới hạn. Test double không chứng minh Atlas thật đã hoạt động. Không đưa nội dung `.env` vào chat/log.

## Tài liệu chính

- [PROJECT_CONTEXT](docs/PROJECT_CONTEXT.md): yêu cầu và trạng thái hiện hành.
- [ARCHITECTURE](docs/ARCHITECTURE.md): thành phần và ranh giới trách nhiệm.
- [DATA_AND_API](docs/DATA_AND_API.md): dữ liệu và hợp đồng API.
- [TOUR_RUNTIME](docs/TOUR_RUNTIME.md): GPS, audio và kế hoạch offline.
- [WORK_BREAKDOWN](docs/WORK_BREAKDOWN.md): đầu việc và trạng thái kiểm thử.
- [TEST_AND_DEMO](docs/TEST_AND_DEMO.md): ma trận nghiệm thu.
