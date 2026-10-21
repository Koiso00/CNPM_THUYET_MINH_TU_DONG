# Hướng dẫn nội dung

Hiện chưa có danh sách 8–10 POI đã được xác minh. Không tự tạo tên tòa nhà, lịch sử
hoặc tọa độ rồi gọi đó là dữ liệu chính thức.

## Hồ sơ mỗi điểm

- Tên địa điểm và cách gọi được kiểm tra.
- Tọa độ ngoài trời, ngày khảo sát, người kiểm tra và độ chính xác ghi nhận.
- Ảnh, người chụp/nguồn và thông tin sử dụng.
- Nội dung tiếng Việt; các nguồn tài liệu hỗ trợ từng chi tiết lịch sử.
- Bản tiếng Anh; người kiểm tra, ghi chú tên riêng và cách phát âm.
- Giọng đọc, file MP3, phiên bản văn bản nguồn và kết quả nghe thử.
- Bán kính geofence ban đầu, kết quả khảo sát và điều chỉnh.
- Trạng thái: mẫu mô phỏng, nháp, đã kiểm tra hoặc được công bố.

## Quy trình

1. Lập danh sách điểm có thể tiếp cận ngoài trời trong cơ sở chính.
2. Thu thập tư liệu nhà trường/nguồn phù hợp, ảnh và tọa độ thực địa.
3. Viết bản Việt có dẫn nguồn; nội dung chưa xác minh phải giữ ở nháp.
4. Dịch sang Anh, kiểm tra nghĩa và tên riêng; bản dịch tự động chưa được coi là đã duyệt.
5. Tạo MP3, nghe thử cả hai ngôn ngữ; có thể tải file thay thế.
6. Creator xem trước, gửi duyệt; Admin kiểm tra trước công bố.

AI chỉ hỗ trợ tóm tắt/viết lại tài liệu đã cung cấp, không dùng làm nguồn lịch sử.
Ghi rõ nội dung do AI gợi ý và phần được con người kiểm tra.

## Bản đồ

MapLibre là bộ hiển thị; PMTiles là định dạng phân phối, không phải nguồn dữ liệu tự có.
Ghi nguồn và quyền sử dụng cho dữ liệu bản đồ, style, font và sprite.
Nếu dùng dữ liệu OpenStreetMap, giữ attribution và chuẩn bị gói từ nguồn cho phép đóng gói;
không tải hàng loạt tile từ máy chủ công cộng OSM để tạo offline pack.
Không sửa dữ liệu OpenStreetMap công cộng như một phần nhập POI vào ứng dụng.

## Dữ liệu mẫu

Mẫu phục vụ kiểm thử phải gắn nhãn, có cờ mô phỏng và không được tự công bố.
File lớn nằm ngoài Git; bản nhập vào hệ thống dùng MongoDB/GridFS.
