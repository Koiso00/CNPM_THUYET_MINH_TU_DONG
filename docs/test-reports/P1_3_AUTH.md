# P1.3 — API xác thực, JWT cookie, CSRF và dependency RBAC

Ngày kiểm tra: 21/10/2026. Windows, Python 3.12.10, FastAPI/PyMongo Async, Atlas phát triển.

## Quyết định đã chốt

- Mật khẩu 15–128 ký tự, Unicode/dấu cách được phép, không bắt buộc trộn nhóm ký tự.
- Username không phân biệt hoa/thường; access 15 phút, phiên tối đa 7 ngày tuyệt đối.

## Đã thực hiện

- API csrf/register/login/me/refresh/logout/logout-all, public schemas không có hash/token rõ.
- Argon2id (pwdlib), công việc băm chạy threadpool; PyJWT HS256 kiểm tra issuer/audience/type/ID/thời hạn.
- Access/refresh cookie HttpOnly, SameSite=Lax, host-only, path /api/v1; Secure ở production.
- Refresh token 256 bit ngẫu nhiên, database chỉ giữ SHA-256 digest, rotation nguyên tử không đổi expiry.
- CSRF signed double-submit gắn session ID, kiểm tra Origin allowlist và Sec-Fetch-Site.
- Kiểm tra phiên/user hoạt động mỗi request; role lấy database; dependency require_roles dùng lại cho router sau.
- Phản hồi API no-store; validation bỏ input, lỗi driver trả 503 đã lọc bí mật.
- Cấu hình JWT_SECRET/allowed origins; đã tạo khóa ngẫu nhiên trong .env riêng khi trường còn trống.

## Kiểm thử thực tế

| Lệnh từ backend | Kết quả |
| --- | --- |
| `uv run --frozen pytest -q --tb=short` | 124 passed, 14 skipped (4.05s), không dùng Atlas |
| `uv run --frozen pytest tests/integration -q --tb=short --run-mongodb-integration --run-mongodb-write-integration` | 14 passed (23.08s), Atlas thật |
| `uv run --frozen pytest tests/integration/test_auth_flow.py -q --tb=short --run-mongodb-write-integration` | 2 passed (6.16s), sau khi bổ sung kiểm tra wiring dependency thật |
| Ruff check/format | Đạt |

Test gồm các biên độ dài mật khẩu, Unicode/dấu cách, từ chối field tự cấp quyền,
username trùng/hoa thường, sai/missing/inactive account cùng lỗi 401, JWT sai chữ ký/claims/hết hạn,
CSRF thiếu/sai/hết hạn/khác phiên/origin, cờ cookie production, refresh sau 15 phút,
chặn sau 7 ngày, chặn token refresh cũ, logout một/tất cả phiên, đổi role từ database có tác dụng.

Integration mới thử HTTP từ register đến logout qua dependency/repository thật và kiểm tra
hai service refresh đồng thời chỉ một thắng. Mọi dữ liệu tài khoản thử nằm trong collection tạm,
cleanup xác minh xóa đúng collection; không tạo user/admin thật trong database ứng dụng.

## Lỗi phát hiện và đã sửa

- Ba test ban đầu tìm chuỗi `input` trong toàn bộ JSON, nên nhầm thông báo “Extra inputs are not permitted”
  với field chứa dữ liệu đầu vào. Sửa test kiểm tra key input thực tế; không có mật khẩu bị echo.
- Ruff phát hiện import/định dạng/dòng dài; đã sửa và kiểm tra lại đạt.
- Không còn lỗi được phát hiện trong phạm vi test đã chạy.

## Giới hạn và phần tiếp theo

Chưa có UI/gia hạn tự động trong trình duyệt, tài khoản Admin khởi tạo, API admin/nội dung/audio/dashboard.
Không tuyên bố đã kiểm thử thao tác phân quyền trên dữ liệu tour chưa tồn tại.
Chưa có giới hạn tần suất login/register, khôi phục mật khẩu, đổi mật khẩu hoặc triển khai public HTTPS;
P1.3 là nền tảng demo phát triển, chưa nghiệm thu bảo mật triển khai công khai.
Rotation từ chối refresh cũ, chưa có cơ chế thu hồi toàn bộ token family khi phát hiện replay.
Frontend cần điều phối refresh và xử lý CSRF thay đổi giữa tab; P1.4 sẽ kiểm thử luồng này.
Không chạy lại frontend vì chưa thay frontend trong P1.3. Docker/triển khai cloud chưa kiểm tra.

## Đối chiếu kế hoạch

P1.3 đáp ứng tiêu chí lớp API và dữ liệu, không thay chính sách đã chốt.
Trong lúc làm, người dùng chuyển ưu tiên sang [demo 2 ngày](../DEMO_2_DAYS.md):
đăng nhập/audio/admin/dashboard trước; GPS/offline/AI/dịch tự động tạm hoãn theo yêu cầu mới.
Kế hoạch gốc được giữ nguyên để phát triển tiếp sau demo.
