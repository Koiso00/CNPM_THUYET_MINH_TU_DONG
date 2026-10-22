# Website thuyết minh cơ sở chính Đại học Sài Gòn

Website Việt–Anh dành cho điện thoại và máy tính, có GPS thật/mô phỏng,
thuyết minh theo địa điểm và gói ngoại tuyến theo kế hoạch.
**Hiện tại: có đăng nhập, nội dung từ MongoDB, nghe MP3/GridFS, quản trị nội dung/audio/user và dashboard dữ liệu thật cho demo tiếng Việt.**

Ưu tiên mới được chốt: [demo 2 ngày](docs/DEMO_2_DAYS.md), gồm giao diện đăng nhập,
nghe audio, quản lý địa điểm/nội dung/audio/user và dashboard dữ liệu thật.
GPS, offline, AI và dịch tự động tạm hoãn trong demo.
Thiết kế offline dài hạn đã chốt: tải tùy chọn theo ngôn ngữ, thêm ngôn ngữ sau,
bản đồ/ảnh dùng chung; không yêu cầu khách tải tất cả ngôn ngữ.

Hướng dẫn triển khai/cập nhật demo trên Render và kết nối Atlas: [DEPLOY_RENDER](docs/DEPLOY_RENDER.md).

## Phạm vi được chốt

Nguồn chuẩn là [bản kế hoạch gốc](docs/PROJECT_PLAN.md), được giữ nguyên từ bản người dùng chọn:
lộ trình dự kiến 10 tuần, ba vai trò **User / Creator / Admin**, 8–10 điểm ngoài trời,
MapLibre/PMTiles, dịch/TTS, offline pack, Gemini và dashboard.
Không dùng phương án rút gọn 5 ngày hoặc gộp Creator/Admin.

| Thành phần | Trạng thái hiện tại |
| --- | --- |
| React 19.2 + TypeScript + Vite 7 | Có UI auth/khám phá; Creator gửi đề xuất toàn tour để Admin duyệt; Admin có nội dung/audio/dashboard/user |
| FastAPI | Có application factory, liveness/readiness và OpenAPI |
| Auth | Có API + UI đăng ký/đăng nhập, gia hạn/khôi phục phiên/đăng xuất và điều hướng theo role |
| MongoDB | P1.1 hoàn tất: connection pool/readiness, 34 test cục bộ và ping Atlas thật đạt |
| User/session | Có model, repository, unique/TTL index trên Atlas; 69 test cục bộ và 12 test Atlas đạt |
| GridFS / audio demo | Đã nhập 10 MP3; có API GET/HEAD/Range, phát thủ công và thay MP3 ≤10 MB từ Admin |
| Nội dung / quản trị | Nhập 10 mô tả thành nháp; sửa/thêm/xóa điểm, lưu, công bố/gỡ công bố; snapshot độc lập |
| Creator / duyệt | Creator sửa bản riêng toàn tour, gửi Admin duyệt; duyệt chỉ áp dụng vào nháp, Admin công bố riêng |
| User / dashboard | Danh sách, đổi vai trò, khóa/mở khóa; số tài khoản/địa điểm/tour công bố/audio từ database |
| Bản đồ thật/GPS, offline, AI | Chưa triển khai; trang khám phá đang để vùng giữ chỗ cho ảnh sơ đồ |
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
Giao diện đăng nhập ở /#/login, đăng ký ở /#/register. Tạo tài khoản chỉ cấp User.
Creator/Admin không có tài khoản hoặc mật khẩu mặc định; cấp Admin bằng lệnh bên dưới.
Vite proxy /api tới backend để tránh tách nguồn trong quá trình phát triển.
Không đặt khóa API vào frontend.

### Chuẩn bị demo nội dung/audio

Từ backend, sau khi cấu hình Atlas và đăng ký một tài khoản:

```powershell
uv run --frozen python -m app.commands.seed_demo_content
uv run --frozen python -m app.commands.import_demo_audio
uv run --frozen python -m app.commands.bootstrap_admin ten_dang_nhap_da_dang_ky
```

`uv run --frozen python -m app.commands.init_database` tạo bổ sung index đề xuất Creator
cùng index users/sessions hiện có; lệnh có thể chạy lại an toàn.

Lệnh seed chỉ tạo bản nháp khi chưa có, không ghi đè. Lệnh import cần bộ MP3/manifest
ở `data/generated/audio/vi-male` (đã có trên máy hiện tại, không commit); kiểm tra checksum
trước khi nhập GridFS. Chạy lại không nhân đôi các file đã nhập.
Đăng nhập Admin → **Nội dung** → kiểm tra/nghe thử → **Công bố phiên bản đã lưu**.
Người nghe chỉ thấy bản đã công bố; sửa nháp không thay bản đang nghe.
Admin mở **Quản trị** (`/#/management`) để xem dashboard, đổi vai trò hoặc khóa/mở khóa
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
