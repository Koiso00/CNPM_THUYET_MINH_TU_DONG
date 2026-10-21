# Website thuyết minh cơ sở chính Đại học Sài Gòn

Website Việt–Anh dành cho điện thoại và máy tính, có GPS thật/mô phỏng,
thuyết minh theo địa điểm và gói ngoại tuyến theo kế hoạch.
**Hiện tại: mới triển khai khung dự án, chưa có chức năng nghiệp vụ.**

## Phạm vi được chốt

Nguồn chuẩn là [bản kế hoạch gốc](docs/PROJECT_PLAN.md), được giữ nguyên từ bản người dùng chọn:
lộ trình dự kiến 10 tuần, ba vai trò **User / Creator / Admin**, 8–10 điểm ngoài trời,
MapLibre/PMTiles, dịch/TTS, offline pack, Gemini và dashboard.
Không dùng phương án rút gọn 5 ngày hoặc gộp Creator/Admin.

| Thành phần | Trạng thái hiện tại |
| --- | --- |
| React 19.2 + TypeScript + Vite 7 | Có trang mở đầu và cấu hình build |
| FastAPI | Có application factory, health endpoint và OpenAPI |
| Router nghiệp vụ, các lớp dữ liệu/service | Có khung thư mục, chưa có logic |
| MongoDB/GridFS | Có dependency/cấu hình mẫu, chưa kết nối |
| Auth, bản đồ, audio, offline, AI, dashboard | Chưa triển khai |
| Docker/Compose | Có cấu hình, chưa chạy xác minh trên máy hiện tại |
| Nội dung tour và tài khoản | Chưa có dữ liệu thật hoặc tài khoản seed |

## Cấu trúc

```text
.
├── AGENTS.md
├── docs/                    # Bối cảnh, kiến trúc, dữ liệu/API, runtime, kiểm thử
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/ # Router độc lập; chỉ health có endpoint thực
│   │   ├── core/            # Cấu hình; bảo mật sẽ bổ sung sau
│   │   ├── db/              # Mongo client/index trong mốc tiếp theo
│   │   ├── models/          # Mô hình lưu trữ
│   │   ├── schemas/         # Request/response nghiệp vụ
│   │   ├── repositories/    # MongoDB và GridFS
│   │   ├── services/        # Nghiệp vụ và provider bên ngoài
│   │   ├── workers/         # Xử lý công việc nền
│   │   └── main.py
│   ├── tests/               # Chưa có test nghiệp vụ
│   ├── pyproject.toml
│   └── uv.lock
├── frontend/
│   ├── src/
│   │   ├── app/             # Trang mở đầu
│   │   ├── features/        # auth, tours, map, playback, offline, creator, admin
│   │   ├── shared/
│   │   └── styles/
│   ├── public/
│   ├── tests/               # Chưa có test nghiệp vụ
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
- Health chỉ kiểm tra tiến trình; chưa có kiểm tra sẵn sàng của cơ sở dữ liệu.
- Không cần MongoDB hoặc .env để chạy khung. Nếu cần cấu hình, sao chép
  [backend/.env.example](backend/.env.example) thành backend/.env khi chưa có file riêng.

Frontend:

```powershell
cd frontend
npm ci
npm run dev
```

Mở địa chỉ Vite in trong terminal, mặc định [http://localhost:5173](http://localhost:5173).
Vite proxy /api tới backend để tránh tách nguồn trong quá trình phát triển.
Không đặt khóa API vào frontend.

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

Mở http://127.0.0.1:8000/. Hiện chỉ có trang mở đầu; chưa có routing giao diện nghiệp vụ.

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
```

Chưa có bộ unit/integration test nghiệp vụ; không dùng build/health để kết luận
đăng nhập, GPS hoặc offline đã hoạt động.

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

Không commit .env, dữ liệu tài khoản, MP3 hoặc PMTiles lớn. Dependency lockfile được commit
để các thành viên cài cùng phiên bản; thư viện cho tính năng tương lai chỉ thêm khi bắt đầu tích hợp.
