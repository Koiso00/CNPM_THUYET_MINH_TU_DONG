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
- Cập nhật 21/10/2026: người dùng ưu tiên demo 2 ngày theo [DEMO_2_DAYS](docs/DEMO_2_DAYS.md):
  đăng nhập, nghe audio, quản lý địa điểm/nội dung/audio/user, dashboard dữ liệu thật.
  Tạm hoãn GPS, offline, AI và dịch tự động; kế hoạch gốc vẫn là hướng phát triển dài hạn.
- Người dùng đã chốt offline theo ngôn ngữ tự chọn: tải thêm ngôn ngữ sau,
  dùng chung bản đồ/ảnh, không bắt tải toàn bộ ngôn ngữ. Xem docs/TOUR_RUNTIME.md.
  Quyết định này thay yêu cầu đóng gói bắt buộc Việt–Anh trong kế hoạch gốc; offline vẫn hoãn trong demo 2 ngày.
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

Đã có trang mở đầu React, liveness/readiness FastAPI, MongoDB lifecycle và test nền tảng dữ liệu.
P1.2 đã có model/repository User/session và index thật trên Atlas: 69 test cục bộ,
12 test Atlas đạt. Username không phân biệt hoa/thường; token truy cập 15 phút,
tự gia hạn trong phiên có hạn tuyệt đối 7 ngày. Chưa có GridFS.
P1.3 đã có API đăng ký/đăng nhập/me/refresh/logout/logout-all, Argon2id, JWT cookie,
CSRF ký gắn phiên và dependency RBAC: 124 test cục bộ, 14 test Atlas đạt.
Đăng ký chỉ tạo User; mật khẩu 15–128 ký tự, cho phép Unicode/dấu cách, không tự trim mật khẩu.
P1.4 có giao diện đăng ký/đăng nhập, AuthClient gia hạn, khôi phục phiên, đăng xuất và khung trang theo role.
Giao diện đăng nhập đã cập nhật theo ảnh khuôn viên/bảng màu người dùng gửi; 18 test frontend đạt,
Edge đã rà bố cục desktop/mobile và ảnh nền; xem docs/test-reports/P1_4_AUTH_UI_REDESIGN.md.
Trang khám phá sau đăng nhập đã có giao diện theo mẫu: nội dung nguồn 10 điểm, thẻ chọn nội dung,
vùng bản đồ giữ chỗ để thay bằng ảnh sơ đồ sau này. 22 test frontend đạt; chưa có map/GPS/audio playback thật.
Xem docs/test-reports/P1_4_1_EXPLORE_UI.md.
AuthClient chỉ giữ dữ liệu công khai trong RAM; cookie HttpOnly thuộc browser. Không lưu JWT/CSRF vào storage.
Hash routing không cần SPA fallback; chức năng quản lý trong khung trang Creator/Admin hiện mới có nhãn “Sắp có”.
Bản đồ thật, TTS trên web, offline, AI và dashboard chưa tích hợp. Không thêm route thử quyền vào ứng dụng thật.
Người dùng đã chọn [nguồn tiếng Việt 10 địa điểm](data/sources/campus-vi-user-2026-10-21.md)
cho demo; giữ nguyên văn, chưa có tọa độ hoặc đối chiếu sơ đồ. Không tự bổ sung sự kiện lịch sử.
Đã tạo 10 MP3 cục bộ bằng Edge-TTS vi-VN-NamMinhNeural theo lựa chọn giọng nam của người dùng;
xem [báo cáo audio](docs/test-reports/DEMO_AUDIO_VI_MALE.md). Chưa tích hợp API/GridFS/trình phát.

Theo dõi các phần tại [WORK_BREAKDOWN](docs/WORK_BREAKDOWN.md). Sau mỗi phần phải chạy test,
ghi lỗi đã sửa/test chưa chạy và đối chiếu kế hoạch trong docs/test-reports/.
Không coi test double là bằng chứng Atlas thật đã hoạt động; không đưa nội dung .env vào chat/log.

Dùng lệnh trong README; build/typecheck không thay thế kiểm thử nghiệp vụ.
Khi sửa chức năng, chọn kiểm thử phù hợp theo [TEST_AND_DEMO](docs/TEST_AND_DEMO.md).
Báo rõ kiểm tra nào đã chạy, kiểm tra nào chưa chạy và lý do.
Cập nhật tài liệu cùng thay đổi API, dữ liệu hoặc hành vi. Không công bố lệnh chưa tồn tại như lệnh đã hoạt động.
