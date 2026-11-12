# Xử lý lỗi không kết nối được MongoDB Atlas

Tài liệu này hướng dẫn kiểm tra khi dự án chạy local nhưng backend không kết nối được MongoDB Atlas. Thực hiện các bước từ trên xuống; không cần thay đổi dữ liệu hoặc cài lại dự án để kiểm tra kết nối.

## 1. Nhận biết trạng thái

Mở các địa chỉ sau khi backend đang chạy:

- [Kiểm tra backend](http://127.0.0.1:8000/api/v1/health): cho biết tiến trình API có phản hồi.
- [Kiểm tra kết nối cơ sở dữ liệu](http://127.0.0.1:8000/api/v1/health/ready): kiểm tra kết nối MongoDB bằng lệnh ping.

| Kết quả readiness | Ý nghĩa |
| --- | --- |
| HTTP 200, `database: connected` | Backend đã ping MongoDB thành công. |
| HTTP 503, `database: not_configured` | Chưa có `MONGODB_URI` trong cấu hình backend. |
| HTTP 503, `database: unavailable` | Backend chưa ping được MongoDB. Cần kiểm tra thêm; trạng thái này không chỉ rõ nguyên nhân. |
| Không mở được trang | Backend chưa chạy, dùng cổng khác hoặc không truy cập được từ trình duyệt. |

Kết nối ping thành công không tự xác nhận các chức năng ghi dữ liệu hoặc phát audio đã hoạt động.

## 2. Chạy backend trên PowerShell

Mở PowerShell tại thư mục gốc dự án và chạy:

```powershell
cd backend
uv run --frozen uvicorn app.main:app --reload
```

Giữ cửa sổ này mở, sau đó tải lại trang readiness. Nhấn `Ctrl + C` tại cửa sổ backend để dừng.

Nếu báo `WinError 10013` hoặc cổng đã được sử dụng, kiểm tra tiến trình đang nghe trên cổng 8000:

```powershell
netstat -ano | findstr :8000
```

Tìm dòng có `LISTENING`; số cuối là PID. Xem tên chương trình bằng `tasklist /FI "PID eq <PID>"`, thay `<PID>` bằng số tìm được. Chỉ dừng tiến trình sau khi xác định đó là backend cần thay thế. Không dừng một chương trình khác chỉ vì nó dùng cùng cổng.

## 3. Kiểm tra cấu hình và Atlas

1. Kiểm tra `backend/.env` có `MONGODB_URI` hợp lệ và `MONGODB_DATABASE` đúng với môi trường đang dùng. Không dán URI, mật khẩu hoặc nội dung `.env` vào chat hay kho Git.
2. Đăng nhập MongoDB Atlas và kiểm tra cluster đã sẵn sàng, không bị tạm dừng; xem mục **Project Alerts** nếu có cảnh báo.
3. Vào **Database & Network Access → IP Access List**. Kiểm tra IP công cộng của mạng đang chạy backend có trong danh sách và trạng thái **Active**. Nếu backend chạy trên Render, kiểm tra IP đi ra của dịch vụ Render theo cấu hình triển khai, không mặc định dùng IP máy cá nhân.
4. Nếu IP chưa được cho phép, thêm đúng IP cần dùng và chờ Atlas áp dụng. Không mở toàn bộ Internet chỉ để thử kết nối.
5. Kiểm tra Database User và quyền truy cập database nếu lỗi thuộc bước xác thực hoặc phân quyền. Tài khoản Database User khác tài khoản đăng nhập trang Atlas.

IP công cộng có thể thay đổi khi đổi Wi-Fi, dùng mạng điện thoại hoặc bật VPN. Các IP nội bộ như `192.168.x.x` không phải IP công cộng cần thêm vào Atlas.

## 4. Kiểm tra DNS và đường truyền từ máy

Mở PowerShell thứ hai, giữ backend đang chạy. Với cluster hiện tại của dự án, chạy:

```powershell
Resolve-DnsName -Type SRV _mongodb._tcp.cluster0.iaox4t3.mongodb.net
```

Nếu truy vấn thành công, kết quả sẽ liệt kê các nút Atlas. Khi đổi cluster, dùng hostname trong URI mới để thay phần `cluster0.iaox4t3.mongodb.net`; không đưa tên tài khoản hoặc mật khẩu vào lệnh.

Kiểm tra cổng của một nút được trả về, ví dụ:

```powershell
Test-NetConnection ac-xerkva8-shard-00-00.iaox4t3.mongodb.net -Port 27017
```

- DNS không trả kết quả hoặc hết thời gian: kiểm tra DNS, VPN hoặc thử mạng khác.
- `TcpTestSucceeded : False`: kiểm tra đường truyền, tường lửa hoặc chính sách mạng đối với cổng đó.
- DNS thành công và `TcpTestSucceeded : True`: máy đã tìm được và mở được kết nối TCP tới nút đã thử. Điều này chưa chứng minh xác thực, quyền database hay kết nối của một tiến trình chạy trong môi trường khác đều thành công.

Sau khi thay đổi mạng hoặc cấu hình, khởi động lại backend và kiểm tra readiness. Không cần gửi URI hoặc thông tin đăng nhập khi chia sẻ kết quả chẩn đoán.

## 5. Sự cố đã gặp ngày 07/11/2026

Triệu chứng: frontend kết nối được backend, nhưng readiness trả `database: unavailable`. Atlas hiển thị IP hiện tại trong danh sách cho phép và không có cảnh báo dự án đang mở. Trên PowerShell của người dùng, truy vấn DNS SRV trả về các nút và kiểm tra TCP tới một nút thành công.

Nguyên nhân được xác định trong lần đó: backend do công cụ của trợ lý khởi chạy trong môi trường bị hạn chế truy cập mạng. Khi kiểm tra MongoDB và khởi động lại backend với kết nối mạng trực tiếp của máy, readiness trả `database: connected`. Sự cố này không chứng minh mọi trường hợp `unavailable` về sau đều có cùng nguyên nhân.

Nếu gặp lại khi nhờ trợ lý chạy dự án, có thể yêu cầu: **“Kiểm tra readiness và khởi động backend với kết nối mạng trực tiếp nếu môi trường chạy bị hạn chế.”** Nếu backend chạy bằng PowerShell của bạn mà vẫn lỗi, tiếp tục kiểm tra các bước DNS, mạng, Atlas và cấu hình ở trên.

## Tài liệu liên quan

- [Thiết lập MongoDB Atlas](ATLAS_SETUP.md)
- [Hướng dẫn chạy dự án](../README.md)
