# Audio English đã duyệt và công bố — 24/10/2026

## Kết quả

- Người dùng đã nghe kiểm tra và duyệt audio cùng bản dịch English ngày 24/10/2026. Nguồn nội dung: `data/sources/campus-en-translation-draft-2026-10-24.md`.
- Giọng đọc nam Edge TTS `en-US-GuyNeural`; tốc độ, cao độ và âm lượng giữ mặc định (`+0%`, `+0Hz`, `+0%`).
- Tổng dung lượng: 1,264,032 byte; tổng thời lượng: khoảng 3 phút 31 giây.
- Các file nằm trong `data/generated/audio/en-male/`; `manifest.json` ghi nguồn, phiên bản văn bản, SHA-256 và metadata MP3.
- Kiểm tra metadata/frame MP3: đủ 10/10, 24 kHz, 48 kbps; người dùng xác nhận chất lượng nội dung/audio đạt.
- Đã nhập 10 asset English vào GridFS, lưu localization trong draft và công bố release `09d43a32-43d1-4f2b-85d0-cdae2ad29981` trên Atlas.
- API local xác nhận đủ 10 bản dịch + 10 audio English. Byte range English và Vietnamese đều trả HTTP 206, nên audio cũ vẫn được giữ trong release mới.

## Kiểm tra mã

- `ruff check app/commands/generate_demo_audio_en.py tests/unit/test_demo_audio_en.py`: đạt.
- `ruff format --check app/commands/generate_demo_audio_en.py tests/unit/test_demo_audio_en.py`: đạt.
- Backend hồi quy toàn bộ: 181 test đạt, 16 integration test bỏ qua theo cấu hình mặc định. Frontend: 61 test đạt; build/typecheck đạt.

## Giới hạn và bước tiếp theo

- Bản dịch và audio đã lưu theo ngôn ngữ trong snapshot bất biến; mỗi bản dịch gắn checksum mô tả Việt nguồn. Khi mô tả Việt thay đổi, bản dịch cũ sẽ không đi vào release tiếp theo cho đến khi được cập nhật.
- Code đã tích hợp tại workspace local. Render báo service `sgu-campus-guide-demo` “Suspended by you”, vì vậy chưa deploy code lên đó. Kiểm thử vật lý trên iPhone/Safari cho MP3 tiếng Anh chưa chạy trong lượt này.

