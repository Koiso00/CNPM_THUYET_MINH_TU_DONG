# Dữ liệu và hợp đồng API

## Hợp đồng đã có

`GET /api/v1/health` trả JSON với `status: "ok"`, `service`, `environment`.
Đây chỉ là liveness của tiến trình, không kiểm tra MongoDB hoặc xác thực.
`GET /api/v1/health/ready` thực hiện ping MongoDB thật:

| HTTP | JSON |
| --- | --- |
| 200 | {"status":"ready","database":"connected"} |
| 503 | {"status":"not_ready","database":"not_configured"} |
| 503 | {"status":"not_ready","database":"unavailable"} |

Cả hai endpoint trả Cache-Control: no-store. Readiness không trả URI hoặc thông báo lỗi driver.
P1.2 đã có collection/index User/session và kiểm thử ghi Atlas thật. GridFS chưa tích hợp.
OpenAPI có health, auth và các API demo nội dung/audio/admin bên dưới.

## API demo đã triển khai ngày 22/10/2026

| Method /api/v1 | Hợp đồng |
| --- | --- |
| GET /content/campus | Cần đăng nhập; chỉ trả release_id/title/language/places của snapshot đang công bố; 404 khi chưa công bố |
| GET /admin/campus | Admin; trả revision, draft, published_release_id |
| PUT /admin/campus | Admin + CSRF; `{revision, draft}`; lưu toàn bộ danh sách có thứ tự, revision tăng; stale trả 409 |
| POST /admin/campus/publish | Admin + CSRF; `{revision}`; tạo snapshot mới và ghim audio đúng checksum văn bản |
| POST /admin/campus/unpublish | Admin + CSRF; `{revision}`; bỏ con trỏ công bố, giữ nguyên snapshot |
| GET /admin/audio | Admin; audio khớp nội dung đã lưu theo từng place_id |
| PUT /admin/campus/places/{place_id}/audio?revision=N | Admin + CSRF; body MP3 thô, Content-Type audio/mpeg, tối đa 10 MiB; 413 quá cỡ, 415 sai loại, 422 không có MP3 frames; không tự công bố |
| GET/HEAD /audio/{release_id}/{place_id} | Cần đăng nhập; kiểm tra release hiện hành và asset ghim; hỗ trợ single Range (206), suffix/open-ended; 416 range sai |
| GET/HEAD /admin/audio/{asset_id} | Admin; preview asset đã nhập |
| GET /admin/users?offset=0&limit=50 | Admin; tối đa 100/trang; id, username, role, is_active, updated_at, is_protected; không trả password_hash/token |
| PUT /admin/users/{user_id} | Admin + CSRF; `{role,is_active}`; chặn tự sửa và sửa Admin đang hoạt động (409); khóa thu hồi các phiên |
| GET /admin/dashboard | Admin; users, active_users, audio_assets, draft_places, published_places, published_tours |
| GET /creator/campus | Creator; revision and current working draft as a starting point for a private proposal |
| GET /creator/submissions?offset=0&limit=50 | Creator; own proposals and review state only |
| GET /creator/submissions/{id} | Creator; own proposal only; other creators' IDs return 404 |
| POST /creator/submissions | Creator + CSRF; `{base_revision,draft}`; creates a private full-tour draft |
| PUT /creator/submissions/{id} | Creator + CSRF; `{revision,base_revision,draft}`; only own draft/rejected proposal; stale revision returns 409 |
| POST /creator/submissions/{id}/submit | Creator + CSRF; `{revision}`; sends immutable-for-review revision to Admin |
| GET /admin/submissions?offset=0&limit=50 | Admin; pending and approved proposals; no user/password/session data |
| POST /admin/submissions/{id}/review | Admin + CSRF; `{revision,decision:"approved"|"rejected",note?}`; one review decision per pending revision |
| POST /admin/submissions/{id}/apply | Admin + CSRF; `{revision}`; approved proposal replaces Admin draft only if its base revision still matches; then Admin publishes separately |

Draft: `{title,language:"vi",places:[{id,title,description,source,location}]}`.
ID địa điểm UUID, duy nhất trong tour; vị trí nullable hoặc GeoJSON Point `[longitude,latitude]`.
Giới hạn kỹ thuật: tối đa 100 điểm, title 200, description 20000, source 2000 ký tự;
không nhận field lạ. Nguồn và nội dung không được tự trim/viết lại. Snapshot bổ sung audio_id
nullable cho từng điểm. Draft rỗng được lưu nhưng không được công bố.

Đây là demo tiếng Việt với một tour, không phải hợp đồng hoàn chỉnh của release Việt–Anh/offline.
Không tự tạo tọa độ, không tự công bố sau seed, không trả fallback nội dung tĩnh khi API lỗi.
Toàn bộ phản hồi API vẫn no-store. Audio không phục vụ trực tiếp bằng GridFS ID.
Import checksum/idempotence và bootstrap Admin ở các lệnh README.
`audio_assets` đếm tất cả file ready đã nhập, gồm phiên bản cũ; không phải số địa điểm có audio.

Creator đề xuất toàn tour trong collection `content_submissions`; Creator chỉ đọc/sửa đề xuất
của mình. Gửi duyệt tăng revision nên không thể sửa bản đang xét. Admin duyệt hoặc trả kèm ghi chú;
đề xuất đã duyệt chỉ thay nháp Admin khi revision gốc còn khớp. Gỡ/công bố vẫn là thao tác riêng.
Các truy vấn tour/release/submission phục vụ workflow đọc primary để tránh đọc trạng thái cũ sau khi ghi.

## API xác thực đã có P1.3

| Method /api/v1/auth | Đầu vào / kết quả |
| --- | --- |
| GET /csrf | Trả csrf_token và đặt cookie CSRF HttpOnly; không cần đăng nhập |
| POST /register | JSON username/password; 201 với id, username, role=user; không tự đăng nhập |
| POST /login | JSON username/password; 200 với user, access_expires_at, session_expires_at, csrf_token |
| GET /me | Thông tin User đang đăng nhập; không nhận bearer token từ client |
| POST /refresh | Đọc refresh cookie, thay token; trả cùng dạng login, giữ mốc hết hạn phiên |
| POST /logout | Thu hồi phiên theo refresh cookie, xóa cookie; 204 |
| POST /logout-all | Cần access token còn hiệu lực; thu hồi mọi phiên của User, xóa cookie; 204 |

Mọi POST cần cookie CSRF và header X-CSRF-Token trùng token từ GET /csrf hoặc login.
Không gửi role/is_active/password_hash trong đăng ký: field lạ trả 422.
Username dùng quy tắc lưu trữ 1–128 ký tự in được, trim + casefold cho lookup.
Mật khẩu đăng ký 15–128 ký tự Unicode, giữ nguyên dấu cách; không tự trim/normalize.
Login chấp nhận 1–128 ký tự để thông báo sai thông tin thống nhất.
Tài khoản không tồn tại, sai mật khẩu hoặc bị khóa đều trả cùng lỗi login 401.

Access token HS256 đặt trong sgu_access; refresh token ngẫu nhiên 256 bit kèm session ID
đặt trong sgu_refresh. Chỉ digest SHA-256 của refresh được lưu trong database.
sgu_csrf chứa token ký gắn session ID (rỗng trước login), cần đọc token từ JSON vì cookie HttpOnly.
Cả ba cookie host-only, path /api/v1, SameSite=Lax, Secure khi production.
Không trả access/refresh token trong JSON. Mọi phản hồi API no-store, không cache bằng service worker.

Token truy cập hạn 15 phút hoặc phần thời gian còn lại của phiên nếu ngắn hơn.
Refresh cũ bị từ chối sau rotation; hai yêu cầu đồng thời chỉ một thành công.
Request refresh thua trả 401 và không xóa cookie của request thắng.
Frontend P1.4 đã điều phối một refresh tại một thời điểm, lấy lại CSRF khi cần,
thử lại GET tối đa một lần sau 401 và gia hạn trước access expiry 30 giây.
Bootstrap refresh lấy mốc hết hạn từ server; Web Locks dùng để tuần tự hóa giữa tab,
BroadcastChannel chỉ gửi tín hiệu trạng thái, không có token trong message/storage.

Mọi xác thực kiểm tra chữ ký/claims, phiên tồn tại/chưa hết hạn/chưa thu hồi và User đang hoạt động.
Role đọc từ database mỗi request qua require_roles; chưa có endpoint quản trị thực.
CSRF sai/origin không được phép/quyền thiếu: 403; chưa xác thực: 401;
username trùng: 409; payload không hợp lệ: 422 (không echo input);
thiếu secret/database hoặc database lỗi: 503 với thông điệp đã lọc bí mật.
AUTH_ALLOWED_ORIGINS là danh sách origin chính xác, không wildcard/CORS mở.

## Dữ liệu đã triển khai P1.2

`UserRecord` và `SessionRecord` là mô hình lưu trữ nội bộ, không phải response API.
ID dùng UUIDv4 lưu thành chuỗi ở `_id` và `user_id`. Thời gian UTC có múi giờ,
chuẩn hóa đến millisecond theo BSON. Model không nhận field lạ và không cho sửa trực tiếp.

| Collection | Field và ràng buộc |
| --- | --- |
| users | _id, username, username_key, password_hash, role, is_active, created_at, updated_at |
| sessions | _id, user_id, refresh_token_hash, created_at, updated_at, expires_at, revoked_at |

Username giữ cách viết để hiển thị, bỏ khoảng trắng hai đầu; username_key dùng casefold.
Phong/phong là cùng một tài khoản; unique index `uq_users_username_key` chống đăng ký đồng thời.
Giới hạn username: 1–128 ký tự in được. Role mặc định user, chỉ chấp nhận user/creator/admin.
P1.3 service băm/kiểm tra mật khẩu bằng Argon2id trước khi lưu; public registration chỉ tạo user.
Hash không xuất hiện trong dump/repr thông thường; `to_document()` chỉ dùng nội bộ repository.

Chính sách đã chốt: access token 15 phút; tự gia hạn trong phiên tối đa 7 ngày từ lúc đăng nhập.
Session mới có expires_at = created_at + 7 ngày, gia hạn không đổi mốc này.
refresh_token_hash chỉ nhận digest SHA-256 dạng hex 64 ký tự của token ngẫu nhiên đủ mạnh;
không lưu refresh token rõ. Tạo token và tính digest thuộc service P1.3.

| Index session | Mục đích |
| --- | --- |
| uq_sessions_refresh_token_hash (unique) | Không trùng digest giữa phiên |
| ttl_sessions_expires_at (expireAfterSeconds=0) | Dọn bản ghi hết hạn theo expires_at |
| ix_sessions_user_id | Tra cứu/thu hồi phiên của tài khoản |

Repository luôn lọc thời hạn và revoked_at; không dựa vào tốc độ dọn TTL để xác thực.
Thay refresh digest là thao tác nguyên tử có điều kiện digest cũ; hai yêu cầu đồng thời
chỉ một được thay. Có thu hồi một phiên theo chủ sở hữu và thu hồi mọi phiên của user.
P1.3 đã có kiểm tra user tồn tại/đang hoạt động, JWT, cookie, CSRF và dependency RBAC.
MongoDB không tự kiểm tra khóa ngoại user_id; service đảm nhiệm xác thực liên kết này.

Khởi tạo index bằng lệnh ở [backend README](../backend/README.md); không tự drop khi xung đột.
Đã kiểm thử trên Atlas và khởi tạo index database phát triển, chưa tạo tài khoản thật.

## Danh mục dữ liệu tổng thể — phần còn lại là mục tiêu

| Collection | Thông tin và ràng buộc cần có |
| --- | --- |
| users | Định danh đăng nhập duy nhất, password hash, role User/Creator/Admin, trạng thái |
| sessions | Phiên đăng nhập và thông tin thu hồi; không lưu mật khẩu/token rõ |
| tours | Chủ sở hữu, metadata, danh sách/thứ tự POI, trạng thái nháp và phiên bản |
| pois | Tọa độ GeoJSON Point, bán kính geofence, ảnh, nguồn tư liệu, phiên bản |
| localizations | Thực thể, ngôn ngữ, văn bản, phiên bản nguồn, trạng thái kiểm tra |
| tour_releases | Snapshot bất biến của bản công bố, POI, bản dịch và asset tham chiếu |
| assets | Loại file, GridFS ID, kích thước, checksum, ngôn ngữ/giọng và phiên bản nguồn |
| jobs | Loại việc, khóa chống trùng, trạng thái, lần thử, lease và lỗi đã lọc bí mật |
| offline_packs | Release + ngôn ngữ, manifest phần dùng chung/phần ngôn ngữ, dung lượng và checksum |
| audit_logs | Ai làm gì với nội dung/tài khoản, thời điểm và kết quả |
| usage_events | ID chống trùng, loại sự kiện, tour/phiên, thời điểm xảy ra/nhận, cờ mô phỏng |

Tọa độ GeoJSON theo thứ tự **[longitude, latitude]**, không đảo thành vĩ độ/kinh độ.
API dùng ID dạng chuỗi, thời gian UTC; múi giờ hiển thị phục vụ người dùng Việt Nam.
Các unique index cho tên đăng nhập, localization theo phiên bản, job deduplication key
và usage event ID phải được tạo tường minh khi bổ sung lớp dữ liệu.
Không mặc định yêu cầu MongoDB transaction trước khi kiểm tra khả năng môi trường chạy.

## Nhóm API mục tiêu

| Prefix | Khả năng cần triển khai |
| --- | --- |
| /api/v1/auth | Đăng ký, đăng nhập, thông tin phiên, đăng xuất/thu hồi |
| /api/v1/content | Tour/POI/localization; tách quyền nháp và bản công bố |
| /api/v1/audio | Tìm/phát asset, yêu cầu tạo đúng nội dung công bố |
| /api/v1/maps | Metadata/tài nguyên bản đồ có kiểm tra quyền |
| /api/v1/offline-packs | Manifest phiên bản và tài nguyên tải |
| /api/v1/jobs | Trạng thái công việc mà tài khoản được phép xem |
| /api/v1/ai | Gợi ý bản nháp từ tài liệu Creator cung cấp |
| /api/v1/admin | Xét duyệt, tài khoản, nhật ký, dashboard |
| /api/v1/events | Nhận sự kiện sử dụng, chống gửi trùng |

Đây là phân nhóm, không phải danh sách endpoint đã sẵn sàng. Chốt phương thức, payload,
mã lỗi và phân trang trong PR tính năng, cập nhật OpenAPI và tài liệu cùng lúc.
Những yêu cầu nền sẽ trả job ID/trạng thái thay vì chờ dịch/TTS xong.
Manifest cần release ID, ngôn ngữ, danh sách URL/asset, kích thước và checksum.
Thiết kế offline đã chốt: mỗi lựa chọn release/ngôn ngữ tham chiếu shared_assets và language_assets.
Client xác định asset còn thiếu/hỏng/sai phiên bản để tính dung lượng tải thêm, không tải lại
bản đồ/ảnh đã hợp lệ khi thêm ngôn ngữ. Trạng thái hoàn tất tính theo từng release/ngôn ngữ
và toàn bộ asset cần thiết, không dựa vào một cờ chung cho mọi ngôn ngữ.
Đây là hợp đồng mục tiêu, chưa có endpoint hoặc schema offline chạy thật.

## Ma trận quyền mục tiêu

| Hành động | User | Creator | Admin |
| --- | --- | --- | --- |
| Nghe/tải bản công bố | Có | Có | Có |
| Soạn/gửi duyệt | Không | Nội dung thuộc quyền quản lý | Quản trị theo chính sách được chốt |
| Công bố/từ chối/gỡ công bố | Không | Không | Có |
| Cấp quyền, xem nhật ký hệ thống | Không | Không | Có |

Mọi quyền đều kiểm tra tại server. Biết ID file không tạo quyền tải file.
