> **Ưu tiên mới ngày 23/10/2026:** tạm hoãn toàn bộ QR (tạo/tải/in mã, mở từ QR, quét trong web và thống kê QR) đến khi hoàn thành Admin và thiết lập địa điểm/audio phát. Các thiết kế QR bên dưới được giữ cho giai đoạn sau. “Địa điểm phát” trước mắt là địa điểm gắn nội dung/MP3 và chọn nghe thủ công; nếu cần tự kích hoạt theo tọa độ/GPS thì phải chốt thêm.

> **Cập nhật kế hoạch demo 23/10/2026:** khách không đăng nhập, giữ ID khách khi quay lại cùng trình duyệt; mỗi lần tham quan có ID hành trình riêng. Creator/Admin gộp thành một vai trò, tạo một Admin ban đầu lúc thiết lập và xóa User/Creator cũ khi chuyển đổi. Có hai luồng QR; dashboard đếm ID khách truy cập theo ngày, hành trình và QR/audio theo điểm. Xem [kế hoạch demo mới](DEMO_GUEST_QR_PLAN.md). Đây là kế hoạch, chưa triển khai; các phần bên dưới mô tả ứng dụng đang chạy hoặc lịch sử.

# Phạm vi demo ưu tiên trong 2 ngày

Người dùng xác nhận ngày 21/10/2026. Đây là mục tiêu triển khai ngắn hạn, không phải cam kết
hoàn thành toàn bộ [kế hoạch gốc](PROJECT_PLAN.md). Chia nhỏ, test từng phần và báo giới hạn như trước.

## Phạm vi đã chọn

Cập nhật 23/10: áp dụng [kế hoạch khách, QR và vai trò nội bộ gộp](DEMO_GUEST_QR_PLAN.md). Người nghe không đăng nhập; Creator/Admin gộp thành vai trò quản trị demo.

- Giao diện đăng ký/đăng nhập và phân quyền truy cập.
- Người nghe xem/chọn địa điểm và phát audio thủ công.
- Admin quản lý địa điểm, nội dung/audio và user.
- Dashboard lấy số liệu từ dữ liệu thật trong hệ thống; không gán số người/lượt nghe giả.
- Tạm hoãn GPS, geofence, offline, AI và dịch tự động trong demo.

Phần mô tả và thứ tự theo ngày dưới đây phản ánh kế hoạch cũ đã triển khai. Kế hoạch demo mới ưu tiên một vai trò quản trị và các luồng khách/QR trong tài liệu liên kết ở trên.
Chưa đưa hiện diện tại POI/lượt đến theo GPS vào demo.

## Thứ tự thực hiện dự kiến

| Khoảng thời gian | Phần | Điều kiện kiểm tra |
| --- | --- | --- |
| Ngày 1, phần đầu | Hoàn thiện API auth, UI đăng ký/đăng nhập, trạng thái phiên và khung trang | Đăng nhập thật, không tự nâng quyền, logout chặn phiên cũ |
| Ngày 1, phần sau | Dữ liệu địa điểm/nội dung và màn hình danh sách/chỉnh sửa quản trị | Lưu/đọc MongoDB thật, User không gọi API quản trị |
| Ngày 2, phần đầu | Quản lý audio, trình phát, quản lý user và dashboard | Phát/tạm dừng/đổi điểm đúng; dashboard phản ánh dữ liệu đang có |
| Ngày 2, phần cuối | Kiểm thử xuyên suốt, sửa lỗi và chuẩn bị demo | Luồng User/Admin chạy lại được, lỗi mạng không làm mất dữ liệu form |

Đây là ước lượng có điều kiện, không khẳng định tỷ lệ % sản phẩm đầy đủ.
Ưu tiên demo chạy trên máy trước; public cloud cần kiểm tra triển khai riêng.

## Những thông tin còn chờ

Cập nhật 22/10: đã chốt bootstrap Admin bằng lệnh nâng tài khoản đã đăng ký; danh sách,
khóa/mở khóa/đổi vai trò user, không xóa; dashboard đếm dữ liệu thật của hệ thống;
Admin tải MP3 thay thế ≤10 MiB, công bố lại mới áp dụng. Các mục tương ứng không còn chờ quyết định.

- Nội dung đã được cung cấp: [10 địa điểm tiếng Việt](../data/sources/campus-vi-user-2026-10-21.md),
  người dùng chọn làm nguồn. Đã chọn tạo MP3 bằng Edge-TTS giọng nam tiếng Việt,
  dùng vi-VN-NamMinhNeural; phần chuẩn bị file được thực hiện riêng trước tích hợp trình phát.
  Không tự bịa lịch sử SGU hoặc đánh dấu nội dung đã xác minh thực địa.
- Chi tiết chỉ số dashboard, thao tác quản lý user và cách cấp tài khoản Admin đầu tiên
  cần làm rõ ở phần tương ứng trước khi triển khai hành vi liên quan.

## Trạng thái

- P1.3 API xác thực đã hoàn tất, xem [báo cáo](test-reports/P1_3_AUTH.md).
- Đã chuẩn bị 10 MP3 tiếng Việt giọng nam, xem [báo cáo audio](test-reports/DEMO_AUDIO_VI_MALE.md).
- P1.4 UI auth, trạng thái phiên và khung trang theo role đã hoàn tất, xem [báo cáo](test-reports/P1_4_AUTH_UI.md).
- P1.4.1 có trang khám phá, danh sách/chọn 10 mô tả nguồn và vùng chờ ảnh sơ đồ; audio/GPS chưa hoạt động,
  xem [báo cáo](test-reports/P1_4_1_EXPLORE_UI.md).
- Cập nhật 22/10: đã triển khai dữ liệu MongoDB, snapshot, quản trị nội dung/audio/user,
  dashboard và nghe thủ công từ GridFS. Đã nhập 10 mô tả vào nháp và 10 MP3;
  Admin nghe kiểm tra rồi công bố qua UI. Không tự công bố nội dung ứng dụng.
- Kiểm thử API/Atlas và Edge desktop/mobile viewport tại [báo cáo demo](test-reports/DEMO_CONTENT_AUDIO_ADMIN.md).
- Còn nghiệm thu phát âm/nội dung, điện thoại vật lý và triển khai cloud; Creator/GPS/offline/AI/dịch tự động vẫn hoãn.
