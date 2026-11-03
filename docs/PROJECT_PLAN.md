

> **Quyết định ngày 27/10/2026:** Người dùng loại chức năng offline khỏi toàn bộ phạm vi dự án và kế hoạch dài hạn. Các mô tả trước đây về offline chỉ có giá trị lịch sử.

# Kế hoạch thiết kế website thuyết minh cơ sở chính Đại học Sài Gòn

## 1. Mục tiêu và phạm vi đã thống nhất

Xây dựng **website dùng trên điện thoại và máy tính, không bắt buộc cài ứng dụng**, phục vụ đồ án của nhóm 2–3 người theo lộ trình dự kiến 10 tuần.

Bản nghiệm thu gồm:

- Một tour cơ sở chính với **8–10 điểm ngoài trời**, thuyết minh **Việt–Anh**.
- Người dùng tự đăng ký, đăng nhập, tham quan tự do và nghe theo vị trí hoặc chọn điểm thủ công.
- **GPS mô phỏng** để trình diễn tại bất kỳ địa điểm nào.
- Website trực tuyến trên hạ tầng miễn phí và bản chạy trên máy để dự phòng.

Tự động nhận điểm áp dụng khi trang tham quan đang mở. Không đưa định vị phòng/tầng hoặc kích hoạt điểm mới khi khóa màn hình vào tiêu chí nghiệm thu.

## 2. Bộ tài liệu sẽ tạo trước khi lập trình

Lượt triển khai đầu tiên tạo tài liệu hướng dẫn dự án; chưa khởi tạo mã ứng dụng. Hiện kho mã chỉ có `README.md`, nên tài liệu phải phân biệt rõ **đã có**, **đã thống nhất** và **chưa triển khai**.

| File | Nội dung |
|---|---|
| `AGENTS.md` | Hướng dẫn AI đọc dự án, nguyên tắc làm việc, kiểm thử, cập nhật tài liệu và xử lý yêu cầu chưa rõ |
| `README.md` | Giới thiệu sản phẩm, phạm vi, trạng thái hiện tại và đường dẫn đọc tài liệu |
| `docs/PROJECT_CONTEXT.md` | Mục tiêu, người dùng, yêu cầu đã chốt, giới hạn và bảng quyết định |
| `docs/ARCHITECTURE.md` | Thành phần hệ thống, cấu trúc mã dự kiến, luồng dữ liệu, xác thực, xử lý nền và triển khai |
| `docs/DATA_AND_API.md` | Collection, quan hệ, phiên bản nội dung, phân quyền và hợp đồng API |
| `docs/TOUR_RUNTIME.md` | GPS thật/mô phỏng, geofence và hàng đợi âm thanh |
| `docs/IMPLEMENTATION_PLAN.md` | Kế hoạch 10 tuần, phụ thuộc công việc, phân công theo nhóm 2 hoặc 3 người |
| `docs/TEST_AND_DEMO.md` | Tiêu chí nghiệm thu, kiểm thử thực địa, kịch bản demo và cách dự phòng |
| `docs/CONTENT_GUIDE.md` | Quy trình khảo sát, ghi nguồn, thu thập ảnh/tọa độ và kiểm tra bản dịch |

`AGENTS.md` quy định:

- Đọc bối cảnh và kiến trúc trước khi sửa mã; chỉ đọc thêm tài liệu liên quan đến nhiệm vụ.
- Hỏi người dùng khi còn thiếu quyết định nghiệp vụ; không tự biến đề xuất thành yêu cầu đã chốt.
- Không tự bịa lịch sử, tên tòa nhà, tọa độ hoặc nguồn tư liệu; dữ liệu mô phỏng phải được đánh dấu.
- Không ghi khóa API, mật khẩu hay token vào kho mã.
- Thay đổi API, dữ liệu hoặc hành vi phải cập nhật tài liệu tương ứng.
- Chỉ công bố lệnh chạy và kiểm thử đã tồn tại, đã được xác minh; không ghi chức năng dự kiến thành chức năng hoàn thành.

## 3. Thiết kế hệ thống

### Nền tảng và triển khai

- **Frontend:** React 19.2, TypeScript, Vite 7; MapLibre.
- **Backend:** FastAPI, Pydantic và PyMongo Async; tổ chức theo router → service → repository.
- **Lưu trữ:** MongoDB lưu dữ liệu nghiệp vụ; GridFS lưu ảnh, MP3 và tài nguyên bản đồ.
- **Dịch và giọng đọc:** `deep-translator` với GoogleTranslator cho Việt → Anh; Edge-TTS tạo MP3. Cho phép sửa bản dịch và tải MP3 thay thế khi dịch vụ không khả dụng.
- AI chỉ tạo bản nháp, không tự công bố.
- **Trực tuyến:** một dịch vụ Render phục vụ cả frontend đã build và API, kết nối MongoDB Atlas Free. Cùng nguồn truy cập giúp đơn giản hóa cookie và tải tài nguyên cần đăng nhập.
- **Dự phòng:** Docker Compose chạy FastAPI và MongoDB với volume bền vững; chuẩn bị dữ liệu và MP3 trước buổi demo. Khi thử bằng điện thoại, cung cấp đường dẫn HTTPS.

Không lưu file lâu dài trên ổ đĩa tạm của Render vì dữ liệu phát sinh có thể mất khi dịch vụ khởi động lại. [Tài liệu Render](https://render.com/docs/free)

### Tài khoản, dữ liệu và API

Ba vai trò:

- **User:** xem/nghe tour đã công bố.
- **Admin:** quản lý tài khoản, cấp quyền, duyệt/từ chối và gỡ công bố.

Tài khoản mới luôn là User; không cho người đăng ký tự chọn quyền. Xác thực dùng JWT trong cookie `HttpOnly`, `Secure` khi chạy HTTPS; bổ sung bảo vệ CSRF, băm mật khẩu và kiểm tra quyền tại API.

Các nhóm dữ liệu:

- `users`, `sessions`: tài khoản, vai trò và phiên đăng nhập.
- `tours`, `pois`, `localizations`: tour, điểm địa lý và nội dung theo ngôn ngữ.
- `tour_releases`: bản nội dung đã duyệt, chứa snapshot các điểm và tài nguyên liên quan.
- `assets`, `jobs`: metadata file, công việc nền và manifest tải xuống.
- `audit_logs`, `usage_events`: nhật ký quản trị và sự kiện sử dụng.

Tọa độ dùng GeoJSON theo thứ tự **kinh độ, vĩ độ**. Bản dịch và âm thanh gắn với phiên bản văn bản nguồn để phát hiện tài nguyên đã lỗi thời.

API đặt dưới `/api/v1`, tách nhóm `auth`, `content`, `audio`, `maps`, `jobs`, `ai`, `admin` và `events`. Tác vụ dịch/TTS trả mã công việc và trạng thái; không giữ yêu cầu HTTP chờ xử lý toàn bộ tour.

Các công việc nền được lưu trong MongoDB, có giới hạn số tác vụ chạy đồng thời, thử lại hữu hạn và chống tạo trùng. Trong cấu hình miễn phí, bộ xử lý chạy cùng dịch vụ API và khôi phục công việc dang dở khi dịch vụ hoạt động trở lại.

### Nội dung và giao diện

Luồng công bố:

***

Sửa nội dung sau công bố tạo bản nháp mới; người nghe tiếp tục dùng bản đã duyệt. Chỉ công bố phiên bản đáp ứng yêu cầu nội dung và tài nguyên đã duyệt.


- Điện thoại: bản đồ, thẻ thông tin điểm và thanh điều khiển âm thanh dễ thao tác.
- Máy tính: bản đồ cạnh danh sách điểm; khu vực biên tập có bảng và biểu mẫu.
- Người nghe bấm **“Bắt đầu tham quan”** để bắt đầu phiên, cho phép âm thanh và yêu cầu vị trí thật.
- Nếu từ chối vị trí, vẫn có thể chọn điểm để nghe.

### GPS, mô phỏng và hàng đợi âm thanh

Tách nguồn vị trí thành hai thành phần có cùng đầu ra:

- `BrowserLocationProvider`: lấy vị trí từ `watchPosition()`.
- `SimulatedLocationProvider`: chọn điểm, di chuyển từng bước hoặc chạy tuyến mẫu.

Mô phỏng không yêu cầu quyền GPS; hiển thị nhãn rõ ràng, dùng chung geofence và trình phát, mặc định tắt bằng cấu hình triển khai. Sự kiện mô phỏng được đánh dấu và tách khỏi thống kê sử dụng thực.

Các giá trị khởi đầu để kiểm thử:

- Xử lý vị trí tối đa một lần mỗi 5 giây; đây là nhịp xử lý, không phải cam kết thiết bị phát GPS đúng chu kỳ.
- Bán kính vào mặc định 30 m, ra 45 m để giảm bật/tắt liên tục ở ranh giới.
- Bỏ mẫu cũ quá 15 giây hoặc có sai số lớn hơn 25 m.
- Xác nhận bằng hai mẫu hợp lệ liên tiếp; các ngưỡng được cấu hình và hiệu chỉnh sau khảo sát.
- Khi nhiều điểm cùng đủ điều kiện, ưu tiên điểm gần nhất; hòa khoảng cách thì theo thứ tự điểm trong tour.
- Chỉ phát một bài tại một thời điểm, không ngắt bài đang nghe khi gặp điểm mới; loại điểm đang chờ nếu người dùng đã ra khỏi vùng.
- Mỗi điểm chỉ tự phát một lần trong phiên; người dùng vẫn có thể chủ động nghe lại.

Thứ tự âm thanh đã chốt:

**MP3 trên máy chủ → tạo MP3 khi cần → giọng trình duyệt.**

Tạo theo yêu cầu chỉ dùng văn bản đã công bố và chống yêu cầu trùng. Nếu không có MP3 hoặc giọng phù hợp, hiển thị văn bản và tình trạng thiếu âm thanh.

### Thống kê

Dashboard v1 hiển thị số tài khoản, lượt bắt đầu tour, số người sử dụng theo kỳ, lượt nghe hoàn tất và trạng thái xử lý nội dung; không cần lưu hành trình GPS thô.

## 4. Lộ trình 10 tuần

| Thời gian | Công việc và kết quả cần đạt |
|---|---|
| **Tuần 1–2** | Hoàn thiện tài liệu; dựng nền tảng, xác thực và dữ liệu; khảo sát 8–10 điểm. Thử nghiệm sớm một điểm có bản đồ, MP3, GPS mô phỏng. |
| **Tuần 3–4** | Hoàn thiện giao diện tham quan, bản đồ khuôn viên, GPS thật/mô phỏng, geofence và hàng đợi. Đi thực địa để đo và điều chỉnh ngưỡng. |
| **Tuần 5–6** ||
| **Tuần 7–8** | Hoàn thiện các chức năng còn lại và kiểm thử tích hợp theo ưu tiên hiện hành. |
| **Tuần 9–10** | Tích hợp Gemini, dashboard thống kê, hoàn thiện dữ liệu thật; triển khai trực tuyến, kiểm thử tổng thể và diễn tập demo dự phòng. |

Phân công theo năng lực:

- Người thứ nhất: frontend, bản đồ, GPS và audio.
- Người thứ hai: backend, xác thực, dữ liệu, dịch/TTS và triển khai.
- Nếu có người thứ ba: nội dung, giao diện quản trị và kiểm thử; nếu chỉ hai người thì chia phần này theo từng mốc.

Mười tuần là kế hoạch dự kiến theo yêu cầu ban đầu; chưa coi là cam kết tiến độ vì chưa có số giờ làm việc mỗi tuần.

## 5. Kiểm thử và điều kiện nghiệm thu

- **Nội dung:** sửa bản nháp không làm đổi tour đang công bố; bản dịch và MP3 không bị gắn nhầm phiên bản.
- **Geofence:** đi vào/ra vùng, GPS nhiễu, nhiều điểm gần nhau, mẫu cũ, chuyển tab và quay lại; không phát chồng hoặc tự phát lặp.
- **Âm thanh:** kiểm tra từng tầng dự phòng, đổi ngôn ngữ, thiếu giọng đọc, lỗi dịch vụ và yêu cầu tạo trùng.
- **Mô phỏng:** demo toàn bộ tour trên máy tính ngoài trường mà không cần cấp GPS; thống kê mô phỏng không lẫn lượt dùng thật.
- **Triển khai:** kiểm tra khởi động lại máy chủ không mất ảnh/MP3, cookie hoạt động qua HTTPS và bộ chạy trên máy phục hồi được dữ liệu.
- **Thiết bị:** nghiệm thu chính trên Chrome Android và Chrome/Edge máy tính; kiểm tra bổ sung Safari iPhone và ghi rõ kết quả thực tế.

Bộ tour nghiệm thu phải có nguồn nội dung, ảnh và tọa độ đã kiểm tra. GPS mô phỏng phục vụ trình diễn và kiểm thử lặp lại; việc xác nhận hoạt động GPS ngoài trời vẫn cần một đợt khảo sát tại cơ sở chính.

Sau khi tạo tài liệu, kiểm tra liên kết giữa các file, sự thống nhất giữa yêu cầu–API–kiểm thử, và bảo đảm không có chức năng chưa viết được mô tả là đã hoàn thành.
