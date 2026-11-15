# TÀI LIỆU BÀN GIAO DỰ ÁN CHO AI AGENT TIẾP QUẢN
## PROJECT HANDOVER & CONTINUATION BRIEFING FOR AI AGENT
**Hệ thống:** Website Thuyết Minh Tự Động Khuôn Viên Đại Học Sài Gòn (SGU Campus Guide)  
**Thời điểm cập nhật:** Tháng 11/2026  
**Trạng thái hệ thống:** Đã deploy thành công trên Render + MongoDB Atlas, 10 POI song ngữ/tam ngữ đã công bố và hoạt động thực tế.

---

> ### ⚠️ THÔNG ĐIỆP GỬI AGENT BẠN ĐỌC TÀI LIỆU NÀY:
> Bạn là AI Agent tiếp theo chịu trách nhiệm phân tích, thiết kế hoặc phát triển tiếp cho dự án này.
> **Hãy đọc kỹ toàn bộ tài liệu này trước khi trả lời hoặc thực hiện bất kỳ yêu cầu nào của người dùng.**
> Mọi phân tích, sơ đồ UML, DFD, đặc tả và code tiếp theo **BẮT BUỘC PHẢI TUÂN THỦ TUYỆT ĐỐI** các quy tắc, ma trận ánh xạ 1-1 và cấu trúc dữ liệu đã được chốt bên dưới.

---

## 1. NGUYÊN TẮC BẮT BUỘC (GOLDEN RULES - ZERO HALLUCINATION)

1. **ĐÚNG 2 ACTOR (TÁC NHÂN):**
   - **Khách tham quan (`Visitor`):** Hoàn toàn ẩn danh, **không cần đăng nhập**, không có tài khoản.
   - **Quản trị viên (`Admin`):** Tài khoản duy nhất là `phong`. Có toàn quyền biên tập nội dung, upload audio, công bố tour và xem dashboard.
   - *TUYỆT ĐỐI KHÔNG BỊA RA:* Vai trò Creator, Staff, Kiểm duyệt viên hay Đăng ký thành viên cho khách.
2. **LOẠI BỎ HOÀN TOÀN TÍNH NĂNG OFFLINE:**
   - Quyết định ngày 27/10/2026: Người dùng đã loại bỏ tính năng Offline khỏi toàn bộ phạm vi dự án. Không thiết kế Service Worker cache offline, không tạo gói nén tải về.
3. **KHÔNG THÊM HOẶC XÓA ĐỊA ĐIỂM (POI):**
   - Khuôn viên trường gồm **đúng 10 điểm tham quan cố định** đã kiểm chứng thực địa tại cơ sở chính (273 An Dương Vương, Q.5, TP.HCM).
   - Admin chỉ chỉnh sửa tiêu đề, mô tả, bản dịch và upload audio cho 10 điểm này. Mọi thao tác lưu bản nháp (`PUT /api/v1/admin/campus`) kiểm tra nghiêm ngặt tập hợp 10 `place_id`.
4. **CƠ SỞ DỮ LIỆU MONGODB ATLAS THỰC TẾ GỒM ĐÚNG 10 COLLECTIONS:**
   - Tuyệt đối **KHÔNG CÓ bảng `jobs` hay `audit_logs`** (đây là tàn dư từ bản nháp lý thuyết cũ).
   - 10 Collections thực tế:
     1. `users`: Tài khoản quản trị duy nhất (`phong`).
     2. `sessions`: Phiên đăng nhập Admin, lưu `refresh_token_hash` (hạn 7 ngày).
     3. `tours`: Chứa bản nháp tour hiện tại (Embedded 10 POI, `revision`, con trỏ `published_release_id`).
     4. `tour_releases`: Chứa các bản phát hành Snapshot bất biến (`release_id = UUIDv4()`). Khách chỉ đọc từ đây!
     5. `audio_selections`: Ghim liên kết giữa POI + ngôn ngữ + asset_id theo mã băm văn bản `source_text_sha256`.
     6. `assets`: Metadata tệp âm thanh MP3.
     7. `fs.files`: GridFS metadata (30 file MP3 cho 10 POI $\times$ 3 ngôn ngữ: `vi`, `en`, `ko`).
     8. `fs.chunks`: GridFS nhị phân âm thanh (chunk size 255 KB, streaming HTTP 206 Partial Content).
     9. `usage_events`: Sự kiện khách (`visit`, `journey_started`, `audio_played`) có cờ `is_simulated`.
     10. `visitor_presence`: Heartbeat khách online mỗi 30s; có **TTL Index 180s** tự hủy bản ghi.
5. **DỮ LIỆU MÔ PHỎNG KHÔNG TÍNH VÀO THỐNG KÊ THẬT:**
   - Hệ thống hỗ trợ chế độ GPS thật và "Mô phỏng vị trí". Khi bật mô phỏng, sự kiện gửi lên backend được đánh dấu `is_simulated = true`. Backend dashboard tự động loại trừ các sự kiện này khi thống kê.

---

## 2. MA TRẬN TRUY VẾT 1 - 1 (TRACEABILITY MATRIX)

Toàn bộ hệ thống phân tích & thiết kế đã được tinh gọn từ 19 micro Use Cases xuống **chuẩn 8 Use Case (Sea-level)**, khớp **1 - 1** với DFD Mức 1, DFD Mức 2 và Sequence Diagram:

| STT | Use Case (Mã & Tên) | DFD Mức 1 | DFD Mức 2 (Tab Draw.io) | Sequence Diagram | Tác nhân chính | Endpoint API chính | Collection liên quan |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **1** | **UC01: Khám phá khuôn viên qua bản đồ** | **P2.0** | Tab 4 (P2.0 Bản đồ) | **SQ01** | Khách (Visitor) | `GET /api/v1/content/campus`<br>`POST /api/v1/events/guest` | `tour_releases`<br>`usage_events` |
| **2** | **UC02: Nghe thuyết minh audio** | **P4.0** | Tab 6 (P4.0 Audio) | **SQ02** | Khách (Visitor) | `GET /api/v1/audio/{rel}/{id}`<br>`POST /api/v1/events/guest` | `tour_releases`, `fs.files`<br>`fs.chunks`, `usage_events` |
| **3** | **UC03: Định vị GPS & Mô phỏng vị trí** | **P3.0** | Tab 5 (P3.0 GPS) | **SQ03** | Khách (Visitor) | Geolocation API (Browser)<br>Haversine Frontend (<=30m/45m) | `usage_events` |
| **4** | **UC04: Lựa chọn ngôn ngữ (VI / EN / KO)** | **P1.0** | Tab 3 (P1.0 Ngôn ngữ) | **SQ04** | Khách (Visitor) | Client-side i18n & LocalStorage<br>`translations` trong Snapshot | LocalStorage (`sgu_language`) |
| **5** | **UC05: Đăng nhập hệ thống** | **P5.0** | Tab 7 (P5.0 Đăng nhập) | **SQ05** | Admin (`phong`) | `POST /api/v1/auth/login`<br>`POST /api/v1/auth/refresh` | `users`<br>`sessions` |
| **6** | **UC06: Biên tập nội dung & audio địa điểm** | **P6.0** | Tab 8 (P6.0 Biên tập) | **SQ06** | Admin (`phong`) | `PUT /api/v1/admin/campus/places/{id}/audio`<br>`PUT /api/v1/admin/campus` | `tours`, `assets`<br>`audio_selections`, GridFS |
| **7** | **UC07: Quản lý công bố bản thuyết minh** | **P7.0** | Tab 9 (P7.0 Công bố) | **SQ07** | Admin (`phong`) | `POST /api/v1/admin/campus/publish`<br>`POST /api/v1/admin/campus/unpublish` | `tours`<br>`tour_releases`<br>`audio_selections` |
| **8** | **UC08: Xem thống kê báo cáo (Dashboard)** | **P8.0** | Tab 10 (P8.0 Dashboard) | **SQ08** | Admin (`phong`) | `GET /api/v1/admin/dashboard`<br>`POST /api/v1/events/presence` | `usage_events`<br>`visitor_presence`, `users` |

---

## 3. BẢN ĐỒ TÀI LIỆU VÀ CÁC FILE ĐÃ HOÀN THÀNH

Tất cả các tài liệu thiết kế đã được tạo và lưu trực tiếp trong thư mục dự án `docs/`:

1. **`docs/USE_CASE_SPECIFICATIONS.md`**:
   - Đặc tả chi tiết đầy đủ 8 Use Case (UC01 đến UC08).
   - Định dạng bảng chuẩn công nghệ phần mềm: Mã UC, Tên UC, Tác nhân chính, Tác nhân hỗ trợ, Mức độ đặc tả, Tóm tắt, Tiền điều kiện, Sự kiện kích hoạt, Trình tự tương tác (Hành động tác nhân lẻ 1, 3, 5, 7, 9... đối thoại 1-1 với Phản hồi hệ thống chẵn 2, 4, 6, 8, 10...), Luồng thay thế/ngoại lệ, Hậu điều kiện, Liên kết use case.
2. **`docs/dfd-diagrams.drawio`**:
   - Tệp Draw.io chuẩn gồm **10 Tab trang hoàn chỉnh**:
     - *Tab 1:* DFD Mức 0 (Sơ đồ ngữ cảnh).
     - *Tab 2:* DFD Mức 1 (Toàn hệ thống với 8 tiến trình P1.0 đến P8.0, 2 actor ngoài, 10 kho dữ liệu MongoDB).
     - *Tab 3 đến Tab 10:* DFD Mức 2 chi tiết phân rã cho từng tiến trình tương ứng.
3. **`docs/SEQUENCE_DIAGRAMS.md`**:
   - Chứa **8 Biểu đồ tuần tự (SQ01 đến SQ08) tách bạch riêng lẻ**, không bị gộp chung.
   - Viết bằng mã PlantUML chuẩn hóa (có màu sắc, chia phân tầng: UI -> Router -> Service -> Repo -> DB/GridFS) sẵn sàng dán trực tiếp vào Draw.io hoặc render ảnh.
4. **`docs/use-cases.drawio`**:
   - Tệp Draw.io 3 Tab chuẩn hóa toàn diện 8 Use Case:
     - *Tab 1:* Tổng quát 8 Use Case (Overview gồm 2 Actor, 2 phân hệ, quan hệ `<<include>>`, `<<extend>>`).
     - *Tab 2:* Chi tiết Phân hệ Khách tham quan (UC01 đến UC04, luồng presence, geofence trigger).
     - *Tab 3:* Chi tiết Phân hệ Quản trị viên (UC05 đến UC08, ràng buộc xác thực, CAS draft, snapshot publish, dashboard).
5. **`docs/ERD.md` & `docs/erd.drawio`**:
   - Mô hình dữ liệu toàn diện (Entity Relationship Diagram) cho đúng **10 Collections trên MongoDB Atlas + GridFS Bucket** và mô hình tài liệu nhúng **Embedded Place**.
   - Cung cấp: Sơ đồ Mermaid ERD, mã PlantUML Crow's Foot chuẩn, tệp Draw.io XML trực quan hóa 4 phân hệ theo màu sắc, và Từ điển dữ liệu (Data Dictionary) chi tiết từng trường, kiểu dữ liệu, ràng buộc và chỉ mục (TTL, Unique).
6. **Tài liệu nghiệp vụ & kỹ thuật cốt lõi khác:**
   - `README.md`: Hướng dẫn chạy dự án, cấu hình môi trường.
   - `AGENTS.md`: Các chỉ thị, nhật ký nghiệm thu và quyết định kiến trúc của người dùng.
   - `docs/PROJECT_CONTEXT.md`: Bối cảnh dự án, 10 điểm trường SGU, quyết định bỏ offline.
   - `docs/DATA_AND_API.md`: Hợp đồng API chi tiết, schema DTO, cấu trúc MongoDB.
   - `docs/ARCHITECTURE.md`: Kiến trúc phân tầng backend (Router -> Service -> Repository).

---

## 4. CHI TIẾT KỸ THUẬT QUAN TRỌNG CẦN NHỚ

### A. Phân hệ Khách tham quan (Guest / Visitor Journey)
- **Định danh khách:** Trình duyệt tự sinh `visitor_id` (UUIDv4) lưu ở LocalStorage; mỗi lần vào Welcome bấm "Bắt đầu hành trình" sinh mới một `journey_id` (UUIDv4).
- **Đọc dữ liệu bản đồ:** Gọi `GET /api/v1/content/campus`. Backend tìm bản ghi trong `tours` lấy `published_release_id`, sau đó truy vấn `tour_releases` để lấy snapshot. Nếu `published_release_id == null` thì trả về HTTP 404.
- **Tọa độ bản đồ:** 10 POI lưu dạng GeoJSON Point: `location.coordinates = [lng, lat]`. Frontend dùng MapLibre GL kết hợp raster tiles của Stadia Maps (Alidade Smooth).
- **Geofence Engine:** Chạy hoàn toàn ở Frontend. Cứ 5s tính công thức Haversine giữa tọa độ GPS của khách với 10 POI:
  - Bán kính kích hoạt vào vùng (Enter): $d \le 30\text{ m}$ liên tiếp 2 mẫu.
  - Bán kính rời vùng (Exit - Hysteresis): $d > 45\text{ m}$.
- **Audio Streaming:** Gọi `GET /api/v1/audio/{release_id}/{place_id}?language={lang}`. Hỗ trợ HTTP Header `Range: bytes=start-end`. Backend đọc nhị phân từ GridFS và stream với mã phản hồi **HTTP 206 Partial Content**.

### B. Phân hệ Quản trị viên (Admin Content & Releases)
- **Bảo mật:**
  - Password băm bằng **Argon2id**.
  - Đăng nhập thành công trả về 3 HttpOnly cookies: `sgu_access` (JWT 15m), `sgu_refresh` (Session 7d), `sgu_csrf` (Double Submit Cookie HMAC).
  - Mọi thao tác ghi (`POST`, `PUT`, `DELETE`) bắt buộc phải gửi kèm header `X-CSRF-Token`.
- **Cơ chế chống ghi đè CAS Revision (Optimistic Concurrency Control):**
  - Bản nháp tour có trường `revision` (kiểu số nguyên).
  - Khi Admin lưu bản nháp: Gửi `PUT /api/v1/admin/campus` kèm `revision`. Backend chạy `find_one_and_update({_id: "campus-main", revision: req.revision}, {$set: {places: ..., revision: req.revision + 1}})`. Nếu không khớp revision, trả về **HTTP 409 Conflict**.
- **Đóng gói Snapshot bất biến (Publish):**
  - Khi bấm "Công bố", backend sinh `release_id = UUIDv4()`, đóng gói toàn bộ 10 POI cùng các asset_id âm thanh thành bản ghi mới trong `tour_releases`.
  - Cập nhật con trỏ `tours.published_release_id = release_id`.
  - Snapshot trong `tour_releases` là **Insert-only**, tuyệt đối không bao giờ bị sửa đổi.

### C. Phân hệ Thống kê Dashboard & Online Presence
- **Online Presence (Người đang online):**
  - Trình duyệt khách gửi heartbeat `POST /api/v1/events/presence` mỗi 30 giây.
  - Collection `visitor_presence` có **TTL Index 180s** tự động xóa các bản ghi không còn hoạt động.
  - Dashboard đếm `count_documents({last_seen: {$gte: now() - 90s}})` để ra số người đang online tức thời.
- **Thống kê theo ngày ICT:**
  - Lọc collection `usage_events` theo `day == YYYY-MM-DD` và `is_simulated == false`.
  - Đếm: Lượt khách duy nhất (`distinct visitor_id`), Lượt hành trình (`journey_started`), Lượt nghe audio (`audio_played`), và phân bổ lượt nghe cho từng POI (Breakdown).

---

## 5. NHIỆM VỤ TIẾP THEO (NEXT ACTION ITEMS) CHO BẠN

Nếu người dùng yêu cầu tiếp tục phát triển hoặc hoàn thiện báo cáo đồ án, hãy ưu tiên thực hiện các nội dung sau:

### Nhiệm vụ 1: Thiết kế Biểu đồ lớp (UML Class Diagrams)
- Thiết kế biểu đồ lớp phân tích / thiết kế cho backend theo mô hình **Clean Architecture**:
  - Tầng Controller / Router: `ContentRouter`, `AudioRouter`, `EventRouter`, `AuthRouter`, `AdminRouter`.
  - Tầng Service: `ContentService`, `AudioService`, `EventService`, `AuthService`, `DashboardService`.
  - Tầng Repository: `ContentRepo`, `AudioRepo`, `EventRepo`, `UserRepo`, `SessionRepo`.
  - Tầng Model / Schema Pydantic: `Tour`, `Place`, `TourRelease`, `Asset`, `User`, `SessionRecord`, `UsageEvent`, `VisitorPresence`.

### Nhiệm vụ 2: Thiết kế Biểu đồ hoạt động (UML Activity Diagrams)
- Thiết kế Activity Diagram cho các quy trình nghiệp vụ then chốt:
  1. Quy trình Geofence tự động nhận diện và phát audio kèm xử lý chính sách Autoplay của trình duyệt.
  2. Quy trình kiểm duyệt, upload file MP3 nhị phân vào GridFS và lưu bản nháp theo cơ chế CAS Revision.
  3. Quy trình xác thực JWT HttpOnly Cookie, bảo vệ CSRF và cơ chế tự động làm mới token (Silent Token Refresh).

### Nhiệm vụ 3: Thiết kế Biểu đồ triển khai (UML Deployment Diagram)
- Mô hình hóa hạ tầng triển khai thực tế của hệ thống:
  - Thiết bị người dùng (Client Web Browser - Mobile/Desktop).
  - Cloud PaaS: Render Web Service (FastAPI Uvicorn + Vite Static Build).
  - Cloud Database: MongoDB Atlas Replica Set (MongoDB 7.x Database + GridFS Bucket).
  - Dịch vụ ngoài: Stadia Maps Tile Server.

### Nhiệm vụ 4: Hỗ trợ đóng gói báo cáo Word / PDF
- Chuyển đổi các bảng đặc tả, mã PlantUML và Draw.io sang hình ảnh chất lượng cao hoặc định dạng tài liệu nộp cho giảng viên bộ môn Công Nghệ Phần Mềm.

---

> **LỜI NHẮC CUỐI CÙNG:** Luôn giữ phong cách làm việc chính xác, mạch lạc, bám sát code và dữ liệu thực tế của dự án. Không suy diễn vượt ngoài các chỉ dẫn đã nêu!
