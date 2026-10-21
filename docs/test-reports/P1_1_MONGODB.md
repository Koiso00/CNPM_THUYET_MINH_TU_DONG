# P1.1 — Cấu hình, vòng đời kết nối và readiness MongoDB

Ngày kiểm tra: 21/10/2026. Trạng thái: **P1.1 hoàn tất trong phạm vi kết nối/readiness**.
Đã đạt 34 test cục bộ và một test ping Atlas thật; không còn test bắt buộc đang chờ ở P1.1.

## Phạm vi đã thực hiện

- Đọc URI từ backend/.env bằng SecretStr; không đưa URI vào dump/repr cấu hình.
- Một AsyncMongoClient theo lifespan, đóng pool khi dừng ứng dụng.
- Tách liveness và readiness; lỗi/mất cấu hình database không làm liveness báo tiến trình đã dừng.
- Readiness có timeout và không trả thông tin kết nối hoặc lỗi driver.
- Test mặc định không truy cập Atlas; integration chỉ chạy khi có cờ rõ ràng.
- Tách application factory khỏi entrypoint để cấu hình triển khai không cản test cô lập.

## Kết quả và lỗi đã xử lý

| Lượt kiểm tra | Kết quả | Xử lý |
| --- | --- | --- |
| Khởi chạy bộ test với .env vừa cấu hình | Không thu thập được test vì FRONTEND_DIST không phải thư mục build | Tách app/application.py khỏi entrypoint app/main.py; thêm test hồi quy |
| Chạy lại toàn bộ với integration | 31 test đạt; integration thất bại trước ping vì MONGODB_URI trống | Xác định URI dán nhầm vào FRONTEND_DIST; chuyển sang đúng trường, không thay giá trị mật khẩu |
| Kiểm soát đầu ra nhạy cảm | Assertion của test đã hiển thị cấu hình có URI đặt nhầm trường | Loại frontend path khỏi repr; từ chối URI trong trường đường dẫn; dùng lỗi integration có thông điệp cố định |
| Kiểm tra lại cục bộ | 34 passed, 1 skipped | Skipped là test Atlas thật; không coi là đạt integration |
| Lint và định dạng | Đạt | Đã sửa thứ tự import và một dòng vượt độ dài |
| Kiểm tra whitespace | Đạt | Cảnh báo chuyển đổi CRLF/LF của Git không phải lỗi test |
| Người dùng cập nhật mật khẩu và URI | Đã xác nhận cập nhật | Không hiển thị hoặc ghi mật khẩu mới vào báo cáo |
| Test ping Atlas thật sau cập nhật | 1 passed in 2.36s | Chỉ ping, không tạo/xóa dữ liệu |

Thông tin kết nối đã xuất hiện trong đầu ra lỗi trước khi bổ sung chặn.
Người dùng đã xác nhận đổi mật khẩu Database User và cập nhật URI cục bộ.
Không sao chép thông tin đó vào báo cáo hoặc mã nguồn; không tiếp tục thử bằng mật khẩu cũ.

## Lệnh và phạm vi xác minh

Tại backend:

```powershell
uv run --frozen pytest -q --tb=short
uv run --frozen ruff check app tests
uv run --frozen ruff format --check app tests
```

Unit test kiểm tra cấu hình, che thông tin nhạy cảm, cleanup, timeout, phục hồi,
HTTP status, cache headers, phục vụ frontend cùng API và tương thích khởi tạo driver thực.
Các lỗi mạng/xác thực trong unit test được mô phỏng, không phải kiểm chứng Atlas thật.

## Kiểm chứng Atlas thật

Đã chạy bằng cấu hình được người dùng cập nhật:

`uv run --frozen pytest tests/integration -q --tb=short --run-mongodb-integration`.

Kết quả: **1 passed in 2.36s**, không skipped. Kết hợp lượt test cục bộ:
**34 unit/API tests đạt + 1 Atlas integration test đạt**.

Ping không tạo/xóa collection và không xác nhận quyền ghi/index/GridFS.
Các phần này thuộc bước triển khai tiếp theo.

## Đối chiếu kế hoạch

Giữ nguyên MongoDB/PyMongo Async và ba vai trò của kế hoạch gốc.
Readiness và tách factory là phần kỹ thuật hỗ trợ nền tảng, không thay đổi nghiệp vụ.
Chưa triển khai auth/RBAC, collection/index, bản đồ, audio hoặc offline.
P1.1 được đóng sau khi có bằng chứng ping thật, không chỉ dựa trên test cục bộ.
