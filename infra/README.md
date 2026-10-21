# Infrastructure

- [Dockerfile](Dockerfile): build frontend rồi phục vụ cùng FastAPI.
- [compose.yaml](../compose.yaml): môi trường phát triển nội bộ, MongoDB có volume.
- MongoDB trong Compose chưa bật xác thực, chỉ bind cổng ra localhost.
  Không dùng cấu hình này để công khai cơ sở dữ liệu lên Internet.
- Backend đã có lifecycle/readiness; cấu hình Compose trỏ tới service mongo.
  Atlas đã có index User/session được kiểm thử; Docker chưa chạy thử, GridFS chưa tích hợp.
- Atlas đã tạo và kết nối được. Chưa triển khai Render hoặc HTTPS, chưa xác minh build Docker.

Lệnh dự kiến sau khi cài Docker: `docker compose up --build`.
Khi triển khai thật, bổ sung secrets, HTTPS và sao lưu theo [kiến trúc](../docs/ARCHITECTURE.md).
