# Frontend tests

## Hồi quy hiện hành — 24/10/2026

- Unit/UI: 39 test đạt; `npm run build` (typecheck + build) đạt.
- E2E: 12 test đạt trên desktop/mobile với server và collection/bucket Atlas biệt lập; shutdown xác nhận dọn sạch.
- Không dùng credentials hoặc dữ liệu tài khoản ứng dụng thật trong E2E; fixture dùng tài khoản giả chỉ tồn tại trong collection tạm.

## Test cục bộ

gửi Admin duyệt và chặn công bố khi đang áp dụng đề xuất. Xem

Cập nhật tách trang ngày 22/10: **36 test đạt**, có thêm kiểm tra quyền trang Quản trị,
tách API nội dung/tài khoản, phân trang, lỗi tải/thử lại, giữ thay đổi khi lưu thất bại và
bảo vệ Admin. Xem [báo cáo](../../docs/test-reports/MANAGEMENT_PAGE.md).

Cập nhật 22/10: 27 test đạt, gồm 5 test mới cho API nội dung, form quản trị và player.
Audio thiếu được hiển thị đúng; trang ứng dụng không dùng fallback nội dung tĩnh.
Kết quả cũ bên dưới giữ để đối chiếu mốc P1.4.

Từ frontend: `npm test`. Vitest/jsdom và Testing Library kiểm tra client/form bằng fetch giả,
không gọi Atlas. P1.4: 18 test đạt, gồm refresh single-flight, CSRF retry có giới hạn,
logout đang có refresh, lỗi mạng không giả thành logout thành công, timer cleanup,
form xác nhận mật khẩu, đăng ký không gửi role, gửi lặp và route guard theo role.
Thêm 4 test trang khám phá: đủ 10 mô tả nguồn, đổi địa điểm đang xem, audio khóa đến khi tích hợp,
và điều hướng trong trang không làm thay đổi hash route. Tổng hiện tại: 22 test.
`npm run build` kiểm tra TypeScript và tạo dist, không thay test hành vi.

## Test Edge với API/Atlas thật

luồng đề xuất kiểm tra lưu riêng, gửi duyệt, áp dụng mà chưa đổi snapshot công bố,
công bố riêng và khôi phục dữ liệu kiểm thử. Server biệt lập đã dọn/xác minh dữ liệu.

Sau khi tách trang: **8 test đạt**, gồm quản lý tài khoản tạm từ trang Quản trị riêng.
`E2E_BASE_URL` cho phép chạy vào server biệt lập ở cổng khác để giữ app thật đang hoạt động.
Khi dùng cổng khác, phải đặt biến này trong chính terminal chạy Playwright; nếu bỏ qua,
Playwright dùng mặc định cổng 5173. Chờ thông báo server biệt lập sẵn sàng trước khi chạy.
sau khi xác minh công bố để lượt viewport tiếp theo còn audio khớp với văn bản nguồn.
Lượt này dùng frontend build cùng nguồn trên cổng 8001, origin cho phép chỉ 8001 ở process
kiểm thử; không đổi cấu hình ứng dụng thật. Server test có route shutdown đặt trước static
mount để dọn dữ liệu khi phục vụ build trực tiếp.

Cập nhật 22/10: 6 test (3 kịch bản × desktop/mobile), gồm phát MP3/GridFS thật,
upload và công bố nội dung. Server biệt lập cần bộ 10 MP3 + manifest tại
`data/generated/audio/vi-male` và nguồn trong repo; không tự tạo TTS khi khởi động test.
Ngoài users/sessions, nội dung/assets/audio_selections và bucket GridFS cũng biệt lập,
được dọn/xác minh khi shutdown. Xem docs/test-reports/DEMO_CONTENT_AUDIO_ADMIN.md.

Cần Edge được cài trên máy Windows hiện tại, backend/.env cấu hình Atlas/JWT_SECRET,
cổng 8000 và 5173 chưa được tiến trình khác sử dụng. Không chạy test này vào API ứng dụng
đang có dữ liệu thật: các test cần server biệt lập bên dưới để dùng tài khoản kiểm thử tạm.

Terminal 1, từ backend:

```powershell
uv run --frozen python -m tests.serve_auth_browser
```

Chờ dòng ready. Server chỉ bind 127.0.0.1:8000, tạo collection tạm và hai tài khoản test

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
