# Nhật ký hoàn thiện dashboard thống kê Admin — 24/10/2026

## Phạm vi

Dashboard có bộ lọc ngày ICT, các số tổng về khách/hành trình/lượt nghe và bảng lượt phát audio theo từng địa điểm. Thống kê dựa trên `usage_events`; GPS mô phỏng không được ghi vào đây.

## Nhật ký

- Bổ sung bộ chọn ngày cho dashboard và API truy vấn theo ngày.
- Bổ sung aggregate lượt `audio_played` theo `place_id`; hiển thị tên địa điểm từ release công bố hiện tại.
- Sau deploy, người dùng báo dashboard hiện thông báo “Chưa tải được số liệu mới”.
- Kiểm tra Application Logs của Render xác định lỗi: `AsyncCollection.aggregate()` trả coroutine nhưng được dùng như async iterator mà chưa `await` (`TypeError: 'async for' requires an object with __aiter__ method, got coroutine`).
- Sửa bằng cách await kết quả aggregate trước khi duyệt; thêm kiểm thử hồi quy cho async aggregate và breakdown theo địa điểm.
- Kiểm thử tập trung `tests/unit/test_admin_dashboard.py`: **1 đạt**. Ruff cho các file backend liên quan: **đạt**. Frontend trước đó: **57/57 đạt**, build/typecheck đạt.
- Người dùng xác nhận dashboard trên bản deploy hiện hoạt động sau cập nhật.

## Trạng thái

Thống kê nền của Admin đã hoạt động trên bản deploy theo xác nhận người dùng.

## Giới hạn kiểm thử

Chưa chạy kiểm thử integration với Atlas sau sửa lỗi. Lần chạy toàn bộ backend unit trước đó cho 166 test đạt và 7 lỗi setup do quyền truy cập tệp/cấu hình trong môi trường; kiểm thử tập trung mới cho phần aggregate đã đạt.

## Hồi quy sau đó — 24/10/2026

Đợt hồi quy đa ngôn ngữ chạy sau các sửa đổi tiếp theo đạt 181 backend test, 16 integration test được bỏ qua theo cấu hình mặc định, 61 frontend test, Ruff, typecheck và build. Đây là unit/build regression; không thay đổi ghi nhận rằng integration Atlas sau riêng bản sửa aggregate chưa chạy lại. Người dùng xác nhận dashboard chạy được trên deploy. Render hiện “Suspended by you”; chưa xác nhận code workspace mới đã deploy.

## Bổ sung chỉ số hiện diện — 26/10/2026

Theo yêu cầu người dùng, thẻ được đặt tên “User đang hoạt động”. Chỉ số đếm ID trình duyệt khách gửi heartbeat mỗi 30 giây khi trang Welcome/Explore đang hiển thị; backend tính ID có tín hiệu trong 90 giây gần nhất. “Khách trong ngày” vẫn là số khách riêng biệt đã ghi nhận visit theo ngày ICT. Chỉ số hiện diện chưa được kiểm thử hoặc deploy; cần triển khai backend/frontend cùng nhau và khởi tạo TTL index cho collection `visitor_presence` bằng lệnh khởi tạo database.

## Sửa lỗi không ghi nhận heartbeat — 26/10/2026

Điều tra phản hồi “không hoạt động” phát hiện middleware CSRF chỉ cho phép `POST /events/guest` công khai; endpoint mới `/events/presence` bị trả 403 vì khách chưa đăng nhập. Đã cho phép chính xác endpoint presence theo cùng chính sách sự kiện khách và thêm kiểm thử HTTP xác nhận không cần CSRF. Kiểm tra backend liên quan: 4 đạt. Frontend test/build chưa chạy được vì dependencies npm chưa có trong workspace. Bản đã sửa vẫn cần deploy lên service đang chạy; Render hiện được ghi nhận tạm ngưng.
