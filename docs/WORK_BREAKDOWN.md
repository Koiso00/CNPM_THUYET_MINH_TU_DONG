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

### Mốc demo ngày 22/10/2026

Cập nhật tiếp: người dùng chốt tách trang **Nội dung** (địa điểm/văn bản/audio) và
**Quản trị** (dashboard/user) dành cho Admin; Creator ở khu vực riêng. Đã hoàn thiện
trang Quản trị, tải lại/lỗi/phân trang, giữ form khi lỗi và kiểm tra quyền.
Xem [báo cáo tách trang](test-reports/MANAGEMENT_PAGE.md) cho kết quả kiểm thử hiện hành.

Điều hướng hiện dùng `#/admin` cho **Nội dung**, `#/management` cho **Quản trị** và `#/creator`
cho Creator; nhãn quyền Admin/Creator mở đúng khu vực tương ứng.

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
| P2.1 | MapLibre/PMTiles và tài nguyên bản đồ | Hiển thị bản đồ khuôn viên, nguồn/attribution rõ | Chưa làm |
| P2.2 | GPS thật/mô phỏng và geofence | Cùng luồng xử lý; xử lý mẫu cũ/sai số; khảo sát thực tế | Chưa làm |
| P2.3 | Phiên tham quan và hàng đợi audio | Không phát chồng/lặp; chọn điểm thủ công được | Có phát thủ công, dừng khi đổi điểm/rời trang; chưa có phiên tham quan/hàng đợi GPS |
| P3.1 | Creator, gửi duyệt, Admin duyệt và snapshot | Đúng quyền sở hữu; bản nháp không làm đổi bản công bố | Demo toàn tour đã có bản đề xuất riêng, gửi duyệt/trả chỉnh sửa, Admin duyệt và áp dụng bằng revision CAS; công bố vẫn riêng. Chưa có bản dịch Việt–Anh, TTS jobs/fallback hoặc phân quyền theo địa điểm — [báo cáo](test-reports/CREATOR_REVIEW.md) |
| P3.2 | Dịch Việt–Anh và jobs bền vững | Retry hữu hạn, chống trùng, kiểm tra phiên bản nguồn | Chưa làm |
| P3.3 | Edge-TTS và audio fallback | MP3 đúng phiên bản; thử từng tầng và lỗi nhà cung cấp | Chưa làm |
| P4.1 | Service worker, IndexedDB và pack theo ngôn ngữ | Đủ tài nguyên chung + nội dung/MP3 ngôn ngữ chọn; thêm ngôn ngữ không tải lại tài nguyên chung hợp lệ | Chưa làm |
| P4.2 | Resume, checksum, dung lượng, cập nhật và logout offline | Không báo đủ khi thiếu file; không lộ dữ liệu giữa tài khoản | Chưa làm |
| P5.1 | Gemini hỗ trợ bản nháp | Dựa trên tư liệu được cấp; không tự công bố; xử lý quota/lỗi | Chưa làm |
| P5.2 | Dashboard và audit theo bản gốc | Đúng sự kiện, chống trùng, tách mô phỏng | Có dashboard đếm dữ liệu hệ thống cho demo; chưa có usage events/audit |
| P5.3 | Nội dung 8–10 điểm, cloud/local và nghiệm thu | Test thiết bị, thực địa, triển khai và diễn tập | Chưa làm |

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
