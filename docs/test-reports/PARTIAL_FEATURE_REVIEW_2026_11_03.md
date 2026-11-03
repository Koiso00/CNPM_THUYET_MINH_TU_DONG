# Kiểm tra các phần còn hoàn thiện — 03/11/2026

Phạm vi: đối chiếu mã trong workspace và chạy kiểm tra cục bộ; không sửa chức năng hoặc dữ liệu ứng dụng. Git HEAD khi kiểm tra là `1ab319e`; workspace có các thay đổi tài liệu chưa commit. Không suy diễn kết quả local thành trạng thái deploy.

| Phần | Kết quả |
| --- | --- |
| GPS/geofence | Mã dùng 30 m vào, 45 m ra, sai số tối đa 25 m, hai mẫu hợp lệ và giới hạn một mẫu mỗi 5 giây; GPS và mô phỏng dùng chung `GeofenceTracker`. Chưa khảo sát ngưỡng trên thực địa trong lượt này. |
| Safari/autoplay | Player chuẩn bị thẻ audio khi bật theo dõi và báo khi `play()` bị từ chối. Chưa thử iPhone/Safari thật; không kết luận đã khắc phục. |
| Hàng đợi | Chưa có hàng đợi. Điểm mới được chọn và yêu cầu phát trực tiếp; không thể coi yêu cầu không ngắt/không lặp theo phiên là đã hoàn thành. |
| Thiếu ngôn ngữ | `ExplorePage.tsx` chọn audio Việt nếu thiếu audio ngôn ngữ đang chọn; bản dịch English có fallback cục bộ nếu snapshot không có. Hai hành vi cần xử lý theo quy tắc đã ghi trong kế hoạch; lượt này chỉ kiểm tra, chưa sửa. |
| Presence | Mã gửi heartbeat, API nhận presence công khai và repository đếm theo thời gian; test backend có kiểm tra endpoint bằng đối tượng giả. Chưa xác nhận dữ liệu thật hoặc deploy. |
| Render | Truy cập readiness không thành công do quyền mạng môi trường chặn socket; công cụ web cũng không truy cập được URL. Không kết luận dịch vụ đang tắt. Chưa xác nhận commit, Auto-Deploy hay UI/audio. |
| Docker/thiết bị | Không có lệnh Docker trên máy; chưa chạy Compose. Không kiểm tra thực địa, Safari/iPhone hoặc E2E Atlas trong lượt này. |
| Tài liệu |Đồng bộ toàn bộ tài liệu chưa hoàn tất.|

## Kiểm tra đã chạy

- Backend `uv run --frozen pytest -q` với cache và thư mục tạm trong workspace: **182 passed, 16 skipped**. Integration Atlas bị bỏ qua mặc định; đây không phải kiểm tra Atlas thật.
- Frontend `npm run build`: **đạt** cả TypeScript và build; Vite cảnh báo chunk MapLibre lớn hơn 500 kB.
- Frontend `npm test`: khởi động nhưng không xuất kết quả trong thời gian chờ, đã dừng; không tính là đạt hoặc thất bại nghiệp vụ.
- Không chạy E2E vì cần server và Atlas biệt lập; không ghi dữ liệu Atlas.

Những kiểm tra chưa chạy không làm thay đổi các kết quả lịch sử trong các báo cáo trước. Các việc cần thiết bị thật, quyền truy cập Render và khảo sát thực địa vẫn để mở.
