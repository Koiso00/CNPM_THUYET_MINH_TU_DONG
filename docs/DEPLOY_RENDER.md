# Hướng dẫn deploy demo lên Render

Tài liệu này ghi lại cách vận hành dịch vụ demo SGU Campus Guide đã tạo trên Render và MongoDB Atlas. Cấu hình hiện tại là **Render Web Service chạy Docker**, mã nguồn lấy từ GitHub nhánh `main`, dữ liệu người dùng/phiên lưu trên Atlas.

> Đây là bản demo. Trang đăng nhập/đăng ký và giao diện Khám phá đã deploy; bản đồ/GPS, phát audio trong trang, quản trị địa điểm/người dùng và dashboard chưa hoàn thiện. Không dùng dữ liệu cá nhân hoặc mật khẩu thật khi trình diễn.

## Bản miễn phí hoạt động như thế nào?

- Dịch vụ không tự xóa chỉ vì không có lượt truy cập. Tuy nhiên, Render Free tự cho Web Service ngủ sau **15 phút không có traffic**. Request kế tiếp đánh thức dịch vụ; quá trình khởi động có thể mất khoảng **một phút**, nên trang có thể hiện loading hoặc phản hồi chậm. [Giới hạn Render Free](https://render.com/docs/free)
- Gói Free có giới hạn giờ chạy theo tháng và giới hạn sử dụng khác. Khi hết giờ Free trong tháng, dịch vụ Free bị tạm ngưng tới đầu tháng kế tiếp. Xem mục Usage/Billing trên Render để theo dõi giới hạn hiện tại.
- File ghi trong ổ đĩa của container không bền vững và có thể mất khi service restart, ngủ hoặc deploy lại. Dữ liệu tài khoản/phiên của dự án lưu trên Atlas nên không phụ thuộc ổ đĩa container. Không lưu file upload hay MP3 cần giữ lâu dài vào filesystem của Render.
- URL `onrender.com` tiếp tục dùng được khi service và workspace còn tồn tại, đang hoạt động theo giới hạn gói và cấu hình không bị xóa/đổi. Đây không phải cam kết uptime cho production.

## Deploy một lần ban đầu

Các bước này chỉ cần làm lại nếu service bị xóa/tạo lại, chuyển sang repository/branch khác, hoặc thay đổi hạ tầng.

1. Đẩy code cần deploy lên GitHub, nhánh `main`. Kiểm tra commit mới nhất trên GitHub có các thay đổi bạn muốn đưa lên. Không commit `backend/.env`, mật khẩu, URI có credential, hay khóa bí mật.
2. Trong Render Dashboard chọn **New → Web Service**, kết nối repository `Koiso00/CNPM_THUYET_MINH_TU_DONG`, branch `main`.
3. Cấu hình service:
   - Language: `Docker`
   - Region: chọn vùng phù hợp; sau đó phải cho phép outbound IP của chính service/vùng này trên Atlas.
   - Root Directory: để trống (repository root).
   - Dockerfile Path: `infra/Dockerfile`
   - Docker Context: repository root nếu giao diện có mục này.
   - Chọn gói Free cho demo nếu không muốn dùng gói trả phí.
4. Thêm biến môi trường trong Render. Các giá trị nhạy cảm chỉ nhập trên Render, không ghi vào GitHub hay gửi qua chat:

   | Key | Giá trị |
   | --- | --- |
   | `ENVIRONMENT` | `production` |
   | `MONGODB_URI` | URI kết nối Atlas; không còn `<db_password>` giữ chỗ và phải URL-encode ký tự đặc biệt trong credential |
   | `MONGODB_DATABASE` | `sgu_campus_guide` |
   | `JWT_SECRET` | Tạo một chuỗi ngẫu nhiên mới, riêng cho production, tối thiểu 32 byte; không dùng lại khóa demo/local |
   | `AUTH_ALLOWED_ORIGINS` | Sau khi biết URL Render, nhập JSON array như `["https://ten-service.onrender.com"]` |

   Dockerfile đã đặt `ENVIRONMENT=production` và `FRONTEND_DIST=/srv/frontend`; không cần tự thêm `FRONTEND_DIST`. Nếu đổi URL service, cập nhật `AUTH_ALLOWED_ORIGINS` chính xác theo origin mới, không có dấu `/` cuối.

5. Cho phép Render truy cập Atlas:
   - Trong trang service Render mở **Connect → Outbound** và sao chép mọi IP/CIDR được liệt kê. Render có thể dùng bất kỳ địa chỉ nào trong các dải IP của vùng đó. [Render outbound IP](https://render.com/docs/outbound-ip-addresses)
   - Trong Atlas vào **Security → Network Access → IP Access List → Add IP Address**. Thêm từng IP/CIDR vào một entry riêng, giữ nguyên hậu tố CIDR như `/24` nếu có. Tắt tùy chọn temporary nếu cần duy trì lâu dài. Giữ entry IP cá nhân nếu máy bạn còn cần kết nối trực tiếp.
   - Không dùng `0.0.0.0/0` để xử lý nhanh; cách đó cho phép mọi IP thử kết nối tới cluster. [Atlas IP Access List](https://www.mongodb.com/docs/atlas/security/add-ip-address-to-list/)
6. Nhấn **Deploy Web Service** và theo dõi trạng thái trong **Deploys/Logs**. Khi deploy hoàn tất, trạng thái cần là **Live**.
7. Kiểm tra readiness bằng URL thật của service:

   ```text
   https://<ten-service>.onrender.com/api/v1/health/ready
   ```

   Kết quả đạt yêu cầu khi `status` là `ready` và `database` là `connected`. Sau đó thử mở trang, đăng ký tài khoản demo, đăng nhập, tải lại trang và đăng xuất.

## Cập nhật/deploy lần sau

### Từ máy hiện tại hoặc máy khác (cách khuyến nghị)

1. Trên máy làm việc, lấy phiên bản mới nhất từ GitHub bằng GitHub Desktop hoặc `git pull`.
2. Sửa và kiểm tra dự án, rồi commit và push lên nhánh `main`.
3. Nếu **Auto-Deploy = On Commit**, Render tự build và deploy commit mới. Theo dõi **Deploys** tới khi trạng thái là **Live**. [Cách deploy tự động/thủ công](https://render.com/docs/deploys)

Không cần giữ máy tính đang chạy sau khi push: Render lấy mã nguồn từ GitHub và build trên hạ tầng Render. Có thể dùng máy khác để sửa code nếu đăng nhập được vào GitHub và clone repository; nếu chỉ cần xem trạng thái hoặc deploy lại commit đã có trên GitHub, dùng trình duyệt trên bất kỳ thiết bị nào đăng nhập Render.

### Deploy thủ công từ Dashboard

Trong Render mở service → **Deploys → Manual Deploy → Deploy latest commit**. Thao tác này deploy phiên bản mới nhất đã push lên branch được liên kết. Nó không upload thay đổi chưa commit từ máy tính.

### Khi nào cần cấu hình lại?

- Thông thường: **không**. Service, Render environment variables, branch, Dockerfile path và Atlas allowlist được lưu trên các tài khoản cloud.
- Khi thêm/sửa biến môi trường: cập nhật trong Render **Environment** và để Render áp dụng bằng deploy/restart được Dashboard yêu cầu.
- Khi đổi URL service: sửa `AUTH_ALLOWED_ORIGINS` theo origin mới.
- Khi đổi region hoặc cấu hình outbound IP: lấy lại các dải từ **Connect → Outbound** và cập nhật Atlas IP Access List.
- Khi đổi URI, database user, mật khẩu hoặc cluster: cập nhật `MONGODB_URI` trong Render. Không cần sửa `.env` cục bộ để service cloud nhận biến đó.
- Khi xóa service hoặc mất quyền GitHub/Render: phải tạo lại/liên kết lại service và cấu hình các giá trị ở trên.

## Xử lý lỗi thường gặp

| Triệu chứng | Kiểm tra |
| --- | --- |
| Deploy báo lỗi parse `auth_allowed_origins` | Giá trị phải là JSON array hợp lệ, ví dụ `["https://ten-service.onrender.com"]`; đừng nhập URL đơn lẻ hoặc thêm dấu `/` cuối. |
| Trang hiện “Dịch vụ chưa sẵn sàng” hoặc readiness trả `503` | Kiểm tra Atlas IP Access List có đủ mọi outbound IP/CIDR từ Render chưa; kiểm tra `MONGODB_URI`, `MONGODB_DATABASE` và quyền của database user. Xem Runtime Logs; không chụp/đăng giá trị secret. |
| Trang tải chậm lần đầu sau thời gian không dùng | Bình thường với Free: service có thể đã ngủ sau 15 phút và cần khoảng một phút để khởi động lại. |
| Mã mới chưa xuất hiện | Kiểm tra commit đã push đúng branch chưa, Auto-Deploy có bật không, và deploy mới nhất có trạng thái Live không. |
| Deploy lỗi khi build Docker | Xem phần đầu tiên có dòng lỗi trong deploy logs. Sau khi sửa code, commit/push để Render build lại; có thể chọn **Clear build cache & deploy** khi nghi cache build cũ. |

Không gửi các giá trị của `MONGODB_URI`, `JWT_SECRET` hoặc mật khẩu vào chat, ảnh chụp màn hình hay repository. Nếu secret từng bị công khai, hãy đổi/rotate secret đó trên dịch vụ tương ứng và cập nhật Render Environment.
