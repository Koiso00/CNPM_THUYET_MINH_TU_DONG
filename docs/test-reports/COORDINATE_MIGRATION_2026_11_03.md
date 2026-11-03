# Đồng bộ tọa độ địa điểm — 03/11/2026

Theo yêu cầu người dùng, lưu 10 tọa độ được cung cấp theo ID địa điểm trong bản nháp Atlas và công bố snapshot mới. Trước thao tác, bản nháp revision 20 khớp nội dung snapshot đang công bố `6f8b48c4-4f0b-4139-a52e-ff34cf810ced`; audio được chọn khớp audio công bố. Các tọa độ cũ trong bản nháp đều trống hoặc được kiểm tra không xung đột.

Tạo release `1e6c845d-f6f1-4cc3-bfb4-b8e140bcac28` từ snapshot cũ, chỉ bổ sung tọa độ, giữ nguyên ID và audio đã ghim. Không sửa snapshot cũ. Kiểm tra API public qua frontend local: 10/10 điểm có GeoJSON Point, 10/10 có audio vi/en/ko; HEAD audio ba ngôn ngữ của điểm đầu trả 200. Không nghe thử cả 30 audio.

Frontend trong workspace đọc tọa độ từ release thay vì ghép theo tên; tên mới không làm mất tọa độ. Admin báo rõ nếu tọa độ chưa được lưu. Lệnh seed mới chứa tọa độ theo ID; lệnh seed vẫn không ghi đè nháp hiện có. Lệnh migration kiểm tra đủ ID, không công bố thay đổi nháp khác, không ghi đè tọa độ xung đột và dùng revision để tránh ghi đè đồng thời.

Kiểm tra: 185 backend test đạt, 16 integration test bỏ qua; 62 frontend test đạt; typecheck/build và Ruff đạt. Build có cảnh báo chunk MapLibre lớn. Lượt này đã ghi dữ liệu Atlas và kiểm tra API thật, không kiểm tra lại bản deploy Render hay thiết bị di động.
