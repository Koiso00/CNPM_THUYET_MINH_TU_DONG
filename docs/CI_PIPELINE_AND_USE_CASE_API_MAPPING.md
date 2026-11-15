# TÀI LIỆU KỸ THUẬT: QUY TRÌNH CI/CD VÀ ÁNH XẠ CHỨC NĂNG USE CASE SANG API & CODEBASE

Tài liệu này ghi lại toàn bộ cấu trúc quy trình tích hợp liên tục (**CI - Continuous Integration**) gồm **JOB 1** và **JOB 2**, cùng bản đặc tả chi tiết cách thức hoạt động của từng chức năng trong 8 Use Case (**UC01 – UC08**): được gọi từ component/hàm nào ở Frontend, truyền qua API Endpoint nào, xử lý tại hàm/service nào ở Backend và tác động tới cơ sở dữ liệu MongoDB ra sao.

---

## PHẦN I: CẤU TRÚC VÀ QUY TRÌNH THỰC THI CI (GITHUB ACTIONS)

Tệp cấu hình CI đặt tại: [`.github/workflows/ci.yml`](file:///.github/workflows/ci.yml)  
Quy trình được tự động kích hoạt khi:
* Có **Pull Request** mở hoặc cập nhật vào nhánh `main`.
* Có commit được **Push** trực tiếp lên nhánh `main`.
* Cơ chế `concurrency: cancel-in-progress: true` tự động hủy lượt chạy cũ nếu có commit mới đẩy lên để tối ưu tài nguyên.

---

### JOB 1: `frontend` — Frontend checks

* **Tên hiển thị (Job Name):** `Frontend checks`
* **Môi trường thực thi (Runner):** `ubuntu-latest`
* **Thời gian giới hạn (Timeout):** 15 phút
* **Thư mục làm việc mặc định:** `frontend/`
* **Phiên bản Runtime:** Node.js `22.19` (sử dụng cache `npm` dựa trên `frontend/package-lock.json`)

#### Các bước thực thi chi tiết trong JOB 1:
| STT | Tên bước (Step Name) | Lệnh thực thi | Công cụ & Cơ chế | Ý nghĩa kiểm tra |
| :---: | :--- | :--- | :--- | :--- |
| **1** | Check out repository | `actions/checkout@v5` | Git Action | Tải toàn bộ mã nguồn của repository về máy ảo runner. |
| **2** | Set up Node.js | `actions/setup-node@v5` | Node Action | Khởi tạo môi trường Node.js v22.19, bật bộ nhớ đệm cache cho npm dependencies. |
| **3** | Install dependencies | `npm ci` | npm engine | Cài đặt các thư viện phụ thuộc chính xác 100% theo tệp khóa `package-lock.json`. Tuyệt đối không tự ý nâng cấp phiên bản. |
| **4** | Run frontend tests | `npm test` | **Vitest** (`vitest run`) | Chạy toàn bộ các bài Unit & Integration tests của giao diện: kiểm tra render component React, định dạng ngày ICT, logic chuyển đổi ngôn ngữ (i18n), logic phát audio. |
| **5** | Typecheck and build frontend | `npm run build` | **TypeScript Compiler** (`tsc --noEmit`) & **Vite Build** | **Bảo đảm 2 tầng:**<br>1. *Typecheck:* Quét toàn bộ TypeScript, bắt lỗi sai kiểu dữ liệu, sai prop, thiếu interface.<br>2. *Vite build:* Đóng gói ứng dụng thành bundle production hoàn chỉnh (HTML/CSS/JS). Phát hiện lỗi import thiếu file hoặc sai đường dẫn. |

---

### JOB 2: `backend` — Backend checks

* **Tên hiển thị (Job Name):** `Backend checks`
* **Môi trường thực thi (Runner):** `ubuntu-latest`
* **Thời gian giới hạn (Timeout):** 15 phút
* **Thư mục làm việc mặc định:** `backend/`
* **Phiên bản Runtime:** Python `3.12`, sử dụng trình quản lý gói siêu tốc **`uv`** (Astral)

#### Các bước thực thi chi tiết trong JOB 2:
| STT | Tên bước (Step Name) | Lệnh thực thi | Công cụ & Cơ chế | Ý nghĩa kiểm tra |
| :---: | :--- | :--- | :--- | :--- |
| **1** | Check out repository | `actions/checkout@v5` | Git Action | Tải mã nguồn về runner. |
| **2** | Set up uv | `astral-sh/setup-uv@v10.3.2` | uv binary | Cài đặt công cụ quản lý gói Python hiện đại `uv`. |
| **3** | Install backend dependencies | `uv sync --locked` | uv sync | Đồng bộ và cài đặt chính xác các thư viện Python theo tệp khóa `backend/uv.lock`. |
| **4** | Check lint | `uv run --frozen ruff check app tests` | **Ruff Linter** | Phân tích tĩnh cú pháp mã nguồn: phát hiện biến thừa, import sai quy chuẩn, lỗi logic tiềm ẩn trong thư mục `app/` và `tests/`. |
| **5** | Check formatting | `uv run --frozen ruff format --check app tests` | **Ruff Formatter** | Kiểm tra toàn bộ mã nguồn có tuân thủ đúng chuẩn định dạng PEP 8 và độ dài dòng tối đa 100 ký tự hay không. |
| **6** | Run backend tests | `uv run --frozen pytest -q --tb=short` | **Pytest** | Thực thi tự động toàn bộ test suite của FastAPI Backend: kiểm tra băm mật khẩu Argon2id, ký/giải mã JWT, xác thực Double Submit Cookie CSRF, cơ chế CAS Revision (`HTTP 409`), phân quyền Admin. |

> **Nguyên tắc an toàn:** Cả JOB 1 và JOB 2 chạy hoàn toàn độc lập, không cần kết nối tới cơ sở dữ liệu MongoDB Atlas thật, không sử dụng secret môi trường, đảm bảo không làm rò rỉ dữ liệu và không ghi dữ liệu rác.

---

## PHẦN II: ÁNH XẠ CHI TIẾT 8 USE CASE SANG CODE VÀ API ENDPOINTS

Dưới đây là bảng tổng hợp và phân tích chuyên sâu từng Use Case: hành động người dùng tương tác với hàm nào ở **Frontend**, gọi **API** nào, xử lý tại hàm nào ở **Backend**, truy vấn vào **CSDL MongoDB** nào và trả về kết quả gì.

---

### BẢNG TỔNG HỢP ÁNH XẠ NHANH (API MATRIX)

| Mã UC | Tên Use Case | Hàm / File Frontend gọi | HTTP Method & Endpoint URL | Hàm / File Backend xử lý | CSDL MongoDB tác động |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **UC01** | Khám phá bản đồ | `ExploreScreen.tsx` (`useEffect`)<br>`session.ts` (`start`) | `POST /api/v1/events/guest`<br>`GET /api/v1/content/campus` | `events.py::record_guest_event`<br>`content.py::get_campus_content` | `usage_events`<br>`tour_releases`, `tours` |
| **UC02** | Nghe thuyết minh audio | `AudioPlayer.tsx`<br>`ExplorePage.tsx` (`selectPlace`) | `GET /api/v1/audio/{rel_id}/{place_id}`<br>`POST /api/v1/events/guest` | `audio.py::stream_audio`<br>`events.py::record_guest_event` | `fs.files`, `fs.chunks`<br>`usage_events` |
| **UC03** | Định vị GPS & Mô phỏng | `useCampusLocation.ts`<br>`LocationControls.tsx` | Xử lý Web Geolocation API & Haversine client-side (Tọa độ ảo gắn cờ `is_simulated`) | Không gọi endpoint mới (kế thừa Geofence kích hoạt UC02) | `usage_events` (ghi nhận khi kích hoạt) |
| **UC04** | Lựa chọn ngôn ngữ | `i18n.ts` (`saveLanguage`)<br>`ExplorePage.tsx` (`localized`) | Xử lý LocalStorage (`sgu_language`) & Client-side i18n switching | Không gọi endpoint riêng (dữ liệu VI/EN/KO nạp sẵn từ UC01) | `tour_releases` (đã nạp sẵn trường `translations`) |
| **UC05** | Đăng nhập hệ thống | `AuthPage.tsx` (`handleLogin`)<br>`App.tsx` (`logout`) | `POST /api/v1/auth/login`<br>`POST /api/v1/auth/refresh`<br>`POST /api/v1/auth/logout` | `auth.py::login`<br>`auth.py::refresh`<br>`auth.py::logout` | `users`<br>`sessions` |
| **UC06** | Biên tập nội dung & audio | `ContentPage.tsx` (`handleSaveDraft`)<br>`ContentPage.tsx` (`handleAudioUpload`) | `GET /api/v1/admin/campus`<br>`PUT /api/v1/admin/campus`<br>`PUT /api/v1/admin/campus/places/{id}/audio` | `admin.py::campus`<br>`admin.py::save_campus`<br>`admin.py::upload_audio` | `tours`<br>`assets`<br>`audio_selections`<br>`fs.files`, `fs.chunks` |
| **UC07** | Quản lý công bố tour | `ContentPage.tsx` (`handlePublish`)<br>`ContentPage.tsx` (`handleUnpublish`) | `POST /api/v1/admin/campus/publish`<br>`POST /api/v1/admin/campus/unpublish` | `admin.py::publish_campus`<br>`admin.py::unpublish_campus` | `tours`<br>`tour_releases`<br>`audio_selections` |
| **UC08** | Xem Dashboard thống kê | `ManagementPage.tsx` (`useEffect` & Button "Làm mới") | `GET /api/v1/admin/dashboard?day={date}` | `admin.py::dashboard`<br>`AdminService::dashboard` | `usage_events`<br>`visitor_presence`<br>`users`, `assets` |

---

### CHI TIẾT CÁCH THỨC HOẠT ĐỘNG CỦA TỪNG USE CASE

---

### 1. UC01: Khám phá khuôn viên qua bản đồ

#### Chức năng 1.1: Khởi tạo hành trình (`journey_started`)
* **Frontend:**
  - File: `frontend/src/features/guest/session.ts` $\rightarrow$ phương thức `GuestSession.start()`.
  - Logic: Kiểm tra LocalStorage `sgu_guest_session`. Nếu chưa có `visitor_id`, sinh UUIDv4 ngẫu nhiên; luôn sinh mới `journey_id = crypto.randomUUID()`.
  - Gọi API: `POST /api/v1/events/guest` với payload JSON:
    ```json
    {
      "event_type": "journey_started",
      "visitor_id": "c1a2...",
      "journey_id": "e8f9...",
      "timestamp": "2026-11-15T13:00:00Z"
    }
    ```
* **Backend:**
  - File: `backend/app/api/v1/endpoints/events.py` $\rightarrow$ hàm `record_guest_event()`.
  - Service: `EventService.record_guest_event()` $\rightarrow$ `EventRepository.record_event()`.
  - Xử lý: Chuẩn hóa ngày ICT (`Asia/Ho_Chi_Minh`), gắn cờ `is_simulated = false`, ghi bản ghi vào collection `usage_events`. Trả về `HTTP 200 {"status": "recorded"}`.

#### Chức năng 1.2: Tải dữ liệu bản đồ số & 10 điểm tham quan
* **Frontend:**
  - File: `frontend/src/features/tours/ExploreScreen.tsx` $\rightarrow$ hook `useEffect()`.
  - Gọi API: `GET /api/v1/content/campus`.
* **Backend:**
  - File: `backend/app/api/v1/endpoints/content.py` $\rightarrow$ hàm `get_campus_content()`.
  - Service: `ContentService.published()` $\rightarrow$ `ContentRepository.get()`.
  - Xử lý: 
    1. Đọc tài liệu `{_id: "campus-main"}` trong collection `tours` lấy mã `published_release_id`.
    2. Nếu `published_release_id == null` $\rightarrow$ ném ngoại lệ `HTTP 404 {"detail": "Chưa có bản công bố"}`.
    3. Nếu hợp lệ, truy vấn collection `tour_releases` theo `release_id`, trích xuất bản Snapshot bất biến gồm 10 POI (tọa độ `[lng, lat]`, tiêu đề, bài viết, bản dịch VI/EN/KO, mã asset âm thanh).
    4. Trả về `HTTP 200 PublishedCampus`. Frontend nạp vector tiles từ Stadia Maps và vẽ 10 marker POI lên bản đồ.

---

### 2. UC02: Nghe thuyết minh audio

#### Chức năng 2.1: Truy phát dòng âm thanh MP3 (HTTP 206 Partial Content)
* **Frontend:**
  - File: `frontend/src/features/tours/AudioPlayer.tsx` và `ExplorePage.tsx` $\rightarrow$ hàm `selectPlace()`.
  - Thẻ HTML5 `<audio>` tự động đính kèm header `Range: bytes=0-` khi gửi request.
  - Gọi API: `GET /api/v1/audio/{release_id}/{place_id}?language={lang}`.
* **Backend:**
  - File: `backend/app/api/v1/endpoints/audio.py` $\rightarrow$ hàm `stream_audio()`.
  - Service: `AudioService.response_data()` $\rightarrow$ `AudioRepository.open_download_stream()`.
  - Xử lý:
    1. Tra cứu `place_id` và `language` trong snapshot `tour_releases` để lấy `asset_id` file MP3 đã ghim.
    2. Đọc metadata từ collection `assets` và các khối nhị phân từ GridFS: `fs.files` (metadata) và `fs.chunks` (dữ liệu byte thực tế).
    3. Xử lý header `Range`: cắt luồng byte theo yêu cầu (tua seek bar hoặc tải phân đoạn đầu tiên).
    4. Trả về `HTTP 206 Partial Content` với headers: `Content-Range: bytes start-end/total`, `Accept-Ranges: bytes`, `Content-Type: audio/mpeg`.

#### Chức năng 2.2: Ghi nhận sự kiện lượt nghe audio
* **Frontend:** `GuestSession.recordAudioPlay()` gọi ngầm `POST /api/v1/events/guest` (`event_type: "audio_played"`).
* **Backend:** Lưu sự kiện vào collection `usage_events` để phục vụ thống kê ở Dashboard (UC08).

---

### 3. UC03: Định vị GPS và mô phỏng vị trí

#### Chức năng 3.1: Định vị GPS và quét Geofence
* **Frontend:**
  - File: `frontend/src/features/map/useCampusLocation.ts` $\rightarrow$ hàm `startWatching()`.
  - Lệnh: Gọi API trình duyệt `navigator.geolocation.watchPosition()`. Nhận tọa độ thực `(lat, lng, accuracy)` và vẽ chấm Puck xanh trên `CampusMap.tsx`.
  - File: `frontend/src/features/map/geofence.ts` $\rightarrow$ hàm `evaluateGeofence()`:
    - Chạy định kỳ mỗi 5 giây, tính khoảng cách tới 10 POI theo công thức **Haversine**.
    - Nếu khoảng cách $\le 30$m qua 2 chu kỳ đo $\rightarrow$ Kích hoạt `handlePlaceDetected(poi.id)` $\rightarrow$ trượt mở Drawer và tự động phát audio (UC02).
* **Backend:** Không cần backend riêng cho việc tính toán vị trí (xử lý hoàn toàn tại Client để bảo vệ quyền riêng tư).

#### Chức năng 3.2: Chế độ mô phỏng ảo (Simulation Mode)
* **Frontend:** `LocationControls.tsx` cung cấp Switch bật/tắt tour mô phỏng ảo. Toàn bộ sự kiện kích hoạt gửi lên backend được gắn cờ `is_simulated = true` để không tính nhầm vào thống kê thực tế.

---

### 4. UC04: Lựa chọn ngôn ngữ

#### Chức năng: Lưu trữ và chuyển đổi đa ngôn ngữ (VI / EN / KO)
* **Frontend:**
  - File: `frontend/src/shared/i18n.ts` $\rightarrow$ hàm `saveLanguage(next: AppLanguage)`.
  - Xử lý: Lưu mã ngôn ngữ (`vi`, `en`, `ko`) vào `localStorage.setItem("sgu_language", next)`. Thiết lập `document.documentElement.lang = next`.
  - File: `frontend/src/features/tours/ExplorePage.tsx` $\rightarrow$ hàm `localized(place)`:
    - Trích xuất dữ liệu bài viết tương ứng từ `place.translations.en` hoặc `place.translations.ko`. Nếu thiếu bản dịch, tự động fallback về tiếng Việt gốc.
    - Hàm `audioUrl()` tự động chuyển đường dẫn phát audio: `?language=en` hoặc `?language=ko`.
* **Backend:** Không cần gọi API riêng vì dữ liệu dịch của 10 POI đã nằm trọn vẹn trong Snapshot phát hành `tour_releases` được nạp từ đầu ở UC01.

---

### 5. UC05: Đăng nhập hệ thống

#### Chức năng 5.1: Xác thực tài khoản Admin và thiết lập Cookie bảo mật
* **Frontend:**
  - File: `frontend/src/features/auth/AuthPage.tsx` $\rightarrow$ hàm `handleLogin(e)`.
  - Gọi API: `POST /api/v1/auth/login` với body `{ "username": "phong", "password": "..." }`.
* **Backend:**
  - File: `backend/app/api/v1/endpoints/auth.py` $\rightarrow$ hàm `login()`.
  - Service: `AuthService.authenticate_user()` $\rightarrow$ `UserRepository.find_by_username()`.
  - Xử lý:
    1. Tìm tài khoản trong collection `users`, dùng thư viện `pwdlib` với thuật toán **Argon2id** để đối soát hash mật khẩu.
    2. Kiểm tra `is_active == True` và `role == "admin"`.
    3. Sinh chuỗi `refresh_token` ngẫu nhiên 256-bit, băm SHA-256 lưu vào collection `sessions` với thời hạn 7 ngày.
    4. Ký mã **JWT Access Token** (HS256, thời hạn 15 phút) chứa thông tin định danh `user_id`, `role`.
    5. Tạo mã CSRF token theo chuẩn Double Submit Cookie HMAC-SHA256.
    6. Thiết lập 3 Set-Cookie Headers an toàn: `sgu_access`, `sgu_refresh`, `sgu_csrf` (`HttpOnly`, `SameSite=Lax`, `Secure`). Trả về `HTTP 200 {"user": {"username": "phong", "role": "admin"}}`.

#### Chức năng 5.2: Tự động gia hạn Access Token ngầm
* **Frontend:** `frontend/src/features/auth/client.ts` tự động gửi ngầm `POST /api/v1/auth/refresh` sau mỗi 14 phút bằng cookie `sgu_refresh` để gia hạn phiên làm việc liên tục.

#### Chức năng 5.3: Đăng xuất
* **Frontend:** `App.tsx` $\rightarrow$ hàm `logout()`. Gọi `POST /api/v1/auth/logout`.
* **Backend:** Đánh dấu thu hồi `revoked_at = utc_now()` trong collection `sessions`, xóa sạch 3 cookies.

---

### 6. UC06: Biên tập nội dung và audio địa điểm

#### Chức năng 6.1: Tải và chỉnh sửa văn bản bản nháp
* **Frontend:** `frontend/src/features/content/ContentPage.tsx` gọi `GET /api/v1/admin/campus` để lấy danh sách 10 điểm trong bản nháp (`tours`). Admin chỉnh sửa tiêu đề, mô tả trên các tab `vi`, `en`, `ko`.

#### Chức năng 6.2: Tải lên tệp âm thanh MP3
* **Frontend:**
  - File: `ContentPage.tsx` $\rightarrow$ hàm `handleAudioUpload()`.
  - Gọi API: `PUT /api/v1/admin/campus/places/{place_id}/audio?revision={rev}&language={lang}`.
  - Header: `Content-Type: audio/mpeg`, `X-CSRF-Token`. Body là luồng nhị phân file MP3 ($\le 10$MB).
* **Backend:**
  - File: `backend/app/api/v1/endpoints/admin.py` $\rightarrow$ hàm `upload_audio()`.
  - Service: `AudioService.upload()` $\rightarrow$ `AudioRepository.upload()`.
  - Xử lý:
    1. Kiểm tra dung lượng byte $\le 10$MB và dùng `mutagen` phân tích cấu trúc frame MP3 hợp lệ.
    2. Tính mã băm SHA-256 của file nhị phân.
    3. Lưu file vào GridFS collection `fs.files` và `fs.chunks`.
    4. Tạo bản ghi mới trong collection `assets` (`status: "ready"`).
    5. Cập nhật liên kết ghim trong collection `audio_selections` cho cặp `{place_id, language}`. Trả về `HTTP 200`.

#### Chức năng 6.3: Lưu bản nháp (Save Draft) với khóa lạc quan CAS Revision
* **Frontend:** `ContentPage.tsx` $\rightarrow$ hàm `handleSaveDraft()`. Gọi `PUT /api/v1/admin/campus` kèm payload `{ revision, draft: { places: [10 POI] } }` và `X-CSRF-Token`.
* **Backend:**
  - File: `admin.py` $\rightarrow$ hàm `save_campus()`.
  - Service: `ContentService.save()`.
  - Xử lý: Đảm bảo giữ nguyên đúng 10 ID cố định. Thực hiện câu lệnh nguyên tử CAS trên collection `tours`:
    `find_one_and_update({_id: "campus-main", revision: rev}, {$set: {places, revision: rev + 1}})`.
    Nếu `revision` không khớp (bị phiên khác lưu trước), trả về `HTTP 409 Conflict`. Nếu khớp, trả về `HTTP 200` kèm số revision mới.

---

### 7. UC07: Quản lý công bố bản thuyết minh

#### Chức năng 7.1: Công bố phiên bản (Publish Tour)
* **Frontend:**
  - File: `frontend/src/features/content/ContentPage.tsx` $\rightarrow$ hàm `handlePublish()`.
  - Kiểm tra Pre-publish Checklist: đủ 10 POI, có đủ tọa độ.
  - Gọi API: `POST /api/v1/admin/campus/publish` với body `{ "revision": rev }` và `X-CSRF-Token`.
* **Backend:**
  - File: `backend/app/api/v1/endpoints/admin.py` $\rightarrow$ hàm `publish_campus()`.
  - Service: `ContentService.publish()`.
  - Xử lý:
    1. Kiểm tra CAS `tour.revision == rev`.
    2. Đọc toàn bộ danh sách audio hợp lệ từ collection `audio_selections`.
    3. Đóng gói Snapshot hoàn chỉnh (10 POI, bản dịch, tọa độ, asset_id của từng audio, timestamp phát hành).
    4. Sinh `release_id = str(uuid4())`.
    5. Ghi bản ghi mới vào collection `tour_releases` (Insert-only, snapshot bất biến không bao giờ bị sửa đổi).
    6. Cập nhật con trỏ phát hành trong collection `tours`: `{$set: {published_release_id: release_id}}`.
    7. Trả về `HTTP 200 {"release_id": "...", "published_at": "..."}`. Toàn bộ khách tham quan trên hệ thống lập tức thấy nội dung mới.

#### Chức năng 7.2: Gỡ công bố (Unpublish Tour)
* **Frontend:** Bấm nút "Gỡ công bố" $\rightarrow$ Gọi `POST /api/v1/admin/campus/unpublish`.
* **Backend:** `ContentService.unpublish()` cập nhật `published_release_id = None` trong collection `tours`.

---

### 8. UC08: Xem thống kê báo cáo (Dashboard)

#### Chức năng: Tổng hợp số liệu theo ngày và làm mới dữ liệu
* **Frontend:**
  - File: `frontend/src/features/admin/ManagementPage.tsx` $\rightarrow$ hook `useEffect` và nút bấm *"Làm mới số liệu"*.
  - Tự động gọi định kỳ mỗi 30 giây nếu tab mở.
  - Gọi API: `GET /api/v1/admin/dashboard?day={statsDay}` (ví dụ: `?day=2026-11-15`).
* **Backend:**
  - File: `backend/app/api/v1/endpoints/admin.py` $\rightarrow$ hàm `dashboard()`.
  - Service: `AdminService.dashboard(day)` $\rightarrow$ `AdminRepository.counts()` & `AdminRepository.guest_counts(day)`.
  - Xử lý truy vấn CSDL MongoDB song song:
    1. **Khách online thời gian thực:** Đếm số bản ghi trong collection `visitor_presence` có `last_seen >= now - 90s` (nhịp tim gửi về trong 90 giây gần nhất).
    2. **Khách tham quan trong ngày:** Chạy truy vấn distinct `visitor_id` trong collection `usage_events` với điều kiện `day == statsDay` và `event_type == "visit"`.
    3. **Tổng số hành trình & lượt nghe:** Đếm bản ghi trong `usage_events` có `event_type == "journey_started"` và `audio_played`.
    4. **Biểu đồ phân bổ 10 POI:** Chạy MongoDB Aggregation Pipeline trên `usage_events`: lọc theo ngày, gom nhóm `$group: {_id: "$place_id", plays: {$sum: 1}}`, sắp xếp giảm dần theo lượt nghe.
    5. Ghép tên địa điểm từ snapshot `tour_releases` vào kết quả.
    6. Trả về `HTTP 200 DashboardDataResponse` chứa đầy đủ các chỉ số để giao diện cập nhật ngay lập tức.
