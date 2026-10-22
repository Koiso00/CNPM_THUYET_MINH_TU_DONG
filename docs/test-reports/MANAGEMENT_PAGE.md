# Tách Nội dung và hoàn thiện Quản trị — 22/10/2026

## Phạm vi người dùng đã chốt

Nội dung giữ địa điểm, bài thuyết minh và audio. Quản trị có dashboard và quản lý
tài khoản dành cho Admin. Luồng Creator vẫn riêng theo kế hoạch, chưa triển khai soạn/gửi duyệt.

## Thay đổi

- `#/admin`: `features/content/ContentPage.tsx`, chỉ tải/lưu nội dung và audio;
  không gọi API dashboard/users khi mở trang hoặc sau thao tác nội dung.
- `#/management`: `features/admin/ManagementPage.tsx`, dashboard có sáu số đếm thật,
  làm mới số liệu, danh sách tài khoản 20 dòng/trang, đổi role, khóa/mở khóa và lưu từng user.
- Dashboard phân biệt tải/lỗi/dữ liệu cũ, không thay lỗi bằng số 0; khi giữ số liệu cũ
  sau lỗi làm mới có ghi rõ. Lưu user thành công kích hoạt tải lại dashboard.
- Danh sách tài khoản phân biệt lỗi và rỗng, thử lại được. Lưu thất bại giữ form;
  vô hiệu hóa lưu trùng, bảo vệ Admin/current user theo dữ liệu quyền và chỉ cho lưu khi đổi.
  Chưa lưu thì không chuyển trang danh sách; tải lại có xác nhận bỏ thay đổi.
- Khám phá có liên kết rõ Nội dung và Quản trị cho Admin. Hai trang dùng chung nav/icon.
  `#/creator` dành riêng cho Creator; Admin dùng đường dẫn cũ được chuyển sang Quản trị.
  User/Creator không được gọi các API Admin qua trang Quản trị; backend RBAC vẫn bắt buộc.
- Khu vực Creator chỉ mô tả trạng thái chưa triển khai, không còn thẻ quản lý user dễ gây nhầm.
- Không thay backend nghiệp vụ, schema dữ liệu, policy phiên hoặc tài khoản ứng dụng.

## Kiểm tra

- Frontend: **36 passed**. Bao gồm hồi quy nội dung/audio/auth, tách API giữa hai trang,
  role guard của trang Quản trị, dashboard lỗi/thử lại, user load lỗi/thử lại,
  phân trang, giữ thay đổi khi lưu lỗi, payload role/trạng thái và Admin được bảo vệ.
- `npm run build`: TypeScript/Vite đạt, 39 modules; app ở cổng 8000 phục vụ build mới.
- Edge headless + FastAPI/Atlas/GridFS thật ở server riêng cổng 8001: **8 passed**,
  bốn kịch bản × desktop 1366×900 và mobile viewport 390×844. Có đổi role/khóa tài khoản
  dùng riêng cho test rồi đối chiếu database qua API, bảo vệ Admin, chặn Creator vào Quản trị,
  chuyển trang, upload/công bố/phát MP3, nhiều tab và lỗi mạng auth.
- Không tràn ngang ở cả hai kích thước. Đã xem ảnh Quản trị desktop/mobile:
  `frontend/test-results/demo-manages-a-disposable--0d545-om-the-separate-system-page-*/management.png`
  (giữ cục bộ, gitignored; tài khoản trong ảnh chỉ là dữ liệu test).
- Backend cục bộ: **152 passed, 15 skipped**, có thêm regression test route dừng server
  kiểm thử khi dùng static frontend build. Ruff check/format cho file Python thay đổi đạt.
- `git diff --check`: đạt, chỉ có cảnh báo LF/CRLF Windows.

## Lỗi tìm thấy và xử lý

- Sau khi tách nhánh Admin, TypeScript phát hiện so sánh role Admin không thể tới trong
  khung Creator cũ. Đã tách CreatorPage và bỏ các nhánh giữ chỗ thừa.
- Khi server test phục vụ frontend build trực tiếp, static mount `/` che route
  `/_test/shutdown`, trả 405. Đã đặt route test trước static mount; thêm test HTTP
  chứng minh GET frontend 200 và POST shutdown 202 mà không mở kết nối Atlas.
- Lần server test trước khi sửa phải dừng từ tiến trình điều khiển. Đã đối chiếu chính xác
  tám collection còn lại với các tài khoản kiểm thử của lượt này, liên kết session/tour/release/
  asset/GridFS, rồi xóa đúng tám tên đã xác minh và kiểm tra lại; không xóa hàng loạt theo prefix.
  Sau sửa đã khởi động lại một server biệt lập, xác nhận frontend 200, shutdown 202 và
  thông báo dọn collection thành công. Bản ứng dụng cổng 8000 không bị dừng hoặc đổi dữ liệu.

## Giới hạn

Chưa có workflow Creator, audit/event analytics, tìm kiếm tài khoản, xóa tài khoản,
GPS/offline/AI/dịch tự động hoặc kiểm thử điện thoại vật lý/cloud. Giữ quy tắc bảo vệ
Admin đang hoạt động; không mở hạ quyền/khóa các tài khoản này trên web.
Chưa chạy lại toàn bộ 15 integration test riêng vì backend nghiệp vụ không đổi;
8 E2E ở trên đã chạy API/Atlas/GridFS thật qua collection/bucket biệt lập.

Không tính số liệu mô phỏng thành dữ liệu thật và không công bố nội dung ứng dụng trong kiểm thử.
Phần hoàn thiện này nằm trong phạm vi demo 2 ngày, chưa hoàn tất dashboard/audit của kế hoạch dài hạn.
