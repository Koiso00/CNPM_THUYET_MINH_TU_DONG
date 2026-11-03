# Backend tests

Sau tách trang Quản trị: 152 test cục bộ đạt (15 Atlas skipped ở lệnh mặc định).
Test mới `unit/test_browser_server.py` kiểm tra route dừng server test khi phục vụ frontend build;
không mở Atlas trong test này. Chi tiết ở [báo cáo tách trang](../../docs/test-reports/MANAGEMENT_PAGE.md).

Cập nhật 22/10: 151 test cục bộ và 15 test Atlas đạt. Có test demo nội dung/snapshot,
GridFS Range, quản lý user và dashboard tại `integration/test_demo_content.py`.
Fixture GridFS kiểm tra byte lưu trữ; kiểm tra MP3 phát thật nằm trong Edge E2E.
Các số lượng ở mốc P1.1–P1.4 bên dưới là lịch sử. Báo cáo hiện hành:
[demo nội dung/audio/quản trị](../../docs/test-reports/DEMO_CONTENT_AUDIO_ADMIN.md).

P1.1 có test cấu hình, vòng đời pool, xử lý timeout/lỗi, che thông tin nhạy cảm
và hợp đồng liveness/readiness. P1.3 bổ sung test HTTP đăng ký/đăng nhập/refresh/logout,
JWT/CSRF và ma trận dependency RBAC. Route probe quyền chỉ được thêm trong test app.

## Test cục bộ

Tại backend:

```powershell
uv run --frozen pytest -q --tb=short
```

settings_factory không đọc .env và loại các biến môi trường liên quan.
Các lỗi kết nối được điều khiển bằng test double. Hai test kiểm tra khởi tạo/parser
của driver thật nhưng không mở kết nối mạng.
Test API dùng application factory với settings riêng, không import entrypoint môi trường thật.

14 integration test bị skipped có chủ đích trong lượt chạy mặc định.
P1.2 có thêm test User/session: chuẩn hóa username, bí mật không có trong dump/repr,
UTC/BSON, thời hạn tuyệt đối 7 ngày và chặn ID/thời gian không hợp lệ trước truy vấn.

## Test MongoDB thật

```powershell
uv run --frozen pytest tests/integration -q --tb=short --run-mongodb-integration
```

Test đọc backend/.env, chỉ ping, không tạo/xóa dữ liệu.
Thiếu cấu hình hoặc kết nối thất bại thì test fail bằng thông điệp cố định;
không in URI/password hoặc Settings qua assertion introspection.
Không dùng --showlocals khi kiểm tra môi trường chứa credentials.

Ngày 21/10/2026: 34 test cục bộ đạt và một test ping Atlas thật đạt.
Chi tiết lỗi đã sửa, phạm vi và giới hạn ở [báo cáo P1.1](../../docs/test-reports/P1_1_MONGODB.md).
Tiêu chí các phần tiếp theo ở [TEST_AND_DEMO](../../docs/TEST_AND_DEMO.md).

## Test ghi MongoDB biệt lập P1.2

```powershell
uv run --frozen pytest tests/integration -q --tb=short --run-mongodb-integration --run-mongodb-write-integration
```

Cờ ghi riêng bật các test User/session/auth/content trên collection biệt lập, không được bật bởi cờ ping.
Mỗi test tạo collection tên ngẫu nhiên `__test_p12_users_...` hoặc `__test_p12_sessions_...`,
chỉ xóa chính collection nó vừa tạo và xác minh đã xóa trong finally.
Không ghi vào users/sessions ứng dụng, không duyệt prefix để xóa hàng loạt.
Chạy trên database phát triển với quyền create/index/read/write/drop collection tạm.
Test TTL kiểm tra cấu hình index và chặn phiên hết hạn bằng truy vấn; không đợi MongoDB dọn TTL.
quyền sở hữu, CAS khi gửi duyệt và chuyển trạng thái áp dụng; collection được xóa và xác minh.

Kết quả P1.2: 69 test cục bộ và 12 test Atlas đạt.
Xem [báo cáo P1.2](../../docs/test-reports/P1_2_USER_SESSIONS.md).

P1.3: 124 test cục bộ và 14 test Atlas đạt. Hai test mới chạy HTTP với wiring repository thật
và kiểm tra hai service refresh đồng thời trên Atlas; vẫn chỉ ghi collection tạm.
Chi tiết [báo cáo P1.3](../../docs/test-reports/P1_3_AUTH.md).

P1.4 có server biệt lập `uv run --frozen python -m tests.serve_auth_browser`
cho Playwright/Edge, chỉ loopback và chỉ collection Atlas tạm. Xem cách chạy/dọn
tại [frontend tests](../../frontend/tests/README.md); không triển khai module test này lên production.
