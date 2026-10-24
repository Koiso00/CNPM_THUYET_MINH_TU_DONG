> **Ưu tiên mới ngày 23/10/2026:** tạm hoãn toàn bộ QR (tạo/tải/in mã, mở từ QR, quét trong web và thống kê QR) đến khi hoàn thành Admin và thiết lập địa điểm/audio phát. Các thiết kế QR bên dưới được giữ cho giai đoạn sau. “Địa điểm phát” trước mắt là địa điểm gắn nội dung/MP3 và chọn nghe thủ công; nếu cần tự kích hoạt theo tọa độ/GPS thì phải chốt thêm.

# Rà tiến độ và kế hoạch sửa demo — 23/10/2026

> **Lưu ý cập nhật 24/10/2026:** các trạng thái “chưa triển khai” bên dưới ghi nhận tại mốc 23/10. Hiện dashboard đã hoạt động trên deploy, 10 tọa độ đã kiểm chứng thực địa, chạm điểm phát audio trên điện thoại hoạt động, giao diện khách VI/EN/KO và nội dung/audio English cho 10 POI đã hoàn tất. QR là bước tiếp theo; nghiệm thu GPS autoplay/ngưỡng vẫn còn. Xem [báo cáo đa ngôn ngữ](MULTILINGUAL_UI_PROGRESS_2026_10_24.md) và [dashboard](ADMIN_DASHBOARD_PROGRESS_2026_10_24.md).

## Cập nhật nghiệm thu tiếp theo — 23/10/2026

Kế hoạch D1–D3 đã có luồng thực tế trong working tree; không còn ở trạng thái “chưa triển khai” như ghi chú tại mốc dừng bên dưới. Atlas hiện có `phong` là Admin active, 10 địa điểm nháp, 10 MP3 ready trong GridFS và một release công bố (đã kiểm tra chỉ đọc). Backend test tập trung 20 đạt; frontend 39 đạt, build/typecheck đạt; E2E 8/8 lượt desktop/mobile đạt trên dữ liệu Atlas tạm và đã xác minh dọn sạch. Chi tiết ở [báo cáo khách](DEMO_GUEST_PROGRESS_2026_10_23.md) và [báo cáo Admin/audio](DEMO_CONTENT_AUDIO_ADMIN.md).

Việc còn cần hoàn tất trước QR là Admin nghe duyệt 10 audio và quyết định nội dung nào được công bố. Kiểm thử phát kỹ thuật không thay được việc nghe duyệt. Sau đó rà soát đúng các User/Creator cũ và thu hồi/xóa theo kế hoạch; hiện chưa thay đổi tài khoản cũ. QR, GPS, offline và AI tiếp tục hoãn.

## Kết quả triển khai thực tế sau kế hoạch — 23/10/2026

Các phần sau đã được triển khai và kiểm tra trong working tree:

- D1: Admin trực tiếp quản lý nội dung/audio; Creator riêng đã bỏ khỏi UI demo. Tài khoản `phong` đã được xác nhận là Admin active trên Atlas; chưa xóa User/Creator cũ và chưa reset mật khẩu.
- D2/D3: khách không đăng nhập, giữ ID khách trong browser, tạo ID hành trình khi bắt đầu, đọc snapshot/audio công khai; có event visit/journey/audio và dashboard theo ngày ICT.
- Giao diện: welcome tách rõ khỏi explore; route `#/welcome` không bị hành trình cũ đưa thẳng vào trang chính. Explore hiển thị `Xin chào`, header responsive; bộ chọn ngôn ngữ và link đăng nhập quản trị chỉ xuất hiện ở welcome/login.
- Quyền Admin: liên kết `Admin` vẫn xuất hiện với Admin ở mọi route phù hợp; đăng ký đã bỏ khỏi giao diện và `#/register` chuyển về login. Backend registration dài hạn vẫn giữ để không tự thay đổi mô hình kế hoạch gốc.

Kiểm tra gần nhất: backend **173 passed, 16 skipped**; Atlas integration **16 passed**; frontend **39 passed**; Ruff check/format, TypeScript và Vite build đạt. Readiness runtime trả **200 connected**. QR, GPS, offline, AI và dữ liệu ngôn ngữ Anh/Hàn vẫn chưa triển khai.

## Cập nhật khi dừng triển khai và đổi ưu tiên — 23/10/2026

Đã sửa mã: bỏ trang/điều hướng Creator riêng và API Creator/review/apply, Admin biên soạn trực tiếp; không cho gán mới role Creator qua API quản trị. Thêm lệnh setup_admin mặc định tài khoản phong; tạo mới với mật khẩu được cung cấp riêng hoặc nâng tài khoản đang hoạt động, giữ mật khẩu cũ, không tự mở khóa tài khoản. Chưa đóng đăng ký công khai vì luồng khách chưa được thay thế.

Kiểm tra đã chạy trước khi người dùng yêu cầu dừng: 166 test backend đạt, 16 integration Atlas bỏ qua; 37 test frontend đạt; TypeScript/build và Ruff đạt. Các lỗi thư mục tạm ban đầu được xử lý bằng thư mục kiểm thử trong dự án và chạy lại thành công. E2E đã cập nhật theo workflow mới nhưng chưa chạy; chưa kiểm thử điện thoại thật. Lệnh thiết lập Admin thật chưa thành công (ConfigurationError), chưa xác nhận tài khoản trên Atlas và chưa xóa User/Creator cũ. Không suy diễn lỗi cấu hình thành xác nhận database đã hoạt động. Mã đang sửa, chưa commit/triển khai.

Người dùng yêu cầu dừng, sau đó chốt thay đổi ưu tiên: QR tạm hoãn đến sau phần cơ bản. Phiên đổi ưu tiên chỉ cập nhật tài liệu, không tiếp tục sửa chức năng.

Thứ tự hiện hành thay bảng D0–D7 ban đầu:

1. Hoàn thiện Admin: xác minh setup tài khoản, phân quyền, gộp chức năng biên soạn, kiểm tra sửa/lưu nháp/công bố và quản lý audio. Xử lý tài khoản cũ theo phạm vi đã cho phép khi bảo đảm tài khoản mục tiêu hoạt động.
2. Hoàn thiện thiết lập địa điểm phát: thêm/sửa/xóa điểm, văn bản nguồn, gắn/thay MP3 đúng điểm, nghe thử, công bố và nghe thủ công đúng bản đã công bố. Không tự thêm tọa độ/GPS khi chưa được chốt.
3. Hoàn thiện luồng khách không đăng nhập, ID khách/hành trình và thống kê cơ bản theo kế hoạch; tải lại giữ màn hình và hành trình đã được xác nhận. Nghiệm thu phần cơ bản trước khi mở lại QR.
4. Sau khi phần cơ bản hoàn tất mới tiếp tục D4/D5 và phần sự kiện QR của D6. Các câu hỏi riêng QR được để lại cho giai đoạn này.

## Tiến độ được đối chiếu ban đầu

Đối chiếu mã App.tsx, router auth/content/audio/creator/admin và báo cáo CREATOR_REVIEW.md.
Bản rà ban đầu chưa có mã tính năng mới. Sau đó đã triển khai một phần D1 trong working tree; xem cập nhật bên dưới. Các bước khách/QR vẫn chưa triển khai.

| Hạng mục | Bản đang có | Việc sửa demo |
| --- | --- | --- |
| Xác thực | Đăng ký User; mọi khách đi qua auth; lệnh bootstrap chỉ nâng tài khoản có sẵn | Trang chào khách và đăng nhập nội bộ riêng; đóng đăng ký công khai; tạo một Admin ban đầu lúc thiết lập |
| Nội dung/audio | MongoDB, snapshot, GridFS/Range, player thủ công; API cần current_principal | Cho khách đọc/nghe bản công bố, tiếp tục chặn nháp/preview |
| Quản trị | Sửa điểm/audio, lưu nháp, công bố/gỡ; dashboard và user | Tái sử dụng, thêm QR và thống kê hành trình |
| Creator | Bản riêng, gửi/duyệt/apply | Gộp quyền nội bộ; bỏ workflow duyệt giữa hai vai trò trong demo |
| Định danh khách | Chưa có | ID khách theo trình duyệt; ID hành trình riêng cho từng lần tham quan |
| QR | Chưa có | Admin tạo/tải; camera ngoài và quét trong web |
| Thống kê sử dụng | Chỉ có số đếm dữ liệu hệ thống | ID khách truy cập khác nhau theo ngày, hành trình bắt đầu riêng, QR/audio theo điểm |
| Ngôn ngữ | Việt, 10 mô tả và MP3 theo báo cáo | Việt trước, bổ sung ngôn ngữ sau |

Bằng chứng kiểm thử gần nhất từ báo cáo: backend 153 đạt/16 Atlas bỏ qua ở lượt cục bộ; frontend 38 đạt; 1 integration Atlas riêng và 10 E2E Edge desktop/mobile viewport đạt. Đây là lịch sử bản cũ, chưa chạy lại trong phiên rà tiến độ. Không khẳng định trạng thái server/Atlas hiện tại chỉ từ báo cáo.

## Các phần sửa theo thứ tự

| Phần | Công việc và phạm vi mã | Điều kiện hoàn thành |
| --- | --- | --- |
| D0 — quyết định và dữ liệu | Chốt các câu hỏi còn lại; lập hợp đồng khách/hành trình/sự kiện và phương án xóa User/Creator cũ | Định nghĩa rõ ID, lượt đếm, quyền, xử lý đề xuất Creator cũ |
| D1 — gộp quản trị | App/nav, API RBAC/auth; lệnh thiết lập Admin phong; chuyển công việc biên soạn về Admin, bỏ UI Creator và API gửi/duyệt/apply trong demo; giữ nháp/công bố | Tài khoản Admin được tạo an toàn, chạy lệnh lại không nhân đôi; khách không vào API nội bộ; không tự công bố khi lưu |
| D2 — khách và hành trình | Trang chào theo mẫu với thông tin nguồn hiện có; tách bootstrap khách khỏi AuthClient; repository/service/API định danh, ghi truy cập và hành trình | Cùng trình duyệt giữ ID khách ngay từ lúc truy cập; hành trình mới có mã riêng; khách chưa bắt đầu vẫn được tính; gửi lại bắt đầu không nhân đôi |
| D3 — đọc/nghe công khai | Điều chỉnh content/audio dependencies; giữ snapshot, Range/HEAD; chọn ngôn ngữ trước phát | Khách nghe được release hiện hành; không đọc nháp/preview hoặc asset ngoài quyền |
| D4 — QR tại điểm | Admin tạo/tải mã theo ID điểm và địa chỉ triển khai; giữ điểm đích qua trang chào | QR in quét đúng điểm; bấm bắt đầu tạo hành trình, ghi lượt QR và phát audio Việt của điểm |
| D5 — quét trong web | Nút quét, camera, xác minh mã thuộc hệ thống, chuyển điểm và điều phối player | Giữ ID khách/hành trình/ngôn ngữ; dừng audio cũ; phát điểm QR; báo rõ mã lỗi/camera bị từ chối |
| D6 — sự kiện và dashboard | Ghi truy cập, bắt đầu hành trình, QR/audio chống gửi trùng; truy vấn theo ngày/điểm | Mỗi ID khách truy cập tính tối đa một lần/ngày; QR/audio đúng điểm; nghe lại tính lượt mới, phát lỗi không tăng lượt |
| D7 — chuyển đổi và nghiệm thu | Xóa User/Creator cũ, xử lý đề xuất cũ; hồi quy auth/admin/audio và thiết bị QR thật; báo cáo từng phần | Admin/nháp/release/audio được giữ; phiên tài khoản đã xóa bị thu hồi; mọi giới hạn/test chưa chạy được ghi rõ |

D6 có thể chuẩn bị hợp đồng cùng D0 để D2–D5 phát đúng sự kiện ngay từ đầu. Không ấn định lại thời hạn hai ngày cho toàn bộ thay đổi mới trước khi chốt D0.

Mỗi phần có test nghiệp vụ phù hợp, frontend/backend khi liên quan; Atlas dùng collection/bucket biệt lập. Kiểm tra camera và phát sau QR trên điện thoại thật/HTTPS; viewport desktop/mobile không thay kiểm tra camera. Nếu phát tự động bị chặn, hiển thị thao tác phát rõ ràng và chỉ ghi lượt khi thực sự phát. Kiểm tra mã sai, điểm đã gỡ công bố, lỗi mạng, request trùng và nhiều tab.

## Quyết định còn cần người dùng chốt

- Đã chốt tạo một Admin ban đầu khi thiết lập và xóa Creator cũ; tên đăng nhập đã chốt là phong, mật khẩu nhận qua cấu hình bí mật. Đã chốt chuyển công việc biên soạn vào Admin và bỏ toàn bộ chức năng Creator riêng. Chỉ xử lý dữ liệu đề xuất cũ sau khi kiểm tra; không tự nâng toàn bộ Creator thành Admin. Tài khoản mục tiêu phong phải được xác định trước bước dọn User/Creator để tránh xóa nhầm nếu đã tồn tại.
- Vòng đời hành trình: giữ trạng thái đến khi thoát đã chốt; cần định nghĩa tải lại, đóng/mở lại, nhiều tab. Đề xuất tải lại giữ hành trình, đóng tab rồi quay lại về trang chào với ID khách cũ.
- QR trong web: đề xuất ghi lượt khi quét hợp lệ và xác định được điểm; QR ngoài đã chốt chỉ ghi khi bấm bắt đầu. Camera ngoài khi đã có hành trình cần chốt giữ hay tạo hành trình mới.
- Đã chốt số khách trong ngày là số ID khách khác nhau truy cập website, kể cả chưa bắt đầu; hành trình là số lần bắt đầu hợp lệ; QR tổng hợp theo từng điểm. Múi giờ tính ngày vẫn cần chốt; giờ Việt Nam là đề xuất.
- Thời hạn lưu ID khách và dữ liệu thống kê; định dạng QR tải xuống (đề xuất PNG để in).

GPS, offline, AI, dịch/TTS tự động tiếp tục hoãn. Kế hoạch gốc dài hạn được giữ làm nguồn lịch sử/phạm vi dài hạn; demo áp dụng các thay đổi đã chốt tại DEMO_GUEST_QR_PLAN.md.

## Kiểm tra phiên này

Rà tài liệu/mã và git diff --check. Không chạy test ứng dụng vì chỉ lập kế hoạch; không thao tác tài khoản/Atlas hoặc triển khai mã tính năng.
