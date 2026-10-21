# Lộ trình thực hiện

Nguồn chuẩn: [kế hoạch gốc](PROJECT_PLAN.md). Các tuần là mốc tương đối, không tự đổi thành
deadline lịch hoặc cam kết tiến độ. Không áp dụng phương án rút gọn 5 ngày.

## Đã thực hiện: khung dự án

- Tài liệu bối cảnh/kiến trúc và hướng dẫn AI.
- React/TypeScript/Vite với trang mở đầu tối thiểu.
- FastAPI factory, health endpoint, router và thư mục nghiệp vụ giữ chỗ.
- Biến môi trường mẫu, cấu hình Docker/Compose; chưa chạy Docker.

## Các mốc tiếp theo

| Mốc | Công việc | Điều kiện chuyển mốc |
| --- | --- | --- |
| Tuần 1–2 | MongoDB/index, đăng ký/đăng nhập/RBAC, khảo sát nội dung; thử sớm một POI gồm map/audio/mô phỏng/offline | Quyền được kiểm tra ở API; bản thử chứng minh tài nguyên offline có thể mở lại |
| Tuần 3–4 | UI tham quan, MapLibre/PMTiles, GPS thật/mô phỏng, geofence/hàng đợi | Không phát chồng/lặp; có kết quả khảo sát ngưỡng |
| Tuần 5–6 | Creator, bản dịch Việt–Anh, TTS jobs, xét duyệt, versioning, fallback audio | Bản nháp không ảnh hưởng bản công bố; file khớp phiên bản nội dung |
| Tuần 7–8 | Offline pack đầy đủ, resume, checksum, dung lượng, nâng phiên bản, đăng xuất offline | Tắt mạng/đóng mở lại và đổi ngôn ngữ vẫn dùng được gói hoàn chỉnh |
| Tuần 9–10 | Gemini, dashboard, nội dung 8–10 điểm, cloud/local, QA và demo | Đạt ma trận nghiệm thu và diễn tập thực tế |

## Phân công định hướng

Frontend/bản đồ/audio và backend/dữ liệu/jobs có thể chia hai người.
Thành viên thứ ba nếu có phụ trách nội dung, giao diện quản trị và kiểm thử.
Nếu số người hoặc thời gian thực tế thay đổi, trao đổi lại kế hoạch thay vì ngầm bỏ yêu cầu.

## Cách chia đầu việc

Mỗi đầu việc ghi đầu vào, đầu ra, trạng thái, điều kiện nghiệm thu và tài liệu bị ảnh hưởng.
Không đánh dấu hoàn thành bằng số file hoặc số router. Ghi kết quả chạy thử và giới hạn thực tế.
Ưu tiên một luồng dùng được xuyên suốt trước khi mở rộng toàn bộ POI.
Không cần chờ cuối tuần 7 mới kiểm tra tính khả thi của bản đồ/audio offline.
