# Bản dịch và audio tiếng Hàn — 26/10/2026

## Đã chuẩn bị

- Bản dịch nháp cho 10 POI, giữ nguyên thứ tự và nội dung của nguồn tiếng Việt đã chọn: [campus-ko-translation-draft-2026-10-26.md](../../data/sources/campus-ko-translation-draft-2026-10-26.md).
- Đã tạo 10 MP3 bằng Edge-TTS, giọng nam `ko-KR-InJoonNeural`, tốc độ/âm lượng/cao độ mặc định.
- Manifest ghi nhận 10/10 file đạt kiểm tra MP3, tổng 1.528.128 byte. Mỗi file có checksum, thời lượng và phiên bản dựa trên giọng/văn bản.
- Đầu ra cục bộ: `data/generated/audio/ko-male/`; thư mục `data/generated/` được Git ignore.
- Lệnh tái tạo: từ `backend/`, chạy `uv run --frozen python -m app.commands.generate_demo_audio_ko`.

## Trạng thái ban đầu khi lập báo cáo

- Dịch thuật và giọng đọc là bản nháp, chưa được người dùng nghe duyệt.
- Chưa nhập các MP3 hoặc bản dịch vào Atlas/GridFS; chưa tạo release mới. Khách trên web hiện chưa nghe được audio tiếng Hàn.
- Giao diện và API hiện có hỗ trợ `ko`; sau khi duyệt, Admin có thể cập nhật bản dịch và MP3 tiếng Hàn trong `#/admin`, rồi công bố release.
- Tại thời điểm tạo audio, file gửi nguyên văn 10 mô tả dịch nháp tới Edge-TTS. Không gửi cấu hình bí mật, thông tin tài khoản hoặc dữ liệu Atlas.
- Không chạy hồi quy ứng dụng trong lượt tạo audio này. Bộ sinh đã tự kiểm tra khung MP3, checksum, dung lượng và thời lượng cho từng file.

## Cập nhật sau khi người dùng duyệt — 26/10/2026

- Người dùng đã duyệt bản dịch và audio tiếng Hàn.
- Đã nhập 10 MP3 mới vào GridFS, gắn bản dịch ko vào nội dung và công bố snapshot mới.
- Atlas release hiện hành: `2cebd7fb-7ca8-4719-819b-abb2a2191038`.
- Xác minh chỉ đọc sau công bố: release có 10 POI; 10/10 có bản dịch English và Korean, 10/10 có audio vi/en/ko. Audio Việt và English vẫn được giữ trong snapshot.
- Frontend production build và nghe thử trên trình duyệt chưa chạy trong lượt này. Render vẫn được ghi nhận ở trạng thái “Suspended by you”; cần khởi động service để khách truy cập bản release mới.

## Kiểm tra local sau công bố — 26/10/2026

- Khách chọn 한국어 tại `http://localhost:5173/#/welcome`; lựa chọn được giữ khi bắt đầu hành trình và mở trang khám phá.
- Giao diện khám phá tải 10/10 mô tả Korean từ release hiện hành; cả 10 điểm hiện trạng thái `KO · 승인됨` và dùng nhãn phát audio tiếng Hàn.
- Đã phát thử audio Khu A trong trình duyệt local. API HEAD trả 200 `audio/mpeg`, và GET `Range: bytes=0-3` trả 206 với 4 byte; release cung cấp đủ ánh xạ audio Hàn cho 10/10 điểm.
- Trong lần kiểm tra này, luồng khách đã gửi sự kiện visit, journey_started và audio_played tới database mà backend local đang cấu hình. Đây là dữ liệu từ thao tác kiểm thử, không phải người tham quan thực.
- Sửa nhãn trang chào mừng để khi chọn English/Korean, dòng giới thiệu không còn nói chỉ có audio tiếng Việt: [i18n.ts](../../frontend/src/shared/i18n.ts).
- Bản đồ nền Stadia không tải được trong phiên local; lỗi hiển thị còn bằng tiếng Việt. Không ảnh hưởng tải nội dung/audio từ backend, nhưng bản đồ chưa được xác minh trong lượt này.
- Không chạy được Vitest/build: `frontend/node_modules` hiện thiếu `vitest`, `typescript`, `vite`; `npm ci` bị Windows từ chối xóa `@esbuild/win32-x64/esbuild.exe` đang được tiến trình local sử dụng. Vì vậy không có kết quả build/test mới.
