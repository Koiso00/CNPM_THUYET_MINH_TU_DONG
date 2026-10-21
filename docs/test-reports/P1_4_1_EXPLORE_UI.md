# P1.4.1 — Trang khám phá sau đăng nhập

Ngày kiểm tra: 22/10/2026.

Trang khám phá được thiết kế lại theo mẫu người dùng cung cấp: header điều hướng, lời chào,
khối thông tin, vùng sơ đồ, chi tiết địa điểm và danh sách 10 nội dung. Mô tả được chép từ
[nguồn tiếng Việt do người dùng cung cấp](../../data/sources/campus-vi-user-2026-10-21.md).
Vùng sơ đồ là component giữ chỗ để thay bằng ảnh sơ đồ khuôn viên sau này.

## Giới hạn hiển thị

- 10 mô tả đang được đóng tĩnh trong frontend; chưa đọc từ API hoặc MongoDB.
- Nguồn chưa được xác minh thực địa và không kèm tọa độ. Giao diện ghi rõ điều này,
  không vẽ điểm GPS hoặc tuyên bố có geofence.
- Ảnh bìa được gắn nhãn ảnh tham khảo, không gắn với POI cụ thể.
- MP3 đã chuẩn bị ở bước trước nhưng chưa được tích hợp để phát trong trình duyệt; nút audio bị khóa.
- Số liệu ví dụ trong ảnh thiết kế không được dùng làm số liệu thật.
- Creator/Admin giữ khung trang hiện có; phần này chỉ thay trang khám phá.

## Kiểm tra

- `npm test`: 22 test đạt (18 test auth hiện có + 4 test trang khám phá).
- `npm run build`: TypeScript và Vite đạt, 34 modules.
- Prettier và `git diff --check`: đạt; Git chỉ thông báo chuẩn hóa LF/CRLF trên Windows.
- Microsoft Edge headless, với phiên đăng nhập giả lập chỉ trong trình duyệt kiểm thử:
  - Desktop 1366×900: đủ 10 thẻ, ảnh tải, không tràn ngang.
  - Tablet 768×1024: đủ 10 thẻ, ảnh tải, không tràn ngang.
  - Mobile 390×844: đủ 10 thẻ, ảnh tải, không tràn ngang.
  - Hẹp 320×720: đủ 10 thẻ, ảnh tải, không tràn ngang.
- Đã xác nhận nút điều hướng cuộn đến phần tương ứng mà không đổi hash route; chọn Căng tin
  cập nhật tiêu đề và nội dung panel chi tiết.
- Ảnh kiểm tra: [desktop](../screenshots/explore-redesign-desktop.png),
  [tablet](../screenshots/explore-redesign-tablet.png),
  [mobile](../screenshots/explore-redesign-mobile.png).

Lượt đầu có hai lỗi ở test mới: câu mô tả được tìm thấy đồng thời trong danh sách và panel chi tiết,
và test giả định hash ban đầu là `#/login`. Đã giới hạn truy vấn vào panel chi tiết và so sánh hash
trước/sau thao tác; 22 test chạy lại đều đạt.

Không gọi Atlas hoặc API trong kiểm tra hình ảnh; phiên `phong` được giả lập trong browser test,
không tạo/sửa tài khoản hay dữ liệu database. Không chạy lại E2E auth/Atlas vì phần này chỉ thêm
giao diện; 4 E2E auth gần nhất được ghi tại [báo cáo P1.4](P1_4_AUTH_UI.md).

## Đối chiếu kế hoạch

Hoàn thành lớp giao diện của trang người tham quan theo mẫu. Chưa hoàn thành nghiệp vụ bản đồ,
POI/API/database, geofence hoặc nghe audio; các phần này vẫn ở trạng thái chưa làm trong
[WORK_BREAKDOWN](../WORK_BREAKDOWN.md). Ảnh sơ đồ để thay placeholder chưa có trong tài liệu được
đính kèm ở lượt này; khi có ảnh, có thể thay component `CampusMapPreview` mà không đổi layout còn lại.
