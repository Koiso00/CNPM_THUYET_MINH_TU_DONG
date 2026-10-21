# Thiết lập MongoDB Atlas cho môi trường phát triển

Người dùng đã chọn Atlas cho giai đoạn phát triển. Hướng dẫn này cần thực hiện
bằng tài khoản Atlas của bạn; mã dự án không tự tạo cluster hoặc tài khoản cloud.

## 1. Tạo cluster miễn phí

1. Mở [MongoDB Atlas](https://cloud.mongodb.com/), đăng ký hoặc đăng nhập.
2. Tạo/chọn project. Có thể đặt tên project theo dự án để dễ tìm.
3. Tạo cluster, chọn **Free/M0**, rồi chọn provider và region được gói Free hỗ trợ.
4. Đặt tên cluster và chờ Atlas báo có thể kết nối. Không cần nạp sample dataset.

Tên project/cluster là tùy chọn của người tạo; không ảnh hưởng tên database của ứng dụng.
Theo [hướng dẫn chính thức](https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/).

## 2. Cấp kết nối cho ứng dụng

1. Trong Database Access, tạo Database User với tên và mật khẩu riêng.
2. Cấp quyền đọc/ghi cho database `sgu_campus_guide`.
3. Trong Network Access/IP Access List, thêm IP hiện tại của máy phát triển.
4. Nếu đổi mạng, kiểm tra lại IP được phép truy cập.

Database User là tài khoản MongoDB của ứng dụng, khác tài khoản đăng nhập Atlas,
và cũng khác User/Creator/Admin sẽ đăng nhập website thuyết minh.
Xem [điều kiện kết nối](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/)
và [quản lý Database User](https://www.mongodb.com/docs/atlas/security-add-mongodb-users/).

## 3. Điền cấu hình cục bộ

Chọn Connect → Drivers → Python để lấy URI. Thay placeholder mật khẩu bằng mật khẩu
Database User và giữ các tùy chọn Atlas cung cấp. Mật khẩu có ký tự đặc biệt phải được
URL-encode trong URI; không gửi URI có mật khẩu qua chat hoặc ghi vào tài liệu.

Mở `backend/.env` trên máy. Nếu chưa có, sao chép từ [.env.example](../backend/.env.example).
Chỉ điền giá trị thật trong .env, không sửa .env.example để chứa mật khẩu.

Các trường dùng ở P1.1:

```dotenv
MONGODB_URI=
MONGODB_DATABASE=sgu_campus_guide
MONGODB_TIMEOUT_MS=3000
```

Điền URI của bạn sau dấu bằng ở dòng đầu. URI không rỗng phải bắt đầu bằng
`mongodb://` hoặc `mongodb+srv://`.
Không dán URI vào FRONTEND_DIST; trường đó chỉ dùng cho đường dẫn thư mục frontend đã build.
Khi phát triển frontend bằng Vite, giữ FRONTEND_DIST trống.
Tên database hỗ trợ chữ/số ASCII, gạch dưới hoặc gạch ngang, tối đa 63 ký tự.
File .env đã được Git bỏ qua. Phần P1.1 không cần điền JWT/Gemini.

## 4. Kiểm tra

Từ thư mục backend:

```powershell
uv run --frozen uvicorn app.main:app --reload
```

Mở:
- [Liveness](http://127.0.0.1:8000/api/v1/health): tiến trình đang phục vụ.
- [Readiness](http://127.0.0.1:8000/api/v1/health/ready): ping database thật.

Readiness chỉ trả trạng thái, không trả URI hoặc mật khẩu:

| HTTP | database | Ý nghĩa |
| --- | --- | --- |
| 200 | connected | Ping MongoDB thành công |
| 503 | not_configured | MONGODB_URI chưa được điền |
| 503 | unavailable | Chưa kết nối được; kiểm tra cluster, tài khoản, IP và mạng |

Kết nối lỗi không làm liveness báo sai rằng tiến trình đã dừng.
Ping thành công chưa chứng minh quyền ghi/index/GridFS; những phần này được kiểm thử
ở các bước riêng khi triển khai, không được đánh dấu đã xong ở P1.1.

## 5. Chạy test Atlas thật có chủ đích

Dừng uvicorn hoặc dùng terminal thứ hai tại backend:

```powershell
uv run --frozen pytest tests/integration -q --run-mongodb-integration
```

Lệnh này đọc backend/.env và chỉ kiểm tra kết nối bằng ping; không tạo/xóa collection.
Nếu yêu cầu chạy integration nhưng chưa cấu hình, test phải thất bại với hướng dẫn,
không tự bỏ qua rồi báo thành công.

Test bình thường:

```powershell
uv run --frozen pytest -q
```

Test mặc định dùng đối tượng kiểm soát lỗi và không truy cập Atlas; integration được báo skipped.
