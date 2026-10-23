> **Ưu tiên cập nhật ngày 24/10/2026:** bản đồ OpenStreetMap và 10 tọa độ do người dùng cung cấp đã có; GPS thật bật chủ động, mô phỏng và geofence cùng luồng frontend đã triển khai. Cần xác minh GPS/tọa độ thực địa và kiểm thử thiết bị; QR chỉ làm sau khi nghiệm thu các phần này.

> **Trạng thái demo 23/10/2026:** khách không đăng nhập; welcome, ID khách/hành trình, nội dung/audio công khai, Admin và thống kê visit/journey/audio đã triển khai. QR vẫn hoãn. Chi tiết tại [kế hoạch khách/QR](docs/DEMO_GUEST_QR_PLAN.md) và [báo cáo khách](docs/test-reports/DEMO_GUEST_PROGRESS_2026_10_23.md).

> **Cập nhật 24/10/2026:** người dùng xác nhận 10 MP3 demo đúng; tài khoản User/Creator legacy và đề xuất Creator được chỉ định đã dọn theo kế hoạch. Atlas hiện còn Admin `phong`; tour, release và audio được giữ nguyên. GPS/geofence/autoplay frontend có 54 test đạt, build/typecheck đạt; autoplay/GPS trên điện thoại và khảo sát ngưỡng chưa nghiệm thu. QR vẫn hoãn.

# Website thuyết minh cơ sở chính Đại học Sài Gòn

Website dành cho điện thoại và máy tính; demo hiện tại dùng tiếng Việt.
**Hiện tại: khách có thể xem nội dung công bố và nghe MP3/GridFS không cần đăng nhập; Admin quản trị nội dung/audio/user và dashboard có thống kê khách cơ bản cho demo tiếng Việt.**

Kế hoạch gốc 10 tuần vẫn là hướng dài hạn. Demo hiện hành theo [kế hoạch khách/QR](docs/DEMO_GUEST_QR_PLAN.md): Admin, địa điểm/audio và khách không đăng nhập; QR, offline, AI và dịch tự động tạm hoãn. GPS/geofence đang ở giai đoạn thử nghiệm trên trình duyệt.
Thiết kế offline dài hạn đã chốt: tải tùy chọn theo ngôn ngữ, thêm ngôn ngữ sau,
bản đồ/ảnh dùng chung; không yêu cầu khách tải tất cả ngôn ngữ.

Hướng dẫn triển khai/cập nhật demo trên Render và kết nối Atlas: [DEPLOY_RENDER](docs/DEPLOY_RENDER.md).

## Phạm vi được chốt

Nguồn chuẩn là [bản kế hoạch gốc](docs/PROJECT_PLAN.md), được giữ nguyên từ bản người dùng chọn:
lộ trình dự kiến 10 tuần, ba vai trò **User / Creator / Admin**, 8–10 điểm ngoài trời,
MapLibre/PMTiles, dịch/TTS, offline pack, Gemini và dashboard.
Demo hiện tại gộp Creator vào Admin theo cập nhật 23/10; kế hoạch gốc ba vai trò vẫn là hướng dài hạn.

| Thành phần | Trạng thái hiện tại |
| --- | --- |
| React 19.2 + TypeScript + Vite 7 | Welcome khách, explore, đăng nhập Admin; Admin có nội dung/audio/dashboard/user |
| FastAPI | Có application factory, liveness/readiness và OpenAPI |
| Auth | Đăng nhập/gia hạn/khôi phục phiên/đăng xuất dành cho Admin; người nghe không cần tài khoản |
| MongoDB | P1.1 hoàn tất: connection pool/readiness, 34 test cục bộ và ping Atlas thật đạt |
| User/session | Có model, repository, unique/TTL index trên Atlas; 69 test cục bộ và 12 test Atlas đạt |
| GridFS / audio demo | Đã nhập 10 MP3; có API GET/HEAD/Range, phát thủ công và thay MP3 ≤10 MB từ Admin |
| Nội dung / quản trị | Nhập 10 mô tả thành nháp; sửa/thêm/xóa điểm, lưu, công bố/gỡ công bố; snapshot độc lập |
| Creator / duyệt | Workflow Creator đã gỡ khỏi demo; vai trò vẫn thuộc kế hoạch dài hạn |
| Guest / dashboard | ID khách và hành trình lưu trong browser; lượt truy cập/hành trình/audio theo ngày ICT |
| User / dashboard | Danh sách, đổi vai trò, khóa/mở khóa; số tài khoản/địa điểm/tour công bố/audio từ database |
| Bản đồ/GPS/geofence | OSM + 10 tọa độ người dùng cung cấp; GPS thật bật chủ động và mô phỏng cùng geofence phía frontend; chưa nghiệm thu thực địa/thiết bị |
| Offline, AI | Chưa triển khai; tiếp tục hoãn |
| Docker/Compose | Có cấu hình, chưa chạy xác minh trên máy hiện tại |
| Nội dung tour và tài khoản | Có nháp từ nguồn người dùng; Admin được cấp tường minh cho tài khoản có sẵn; không có mật khẩu mặc định |

## Cấu trúc

```text
.
├── AGENTS.md
├── docs/                    # Bối cảnh, kiến trúc, dữ liệu/API, runtime, kiểm thử
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/ # Health/auth; router tính năng khác giữ chỗ
│   │   ├── core/            # Cấu hình, chính sách phiên, JWT/Argon2/CSRF
│   │   ├── db/              # Mongo lifecycle/readiness và User/session index
│   │   ├── commands/        # Khởi tạo index tường minh
│   │   ├── models/          # Mô hình lưu trữ
│   │   ├── schemas/         # Request/response nghiệp vụ
│   │   ├── repositories/    # MongoDB và GridFS
│   │   ├── services/        # Nghiệp vụ và provider bên ngoài
│   │   ├── workers/         # Xử lý công việc nền
│   │   ├── application.py   # Application factory để kiểm thử độc lập
│   │   └── main.py          # Entrypoint Uvicorn
│   ├── tests/               # Unit test dữ liệu; integration MongoDB chạy có chủ đích
│   ├── pyproject.toml
│   └── uv.lock
├── frontend/
│   ├── src/
│   │   ├── app/             # App shell, hash routing và trang theo role
│   │   ├── features/        # auth, tours, map, playback, offline, creator, admin
│   │   ├── shared/
│   │   └── styles/
│   ├── public/
│   ├── tests/               # Auth client/UI và e2e trình duyệt
│   └── package-lock.json
├── infra/                   # Dockerfile và ghi chú triển khai
├── compose.yaml
├── data/                    # Mẫu, dữ liệu khảo sát và file sinh ra
└── scripts/                 # Chỗ đặt script ở các mốc sau
```

## Chạy khung dự án

Yêu cầu: Node.js 22.12 trở lên, Python 3.12 và uv.
Hai hướng dẫn bên dưới mở trong **hai terminal riêng**, bắt đầu từ thư mục gốc kho mã.

Backend:

```powershell
cd backend
uv sync --locked
uv run --frozen uvicorn app.main:app --reload
```

- Health: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)
- API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health chỉ kiểm tra tiến trình; readiness tại /api/v1/health/ready ping MongoDB thật.
- Chưa điền URI: health vẫn 200, readiness trả 503/not_configured.
- Cấu hình Atlas theo [ATLAS_SETUP](docs/ATLAS_SETUP.md). Nếu cần tạo file riêng, sao chép
  [backend/.env.example](backend/.env.example) thành backend/.env khi chưa có file riêng.

Frontend:

```powershell
cd frontend
npm ci
npm run dev
```

Mở địa chỉ Vite in trong terminal, mặc định [http://localhost:5173](http://localhost:5173).
Khách bắt đầu tại `/#/welcome`; đăng nhập nội bộ ở `/#/login`. Đăng ký đã bỏ khỏi UI demo.
Không có mật khẩu Admin mặc định; xem lệnh thiết lập bên dưới.
Vite proxy /api tới backend để tránh tách nguồn trong quá trình phát triển.
Không đặt khóa API vào frontend.

### Chuẩn bị demo nội dung/audio

Từ backend, sau khi cấu hình Atlas; lệnh thiết lập Admin dùng tài khoản `phong`:

```powershell
uv run --frozen python -m app.commands.seed_demo_content
uv run --frozen python -m app.commands.import_demo_audio
uv run --frozen python -m app.commands.setup_admin phong
```

Nếu `phong` chưa tồn tại, lệnh hỏi mật khẩu khởi tạo khi chạy tương tác; có thể truyền qua `INITIAL_ADMIN_PASSWORD` trong phiên lệnh. Nếu tài khoản đã tồn tại và đang active, lệnh giữ nguyên mật khẩu; tài khoản inactive không tự được mở khóa.

`uv run --frozen python -m app.commands.init_database` tạo/cập nhật index ứng dụng.

Lệnh seed chỉ tạo bản nháp khi chưa có, không ghi đè. Lệnh import cần bộ MP3/manifest
ở `data/generated/audio/vi-male` (đã có trên máy hiện tại, không commit); kiểm tra checksum
trước khi nhập GridFS. Chạy lại không nhân đôi các file đã nhập.
Đăng nhập Admin → **Nội dung** → kiểm tra/nghe thử → **Công bố phiên bản đã lưu**.
Người nghe chỉ thấy bản đã công bố; sửa nháp không thay bản đang nghe.
Khách mở trang mặc định để bắt đầu hành trình; Admin mở **Quản trị** (`/#/management`) để xem dashboard, đổi vai trò hoặc khóa/mở khóa
tài khoản; **Nội dung** (`/#/admin`) giữ các chức năng địa điểm và audio.
Demo dùng tiếng Việt, công bố nội dung chưa có tọa độ được phép; chưa phải release
Việt–Anh/offline của kế hoạch dài hạn. Xem [báo cáo demo](docs/test-reports/DEMO_CONTENT_AUDIO_ADMIN.md).

### Thử frontend đã build cùng FastAPI

Build từ thư mục frontend:

```powershell
npm run build
```

Trong terminal đang ở backend, dừng tiến trình cũ nếu có rồi chạy:

```powershell
$env:FRONTEND_DIST = (Resolve-Path ../frontend/dist).Path
uv run --frozen uvicorn app.main:app
```

Mở http://127.0.0.1:8000/#/login. Hash routing hỗ trợ tải lại mà không cần fallback route tại server.
Khi dùng địa chỉ origin khác, cập nhật AUTH_ALLOWED_ORIGINS ở backend.

### Kiểm tra chất lượng

Trong frontend:

```powershell
npm run build
```

Lệnh build gồm kiểm tra TypeScript. Trong backend:

```powershell
uv run --frozen ruff check app
uv run --frozen ruff format --check app
uv run --frozen python -m compileall -q app
uv run --frozen pytest -q
```

Test mặc định không dùng Atlas. Cờ --run-mongodb-integration chỉ bật ping;
--run-mongodb-write-integration bật ghi/xóa collection tạm biệt lập. Xem hướng dẫn trong
[backend/tests](backend/tests/README.md). P1.3 đạt 124 test cục bộ và 14 test Atlas.
P1.4 đạt 18 test frontend (`npm test`) và 4 test trình duyệt với Atlas tạm;
xem [báo cáo UI auth](docs/test-reports/P1_4_AUTH_UI.md). GPS/offline chưa kiểm thử.

## Tài liệu cho người phát triển và AI

1. [AGENTS.md](AGENTS.md): cách làm việc trong kho mã.
2. [PROJECT_CONTEXT](docs/PROJECT_CONTEXT.md): yêu cầu hiện hành và trạng thái.
3. [ARCHITECTURE](docs/ARCHITECTURE.md): thành phần và ranh giới trách nhiệm.
4. [DATA_AND_API](docs/DATA_AND_API.md): dữ liệu, hợp đồng đã có và nhóm API mục tiêu.
5. [TOUR_RUNTIME](docs/TOUR_RUNTIME.md): GPS, audio và ngoại tuyến.
6. [IMPLEMENTATION_PLAN](docs/IMPLEMENTATION_PLAN.md): mốc thực hiện tiếp theo.
7. [TEST_AND_DEMO](docs/TEST_AND_DEMO.md): ma trận nghiệm thu và trình diễn.
8. [CONTENT_GUIDE](docs/CONTENT_GUIDE.md): khảo sát, nguồn và kiểm tra nội dung.
9. [Infrastructure](infra/README.md): Docker và giới hạn cấu hình hiện tại.
10. [WORK_BREAKDOWN](docs/WORK_BREAKDOWN.md): công việc nhỏ và trạng thái kiểm thử.
11. [ATLAS_SETUP](docs/ATLAS_SETUP.md): tạo cluster và cấu hình môi trường phát triển.

Không commit .env, dữ liệu tài khoản, MP3 hoặc PMTiles lớn. Dependency lockfile được commit
để các thành viên cài cùng phiên bản; thư viện cho tính năng tương lai chỉ thêm khi bắt đầu tích hợp.
