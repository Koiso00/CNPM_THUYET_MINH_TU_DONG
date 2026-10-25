> **Ảnh chụp trạng thái 24/10/2026 — lịch sử:** Stadia Maps và GPS đã được thử trên điện thoại; 10 tọa độ được kiểm chứng thực địa, chạm địa điểm phát audio hoạt động. Tự phát khi geofence kích hoạt trên iPhone/Safari và ngưỡng GPS chưa nghiệm thu. Dashboard Admin có lọc ngày và lượt nghe theo địa điểm; người dùng xác nhận bản deploy hoạt động.
>
> Giao diện khách hỗ trợ VI/EN/KO. Nội dung POI và audio tiếng Việt/English cho 10 điểm đã được người dùng duyệt và có trong Atlas release song ngữ; nội dung/audio Hàn chưa có. Tại ngày 24/10, QR là bước kế tiếp sau dashboard và đa ngôn ngữ. Render báo `sgu-campus-guide-demo` “Suspended by you”, nên code mới trong workspace chưa được deploy lên Render. Xem [báo cáo đa ngôn ngữ](docs/test-reports/MULTILINGUAL_UI_PROGRESS_2026_10_24.md).

# Website thuyết minh cơ sở chính Đại học Sài Gòn

> **Cập nhật workspace 25/10/2026:** đã triển khai mã QR PNG/SVG cho điểm trong bản công bố, quét QR trong trang khám phá và ghi lượt quét theo hành trình/địa điểm lên dashboard. Code mới chưa được kiểm thử camera trên điện thoại thật hoặc deploy; Render vẫn đang tạm dừng.

Website React dành cho điện thoại và máy tính. Khách vào trang chào, bắt đầu hành trình không cần tài khoản, xem các điểm trên bản đồ và nghe nội dung đã công bố. Admin đăng nhập để biên tập nội dung/audio và xem dashboard/quản lý tài khoản.

## Trạng thái tính năng

| Khu vực | Hiện trạng |
| --- | --- |
| Giao diện khách | Welcome, khám phá, bản đồ và thông báo hỗ trợ Tiếng Việt, English, 한국어; lựa chọn ngôn ngữ được giữ xuyên các trang. |
| Nội dung/audio công khai | 10 POI tiếng Việt và English trong release Atlas; audio MP3/GridFS được chọn theo ngôn ngữ hỗ trợ. Tiếng Hàn chưa có nội dung/audio. |
| Admin Nội dung (`/#/admin`) | Thêm/sửa/xóa POI trong bản nháp; sửa trường dịch; quản lý/nghe thử MP3; lưu và công bố release. |
| Admin Quản trị (`/#/management`) | Dashboard theo ngày ICT, tổng khách/hành trình/audio, lượt nghe theo địa điểm và quản lý tài khoản. Người dùng xác nhận dashboard chạy trên deploy. |
| Bản đồ/GPS | Stadia Maps; 10 tọa độ do người dùng cung cấp đã kiểm chứng thực địa. GPS opt-in/mô phỏng/geofence có trong frontend. Tự phát khi vào vùng và ngưỡng thực địa còn chờ nghiệm thu. |
| QR | Admin tải PNG/SVG cho điểm đang công bố; QR mở trang chào đúng địa điểm, có scanner trong `/#/explore`, và dashboard đếm lượt theo điểm. Chưa nghiệm thu camera trên thiết bị thật hoặc deploy. |
| Offline, AI | Vẫn hoãn. |

Kế hoạch gốc 10 tuần và vai trò User/Creator/Admin được giữ làm hướng dài hạn. Trong demo hiện tại, Creator được gộp vào Admin. Chi tiết tại [kế hoạch khách/QR](docs/DEMO_GUEST_QR_PLAN.md), [bối cảnh](docs/PROJECT_CONTEXT.md) và [lộ trình](docs/IMPLEMENTATION_PLAN.md).

## Chạy local

Yêu cầu: Node.js 22.12 trở lên, Python 3.12 và `uv`. Backend và frontend chạy trong hai terminal riêng, từ thư mục gốc repository.

Backend:

```powershell
cd backend
uv sync --locked
uv run --frozen uvicorn app.main:app --reload
```

- Liveness: <http://127.0.0.1:8000/api/v1/health>
- Readiness: <http://127.0.0.1:8000/api/v1/health/ready>
- API docs: <http://127.0.0.1:8000/docs>
- Readiness ping MongoDB; cần cấu hình `MONGODB_URI` trong `backend/.env` theo [Atlas setup](docs/ATLAS_SETUP.md).

Frontend:

```powershell
cd frontend
npm ci
npm run dev
```

Mở địa chỉ Vite, thường là <http://localhost:5173/#/welcome>. Vite proxy `/api` tới backend. Không đặt khóa bí mật trong `VITE_*` hoặc `frontend/public`.

## Chuẩn bị nội dung/audio demo

Các lệnh bên dưới cần Atlas đã cấu hình. Chạy từ thư mục `backend`:

```powershell
uv run --frozen python -m app.commands.seed_demo_content
uv run --frozen python -m app.commands.import_demo_audio
uv run --frozen python -m app.commands.setup_admin phong
```

Để tái tạo và công bố asset English đã duyệt:

```powershell
uv run --frozen python -m app.commands.generate_demo_audio_en
uv run --frozen python -m app.commands.publish_demo_english
```

Lệnh publish kiểm tra manifest/checksum, nhập audio vào GridFS và tạo release mới; giữ nguyên audio Việt. Không commit MP3 hoặc thông tin đăng nhập. Xem [báo cáo English](docs/test-reports/DEMO_AUDIO_EN_DRAFT_2026_10_24.md) và [báo cáo nội dung/audio](docs/test-reports/DEMO_CONTENT_AUDIO_ADMIN.md).

Admin kiểm tra nội dung/audio trong `/#/admin`, rồi thao tác **Lưu nháp** hoặc **Công bố phiên bản đã lưu**. Khách chỉ đọc release được công bố. `/#/management` dành cho dashboard và tài khoản.

## Kiểm tra

Frontend, từ thư mục `frontend`:

```powershell
npm run build
npm test
```

Backend, từ thư mục `backend`:

```powershell
uv run --frozen ruff check app tests
uv run --frozen ruff format --check app tests
uv run --frozen python -m compileall -q app
uv run --frozen pytest -q
```

Test mặc định không ghi lên Atlas ứng dụng. Chỉ chạy integration theo hướng dẫn tại [backend/tests](backend/tests/README.md). Theo hồi quy ngày 24/10: backend 181 đạt/16 integration skip mặc định; frontend 61 đạt; typecheck/build/Ruff đạt. Xem [WORK_BREAKDOWN](docs/WORK_BREAKDOWN.md) và [TEST_AND_DEMO](docs/TEST_AND_DEMO.md) để biết giới hạn và kết quả theo từng phần.

## Tài liệu

- [Hướng dẫn đóng góp](AGENTS.md)
- [Bối cảnh dự án](docs/PROJECT_CONTEXT.md)
- [Kiến trúc](docs/ARCHITECTURE.md)
- [Kế hoạch gốc](docs/PROJECT_PLAN.md)
- [Kế hoạch demo khách/QR](docs/DEMO_GUEST_QR_PLAN.md)
- [Lộ trình triển khai](docs/IMPLEMENTATION_PLAN.md)
- [Dữ liệu và API](docs/DATA_AND_API.md)
- [Runtime tour](docs/TOUR_RUNTIME.md)
- [Kiểm thử và demo](docs/TEST_AND_DEMO.md)
- [Công việc triển khai](docs/WORK_BREAKDOWN.md)
- [Hướng dẫn deploy Render](docs/DEPLOY_RENDER.md)

Không commit `.env`, mật khẩu, URI chứa credential, dữ liệu tài khoản, MP3 hoặc PMTiles lớn.
