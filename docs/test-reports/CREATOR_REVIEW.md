# Creator gửi đề xuất và Admin duyệt

## Phạm vi

Theo quyết định ngày 22/10/2026, Creator được đề xuất thay đổi toàn tour khuôn viên. Creator
lưu bản riêng, gửi để Admin xem xét; Admin duyệt hoặc trả kèm ghi chú. Chấp thuận chỉ cho phép
đưa đề xuất vào nháp Admin nếu revision gốc còn khớp. Admin tiếp tục kiểm tra, nghe thử rồi công bố
riêng. Snapshot đang phát không bị sửa khi Creator gửi/được duyệt.

## Thay đổi

- Thêm collection `content_submissions`, index theo Creator và trạng thái; chạy lại an toàn qua
  `python -m app.commands.init_database`.
- Backend kiểm tra quyền Creator/Admin, sở hữu proposal, trạng thái và revision; ghi có CSRF.
- Creator xem nội dung hiện hành làm điểm xuất phát, sửa/tạo/xóa địa điểm trong bản riêng,
  lưu, gửi duyệt, xem trạng thái và chỉnh lại khi bị trả về.
- Admin xem toàn nội dung proposal, duyệt/trả ghi chú, rồi áp dụng proposal đã duyệt vào nháp.
  Nếu nháp gốc đổi hoặc proposal đã áp dụng, thao tác xung đột trả 409.
- Nội dung và proposal dùng truy vấn primary để chuỗi ghi/đọc sau duyệt nhìn thấy revision mới.

## Kiểm tra

- Backend: **153 test đạt, 16 Atlas test bỏ qua** trong lần chạy cục bộ. Ruff check/format đạt.
- Atlas thật: **1 test biệt lập đạt** cho index, quyền sở hữu, gửi đồng thời chỉ một lần thắng,
  duyệt và áp dụng; collection kiểm thử được xóa/xác minh.
- Frontend: **38 test đạt**, TypeScript/build thành công; gồm kiểm tra chặn lưu/công bố
  khi yêu cầu áp dụng proposal chưa hoàn tất và dùng revision mới sau khi áp dụng.
- Edge với Atlas và GridFS test cô lập: **10/10 test đạt** (5 kịch bản × desktop/mobile,
  lượt cuối 2,7 phút), gồm auth, RBAC, quản lý tài khoản, audio/sửa/công bố và Creator duyệt toàn tour.
  Xác minh snapshot cũ còn nguyên sau apply và chỉ đổi sau khi Admin công bố.
- Đã tìm và sửa lỗi đồng bộ revision giữa trang Nội dung và luồng áp dụng; kiểm thử trình duyệt
  sau sửa gửi đúng revision hiện hành.
- Rà lại toàn bộ phát hiện thao tác công bố có thể chạy trước khi phản hồi áp dụng về.
  Đã dùng trạng thái bận chung để khóa thao tác nội dung trong lúc áp dụng; không cho áp dụng
  khi bản nháp đang có thay đổi chưa lưu. Kiểm thử E2E chờ thông báo áp dụng thành công trước
  khi xác minh snapshot/công bố, rồi khôi phục dữ liệu fixture cho viewport tiếp theo.
- Lần chạy nhầm mặc định cổng 5173 bị dừng ở đăng nhập; kết quả đó không được tính là đạt.
  Lượt xác minh cuối dùng server biệt lập cổng 8001 và đặt `E2E_BASE_URL` tường minh.
- Đã dừng server kiểm thử và xác minh xóa các collection/bucket biệt lập sau lượt cuối.
  Ứng dụng cổng 8000 đã khởi động lại với API Creator/Admin mới; readiness trả 200.

## Giới hạn còn lại

- Mỗi proposal là bản toàn tour; chưa có giao việc theo địa điểm hoặc chỉnh sửa đồng thời nhiều Creator.
- Creator đang dùng nội dung tiếng Việt có sẵn làm bản gốc; chưa có dịch Việt–Anh, audio Creator,
  jobs TTS, audit log độc lập hoặc thông báo khi Admin duyệt.
- Kiểm tra trình duyệt dùng Edge với viewport desktop/mobile, chưa phải điện thoại vật lý/Safari.
