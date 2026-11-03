> **Cập nhật người dùng 03/11/2026:** Ghi nhận GPS/geofence đã khảo sát theo yêu cầu người dùng; không có số liệu hay biên bản khảo sát mới kèm theo. Dashboard đã được người dùng kiểm thử thực tế và xác nhận đạt; Render đã triển khai thành công theo xác nhận người dùng. Bỏ qua nghiệm thu tự phát Safari, hàng đợi audio và Docker. Các ghi chú cũ yêu cầu các phần này chỉ là lịch sử.

# Runtime tham quan

Trạng thái 24/10/2026: bản đồ Stadia Maps và GPS đã được người dùng thử trên điện thoại; 10 tọa độ đã kiểm chứng thực địa. Mô phỏng/geofence dùng chung luồng với GPS. iPhone/Safari đã chặn lần thử tự phát khi vào vùng; trình phát hiện giữ cùng một thẻ audio và chuẩn bị thẻ ngay trong thao tác bật GPS/mô phỏng. Cần thử lại trên iPhone, đồng thời xác nhận riêng ngưỡng geofence 30/45 m. Chưa có hàng đợi audio.

## Vị trí và geofence

GPS thật dùng `watchPosition` và chỉ khởi động sau khi khách bấm nút; có thể dừng theo dõi.
Mô phỏng mặc định tắt, khách chọn một POI và mẫu mô phỏng được phát mỗi 5 giây.
Cả hai tạo cùng hợp đồng tọa độ, accuracy, timestamp và cờ nguồn rồi đi qua `GeofenceTracker`.
Vị trí chỉ ở trong trình duyệt; không gửi vị trí lên API. Mẫu mô phỏng có nhãn riêng và không ghi thống kê thật.

Ngưỡng khởi đầu theo kế hoạch:
- Bộ xử lý giới hạn tối đa một mẫu/5 giây; không coi đó là chu kỳ cảm biến đảm bảo.
- Vào 30 m, ra 45 m; bỏ mẫu cũ hơn 15 giây hoặc sai số >25 m.
- Xác nhận bằng hai mẫu hợp lệ liên tiếp.
- Nhiều điểm đủ điều kiện: gần nhất trước, hòa thì thứ tự trong tour.
- Mục tiêu khi có hàng đợi: bỏ POI đang chờ khi đã ra ngoài và không ngắt bài đang nghe.
- Khi geofence xác nhận điểm mới, UI mở nội dung và gọi play() cho audio điểm đó. GPS/mô phỏng chỉ khởi động sau thao tác người dùng; nếu autoplay bị từ chối thì báo rõ và giữ phát thủ công. Khi ra khỏi vùng rồi vào lại, một lần xác nhận mới có thể yêu cầu phát lại; không gọi lại ở mỗi fix.

Các ngưỡng mặc định đang là hằng số frontend, cần cấu hình/khảo sát thực địa trước khi dùng chính thức.
Không dùng GPS mô phỏng làm bằng chứng GPS thực đã chính xác. Trang ẩn/khóa màn hình không nằm trong cam kết kích hoạt điểm mới.
Từ chối quyền vị trí, trình duyệt không hỗ trợ hoặc không lấy được fix thì vẫn chọn điểm thủ công.
GPS trên điện thoại cần HTTPS; localhost được trình duyệt coi là secure context để phát triển.

## Audio

Hiện dùng một thẻ audio tồn tại xuyên suốt trang Explore, hiển thị trong panel POI khi chọn điểm. Chạm marker hoặc nút “Nghe thuyết minh” gọi play ngay trong thao tác chạm để đáp ứng yêu cầu tương tác của Safari; đổi điểm thay nguồn audio trên cùng thẻ. Rời trang dừng audio.
Khi geofence xác nhận POI mới, thử tự phát audio; promise rejection/autoplay policy chuyển sang hướng dẫn nhấn phát. Nghe lại thủ công vẫn được. Hàng đợi audio chưa có.
Sự kiện audio chỉ được ghi khi trình phát phát thành công; lần tự phát do mô phỏng không gửi sự kiện thật lên dashboard. Phát thủ công là hành động nghe thật và vẫn được tính.

Thứ tự mục tiêu: MP3 máy chủ → tạo khi cần → speechSynthesis.
Không có nguồn đọc thì hiển thị văn bản và trạng thái thiếu âm thanh.
Tạo theo yêu cầu chỉ dùng nội dung đã công bố, có khóa chống trùng.
Đổi ngôn ngữ, dừng, lỗi và chuyển điểm không được để hai nguồn âm thanh phát cùng lúc.

## Phạm vi kết nối

Ngày 27/10/2026, người dùng loại offline khỏi phạm vi dự án; bản đồ và nội dung/audio dùng kết nối mạng.

## Sự kiện

Thu thập lượt bắt đầu tour và nghe hoàn tất cho dashboard trong kế hoạch.
Không lưu hành trình GPS thô; tách mô phỏng khỏi dữ liệu thực.
Không thêm thống kê hiện diện từng điểm/CSV khi chưa có yêu cầu mới.
