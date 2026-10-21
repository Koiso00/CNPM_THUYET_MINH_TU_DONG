# Frontend tests

## Test cục bộ

Từ frontend: `npm test`. Vitest/jsdom và Testing Library kiểm tra client/form bằng fetch giả,
không gọi Atlas. P1.4: 18 test đạt, gồm refresh single-flight, CSRF retry có giới hạn,
logout đang có refresh, lỗi mạng không giả thành logout thành công, timer cleanup,
form xác nhận mật khẩu, đăng ký không gửi role, gửi lặp và route guard theo role.
Thêm 4 test trang khám phá: đủ 10 mô tả nguồn, đổi địa điểm đang xem, audio khóa đến khi tích hợp,
và điều hướng trong trang không làm thay đổi hash route. Tổng hiện tại: 22 test.
`npm run build` kiểm tra TypeScript và tạo dist, không thay test hành vi.

## Test Edge với API/Atlas thật

Cần Edge được cài trên máy Windows hiện tại, backend/.env cấu hình Atlas/JWT_SECRET,
cổng 8000 và 5173 chưa được tiến trình khác sử dụng. Không chạy test này vào API ứng dụng
đang có dữ liệu thật: các test cần server biệt lập bên dưới để dùng tài khoản kiểm thử tạm.

Terminal 1, từ backend:

```powershell
uv run --frozen python -m tests.serve_auth_browser
```

Chờ dòng ready. Server chỉ bind 127.0.0.1:8000, tạo collection tạm và hai tài khoản test
Creator/Admin; không tạo tài khoản đặc quyền trong users ứng dụng.

Terminal 2, từ frontend:

```powershell
npm run dev -- --host 127.0.0.1 --strictPort
```

Terminal 3, từ frontend:

```powershell
npm run test:e2e
```

4 test (2 kịch bản × desktop/mobile viewport) chạy Edge headless qua Vite proxy,
gọi API/Argon2/JWT/CSRF/repository/Atlas thật. Tài khoản test có mật khẩu giả công khai,
chỉ dùng với server biệt lập. Kiểm tra đăng ký/trùng tên/login/logout, mất access cookie,
hai tab cùng reload/refresh, đồng bộ logout, role và mất mạng.

Sau khi chạy xong, dừng server test theo đường dẫn chỉ có trong app kiểm thử:

```powershell
Invoke-WebRequest -Uri http://127.0.0.1:8000/_test/shutdown -Method Post
```

Chờ thông báo collection tạm đã được xóa và xác minh. Nếu cần dùng app thật sau đó,
chạy backend bằng uvicorn như README gốc; tài khoản test không dùng được trong app thật.
Server test/route shutdown không được import hoặc mount vào app production.

Ảnh/trace khi chạy nằm ở test-results (gitignored). Ảnh nghiệm thu P1.4 được lưu riêng trong docs/screenshots.
Đây là mobile viewport trên Edge máy tính, chưa phải thử điện thoại thật/Safari/PWA/GPS.
