# Lộ trình thực hiện

Nguồn chuẩn: [kế hoạch gốc](PROJECT_PLAN.md). Các tuần là mốc tương đối, không tự đổi thành
deadline lịch hoặc cam kết tiến độ. Không áp dụng phương án rút gọn 5 ngày.
Ưu tiên cập nhật 24/10 theo yêu cầu người dùng: Stadia/GPS và phát audio khi chạm điểm đã hoạt động trên điện thoại; 10 tọa độ đã kiểm chứng thực địa. Nghiệm thu GPS/geofence thực tế có thể để sau. Dashboard Admin đã được bổ sung bộ lọc ngày ICT và lượt phát audio theo từng địa điểm từ sự kiện thật; QR là phần tiếp theo. GPS tự nhận diện, autoplay theo geofence và ngưỡng cần nghiệm thu trước demo chính thức. Offline/AI/dịch tiếp tục hoãn.

## Đã thực hiện: khung dự án

- Tài liệu bối cảnh/kiến trúc và hướng dẫn AI.
- React/TypeScript/Vite với trang mở đầu tối thiểu.
- FastAPI factory, health endpoint, router và thư mục nghiệp vụ giữ chỗ.
- Biến môi trường mẫu, cấu hình Docker/Compose; chưa chạy Docker.

## Các mốc tiếp theo

Chi tiết đầu việc và trạng thái từng phần tại [WORK_BREAKDOWN](WORK_BREAKDOWN.md).
P1.1 đã hoàn tất: vòng đời kết nối, cấu hình và readiness MongoDB, 34 test cục bộ và một ping Atlas thật đạt.
P1.2 đã hoàn tất mô hình/repository User/session và index thật; 69 test cục bộ,
12 test Atlas đạt theo [báo cáo](test-reports/P1_2_USER_SESSIONS.md).
P1.3 hoàn tất API JWT cookie/CSRF và dependency RBAC; 124 test cục bộ, 14 test Atlas đạt.
P1.4 đã có giao diện đăng ký/đăng nhập và trạng thái phiên: 18 test frontend,
4 test Edge/Atlas tạm đạt. Tiếp theo là nội dung/audio/admin/dashboard theo thứ tự demo 2 ngày.
P1.4.1 đã bổ sung trang khám phá với 10 mô tả nguồn và vùng bản đồ giữ chỗ; xem
[báo cáo](test-reports/P1_4_1_EXPLORE_UI.md). Dashboard và chức năng quản lý chưa hoạt động;
trang Creator/Admin hiện mới có khung theo role.
Sau từng phần ghi test, lỗi đã sửa và đối chiếu phạm vi trước khi đánh dấu hoàn thành.

| Mốc | Công việc | Điều kiện chuyển mốc |
| --- | --- | --- |
| Tuần 1–2 | MongoDB/index, đăng ký/đăng nhập/RBAC, khảo sát nội dung; thử sớm một POI gồm map/audio/mô phỏng/offline | Quyền được kiểm tra ở API; bản thử chứng minh tài nguyên offline có thể mở lại |
| Tuần 3–4 | UI tham quan, MapLibre/PMTiles, GPS thật/mô phỏng, geofence/hàng đợi | Không phát chồng/lặp; có kết quả khảo sát ngưỡng |
| Tuần 5–6 | Creator, bản dịch Việt–Anh, TTS jobs, xét duyệt, versioning, fallback audio | Bản nháp không ảnh hưởng bản công bố; file khớp phiên bản nội dung |
| Tuần 7–8 | Offline pack theo ngôn ngữ chọn, tài nguyên chung, resume, checksum, dung lượng, nâng phiên bản, đăng xuất offline | Tắt mạng/đóng mở lại dùng được ngôn ngữ đã tải; tải thêm không lặp tài nguyên chung; ngôn ngữ chưa tải báo rõ |
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
