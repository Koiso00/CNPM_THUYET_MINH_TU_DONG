# Kiến trúc

Trạng thái: **thiết kế mục tiêu**; xem README để phân biệt phần đã chạy.

## Phần demo đã triển khai ngày 22/10/2026

Thanh điều hướng giữa hai trang làm việc dùng chung `shared/WorkspaceNav.tsx`:
`#/admin` hiển thị **Nội dung** (audio), `#/management` hiển thị **Quản trị** (grid).
Hai trang chỉ cho Admin. `features/content/ContentPage.tsx` quản lý POI/văn bản/audio;
`features/admin/ManagementPage.tsx` chỉ đọc dashboard/users và cập nhật user qua API Admin.
`#/creator` là khu vực riêng cho Creator. Creator lưu/gửi bản đề xuất toàn tour riêng; Admin
xem, trả chỉnh sửa hoặc duyệt rồi áp dụng vào nháp trước khi công bố riêng.
`content_submissions` giữ owner, bản nháp, revision và trạng thái duyệt. Các thao tác dùng CAS;
nội dung và đề xuất đọc primary để tránh dùng trạng thái cũ ngay sau khi ghi.
Trang Nội dung dùng chung trạng thái bận cho thao tác áp dụng proposal và sửa/công bố;
không cho áp dụng khi có thay đổi chưa lưu, không cho lưu/công bố trong lúc đang áp dụng.
RBAC backend chặn User khỏi cả hai khu vực và Creator khỏi trang Admin.

Router → service → repository vẫn là ranh giới bắt buộc. Demo có một tour `campus-main`:
`tours` lưu bản nháp có thứ tự POI, nội dung tiếng Việt, nguồn và vị trí nullable; chưa tách
`pois`/`localizations` thành collection riêng. `tour_releases` là snapshot insert-only;
tour giữ con trỏ tới release đang công bố. Lưu/công bố/gỡ dùng revision CAS trên document tour.
Nếu có thay đổi đồng thời, trả 409; release tạo trước CAS thất bại không được trỏ tới nên vẫn riêng tư.
Chưa có tác vụ dọn release không tham chiếu; không dùng transaction nhiều document.

`assets` lưu checksum/text checksum/GridFS ID. `audio_selections` chọn asset theo checksum
văn bản cho lần công bố tiếp theo. Snapshot ghim asset ID cụ thể; sửa chữ hoặc nhập MP3 mới
không thay snapshot cũ. API audio chỉ cho nghe qua release đang công bố; biết asset ID không
cho quyền truy cập. Admin có API nghe thử riêng, upload ≤10 MiB và kiểm tra khung MP3.
Trình phát duy nhất được dừng khi đổi địa điểm hoặc rời trang; không tự phát khi tải trang.

Admin API dùng RBAC/CSRF hiện có. Khóa user thu hồi phiên; mở khóa không hồi sinh phiên cũ.
Admin đang hoạt động được bảo vệ khỏi khóa/hạ quyền trên web. Dashboard dùng count database
và snapshot hiện hành; chưa có thống kê sự kiện/lượt nghe. Dịch/TTS tự động, bản đồ,
GPS, offline và AI vẫn chưa tích hợp. Các phần dài hạn bên dưới giữ vai trò thiết kế mục tiêu.
P1.1 đã bổ sung connection pool MongoDB theo lifespan và endpoint readiness.
P1.2 có model/repository User/session và unique/TTL index thật trên Atlas.
P1.3 có API JWT cookie/CSRF và dependency RBAC, đã kiểm thử với Atlas thật.
P1.4 có UI auth và AuthClient cho khôi phục/gia hạn/đăng xuất, khung trang theo role.
Trang `/explore` có UI cho 10 mô tả tiếng Việt nguồn tĩnh; vùng sơ đồ là placeholder,
chưa tích hợp bản đồ/GPS/audio player. Xem [báo cáo giao diện](test-reports/P1_4_1_EXPLORE_UI.md).
Ưu tiên demo hiện hành ở [DEMO_2_DAYS](DEMO_2_DAYS.md), khác thứ tự triển khai dài hạn bên dưới.

## Thành phần

```mermaid
flowchart LR
  User[Trình duyệt] --> Web[React / MapLibre / trình phát]
  Web <--> Local[IndexedDB / Cache Storage]
  Web --> API[FastAPI /api/v1]
  API --> Services[Services]
  Services --> Repositories[Repositories]
  Repositories --> DB[(MongoDB + GridFS)]
  Services --> Jobs[Công việc lưu trong MongoDB]
  Jobs --> Providers[Dịch / Edge-TTS / Gemini]
  Providers --> Repositories
```

Frontend và API phục vụ cùng nguồn khi triển khai. Khi phát triển, Vite proxy /api tới FastAPI.
P1.4 dùng hash routing (/#/login, /#/register, /#/explore, /#/admin, /#/creator),
nên tải lại không cần fallback tại server. Nếu đổi sang path routing phải bổ sung fallback giao diện,
không nuốt lỗi 404 của API. UI route guard không thay kiểm tra quyền ở backend.

## Ranh giới mã

- `backend/app/api/v1/endpoints/`: router độc lập auth, content, audio, maps,
  offline_packs, jobs, ai, admin, events. Health và auth có endpoint thực.
- `core/`: cấu hình và chính sách thời hạn phiên; `db/`: Mongo lifecycle và index User/session.
- `commands/`: khởi tạo index tường minh, không tự chạy khi import hoặc startup API.
- `schemas/`, `models/`: hợp đồng HTTP và quy tắc tài liệu lưu trữ.
- `services/`: nghiệp vụ; `repositories/`: truy xuất MongoDB/GridFS.
- `services/providers/`: lớp bọc dịch/TTS/Gemini; `workers/`: xử lý công việc bền vững.
- Frontend chia feature auth, tours, map, playback, offline, creator và admin.
  Vị trí, geofence và audio không được gắn chặt vào một component bản đồ.

## Phiên phía giao diện P1.4

AuthClient chỉ giữ User công khai và mốc hết hạn trong RAM; fetch cùng origin, credentials same-origin,
cache no-store. Không đọc JWT/refresh cookie HttpOnly hoặc lưu token vào Web Storage/IndexedDB.
Bootstrap gọi refresh để khôi phục phiên và lấy mốc hết hạn; 401 là chưa có phiên,
network/503 là lỗi kết nối với nút thử lại. Form đăng ký không tự đăng nhập hoặc cấp role.
Gia hạn trước access expiry 30 giây, chỉ một refresh đang chạy mỗi client;
Web Locks tuần tự hóa login/refresh/logout và CSRF giữa tab trên trình duyệt hỗ trợ.
BroadcastChannel đồng bộ trạng thái đăng nhập/đăng xuất, không truyền token.
Nếu không có Web Locks chỉ bảo đảm chống refresh trùng trong tab; chưa nghiệm thu fallback nhiều tab.
Khi focus/hiện lại trang, GET me kiểm tra phiên/role; GET 401 được refresh và thử lại tối đa một lần.
Chỉ retry POST khi middleware từ chối CSRF rõ ràng; không tự gửi lại login/register vì timeout.
Logout chờ refresh đang gửi, ngăn phản hồi cũ phục hồi trạng thái; lỗi mạng báo chưa đăng xuất thành công.
Tải lại/đóng trang mất RAM là bình thường, cookie phiên cho phép bootstrap lại khi còn hạn.

## Luồng công bố và xử lý nền

Creator tạo nháp, kiểm tra Việt–Anh/MP3 rồi gửi duyệt. Admin duyệt một phiên bản cụ thể.
Service tạo snapshot công bố; chỉnh sửa tiếp theo chỉ đổi nháp, không thay asset của snapshot cũ.

Dịch/TTS lưu job trước, trả mã công việc cho giao diện. Worker có retry hữu hạn,
lease/khôi phục công việc dang dở, giới hạn đồng thời và chống trùng theo phiên bản nội dung.
Không dùng tác vụ chỉ nằm trong RAM làm nguồn trạng thái duy nhất. Khi kết quả trả về,
kiểm tra phiên bản đầu vào để không gắn âm thanh cũ vào nội dung mới.
Chi tiết thời gian lease/retry sẽ được chốt và kiểm thử khi triển khai worker.

## Bảo mật và lưu trữ

JWT HttpOnly cookie, Secure trên HTTPS, kiểm tra CSRF và RBAC ở backend.
P1.3 đặt Secure khi ENVIRONMENT=production (phải phục vụ qua HTTPS),
SameSite=Lax, host-only, path /api/v1. Không trả access/refresh token trong JSON.
CSRF ký HMAC, cookie HttpOnly + token JSON để gửi X-CSRF-Token; gắn session ID sau login.
Middleware kiểm tra mọi API unsafe, Origin theo allowlist và Sec-Fetch-Site.
Argon2 chạy trong threadpool; phản hồi validation bỏ input để không phản chiếu mật khẩu.
Mỗi request xác thực tra phiên còn hiệu lực và User còn hoạt động; role lấy từ database.
API auth trả no-store; secret thiếu thì 503, không dùng khóa mặc định.
RBAC là dependency dùng chung; màn hình và API quản trị nội dung chưa được xây dựng.
Chính sách đã chốt: access token 15 phút, tự gia hạn trong phiên tối đa 7 ngày tuyệt đối.
Session lưu digest refresh token, thay digest bằng cập nhật nguyên tử; không kéo dài expires_at.
TTL chỉ dọn dữ liệu cũ, repository luôn kiểm tra thời hạn/thu hồi khi truy vấn phiên.
Đăng ký không nhận quyền từ client. Xác thực, token và phản hồi quản trị không được cache
bằng chiến lược API chung của service worker. Không đưa bí mật Gemini/TTS vào frontend.

MongoDB lưu metadata; GridFS lưu file. API media kiểm tra quyền và hỗ trợ Range.
Bản đồ phải có đủ style/font/sprite được phép đóng gói; PMTiles không tự bao gồm các phụ thuộc này.
Offline pack được chọn theo release/ngôn ngữ; bản đồ/ảnh dùng chung qua tham chiếu asset/checksum,
nội dung/MP3 theo ngôn ngữ. Không bắt tải mọi ngôn ngữ trên server. Xem [runtime](TOUR_RUNTIME.md).

## Triển khai

Mục tiêu: Render phục vụ frontend/API và Atlas Free lưu dữ liệu. Không lưu tài nguyên cần tồn tại
lâu dài trên filesystem tạm của Render.
Docker Compose là bản dự phòng FastAPI + MongoDB có volume; dùng HTTPS khi thử GPS trên điện thoại.
Hiện có cấu hình Docker nhưng chưa chạy xác minh, chưa triển khai ứng dụng lên cloud.
Atlas đã được người dùng tạo và kiểm thử ping thật thành công; chưa triển khai ứng dụng lên Render.

## Kết nối dữ liệu P1.1

Mỗi lifespan có một AsyncMongoClient, được đóng khi ứng dụng dừng, không tạo client mỗi request.
Factory ở app/application.py không đọc môi trường khi import; app/main.py là entrypoint
khởi tạo ứng dụng từ cấu hình. Test dùng factory với Settings riêng.
Không thực hiện I/O mạng khi import module. Chưa cấu hình URI thì không cấp pool.
Readiness ping database với thời gian chờ hữu hạn, trả connected/not_configured/unavailable;
liveness độc lập để không nhầm lỗi MongoDB với tiến trình đã dừng.
Pool dùng datetime có múi giờ. URI là SecretStr, bị loại khỏi dump/repr cấu hình;
phản hồi readiness không chứa lỗi driver/host/credential. Chưa có thao tác ghi dữ liệu ở P1.1.
