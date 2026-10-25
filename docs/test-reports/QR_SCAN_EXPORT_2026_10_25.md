# Báo cáo triển khai QR — 25/10/2026

## Phạm vi

- Admin tạo và tải PNG/SVG cho địa điểm có trong release công bố hiện tại.
- Khách quét QR bằng camera điện thoại để mở đúng POI; liên kết ngoài giữ POI đã chọn qua bước bắt đầu hành trình.
- Scanner trong ứng dụng chỉ chấp nhận URL cùng origin, đúng hash route `/welcome` và POI thuộc nội dung công khai đã tải.
- Ghi nhận `qr_scanned` có mã sự kiện idempotent; dashboard hiển thị tổng lượt quét và breakdown theo POI.
- Với POI mở từ QR, không phát audio ngôn ngữ khác nếu POI không có audio của ngôn ngữ đang chọn.
- Thư viện tạo mã và giải mã QR được tải tách riêng khi người dùng mở tính năng.

## Kiểm tra

- Frontend: **68 test đạt trên 10 file**; `npm run build` (bao gồm typecheck) đạt.
- Backend: **182 test đạt, 16 integration test bỏ qua** theo cấu hình mặc định.
- Ruff check và format check trên các file backend thay đổi: đạt.
- `git diff --check`: đạt.
- Ruff toàn `app tests` chưa đạt do hai lỗi định dạng ngoài phạm vi thay đổi: `app/commands/generate_demo_audio_en.py:189` (E501) và `tests/serve_auth_browser.py:3` (I001).
- Production build cảnh báo chunk MapLibre lớn hơn 500 kB; build vẫn thành công.

## Giới hạn

- Chưa kiểm tra camera trên điện thoại thật, quyền camera trên từng trình duyệt, hoặc khả năng tải QR khi ngoại tuyến.
- Chưa chạy E2E và chưa deploy. Render đang ở trạng thái tạm dừng; không coi code trong workspace là đã phát hành.
- QR chỉ được tạo cho POI đang có trong bản công bố; chưa có tải hàng loạt/ZIP.

## Mã liên quan

- `frontend/src/features/qr/`
- `frontend/src/app/App.tsx`
- `frontend/src/features/guest/session.ts`
- `frontend/src/features/tours/ExplorePage.tsx`
- `backend/app/api/v1/endpoints/events.py`
- `backend/app/repositories/admin.py`
- `backend/app/services/admin.py`
- `frontend/tests/qr.test.tsx`
- `backend/tests/unit/test_guest_events.py`
- `backend/tests/unit/test_admin_dashboard.py`
