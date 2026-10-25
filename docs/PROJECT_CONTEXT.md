> **Ảnh chụp xác nhận người dùng ngày 24/10/2026 — lịch sử:** Stadia/GPS hoạt động trên điện thoại, 10 tọa độ đã kiểm chứng thực địa và chạm địa điểm phát audio được. Dashboard Admin có lọc ngày và lượt nghe theo địa điểm; người dùng xác nhận bản deploy hoạt động. Giao diện khách VI/EN/KO và nội dung/audio English cho 10 POI đã hoàn tất; QR là bước phát triển kế tiếp ở thời điểm đó. Ngưỡng GPS/geofence và tự phát trên iPhone/Safari vẫn cần nghiệm thu trước demo chính thức.

> **Tiến độ 24/10:** giao diện khách VI/EN/KO giữ lựa chọn xuyên hành trình; 10 POI English và 10 MP3 đã được người dùng duyệt và công bố trong Atlas release `09d43a32-43d1-4f2b-85d0-cdae2ad29981`. Audio Việt vẫn giữ riêng. Workspace có code hỗ trợ localization/audio theo ngôn ngữ. Render báo service `sgu-campus-guide-demo` đang “Suspended by you”, nên code mới chưa deploy lên đó. Xem [báo cáo đa ngôn ngữ](test-reports/MULTILINGUAL_UI_PROGRESS_2026_10_24.md).

> **Cập nhật Admin đa ngôn ngữ 24/10:** `#/admin` có bộ chọn Tiếng Việt/English/한국어; các trường tên địa điểm, thuyết minh và nguồn tư liệu được chỉnh theo ngôn ngữ. Danh sách/nghe thử/tải MP3 cũng đổi theo lựa chọn. Bản dịch phải đủ trường và khớp checksum nội dung Việt trước khi xuất hiện trong release. Tên tour hiện vẫn dùng chung. Kiểm tra: frontend 61 test, build/typecheck đạt; backend 181 test đạt, 16 integration test skip theo mặc định. Chi tiết tại [nhật ký Admin đa ngôn ngữ](test-reports/ADMIN_MULTILINGUAL_CONTENT_2026_10_24.md).

> **Ảnh chụp trạng thái ngày 23/10/2026 — lịch sử:** khách không đăng nhập; welcome, hành trình, nội dung/audio và dashboard đã có; QR còn hoãn tại thời điểm đó. Trạng thái hiện hành được cập nhật trong phần 24/10 bên dưới.

> **Cập nhật workspace 25/10/2026:** mã QR PNG/SVG cho các POI thuộc release công bố, mở welcome theo POI, scanner camera trong hành trình và event/dashboard QR đã được triển khai trong code. Chưa nghiệm thu camera điện thoại thật hoặc deploy; Render đang tạm dừng. GPS/geofence thực địa vẫn chờ nghiệm thu; offline và AI tiếp tục hoãn.

# Bối cảnh dự án

## Trạng thái demo đã xác nhận — 24/10/2026

Đối với demo, người nghe dùng welcome và không đăng nhập; ID khách được giữ trong trình duyệt, mỗi lần bấm bắt đầu tạo hành trình mới. Creator/Admin gộp thành một vai trò vận hành Admin; Creator UI/API đã được gỡ khỏi demo. Trang Nội dung (`#/admin`) và Quản trị (`#/management`) dành cho Admin. Nội dung/audio công khai chỉ đọc release đã công bố; dashboard có visit, journey và audio theo ngày ICT. Bản đồ Stadia và GPS hoạt động trên điện thoại; 10 tọa độ đã kiểm chứng thực địa. Người dùng xác nhận chạm địa điểm phát audio được trên điện thoại. Dashboard có bộ lọc ngày ICT và lượt phát audio theo địa điểm; người dùng xác nhận bản deploy hoạt động. Nội dung POI English và audio English cho 10 điểm đã được người dùng duyệt và công bố cùng tiếng Việt trong release song ngữ ngày 24/10. Nghiệm thu GPS tự nhận diện điểm/tự phát và ngưỡng geofence 30/45 m được dời lại nhưng cần xong trước demo chính thức. Các tài khoản legacy `123`, `AGT`, `phong11` và đề xuất `pending` gắn với Creator đã được xóa theo phạm vi người dùng chốt; hiện Atlas có 1 Admin active (`phong`), không còn User/Creator legacy. Xem [kế hoạch khách/QR](DEMO_GUEST_QR_PLAN.md), [báo cáo khách](test-reports/DEMO_GUEST_PROGRESS_2026_10_23.md), [báo cáo Admin/audio](test-reports/DEMO_CONTENT_AUDIO_ADMIN.md) và [báo cáo audio English](test-reports/DEMO_AUDIO_EN_DRAFT_2026_10_24.md).

Các phần mô tả ba vai trò và Creator ở dưới là quyết định của kế hoạch gốc dài hạn hoặc lịch sử trước khi cập nhật demo; không mô tả luồng demo hiện hành.

## Nguồn và quyết định đã chốt

[Kế hoạch gốc](PROJECT_PLAN.md) là bản người dùng gửi lại và yêu cầu **giữ nguyên**.
Đây là nguồn chuẩn cho phạm vi sản phẩm. Các tài liệu khác diễn giải cách tổ chức thực hiện;
chúng không thay thế các quyết định trong bản gốc.

**Cập nhật trực tiếp từ người dùng ngày 21/10/2026:** ưu tiên demo trong khoảng 2 ngày,
gồm đăng nhập, nghe audio, quản lý địa điểm/nội dung/audio/user và dashboard lấy số liệu thật.
Tạm hoãn GPS, offline, AI và dịch tự động. Đây là thứ tự/phạm vi demo mới, không xóa kế hoạch dài hạn.
Theo dõi [DEMO_2_DAYS](DEMO_2_DAYS.md). Người dùng đã cung cấp và chọn
[nguồn tiếng Việt cho 10 địa điểm](../data/sources/campus-vi-user-2026-10-21.md);
Người dùng đã chọn tạo MP3 bằng Edge-TTS, giọng nam tiếng Việt.
Giọng xác nhận từ dịch vụ: vi-VN-NamMinhNeural, dùng tốc độ/âm lượng/cao độ mặc định.

| Nội dung | Quyết định |
| --- | --- |
| Sản phẩm | Website trên điện thoại và máy tính, không bắt buộc cài ứng dụng |
| Khu vực | Cơ sở chính Đại học Sài Gòn; 8–10 điểm ngoài trời |
| Nội dung | Một tour mẫu; tiếng Việt và tiếng Anh |
| Vai trò dài hạn | User, Creator, Admin; demo hiện tại gộp Creator vào Admin theo yêu cầu cập nhật |
| Tham quan | Tự do; tự nhận điểm khi trang đang mở hoặc chọn nghe thủ công |
| Demo | GPS mô phỏng cùng luồng xử lý với GPS thật |
| Ngoại tuyến | Khách tự chọn ngôn ngữ tải, có thể tải bổ sung; nội dung/MP3 theo ngôn ngữ, bản đồ/ảnh dùng chung |
| Nền tảng | FastAPI, MongoDB/GridFS, React, MapLibre/PMTiles, Workbox/IndexedDB |
| AI | Gemini theo cấu hình; chỉ gợi ý bản nháp |
| Chi phí | Ưu tiên hạ tầng miễn phí; bản chạy trên máy để dự phòng |
| Tiến độ | Lộ trình dự kiến 10 tuần; không phải cam kết hoàn thành |
| Dữ liệu thật | Có nội dung nguồn người dùng cung cấp, 10 tọa độ đã kiểm chứng thực địa, và nội dung/audio English đã được người dùng duyệt. Không suy rộng xác nhận này thành kiểm duyệt lịch sử của nhà trường. |

## Các phương án không còn là phạm vi hiện hành

Kế hoạch gốc được giữ cho phát triển dài hạn. Phạm vi demo đã cập nhật ngày 23/10: gộp Creator/Admin,
chỉ OSM trực tuyến ở bản đầu, thống kê người đang ở từng điểm và xuất CSV.
Không tự khôi phục các phương án này. Không suy diễn số giờ làm hoặc năng lực nhóm
thành cam kết tiến độ mới.

## Trạng thái thực tế

Admin dùng **Nội dung** (`#/admin`) để quản lý địa điểm/bài/audio và **Quản trị** (`#/management`) để xem dashboard/tài khoản. Creator UI, API và quy trình duyệt đã gỡ khỏi demo; User không được vào các API Admin. Các mô tả Creator bên dưới là lịch sử hoặc thiết kế dài hạn.

**Cập nhật 22/10/2026:** đã triển khai demo dữ liệu/audio/quản trị:
10 mô tả nguồn nhập thành bản nháp MongoDB, 10 MP3 nhập GridFS; Admin có thể sửa/thêm/xóa
địa điểm, lưu nháp, công bố/gỡ công bố và tải MP3 thay thế. Trang khám phá chỉ đọc API bản
công bố, phát thủ công bằng trình phát HTML audio. Snapshot giữ nguyên khi sửa nháp/thay audio.
Có quản lý user và dashboard đếm dữ liệu thật. Nội dung ứng dụng chưa tự công bố;
Admin nghe kiểm tra rồi công bố trong giao diện. Xem [báo cáo](test-reports/DEMO_CONTENT_AUDIO_ADMIN.md).

Quyết định người dùng bổ sung ngày 22/10: cấp Admin đầu tiên bằng lệnh nâng tài khoản đã đăng ký;
quản lý danh sách, khóa/mở khóa và đổi vai trò, không xóa tài khoản. Dashboard trước mắt đếm
tài khoản, tài khoản hoạt động, địa điểm nháp/công bố, tour công bố và audio đã nhập.
Cho phép Admin thay MP3 theo nội dung đang lưu, tối đa 10 MiB (10 × 1024 × 1024 byte)/file;
công bố lại mới áp dụng cho người nghe. Admin đang hoạt động được bảo vệ khỏi khóa/hạ quyền
trên web để tránh mất toàn bộ quyền quản trị khi hai Admin thao tác đồng thời.
Ở một mốc trung gian, Creator từng có luồng đề xuất toàn tour (xem [báo cáo workflow](test-reports/CREATOR_REVIEW.md)); luồng đó đã gỡ khỏi demo hiện hành khi gộp Creator vào Admin. Bản dịch POI English/audio đã được duyệt và công bố thủ công; dịch/TTS tự động có jobs vẫn hoãn. Ưu tiên hiện tại là QR sau hoàn thành dashboard và đa ngôn ngữ.

Các đoạn bên dưới mô tả các mốc đã đạt trước cập nhật này; trạng thái mới ở trên thay thế
các ghi chú “chưa tích hợp” của nội dung/audio/quản trị.

Đã tạo khung backend/frontend, cấu hình môi trường mẫu, cơ sở Docker và tài liệu.
P1.1 đã có MongoDB connection pool theo lifespan, liveness/readiness và test nền tảng.
Atlas đã được tạo và P1.1 đã kiểm chứng ping thật thành công.
P1.2 đã có model/repository User/session và index thật trên Atlas. Ghi chú “chưa có GridFS” ở đây chỉ thuộc mốc P1.2; GridFS audio được tích hợp trong demo ngày 22/10.
P1.3 đã có API xác thực và dependency RBAC, kiểm thử HTTP với Atlas thật trên collection tạm.
P1.4 có UI đăng ký/đăng nhập, gia hạn phiên, đăng xuất và khung trang theo role;
18 test frontend và 4 test Edge desktop/mobile viewport với Atlas tạm đạt.
Ở mốc P1.4 ban đầu, explore còn tĩnh và audio chưa tích hợp. Trạng thái hiện hành: 10 địa điểm và audio có trong Atlas/GridFS; release Việt–Anh đã được duyệt; khách đọc release công bố và phát audio thủ công hoặc qua geofence khi trình duyệt cho phép. Stadia/GPS/geofence đã tích hợp; tọa độ 10 điểm đã kiểm chứng thực địa. Nghiệm thu tự phát trên Safari và ngưỡng geofence vẫn còn.

## Cập nhật cách thực hiện

Ngày 21/10/2026, người dùng đồng ý thay gói bắt buộc đầy đủ Việt–Anh bằng gói theo ngôn ngữ tự chọn.
Tải offline là tùy chọn; không tải vẫn dùng trực tuyến. Chỉ bảo đảm offline cho ngôn ngữ đã tải đủ.
Bản đồ/ảnh/tài nguyên dùng chung không tải lại khi thêm ngôn ngữ nếu đã có đúng phiên bản và checksum.
Khi tăng số ngôn ngữ trên hệ thống, không tự tải các ngôn ngữ mới về máy khách.
Chi tiết ở [TOUR_RUNTIME](TOUR_RUNTIME.md). Thay đổi thiết kế này không đưa offline trở lại demo 2 ngày.

Người dùng yêu cầu chia nhỏ công việc, test sau từng phần và báo lỗi/chênh lệch với kế hoạch.
Theo dõi tại [WORK_BREAKDOWN](WORK_BREAKDOWN.md). Người dùng chọn MongoDB Atlas cho môi trường
phát triển; đã tạo cluster, hoàn thiện kết nối theo [ATLAS_SETUP](ATLAS_SETUP.md).
Kết quả P1.1 và lỗi đã xử lý được ghi tại [báo cáo](test-reports/P1_1_MONGODB.md).
P1.2 hoàn tất theo [báo cáo](test-reports/P1_2_USER_SESSIONS.md).
Người dùng đã chốt username không phân biệt hoa/thường: Phong và phong cùng một tài khoản.
Token truy cập 15 phút, tự gia hạn trong phiên có hạn tuyệt đối 7 ngày từ lúc đăng nhập;
gia hạn không đẩy mốc 7 ngày ra xa hơn. Hết phiên cần đăng nhập lại.
Đăng ký công khai chỉ tạo User, quyền Creator/Admin do quản trị cấp sau.
Mật khẩu đăng ký 15–128 ký tự, cho phép Unicode/dấu cách, không bắt buộc trộn nhóm ký tự.
P1.3 triển khai JWT/cookie/CSRF và API gia hạn; P1.4 đã nối giao diện và gia hạn tự động.
Xem [báo cáo giao diện](test-reports/P1_4_AUTH_UI.md); chưa nghiệm thu trên điện thoại vật lý.
Chi tiết kiểm tra ở [báo cáo P1.3](test-reports/P1_3_AUTH.md).

Các chi tiết chưa được kế hoạch gốc quy định cần chốt ở mốc tương ứng;
không coi giá trị giữ chỗ trong tài liệu hay cấu hình là yêu cầu đã được duyệt.
