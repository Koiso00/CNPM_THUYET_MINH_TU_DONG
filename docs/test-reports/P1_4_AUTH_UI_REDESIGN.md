# P1.4 — Thiết kế lại giao diện đăng nhập

Ngày kiểm tra: 21/10/2026.

Trang đăng nhập dùng ảnh khuôn viên người dùng cung cấp làm nền, lớp phủ màu xanh đậm,
tiêu đề giới thiệu ở bên trái và form sáng ở bên phải. Trên màn hình hẹp, phần giới thiệu
và form xếp theo chiều dọc. Bảng màu lấy từ ảnh tham chiếu: xanh rừng `#1B4332`,
đỏ gạch `#C85A32`, vàng đất `#E0A96D` và màu trung tính. Thẻ thông tin ảnh không hiển thị
số liệu tham quan, thời lượng audio hay địa danh cụ thể chưa được tích hợp.

Hai ảnh gốc người dùng cung cấp được đóng gói nội bộ, tổng dung lượng 734,444 byte.
Ảnh không phụ thuộc máy chủ ảnh ngoài. Hành vi xác thực và API không đổi.

## Kiểm tra

- `npm test`: 18 test đạt.
- `npm run build`: typecheck và Vite production build đạt.
- Prettier check: đạt.
- Edge headless, 1366×900: trang/form và ảnh tải thành công, không tràn ngang.
- Edge headless, 390×844: trang/form và ảnh tải thành công, không tràn ngang.
- Ảnh đã xem trực quan: [desktop](../screenshots/auth-redesign-desktop.png),
  [mobile](../screenshots/auth-redesign-mobile.png).

Không chạy lại E2E xác thực/Atlas vì thay đổi chỉ nằm ở trình bày; 4 E2E auth gần nhất
được ghi trong [báo cáo P1.4](P1_4_AUTH_UI.md). Chưa kiểm tra trên thiết bị điện thoại vật lý.
