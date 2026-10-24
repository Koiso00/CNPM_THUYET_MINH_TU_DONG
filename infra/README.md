# Infrastructure

- [Dockerfile](Dockerfile): build frontend rồi phục vụ cùng FastAPI.
- [compose.yaml](../compose.yaml): môi trường phát triển nội bộ, MongoDB có volume.
- MongoDB trong Compose chưa bật xác thực, chỉ bind cổng ra localhost.
  Không dùng cấu hình này để công khai cơ sở dữ liệu lên Internet.
- Backend có lifecycle/readiness; cấu hình Compose trỏ tới service mongo.
  Atlas có index User/session và ứng dụng demo dùng GridFS cho audio.
- Ứng dụng đã được triển khai lên Render trước đó; người dùng xác nhận dashboard hoạt động. Render hiện báo service `sgu-campus-guide-demo` “Suspended by you”; code workspace mới chưa deploy. Docker Compose/build chưa được xác minh trong lượt rà soát tài liệu này.

Lệnh dự kiến sau khi cài Docker: `docker compose up --build`.
Khi triển khai thật, bổ sung secrets, HTTPS và sao lưu theo [kiến trúc](../docs/ARCHITECTURE.md).
