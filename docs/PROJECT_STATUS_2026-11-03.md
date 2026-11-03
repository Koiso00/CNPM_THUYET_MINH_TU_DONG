> **Cập nhật người dùng 03/11/2026:** Ghi nhận GPS/geofence đã khảo sát theo yêu cầu người dùng; không có số liệu hay biên bản khảo sát mới kèm theo. Dashboard đã được người dùng kiểm thử thực tế và xác nhận đạt; Render đã triển khai thành công theo xác nhận người dùng. Bỏ qua nghiệm thu tự phát Safari, hàng đợi audio và Docker. Các ghi chú cũ yêu cầu các phần này chỉ là lịch sử.

# Tiến độ hệ thống — 03/11/2026

**Cập nhật:** Demo chỉ dùng một tài khoản Admin. Đã gỡ giao diện và API quản lý tài khoản/phân quyền; vẫn giữ xác thực và kiểm tra quyền Admin.

**Cập nhật tọa độ:** Đã lưu 10 tọa độ theo ID điểm vào bản nháp Atlas và công bố release `1e6c845d-f6f1-4cc3-bfb4-b8e140bcac28`; giữ nguyên audio ba ngôn ngữ. Bản đồ trong workspace đọc tọa độ từ release, không phụ thuộc tên. Chi tiết tại [báo cáo](test-reports/COORDINATE_MIGRATION_2026_11_03.md).

Tài liệu tổng hợp bằng chứng đã ghi trong dự án đến ngày 03/11/2026. “Đã có” mô tả chức năng đã triển khai trong phạm vi demo; không đồng nghĩa mọi tình huống, thiết bị hoặc bản deploy mới nhất đã được nghiệm thu. Render đã triển khai thành công theo xác nhận người dùng; lượt kiểm tra cục bộ không truy cập Atlas hoặc Render.

## Những việc đã làm và chức năng đã có

| Khu vực | Công việc và chức năng |
| --- | --- |
| Nền tảng | Xây dựng frontend React/TypeScript, backend FastAPI, kết nối MongoDB Atlas; tách liveness và readiness. Dữ liệu và audio được lưu bằng MongoDB/GridFS. |
| Khách tham quan | Trang `#/welcome` cho khách bắt đầu hành trình không cần đăng nhập; ID khách được lưu trong trình duyệt, mỗi lần bắt đầu tạo hành trình mới. Trang `#/explore` hiển thị địa điểm, nội dung và audio đã công bố. |
| Đa ngôn ngữ | Giao diện khách hỗ trợ Việt, English, Korean và giữ lựa chọn qua các trang. Admin biên tập nội dung/audio theo ngôn ngữ. Người dùng đã duyệt và công bố nội dung/audio ba ngôn ngữ cho 10 điểm trong Atlas release `2cebd7fb-7ca8-4719-819b-abb2a2191038` ngày 26/10. |
| Bản đồ và vị trí | Tích hợp MapLibre/Stadia Maps, hiển thị 10 điểm; người dùng đã kiểm chứng tọa độ tại thực địa. GPS chỉ bật khi khách chủ động cho phép; GPS thật và mô phỏng đi qua luồng geofence chung. |
| Audio | Phát MP3 công bố từ GridFS, hỗ trợ Range; chọn/chạm địa điểm để nghe, chuyển điểm dùng cùng trình phát. Người dùng xác nhận thao tác chạm điểm phát audio hoạt động trên điện thoại. |
| Quản lý nội dung | Admin tại `#/admin` sửa nội dung các địa điểm hiện có theo ngôn ngữ, tải và nghe thử MP3, lưu nháp, công bố/gỡ công bố. Không thêm hoặc xóa địa điểm. Release là snapshot riêng, sửa nháp không trực tiếp sửa snapshot đã công bố. |
| Tài khoản và bảo mật | Có đăng nhập/đăng xuất, gia hạn phiên, JWT trong HttpOnly cookie, CSRF và kiểm tra quyền phía backend. Hệ thống dùng một tài khoản Admin, không có trang quản lý tài khoản. |
| Dashboard | Có thống kê nền theo ngày ICT: khách, hành trình, lượt bắt đầu phát audio và lượt phát theo địa điểm cùng các tổng dữ liệu hệ thống. Người dùng xác nhận dashboard hoạt động trên bản deploy sau sửa lỗi. Lượt phát do mô phỏng GPS được tách khỏi thống kê thực. |
| Nội dung thực tế | Đã nhập 10 mô tả nguồn do người dùng cung cấp, tạo và duyệt audio. Việc kiểm chứng tọa độ không đồng nghĩa toàn bộ nội dung lịch sử đã được nhà trường xác minh. |
| Kiểm thử và triển khai | Có test frontend/backend, test Atlas và E2E với dữ liệu biệt lập ở các mốc đã ghi; GitHub Actions kiểm tra frontend/backend. Run CI #3 trên `main`, commit `342d3e5`, đạt. Ngày 26/10 readiness Render được xác nhận `ready`, database `connected`. |

## Đã có một phần, còn kiểm tra hoặc hoàn thiện

Kết quả kiểm tra cục bộ ngày 03/11: backend 182 test đạt, 16 integration test bỏ qua; frontend build/typecheck đạt. Frontend test chưa hoàn tất; chưa xác minh độc lập thiết bị thật, Atlas hoặc Render trong lượt kiểm tra. Chi tiết theo từng mục tại [báo cáo kiểm tra](test-reports/PARTIAL_FEATURE_REVIEW_2026_11_03.md).

| Hạng mục | Việc còn lại hoặc giới hạn |
| --- | --- |
| GPS và geofence | Người dùng yêu cầu ghi nhận đã khảo sát; chưa có số liệu hoặc biên bản khảo sát mới trong hồ sơ. |
| Tự phát Safari | Được người dùng cho phép bỏ qua; không tuyên bố đã kiểm thử đạt. |
| Hàng đợi audio | Chưa triển khai; người dùng cho phép bỏ qua. |
| Thiếu bản dịch/audio | Mã hiện có fallback audio sang tiếng Việt khi thiếu ngôn ngữ được chọn và có fallback bản dịch English cục bộ. Điều này cần được đối chiếu với yêu cầu ngôn ngữ và quy tắc chỉ hiển thị nội dung công bố; chưa coi là đã xử lý xong. |
| Dashboard | Người dùng xác nhận đã kiểm thử thực tế và đạt; chưa có nhật ký chi tiết riêng cho từng chỉ số. |
| Deploy | Người dùng xác nhận đã triển khai thành công trên Render; chưa có thông tin commit hoặc cấu hình Auto-Deploy được xác nhận riêng. |
| Kiểm thử tổng thể | Tiếp tục ghi nhận kết quả kiểm thử theo thực tế; người dùng cho phép bỏ qua Docker và nghiệm thu tự phát Safari. |
| Tài liệu | Một số tài liệu cũ còn mô tả các trạng thái hoặc ưu tiên đã thay đổi; việc đồng bộ toàn bộ Markdown chưa hoàn tất. Đọc các báo cáo theo ngày như lịch sử, ưu tiên quyết định mới nhất của người dùng. |

## Chức năng dài hạn chưa hoàn thành


- Dịch tự động và TTS dưới dạng công việc nền bền vững; cơ chế retry, chống trùng và kiểm tra phiên bản nguồn.
- Các tầng dự phòng audio theo kế hoạch dài hạn, bao gồm tạo khi cần và giọng trình duyệt.
- AI hỗ trợ soạn bản nháp từ tư liệu được cung cấp.
- Audit log và các phần thống kê dài hạn còn thiếu; thống kê nghe hoàn tất khác với lượt bắt đầu phát hiện có.
- Mô hình dữ liệu Tour/POI/localization tách riêng đầy đủ theo thiết kế dài hạn và các điều kiện nghiệm thu sản phẩm còn lại.

## Đã loại khỏi phạm vi

- **Offline:** người dùng loại khỏi toàn bộ phạm vi dự án và kế hoạch dài hạn ngày 27/10/2026.

Không tự đặt thứ tự ưu tiên mới hoặc tỷ lệ phần trăm hoàn thành khi chưa có quyết định tương ứng.

## Bằng chứng kiểm thử đã ghi

- Đợt đa ngôn ngữ: 181 test backend đạt, 16 integration test bỏ qua theo mặc định; 61 test frontend, Ruff, typecheck và build đạt. Đây là kết quả lịch sử, không phải lượt chạy mới.
- E2E trước đó: 12/12 lượt desktop/mobile viewport đạt, sử dụng dữ liệu Atlas biệt lập. Không suy rộng thành kiểm thử iPhone/Safari.
- CI ngày 26/10: hai job frontend/backend đạt; không chạy integration có ghi Atlas trong CI.

Chi tiết và giới hạn: [bảng công việc](WORK_BREAKDOWN.md), [kiểm thử và demo](TEST_AND_DEMO.md), [báo cáo đa ngôn ngữ](test-reports/MULTILINGUAL_UI_PROGRESS_2026_10_24.md), [audio Hàn](test-reports/DEMO_AUDIO_KO_DRAFT_2026_10_26.md), [bản đồ/GPS](test-reports/MAP_OSM_PROGRESS_2026_10_24.md), [dashboard](test-reports/ADMIN_DASHBOARD_PROGRESS_2026_10_24.md), [CI/CD](test-reports/CI_CD_PROGRESS_2026_10_26.md) và [rà soát tài liệu](test-reports/DOCUMENTATION_AUDIT_2026_11_03.md).

Lượt tổng hợp này chỉ đọc tài liệu và kiểm tra mã liên quan; không chạy lại test, không truy cập Atlas/Render và không thay đổi mã hoặc dữ liệu ứng dụng.
