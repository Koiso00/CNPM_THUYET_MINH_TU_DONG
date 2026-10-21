# Feature boundaries

Các thư mục con hiện chỉ giữ chỗ, chưa có chức năng:

| Module | Trách nhiệm dự kiến |
| --- | --- |
| auth | Đăng ký, đăng nhập và trạng thái phiên |
| tours | Danh sách/chi tiết tour và phiên tham quan |
| map | MapLibre/PMTiles, vị trí thật/mô phỏng, geofence |
| playback | Một trình phát và một hàng đợi âm thanh cho mỗi phiên |
| offline | Manifest, IndexedDB, tải/cập nhật gói và Workbox |
| creator | Nội dung thuộc quyền quản lý và gửi duyệt |
| admin | Phân quyền, xét duyệt và dashboard trong kế hoạch đã chốt |

Dùng LocationProvider và AudioProvider tại module sở hữu khi triển khai.
Không gọi geolocation hoặc phát audio trực tiếp từ nhiều component rời rạc.
