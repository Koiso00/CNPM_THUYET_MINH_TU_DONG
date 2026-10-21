# Hướng dẫn dành cho AI và người đóng góp

## Đọc trước khi làm việc

1. Đọc [README](README.md) để biết trạng thái thực tế và lệnh chạy.
2. Đọc [bối cảnh](docs/PROJECT_CONTEXT.md) và [kiến trúc](docs/ARCHITECTURE.md).
3. Tra [kế hoạch gốc được chốt](docs/PROJECT_PLAN.md) khi cần xác định phạm vi.
4. Chỉ đọc thêm tài liệu dữ liệu/API, runtime, nội dung hoặc kiểm thử liên quan đến nhiệm vụ.

## Nguồn quyết định

- Bản được người dùng chọn là kế hoạch đầy đủ dự kiến 10 tuần, ba vai trò
  **User / Creator / Admin**. Không tự áp dụng phương án demo 5 ngày hoặc gộp vai trò.
- Chưa đưa thống kê hiện diện tại POI, báo cáo CSV hoặc phương án chỉ dùng OSM trực tuyến
  vào phạm vi mặc định. Các thay đổi đó đã được thay thế khi người dùng chọn giữ nguyên kế hoạch gốc.
- Yêu cầu mới trực tiếp từ người dùng có thể thay đổi phạm vi. Khi có thay đổi, cập nhật bối cảnh và tài liệu liên quan.
- Nếu thiếu quyết định nghiệp vụ ảnh hưởng đến thiết kế, hỏi người dùng; không ghi đề xuất thành quyết định đã chốt.

## Quy tắc triển khai

- Backend: router xử lý HTTP; service xử lý nghiệp vụ; repository truy cập MongoDB/GridFS.
- Frontend chia theo feature; chỉ đưa thành phần dùng chung thực tế vào shared.
- JWT dự kiến đặt trong HttpOnly cookie, không localStorage; triển khai CSRF và kiểm tra RBAC tại backend.
- Không để người nghe lấy bản nháp hoặc asset chưa được phép; không sửa trực tiếp snapshot đã công bố.
- GPS thật và mô phỏng phải dùng chung luồng geofence/audio; số liệu mô phỏng tách khỏi thực tế.
- Không bịa lịch sử, tọa độ, bản dịch đã kiểm duyệt hoặc kết quả kiểm thử. Dữ liệu mô phỏng phải được gắn nhãn.
- Không commit secrets, dữ liệu tài khoản, MP3 hoặc PMTiles lớn. Dùng biến môi trường và GridFS khi triển khai.
- Không cài thư viện cho tính năng chưa thực hiện chỉ để làm đầy danh sách công nghệ.

## Trạng thái và kiểm tra

Khung hiện tại chỉ có trang mở đầu React, health endpoint FastAPI, router giữ chỗ và cấu hình.
MongoDB/GridFS, auth, bản đồ, TTS, offline, AI và dashboard chưa tích hợp.

Dùng lệnh trong README; build/typecheck không thay thế kiểm thử nghiệp vụ.
Khi sửa chức năng, chọn kiểm thử phù hợp theo [TEST_AND_DEMO](docs/TEST_AND_DEMO.md).
Báo rõ kiểm tra nào đã chạy, kiểm tra nào chưa chạy và lý do.
Cập nhật tài liệu cùng thay đổi API, dữ liệu hoặc hành vi. Không công bố lệnh chưa tồn tại như lệnh đã hoạt động.
