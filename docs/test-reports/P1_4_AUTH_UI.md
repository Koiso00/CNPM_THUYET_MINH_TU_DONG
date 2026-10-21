# P1.4 — Giao diện xác thực và trạng thái phiên

Ngày kiểm tra: 21/10/2026. React 19.2.9, Vite 7.3.7, TypeScript 5.9,
Vitest 5.0.5, Playwright 1.64.1, Windows/Edge với Atlas phát triển.

## Đã thực hiện

- UI đăng ký/đăng nhập tiếng Việt, xác nhận mật khẩu, hiện/ẩn mật khẩu, chống gửi lặp.
- Đăng ký chỉ gửi username/password, thông báo thành công rồi cho đăng nhập.
- Mật khẩu 15–128 ký tự Unicode (đếm code point), giữ dấu cách.
- AuthClient cùng origin/CSRF, khôi phục phiên, tự gia hạn trước hạn 30 giây,
  GET 401 refresh và thử lại một lần, không tự gửi lại credential POST khi timeout.
- Single-flight refresh, Web Locks giữa tab, BroadcastChannel không chứa token,
  generation guard ngăn phản hồi cũ phục hồi UI sau logout.
- Không lưu JWT/refresh/CSRF vào Web Storage/IndexedDB; chỉ có User công khai và expiry trong RAM.
- Lỗi mạng/503 có thông báo tiếng Việt/thử lại; logout lỗi không giả báo thành công.
- Hash routing và khung trang theo vai trò, User/Creator không mở khu Admin.
- Menu/thẻ tính năng chưa triển khai có nhãn “Sắp có”, không có dashboard số liệu giả.
- Minh họa khuôn viên bằng CSS có nhãn hình minh họa, không dùng như bản đồ/tòa nhà được xác minh.

## Kiểm tra đã chạy

| Lệnh/kiểm tra | Kết quả |
| --- | --- |
| `npm test` tại frontend | 18 passed, 2 test files, 7.14s |
| `npm run build` | TypeScript và Vite production build đạt; 32 modules |
| `npm run test:e2e` | 4 passed, 28.5s, Edge thật/API thật/Atlas tạm |
| Backend Ruff check/format | Đạt, 62 files |
| Xem ảnh desktop/mobile | Đã xem, sửa khoảng trắng trong tiêu đề mobile và chụp lại |

Hai project Edge: desktop 1366×900, mobile viewport 390×844 (touch emulation).
E2E thử đăng ký/trùng tên/login/logout, reload mất access cookie, kiểm tra HttpOnly,
Web Storage rỗng, hai tab cùng reload đều refresh 200, logout đồng bộ tab,
Admin mở khung quản trị, Creator bị chặn Admin nhưng mở khung nội dung,
sai mật khẩu và mất mạng giữ tên đăng nhập. Không có tràn ngang ở viewport kiểm tra.

Test browser dùng tests.serve_auth_browser, tạo đúng hai collection ngẫu nhiên, seed
Creator/Admin giả trong đó và đăng ký User qua UI. Không ghi users/sessions ứng dụng.
Sau kiểm thử đã dừng server test qua loopback, cả hai collection tạm được xóa/xác minh.
Sau đó chạy lại backend phát triển thật và Vite để người dùng xem giao diện.

Ảnh sau lần kiểm tra cuối:

- [Desktop](../screenshots/p1_4-login-desktop.png)
- [Mobile viewport](../screenshots/p1_4-login-mobile.png)

## Lỗi đã sửa

- TypeScript ban đầu báo Web Locks trả kiểu Promise lồng nhau theo DOM typing.
  Đã dùng async/await để thống nhất Coordinator, build đạt.
- Xem ảnh phát hiện tiêu đề thiếu khoảng trắng khi ẩn br trên mobile; đã sửa và kiểm thử lại đạt.
- Không còn lỗi được phát hiện trong phạm vi kiểm tra đã chạy.

## Giới hạn

Chưa thử trên điện thoại vật lý hoặc Safari. Mobile ở đây là viewport Edge máy tính.
Timer auto-refresh được kiểm tra bằng fake clock; không chờ 7 ngày thực.
Web Locks/BroadcastChannel đã kiểm tra trên Edge; fallback thiếu hai API này chưa nghiệm thu nhiều tab.
Chưa có logout offline/pending-revocation (P4), service worker, quản lý nội dung/user/dashboard hoặc trình phát.
Khung quản trị theo role không thay kiểm tra quyền API; backend vẫn là nơi quyết định quyền thực tế.
Chưa tạo Admin đầu tiên cho database ứng dụng; cách cấp tài khoản cần chốt ở phần quản trị.
Google Font có fallback hệ thống; chưa đóng gói font offline. Không thêm offline trở lại demo 2 ngày.
Không chạy lại toàn bộ pytest vì không sửa mã backend production; chạy Ruff và E2E thật cho thay đổi hiện tại.

## Đối chiếu kế hoạch

Đạt tiêu chí P1.4 trong WORK_BREAKDOWN và ưu tiên UI của demo 2 ngày, chưa hoàn tất demo toàn bộ.
Hash routing là lựa chọn kỹ thuật để hỗ trợ reload khi phục vụ cùng FastAPI, không đổi yêu cầu nghiệp vụ.
Tiếp theo: địa điểm/nội dung, API quản trị và tích hợp MP3 đã chuẩn bị; chỉ số dashboard/cấp Admin
cần chốt ở phần tương ứng như DEMO_2_DAYS đã ghi.
