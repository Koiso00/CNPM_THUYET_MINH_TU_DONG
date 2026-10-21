# Dữ liệu và hợp đồng API

## Hợp đồng đã có

`GET /api/v1/health` trả JSON với `status: "ok"`, `service`, `environment`.
Đây chỉ là liveness của tiến trình, không kiểm tra MongoDB hoặc xác thực.
OpenAPI hiện chỉ có endpoint này. Các router còn lại chưa có endpoint.

## Mô hình mục tiêu — chưa triển khai

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
| offline_packs | Release, manifest, tài nguyên, dung lượng và checksum |
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

## Ma trận quyền mục tiêu

| Hành động | User | Creator | Admin |
| --- | --- | --- | --- |
| Nghe/tải bản công bố | Có | Có | Có |
| Soạn/gửi duyệt | Không | Nội dung thuộc quyền quản lý | Quản trị theo chính sách được chốt |
| Công bố/từ chối/gỡ công bố | Không | Không | Có |
| Cấp quyền, xem nhật ký hệ thống | Không | Không | Có |

Mọi quyền đều kiểm tra tại server. Biết ID file không tạo quyền tải file.
