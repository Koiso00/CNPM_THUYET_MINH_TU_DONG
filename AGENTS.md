> **Cập nhật người dùng 03/11/2026:** Ghi nhận GPS/geofence đã khảo sát theo yêu cầu người dùng; không có số liệu hay biên bản khảo sát mới kèm theo. Dashboard đã được người dùng kiểm thử thực tế và xác nhận đạt; Render đã triển khai thành công theo xác nhận người dùng. Bỏ qua nghiệm thu tự phát Safari, hàng đợi audio và Docker. Các ghi chú cũ yêu cầu các phần này chỉ là lịch sử.



> **Quyết định ngày 27/10/2026:** Người dùng loại chức năng offline khỏi toàn bộ phạm vi dự án và kế hoạch dài hạn. Các mô tả trước đây về offline chỉ có giá trị lịch sử.

> **Trạng thái hiện hành — 24/10/2026:** khách không cần đăng nhập; Admin quản lý nội dung/audio tại `#/admin` và dashboard/tài khoản tại `#/management`. Stadia Maps, 10 tọa độ đã kiểm chứng thực địa, GPS opt-in/mô phỏng/geofence frontend và phát audio khi chạm điểm đã được người dùng thử. Người dùng ghi nhận GPS/geofence đã khảo sát; nghiệm thu tự phát Safari được bỏ qua. Dashboard thống kê đã hoạt động trên bản deploy theo xác nhận người dùng.

> **Đa ngôn ngữ — 26/10/2026:** giao diện khách VI/EN/KO; lựa chọn ngôn ngữ được giữ qua các trang. Admin biên tập POI/audio theo ngôn ngữ. Người dùng duyệt 10 bản dịch và 10 MP3 tiếng Anh; Atlas có release song ngữ `09d43a32-43d1-4f2b-85d0-cdae2ad29981`. Ngày 26/10 đã duyệt và công bố thêm 10 bản dịch/audio Hàn trong release `2cebd7fb-7ca8-4719-819b-abb2a2191038`. Release hiện có audio vi/en/ko cho đủ 10 điểm. Ngày 26/10 readiness Render đạt ready/connected; chưa xác nhận commit hoặc UI/audio sau deploy.

> **Atlas ứng dụng — 24/10/2026:** `phong` là Admin active. Giữ nguyên tour, release và audio.

# Hướng dẫn cho AI và người đóng góp

> **Cập nhật 03/11/2026:** Hệ thống dùng một tài khoản Admin; trang Quản trị chỉ hiển thị dashboard, không có chức năng quản lý tài khoản/phân quyền. Giữ đăng nhập, CSRF và kiểm tra quyền Admin ở backend.

> **Cập nhật tọa độ 03/11/2026:** 10 tọa độ đã lưu theo ID địa điểm trong bản nháp và release Atlas `1e6c845d-f6f1-4cc3-bfb4-b8e140bcac28`. Bản đồ local đọc `location` từ release; không ghép tọa độ theo tên địa điểm. Xem `docs/test-reports/COORDINATE_MIGRATION_2026_11_03.md`.

> **Cập nhật 03/11/2026:** Admin chỉ chỉnh sửa nội dung/audio của các địa điểm hiện có; không thêm hoặc xóa địa điểm trong demo. Danh sách địa điểm hiện có được giữ nguyên khi lưu.

## Đọc trước khi làm việc

1. Đọc [README](README.md), [bối cảnh](docs/PROJECT_CONTEXT.md) và [kiến trúc](docs/ARCHITECTURE.md).
2. Tra [kế hoạch gốc](docs/PROJECT_PLAN.md) để xác định phạm vi dài hạn.
3. Đọc thêm tài liệu dữ liệu/API, runtime, nội dung hoặc kiểm thử liên quan trực tiếp đến nhiệm vụ.

## Nguồn quyết định và ưu tiên

- Admin trực tiếp biên tập, quản lý nội dung và công bố.

- Dashboard Admin đã hoàn thiện phần thống kê nền và người dùng đã xác nhận bản deploy hoạt động.
- GPS/geofence được ghi nhận đã khảo sát theo yêu cầu người dùng; bỏ qua nghiệm thu tự phát Safari, hàng đợi audio và Docker.
- Ngày 27/10/2026, người dùng loại offline khỏi phạm vi dự án và kế hoạch dài hạn; không triển khai gói ngoại tuyến.
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
- `#/management`: dashboard theo ngày ICT.
- Bản đồ Stadia, GPS opt-in/mô phỏng/geofence đã tích hợp. Tọa độ 10 điểm đã kiểm chứng thực địa; chạm điểm và phát audio thủ công đã hoạt động trên điện thoại. Người dùng ghi nhận GPS/geofence đã khảo sát và cho phép bỏ qua nghiệm thu tự phát Safari.
- Nội dung/audio tiếng Việt, English và Korean đã công bố cho đủ 10 POI trong Atlas release hiện hành.
- Theo dõi phần việc tại [WORK_BREAKDOWN](docs/WORK_BREAKDOWN.md), chọn kiểm tra phù hợp theo [TEST_AND_DEMO](docs/TEST_AND_DEMO.md), ghi kết quả mới tại `docs/test-reports/`.
- Báo rõ kiểm tra nào đã chạy/chưa chạy và giới hạn. Test double không chứng minh Atlas thật đã hoạt động. Không đưa nội dung `.env` vào chat/log.

## Tài liệu chính

- [PROJECT_CONTEXT](docs/PROJECT_CONTEXT.md): yêu cầu và trạng thái hiện hành.
- [ARCHITECTURE](docs/ARCHITECTURE.md): thành phần và ranh giới trách nhiệm.
- [DATA_AND_API](docs/DATA_AND_API.md): dữ liệu và hợp đồng API.
- [TOUR_RUNTIME](docs/TOUR_RUNTIME.md): GPS và audio.
- [WORK_BREAKDOWN](docs/WORK_BREAKDOWN.md): đầu việc và trạng thái kiểm thử.
- [TEST_AND_DEMO](docs/TEST_AND_DEMO.md): ma trận nghiệm thu.
