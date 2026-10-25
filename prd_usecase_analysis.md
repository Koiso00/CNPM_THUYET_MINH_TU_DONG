# Phân tích PRD Use Cases vs Code đã triển khai

> Phân tích file [PRD – Thuyết minh tự động đa ngôn ngữ.docx](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/PRD%20%E2%80%93%20Thuy%E1%BA%BFt%20minh%20t%E1%BB%B1%20%C4%91%E1%BB%99ng%20%C4%91a%20ng%C3%B4n%20ng%E1%BB%AF.docx) so với code trong workspace, ngày 25/10/2026.

## Tổng quan nhanh

| UC | Tên | Trạng thái | Ghi chú |
|:---|:-----|:----------|:--------|
| UC01 | Khởi tạo & Cấp quyền | ✅ Đã có | Welcome screen + GPS opt-in + journey start |
| UC02 | Tương tác Bản đồ | ✅ Đã có | Stadia Maps + POI markers + vị trí hiện tại |
| UC03 | Thuyết minh tự động (Geofencing) | ⚠️ Có nhưng chưa nghiệm thu | Geofence tracker + auto-play, chưa confirm Safari/ngưỡng |
| UC04 | Xem & Nghe thủ công | ✅ Đã có | Chọn POI → xem mô tả + phát audio thủ công |
| UC05 | Quét mã QR dự phòng | ❌ Chưa có | Không có code QR scanner/camera ở frontend |
| UC06 | Chuyển đổi ngôn ngữ | ✅ Đã có (mở rộng) | VI/EN/KO thay vì chỉ VI/EN như PRD |
| UC07 | Đăng nhập Admin CMS | ✅ Đã có | JWT + HttpOnly cookie + CSRF |
| UC08 | Quản lý Cơ sở (Campus) | ⚠️ Một phần | Chỉ có 1 campus cố định, không CRUD nhiều cơ sở |
| UC09 | Quản lý POI | ✅ Đã có | Admin thêm/sửa/xóa POI + tọa độ + bán kính |
| UC10 | Quản lý Nội dung đa ngôn ngữ | ✅ Đã có | Biên tập nội dung + audio theo VI/EN/KO |
| UC11 | Xuất mã QR | ❌ Chưa có | Không có chức năng sinh/xuất QR |
| UC12 | Lưu nháp & Công bố | ✅ Đã có | Draft → save → publish/unpublish + revision |
| UC13 | Dashboard thống kê | ✅ Đã có | visit / journey / audio theo ngày ICT + phân rã POI |
| UC14 | Quản lý tài khoản | ✅ Đã có | Danh sách + đổi vai trò + khóa/mở khóa + ràng buộc |

---

## Chi tiết từng Use Case

### ✅ UC01 — Khởi tạo ứng dụng & Cấp quyền

| Yêu cầu PRD | Code | File tham chiếu |
|:------------|:-----|:----------------|
| Màn hình Welcome + nút "Bắt đầu" | ✅ [`GuestWelcome.tsx`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/guest/GuestWelcome.tsx) | Component full |
| Mở khóa AudioContext (Autoplay Policy) | ⚠️ Gọi `prepareForAutomaticPlayback` khi bật GPS/mô phỏng; **không gọi AudioContext ngay lúc bấm "Bắt đầu"** | [`ExplorePage.tsx:213-218`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/tours/ExplorePage.tsx#L213-L218) |
| Xin quyền GPS (native dialog) | ✅ GPS opt-in qua [`useCampusLocation.ts`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/map/useCampusLocation.ts) | Dùng `navigator.geolocation` |
| Tải danh sách POI vào LocalStorage | ⚠️ Tải qua API `GET /content/campus` nhưng lưu vào React state, **không dùng LocalStorage** | [`ExploreScreen.tsx:28`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/tours/ExploreScreen.tsx#L28) |
| Ghi nhận visit + journey | ✅ `session.recordVisit()` và `session.startJourney()` | [`GuestWelcome.tsx:10,18`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/guest/GuestWelcome.tsx#L10-L18) |
| Từ chối GPS → gợi ý QR (A1) | ❌ Không chuyển sang QR (UC05 chưa có) | — |
| Thông báo lỗi mạng/server (E1) | ✅ Có error handling | [`ExploreScreen.tsx:33-38`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/tours/ExploreScreen.tsx#L33-L38) |

> **Chênh lệch:** AudioContext unlock bị trì hoãn so với PRD (gọi khi bật GPS, không phải lúc bấm "Bắt đầu"). LocalStorage không được sử dụng, thay bằng in-memory state.

---

### ✅ UC02 — Tương tác Bản đồ

| Yêu cầu PRD | Code | File |
|:------------|:-----|:-----|
| Bản đồ Cơ sở chính SGU | ✅ Stadia Maps + MapLibre GL | [`CampusMap.tsx`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/map/CampusMap.tsx) |
| Vị trí hiện tại (chấm xanh) | ✅ GPS marker trên bản đồ | [`CampusMap.tsx`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/map/CampusMap.tsx) |
| POI markers với icon trạng thái | ⚠️ Có markers nhưng **không rõ 3 trạng thái** (Chưa xem / Đang xem / Đã xem) — chỉ có selected/unselected | [`campusPoiLocations.ts`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/map/campusPoiLocations.ts) |
| Phóng to/thu nhỏ/kéo bản đồ | ✅ MapLibre native | — |
| Chạm POI → mở chi tiết (UC04) | ✅ `onSelectPlace` callback | [`ExplorePage.tsx:102-112`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/tours/ExplorePage.tsx#L102-L112) |
| Cơ sở "Sắp ra mắt" (A2) | ❌ Không có UI chọn cơ sở | — |
| Dùng dữ liệu cũ khi mất mạng (E1) | ❌ Không có offline fallback | — |

> **Chênh lệch:** Thiếu 3 trạng thái icon POI (Chưa xem/Đang xem/Đã xem). Không có UI chọn giữa nhiều cơ sở.

---

### ⚠️ UC03 — Nghe thuyết minh tự động (Geofencing)

| Yêu cầu PRD | Code | File |
|:------------|:-----|:-----|
| Theo dõi GPS mỗi 1–3 giây | ✅ `watchPosition` + throttle 5s trong geofence | [`geofence.ts:16`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/map/geofence.ts#L16) |
| Haversine tính khoảng cách client-side | ✅ `distanceMeters()` | [`geofence.ts:28-43`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/map/geofence.ts#L28-L43) |
| d ≤ R → hiển thị popup + phát audio | ✅ `GeofenceTracker.ingest()` → `handlePlaceDetected` → auto-play | [`ExplorePage.tsx:113-117`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/tours/ExplorePage.tsx#L113-L117) |
| Visited_POIs chống phát lặp | ⚠️ **Không có mảng Visited_POIs rõ ràng** — GeofenceTracker dùng `activePlaceId` single, chỉ phát lại khi đổi POI | [`geofence.ts:46`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/map/geofence.ts#L46) |
| Reset khi d > R + 15m (A2) | ✅ `exitRadiusMeters = 45` (30 + 15) → clear activePlaceId | [`geofence.ts:12-13`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/map/geofence.ts#L12-L13) |
| Nhiều POI cùng lúc → gần nhất trước (A3) | ✅ Sort by distance | [`geofence.ts:106-108`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/map/geofence.ts#L106-L108) |
| Popup + rung thiết bị | ⚠️ Popup có, **rung thiết bị (Vibration API) không có** | — |
| Xếp hàng POI → phát tuần tự (A3.2) | ❌ Không có queue | — |
| Tự phát trên Safari nghiệm thu | ❌ Chưa nghiệm thu, xác nhận tại AGENTS.md | — |
| Confirmation 2 lần trước khi phát | ✅ `confirmations: 2` | [`geofence.ts:17`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/map/geofence.ts#L17) |

> **Chênh lệch:** Thiếu Visited_POIs dạng mảng (chỉ track 1 activePlaceId). Không rung thiết bị. Không xếp hàng nhiều POI.

---

### ✅ UC04 — Xem & Nghe thủ công

| Yêu cầu PRD | Code | File |
|:------------|:-----|:-----|
| Chọn POI → mở drawer/detail | ✅ `place-detail` aside | [`ExplorePage.tsx:223-276`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/tours/ExplorePage.tsx#L223-L276) |
| Xem album ảnh minh họa | ⚠️ **Chỉ có 1 ảnh tham khảo chung**, không có album ảnh riêng từng POI | [`ExplorePage.tsx:225-232`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/tours/ExplorePage.tsx#L225-L232) |
| Bài viết mô tả theo ngôn ngữ | ✅ `localized(selected).description` | [`ExplorePage.tsx:252`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/tours/ExplorePage.tsx#L252) |
| Play / Pause / Seek | ✅ [`AudioPlayer.tsx`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/tours/AudioPlayer.tsx) | 3668 bytes |
| Đóng drawer → dừng audio (A1) | ✅ Dismiss button reset selectedId | [`ExplorePage.tsx:237-241`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/tours/ExplorePage.tsx#L237-L241) |
| Chỉ phát 1 audio tại 1 thời điểm (A2) | ✅ Single AudioPlayer ref | — |
| POI chưa có audio → ẩn nút (E2) | ✅ `audioLanguage(selected)` check + thông báo | [`ExplorePage.tsx:271-275`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/tours/ExplorePage.tsx#L271-L275) |

> **Chênh lệch:** Thiếu album ảnh riêng từng POI — chỉ có ảnh tham khảo chung.

---

### ❌ UC05 — Quét mã QR dự phòng

**Hoàn toàn chưa triển khai.** Không có:
- Camera scanner (jsQR, html5-qrcode, ZXing...)
- Luồng mở camera → nhận diện QR → trích xuất POI ID
- Xin quyền camera
- Xử lý lỗi QR không hợp lệ

> Theo AGENTS.md: *"QR là bước phát triển kế tiếp sau dashboard và đa ngôn ngữ"*. PRD cũng ghi nhận phần "Cập nhật phạm vi demo hiện hành" xác nhận QR chưa triển khai.

---

### ✅ UC06 — Chuyển đổi ngôn ngữ

| Yêu cầu PRD | Code | File |
|:------------|:-----|:-----|
| Bộ chọn ngôn ngữ VI ↔ EN | ✅ **Mở rộng thêm KO** (3 ngôn ngữ) | [`App.tsx:196-218`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/app/App.tsx#L196-L218) |
| Render lại giao diện | ✅ `translate(language, key)` toàn bộ | [`i18n.ts`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/shared/i18n.ts) |
| Cập nhật bài viết mô tả | ✅ `localized(place)` + translations | [`ExplorePage.tsx:78-84`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/tours/ExplorePage.tsx#L78-L84) |
| Đổi audio theo ngôn ngữ | ✅ `audioLanguage(place)` + query param | [`ExplorePage.tsx:85-91`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/tours/ExplorePage.tsx#L85-L91) |
| Lưu lựa chọn trên thiết bị | ✅ `saveLanguage()` lưu vào localStorage | [`App.tsx:78`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/app/App.tsx#L78) |
| Đổi ngôn ngữ khi audio đang phát → dừng + chuyển (A2) | ⚠️ **Chưa rõ** có dừng audio đang phát khi đổi ngôn ngữ không | — |
| Fallback tiếng Việt khi chưa có bản dịch (E1) | ✅ `localized()` fallback về place gốc (VI) | [`ExplorePage.tsx:80-84`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/tours/ExplorePage.tsx#L80-L84) |

> **Chênh lệch nhỏ:** PRD chỉ đề cập VI ↔ EN, code thực tế hỗ trợ thêm KO (vượt yêu cầu). Hành vi đổi ngôn ngữ khi audio đang phát cần kiểm tra thêm.

---

### ✅ UC07 — Đăng nhập Admin CMS

| Yêu cầu PRD | Code | File |
|:------------|:-----|:-----|
| Form tài khoản + mật khẩu | ✅ | [`AuthPage.tsx`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/auth/AuthPage.tsx) |
| Xác thực → tạo phiên | ✅ JWT HttpOnly cookie | [`auth.py`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/backend/app/api/v1/endpoints/auth.py) |
| Sai → thông báo lỗi (E1) | ✅ | — |
| Trường bắt buộc (E2) | ✅ Client-side validation | — |
| Khóa sau 5 lần sai (E3) | ❌ **Chưa triển khai rate-limit đăng nhập** | — |
| Phiên hết hạn → đăng nhập lại (A1) | ✅ 15 phút token + gia hạn + 7 ngày hard limit | — |
| Mật khẩu hash | ✅ bcrypt | — |

> **Chênh lệch:** Thiếu rate-limit 5 lần đăng nhập sai.

---

### ⚠️ UC08 — Quản lý Cơ sở (Campus)

| Yêu cầu PRD | Code |
|:------------|:-----|
| Danh sách cơ sở | ❌ Chỉ có 1 campus cố định |
| Thêm/sửa/xóa cơ sở | ❌ Không có CRUD campus |
| Trạng thái Hoạt động / Sắp ra mắt | ❌ Không có |
| "Sắp ra mắt" hiển thị cho khách | ❌ Không có |

> **Chênh lệch lớn:** PRD mô tả quản lý nhiều cơ sở (Cơ sở chính, Cơ sở 1, 2, KTX...). Code hiện chỉ có 1 campus duy nhất (Cơ sở chính), ghi cứng. **Tuy nhiên**, PRD cũng ghi "MVP tập trung Cơ sở chính", và demo hiện tại đúng phạm vi MVP.

---

### ✅ UC09 — Quản lý POI

| Yêu cầu PRD | Code | File |
|:------------|:-----|:-----|
| Danh sách POI | ✅ | [`ContentPage.tsx`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/content/ContentPage.tsx) |
| Thêm/sửa/xóa POI | ✅ Save draft + add/remove places | [`admin.py`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/backend/app/api/v1/endpoints/admin.py) |
| Nhập tọa độ | ✅ | ContentPage |
| Kéo-thả Marker trên bản đồ | ⚠️ Không rõ, có thể chỉ nhập tọa độ thủ công | — |
| Cấu hình bán kính Geofence | ✅ Có trong draft schema | — |
| Lọc theo cơ sở | ❌ Chỉ 1 cơ sở | — |
| Bán kính 10–30m (BR09-1) | ⚠️ Code dùng enterRadius=30, exitRadius=45 cố định, **không cho Admin cấu hình per-POI** | [`geofence.ts:11-13`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/map/geofence.ts#L11-L13) |

> **Chênh lệch:** Bán kính geofence cố định 30/45m cho tất cả POI, không cấu hình riêng từng POI. Kéo-thả Marker trên bản đồ chưa xác nhận.

---

### ✅ UC10 — Quản lý Nội dung đa ngôn ngữ

| Yêu cầu PRD | Code | File |
|:------------|:-----|:-----|
| Nhập mô tả VI/EN | ✅ + thêm KO | ContentPage |
| Tải lên bộ ảnh minh họa | ❌ **Không có upload ảnh** | — |
| Tải lên MP3 theo ngôn ngữ | ✅ `PUT /admin/campus/places/{id}/audio?language=vi|en|ko` | [`admin.py:87-102`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/backend/app/api/v1/endpoints/admin.py#L87-L102) |
| Nghe thử audio | ✅ `GET /admin/audio/{asset_id}` | [`admin.py:75-84`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/backend/app/api/v1/endpoints/admin.py#L75-L84) |
| Giới hạn 10MB audio | ✅ | [`admin.py:99`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/backend/app/api/v1/endpoints/admin.py#L99) |
| Kiểm tra định dạng | ✅ `audio/mpeg` | [`admin.py:95-96`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/backend/app/api/v1/endpoints/admin.py#L95-L96) |

> **Chênh lệch:** Thiếu upload ảnh minh họa cho POI.

---

### ❌ UC11 — Xuất mã QR

**Hoàn toàn chưa triển khai.** Không có:
- Sinh mã QR từ POI ID
- Xem trước mã QR
- Xuất PNG/SVG
- Chọn nhiều POI → tải zip

> Đây là yêu cầu đi cùng UC05 (Quét QR), cả hai đều nằm trong kế hoạch phát triển kế tiếp.

---

### ✅ UC12 — Lưu nháp và Công bố nội dung

| Yêu cầu PRD | Code | File |
|:------------|:-----|:-----|
| Lưu nháp (save draft) | ✅ `PUT /admin/campus` | [`admin.py:27-31`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/backend/app/api/v1/endpoints/admin.py#L27-L31) |
| Công bố (publish) | ✅ `POST /admin/campus/publish` | [`admin.py:34-38`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/backend/app/api/v1/endpoints/admin.py#L34-L38) |
| Gỡ công bố (unpublish) | ✅ `POST /admin/campus/unpublish` | [`admin.py:41-43`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/backend/app/api/v1/endpoints/admin.py#L41-L43) |
| Revision kiểm tra xung đột | ✅ payload có `revision` | — |
| Release bất biến, audio ghim | ✅ snapshot design | — |
| Khách chỉ đọc release công bố | ✅ `GET /content/campus` → public only | [`content.py:10-12`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/backend/app/api/v1/endpoints/content.py#L10-L12) |
| Checksum bản dịch khớp nguồn VI | ✅ Theo AGENTS.md và test reports | — |

> **Đầy đủ.** UC12 được triển khai tốt nhất trong tất cả các use case.

---

### ✅ UC13 — Dashboard thống kê

| Yêu cầu PRD | Code | File |
|:------------|:-----|:-----|
| Chọn ngày ICT | ✅ `GET /admin/dashboard?day=...` | [`admin.py:62-64`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/backend/app/api/v1/endpoints/admin.py#L62-L64) |
| Tổng mã khách đã truy cập | ✅ visit events | — |
| Số hành trình bắt đầu | ✅ journey_started events | — |
| Số lượt audio đã phát | ✅ audio_played events | — |
| Phân rã lượt audio theo POI | ✅ | — |
| Chống gửi trùng event_id | ✅ `event_id` field | [`events.py`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/backend/app/api/v1/endpoints/events.py) |
| GPS mô phỏng không tính | ✅ Theo AGENTS.md | [`ExplorePage.tsx:265-267`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/frontend/src/features/tours/ExplorePage.tsx#L265-L267) |
| Ngày không hợp lệ → lỗi (E1) | ✅ FastAPI validation | — |

> **Đầy đủ.** Người dùng đã xác nhận hoạt động trên bản deploy.

---

### ✅ UC14 — Quản lý tài khoản

| Yêu cầu PRD | Code | File |
|:------------|:-----|:-----|
| Danh sách có phân trang | ✅ `offset/limit` | [`admin.py:46-52`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/backend/app/api/v1/endpoints/admin.py#L46-L52) |
| Đổi vai trò | ✅ `PUT /admin/users/{id}` | [`admin.py:55-59`](file:///c:/Users/user/Desktop/CNPM_THUYET_MINH_TU_DONG/backend/app/api/v1/endpoints/admin.py#L55-L59) |
| Khóa/mở khóa | ✅ | — |
| Không tự đổi mình (E1) | ✅ principal check | — |
| Bảo vệ Admin đang hoạt động (E2) | ✅ | — |
| Không trả password hash (BR14-3) | ✅ | — |
| CSRF (E3) | ✅ Global CSRF middleware | — |

> **Đầy đủ.**

---

## Tổng hợp chênh lệch

### ❌ Hoàn toàn thiếu (2 UC)

| UC | Tính năng | Mức ưu tiên |
|:---|:---------|:-----------|
| **UC05** | Quét mã QR dự phòng (camera + jsQR) | 🔴 QR là bước kế tiếp theo AGENTS.md |
| **UC11** | Xuất mã QR cho POI (sinh PNG/SVG) | 🔴 Đi cùng UC05 |

### ⚠️ Có nhưng thiếu chi tiết (5 UC)

| UC | Chi tiết thiếu |
|:---|:--------------|
| **UC01** | AudioContext không mở ngay khi bấm "Bắt đầu"; không dùng LocalStorage |
| **UC02** | Thiếu 3 trạng thái icon POI; không có chọn cơ sở "Sắp ra mắt" |
| **UC03** | Thiếu rung thiết bị, queue nhiều POI, Visited_POIs mảng; chưa nghiệm thu Safari |
| **UC07** | Thiếu rate-limit 5 lần sai |
| **UC08** | Chỉ 1 campus, không CRUD — đúng phạm vi MVP |
| **UC09** | Bán kính geofence cố định, không cấu hình per-POI |
| **UC10** | Thiếu upload ảnh minh họa |

### ✅ Đầy đủ hoặc vượt yêu cầu (7 UC)

UC04, UC06 (thêm KO), UC12, UC13, UC14 triển khai tốt. UC06 vượt PRD (3 ngôn ngữ thay vì 2).

---

## Khuyến nghị ưu tiên

1. **UC05 + UC11 (QR)** — đã được xác nhận là bước kế tiếp
2. **UC03 nghiệm thu** — Safari auto-play và ngưỡng geofence thực địa
3. **UC10 upload ảnh** — để có album ảnh riêng từng POI như PRD
4. **UC02 trạng thái icon** — thêm Chưa xem/Đang xem/Đã xem
5. **UC01 AudioContext** — mở khóa ngay khi bấm "Bắt đầu"
6. **UC07 rate-limit** — chống brute-force đăng nhập
7. **UC09 bán kính cấu hình** — per-POI thay vì cố định

> [!NOTE]
> PRD phần "Cập nhật phạm vi demo hiện hành" (dòng 91-96) đã ghi nhận QR, camera, offline, AI, dịch tự động và TTS tự động **không phải chức năng đã triển khai**. Các chênh lệch trên phần lớn phù hợp với phạm vi demo đã chốt.
