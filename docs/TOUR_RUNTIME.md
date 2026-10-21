# Runtime tham quan

Trạng thái: **thiết kế mục tiêu**, chưa có mã GPS/audio/service worker.

## Vị trí và geofence

BrowserLocationProvider dùng watchPosition; SimulatedLocationProvider dùng vị trí chọn hoặc tuyến mẫu.
Cả hai cung cấp tọa độ, accuracy, timestamp và cờ mô phỏng cho cùng bộ xử lý.
Mô phỏng mặc định tắt, phải có nhãn trên màn hình và không trộn số liệu thật.

Ngưỡng khởi đầu theo kế hoạch:
- Xử lý tối đa một lần/5 giây; không coi đó là chu kỳ cảm biến đảm bảo.
- Vào 30 m, ra 45 m; bỏ mẫu cũ hơn 15 giây hoặc sai số >25 m.
- Xác nhận bằng hai mẫu hợp lệ liên tiếp.
- Nhiều điểm đủ điều kiện: gần nhất trước, hòa thì thứ tự trong tour.
- Bỏ POI đang chờ khi đã ra ngoài; không ngắt bài đang nghe.
- Mỗi điểm chỉ tự phát một lần/phiên; cho nghe lại thủ công.

Các ngưỡng cần cấu hình và khảo sát thực địa. Không dùng GPS mô phỏng làm bằng chứng
GPS thực đã chính xác. Trang ẩn/khóa màn hình không nằm trong cam kết kích hoạt điểm mới.
Từ chối quyền vị trí thì vẫn chọn điểm thủ công.

## Audio

Một trình phát/hàng đợi sở hữu toàn bộ trạng thái của phiên.
Người dùng bấm Bắt đầu tham quan trước khi tự phát; xử lý lỗi autoplay bằng thao tác phát rõ ràng.

Thứ tự: MP3 cục bộ → MP3 máy chủ → tạo khi cần → speechSynthesis.
Khi offline bỏ các tầng mạng; chỉ dùng giọng trình duyệt nếu thực sự có giọng cục bộ phù hợp.
Không có nguồn đọc thì hiển thị văn bản và trạng thái thiếu âm thanh.
Tạo theo yêu cầu chỉ dùng nội dung đã công bố, có khóa chống trùng.
Đổi ngôn ngữ, dừng, lỗi và chuyển điểm không được để hai nguồn âm thanh phát cùng lúc.

## Offline pack

Một pack tham chiếu một release bất biến, đủ Việt–Anh, ảnh, MP3, PMTiles, style, font và sprite.
IndexedDB lưu dữ liệu và file bản đồ; Cache Storage lưu shell/media đã tải đầy đủ.
Media phải hỗ trợ Range. Các mảnh đã stream không chứng minh file đã tải đủ.

Trạng thái mục tiêu: chưa tải → đang tải → kiểm tra → sẵn sàng; có nhánh lỗi/hủy.
Kiểm tra checksum và đủ tài nguyên trước khi sẵn sàng. Khi cập nhật, tải bản mới riêng;
chỉ đổi phiên bản đang dùng sau khi kiểm tra xong, không phá bản cũ nếu tải thất bại.
Kiểm tra dung lượng, hỗ trợ tiếp tục và phát hiện trình duyệt đã xóa dữ liệu.

Tài khoản từng đăng nhập/tải gói được mở lại offline cùng trình duyệt dù phiên online hết hạn;
chỉ xem/nghe, không đăng nhập mới hoặc quản trị. Không lưu JWT vào IndexedDB để thực hiện việc này.
Đăng xuất xóa quyền và dữ liệu offline, ghi yêu cầu thu hồi phiên nếu đang mất mạng.
Khi kết nối lại, xử lý đăng xuất chờ trước khi tự khôi phục phiên.
Thiết kế nhận diện tài khoản offline và xử lý nhiều tab cần kiểm thử trước khi nghiệm thu.

## Sự kiện

Thu thập lượt bắt đầu tour và nghe hoàn tất cho dashboard trong kế hoạch.
Sự kiện offline có ID ổn định, thời điểm xảy ra và đồng bộ chống trùng khi online.
Không lưu hành trình GPS thô; tách mô phỏng khỏi dữ liệu thực.
Không thêm thống kê hiện diện từng điểm/CSV khi chưa có yêu cầu mới.
