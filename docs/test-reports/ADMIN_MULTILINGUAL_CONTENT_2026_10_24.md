# Nhật ký Admin biên tập nội dung đa ngôn ngữ — 24/10/2026

## Thay đổi

- Trang `/#/admin` có bộ chọn Tiếng Việt, English và 한국어.
- Khi chọn English hoặc 한국어, Admin sửa tên địa điểm, nội dung thuyết minh và nguồn tư liệu trong bộ bản dịch của địa điểm; dữ liệu tiếng Việt gốc vẫn giữ riêng.
- Bản dịch đủ ba trường được lưu trong bản nháp. Trường còn thiếu được giữ trong biểu mẫu khi lưu các thay đổi hợp lệ khác và cần hoàn tất trước khi bản dịch được lưu.
- Khi Admin chỉnh bản dịch, nội dung bản dịch được gắn checksum với phần thuyết minh tiếng Việt hiện tại. Nếu văn bản Việt thay đổi sau đó, bản dịch cũ không được đưa vào snapshot công bố cho đến khi Admin cập nhật bản dịch.
- Thư viện audio lọc theo ngôn ngữ đã chọn. Admin có thể nghe thử và tải MP3 cho ngôn ngữ đó; audio mới chỉ vào release sau khi công bố lại.
- Tên tour chưa có trường bản dịch và hiện dùng chung.
- Đã khởi chạy lại trang local tại `http://127.0.0.1:5173/#/admin`; API readiness trả `ready` và MongoDB `connected`. Trang Admin hiển thị bộ chọn ba ngôn ngữ và dữ liệu hiện có.

## Kiểm tra

- Frontend: `npm run build` đạt, gồm TypeScript; 61 test qua.
- Backend: 181 test qua, 16 integration test bỏ qua theo cấu hình mặc định. Pytest dùng thư mục tạm trong workspace do thư mục Temp mặc định bị từ chối quyền truy cập.
- Trang Admin local tải được và hiển thị bộ chọn ba ngôn ngữ cùng danh sách audio tiếng Việt. Endpoint backend có tham số `language` cho danh sách audio; upload MP3 nhận ngôn ngữ được chọn.

## Giới hạn hiện tại

- Ngôn ngữ chỉnh sửa hiện có: `vi`, `en`, `ko`. Thêm mã ngôn ngữ mới cần mở rộng schema/API.
- Trang này là thay đổi local trong workspace. Render đang ở trạng thái “Suspended by you” theo lần kiểm tra 24/10; chưa triển khai thay đổi này lên Render.
- Chưa nghe duyệt MP3 tiếng Hàn; chức năng cho phép Admin nhập/tải audio Hàn sau khi có bản dịch phù hợp.

## Cập nhật 26/10/2026

Người dùng đã duyệt bản dịch và audio tiếng Hàn cho 10 POI. Đã nhập GridFS và công bố release Atlas `2cebd7fb-7ca8-4719-819b-abb2a2191038`; xác minh release đủ 10 bản dịch/audio tiếng Hàn và vẫn giữ đủ tiếng Việt/English. Trạng thái “chưa nghe duyệt” phía trên ghi nhận mốc 24/10.
