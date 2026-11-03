

> **Quyết định ngày 27/10/2026:** Người dùng loại chức năng offline khỏi toàn bộ phạm vi dự án và kế hoạch dài hạn. Các mô tả trước đây về offline chỉ có giá trị lịch sử.

> **Cập nhật ưu tiên ngày 24/10/2026:** Stadia/GPS hoạt động trên điện thoại, 10 tọa độ đã kiểm chứng thực địa và chạm điểm phát audio được. Dashboard thống kê nền đã triển khai và người dùng xác nhận bản deploy hoạt động. Giao diện khách VI/EN/KO cùng nội dung/audio English cho 10 POI đã hoàn tất. GPS tự nhận diện/tự phát trên iPhone/Safari và ngưỡng geofence vẫn cần nghiệm thu trước demo chính thức.

> **Cập nhật 26/10:** người dùng đã duyệt nội dung/audio tiếng Hàn cho 10 POI; Atlas release `2cebd7fb-7ca8-4719-819b-abb2a2191038` có audio vi/en/ko. Ghi chú 24/10 bên dưới là trạng thái lịch sử.
>
> **Tiến độ đa ngôn ngữ 24/10:** giao diện khách VI/EN/KO được giữ xuyên trang/tải lại; 10 bản dịch POI English và 10 MP3 English đã được người dùng duyệt và công bố trong Atlas cùng nội dung/audio Việt. Admin có thể biên tập nội dung/audio theo locale. Chưa có nội dung/audio POI tiếng Hàn tại thời điểm đó. Xem [báo cáo](test-reports/MULTILINGUAL_UI_PROGRESS_2026_10_24.md).

# Điều chỉnh demo: khách không đăng nhập và demo — cập nhật 23/10/2026

Trạng thái: Admin, nội dung/audio công bố, luồng khách, dashboard thống kê nền và hỗ trợ đa ngôn ngữ Việt/Anh đã triển khai. Bản đồ Stadia, GPS và geofence frontend đã có; chạm địa điểm phát audio được trên điện thoại. Nghiệm thu GPS tự nhận diện/tự phát và ngưỡng thực tế có thể để sau, nhưng cần xong trước demo chính thức.
Tài liệu này cập nhật phạm vi demo trong DEMO_2_DAYS.md, không ghi đè kế hoạch gốc dài hạn.

### Đối chiếu triển khai hiện tại — cập nhật 24/10/2026

- Đã có welcome không đăng nhập, ID khách trong browser, ID hành trình khi bắt đầu,
  public content/audio và usage events visit/journey/audio.
- `#/welcome` và `#/explore` đã tách rõ; UI Admin không còn đăng ký. Admin active vẫn
  vào được `#/management`; khách chọn được VI/EN/KO và lựa chọn theo qua trang khám phá/tải lại.
- Dashboard thống kê nền đã hoàn thiện và được xác nhận chạy trên deploy. Nghiệm thu GPS/geofence thực tế được dời sang sau.

### Quy tắc ngôn ngữ cho hành trình — yêu cầu người dùng

- Khách chọn ngôn ngữ tại trang chào mừng; lựa chọn đó được giữ khi chuyển sang các trang tiếp theo của hành trình và sau khi tải lại.
- Giao diện khách theo ngôn ngữ đã chọn. Ngôn ngữ nội dung/audio được hiển thị riêng; nội dung và audio hiện được công bố bằng tiếng Việt và English.
- Cập nhật 24/10: người dùng đã duyệt 10 bản dịch English, 10 MP3 English; Admin có thể chỉnh locale và bổ sung audio tiếng Hàn sau này. Chi tiết tại [báo cáo đa ngôn ngữ](test-reports/MULTILINGUAL_UI_PROGRESS_2026_10_24.md).

### Kiểm kê tài khoản và release — 24/10/2026

- Hai User `123`, `AGT` đã thu hồi một phiên active mỗi tài khoản.
- Release hiện hành đã gắn audio cho 10/10 địa điểm. Người dùng đã nghe 10 MP3 demo và xác nhận đúng, không cần thay; không sửa snapshot/release.

## Quyết định của người dùng

- Cập nhật 23/10/2026: người nghe không đăng nhập/đăng ký. Thay đổi vai trò trong kế hoạch demo chưa tự sửa mô hình ba vai trò của kế hoạch gốc dài hạn.
- Luôn xác minh role mục tiêu và bảo vệ Admin trước thao tác.
- Chỉ có một vai trò quản trị cho demo. Tên đăng nhập Admin ban đầu được chốt là phong. Mật khẩu chưa được cung cấp; nhận qua cấu hình bí mật lúc thiết lập, không ghi mật khẩu vào mã hoặc tài liệu. Lệnh tạo tài khoản phải nhận thông tin bí mật tại lúc thiết lập, chạy lại không tạo trùng và không tự đặt lại mật khẩu.
- Cập nhật 23/10/2026: cùng trình duyệt quay lại giữ ID khách ngẫu nhiên cũ; chỉ cấp mới khi chưa có định danh còn lưu. Quyết định này thay yêu cầu cấp ID khách mới mỗi lần bắt đầu. ID khách không phải tài khoản đăng nhập và không cấp quyền nội bộ. Nếu xóa dữ liệu website, dùng trình duyệt/thiết bị khác hoặc phiên riêng tư không giữ dữ liệu thì không bảo đảm nhận lại ID cũ. Không đồng nhất ID trình duyệt với một người thật.
- Cập nhật 23/10: số khách theo ngày là số ID khách khác nhau đã truy cập website trong ngày đó, kể cả chưa bấm bắt đầu. Đây là số trình duyệt có ID quan sát được, không phải số người thật duy nhất. Số hành trình bắt đầu được đếm riêng.
- Cả hai luồng phải xác định ngôn ngữ khách đã chọn trước khi phát audio.
- Ảnh tham khảo chỉ định hướng giao diện. Nội dung dựa vào dữ liệu và nhật ký dự án đã lưu; không lấy số điểm, lịch sử hoặc tính năng GPS từ chữ trong ảnh.

- Xác nhận bổ sung 23/10: ID khách nhận diện trình duyệt quay lại; ID hành trình nhận diện từng lần tham quan. Một ID khách có thể gắn nhiều ID hành trình. Việc tách mã không tự chốt cách kết thúc/hết hạn hành trình.

## Luồng đã chốt

### Vào trực tiếp

Mở web → trang chào, nhận lại ID khách cũ hoặc cấp mới nếu chưa có và ghi một lượt truy cập theo ngày → chọn/xác định ngôn ngữ → bấm Bắt đầu cuộc hành trình → tạo ID hành trình mới → vào trang khám phá.
Không yêu cầu tài khoản người nghe. Không có yêu cầu tự phát một điểm khi vào trực tiếp.

### demo bên ngoài khi chưa tham gia


### demo bên trong khi đang tham gia

Không quay lại trang chào, không yêu cầu bấm bắt đầu lại, không tạo khách/hành trình mới chỉ vì quét điểm khác.

## Những điểm cần chốt trước phần triển khai phụ thuộc

1. Người dùng đã chốt bổ sung ngôn ngữ sau; đợt này dùng nội dung/MP3 tiếng Việt hiện có. Cách xử lý thiếu audio ngôn ngữ đã chọn sẽ chốt khi bổ sung ngôn ngữ; không tự phát ngôn ngữ khác.
2. Đã chốt ngày 23/10: tách ID khách và ID hành trình. Một khách có nhiều lần tham quan; mỗi lần bắt đầu hành trình mới có ID hành trình riêng, nghe/quét nhiều điểm trong cùng hành trình giữ nguyên mã. Số khách trong ngày đếm ID khách khác nhau đã truy cập, kể cả chưa bắt đầu; số hành trình đếm lần bắt đầu hợp lệ. Cần chốt múi giờ, thời hạn lưu ID và quy tắc nhiều tab. Số khách theo ID trình duyệt không phải số người thật duy nhất.
3. Không đếm request tải audio/Range thành lượt phát.
4. Đã chốt không hiện thông báo kết thúc hành trình, giữ trạng thái trang đến khi khách thoát. Đã xác nhận tải lại giữ nguyên màn hình và hành trình hiện tại. Còn cần làm rõ thoát, đóng/mở lại và nhiều tab. ID khách vẫn giữ khi quay lại dù vòng đời hành trình được chốt theo cách nào.
5. Tên đăng nhập đã chốt là phong; cần cung cấp mật khẩu ban đầu qua cấu hình bí mật.

## Các phần triển khai dự kiến

1. Chốt các định nghĩa còn thiếu; cập nhật hợp đồng API, quyền khách và dữ liệu hành trình/sự kiện trước triển khai.
2. Thêm lệnh thiết lập Admin phong với mật khẩu do người vận hành cung cấp.
4. Xử lý camera bị từ chối, mã không hợp lệ, audio thiếu và phát bị chặn; không báo phát thành công khi chưa phát.
5. Chốt múi giờ và cách tính ngày trước nghiệm thu.

GPS/geofence frontend đã làm; tự nhận điểm/tự phát trên Safari và ngưỡng thực địa còn chờ nghiệm thu. Offline đã loại khỏi phạm vi dự án ngày 27/10; AI/dịch và TTS tự động vẫn ngoài phạm vi hiện tại. Không tự tạo bản dịch/MP3 chưa được duyệt.

## Tiêu chí kiểm thử cần bổ sung

- Khách vào trang chào không cần auth; cùng trình duyệt quay lại giữ ID khách cũ; không có định danh thì cấp mới ngay khi truy cập. Truy cập lặp trong cùng ngày chỉ tính một ID khách; khách chưa bấm bắt đầu vẫn được tính. Bấm bắt đầu tạo ID hành trình riêng. Kiểm tra mất dữ liệu trình duyệt và không trao quyền nội bộ qua ID khách. Request gửi lại không tạo trùng ngoài ý muốn.
- Không phát audio sai ngôn ngữ, không phát chồng; lỗi camera/audio/mã có trạng thái rõ ràng.
- Khách không đọc nháp, preview audio, API nội bộ; vai trò quản trị nội bộ vẫn được kiểm tra RBAC/CSRF.
- Tạo đúng một Admin ban đầu; chạy lại không tạo trùng hoặc đặt lại mật khẩu.

## Kiểm tra trong phiên cập nhật kế hoạch

Chỉ cập nhật tài liệu, chưa triển khai tính năng, chưa xóa tài khoản, chưa thay dữ liệu Atlas.
Không chạy test backend/frontend/Atlas vì mã và hợp đồng đang chạy chưa đổi.
md vẫn là kết quả lịch sử của bản trước thay đổi này.

## Ghi nhận ngày 23/10/2026

Chỉ sửa tài liệu; kiểm tra git diff --check, không chạy test nghiệp vụ vì không sửa mã.

Những việc này mới là kế hoạch, chưa thao tác trên Atlas.

## Xác nhận gộp chức năng và tài khoản ban đầu — 23/10/2026

- Không tạo luồng Admin tự gửi rồi tự duyệt; giữ lưu nháp và công bố thành hai thao tác.
- Admin ban đầu: phong. Đây mới là tên đã chốt cho bước thiết lập; chưa tạo hoặc thay tài khoản thật trong phiên cập nhật kế hoạch.
- Không thay snapshot đã công bố hoặc tự áp dụng đề xuất cũ.
