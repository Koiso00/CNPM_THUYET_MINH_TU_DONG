# Runtime tham quan

Trạng thái 24/10/2026: bản đồ OSM, GPS trình duyệt bật theo thao tác người dùng, mô phỏng vị trí, geofence và thử tự phát audio khi vào vùng đã có ở frontend. Trình duyệt có thể chặn autoplay; UI giữ nút phát thủ công. Chưa có hàng đợi audio hoặc GPS thực địa nghiệm thu.

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
- Bỏ POI đang chờ khi đã ra ngoài; không ngắt bài đang nghe.
- Khi geofence xác nhận điểm mới, UI mở nội dung và gọi play() cho audio điểm đó. GPS/mô phỏng chỉ khởi động sau thao tác người dùng; nếu autoplay bị từ chối thì báo rõ và giữ phát thủ công. Khi ra khỏi vùng rồi vào lại, một lần xác nhận mới có thể yêu cầu phát lại; không gọi lại ở mỗi fix.

Các ngưỡng mặc định đang là hằng số frontend, cần cấu hình/khảo sát thực địa trước khi dùng chính thức.
Không dùng GPS mô phỏng làm bằng chứng GPS thực đã chính xác. Trang ẩn/khóa màn hình không nằm trong cam kết kích hoạt điểm mới.
Từ chối quyền vị trí, trình duyệt không hỗ trợ hoặc không lấy được fix thì vẫn chọn điểm thủ công.
GPS trên điện thoại cần HTTPS; localhost được trình duyệt coi là secure context để phát triển.

## Audio

Hiện dùng một audio player trong panel của POI; đổi điểm/rời trang dừng audio cũ.
Khi geofence xác nhận POI mới, thử tự phát audio; promise rejection/autoplay policy chuyển sang hướng dẫn nhấn phát. Nghe lại thủ công vẫn được. Hàng đợi audio chưa có.
Sự kiện audio chỉ được ghi khi trình phát phát thành công; lần tự phát do mô phỏng không gửi sự kiện thật lên dashboard. Phát thủ công là hành động nghe thật và vẫn được tính.

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
