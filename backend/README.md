# Backend

Python 3.12, FastAPI và PyMongo Async. Phần P1.1 đã có vòng đời kết nối MongoDB,
liveness/readiness. P1.2 bổ sung model/repository User/session và index thật trên Atlas.
P1.3 đã có API auth, JWT cookie/CSRF và dependency RBAC. Demo hiện có API nội dung công bố, audio GridFS/Range, sự kiện khách, dashboard và API quản trị. Nội dung/audio tiếng Việt và English được gắn theo locale; Creator API đã gỡ khỏi demo. Kết quả hiện hành xem tại [báo cáo demo](../docs/test-reports/DEMO_CONTENT_AUDIO_ADMIN.md), [đa ngôn ngữ](../docs/test-reports/MULTILINGUAL_UI_PROGRESS_2026_10_24.md) và [dashboard](../docs/test-reports/ADMIN_DASHBOARD_PROGRESS_2026_10_24.md).

## Chạy

Từ thư mục backend:

```powershell
uv sync --locked
uv run --frozen uvicorn app.main:app --reload
```

Cấu hình theo [ATLAS_SETUP](../docs/ATLAS_SETUP.md), dùng [.env.example](.env.example)
làm mẫu. Không chia sẻ nội dung .env hoặc ghi credentials vào mã nguồn.

| Biến | Vai trò |
| --- | --- |
| APP_NAME / ENVIRONMENT | Tên dịch vụ và môi trường |
| FRONTEND_DIST | Thư mục chứa index.html đã build; để trống khi phát triển frontend bằng Vite |
| MONGODB_URI | URI Atlas/local; chỉ điền trong .env riêng |
| MONGODB_DATABASE | Database của ứng dụng, mặc định sgu_campus_guide |
| MONGODB_TIMEOUT_MS | Giới hạn thời gian kết nối/probe, mặc định 3000 ms |
| JWT_SECRET | Khóa ngẫu nhiên ít nhất 32 byte; chỉ ở .env riêng; thiếu khóa thì API auth trả 503 |
| AUTH_ALLOWED_ORIGINS | JSON array origin chính xác; mặc định localhost/127.0.0.1 cổng 5173/8000 |

DEMO/Gemini trong .env.example dành cho các phần sau, chưa có tác dụng.
URI không được đặt vào FRONTEND_DIST.
Máy phát triển hiện tại đã có khóa ký được tạo riêng trong .env; không sao chép khóa lên Git.
Production phải ENVIRONMENT=production, dùng HTTPS và đặt allowlist origin triển khai.

## Thử API đăng nhập

Xem hợp đồng và thứ tự CSRF/register/login/refresh/logout tại [DATA_AND_API](../docs/DATA_AND_API.md).
POST cần X-CSRF-Token và cookie tương ứng từ GET /api/v1/auth/csrf.
Swagger không tự thêm header này; chưa có giao diện đăng nhập ở P1.3.
Register chỉ nhận username/password và tạo User; mật khẩu 15–128 ký tự. Người nghe demo không dùng register/login.
Tài khoản Admin đầu tiên dùng `python -m app.commands.setup_admin phong`; lệnh không reset mật khẩu.

## Trạng thái dịch vụ

- GET /api/v1/health: liveness, HTTP 200 khi tiến trình phục vụ được.
- GET /api/v1/health/ready: ping MongoDB; HTTP 200 khi connected, HTTP 503 khi
  not_configured/unavailable. Không trả URI hoặc lỗi driver.
- Chưa điền URI vẫn chạy được liveness/OpenAPI. MongoDB không tự được tạo khi import.
- app/application.py chứa factory để test độc lập; app/main.py khởi tạo ứng dụng chạy thật.

P1.2 đã kiểm chứng quyền ghi và index bằng collection tạm; GridFS và usage events có test demo riêng.

## Khởi tạo index User/session

Sau khi cấu hình .env, chạy tường minh từ backend:

```powershell
uv run --frozen python -m app.commands.init_database
```

Lệnh tạo unique index username_key/refresh_token_hash, TTL expires_at, index user_id
và TTL cho presence khách. Có thể chạy lại; không tạo tài khoản, không xóa dữ liệu/index khi gặp xung đột.
Không tự thực hiện bước này lúc API startup. Trên Atlas phát triển hiện tại đã chạy thành công.

## Tạo lại audio demo

Lệnh trên tạo lại 10 MP3 tiếng Việt từ nguồn người dùng cung cấp, dùng Edge-TTS giọng nam vi-VN-NamMinhNeural. Xem [hướng dẫn dữ liệu](../data/README.md). Mười MP3 Việt, English và Korean đã được nhập GridFS và có trong release Atlas. Tạo file audio cục bộ không tự nhập GridFS hoặc công bố; nhập/công bố được thực hiện bằng lệnh chuyên biệt và kiểm tra checksum.

## Kiểm tra chất lượng

```powershell
uv run --frozen ruff check app tests
uv run --frozen ruff format --check app tests
uv run --frozen pytest -q --tb=short
```

Test mặc định không dùng Atlas. Integration chạy rõ ràng với cấu hình cục bộ:

```powershell
uv run --frozen pytest tests/integration -q --tb=short --run-mongodb-integration
```

Xem [test README](tests/README.md), [báo cáo P1.1](../docs/test-reports/P1_1_MONGODB.md)
và [báo cáo P1.2](../docs/test-reports/P1_2_USER_SESSIONS.md).
P1.3: [báo cáo auth](../docs/test-reports/P1_3_AUTH.md), 124 test cục bộ + 14 test Atlas đạt.
Kiểu dữ liệu và giới hạn hiện tại ở [dữ liệu/API](../docs/DATA_AND_API.md).
