# Đồng bộ tên và icon điều hướng — 22/10/2026

Theo yêu cầu người dùng, đổi tên màn hình hiện có tại `#/admin` thành **Nội dung**
Tiêu đề tương ứng: “Nội dung khuôn viên” và “Không gian quản trị”.
Đổi cả liên kết từ trang khám phá và hướng dẫn mở màn hình chức năng trong README.

Hai trang dùng chung `shared/WorkspaceNav.tsx`, cùng thứ tự Khám phá / Nội dung / Quản trị,
cùng icon, nhãn vai trò và cách đánh dấu trang hiện tại. Route, API và quyền không thay đổi;
chưa bổ sung nghiệp vụ cho trang khung Quản trị. Kế hoạch ba vai trò và phạm vi demo giữ nguyên.

Kiểm tra đã chạy:

- `npm test`: 27 test đạt; cập nhật tên hiển thị trong các test liên quan.
- `npm run build`: TypeScript và Vite đạt; frontend build tại cổng 8000 đã có thay đổi.
- Edge headless, 1366×900 và 390×900: chuyển cả hai trang, tên/thứ tự/icon không đổi,
  aria-current theo đúng route và không tràn ngang. Đã xem ảnh desktop trang Quản trị.
  png` (gitignored).
  Phiên/API được giả lập chỉ trong browser kiểm thử; không đọc/sửa dữ liệu ứng dụng.
- `git diff --check`: kiểm tra sau cập nhật.

Không chạy lại backend/Atlas hoặc E2E nghiệp vụ đầy đủ vì phần này chỉ đổi nhãn/icon và
dùng chung component điều hướng. Chưa thử điện thoại vật lý. Không phát hiện lỗi trong phạm vi kiểm tra.
