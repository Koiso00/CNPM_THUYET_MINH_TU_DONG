# Backend

Python 3.12, FastAPI và cấu hình PyMongo cho các bước tiếp theo.
Hiện chỉ `GET /api/v1/health` có triển khai. Các router nghiệp vụ đều rỗng.

Từ thư mục backend:

```powershell
uv sync --locked
uv run --frozen uvicorn app.main:app --reload
```

Tùy chọn tạo .env từ [.env.example](.env.example) nếu chưa có file riêng.
Health và OpenAPI không yêu cầu MongoDB. Khai báo MONGODB_URI không tự tạo kết nối.
Settings hiện chỉ đọc APP_NAME, ENVIRONMENT và FRONTEND_DIST; các biến khác được giữ
để bổ sung đúng lúc triển khai, chưa có tác dụng.

Kiểm tra khung:
```powershell
uv run --frozen ruff check app
uv run --frozen ruff format --check app
uv run --frozen python -m compileall -q app
```

Thư mục tests chưa có test nghiệp vụ. Không coi lệnh pytest trống là một bộ test đã đạt.
Xem [kiến trúc](../docs/ARCHITECTURE.md) và [API](../docs/DATA_AND_API.md).
