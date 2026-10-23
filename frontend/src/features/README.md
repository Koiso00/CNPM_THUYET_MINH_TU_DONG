# Feature boundaries

Module auth đã triển khai client/form. Các module khác vẫn giữ chỗ;
App shell hiển thị trang khách công khai và khu vực Admin; audio công bố được phát thủ công.

| Module   | Trách nhiệm dự kiến                                       |
| -------- | --------------------------------------------------------- |
| auth     | Đã có form đăng ký/đăng nhập, CSRF client, khôi phục/gia hạn/đăng xuất |
| tours    | Đọc snapshot công bố từ API; khách chọn điểm và nghe thủ công |
| map      | Bản đồ MapLibre dùng tile raster Stadia Maps trực tuyến, có attribution, 10 marker và trạng thái tải/lỗi; domain production cần được cấu hình xác thực Stadia. GPS/geofence hiện có ở mức thử nghiệm, chưa nghiệm thu thực địa. |
| playback | Phát MP3 công bố qua Range/HEAD; ghi lượt phát khi audio bắt đầu |
| offline  | Manifest, IndexedDB, tải/cập nhật gói và Workbox          |
| creator  | Nội dung thuộc quyền quản lý và gửi duyệt                 |
| admin    | Biên soạn trực tiếp, công bố, quản lý tài khoản và dashboard |

Dùng LocationProvider và AudioProvider tại module sở hữu khi triển khai.
Không gọi geolocation hoặc phát audio trực tiếp từ nhiều component rời rạc.
