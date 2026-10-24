# Tiến độ giao diện đa ngôn ngữ — 24/10/2026

## Đã làm

- Bật bộ chọn Tiếng Việt, English và 한국어 trên trang welcome và trong hành trình khách.
- Lưu lựa chọn giao diện ở trình duyệt để giữ nguyên khi đổi route hoặc tải lại.
- Thêm bản dịch giao diện ban đầu cho welcome, thanh điều hướng, trang khám phá, bản đồ, điều khiển GPS/geofence, thông báo audio và footer.
- Soạn 10 bản dịch English theo đúng thứ tự/tên POI, chỉ dùng thông tin từ nguồn người dùng cung cấp. Người dùng đã rà và duyệt bản dịch/audio ngày 24/10/2026.
- Bản dịch được lưu trong draft theo từng POI, kèm checksum của mô tả Việt làm cơ sở để ẩn bản dịch nếu nguồn Việt thay đổi.
- Đã tạo 10 MP3 tiếng Anh giọng nam `en-US-GuyNeural`, nhập 10 asset vào GridFS và công bố release song ngữ. Audio Việt cũ vẫn được gắn riêng theo `vi`; English audio được gắn theo `en`.
- Trình phát chọn audio khớp ngôn ngữ đang nghe; nếu POI chưa có audio cho ngôn ngữ đó, giữ audio tiếng Việt. Marker và card vẫn dùng biểu tượng dựa trên tiêu đề POI gốc nên giống giao diện tiếng Việt.

## Kiểm tra

- Frontend: 61 test đạt (9 test files), gồm chuyển ngôn ngữ, phát English audio và biểu tượng POI ổn định.
- Backend: 181 test đạt, 16 test integration được skip theo cấu hình mặc định.
- Ruff check/format và frontend typecheck/production build đạt.
- Build báo kích thước chunk MapLibre lớn hơn 500 kB; đây là cảnh báo tối ưu bundle, không làm build thất bại.
- Chưa chạy E2E hoặc kiểm tra trực quan trên điện thoại trong lượt này.

## Còn lại / bước kế tiếp

- Chưa có nội dung/audio POI tiếng Hàn; UI tiếng Hàn hiện hiển thị nội dung tiếng Việt.
- Code local đã tích hợp và release dữ liệu đã công bố lên Atlas. Render đang báo service `sgu-campus-guide-demo` “Suspended by you”, nên chưa deploy code lên dịch vụ đó.
- Sau khi chốt bản dịch, kiểm tra lại bố cục mobile cho các ngôn ngữ có độ dài chữ khác nhau.

## Mã liên quan

- `frontend/src/shared/i18n.ts`
- `frontend/src/app/App.tsx`
- `frontend/src/features/guest/GuestWelcome.tsx`
- `frontend/src/features/tours/ExploreScreen.tsx`
- `frontend/src/features/tours/ExplorePage.tsx`
- `backend/app/commands/publish_demo_english.py`
- `frontend/src/features/tours/campusEnglishDraft.ts` (fallback cục bộ trong lúc release chưa tải được)
- `frontend/src/features/tours/AudioPlayer.tsx`
- `frontend/src/features/map/LocationControls.tsx`
- `frontend/tests/i18n.test.ts`
- `backend/app/commands/generate_demo_audio_en.py`
- `backend/tests/unit/test_demo_audio_en.py`

## Bổ sung giao diện mobile — 24/10/2026

- Khôi phục nút chọn ngôn ngữ trên header Welcome ở màn hình rộng tối đa 720 px; trước đó CSS mobile ẩn hoàn toàn nút này.
- Thu gọn nhãn phụ và khoảng cách để logo, lựa chọn ngôn ngữ cùng hiển thị trên màn hình hẹp. Menu vẫn mở được và liệt kê Tiếng Việt, English, 한국어.
- Kiểm tra trực quan trên tab local ở khung điện thoại: nút và menu hiển thị; Playwright screenshot CLI không chạy được vì máy chưa có Chromium headless được cài đặt.
- Frontend build/typecheck đạt; 61 test qua (9 files). Build vẫn có cảnh báo bundle MapLibre lớn hơn 500 kB.
