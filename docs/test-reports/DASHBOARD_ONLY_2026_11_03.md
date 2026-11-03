# Trang quản trị chỉ có dashboard — 03/11/2026

Theo yêu cầu người dùng, trang Quản trị không còn danh sách tài khoản, thay đổi vai trò/trạng thái hoặc thẻ tổng tài khoản. Dashboard, bộ lọc ngày, thống kê khách/hành trình/audio, đăng nhập và xác thực Admin được giữ. API quản lý tài khoản đã được gỡ; không xóa hay thay đổi tài khoản trong Atlas.

Kiểm tra: 57 test frontend đạt, build/typecheck đạt; 186 test backend đạt, 16 integration test bỏ qua; Ruff đạt. Đã khởi động lại backend local, readiness `ready`/`connected` và GET đường dẫn API quản lý tài khoản trả 404. Không chạy E2E Atlas hoặc deploy Render trong lượt này. Build cảnh báo chunk MapLibre lớn.
