# Project data

- `samples/`: mẫu có nguồn hoặc ghi rõ mô phỏng; hiện chưa có bộ mẫu tách riêng.
- `sources/`: văn bản nguồn có xuất xứ; đã có [10 địa điểm tiếng Việt do người dùng cung cấp](sources/campus-vi-user-2026-10-21.md).
- `local/`: đầu vào khảo sát cục bộ, không commit.
- `generated/`: MP3/bản đồ đóng gói/file sinh ra, không commit.
- Không đưa file lớn, dữ liệu tài khoản hoặc bí mật vào Git.
- Kiểm tra dữ liệu theo [hướng dẫn nội dung](../docs/CONTENT_GUIDE.md)
  trước khi nhập MongoDB/GridFS.

## Chuẩn bị MP3 tiếng Việt giọng nam

Từ thư mục backend:

```powershell
uv sync --locked
uv run --frozen python -m app.commands.generate_demo_audio
```

Lệnh gửi nguyên văn phần mô tả của 10 mục trong nguồn đã chọn tới Edge-TTS,
dùng vi-VN-NamMinhNeural, tốc độ/âm lượng/cao độ mặc định. Cần mạng để tạo file.
Không đọc tiêu đề, metadata nguồn hoặc tự sửa chữ viết tắt KLF.
Đầu ra: data/generated/audio/vi-male, gồm MP3 từng điểm và manifest.json.
Tên file gắn phiên bản văn bản/giọng; manifest có text/file checksum, thời lượng, dung lượng.
Chỉ đặt complete=true khi cả 10 mục có file qua kiểm tra MP3.
Ghi file tạm rồi thay file đích, thử tối đa hai lần/mục; chạy lại để tiếp tục,
chỉ tái sử dụng file khớp phiên bản và checksum đã ghi. Không tự xóa phiên bản MP3 cũ.
MP3/manifest sinh ra nằm ngoài Git. Mười MP3 tiếng Việt và mười MP3 English của demo đã được nhập GridFS; nội dung được công bố theo các báo cáo demo. Đây là lệnh tái tạo asset, không tự nhập hoặc công bố dữ liệu khi chạy.
