> **Ưu tiên cập nhật ngày 24/10/2026:** OSM và 10 tọa độ do người dùng cung cấp đã tích hợp; GPS thật bật chủ động, mô phỏng và geofence cùng luồng frontend đã triển khai. Nghiệm thu thiết bị/thực địa trước khi làm QR.

# Điều chỉnh demo: khách không đăng nhập và QR — cập nhật 23/10/2026

Trạng thái: Admin, nội dung/audio công bố và luồng khách cơ bản đã triển khai. OSM/10 tọa độ và GPS/geofence frontend đã có; GPS thật ngoài thiết bị và ngưỡng thực địa chưa nghiệm thu. Các yêu cầu QR bên dưới giữ làm thiết kế giai đoạn sau.
Tài liệu này cập nhật phạm vi demo trong DEMO_2_DAYS.md, không ghi đè kế hoạch gốc dài hạn.

### Đối chiếu triển khai hiện tại — cập nhật 24/10/2026

- Đã có welcome không đăng nhập, ID khách trong browser, ID hành trình khi bắt đầu,
  public content/audio và usage events visit/journey/audio.
- `#/welcome` và `#/explore` đã tách rõ; UI Admin không còn đăng ký. Admin active vẫn
  vào được `#/management`; English/한국어 mới chỉ là menu giao diện “Sắp có”.
- GPS opt-in/mô phỏng/geofence frontend đã có; QR/camera/offline/AI/dịch/TTS tự động chưa triển khai. Các luồng QR bên dưới tiếp tục là thiết kế giai đoạn sau.

### Kiểm kê tài khoản và release — 24/10/2026

- Trước khi dọn Creator, Atlas có `phong` là Admin active, 2 User và 1 Creator. Hai User `123`, `AGT` đã thu hồi một phiên active mỗi tài khoản.
- Release hiện hành đã gắn audio cho 10/10 địa điểm. Người dùng đã nghe 10 MP3 demo và xác nhận đúng, không cần thay; không sửa snapshot/release.
- Theo lựa chọn rõ ràng của người dùng, đã xóa Creator `phong11` cùng đúng đề xuất `pending` liên kết; hai User legacy `123`, `AGT` cũng đã được xóa theo phạm vi đã chốt trước đó. Xác minh role counts hiện tại là 0 User, 0 Creator, 1 Admin và `phong` còn active; không xóa snapshot hay asset được release tham chiếu.

## Quyết định của người dùng

- Cập nhật 23/10/2026: người nghe không đăng nhập/đăng ký. Creator và Admin được gộp thành một vai trò quản trị nội dung duy nhất cho demo; vai trò này đăng nhập và có quyền biên soạn, quản lý, duyệt/công bố, tài khoản và dashboard theo quyền đã định nghĩa. Bỏ quy trình Creator gửi đề xuất rồi Admin duyệt; giữ lưu nháp và công bố riêng. Thay đổi vai trò trong kế hoạch demo chưa tự sửa mô hình ba vai trò của kế hoạch gốc dài hạn.
- Người dùng cho phép xóa tài khoản User legacy và đã chốt xóa Creator legacy. Ngày 24/10 đã xóa đúng hai User `123`, `AGT`, Creator `phong11` và một đề xuất `pending` liên kết; các phiên liên quan đã được thu hồi. Luôn xác minh role mục tiêu và bảo vệ Admin trước thao tác.
- Chỉ có một vai trò quản trị cho demo. Tạo một tài khoản Admin ban đầu khi thiết lập hệ thống; xóa tài khoản Creator cũ và thu hồi phiên liên quan khi chuyển đổi. Không tự nâng Creator thành Admin. Tên đăng nhập Admin ban đầu được chốt là phong. Mật khẩu chưa được cung cấp; nhận qua cấu hình bí mật lúc thiết lập, không ghi mật khẩu vào mã hoặc tài liệu. Lệnh tạo tài khoản phải nhận thông tin bí mật tại lúc thiết lập, chạy lại không tạo trùng và không tự đặt lại mật khẩu.
- Cập nhật 23/10/2026: cùng trình duyệt quay lại giữ ID khách ngẫu nhiên cũ; chỉ cấp mới khi chưa có định danh còn lưu. Quyết định này thay yêu cầu cấp ID khách mới mỗi lần bắt đầu. ID khách không phải tài khoản đăng nhập và không cấp quyền nội bộ. Nếu xóa dữ liệu website, dùng trình duyệt/thiết bị khác hoặc phiên riêng tư không giữ dữ liệu thì không bảo đảm nhận lại ID cũ. Không đồng nhất ID trình duyệt với một người thật.
- Dashboard bổ sung số khách, số hành trình bắt đầu, lượt quét QR theo điểm và lượt phát audio theo điểm; xem được theo ngày.
- Cập nhật 23/10: số khách theo ngày là số ID khách khác nhau đã truy cập website trong ngày đó, kể cả chưa bấm bắt đầu. Đây là số trình duyệt có ID quan sát được, không phải số người thật duy nhất. Số hành trình bắt đầu được đếm riêng. Lượt QR được tổng hợp theo từng địa điểm; QR ngoài tính khi khách bấm bắt đầu, QR trong web tính khi xử lý mã hợp lệ (mốc này vẫn cần xác nhận riêng).
- Admin có chức năng tạo/tải QR riêng cho từng địa điểm để in.
- Có quét bằng camera điện thoại bên ngoài website và nút quét QR trong website.
- Cả hai luồng phải xác định ngôn ngữ khách đã chọn trước khi phát audio.
- Ảnh tham khảo chỉ định hướng giao diện. Nội dung dựa vào dữ liệu và nhật ký dự án đã lưu; không lấy số điểm, lịch sử hoặc tính năng GPS từ chữ trong ảnh.

- Xác nhận bổ sung 23/10: ID khách nhận diện trình duyệt quay lại; ID hành trình nhận diện từng lần tham quan. Một ID khách có thể gắn nhiều ID hành trình. Các lượt QR/audio gắn với hành trình tương ứng; mã do hệ thống quản lý, khách không phải nhập hoặc nhớ. Việc tách mã không tự chốt cách kết thúc/hết hạn hành trình.

## Luồng đã chốt

### Vào trực tiếp

Mở web → trang chào, nhận lại ID khách cũ hoặc cấp mới nếu chưa có và ghi một lượt truy cập theo ngày → chọn/xác định ngôn ngữ → bấm Bắt đầu cuộc hành trình → tạo ID hành trình mới → vào trang khám phá.
Không yêu cầu tài khoản người nghe. Không có yêu cầu tự phát một điểm khi vào trực tiếp.

### QR bên ngoài khi chưa tham gia

Dùng camera điện thoại quét QR địa điểm → mở trang chào, giữ điểm đích và nhận lại ID khách cũ hoặc cấp mới nếu chưa có → ghi một lượt truy cập theo ngày → chọn/xác định ngôn ngữ → bấm Bắt đầu cuộc hành trình → tạo ID hành trình mới, tính lượt QR cho điểm đó → vào trang khám phá, chọn điểm QR và phát audio đúng ngôn ngữ đã chọn.

### QR bên trong khi đang tham gia

Bấm Quét QR trên trang chính → quét mã địa điểm → giữ hành trình/ID khách và ngôn ngữ hiện tại → chuyển điểm, dừng audio cũ và phát audio của điểm vừa quét.
Không quay lại trang chào, không yêu cầu bấm bắt đầu lại, không tạo khách/hành trình mới chỉ vì quét điểm khác.
Ghi chú lịch sử: trước cập nhật ưu tiên ngày 24/10, GPS chưa được đưa trở lại phạm vi demo. Quyết định mới nhất ngày 24/10 yêu cầu triển khai GPS/mô phỏng/geofence trước QR.

## Những điểm cần chốt trước phần triển khai phụ thuộc

1. Người dùng đã chốt bổ sung ngôn ngữ sau; đợt này dùng nội dung/MP3 tiếng Việt hiện có. Cách xử lý thiếu audio ngôn ngữ đã chọn sẽ chốt khi bổ sung ngôn ngữ; không tự phát ngôn ngữ khác.
2. Đã chốt ngày 23/10: tách ID khách và ID hành trình. Một khách có nhiều lần tham quan; mỗi lần bắt đầu hành trình mới có ID hành trình riêng, nghe/quét nhiều điểm trong cùng hành trình giữ nguyên mã. Số khách trong ngày đếm ID khách khác nhau đã truy cập, kể cả chưa bắt đầu; số hành trình đếm lần bắt đầu hợp lệ. Cần chốt múi giờ, thời hạn lưu ID và quy tắc nhiều tab. Số khách theo ID trình duyệt không phải số người thật duy nhất.
3. Đã chốt QR bên ngoài tính khi nhấn bắt đầu; audio tính khi phát thành công, mỗi lần nghe lại tính thêm lượt. QR trong web không có bước bắt đầu lại: đề xuất tính khi nhận mã hợp lệ và xác định được điểm, đang chờ xác nhận. Không đếm request tải audio/Range thành lượt phát.
4. Đã chốt không hiện thông báo kết thúc hành trình, giữ trạng thái trang đến khi khách thoát. Đã xác nhận tải lại giữ nguyên màn hình và hành trình hiện tại. Còn cần làm rõ thoát, đóng/mở lại và nhiều tab. ID khách vẫn giữ khi quay lại dù vòng đời hành trình được chốt theo cách nào.
5. Đã chốt tạo một tài khoản Admin ban đầu khi thiết lập và xóa Creator cũ. Tên đăng nhập đã chốt là phong; cần cung cấp mật khẩu ban đầu qua cấu hình bí mật. Các bản đề xuất Creator đã lưu là dữ liệu cũ: bỏ chức năng Creator không tự đồng nghĩa xóa hoặc áp dụng các bản này; chỉ cần chốt cách xử lý nếu kiểm tra chuyển đổi phát hiện dữ liệu cần giữ. Không xóa nháp Admin, snapshot đã công bố hoặc audio chỉ vì xóa Creator.
6. QR camera ngoài khi khách đã có hành trình, mã sai/điểm đã gỡ công bố và định dạng tải QR cần được chốt khi thiết kế chi tiết.

## Các phần triển khai dự kiến

1. Chốt các định nghĩa còn thiếu; cập nhật hợp đồng API, quyền khách và dữ liệu hành trình/sự kiện trước triển khai.
2. Tách trang chào/khám phá của khách khỏi đăng nhập nội bộ; bỏ UI và luồng đăng ký công khai cho người nghe; gộp Creator/Admin thành một vai trò quản trị nội bộ và cập nhật RBAC/UI. Thêm lệnh thiết lập Admin phong với mật khẩu do người vận hành cung cấp. Nếu username đã tồn tại, kiểm tra tài khoản tương ứng trước khi chuyển đổi; không tạo trùng, không tự ghi đè mật khẩu và không xóa tài khoản mục tiêu trong bước dọn User/Creator.
3. Tạo hành trình/ID khách, giữ điểm đích QR và ngôn ngữ qua bước bắt đầu; nội dung/audio khách chỉ được lấy từ snapshot đang công bố, không lộ nháp/preview.
4. Admin tạo/tải QR liên kết địa điểm; bổ sung quét trong web, chuyển điểm và điều phối một trình phát. Xử lý camera bị từ chối, mã không hợp lệ, audio thiếu và phát bị chặn; không báo phát thành công khi chưa phát.
5. Thu sự kiện truy cập, bắt đầu hành trình, QR theo điểm và audio theo điểm; dashboard theo ngày đếm ID khách truy cập khác nhau, số hành trình riêng; chống nhân đôi do gửi lại request. Chốt múi giờ và cách tính ngày trước nghiệm thu.
6. Xóa dữ liệu tài khoản User/Creator cũ đúng phạm vi đã cho phép và thu hồi phiên liên quan; kiểm tra đề xuất Creator cũ trước khi xử lý; kiểm thử và ghi kết quả thật trước đánh dấu hoàn tất.

Đây là thứ tự công việc, chưa có ước lượng hoàn thành mới. Theo cập nhật 24/10, GPS/geofence frontend đã làm; GPS thực địa/thiết bị còn chờ nghiệm thu. Offline/AI/dịch và TTS tự động vẫn ngoài phạm vi hiện tại. Không tự tạo bản dịch/MP3 chưa được duyệt.

## Tiêu chí kiểm thử cần bổ sung

- Khách vào trang chào không cần auth; cùng trình duyệt quay lại giữ ID khách cũ; không có định danh thì cấp mới ngay khi truy cập. Truy cập lặp trong cùng ngày chỉ tính một ID khách; khách chưa bấm bắt đầu vẫn được tính. Bấm bắt đầu tạo ID hành trình riêng. Kiểm tra mất dữ liệu trình duyệt và không trao quyền nội bộ qua ID khách. Request gửi lại không tạo trùng ngoài ý muốn.
- QR ngoài giữ đúng điểm và ngôn ngữ sau trang chào; QR trong giữ nguyên hành trình và không quay lại trang chào.
- Không phát audio sai ngôn ngữ, không phát chồng; lỗi camera/audio/mã có trạng thái rõ ràng.
- Khách không đọc nháp, preview audio, API nội bộ; vai trò quản trị nội bộ vẫn được kiểm tra RBAC/CSRF.
- Dashboard theo ngày đếm mỗi ID khách truy cập tối đa một lần/ngày dù chưa bắt đầu; hành trình là số riêng; QR/audio tổng hợp đúng điểm; gửi lại không tăng số.
- Tạo đúng một Admin ban đầu; chạy lại không tạo trùng hoặc đặt lại mật khẩu. Xóa User/Creator cũ không ảnh hưởng Admin và không để phiên cũ tiếp tục truy cập.
- Kiểm thử QR/camera/audio trên thiết bị thật; viewport di động không thay thế kiểm thử camera điện thoại.

## Kiểm tra trong phiên cập nhật kế hoạch

Chỉ cập nhật tài liệu, chưa triển khai tính năng, chưa xóa tài khoản, chưa thay dữ liệu Atlas.
Không chạy test backend/frontend/Atlas vì mã và hợp đồng đang chạy chưa đổi.
Các kết quả test trong CREATOR_REVIEW.md vẫn là kết quả lịch sử của bản trước thay đổi này.

## Ghi nhận ngày 23/10/2026

Đã đồng bộ quyết định giữ ID khách theo trình duyệt và các xác nhận trước đó về ngôn ngữ, lượt QR/audio, trạng thái trang. Ngày 23/10 người dùng chốt gộp Creator/Admin cho demo; chưa thay mã, dữ liệu hoặc kế hoạch gốc dài hạn. Chỉ sửa tài liệu; kiểm tra git diff --check, không chạy test nghiệp vụ vì không sửa mã.

Cập nhật tiếp ngày 23/10: chốt tạo một Admin ban đầu, xóa Creator cũ và đếm ID khách truy cập theo ngày; QR báo cáo theo từng điểm. Những việc này mới là kế hoạch, chưa thao tác trên Atlas.

## Xác nhận gộp chức năng và tài khoản ban đầu — 23/10/2026

- Admin trực tiếp thực hiện các công việc biên soạn của Creator cũ: thêm/sửa/xóa điểm trong nháp, soạn nội dung và lưu. Admin quản lý audio, QR, dashboard và công bố/gỡ công bố như kế hoạch.
- Xóa chức năng Creator riêng khỏi demo: vai trò/điều hướng/trang Creator, gửi đề xuất, hàng chờ duyệt, trả chỉnh sửa và áp dụng đề xuất. Không tạo luồng Admin tự gửi rồi tự duyệt; giữ lưu nháp và công bố thành hai thao tác.
- Admin ban đầu: phong. Đây mới là tên đã chốt cho bước thiết lập; chưa tạo hoặc thay tài khoản thật trong phiên cập nhật kế hoạch.
- Khi chuyển đổi, xác định tài khoản Admin mục tiêu trước khi dọn tài khoản User/Creator cũ để tránh xóa nhầm phong nếu hiện có ở role khác. Không thay snapshot đã công bố hoặc tự áp dụng đề xuất cũ.
