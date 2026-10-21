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

Quyết định mới được người dùng chốt ngày 21/10/2026: tải offline theo ngôn ngữ khách chọn,
thay yêu cầu gói bắt buộc đủ Việt–Anh của kế hoạch gốc. Offline vẫn là thiết kế mục tiêu,
chưa triển khai và không nằm trong phạm vi demo 2 ngày.

Một pack tham chiếu một release bất biến và một ngôn ngữ. Nó gồm:

- Phần dùng chung: metadata tour/POI, ảnh, PMTiles, style, font và sprite cần cho release.
- Phần ngôn ngữ: nội dung/bản dịch và toàn bộ MP3 cần thiết cho ngôn ngữ đã chọn.

Khách chỉ tải tiếng Việt thì không cần MP3 tiếng Anh hoặc các ngôn ngữ khác.
Có thể thêm ngôn ngữ sau; phần dùng chung đúng phiên bản/checksum chỉ lưu và tải một lần.
Tài nguyên định danh theo asset ID/checksum, các pack tham chiếu chung để tránh nhân bản.
Khi xóa một ngôn ngữ, chỉ xóa tài nguyên không còn pack được giữ nào cần đến;
quyền và xóa dữ liệu theo tài khoản vẫn tuân thủ chính sách đăng xuất bên dưới.
Không trộn bản đồ/nội dung/audio từ release khác nhau chỉ để tránh tải lại.

Luồng giao diện mục tiêu:

1. Chọn “Tải để dùng ngoại tuyến”, mặc định hiển thị ngôn ngữ đang sử dụng.
2. Hiển thị tổng dung lượng của lựa chọn và dung lượng thực sự cần tải thêm từ manifest/file thật.
3. Khách xác nhận tải ngôn ngữ đó; có thể chọn tải thêm ngôn ngữ khác sau.
4. Hiển thị trạng thái riêng từng ngôn ngữ: chưa tải/đang tải/sẵn sàng/lỗi/cần cập nhật.

Tải là tùy chọn; không tải vẫn dùng trực tuyến. Khi mất mạng, chỉ cam kết xem/nghe
ngôn ngữ đã tải đủ. Đổi sang ngôn ngữ chưa tải phải thông báo thiếu gói, cho chọn lại
ngôn ngữ đã tải hoặc xem phần văn bản thực sự còn sẵn; không tự nhận đã hỗ trợ offline,
không tự đổi giọng/ngôn ngữ và không bắt tải toàn bộ ngôn ngữ mới dùng được dịch vụ.

IndexedDB lưu dữ liệu và file bản đồ; Cache Storage lưu shell/media đã tải đầy đủ.
Media phải hỗ trợ Range. Các mảnh đã stream không chứng minh file đã tải đủ.

Trạng thái mục tiêu: chưa tải → đang tải → kiểm tra → sẵn sàng; có nhánh lỗi/hủy.
Kiểm tra checksum và đủ cả phần dùng chung lẫn phần ngôn ngữ trước khi báo ngôn ngữ đó sẵn sàng.
Chỉ tải xong tiếng Việt không được đánh dấu tiếng Anh sẵn sàng. Thêm ngôn ngữ trên server
không tự đưa ngôn ngữ đó vào danh sách tải của khách. Khi cập nhật, tải bản mới riêng;
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
