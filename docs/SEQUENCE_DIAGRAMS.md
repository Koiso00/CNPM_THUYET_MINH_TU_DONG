# TỔNG HỢP 8 BIỂU ĐỒ TUẦN TỰ (UML SEQUENCE DIAGRAMS)
## HỆ THỐNG WEBSITE THUYẾT MINH TỰ ĐỘNG KHUÔN VIÊN ĐẠI HỌC SÀI GÒN

Hệ thống được thiết kế theo kiến trúc chuẩn (**Client -> API Router -> Service Layer -> Repository Layer -> MongoDB/GridFS Storage**).
Dưới đây là **8 biểu đồ tuần tự độc lập (SQ01 đến SQ08)** tương ứng 1 - 1 với **8 Use Case cốt lõi (UC01 đến UC08)** và **8 tiến trình DFD Mức 1 (P1.0 đến P8.0)**.

---

### SQ01: BIỂU ĐỒ TUẦN TỰ CHO UC01 — KHÁM PHÁ KHUÔN VIÊN QUA BẢN ĐỒ
*Tương ứng: DFD Tiến trình 2.0 (Khám phá khuôn viên qua bản đồ)*

```plantuml
@startuml
autonumber
actor "Khách tham quan\n(Visitor)" as Visitor #E0F2FE
boundary "Giao diện Web\n(React / ExplorePage)" as UI #BAE6FD
control "Content Router\n(FastAPI /content)" as Router #93C5FD
control "Event Router\n(/events/guest)" as EventRouter #93C5FD
entity "Content Service" as Service #60A5FA
entity "Event Repository" as EventRepo #3B82F6
entity "Content Repository" as Repo #3B82F6
database "MongoDB\n(usage_events)" as DB_Events #FEF3C7
database "MongoDB\n(tour_releases)" as DB_Release #FEF3C7

Visitor -> UI: 1. Truy cập /welcome, bấm "Bắt đầu hành trình"
activate UI
UI -> UI: 2. Kiểm tra/sinh visitor_id, journey_id (UUIDv4)
UI -> EventRouter: 3. POST /api/v1/events/guest\n{event_type: "journey_started", visitor_id, journey_id}
activate EventRouter
EventRouter -> EventRepo: 4. record(event_document)
activate EventRepo
EventRepo -> DB_Events: 5. insert_one({journey_started})
EventRepo --> EventRouter: 6. Ghi nhận thành công
deactivate EventRepo
EventRouter --> UI: 7. HTTP 200 {accepted: true}
deactivate EventRouter

UI -> Router: 8. GET /api/v1/content/campus
activate Router
Router -> Service: 9. public()
activate Service
Service -> Repo: 10. get_published_release()
activate Repo
Repo -> DB_Release: 11. find_one({_id: published_release_id})
DB_Release --> Repo: 12. Trả về Snapshot release
Repo --> Service: 13. Release document (10 POI & tọa độ)
deactivate Repo
Service --> Router: 14. DTO CampusResponse
deactivate Service
Router --> UI: 15. HTTP 200 {release_id, places: [10 POI]}
deactivate Router

UI -> UI: 16. Nạp Stadia Maps tiles & vẽ 10 Marker [lng, lat]
UI --> Visitor: 17. Hiển thị bản đồ khuôn viên với 10 điểm
deactivate UI

Visitor -> UI: 18. Chạm (click) vào 1 Marker POI
activate UI
UI -> UI: 19. Căn giữa bản đồ (flyTo) & Trượt mở POI Drawer
UI --> Visitor: 20. Hiển thị tên, mô tả, ảnh & nguồn tư liệu
deactivate UI
@enduml
```

---

### SQ02: BIỂU ĐỒ TUẦN TỰ CHO UC02 — NGHE THUYẾT MINH AUDIO
*Tương ứng: DFD Tiến trình 4.0 (Nghe thuyết minh audio)*

```plantuml
@startuml
autonumber
actor "Khách tham quan\n(Visitor)" as Visitor #E0F2FE
boundary "Trình phát Audio HTML5\n(React / AudioPlayer)" as UI #BAE6FD
control "Audio Router\n(/audio/{rel_id}/{place_id})" as AudioRouter #93C5FD
control "Event Router\n(/events/guest)" as EventRouter #93C5FD
entity "Audio Service" as Service #60A5FA
database "MongoDB\n(tour_releases)" as DB_Release #FEF3C7
database "GridFS\n(fs.files, fs.chunks)" as GridFS #FEF3C7
database "MongoDB\n(usage_events)" as DB_Events #FEF3C7

Visitor -> UI: 1. Nhấn nút "Nghe thuyết minh" trên POI Drawer
activate UI
UI -> AudioRouter: 2. GET /api/v1/audio/{release_id}/{place_id}?language=vi\nHeaders: Range: bytes=0-
activate AudioRouter
AudioRouter -> Service: 3. published_asset(release_id, place_id, "vi")
activate Service
Service -> DB_Release: 4. find_one({_id: release_id})
DB_Release --> Service: 5. Lấy asset_id và GridFS file_id
Service -> GridFS: 6. open_download_stream(gridfs_id)
GridFS --> Service: 7. File metadata & nhị phân chunk 0
Service --> AudioRouter: 8. Stream chunk 0 (audio/mpeg)
deactivate Service
AudioRouter --> UI: 9. HTTP 206 Partial Content\nHeaders: Content-Range: bytes 0-262143/Total
deactivate AudioRouter

UI -> UI: 10. Trình duyệt bắt đầu phát âm thanh ra loa
UI --> Visitor: 11. Phát giọng đọc thuyết minh địa điểm
UI -> EventRouter: 12. POST /api/v1/events/guest\n{event_type: "audio_played", journey_id, place_id}
activate EventRouter
EventRouter -> DB_Events: 13. insert_one({audio_played})
EventRouter --> UI: 14. HTTP 200 {accepted: true}
deactivate EventRouter

Visitor -> UI: 15. Kéo thanh trượt tua thời gian (Seek) đến 01:30
UI -> AudioRouter: 16. GET /api/v1/audio/... (Range: bytes=1048576-)
activate AudioRouter
AudioRouter -> GridFS: 17. Đọc chunk tương ứng tại vị trí offset
GridFS --> AudioRouter: 18. Chunk nhị phân đích
AudioRouter --> UI: 19. HTTP 206 Partial Content
deactivate AudioRouter
UI --> Visitor: 20. Tiếp tục phát thuyết minh mượt mà tại vị trí mới
deactivate UI
@enduml
```

---

### SQ03: BIỂU ĐỒ TUẦN TỰ CHO UC03 — ĐỊNH VỊ GPS VÀ MÔ PHỎNG VỊ TRÍ
*Tương ứng: DFD Tiến trình 3.0 (Định vị GPS & Mô phỏng vị trí)*

```plantuml
@startuml
autonumber
actor "Khách tham quan\n(Visitor)" as Visitor #E0F2FE
boundary "Giao diện Bản đồ\n(React / MapLibre)" as UI #BAE6FD
control "Geofence Engine\n(Frontend Haversine)" as GeoEngine #93C5FD
control "Simulation Controller\n(Frontend)" as SimEngine #93C5FD
boundary "Trình duyệt\n(Geolocation API)" as Browser #93C5FD

alt Chế độ GPS thực tế
    Visitor -> UI: 1. Nhấn nút "Vị trí của tôi" (GPS)
    activate UI
    UI -> Browser: 2. navigator.geolocation.watchPosition({enableHighAccuracy: true})
    activate Browser
    Browser --> UI: 3. Tọa độ thực (lat, lng, accuracy <= 25m)
    deactivate Browser
    UI -> UI: 4. Vẽ Marker vị trí khách (Blue Puck) & vòng tròn sai số
    UI -> GeoEngine: 5. Cập nhật vị trí hiện tại (lat, lng)
    activate GeoEngine
else Chế độ Mô phỏng (Simulation)
    Visitor -> UI: 1a. Bật Switch "Mô phỏng vị trí" & chọn điểm ảo
    UI -> SimEngine: 2a. set_simulated_coords(lat, lng)
    activate SimEngine
    SimEngine --> UI: 3a. Tọa độ mô phỏng & cờ is_simulated=true
    deactivate SimEngine
    UI -> UI: 4a. Vẽ Marker mô phỏng (Màu tím)
    UI -> GeoEngine: 5a. Cập nhật vị trí mô phỏng
end

loop Định kỳ mỗi 5 giây
    GeoEngine -> GeoEngine: 6. Tính khoảng cách Haversine tới 10 POI
    alt Khoảng cách <= 30m qua 2 mẫu liên tiếp (Enter Geofence)
        GeoEngine --> UI: 7. Trigger Enter Geofence (Ví dụ: POI-01)
        UI -> UI: 8. Tự động highlight POI-01 & Mở POI Drawer
        UI --> Visitor: 9. Thông báo chạm điểm & gọi UC02 tự động phát audio
    else Khoảng cách > 45m (Exit Geofence - Hysteresis)
        GeoEngine --> UI: 10. Trigger Exit Geofence (Rời khỏi POI-01)
        UI -> UI: 11. Hủy trạng thái nhận diện vùng của POI-01
    end
end
deactivate GeoEngine
deactivate UI
@enduml
```

---

### SQ04: BIỂU ĐỒ TUẦN TỰ CHO UC04 — LỰA CHỌN NGÔN NGỮ
*Tương ứng: DFD Tiến trình 1.0 (Lựa chọn ngôn ngữ)*

```plantuml
@startuml
autonumber
actor "Khách tham quan\n(Visitor)" as Visitor #E0F2FE
boundary "Giao diện Web\n(React i18n)" as UI #BAE6FD
entity "LocalStorage Trình duyệt\n(sgu_language)" as Storage #60A5FA
entity "Content Store\n(React State / Cache)" as Cache #60A5FA

Visitor -> UI: 1. Bấm chọn lá cờ "English" (en) tại /welcome hoặc /explore
activate UI
UI -> Storage: 2. setItem("sgu_language", "en")
activate Storage
Storage --> UI: 3. Lưu mã ngôn ngữ thành công
deactivate Storage

UI -> UI: 4. Kích hoạt bộ chuyển đổi i18n (Language Change Event)
UI -> Cache: 5. Đọc snapshot release đã nạp trong RAM
activate Cache
Cache --> UI: 6. Snapshot 10 POI
deactivate Cache

UI -> UI: 7. Duyệt mảng 10 POI, trích xuất translations["en"]:\n- Tiêu đề tiếng Anh (Title)\n- Mô tả tiếng Anh (Description)\n- Đường dẫn tư liệu tham khảo
UI -> UI: 8. Đổi toàn bộ nhãn hệ thống (Buttons, Placeholders, Headers) sang tiếng Anh

alt Khách đang mở một POI Drawer
    UI -> UI: 9. Cập nhật nội dung Drawer ngay lập tức sang tiếng Anh
    UI -> UI: 10. Chuyển đường dẫn audio sang asset tiếng Anh (/audio/.../en)
end

UI --> Visitor: 11. Toàn bộ giao diện và âm thanh chuyển sang English nhất quán
deactivate UI
@enduml
```

---

### SQ05: BIỂU ĐỒ TUẦN TỰ CHO UC05 — ĐĂNG NHẬP HỆ THỐNG
*Tương ứng: DFD Tiến trình 5.0 (Đăng nhập hệ thống)*

```plantuml
@startuml
autonumber
actor "Quản trị viên\n(Admin)" as Admin #FCE7F3
boundary "Trang Đăng Nhập\n(LoginPage / React)" as UI #FBCFE8
control "Auth Router\n(FastAPI /auth/login)" as Router #F472B6
entity "Auth Service" as Service #EC4899
entity "Password Hasher\n(Argon2id Threadpool)" as Hasher #DB2777
entity "User Repository" as UserRepo #BE185D
entity "Session Repository" as SessionRepo #BE185D
database "MongoDB\n(users)" as DB_Users #FEF3C7
database "MongoDB\n(sessions)" as DB_Sessions #FEF3C7

Admin -> UI: 1. Nhập username (phong), password; bấm "Đăng nhập"
activate UI
UI -> Router: 2. POST /api/v1/auth/login\nJSON: {username: "phong", password: "..."}
activate Router
Router -> Service: 3. login(username, password)
activate Service
Service -> Service: 4. username_key = username.strip().casefold()
Service -> UserRepo: 5. get_by_username_key(username_key)
activate UserRepo
UserRepo -> DB_Users: 6. find_one({username_key: "phong"})
DB_Users --> UserRepo: 7. User document (password_hash, is_active, role)
UserRepo --> Service: 8. UserRecord
deactivate UserRepo

Service -> Hasher: 9. verify(password, password_hash)
activate Hasher
Hasher --> Service: 10. True (Mật khẩu chính xác)
deactivate Hasher

Service -> Service: 11. Kiểm tra is_active == True & role == "admin"
Service -> Service: 12. Sinh refresh_token (256-bit) & băm SHA-256
Service -> SessionRepo: 13. create_session(user_id, refresh_token_hash, expires_at: 7 ngày)
activate SessionRepo
SessionRepo -> DB_Sessions: 14. insert_one({session_record})
SessionRepo --> Service: 15. SessionRecord
deactivate SessionRepo

Service -> Service: 16. Ký JWT Access Token (HS256, 15m) & Sinh CSRF Token HMAC
Service --> Router: 17. AuthGrant(user, access_token, refresh_token, csrf_token)
deactivate Service

Router -> Router: 18. Thiết lập 3 Set-Cookie Headers:\n- sgu_access: JWT (HttpOnly, 15m)\n- sgu_refresh: Token (HttpOnly, 7d)\n- sgu_csrf: CSRF Token
Router --> UI: 19. HTTP 200 {user: {username, role}, csrf_token}
deactivate Router

UI -> UI: 20. Lưu csrf_token vào RAM, kích hoạt timer Auto-Refresh
UI --> Admin: 21. Chuyển hướng vào trang quản trị /#/admin
deactivate UI
@enduml
```

---

### SQ06: BIỂU ĐỒ TUẦN TỰ CHO UC06 — BIÊN TẬP NỘI DUNG VÀ AUDIO ĐỊA ĐIỂM
*Tương ứng: DFD Tiến trình 6.0 (Biên tập nội dung & audio địa điểm)*

```plantuml
@startuml
autonumber
actor "Quản trị viên\n(Admin)" as Admin #FCE7F3
boundary "Trang Nội Dung\n(ContentPage / React)" as UI #FBCFE8
control "Admin Router\n(/admin/campus)" as Router #F472B6
entity "Content Service" as ContentService #EC4899
entity "Audio Service" as AudioService #EC4899
control "MP3 Validator\n(Header & Frame Analyzer)" as Validator #DB2777
database "MongoDB\n(tours)" as DB_Tours #FEF3C7
database "GridFS\n(fs.files, fs.chunks)" as GridFS #FEF3C7
database "MongoDB\n(assets, audio_selections)" as DB_Assets #FEF3C7

== GIAI ĐOẠN 1: TẢI LÊN FILE ÂM THANH MP3 ==
Admin -> UI: 1. Chọn POI-01, chọn ngôn ngữ "vi", chọn tệp audio.mp3 bấm "Upload"
activate UI
UI -> Router: 2. PUT /admin/campus/places/{place_id}/audio?revision=1&language=vi\nHeaders: Content-Type: audio/mpeg, X-CSRF-Token\nBody: Raw Binary MP3 Data
activate Router
Router -> Validator: 3. Kiểm tra kích thước <= 10MB & giải mã Frame MP3
activate Validator
Validator --> Router: 4. Hợp lệ (Valid MP3 frames)
deactivate Validator

Router -> AudioService: 5. upload(place_id, revision, mp3_bytes, language)
activate AudioService
AudioService -> AudioService: 6. Tính mã băm SHA-256 của file MP3
AudioService -> GridFS: 7. upload_from_stream(filename, mp3_bytes)
GridFS --> AudioService: 8. gridfs_id
AudioService -> DB_Assets: 9. insert asset & upsert audio_selections(place_id, lang, asset_id)
AudioService --> Router: 10. UploadResult(asset_id, size, checksum)
deactivate AudioService
Router --> UI: 11. HTTP 200 {asset_id, status: "ready"}
deactivate Router
UI --> Admin: 12. Hiển thị trạng thái: File audio sẵn sàng, hiện nút nghe thử
deactivate UI

== GIAI ĐOẠN 2: LƯU BẢN NHÁP TOUR (CAS OPTIMISTIC LOCKING) ==
Admin -> UI: 13. Chỉnh sửa mô tả POI-01, bấm "Lưu bản nháp"
activate UI
UI -> UI: 14. Tính SHA-256 văn bản gốc gán vào source_text_sha256
UI -> Router: 15. PUT /api/v1/admin/campus\nHeaders: X-CSRF-Token\nBody: {revision: 1, draft: {places: [10 POI]}}
activate Router
Router -> ContentService: 16. save(payload, admin_user_id)
activate ContentService

ContentService -> ContentService: 17. Kiểm tra giữ nguyên đúng tập hợp 10 place_id
ContentService -> DB_Tours: 18. find_one_and_update(\n  {_id: "campus-main", revision: 1},\n  {$set: {places: payload.places, revision: 2}}\n)
activate DB_Tours
alt Revision khớp (CAS Thành công)
    DB_Tours --> ContentService: 19. Document cập nhật với revision: 2
    ContentService --> Router: 20. SaveResult(revision: 2, status: "saved")
    Router --> UI: 21. HTTP 200 {revision: 2}
    UI --> Admin: 22. Thông báo lưu bản nháp thành công!
else Revision không khớp (Xung đột ghi đè)
    DB_Tours --> ContentService: 23. Null (Revision trong DB đã là 2)
    deactivate DB_Tours
    ContentService --> Router: 24. Ném lỗi StaleRevisionConflictError
    deactivate ContentService
    Router --> UI: 25. HTTP 409 Conflict ("Bản nháp đã bị sửa bởi phiên khác")
    UI --> Admin: 26. Cảnh báo xung đột, yêu cầu tải lại dữ liệu mới!
end
deactivate Router
deactivate UI
@enduml
```

---

### SQ07: BIỂU ĐỒ TUẦN TỰ CHO UC07 — QUẢN LÝ CÔNG BỐ BẢN THUYẾT MINH
*Tương ứng: DFD Tiến trình 7.0 (Quản lý công bố bản thuyết minh)*

```plantuml
@startuml
autonumber
actor "Quản trị viên\n(Admin)" as Admin #FCE7F3
boundary "Trang Quản Trị\n(ContentPage / React)" as UI #FBCFE8
control "Admin Router\n(/admin/campus/publish)" as Router #F472B6
entity "Content Service" as Service #EC4899
database "MongoDB\n(tours)" as DB_Tours #FEF3C7
database "MongoDB\n(audio_selections)" as DB_Selections #FEF3C7
database "MongoDB\n(tour_releases)" as DB_Releases #FEF3C7

Admin -> UI: 1. Nhấn nút "Công bố phiên bản đã lưu"
activate UI
UI -> UI: 2. Kiểm tra Pre-publish: 10 POI đủ tọa độ, audio hợp lệ
UI --> Admin: 3. Hiển thị hộp thoại xác nhận công bố
Admin -> UI: 4. Bấm "Xác nhận công bố"
UI -> Router: 5. POST /api/v1/admin/campus/publish\nHeaders: X-CSRF-Token\nBody: {revision: 2}
activate Router

Router -> Service: 6. publish(revision: 2, admin_user_id)
activate Service
Service -> DB_Tours: 7. find_one({_id: "campus-main"})
DB_Tours --> Service: 8. Tour document (bản nháp 10 POI, revision: 2)

Service -> Service: 9. Kiểm tra CAS: revision gửi lên (2) == tour.revision (2)
Service -> DB_Selections: 10. find({place_id: {$in: [...]}})
DB_Selections --> Service: 11. Danh sách file audio đã ghim theo checksum
Service -> Service: 12. Đóng gói snapshot bất biến:\n- Sinh release_id = UUIDv4()\n- Ghim audio_id vào từng POI\n- Gắn timestamp UTC
Service -> DB_Releases: 13. insert_one(snapshot_document)
activate DB_Releases
DB_Releases --> Service: 14. Ghi nhận snapshot thành công (Insert-only)
deactivate DB_Releases

Service -> DB_Tours: 15. update_one({_id: "campus-main"}, {$set: {published_release_id: release_id}})
activate DB_Tours
DB_Tours --> Service: 16. Cập nhật con trỏ phát hành thành công
deactivate DB_Tours

Service --> Router: 17. PublishResult(release_id, published_at)
deactivate Service
Router --> UI: 18. HTTP 200 {release_id, status: "published"}
deactivate Router

UI --> Admin: 19. Cập nhật giao diện: "Đang công bố phiên bản lúc [Thời gian]"
deactivate UI
note over UI, DB_Releases: Kể từ thời điểm này, mọi khách tham quan (UC01, UC02) gọi API public sẽ đọc trực tiếp snapshot mới vừa được tạo!
@enduml
```

---

### SQ08: BIỂU ĐỒ TUẦN TỰ CHO UC08 — XEM THỐNG KÊ BÁO CÁO DASHBOARD
*Tương ứng: DFD Tiến trình 8.0 (Xem thống kê báo cáo)*

```plantuml
@startuml
autonumber
actor "Khách tham quan\n(Visitor)" as Visitor #E0F2FE
actor "Quản trị viên\n(Admin)" as Admin #FCE7F3
boundary "Giao diện Web\n(Explore / Management)" as UI #FBCFE8
control "Event Router\n(/events/presence)" as EventRouter #93C5FD
control "Admin Router\n(/admin/dashboard)" as AdminRouter #F472B6
entity "Admin Dashboard Service" as Service #EC4899
database "MongoDB\n(visitor_presence)" as DB_Presence #FEF3C7
database "MongoDB\n(usage_events)" as DB_Events #FEF3C7
database "MongoDB\n(users)" as DB_Users #FEF3C7

== GIAI ĐOẠN 1: KHÁCH THAM QUAN GỬI TÍN HIỆU HEARTBEAT (ĐỊNH KỲ 30S) ==
Visitor -> UI: 1. Đang mở trang web tham quan khuôn viên
activate UI
loop Mỗi 30 giây một lần
    UI -> EventRouter: 2. POST /api/v1/events/presence\nBody: {visitor_id: UUID}
    activate EventRouter
    EventRouter -> DB_Presence: 3. update_one(\n  {_id: visitor_id},\n  {$set: {last_seen: now()}},\n  {upsert: true}\n)
    note right of DB_Presence: Collection có TTL Index:\ntự động xóa bản ghi sau 180s
    DB_Presence --> EventRouter: 4. Ghi nhận thời gian hoạt động gần nhất
    EventRouter --> UI: 5. HTTP 204 No Content
    deactivate EventRouter
end
deactivate UI

== GIAI ĐOẠN 2: ADMIN XEM DASHBOARD & LỌC THEO NGÀY ==
Admin -> UI: 6. Truy cập trang Quản trị /#/management, chọn ngày 2026-10-24
activate UI
UI -> AdminRouter: 7. GET /api/v1/admin/dashboard?day=2026-10-24\nHeaders: Cookie sgu_access
activate AdminRouter
AdminRouter -> Service: 8. dashboard(day="2026-10-24")
activate Service

par Tổng hợp người dùng đang Online (Presence)
    Service -> DB_Presence: 9. count_documents({last_seen: {$gte: now() - 90s}})
    DB_Presence --> Service: 10. active_browsers_online (ví dụ: 16)
else Đếm tổng tài khoản
    Service -> DB_Users: 11. count_documents({})
    DB_Users --> Service: 12. total_accounts (ví dụ: 1)
else Tổng hợp sự kiện tham quan theo ngày
    Service -> DB_Events: 13. aggregate([\n  {$match: {day: "2026-10-24", is_simulated: false}},\n  {$group: {_id: "$event_type", count: {$sum: 1}}}\n])
    DB_Events --> Service: 14. guest_visitors, guest_journeys, guest_audio_plays
else Thống kê lượt nghe từng điểm (Breakdown 10 POI)
    Service -> DB_Events: 15. aggregate([\n  {$match: {day: "2026-10-24", event_type: "audio_played"}},\n  {$group: {_id: "$place_id", plays: {$sum: 1}}}\n])
    DB_Events --> Service: 16. Mảng lượt nghe của từng POI trong ngày
end

Service --> AdminRouter: 17. DashboardResponse DTO
deactivate Service
AdminRouter --> UI: 18. HTTP 200 {active_browsers, visitors, journeys, audio_plays, breakdown}
deactivate AdminRouter

UI -> UI: 19. Render 4 thẻ chỉ số và vẽ biểu đồ cột phân tích 10 POI
UI --> Admin: 20. Hiển thị số liệu Dashboard trực quan theo thời gian thực
deactivate UI
@enduml
```
