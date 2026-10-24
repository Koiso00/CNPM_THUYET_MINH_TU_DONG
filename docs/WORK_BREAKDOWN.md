> **Cập nhật 24/10/2026:** người dùng đã cấu hình Stadia, thử bản đồ/GPS trên điện thoại và kiểm chứng 10 tọa độ thực địa. iPhone/Safari chặn tự phát audio; đã điều chỉnh thẻ audio và cần thử lại. QR chờ xác nhận luồng audio và ngưỡng geofence.

Xem [rà tiến độ và thứ tự sửa demo D0–D7](test-reports/DEMO_REVISION_PROGRESS_2026_10_23.md), cập nhật 23/10/2026. Kết quả sau triển khai được ghi trong báo cáo tiến độ khách và Admin/audio.

> **Trạng thái demo 23/10/2026:** khách không đăng nhập; welcome, ID khách/hành trình, nội dung/audio công khai, Admin và thống kê visit/journey/audio đã triển khai. QR vẫn hoãn. Chi tiết tại [kế hoạch khách/QR](DEMO_GUEST_QR_PLAN.md) và [báo cáo tiến độ](test-reports/DEMO_GUEST_PROGRESS_2026_10_23.md).

# Công việc triển khai và kiểm soát chất lượng

Nguồn phạm vi: [kế hoạch được chọn](PROJECT_PLAN.md).
Yêu cầu cách làm mới: chia nhỏ công việc, kiểm thử sau mỗi phần, ghi lỗi và đối chiếu kế hoạch.
Đây là thứ tự kỹ thuật để thực hiện kế hoạch, không thay lộ trình thành cam kết deadline mới.
Ưu tiên hiện hành: [demo 2 ngày](DEMO_2_DAYS.md) đã được người dùng xác nhận;
giữ các đầu việc dài hạn bên dưới để triển khai sau demo.

## Quy trình cho mỗi phần

1. Ghi phạm vi, tiêu chí hoàn thành và quyết định còn thiếu.
2. Triển khai phần đã rõ; hỏi trước khi làm phần phụ thuộc quyết định nghiệp vụ còn thiếu.
3. Chạy test của phần đó và kiểm tra hồi quy liên quan; sửa lỗi tìm thấy rồi kiểm tra lại.
4. Ghi kết quả thật, test chưa chạy, giới hạn và chênh lệch so với kế hoạch.
5. Chỉ đánh dấu hoàn tất khi đủ tiêu chí. Không coi test mock là kiểm thử cơ sở dữ liệu thật.
6. Cập nhật tài liệu/API cùng mã. Không cần hỏi lại quyền triển khai các phần đã được yêu cầu.

## Danh sách công việc

### Trạng thái xác nhận 24/10/2026

- Atlas ứng dụng: `phong` là Admin active; role counts sau dọn là 0 User, 0 Creator, 1 Admin; có 10 địa điểm nháp, 10 MP3 ready trong GridFS, 10 selection và release công bố gắn audio cho 10/10 địa điểm.
- Kiểm kê tài khoản: đã thu hồi phiên của `123` và `AGT`, rồi xóa đúng hai tài khoản User legacy. Theo xác nhận người dùng, đã xóa Creator `phong11` và đề xuất `pending` liên kết. Xác minh các mục tiêu không còn, Admin vẫn active.
- Hồi quy mã trong lượt cleanup: 173 backend unit test, 39 frontend test, build/typecheck và E2E 12/12 desktop/mobile đạt. E2E dùng collection/bucket tạm, shutdown xác nhận dọn sạch; chạy trước khi xóa hai User và không dùng tài khoản Atlas ứng dụng.
- Người dùng đã nghe 10 MP3 demo và xác nhận đúng, không cần thay; Atlas release hiện tại đã gắn audio đủ 10/10 địa điểm. Chưa thay đổi snapshot/release.
- Smoke test 24/10 trên demo đang chạy: backend readiness `ready`/database `connected`; release công khai có 10 địa điểm và 10/10 có audio ID; frontend trả 200; 39 test frontend và build/typecheck đạt. Chỉ đọc dữ liệu Atlas, không đăng nhập hoặc ghi dữ liệu.
- Kiểm tra trên trình duyệt người dùng: phiên Admin `phong` hoạt động; trang Quản trị và Nội dung tải được, hiển thị dashboard/tài khoản, 10 địa điểm cùng điều khiển lưu/công bố và thư viện audio. Chỉ quan sát, không ghi dữ liệu.
- Cập nhật 24/10: OSM/10 marker và GPS thật opt-in/mô phỏng/geofence/autoplay frontend đã triển khai; 54 test frontend và build/typecheck đạt. Việc kế tiếp là người dùng thử nút mô phỏng, sau đó nghiệm thu autoplay/GPS thật qua HTTPS trên điện thoại và xác minh tọa độ/ngưỡng thực địa; chưa làm QR. Không ghi vị trí GPS hay dữ liệu mô phỏng vào Atlas.

### Mốc demo ngày 22/10/2026

Cập nhật tiếp: demo hiện tại có hai trang Admin: **Nội dung** (địa điểm/văn bản/audio) và
**Quản trị** (dashboard/user); Creator đã gỡ khỏi demo. Đã hoàn thiện trang Quản trị,
tải lại/lỗi/phân trang, giữ form khi lỗi và kiểm tra quyền.
Xem [báo cáo tách trang](test-reports/MANAGEMENT_PAGE.md) cho kết quả kiểm thử hiện hành.

Điều hướng demo dùng `#/admin` cho **Nội dung** và `#/management` cho **Quản trị**; route Creator cũ đưa Admin về Nội dung và API Creator trả 404.

Đã có mã và kiểm thử cho nội dung MongoDB (tour demo một document nháp), snapshot công bố,
trình phát MP3/GridFS/Range, màn hình Admin sửa/thêm/xóa điểm, upload MP3 ≤10 MiB,
danh sách/khóa/mở khóa/đổi vai trò user và dashboard đếm dữ liệu thật. Creator đã có bản
đề xuất toàn tour riêng, gửi duyệt/trả chỉnh sửa; Admin áp dụng bản được duyệt rồi công bố riêng.
Đã seed 10 mô tả thành nháp và nhập 10 MP3 trên Atlas ứng dụng, cấp Admin bằng lệnh tường minh.
Không tự công bố hoặc coi tư liệu đã được khảo sát. Xem [báo cáo demo](test-reports/DEMO_CONTENT_AUDIO_ADMIN.md)
và [báo cáo Creator](test-reports/CREATOR_REVIEW.md).

Các mã dài hạn bên dưới chưa tự chuyển sang “hoàn tất”: demo chưa có mô hình Tour/POI/
Localization tách riêng, GPS/hàng đợi tự động, dịch/TTS jobs/fallback, dashboard sự kiện/audit
hoặc nghiệm thu thiết bị thật.

| Mã | Phần | Điều kiện hoàn thành chính | Trạng thái |
| --- | --- | --- | --- |
| P1.1 | MongoDB lifecycle, cấu hình và readiness | Có test lỗi/cleanup/che URI; ping Atlas thật | Hoàn tất: 34 test cục bộ + 1 ping Atlas đạt — [báo cáo](test-reports/P1_1_MONGODB.md) |
| P1.2 | User/session và index | Dữ liệu hợp lệ; username duy nhất; index thật được kiểm tra | Hoàn tất: 69 test cục bộ + 12 test Atlas đạt — [báo cáo](test-reports/P1_2_USER_SESSIONS.md) |
| P1.3 | JWT cookie, CSRF, đăng nhập/đăng xuất, RBAC | Không tự nâng quyền; hết hạn/thu hồi đúng; test truy cập trái phép | Hoàn tất: 124 test cục bộ + 14 test Atlas đạt — [báo cáo](test-reports/P1_3_AUTH.md) |
| P1.4 | Giao diện đăng ký/đăng nhập và trạng thái phiên | Hoạt động với API thật; lỗi dễ hiểu trên điện thoại/máy tính | Hoàn tất: 18 test frontend + 4 test Edge/Atlas tạm; mobile bằng viewport — [báo cáo](test-reports/P1_4_AUTH_UI.md) |
| P1.4.1 | Trang khám phá sau đăng nhập | Hiển thị 10 mô tả nguồn, chọn địa điểm; chừa vùng thay bằng ảnh sơ đồ; không giả GPS/audio | Hoàn tất giao diện: 4 test mới, tổng 22 test frontend; rà Edge desktop/tablet/mobile — [báo cáo](test-reports/P1_4_1_EXPLORE_UI.md) |
| P1.5 | Mô hình Tour/POI/Localization và nhập mẫu có nguồn | GeoJSON đúng thứ tự; tách nháp/công bố; không bịa nội dung | Có tập con demo: tour nháp chứa POI/nội dung vi, vị trí nullable, nguồn và snapshot; chưa tách collection |
| P2.1 | MapLibre + tile nền trực tuyến | Bản đồ tương tác khuôn viên, attribution rõ, lỗi tải có thể thử lại; marker dùng tọa độ người dùng cung cấp | Stadia Maps Alidade Bright raster đã được người dùng cấu hình domain và xác nhận chạy trên điện thoại. Có 10 marker; danh sách hiển thị tên/nội dung, ký hiệu A–E đồng nhất, panel map/audio chỉ hiện sau khi chọn. |
| P2.2 | GPS thật/mô phỏng và geofence | Cùng luồng xử lý; xử lý mẫu cũ/sai số; khảo sát thực tế | GPS đã được người dùng thử trên điện thoại, 10 tọa độ đã kiểm chứng thực địa. iPhone/Safari chặn tự phát, phải nhấn Phát; đã điều chỉnh để chuẩn bị thẻ audio trong thao tác bật GPS/mô phỏng, cần thử lại trên iPhone. Ngưỡng 30/45 m và accuracy 25 m chưa được người dùng xác nhận riêng. |
| P2.3 | Phiên tham quan và hàng đợi audio | Không phát chồng/lặp; chọn điểm thủ công được | Có phát thủ công, dừng khi đổi điểm/rời trang; chưa có phiên tham quan/hàng đợi GPS |
| P3.1 | Creator, gửi duyệt, Admin duyệt và snapshot | Đúng quyền sở hữu; bản nháp không làm đổi bản công bố | Workflow Creator thuộc kế hoạch dài hạn; đã gỡ khỏi demo hiện tại. Admin biên soạn trực tiếp, lưu nháp và công bố riêng. |
| P3.2 | Dịch Việt–Anh và jobs bền vững | Retry hữu hạn, chống trùng, kiểm tra phiên bản nguồn | Chưa làm |
| P3.3 | Edge-TTS và audio fallback | MP3 đúng phiên bản; thử từng tầng và lỗi nhà cung cấp | Chưa làm |
| P4.1 | Service worker, IndexedDB và pack theo ngôn ngữ | Đủ tài nguyên chung + nội dung/MP3 ngôn ngữ chọn; thêm ngôn ngữ không tải lại tài nguyên chung hợp lệ | Chưa làm |
| P4.2 | Resume, checksum, dung lượng, cập nhật và logout offline | Không báo đủ khi thiếu file; không lộ dữ liệu giữa tài khoản | Chưa làm |
| P5.1 | Gemini hỗ trợ bản nháp | Dựa trên tư liệu được cấp; không tự công bố; xử lý quota/lỗi | Chưa làm |
| P5.2 | Dashboard và audit theo bản gốc | Đúng sự kiện, chống trùng, tách mô phỏng | Demo đã có usage events visit/journey/audio theo ngày ICT; chưa có QR/GPS events và audit dài hạn |
| P5.3 | Nội dung 8–10 điểm, cloud/local và nghiệm thu | Test thiết bị, thực địa, triển khai và diễn tập | Chưa làm |

### Cập nhật phần demo khách và giao diện — 23/10/2026

- Đã hoàn thành luồng khách không đăng nhập ở mức demo: welcome riêng, ID khách giữ trong browser, ID hành trình mới khi bắt đầu, route explore tách khỏi welcome.
- Đã hoàn thành giao diện welcome theo mẫu SGU và responsive header explore; khách không thấy tên tài khoản, ngôn ngữ hoặc link Admin trong explore.
- Đã giữ lối vào quản lý cho Admin: Admin active vẫn thấy liên kết `Admin` và vào `#/management`; đăng ký bị bỏ khỏi UI, route legacy chuyển về login.
- Đã kiểm tra lại frontend sau thay đổi: 39 test đạt, typecheck/build đạt.
- E2E desktop và viewport mobile đạt cho Admin/tài khoản/nội dung/audio và luồng khách welcome/bắt đầu/tải lại/tab mới; xem [báo cáo khách](test-reports/DEMO_GUEST_PROGRESS_2026_10_23.md).
- Chưa đánh dấu hoàn tất các phần QR, camera, GPS, offline, dịch nội dung hoặc ngôn ngữ English/한국어; menu ngôn ngữ hiện chỉ là thiết kế giao diện.

Khảo sát tư liệu có thể tiến hành song song với phát triển; chưa có bộ dữ liệu thật được duyệt.
Chuẩn bị sớm theo yêu cầu mới: đã tạo 10 MP3 demo tiếng Việt giọng nam,
131 test cục bộ đạt và 10/10 file qua kiểm tra kỹ thuật — [báo cáo](test-reports/DEMO_AUDIO_VI_MALE.md).
Đây là chuẩn bị asset, không đánh dấu P3.3 TTS/jobs/fallback đã hoàn tất.
Không thêm báo cáo hiện diện theo POI/CSV hoặc gộp vai trò vào danh sách khi chưa có yêu cầu thay đổi mới.

## Quyết định nền tảng

- Môi trường phát triển: **MongoDB Atlas**, đã được người dùng chọn.
- Cluster đã được tạo, người dùng đã cập nhật mật khẩu và URI; ping Atlas thật đạt.
  Hướng dẫn tái lập tại [ATLAS_SETUP](ATLAS_SETUP.md).
- Username không phân biệt hoa/thường, chuẩn hóa trim + casefold để chống trùng.
- Token truy cập 15 phút, tự gia hạn; phiên có hạn tuyệt đối 7 ngày từ lúc đăng nhập.
  Mô hình lưu trữ, API và gia hạn phía trình duyệt đã thực hiện.
- Đăng ký chỉ tạo User; mật khẩu 15–128 ký tự, Unicode và dấu cách được phép.
- Offline tùy chọn theo ngôn ngữ, tải bổ sung được, bản đồ/ảnh dùng chung; không tải hết mọi ngôn ngữ.

## Bằng chứng và báo cáo

Ghi kết quả mỗi phần tại `docs/test-reports/`; liên kết từ bảng tiến độ hoặc TEST_AND_DEMO.
Báo cáo phân biệt đạt, lỗi đã sửa, chưa kiểm thử và lệch phạm vi.
Bản kế hoạch gốc giữ nguyên, mọi thay đổi được ghi ở PROJECT_CONTEXT và đầu việc liên quan.
