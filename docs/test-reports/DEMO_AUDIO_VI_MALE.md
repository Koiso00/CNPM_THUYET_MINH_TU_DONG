# Chuẩn bị audio demo — tiếng Việt, giọng nam

Ngày kiểm tra: 21/10/2026. Người dùng chọn Edge-TTS giọng nam tiếng Việt cho
[10 mô tả đã cung cấp](../../data/sources/campus-vi-user-2026-10-21.md).

## Kết quả

- Đã xác nhận trực tiếp dịch vụ có vi-VN-NamMinhNeural, Locale=vi-VN, Gender=Male.
- Tạo thành công 10/10 MP3, không phát sinh lỗi provider trong lượt tạo thực tế.
- Giữ nguyên văn phần mô tả, không đọc tiêu đề/metadata, không thay KLF hoặc thêm lịch sử.
- Tốc độ +0%, âm lượng +0%, cao độ +0Hz (mặc định).
- Tổng 1,266,048 byte, 211.008 giây (khoảng 3 phút 31 giây).
- Mỗi file dài 19.416–23.088 giây, 24 kHz, 48 kbps theo metadata MP3.
- Đầu ra: data/generated/audio/vi-male, gồm 10 MP3 và manifest.json; Git đã bỏ qua.

## Triển khai và kiểm thử

Lệnh từ backend: `uv run --frozen python -m app.commands.generate_demo_audio`.
Edge-TTS 7.3.1 và mutagen 1.48.1 được khóa trong uv.lock.

Lệnh kiểm thử: `uv run --frozen pytest -q --tb=short`.
Kết quả: **131 passed, 14 skipped (7.26s)**; các test Atlas bị skip có chủ đích,
không chạy lại vì phần này không sửa luồng auth/MongoDB.

7 test mới kiểm tra nguồn thiếu/đảo thứ tự/rỗng, không đọc metadata,
provider lỗi không để lại file MP3 dở, checksum không khớp thì tạo lại,
nội dung đổi tạo phiên bản khác và không chấp nhận dữ liệu giả MP3.
Đây là test cục bộ với renderer giả; không dùng chúng để khẳng định dịch vụ TTS thành công.

Tạo file thật qua dịch vụ: lệnh hoàn tất exit 0, manifest complete=true, đủ 10 mục ready.
Kiểm tra độc lập sau tạo: đủ 10 mục, khớp tên/thứ tự/text SHA-256/source SHA-256,
khớp SHA-256/kích thước/thời lượng/sample rate/bitrate của từng MP3, không còn file .part.
Ruff check/format và git diff --check đạt. Không phát hiện lỗi nghiệp vụ trong phạm vi kiểm tra này.

File được ghi tạm rồi thay tên, retry tối đa hai lần/mục, timeout 60 giây/lần.
Chạy lại chỉ dùng file cũ nếu khớp phiên bản và checksum; chưa kiểm thử resume qua dịch vụ thật
vì không cần phát sinh lại yêu cầu khi toàn bộ file đã hoàn tất.

## Giới hạn và đối chiếu kế hoạch

Chưa nghe duyệt phát âm/ngắt câu từng file; cần người dùng nghe thử, đặc biệt KLF.
Kiểm tra kỹ thuật bằng parser MP3 không thay thế nghe duyệt hoặc giải mã/phát toàn bộ audio.
Chưa nhập GridFS, chưa có API media, trình phát, TTS job bền vững hoặc fallback 4 tầng.
Đây là chuẩn bị asset theo lựa chọn mới của người dùng cho demo, không hoàn tất toàn bộ P3.3.
Nguồn văn bản chưa được đối chiếu thực địa hoặc xác nhận chính thức của nhà trường.

Tham chiếu API sử dụng: [tài liệu dự án Edge-TTS](https://github.com/rany2/edge-tts).
