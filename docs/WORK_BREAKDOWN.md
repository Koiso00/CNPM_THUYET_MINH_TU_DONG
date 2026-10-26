> **Cập nhật người dùng 24/10/2026:** Stadia/GPS hoạt động trên điện thoại; 10 tọa độ đã kiểm chứng thực địa và chạm địa điểm phát audio được. Dashboard thống kê Admin đã hoàn thiện phần nền và người dùng xác nhận bản deploy hoạt động. Giao diện VI/EN/KO cùng nội dung/audio English cho 10 điểm đã hoàn tất. QR là bước phát triển kế tiếp; GPS tự phát trên iPhone/Safari và ngưỡng thực địa vẫn cần nghiệm thu trước demo chính thức.

Xem [rà tiến độ và thứ tự sửa demo D0–D7](test-reports/DEMO_REVISION_PROGRESS_2026_10_23.md), cập nhật 23/10/2026. Kết quả sau triển khai được ghi trong báo cáo tiến độ khách và Admin/audio.

> **Ảnh chụp ngày 23/10/2026 — lịch sử:** khách không đăng nhập, Admin quản lý nội dung/dashboard, QR còn hoãn. Cập nhật mới nhất nằm ở trạng thái 24/10 đầu tài liệu và trong [kế hoạch khách/QR](DEMO_GUEST_QR_PLAN.md).

# Công việc triển khai và kiểm soát chất lượng

Nguồn phạm vi: [kế hoạch được chọn](PROJECT_PLAN.md).
Yêu cầu cách làm mới: chia nhỏ công việc, kiểm thử sau mỗi phần, ghi lỗi và đối chiếu kế hoạch.
Đây là thứ tự kỹ thuật để thực hiện kế hoạch, không thay lộ trình thành cam kết deadline mới.
Ưu tiên hiện hành: QR sau khi hoàn tất dashboard và đa ngôn ngữ. GPS/geofence thực tế được để sau; giữ các đầu việc dài hạn bên dưới để theo dõi phần còn lại của kế hoạch gốc.

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
- Cập nhật 24/10: Stadia/10 marker và GPS opt-in/mô phỏng/geofence frontend đã triển khai. Người dùng đã kiểm chứng tọa độ tại thực địa, thử GPS trên điện thoại và xác nhận chạm điểm phát audio được. iPhone/Safari có thể chặn tự phát theo geofence; tự phát/ngưỡng được dời sang giai đoạn nghiệm thu sau. Không ghi vị trí GPS hay dữ liệu mô phỏng vào Atlas.
- Cập nhật ưu tiên theo người dùng 24/10: nghiệm thu GPS/geofence thực tế có thể để sau; dashboard Admin được làm trước QR. Đã bổ sung bộ chọn ngày và bảng lượt phát audio theo địa điểm từ sự kiện thật; dashboard giữ các tổng tài khoản, nội dung, khách, hành trình và audio. Dữ liệu GPS mô phỏng không tính vào báo cáo. QR là bước kế tiếp sau dashboard thống kê và hỗ trợ đa ngôn ngữ.
- Nhật ký deploy 24/10: Render log cho thấy aggregate async bị thiếu `await`, gây 500 ở API dashboard. Đã sửa và thêm test hồi quy; người dùng xác nhận dashboard trên deploy đã hoạt động. Xem [nhật ký dashboard Admin](test-reports/ADMIN_DASHBOARD_PROGRESS_2026_10_24.md).
- Cập nhật 26/10: đã triển khai chọn VI/EN/KO xuyên hành trình và Admin biên tập theo locale. Người dùng duyệt bản dịch/audio English và Korean cho 10 POI; Atlas release `2cebd7fb-7ca8-4719-819b-abb2a2191038` có đủ audio vi/en/ko, bản dịch giữ checksum nguồn Việt. Xem [báo cáo đa ngôn ngữ](test-reports/MULTILINGUAL_UI_PROGRESS_2026_10_24.md), [audio English](test-reports/DEMO_AUDIO_EN_DRAFT_2026_10_24.md) và [audio Hàn](test-reports/DEMO_AUDIO_KO_DRAFT_2026_10_26.md). Kiểm tra gần nhất của đợt đa ngôn ngữ: 181 backend test, 16 integration test bỏ qua mặc định; 61 frontend test; Ruff, typecheck/build đạt. Render từng bị suspend; readiness đã được người dùng kiểm tra đạt sau khi service hoạt động lại. QR là bước kế tiếp.
- Cập nhật 26/10 CI/CD: GitHub Actions chạy frontend/backend trên PR và push `main`; run #3, commit `342d3e5`, đạt; frontend 61/61 test, backend checks đạt. Hai lỗi Ruff E501/I001 và bốn file format đã sửa. Readiness trên Render trả `ready`/`connected` sau khi service hoạt động lại. Chưa xác nhận Auto-Deploy **After CI Checks Pass** hoặc triển khai đúng commit mới nhất; chưa nghiệm thu lại UI/audio sau deploy. Xem [nhật ký CI/CD](test-reports/CI_CD_PROGRESS_2026_10_26.md).

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
| P2.2 | GPS thật/mô phỏng và geofence | Cùng luồng xử lý; xử lý mẫu cũ/sai số; khảo sát thực tế | GPS đã được người dùng thử trên điện thoại, 10 tọa độ đã kiểm chứng thực địa, chạm điểm phát audio được. Người dùng dời nghiệm thu GPS tự nhận diện/tự phát và ngưỡng 30/45 m sang sau. |
| P2.3 | Phiên tham quan và hàng đợi audio | Không phát chồng/lặp; chọn điểm thủ công được | Phát thủ công và thử tự phát khi geofence nhận điểm đã có; chưa có hàng đợi GPS và chưa nghiệm thu chặn phát chồng/lặp trên thiết bị |
| P3.1 | Creator, gửi duyệt, Admin duyệt và snapshot | Đúng quyền sở hữu; bản nháp không làm đổi bản công bố | Workflow Creator thuộc kế hoạch dài hạn; đã gỡ khỏi demo hiện tại. Admin biên soạn trực tiếp, lưu nháp và công bố riêng. |
| P3.2 | Dịch Việt–Anh và jobs bền vững | Retry hữu hạn, chống trùng, kiểm tra phiên bản nguồn | 10 bản dịch English thủ công đã được duyệt/công bố; pipeline dịch tự động/job bền vững chưa triển khai |
| P3.3 | Edge-TTS và audio fallback | MP3 đúng phiên bản; thử từng tầng và lỗi nhà cung cấp | 10 MP3 tiếng Việt và 10 MP3 English đã được tạo/nghe duyệt; TTS job và fallback nhiều tầng chưa triển khai |
| P4.1 | Service worker, IndexedDB và pack theo ngôn ngữ | Đủ tài nguyên chung + nội dung/MP3 ngôn ngữ chọn; thêm ngôn ngữ không tải lại tài nguyên chung hợp lệ | Chưa làm |
| P4.2 | Resume, checksum, dung lượng, cập nhật và logout offline | Không báo đủ khi thiếu file; không lộ dữ liệu giữa tài khoản | Chưa làm |
| P5.1 | Gemini hỗ trợ bản nháp | Dựa trên tư liệu được cấp; không tự công bố; xử lý quota/lỗi | Chưa làm |
| P5.2 | Dashboard và audit theo bản gốc | Bộ lọc ngày; khách/hành trình/lượt audio tổng hợp và audio theo địa điểm; dữ liệu thật, chống trùng, tách mô phỏng | Dashboard thống kê nền đã có bộ lọc ngày ICT và lượt audio theo địa điểm; QR events và audit dài hạn chưa có, sẽ triển khai theo phần QR/kế hoạch gốc. |
| P5.3 | Nội dung 8–10 điểm, cloud/local và nghiệm thu | Test thiết bị, thực địa, triển khai và diễn tập | Đã có 10 điểm, kiểm chứng tọa độ thực địa, dashboard đã chạy trên deploy; readiness Render ngày 26/10 đạt và kết nối Atlas. Còn nghiệm thu GPS tự phát/ngưỡng, xác nhận phiên bản mới nhất trên Render và diễn tập tổng thể |

### Cập nhật phần demo khách và giao diện — 23/10/2026

- Đã hoàn thành luồng khách không đăng nhập ở mức demo: welcome riêng, ID khách giữ trong browser, ID hành trình mới khi bắt đầu, route explore tách khỏi welcome.
- Đã hoàn thành giao diện welcome theo mẫu SGU và responsive header explore; khách không thấy tên tài khoản, ngôn ngữ hoặc link Admin trong explore.
- Đã giữ lối vào quản lý cho Admin: Admin active vẫn thấy liên kết `Admin` và vào `#/management`; đăng ký bị bỏ khỏi UI, route legacy chuyển về login.
- Đã kiểm tra lại frontend sau thay đổi: 39 test đạt, typecheck/build đạt.
- E2E desktop và viewport mobile đạt cho Admin/tài khoản/nội dung/audio và luồng khách welcome/bắt đầu/tải lại/tab mới; xem [báo cáo khách](test-reports/DEMO_GUEST_PROGRESS_2026_10_23.md).
- **Ảnh chụp trạng thái ngày 23/10:** lúc đó QR/camera/GPS, offline và nội dung English/한국어 chưa hoàn tất; bộ chọn ngôn ngữ chỉ là giao diện. Trạng thái mới hơn ngày 24/10 được ghi ở đầu tài liệu và trong các báo cáo liên kết.

Khảo sát tư liệu có thể tiến hành song song với phát triển. Mười tọa độ đã được người dùng kiểm chứng thực địa; nội dung English/audio English cũng đã được duyệt. Không suy rộng các xác nhận này thành kiểm duyệt lịch sử của nhà trường.
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
