# Infrastructure

- [Dockerfile](Dockerfile): build frontend rồi phục vụ cùng FastAPI.
- [compose.yaml](../compose.yaml): môi trường phát triển nội bộ, MongoDB có volume.
- MongoDB trong Compose chưa bật xác thực, chỉ bind cổng ra localhost.
  Không dùng cấu hình này để công khai cơ sở dữ liệu lên Internet.
- Backend hiện chưa kết nối MongoDB; khai báo service không có nghĩa tích hợp đã xong.
- Chưa triển khai Render/Atlas hoặc HTTPS. Chưa xác minh build Docker trên máy hiện tại.

Lệnh dự kiến sau khi cài Docker: `docker compose up --build`.
Khi triển khai thật, bổ sung secrets, HTTPS và sao lưu theo [kiến trúc](../docs/ARCHITECTURE.md).
