# Frontend

React 19.2, TypeScript, Vite 7. Có đăng ký/đăng nhập, AuthClient và khung trang theo role.
Trang khám phá sau đăng nhập hiển thị 10 mô tả từ nội dung người dùng cung cấp; dữ liệu đang tĩnh ở
`src/features/tours/campusPlaces.ts`, chưa tải từ API/database. Sơ đồ là vùng giữ chỗ cho ảnh bản đồ
được cung cấp sau. GPS, bản đồ thật, trình phát audio, chức năng quản trị và service worker chưa tích hợp.

Từ thư mục frontend:
```powershell
npm ci
npm run dev
```

Vite proxy /api tới 127.0.0.1:8000 để phát triển cùng backend.
Không đặt secrets vào biến VITE_* hoặc public/.

Kiểm tra:
```powershell
npm run typecheck
npm run build
npm test
```

Build tạo dist/. Để thử frontend và API cùng địa chỉ, đặt FRONTEND_DIST
của backend trỏ tới thư mục dist đã build. Xem [README gốc](../README.md).
[Feature boundaries](src/features/README.md) mô tả các thư mục đang giữ chỗ.
MapLibre, PMTiles, Workbox và thư viện IndexedDB sẽ được thêm khi triển khai tính năng,
không được coi là đã tích hợp chỉ vì có trong kế hoạch.

## Giao diện và phiên

- /#/login và /#/register: form tiếng Việt, kiểm tra xác nhận mật khẩu, chống gửi lặp.
  Trang đăng nhập dùng ảnh khuôn viên người dùng cung cấp, lớp phủ tối và thẻ form sáng;
  ảnh được đóng gói trong frontend/public/images, không tải từ dịch vụ ảnh ngoài.
- /#/explore: trang khám phá với 10 mô tả tĩnh từ nguồn, vùng sơ đồ giữ chỗ và chọn nội dung.
  Chưa có GPS/map thật/audio player; /#/admin và /#/creator giữ khung theo role.
- Các thẻ quản lý/audio hiện ghi “Sắp có”, không có số liệu dashboard giả.
- AuthClient giữ dữ liệu công khai/mốc hết hạn trong RAM, cookie do backend quản lý.
- Khôi phục phiên khi mở trang, gia hạn trước hạn 30 giây, logout và cập nhật giữa tab.
- JWT/refresh/CSRF không lưu vào localStorage, sessionStorage hoặc IndexedDB.
- Lỗi kết nối không bị coi như sai mật khẩu; logout lỗi báo rõ chưa hoàn tất.

Giao diện tự dùng font hệ thống khi Google Fonts không tải được.
Hash routing hoạt động khi phục vụ dist cùng FastAPI, không cần SPA fallback.
Không tạo sẵn tài khoản Admin trên database ứng dụng. Tài khoản đăng ký công khai chỉ có role User.

Kiểm thử trình duyệt dùng Atlas biệt lập theo [test README](tests/README.md).
Kết quả auth ở [báo cáo P1.4](../docs/test-reports/P1_4_AUTH_UI.md), cập nhật giao diện
và ảnh desktop/mobile ở [báo cáo thiết kế lại](../docs/test-reports/P1_4_AUTH_UI_REDESIGN.md).
