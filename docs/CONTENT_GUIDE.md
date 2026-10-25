# Hướng dẫn nội dung

Demo có 10 POI từ nguồn tiếng Việt người dùng cung cấp và 10 tọa độ đã được người dùng kiểm chứng thực địa. Việc kiểm chứng tọa độ không đồng nghĩa mọi chi tiết lịch sử đã được nhà trường xác minh. Không tự tạo tên tòa nhà, lịch sử hoặc tọa độ rồi gọi đó là dữ liệu chính thức.

## Nguồn đã được người dùng chọn cho demo

Ngày 21/10/2026, người dùng cung cấp nội dung tiếng Việt cho 10 địa điểm và yêu cầu dùng làm nguồn.
Lưu nguyên văn tại [nguồn tiếng Việt](../data/sources/campus-vi-user-2026-10-21.md).
Dùng văn bản này làm nguồn tiếng Việt cho nội dung/audio. Nội dung demo đã được nhập vào hệ thống; 10 tọa độ đã được người dùng kiểm chứng thực địa. Không đánh dấu nội dung lịch sử là đã được nhà trường duyệt nếu chưa có bằng chứng riêng.
Người dùng chọn Edge-TTS giọng nam tiếng Việt. Đã tạo 10 MP3 vi-VN-NamMinhNeural từ nguyên văn mô tả,
không đọc tiêu đề/metadata; tổng 211.008 giây, 1,266,048 byte. File ở data/generated/audio/vi-male,
đã kiểm tra kỹ thuật, chưa nghe duyệt phát âm. Xem [báo cáo](test-reports/DEMO_AUDIO_VI_MALE.md).
Các chỉ dẫn trên/dưới/trái/phải tham chiếu sơ đồ chưa được gửi kèm, không tự đổi thành hướng địa lý.
Người dùng đã rà soát và duyệt bản dịch English/audio English cho 10 POI vào 24/10/2026; xem [bản dịch](../data/sources/campus-en-translation-draft-2026-10-24.md) và [báo cáo](test-reports/DEMO_AUDIO_EN_DRAFT_2026_10_24.md). Bản tiếng Hàn cho 10 POI và 10 MP3 giọng nam được người dùng duyệt ngày 26/10/2026, đã nhập Atlas và công bố trong release mới. Xem [bản dịch Hàn](../data/sources/campus-ko-translation-draft-2026-10-26.md) và [báo cáo audio Hàn](test-reports/DEMO_AUDIO_KO_DRAFT_2026_10_26.md). Không tự thêm tên đầy đủ của KLF hoặc thông tin lịch sử.

## Hồ sơ mỗi điểm

- Tên địa điểm và cách gọi được kiểm tra.
- Tọa độ ngoài trời, ngày khảo sát, người kiểm tra và độ chính xác ghi nhận.
- Ảnh, người chụp/nguồn và thông tin sử dụng.
- Nội dung tiếng Việt; các nguồn tài liệu hỗ trợ từng chi tiết lịch sử.
- Bản dịch English/Korean; người kiểm tra, ghi chú tên riêng và cách phát âm.
- Giọng đọc, file MP3, phiên bản văn bản nguồn và kết quả nghe thử.
- Bán kính geofence ban đầu, kết quả khảo sát và điều chỉnh.
- Trạng thái: mẫu mô phỏng, nháp, đã kiểm tra hoặc được công bố.

## Quy trình

1. Lập danh sách điểm có thể tiếp cận ngoài trời trong cơ sở chính.
2. Thu thập tư liệu nhà trường/nguồn phù hợp, ảnh và tọa độ thực địa.
3. Viết bản Việt có dẫn nguồn; nội dung chưa xác minh phải giữ ở nháp.
4. Dùng bản dịch English và Korean đã được người dùng duyệt; mọi bản dịch mới phải được con người kiểm tra.
5. Tạo MP3, nghe thử từng ngôn ngữ; có thể tải file thay thế.
6. Admin kiểm tra nội dung/audio trước khi công bố. Workflow Creator đã được gỡ khỏi demo hiện hành.

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
