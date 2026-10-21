# Feature boundaries

Module auth đã triển khai client/form. Các module khác vẫn giữ chỗ;
App shell hiển thị khung trang theo role, chưa có nghiệp vụ quản trị/audio.

| Module   | Trách nhiệm dự kiến                                       |
| -------- | --------------------------------------------------------- |
| auth     | Đã có form đăng ký/đăng nhập, CSRF client, khôi phục/gia hạn/đăng xuất |
| tours    | Có trang khám phá và 10 mô tả nguồn tĩnh; chưa có tour/API phiên tham quan |
| map      | Có vùng giữ chỗ sơ đồ; chưa có ảnh sơ đồ, MapLibre/PMTiles, GPS hoặc geofence |
| playback | Nút audio đang khóa; MP3 chưa được phục vụ/phát trong trình duyệt |
| offline  | Manifest, IndexedDB, tải/cập nhật gói và Workbox          |
| creator  | Nội dung thuộc quyền quản lý và gửi duyệt                 |
| admin    | Phân quyền, xét duyệt và dashboard trong kế hoạch đã chốt |

Dùng LocationProvider và AudioProvider tại module sở hữu khi triển khai.
Không gọi geolocation hoặc phát audio trực tiếp từ nhiều component rời rạc.
