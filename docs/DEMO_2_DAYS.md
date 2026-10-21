# Phạm vi demo ưu tiên trong 2 ngày

Người dùng xác nhận ngày 21/10/2026. Đây là mục tiêu triển khai ngắn hạn, không phải cam kết
hoàn thành toàn bộ [kế hoạch gốc](PROJECT_PLAN.md). Chia nhỏ, test từng phần và báo giới hạn như trước.

## Phạm vi đã chọn

- Giao diện đăng ký/đăng nhập và phân quyền truy cập.
- Người nghe xem/chọn địa điểm và phát audio thủ công.
- Admin quản lý địa điểm, nội dung/audio và user.
- Dashboard lấy số liệu từ dữ liệu thật trong hệ thống; không gán số người/lượt nghe giả.
- Tạm hoãn GPS, geofence, offline, AI và dịch tự động trong demo.

Giữ mô hình ba vai trò hiện có. Không mặc nhiên gộp Creator/Admin; luồng Creator duyệt nội dung
đầy đủ vẫn nằm trong kế hoạch dài hạn, không phải đầu việc ưu tiên demo vừa chốt.
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
- Trình phát audio, chức năng quản trị và dashboard chưa triển khai; chưa có demo hoàn chỉnh.
- Tiếp theo: dữ liệu địa điểm/nội dung và quản trị; tích hợp MP3 đã có vào trình phát sau đó.
