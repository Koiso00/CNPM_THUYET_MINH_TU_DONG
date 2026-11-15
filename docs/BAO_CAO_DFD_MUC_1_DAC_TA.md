# 4. ĐẶC TẢ CHI TIẾT SƠ ĐỒ LUỒNG DỮ LIỆU DFD MỨC 1

## 4.1. BẢNG TỪ ĐIỂN LUỒNG DỮ LIỆU (DATA FLOW DICTIONARY - 37 DÒNG DỮ LIỆU)

Dưới đây là bảng đặc tả chi tiết 37 luồng dữ liệu luân chuyển giữa các Tác nhân ngoài (Actors), các Tiến trình xử lý (Processes 1.0 – 8.0) và các Kho dữ liệu (Datastores D1 – D10) theo đúng sơ đồ DFD Mức 1:

| STT Dòng | Tên dòng dữ liệu | Nguồn phát (Source) | Đích nhận (Destination) | Cấu trúc / Nội dung dữ liệu | Ý nghĩa nghiệp vụ chi tiết |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **Dòng 1** | Chọn VI/EN/KO | Khách tham quan | 1.0 Ngôn ngữ | `language_code`: `"vi"` \| `"en"` \| `"ko"` | Khách tham quan lựa chọn ngôn ngữ hiển thị trên giao diện hoặc menu Header. |
| **Dòng 2** | Giao diện theo ngôn ngữ | 1.0 Ngôn ngữ | Khách tham quan | `i18n_labels`, `translated_text` | Cập nhật nhãn nút bấm, văn bản hướng dẫn và nội dung theo ngôn ngữ đã chọn. |
| **Dòng 3** | GPS / Mô phỏng | Khách tham quan | 3.0 GPS & Mô phỏng | `gps_toggle: boolean`, `is_simulated: boolean` | Lệnh kích hoạt định vị GPS "Vị trí của tôi" hoặc bật công tắc tour mô phỏng ảo. |
| **Dòng 4** | Lấy tọa độ 10 POI | D4: tour_releases | 3.0 GPS & Mô phỏng | `places[].coordinates: [lng, lat]` | Đọc tọa độ địa lý của 10 điểm tham quan từ bản Snapshot phát hành đang công bố. |
| **Dòng 5** | Vị trí & Báo vào vùng 30m | 3.0 GPS & Mô phỏng | Khách tham quan | `current_location: [lat, lng]`, `poi_alert` | Hiển thị chấm vị trí Puck xanh trên bản đồ và thông báo popup khi đến gần điểm $\le 30$m. |
| **Dòng 6** | Kích hoạt tự phát | 3.0 GPS & Mô phỏng | 4.0 Nghe audio | `auto_play_trigger: { place_id }` | Tín hiệu tự động mở Drawer và phát âm thanh khi Geofence xác nhận khách chạm điểm. |
| **Dòng 7** | Bắt đầu hành trình, Chạm POI | Khách tham quan | 2.0 Khám phá bản đồ | `start_event`, `selected_place_id` | Khách nhấn "Bắt đầu hành trình", chạm marker POI hoặc thao tác kéo rê, thu phóng bản đồ. |
| **Dòng 8** | Đọc 10 POI & Tọa độ | D4: tour_releases | 2.0 Khám phá bản đồ | `release_snapshot: { places[10], release_id }` | Tải dữ liệu toàn bộ khuôn viên: danh sách 10 POI, tọa độ, tiêu đề, bài viết và bản dịch. |
| **Dòng 9** | Bản đồ Stadia & Info POI | 2.0 Khám phá bản đồ | Khách tham quan | `map_tiles`, `poi_drawer_info` | Render bản đồ số khuôn viên Stadia Maps và trượt mở POI Drawer hiển thị bài thuyết minh. |
| **Dòng 10** | Ghi log visit, journey_started | 2.0 Khám phá bản đồ | D9: usage_events | `event: { journey_started, visit, timestamp }` | Ghi nhận nhật ký sự kiện mở ứng dụng, bắt đầu tour và ghé thăm điểm vào CSDL. |
| **Dòng 11** | Lệnh nghe audio | Khách tham quan | 4.0 Nghe audio | `player_control: Play / Pause / Seek / Switch` | Thao tác bấm nút nghe thuyết minh, tạm dừng, kéo thanh tua thời gian hoặc đổi bài. |
| **Dòng 12** | Xác thực release | D4: tour_releases | 4.0 Nghe audio | `valid_asset_id: UUID` | Đối soát phiên bản công bố để lấy đúng mã định danh file audio (`asset_id`) đã được ghim. |
| **Dòng 13** | Metadata MP3 | D7: fs.files | 4.0 Nghe audio | `file_metadata: { length, contentType, md5 }` | Đọc thông tin kỹ thuật tệp MP3 lưu trong GridFS (độ dài bytes, MIME `audio/mpeg`). |
| **Dòng 14** | Stream chunk nhị phân | D8: fs.chunks | 4.0 Nghe audio | `binary_chunks: { data: bytes, n: chunk_index }` | Đọc các khối byte nhị phân MP3 (255 KB/chunk) từ GridFS theo phạm vi byte yêu cầu. |
| **Dòng 15** | Phát âm thanh (HTTP 206) | 4.0 Nghe audio | Khách tham quan | `audio_stream: Partial Content (Range bytes)` | Luồng âm thanh giọng đọc thuyết minh phát mượt mà qua loa hoặc tai nghe thiết bị. |
| **Dòng 16** | Ghi log audio_played | 4.0 Nghe audio | D9: usage_events | `event: { event_type: "audio_played", place_id }` | Ghi nhận sự kiện phát âm thanh thành công vào nhật ký kèm mã ngôn ngữ và thời điểm. |
| **Dòng 17** | Heartbeat 30s | Khách tham quan | D10: visitor_presence| `presence_ping: { visitor_id, last_seen }` | Tín hiệu nhịp tim gửi định kỳ mỗi 30s để duy trì chỉ số người dùng trực tuyến thời gian thực. |
| **Dòng 18** | Username & Password | Quản trị viên | 5.0 Đăng nhập | `credentials: { username: "phong", password }` | Thông tin đăng nhập bí mật của Quản trị viên gửi qua kênh truyền mã hóa an toàn. |
| **Dòng 19** | Xác thực Argon2id | 5.0 Đăng nhập | D1: users | `query_user: { username, password_hash }` | Truy vấn tài khoản và đối soát mã băm mật khẩu bằng thuật toán mật mã học Argon2id. |
| **Dòng 20** | Tạo/Hủy phiên JWT | 5.0 Đăng nhập | D2: sessions | `session_record: { refresh_token_hash, expire }` | Tạo bản ghi phiên (thời hạn 7 ngày) khi đăng nhập, hoặc thu hồi `revoked_at` khi đăng xuất. |
| **Dòng 21** | Cookie HttpOnly & CSRF | 5.0 Đăng nhập | Quản trị viên | `set_cookies: { sgu_access, sgu_refresh, csrf }` | Thiết lập bộ 3 cookie bảo mật chống XSS/CSRF và cấp quyền truy cập không gian Quản trị. |
| **Dòng 22** | Sửa POI, Upload MP3 | Quản trị viên | 6.0 Biên tập | `edit_payload`, `mp3_file_binary` | Admin sửa tiêu đề, bài viết, tải lên file âm thanh MP3 ($\le 10$MB) hoặc bấm Lưu bản nháp. |
| **Dòng 23** | Đọc / Ghi bản nháp CAS | 6.0 Biên tập | D3: tours | `draft_campus: { places[10], revision }` | Đọc dữ liệu nháp và ghi đè nguyên tử CAS Optimistic Locking tăng `revision = rev + 1`. |
| **Dòng 24** | Tạo asset record | 6.0 Biên tập | D6: assets | `asset_metadata: { asset_id, status: "ready" }` | Tạo bản ghi quản lý tài sản âm thanh mới (mã SHA-256, dung lượng, thời lượng phát). |
| **Dòng 25** | Lưu GridFS | 6.0 Biên tập | D7: fs.files | `gridfs_file: { filename, length, uploadDate }` | Ghi luồng nhị phân MP3 phân mảnh vào hệ thống lưu trữ tệp phân tán GridFS. |
| **Dòng 26** | Lưu audio_selections | 6.0 Biên tập | D5: audio_selections| `selection: { place_id, language, asset_id }` | Ghim liên kết file âm thanh mới cho địa điểm và ngôn ngữ tương ứng trong bản nháp. |
| **Dòng 27** | Trạng thái lưu nháp & Revision | 6.0 Biên tập | Quản trị viên | `save_response: { revision, status: "saved" }` | Thông báo kết quả lưu bản nháp thành công kèm số revision mới nhất (hoặc cảnh báo 409). |
| **Dòng 28** | Lệnh công bố / Gỡ công bố | Quản trị viên | 7.0 Công bố | `publish_command: { revision }` | Lệnh đóng gói xuất bản Snapshot ra cộng đồng hoặc gỡ công bố phiên bản khi bảo trì. |
| **Dòng 29** | Đọc bản nháp | D3: tours | 7.0 Công bố | `draft_to_publish: { places[10], revision }` | Lấy toàn bộ nội dung 10 điểm trong bản nháp gần nhất để chuẩn bị đóng gói phát hành. |
| **Dòng 30** | Đọc audio ghim | D5: audio_selections| 7.0 Công bố | `pinned_audios: { place_id, language, asset_id }` | Quét danh sách các tệp âm thanh hợp lệ đã ghim cho 10 điểm theo tiếng Việt/Anh/Hàn. |
| **Dòng 31** | Đóng gói Snapshot | 7.0 Công bố | D4: tour_releases | `immutable_snapshot: { release_id, places[10] }`| Tạo bản ghi Snapshot bất biến vĩnh viễn với mã định danh ngẫu nhiên `release_id` (UUIDv4). |
| **Dòng 32** | Gán published_release_id | 7.0 Công bố | D3: tours | `pointer_update: { published_release_id }` | Chuyển con trỏ phát hành sang bản Snapshot mới (hoặc gán `null` khi gỡ công bố). |
| **Dòng 33** | Kết quả công bố | 7.0 Công bố | Quản trị viên | `publish_result: { release_id, published_at }` | Trả về thông tin phát hành: mã release, ngày giờ xuất bản UTC và trạng thái "published". |
| **Dòng 34** | Xem Dashboard / Chọn ngày | Quản trị viên | 8.0 Dashboard | `dashboard_query: { day: "YYYY-MM-DD" }` | Lệnh truy vấn xem báo cáo ngày hiện tại (ICT) hoặc chọn ngày lịch sử trên Date Picker. |
| **Dòng 35** | Đọc số liệu sự kiện | D9: usage_events | 8.0 Dashboard | `aggregated_events: { visitors, plays, tours }` | Tổng hợp nhật ký sự kiện: đếm khách phân biệt, số lượt mở tour, lượt nghe từng POI. |
| **Dòng 36** | Đọc online 90s | D10: visitor_presence| 8.0 Dashboard | `active_count: { count(last_seen >= now - 90s) }`| Đếm số lượng thiết bị khách đang trực tuyến trong vòng 90 giây gần nhất trên sân trường. |
| **Dòng 37** | Báo cáo thống kê & Biểu đồ | 8.0 Dashboard | Quản trị viên | `dashboard_data: { metrics_cards, chart_data }` | Trả về bộ số liệu hoàn chỉnh để giao diện render 4 thẻ số tổng hợp và biểu đồ cột 10 POI. |

---

## 4.2. ĐẶC TẢ TIẾN TRÌNH XỬ LÝ (PROCESS SPECIFICATIONS - P-SPEC)

---

### TIẾN TRÌNH 1.0: LỰA CHỌN NGÔN NGỮ

#### 1. Thông tin chung
* **Mã tiến trình:** 1.0
* **Tên tiến trình:** Lựa chọn ngôn ngữ
* **Tác nhân tương tác:** Khách tham quan (Visitor)
* **Luồng dữ liệu vào:** Dòng 1 (Chọn VI/EN/KO)
* **Luồng dữ liệu ra:** Dòng 2 (Giao diện theo ngôn ngữ)
* **Kho dữ liệu liên quan:** Không sử dụng CSDL trực tiếp (xử lý phía Client).

#### 2. Ánh xạ mã nguồn (Code Mapping)
* **Frontend:**
  - File: `frontend/src/shared/i18n.ts` $\rightarrow$ hàm `saveLanguage()`, `readLanguage()`, `translate()`.
  - File: `frontend/src/app/App.tsx` $\rightarrow$ hàm `changeLanguage()`.
* **Backend:** Không gọi backend riêng (bản dịch đã nằm trong snapshot nạp từ tiến trình 2.0).

#### 3. Thuật toán xử lý tuần tự từng bước
* **Bước 1:** Tiếp nhận sự kiện click chọn ngôn ngữ (`vi`, `en`, `ko`) từ khách tham quan tại trang Welcome hoặc Menu Header.
* **Bước 2:** Hàm `changeLanguage()` gọi `saveLanguage(next)` để ghi giá trị vào bộ nhớ cục bộ `localStorage.setItem("sgu_language", next)`.
* **Bước 3:** Gán mã ngôn ngữ vào thẻ gốc HTML `document.documentElement.lang = next` để trình duyệt áp dụng đúng kiểu font chữ quốc tế.
* **Bước 4:** Hàm `translate(language, key)` tra cứu bộ từ điển i18n, kích hoạt React re-render chuyển đổi toàn bộ nhãn nút bấm, tiêu đề và chỉ dẫn trên màn hình theo ngôn ngữ đã chọn.

---

### TIẾN TRÌNH 2.0: KHÁM PHÁ BẢN ĐỒ KHUÔN VIÊN

#### 1. Thông tin chung
* **Mã tiến trình:** 2.0
* **Tên tiến trình:** Khám phá bản đồ khuôn viên
* **Tác nhân tương tác:** Khách tham quan (Visitor)
* **Kho dữ liệu liên quan:** D4 (tour_releases), D9 (usage_events)
* **Luồng dữ liệu vào:** Dòng 7 (Bắt đầu hành trình, Chạm POI), Dòng 8 (Đọc 10 POI & Tọa độ từ D4)
* **Luồng dữ liệu ra:** Dòng 9 (Bản đồ Stadia & Info POI gửi Khách), Dòng 10 (Ghi log vào D9)

#### 2. Ánh xạ mã nguồn (Code Mapping)
* **Frontend:**
  - File: `frontend/src/features/guest/session.ts` $\rightarrow$ hàm `GuestSession.start()`.
  - File: `frontend/src/features/tours/ExploreScreen.tsx` $\rightarrow$ hook `useEffect()`.
  - File: `frontend/src/features/tours/ExplorePage.tsx` $\rightarrow$ hàm `selectPlace()`.
  - File: `frontend/src/features/map/CampusMap.tsx` $\rightarrow$ khởi tạo MapLibre GL.
* **API Endpoints:**
  - `POST /api/v1/events/guest`
  - `GET /api/v1/content/campus`
* **Backend:**
  - Router: `backend/app/api/v1/endpoints/events.py` $\rightarrow$ hàm `record_guest_event()`.
    - Service: `EventService.record_guest_event()`.
    - Repository: `EventRepository.record_event()` (Collection: `usage_events`).
  - Router: `backend/app/api/v1/endpoints/content.py` $\rightarrow$ hàm `get_campus_content()`.
    - Service: `ContentService.published()`.
    - Repository: `ContentRepository.get()`, `release()` (Collections: `tours`, `tour_releases`).

#### 3. Thuật toán xử lý tuần tự từng bước
* **Bước 1:** Khách nhấn "Bắt đầu hành trình", `GuestSession.start()` sinh UUID `journey_id`, gửi `POST /api/v1/events/guest` (`event_type: "journey_started"`). Backend ghi nhận vào collection `usage_events`.
* **Bước 2:** `ExploreScreen.tsx` gửi `GET /api/v1/content/campus`. Backend đọc `published_release_id` trong `tours`, truy vấn `tour_releases` trả về HTTP 200 chứa 10 POI và tọa độ (nếu chưa có bản công bố, trả về HTTP 404).
* **Bước 3:** `CampusMap.tsx` nạp raster/vector tiles từ Stadia Maps, vẽ 10 marker POI theo tọa độ `[lng, lat]`.
* **Bước 4:** Khi khách chạm marker, hàm `selectPlace()` kích hoạt hiệu ứng `flyTo` căn giữa vị trí và trượt mở POI Drawer hiển thị bài viết thuyết minh chi tiết theo ngôn ngữ hiện hành.

---

### TIẾN TRÌNH 3.0: ĐỊNH VỊ GPS VÀ MÔ PHỎNG VỊ TRÍ

#### 1. Thông tin chung
* **Mã tiến trình:** 3.0
* **Tên tiến trình:** Định vị GPS và mô phỏng vị trí
* **Tác nhân tương tác:** Khách tham quan (Visitor)
* **Kho dữ liệu liên quan:** D4 (tour_releases)
* **Luồng dữ liệu vào:** Dòng 3 (GPS / Mô phỏng), Dòng 4 (Lấy tọa độ 10 POI từ D4)
* **Luồng dữ liệu ra:** Dòng 5 (Vị trí & Báo vào vùng 30m gửi Khách), Dòng 6 (Kích hoạt tự phát sang P4.0)

#### 2. Ánh xạ mã nguồn (Code Mapping)
* **Frontend:**
  - File: `frontend/src/features/map/useCampusLocation.ts` $\rightarrow$ hàm `startWatching()`, `handleSuccess()`.
  - File: `frontend/src/features/map/geofence.ts` $\rightarrow$ hàm `distanceMeters()`, `evaluateGeofence()`.
  - File: `frontend/src/features/map/LocationControls.tsx` $\rightarrow$ Switch "Mô phỏng vị trí".
* **Backend:** Xử lý tính toán Geofence hoàn toàn ở Client-side để bảo đảm tính riêng tư.

#### 3. Thuật toán xử lý tuần tự từng bước
* **Bước 1:** Khách bật định vị "Vị trí của tôi", `startWatching()` gọi `navigator.geolocation.watchPosition` với tùy chọn `enableHighAccuracy: true`, nhận tọa độ `(lat, lng, accuracy)` và vẽ chấm Puck xanh trên bản đồ.
* **Bước 2:** Định kỳ mỗi 5 giây, hàm `evaluateGeofence()` tính khoảng cách giữa tọa độ khách và 10 POI theo công thức Haversine:
  $$d = 2R \cdot \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \varphi}{2}\right) + \cos \varphi_1 \cos \varphi_2 \sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
* **Bước 3:** Nếu khoảng cách $\le 30$m liên tiếp qua 2 chu kỳ đo, kích hoạt sự kiện `Enter Geofence` $\rightarrow$ hiển thị popup thông báo và gửi tín hiệu kích hoạt tự phát sang tiến trình 4.0.
* **Bước 4:** Khi khoảng cách $> 45$m (vùng trễ Hysteresis chống rung cờ), kích hoạt `Exit Geofence` để xóa trạng thái nhận diện vùng.
* **Bước 5:** Nếu khách bật công tắc mô phỏng, hệ thống sử dụng tọa độ giả lập chạy qua 10 điểm, gắn cờ `is_simulated = true`.

---

### TIẾN TRÌNH 4.0: NGHE THUYẾT MINH AUDIO

#### 1. Thông tin chung
* **Mã tiến trình:** 4.0
* **Tên tiến trình:** Nghe thuyết minh audio
* **Tác nhân tương tác:** Khách tham quan (Visitor)
* **Kho dữ liệu liên quan:** D4 (tour_releases), D7 (fs.files), D8 (fs.chunks), D9 (usage_events), D10 (visitor_presence)
* **Luồng dữ liệu vào:** Dòng 6 (Kích hoạt từ P3.0), Dòng 11 (Lệnh nghe audio), Dòng 12 (Xác thực từ D4), Dòng 13 (Metadata từ D7), Dòng 14 (Stream chunk từ D8)
* **Luồng dữ liệu ra:** Dòng 15 (Phát âm thanh HTTP 206 gửi Khách), Dòng 16 (Ghi log vào D9), Dòng 17 (Heartbeat gửi D10)

#### 2. Ánh xạ mã nguồn (Code Mapping)
* **Frontend:**
  - File: `frontend/src/features/tours/AudioPlayer.tsx` $\rightarrow$ hàm `playFromUserGesture()`, `togglePlay()`, `handleSeekChange()`.
  - File: `frontend/src/features/guest/session.ts` $\rightarrow$ hàm `recordAudioPlay()`, `recordPresence()`.
* **API Endpoints:**
  - `GET /api/v1/audio/{release_id}/{place_id}?language={lang}`
  - `POST /api/v1/events/guest`
  - `POST /api/v1/events/presence`
* **Backend:**
  - Router: `backend/app/api/v1/endpoints/audio.py` $\rightarrow$ hàm `stream_audio()`.
    - Service: `AudioService.response_data()`.
    - Repository: `AudioRepository.open_download_stream()` (Collections: `tour_releases`, `assets`, `fs.files`, `fs.chunks`).
  - Router: `backend/app/api/v1/endpoints/events.py` $\rightarrow$ hàm `record_presence()`.
    - Repository: `EventRepository.record_presence()` (Collection: `visitor_presence`).

#### 3. Thuật toán xử lý tuần tự từng bước
* **Bước 1:** Trình phát gửi request `GET /api/v1/audio/...` kèm header `Range: bytes=0-`.
* **Bước 2:** Backend tra cứu `tour_releases` lấy `asset_id` file MP3 tương ứng với địa điểm và ngôn ngữ.
* **Bước 3:** `AudioRepository` mở stream từ `fs.files` và `fs.chunks`, cắt khối byte theo Range yêu cầu, trả về `HTTP 206 Partial Content` kèm header `Content-Range`.
* **Bước 4:** Trình duyệt nhận các khối byte nhị phân, giải mã và phát ra loa, đồng thời đồng bộ thanh tiến trình phát (progress bar).
* **Bước 5:** Frontend gửi ngầm `POST /api/v1/events/guest` (`audio_played`) lưu vào `usage_events`.
* **Bước 6:** Định kỳ mỗi 30 giây, hàm `recordPresence()` gửi `POST /api/v1/events/presence` cập nhật nhịp tim `last_seen` vào collection `visitor_presence`.

---

### TIẾN TRÌNH 5.0: ĐĂNG NHẬP VÀ XÁC THỰC QUẢN TRỊ

#### 1. Thông tin chung
* **Mã tiến trình:** 5.0
* **Tên tiến trình:** Đăng nhập và xác thực quản trị
* **Tác nhân tương tác:** Quản trị viên (Admin)
* **Kho dữ liệu liên quan:** D1 (users), D2 (sessions)
* **Luồng dữ liệu vào:** Dòng 18 (Username & Password)
* **Luồng dữ liệu ra:** Dòng 19 (Xác thực sang D1), Dòng 20 (Tạo/Hủy phiên sang D2), Dòng 21 (Cookie HttpOnly & CSRF gửi Admin)

#### 2. Ánh xạ mã nguồn (Code Mapping)
* **Frontend:**
  - File: `frontend/src/features/auth/AuthPage.tsx` $\rightarrow$ hàm `handleLogin()`.
  - File: `frontend/src/features/auth/client.ts` $\rightarrow$ hàm `AuthClient.login()`, `refresh()`, `logout()`.
* **API Endpoints:**
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
* **Backend:**
  - Router: `backend/app/api/v1/endpoints/auth.py` $\rightarrow$ hàm `login()`, `refresh()`, `logout()`.
    - Service: `AuthService.authenticate_user()`.
    - Repository: `UserRepository.find_by_username()` (Collection: `users`).
    - Repository: `SessionRepository.create_session()` (Collection: `sessions`).

#### 3. Thuật toán xử lý tuần tự từng bước
* **Bước 1:** Admin nhập tài khoản tại `/#/login`, gửi request `POST /api/v1/auth/login` với `{ username, password }`.
* **Bước 2:** Backend tìm tài khoản trong collection `users`, dùng thuật toán băm Argon2id đối soát mật khẩu. Kiểm tra `is_active == True` và `role == "admin"`. Nếu không khớp, trả về HTTP 401.
* **Bước 3:** Sinh chuỗi ngẫu nhiên 256-bit làm Refresh Token, băm SHA-256 lưu vào collection `sessions` (thời hạn 7 ngày). Ký JWT Access Token (HS256, thời hạn 15 phút) và sinh CSRF token HMAC-SHA256.
* **Bước 4:** Thiết lập 3 Set-Cookie headers bảo mật (`sgu_access`, `sgu_refresh`, `sgu_csrf`) với các cờ `HttpOnly`, `SameSite=Lax`, `Secure`. Trả về HTTP 200 mở quyền vào trang Quản trị.
* **Bước 5:** Tự động gửi `POST /auth/refresh` mỗi 14 phút để gia hạn token. Khi bấm Đăng xuất, gọi `POST /auth/logout` để thu hồi phiên trong `sessions` và xóa cookie.

---

### TIẾN TRÌNH 6.0: BIÊN TẬP NỘI DUNG VÀ AUDIO ĐỊA ĐIỂM

#### 1. Thông tin chung
* **Mã tiến trình:** 6.0
* **Tên tiến trình:** Biên tập nội dung và audio địa điểm
* **Tác nhân tương tác:** Quản trị viên (Admin)
* **Kho dữ liệu liên quan:** D3 (tours), D5 (audio_selections), D6 (assets), D7 (fs.files)
* **Luồng dữ liệu vào:** Dòng 22 (Sửa POI, Upload MP3)
* **Luồng dữ liệu ra:** Dòng 23 (Đọc/Ghi nháp CAS sang D3), Dòng 24 (Tạo asset sang D6), Dòng 25 (Lưu GridFS sang D7), Dòng 26 (Lưu ghim sang D5), Dòng 27 (Trạng thái lưu nháp & Revision gửi Admin)

#### 2. Ánh xạ mã nguồn (Code Mapping)
* **Frontend:**
  - File: `frontend/src/features/content/ContentPage.tsx` $\rightarrow$ hàm `handleSaveDraft()`, `handleAudioUpload()`.
* **API Endpoints:**
  - `GET /api/v1/admin/campus`
  - `PUT /api/v1/admin/campus/places/{place_id}/audio`
  - `PUT /api/v1/admin/campus`
* **Backend:**
  - Router: `backend/app/api/v1/endpoints/admin.py` $\rightarrow$ hàm `campus()`, `upload_audio()`, `save_campus()`.
    - Service: `ContentService.draft()`, `ContentService.save()`.
    - Service: `AudioService.upload()`.
    - Repository: `AudioRepository.upload_mp3()` (Collections: `assets`, `fs.files`, `fs.chunks`, `audio_selections`).
    - Repository: `ContentRepository.save()` (Collection: `tours`).

#### 3. Thuật toán xử lý tuần tự từng bước
* **Bước 1:** Gọi `GET /api/v1/admin/campus` lấy dữ liệu 10 POI và revision của bản nháp `tours`.
* **Bước 2:** Admin chỉnh sửa tiêu đề, mô tả. Hệ thống tự động tính mã SHA-256 của đoạn tiếng Việt gốc gán vào `source_text_sha256` để kiểm soát tính đồng bộ bản dịch.
* **Bước 3:** Khi Admin tải file MP3, gửi `PUT /api/v1/admin/campus/places/{id}/audio`. Backend dùng `mutagen` kiểm tra định dạng và dung lượng $\le 10$MB, lưu nhị phân vào GridFS `fs.files` & `fs.chunks`, tạo metadata trong `assets` và ghim trong `audio_selections`. Trả về HTTP 200.
* **Bước 4:** Admin bấm "Lưu bản nháp", gửi `PUT /api/v1/admin/campus`. Backend thực thi lệnh nguyên tử CAS trên collection `tours`:
  ```python
  find_one_and_update(
      {"_id": "campus-main", "revision": rev},
      {"$set": {"places": places, "revision": rev + 1}},
  )
  ```
  Nếu revision không khớp, trả về HTTP 409 Conflict; nếu khớp, lưu thành công và trả về HTTP 200 kèm revision mới.

---

### TIẾN TRÌNH 7.0: QUẢN LÝ CÔNG BỐ BẢN THUYẾT MINH

#### 1. Thông tin chung
* **Mã tiến trình:** 7.0
* **Tên tiến trình:** Quản lý công bố bản thuyết minh
* **Tác nhân tương tác:** Quản trị viên (Admin)
* **Kho dữ liệu liên quan:** D3 (tours), D4 (tour_releases), D5 (audio_selections)
* **Luồng dữ liệu vào:** Dòng 28 (Lệnh công bố / Gỡ công bố), Dòng 29 (Đọc nháp từ D3), Dòng 30 (Đọc audio ghim từ D5)
* **Luồng dữ liệu ra:** Dòng 31 (Đóng gói Snapshot sang D4), Dòng 32 (Gán con trỏ sang D3), Dòng 33 (Kết quả công bố gửi Admin)

#### 2. Ánh xạ mã nguồn (Code Mapping)
* **Frontend:**
  - File: `frontend/src/features/content/ContentPage.tsx` $\rightarrow$ hàm `handlePublish()`, `handleUnpublish()`.
* **API Endpoints:**
  - `POST /api/v1/admin/campus/publish`
  - `POST /api/v1/admin/campus/unpublish`
* **Backend:**
  - Router: `backend/app/api/v1/endpoints/admin.py` $\rightarrow$ hàm `publish_campus()`, `unpublish_campus()`.
    - Service: `ContentService.publish()`, `ContentService.unpublish()`.
    - Repository: `ContentRepository.publish()`, `unpublish()` (Collections: `tours`, `tour_releases`, `audio_selections`).

#### 3. Thuật toán xử lý tuần tự từng bước
* **Bước 1:** Admin bấm "Công bố phiên bản", popup kiểm tra checklist: đủ 10 POI, có đủ tọa độ GPS hợp lệ.
* **Bước 2:** Gửi `POST /api/v1/admin/campus/publish` kèm số `{ revision }` và CSRF token.
* **Bước 3:** Backend đối soát CAS `tour.revision == rev`, quét danh sách file audio đã ghim từ `audio_selections`, sinh `release_id = str(uuid4())`, đóng gói toàn bộ 10 POI thành một Snapshot bất biến và ghi vào collection `tour_releases` (Insert-only, không bao giờ sửa đổi).
* **Bước 4:** Cập nhật con trỏ phát hành trong collection `tours`: `{"$set": {"published_release_id": release_id}}`. Khách tham quan lập tức thấy nội dung mới tại `/#/explore`.
* **Bước 5:** Nếu bấm "Gỡ công bố", gọi `POST /api/v1/admin/campus/unpublish`, backend cập nhật `published_release_id = None` trong collection `tours`.

---

### TIẾN TRÌNH 8.0: XEM THỐNG KÊ BÁO CÁO (DASHBOARD)

#### 1. Thông tin chung
* **Mã tiến trình:** 8.0
* **Tên tiến trình:** Xem thống kê báo cáo (Dashboard)
* **Tác nhân tương tác:** Quản trị viên (Admin)
* **Kho dữ liệu liên quan:** D9 (usage_events), D10 (visitor_presence)
* **Luồng dữ liệu vào:** Dòng 34 (Xem Dashboard / Chọn ngày), Dòng 35 (Đọc sự kiện từ D9), Dòng 36 (Đọc online 90s từ D10)
* **Luồng dữ liệu ra:** Dòng 37 (Báo cáo thống kê & Biểu đồ gửi Admin)

#### 2. Ánh xạ mã nguồn (Code Mapping)
* **Frontend:**
  - File: `frontend/src/features/admin/ManagementPage.tsx` $\rightarrow$ hook `useEffect()`, nút "Làm mới số liệu".
* **API Endpoint:**
  - `GET /api/v1/admin/dashboard?day={statsDay}`
* **Backend:**
  - Router: `backend/app/api/v1/endpoints/admin.py` $\rightarrow$ hàm `dashboard()`.
    - Service: `AdminService.dashboard()`.
    - Repository: `AdminRepository.counts()`, `AdminRepository.guest_counts()` (Collections: `users`, `assets`, `usage_events`).
    - Repository: `EventRepository.online_visitors()` (Collection: `visitor_presence`).

#### 3. Thuật toán xử lý tuần tự từng bước
* **Bước 1:** Admin truy cập `/#/management` hoặc bấm nút "Làm mới số liệu" (hoặc timer 30s ngầm). Gửi request `GET /api/v1/admin/dashboard?day=YYYY-MM-DD` kèm HttpOnly Cookie.
* **Bước 2:** Backend xác thực cookie JWT đảm bảo quyền `admin`. Quy đổi ngày thống kê theo giờ Việt Nam ICT (`Asia/Ho_Chi_Minh`, UTC+7).
* **Bước 3:** `EventRepository.online_visitors()` đếm số bản ghi trong `visitor_presence` có nhịp tim `last_seen >= now - 90s` (lượng khách online thời gian thực).
* **Bước 4:** `AdminRepository.guest_counts(day)` truy vấn collection `usage_events`:
  - `guest_visitors`: Đếm số distinct `visitor_id` trong ngày.
  - `guest_journeys`: Đếm số sự kiện `journey_started`.
  - `guest_audio_plays`: Đếm số sự kiện `audio_played`.
  - `guest_audio_by_place`: Chạy **MongoDB Aggregation Pipeline** gom nhóm theo `place_id`, đếm tổng lượt nghe và sắp xếp giảm dần.
* **Bước 5:** Backend trả về gói JSON `HTTP 200`. Frontend cập nhật 4 thẻ chỉ số và vẽ biểu đồ phân bổ lượt nghe của 10 POI trong ngày cho Admin theo dõi.
