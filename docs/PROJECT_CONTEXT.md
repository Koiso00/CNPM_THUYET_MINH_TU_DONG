# Bối cảnh dự án

## Nguồn và quyết định đã chốt

[Kế hoạch gốc](PROJECT_PLAN.md) là bản người dùng gửi lại và yêu cầu **giữ nguyên**.
Đây là nguồn chuẩn cho phạm vi sản phẩm. Các tài liệu khác diễn giải cách tổ chức thực hiện;
chúng không thay thế các quyết định trong bản gốc.

| Nội dung | Quyết định |
| --- | --- |
| Sản phẩm | Website trên điện thoại và máy tính, không bắt buộc cài ứng dụng |
| Khu vực | Cơ sở chính Đại học Sài Gòn; 8–10 điểm ngoài trời |
| Nội dung | Một tour mẫu; tiếng Việt và tiếng Anh |
| Vai trò | User, Creator, Admin; Creator gửi duyệt, Admin công bố |
| Tham quan | Tự do; tự nhận điểm khi trang đang mở hoặc chọn nghe thủ công |
| Demo | GPS mô phỏng cùng luồng xử lý với GPS thật |
| Ngoại tuyến | Gói đầy đủ gồm bản đồ, ảnh, nội dung và MP3 hai ngôn ngữ |
| Nền tảng | FastAPI, MongoDB/GridFS, React, MapLibre/PMTiles, Workbox/IndexedDB |
| AI | Gemini theo cấu hình; chỉ gợi ý bản nháp |
| Chi phí | Ưu tiên hạ tầng miễn phí; bản chạy trên máy để dự phòng |
| Tiến độ | Lộ trình dự kiến 10 tuần; không phải cam kết hoàn thành |
| Dữ liệu thật | Chưa có bộ dữ liệu được khảo sát và duyệt |

## Các phương án không còn là phạm vi hiện hành

Người dùng đã chọn kế hoạch gốc thay cho: demo 5 ngày, gộp Creator/Admin,
chỉ OSM trực tuyến ở bản đầu, thống kê người đang ở từng điểm và xuất CSV.
Không tự khôi phục các phương án này. Không suy diễn số giờ làm hoặc năng lực nhóm
thành cam kết tiến độ mới.

## Trạng thái thực tế

Đã tạo khung backend/frontend, cấu hình môi trường mẫu, cơ sở Docker và tài liệu.
Chỉ health endpoint và trang mở đầu có mã chạy; router nghiệp vụ là chỗ đặt mã cho các mốc sau.
Chưa có tài khoản thật, dữ liệu tour, kết nối MongoDB, triển khai cloud hoặc chức năng offline.

Các chi tiết chưa được kế hoạch gốc quy định (chẳng hạn thời hạn token, cách cấp Creator,
chính sách bắt buộc/tùy chọn tải gói, giới hạn dung lượng cụ thể) cần chốt ở mốc tương ứng;
không coi giá trị giữ chỗ trong tài liệu hay cấu hình là yêu cầu đã được duyệt.
