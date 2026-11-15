# ĐẶC TẢ CHI TIẾT CÁC USE CASE (USE CASE SPECIFICATIONS)
## HỆ THỐNG WEBSITE THUYẾT MINH TỰ ĐỘNG KHUÔN VIÊN ĐẠI HỌC SÀI GÒN

Tài liệu đặc tả toàn diện 8 Use Case cốt lõi (Sea-level) của hệ thống, được chuẩn hóa theo đúng cấu trúc bảng mẫu kỹ thuật phần mềm, phản ánh chính xác kiến trúc Clean Architecture, các API endpoints, mã lỗi HTTP và 10 collection trên MongoDB Atlas.

---

### BẢNG ĐẶC TẢ USE CASE UC01: KHÁM PHÁ KHUÔN VIÊN QUA BẢN ĐỒ

| Trường | Nội dung chi tiết |
| :--- | :--- |
| **Mã use case** | **UC01** |
| **Tên use case** | **Khám phá khuôn viên qua bản đồ** |
| **Tác nhân chính** | Khách tham quan (Visitor) |
| **Tác nhân hỗ trợ** | Bản đồ số Stadia Maps, Content Service, CSDL MongoDB (`tour_releases`, `usage_events`) |
| **Mức độ đặc tả** | Chi tiết |
| **Tóm tắt** | Khách tham quan khởi tạo hành trình, tải bản đồ số khuôn viên Đại học Sài Gòn, hiển thị 10 điểm tham quan (POI) và tương tác để xem thông tin chi tiết từng điểm. |
| **Tiền điều kiện** | Khách truy cập website qua trình duyệt; hệ thống có snapshot release đang hoạt động (`published_release_id != null`). |
| **Sự kiện kích hoạt** | Khách truy cập trang chào mừng (`/#/welcome`) và nhấn nút "Bắt đầu hành trình". |
| **Trình tự tương tác (Luồng sự kiện chính)** | **Hành động tác nhân** <br><br> 1. Khách truy cập `/#/welcome` và nhấn nút "Bắt đầu hành trình". <br><br> 3. Trình duyệt chuyển sang màn hình khám phá `/#/explore` và kích hoạt tải dữ liệu bản đồ. <br><br> 5. Chạm (click/tap) vào một marker điểm tham quan trên bản đồ hoặc chọn điểm từ danh sách POI Drawer. <br><br> 7. Khách thực hiện thao tác thu phóng (zoom 15-19), kéo rê bản đồ hoặc xoay hướng nhìn. <br><br> 9. Nhấn nút đóng Drawer hoặc chạm vào khoảng trống ngoài bản đồ. <br><br> **Phản hồi hệ thống** <br><br> 2. Kiểm tra LocalStorage: nếu chưa có `visitor_id`, sinh chuỗi UUIDv4 ngẫu nhiên; luôn sinh mới `journey_id` (UUIDv4); gửi request `POST /api/v1/events/guest` (`event_type: "journey_started"`) lưu vào `usage_events`. <br><br> 4. Gửi `GET /api/v1/content/campus`, đọc snapshot `tour_releases` theo `published_release_id`; nạp vector tile Stadia Maps và vẽ 10 marker POI theo tọa độ `[lng, lat]`. <br><br> 6. Kích hoạt hiệu ứng di chuyển (flyTo) căn giữa vào marker; trượt mở Drawer hiển thị: tên địa điểm, hình ảnh, văn bản thuyết minh và nguồn tư liệu theo ngôn ngữ hiện hành; nạp trạng thái audio. <br><br> 8. Trình duyệt nạp các mảnh tile bản đồ tương ứng theo tỷ lệ zoom, cập nhật cụm marker và giữ nguyên trạng thái Drawer đang mở. <br><br> 10. Thu gọn POI Drawer, bỏ trạng thái active của marker và đưa góc nhìn bản đồ về trạng thái tổng quan toàn trường. |
| **Luồng thay thế và ngoại lệ** | **A1:** Hành trình đang diễn ra: Nếu LocalStorage đã lưu `journey_id` chưa quá 24h, hệ thống bỏ qua bước 2 và cho phép đi tiếp.<br>**E1:** Chưa có bản công bố nào: `GET /content/campus` trả về HTTP 404 $\rightarrow$ Hiển thị thông báo "Khuôn viên đang được cập nhật nội dung, vui lòng quay lại sau."<br>**E2:** Mất kết nối mạng Internet: Không tải được tile bản đồ $\rightarrow$ Hiển thị cảnh báo mất mạng và nút "Thử lại". |
| **Hậu điều kiện** | **Thành công:** Bản đồ và 10 POI hiển thị đầy đủ; hành trình mới được ghi nhận vào CSDL `usage_events`.<br>**Thất bại:** Báo lỗi giao diện, không phát sinh dữ liệu rác trong CSDL. |
| **Liên kết use case** | Là tiền đề trực tiếp để thực hiện **UC02** (Nghe audio), **UC03** (Bật GPS) và **UC04** (Đổi ngôn ngữ). |

---

### BẢNG ĐẶC TẢ USE CASE UC02: NGHE THUYẾT MINH AUDIO

| Trường | Nội dung chi tiết |
| :--- | :--- |
| **Mã use case** | **UC02** |
| **Tên use case** | **Nghe thuyết minh audio** |
| **Tác nhân chính** | Khách tham quan (Visitor) |
| **Tác nhân hỗ trợ** | Audio Delivery Service, GridFS (`fs.files`, `fs.chunks`), CSDL `tour_releases`, `usage_events` |
| **Mức độ đặc tả** | Chi tiết |
| **Tóm tắt** | Truy phát dòng âm thanh MP3 (streaming qua cơ chế HTTP 206 Partial Content) thuyết minh về điểm tham quan theo đúng ngôn ngữ đã chọn và ghi nhận sự kiện thống kê. |
| **Tiền điều kiện** | Điểm tham quan đã được chọn trên bản đồ (UC01); điểm này có tệp âm thanh hợp lệ trong bản phát hành hiện hành. |
| **Sự kiện kích hoạt** | Khách nhấn nút "Nghe thuyết minh" trên POI Drawer hoặc được hệ thống kích hoạt tự động từ vùng Geofence (UC03). |
| **Trình tự tương tác (Luồng sự kiện chính)** | **Hành động tác nhân** <br><br> 1. Khách nhấn nút "Nghe thuyết minh" trên POI Drawer. <br><br> 3. Khách lắng nghe âm thanh thuyết minh phát ra từ loa/tai nghe thiết bị. <br><br> 5. Khách kéo thanh trượt thời gian (Seek Bar) để tua tới vị trí 01:30. <br><br> 7. Khách bấm nút "Tạm dừng" (Pause) trên thanh điều khiển. <br><br> 9. Khách bấm chọn một điểm tham quan khác (POI khác) trên bản đồ. <br><br> **Phản hồi hệ thống** <br><br> 2. Gửi request `GET /api/v1/audio/{release_id}/{place_id}?language={lang}` kèm header `Range: bytes=0-`. Backend đọc chunk đầu tiên từ GridFS (`fs.chunks`), trả về HTTP 206 Partial Content; gửi ngầm `POST /api/v1/events/guest` (`audio_played`) lưu vào `usage_events`; hiển thị Player. <br><br> 4. Trình duyệt liên tục nhận các luồng byte tiếp theo và phát nối tiếp mượt mà; đồng bộ hiển thị thanh tiến trình phát (progress bar). <br><br> 6. Trình duyệt gửi request `GET /api/v1/audio/...` kèm header `Range: bytes=1048576-`. Backend tìm đúng chunk trong `fs.chunks` và trả về HTTP 206; audio tiếp tục phát tại 01:30. <br><br> 8. Trình phát HTML5 ngưng xuất âm thanh, giữ nguyên vị trí con trỏ phát, chuyển nút biểu tượng sang "Tiếp tục" (Play). <br><br> 10. Dừng hẳn luồng audio của POI cũ, giải phóng bộ nhớ đệm audio, nạp bản thuyết minh của POI mới và sẵn sàng phát. |
| **Luồng thay thế và ngoại lệ** | **A1:** Tự phát khi vào vùng Geofence: Được kích hoạt tự động từ UC03 mà không cần khách bấm nút.<br>**E1:** Điểm chưa có file ghi âm cho ngôn ngữ này: Nút "Nghe thuyết minh" bị vô hiệu hóa kèm nhãn thông báo "Chưa có audio cho ngôn ngữ này".<br>**E2:** Trình duyệt di động chặn tự động phát (Autoplay Policy): Hệ thống rung nhẹ (haptic) và hiển thị thông báo popup mời khách bấm nút để kích hoạt âm thanh.<br>**E3:** Lỗi đường truyền mạng khi đang nghe: Stream audio dừng, giao diện hiển thị trạng thái đang đệm (Buffering); nếu timeout quá 10s sẽ báo lỗi và cho phép thử lại. |
| **Hậu điều kiện** | **Thành công:** Khách nghe trọn vẹn nội dung audio; lượt nghe hợp lệ được cộng dồn vào CSDL `usage_events`.<br>**Thất bại:** Dừng phát âm thanh, không tính lượt nghe nếu thời lượng nghe dưới ngưỡng quy định. |
| **Liên kết use case** | Kế thừa dữ liệu từ **UC01**; có thể được kích hoạt tự động bởi **UC03**; thay đổi ngôn ngữ bởi **UC04**. |

---

### BẢNG ĐẶC TẢ USE CASE UC03: ĐỊNH VỊ GPS VÀ MÔ PHỎNG VỊ TRÍ

| Trường | Nội dung chi tiết |
| :--- | :--- |
| **Mã use case** | **UC03** |
| **Tên use case** | **Định vị GPS và mô phỏng vị trí** |
| **Tác nhân chính** | Khách tham quan (Visitor) |
| **Tác nhân hỗ trợ** | Trình duyệt Geolocation API, Frontend Geofence Engine, CSDL `usage_events` |
| **Mức độ đặc tả** | Chi tiết |
| **Tóm tắt** | Thu nhận tọa độ thực tế của khách qua GPS (hoặc chế độ mô phỏng), tính toán khoảng cách tới 10 POI theo thuật toán Haversine và tự động kích hoạt thuyết minh khi bước vào bán kính vùng (Geofence). |
| **Tiền điều kiện** | Khách đang ở màn hình bản đồ (`/#/explore`); thiết bị có phần cứng GPS hoặc hỗ trợ định vị mạng. |
| **Sự kiện kích hoạt** | Khách nhấn biểu tượng định vị "Vị trí của tôi" hoặc bật công tắc "Mô phỏng vị trí". |
| **Trình tự tương tác (Luồng sự kiện chính)** | **Hành động tác nhân** <br><br> 1. Khách nhấn biểu tượng định vị "Vị trí của tôi" trên bản đồ. <br><br> 3. Khách chọn "Cho phép" (Allow) trên hộp thoại cấp quyền GPS của trình duyệt. <br><br> 5. Khách cầm thiết bị di chuyển lại gần điểm "Khu A - Tòa nhà truyền thống". <br><br> 7. Khách tiếp tục di chuyển rời xa điểm Khu A (khoảng cách > 45m). <br><br> 9. Khách nhấn biểu tượng tắt định vị hoặc đóng trình duyệt. <br><br> **Phản hồi hệ thống** <br><br> 2. Kích hoạt lệnh `navigator.geolocation.watchPosition` với tùy chọn `enableHighAccuracy: true`. Trình duyệt hiển thị thông báo xin cấp quyền truy cập vị trí. <br><br> 4. Nhận tọa độ thực `(lat, lng, accuracy)`; vẽ chấm tròn xanh (Puck) biểu diễn vị trí của khách và vòng tròn sai số (accuracy circle); tự động căn giữa bản đồ theo vị trí khách. <br><br> 6. Engine Geofence định kỳ (mỗi 5s) tính công thức Haversine với 10 POI: Khi khoảng cách $\le$ 30m qua 2 mẫu liên tiếp $\rightarrow$ kích hoạt sự kiện "Enter Geofence" cho Khu A $\rightarrow$ tự động mở Drawer và gọi UC02 để phát thuyết minh audio. <br><br> 8. Engine Geofence xác định khoảng cách > 45m (vùng trễ Hysteresis chống rung cờ) $\rightarrow$ kích hoạt sự kiện "Exit Geofence" $\rightarrow$ xóa trạng thái nhận diện vùng, sẵn sàng cho điểm tiếp theo. <br><br> 10. Gọi `navigator.geolocation.clearWatch`, hủy lắng nghe GPS để tiết kiệm pin thiết bị và bảo đảm quyền riêng tư của khách. |
| **Luồng thay thế và ngoại lệ** | **A1:** Bật chế độ mô phỏng (Simulation Mode): Khách bật Switch mô phỏng $\rightarrow$ Hệ thống cho phép chọn vị trí giả lập hoặc tự động chạy tour ảo qua 10 điểm; toàn bộ sự kiện gửi lên backend được gắn cờ `is_simulated = true` để không làm sai lệch số liệu thực tế.<br>**E1:** Khách từ chối cấp quyền GPS: Trình duyệt trả về lỗi `PERMISSION_DENIED` $\rightarrow$ Hiển thị thông báo: "Không thể lấy vị trí. Bạn có thể sử dụng chế độ Mô phỏng để trải nghiệm tính năng này."<br>**E2:** Độ chính xác GPS quá thấp (> 50m): Hệ thống cảnh báo tín hiệu yếu và tạm thời không kích hoạt Geofence tự động để tránh phát nhầm điểm. |
| **Hậu điều kiện** | **Thành công:** Tọa độ vị trí hiển thị liên tục; tự động kích hoạt audio khi tới gần POI.<br>**Thất bại:** Bản đồ không có chấm vị trí, khách vẫn có thể bấm chọn điểm thủ công trên bản đồ. |
| **Liên kết use case** | Tương tác trực tiếp với **UC01** (hiển thị vị trí) và kích hoạt tự động **UC02** (phát audio). |

---

### BẢNG ĐẶC TẢ USE CASE UC04: LỰA CHỌN NGÔN NGỮ

| Trường | Nội dung chi tiết |
| :--- | :--- |
| **Mã use case** | **UC04** |
| **Tên use case** | **Lựa chọn ngôn ngữ** |
| **Tác nhân chính** | Khách tham quan (Visitor) |
| **Tác nhân hỗ trợ** | Content Service, LocalStorage trình duyệt |
| **Mức độ đặc tả** | Chi tiết |
| **Tóm tắt** | Cho phép khách tham quan lựa chọn hoặc thay đổi ngôn ngữ hiển thị và ngôn ngữ audio thuyết minh (Tiếng Việt `vi`, Tiếng Anh `en`, Tiếng Hàn `ko`) xuyên suốt hành trình. |
| **Tiền điều kiện** | Khách truy cập vào website tại bất kỳ trang nào (`/#/welcome` hoặc `/#/explore`). |
| **Sự kiện kích hoạt** | Khách bấm chọn lá cờ/ngôn ngữ tại trang Welcome hoặc bấm nút chọn ngôn ngữ trên thanh điều hướng. |
| **Trình tự tương tác (Luồng sự kiện chính)** | **Hành động tác nhân** <br><br> 1. Tại màn hình `/#/welcome`, khách bấm chọn ngôn ngữ "English" (hoặc "한국어"). <br><br> 3. Khách bấm nút "Start Journey" để vào màn hình bản đồ. <br><br> 5. Khách chạm vào POI "Nhà truyền thống" để xem chi tiết. <br><br> 7. Đang trong hành trình, khách muốn đổi sang "Tiếng Việt" $\rightarrow$ Bấm Menu chọn ngôn ngữ trên thanh điều hướng. <br><br> 9. Khách tiếp tục bấm "Nghe thuyết minh" trên POI Drawer. <br><br> **Phản hồi hệ thống** <br><br> 2. Giao diện cập nhật ngay lập tức: lưu mã ngôn ngữ (`en` hoặc `ko`) vào LocalStorage (`sgu_language`); chuyển đổi toàn bộ nhãn giao diện (i18n) sang ngôn ngữ đã chọn. <br><br> 4. Trình duyệt tải `/#/explore`, đọc mã ngôn ngữ từ LocalStorage để render bản đồ và danh sách POI đúng với tên đã dịch tương ứng. <br><br> 6. Trích xuất nội dung từ trường `translations.en` trong snapshot của POI; hiển thị tiêu đề, mô tả và nguồn tư liệu tiếng Anh; trỏ đường dẫn file audio sang tệp tiếng Anh tương ứng. <br><br> 8. Cập nhật `sgu_language = "vi"`; thay đổi toàn bộ văn bản giao diện sang Tiếng Việt; nạp lại bản dịch `translations.vi` cho POI đang mở mà không cần tải lại trang. <br><br> 10. Gửi request stream audio với tham số `language=vi`, phát bản ghi âm giọng đọc Tiếng Việt cho khách. |
| **Luồng thay thế và ngoại lệ** | **A1:** Lần đầu truy cập chưa chọn ngôn ngữ: Hệ thống tự động đọc ngôn ngữ mặc định của trình duyệt (`navigator.language`); nếu thuộc `en` hoặc `ko` thì gợi ý chọn, ngược lại mặc định là `vi`.<br>**E1:** POI chưa có bản dịch cho ngôn ngữ đã chọn: Hệ thống tự động chuyển dự phòng (fallback) sang hiển thị ngôn ngữ gốc Tiếng Việt và hiển thị ghi chú nhỏ: "Bản dịch đang được cập nhật". |
| **Hậu điều kiện** | **Thành công:** Toàn bộ giao diện, nội dung văn bản và âm thanh thuyết minh chuyển đổi nhất quán theo ngôn ngữ đã chọn.<br>**Thất bại:** Giữ nguyên ngôn ngữ mặc định (Tiếng Việt). |
| **Liên kết use case** | Chi phối hiển thị dữ liệu của **UC01** và định tuyến tệp âm thanh của **UC02**. |

---

### BẢNG ĐẶC TẢ USE CASE UC05: ĐĂNG NHẬP HỆ THỐNG

| Trường | Nội dung chi tiết |
| :--- | :--- |
| **Mã use case** | **UC05** |
| **Tên use case** | **Đăng nhập hệ thống** |
| **Tác nhân chính** | Quản trị viên (Admin) |
| **Tác nhân hỗ trợ** | Authentication Service, Password Hasher (Argon2id), CSDL `users`, `sessions` |
| **Mức độ đặc tả** | Chi tiết |
| **Tóm tắt** | Xác thực danh tính Quản trị viên duy nhất (`phong`) qua cơ chế bảo mật cao cấp: mật khẩu băm Argon2id, cấp JWT Access Token và Refresh Token qua HttpOnly Cookie, bảo vệ chống CSRF bằng Double Submit Cookie HMAC. |
| **Tiền điều kiện** | Admin truy cập đường dẫn đăng nhập nội bộ (`/#/admin`). |
| **Sự kiện kích hoạt** | Admin nhập username, password và nhấn nút "Đăng nhập". |
| **Trình tự tương tác (Luồng sự kiện chính)** | **Hành động tác nhân** <br><br> 1. Admin truy cập `/#/admin` và nhập thông tin tài khoản (username: `phong`, password). <br><br> 3. Admin kiểm tra thông tin và nhấn nút "Đăng nhập". <br><br> 5. Trình duyệt nhận phản hồi thành công và tự động chuyển hướng vào màn hình làm việc Quản trị `/#/admin`. <br><br> 7. Admin thao tác quản trị trên trang (phiên làm việc duy trì liên tục). <br><br> 9. Admin bấm nút "Đăng xuất" sau khi hoàn tất công việc. <br><br> **Phản hồi hệ thống** <br><br> 2. Frontend kiểm tra tính hợp lệ cơ bản của form (không để trống ô nhập liệu, chuẩn hóa chữ thường cho username key). <br><br> 4. Gửi request `POST /api/v1/auth/login` với JSON `{username, password}`. Backend thực thi:<br>- Chuẩn hóa username key $\rightarrow$ tìm tài khoản trong collection `users`.<br>- Dùng thuật toán Argon2id xác thực hash mật khẩu.<br>- Kiểm tra tài khoản `is_active == True` và `role == "admin"`.<br>- Sinh chuỗi `refresh_token` ngẫu nhiên 256-bit, băm SHA-256 lưu vào collection `sessions` với thời hạn 7 ngày.<br>- Ký JWT Access Token (HS256, thời hạn 15 phút) chứa `user_id`, `role`.<br>- Tạo CSRF token mã hóa HMAC.<br>- Thiết lập 3 Set-Cookie Headers bảo mật (`sgu_access`, `sgu_refresh`, `sgu_csrf`) với cờ `HttpOnly`, `SameSite=Lax`, `Secure`. Trả về HTTP 200 `{user: {username, role}, csrf_token}`. <br><br> 6. Khởi tạo trạng thái phiên làm việc trong RAM trình duyệt, lưu CSRF token để gán vào các request ghi (`PUT`, `POST`, `DELETE`), khởi động bộ đếm thời gian tự động gia hạn token. <br><br> 8. Khi Access Token sắp hết hạn (sau mỗi 14 phút), trình duyệt tự động gửi ngầm `POST /api/v1/auth/refresh` bằng cookie `sgu_refresh`; Backend xác thực session còn hạn và cấp lại Access Token mới mà không làm gián đoạn Admin. <br><br> 10. Gửi `POST /api/v1/auth/logout`; Backend xóa bản ghi session trong collection `sessions`, xóa sạch các cookie xác thực; Frontend điều hướng về màn hình đăng nhập. |
| **Luồng thay thế và ngoại lệ** | **E1:** Sai tài khoản hoặc mật khẩu: Backend trả về HTTP 401 Unauthorized $\rightarrow$ Hiển thị thông báo "Tên đăng nhập hoặc mật khẩu không chính xác."<br>**E2:** Tài khoản bị vô hiệu hóa (`is_active: false`): Backend từ chối đăng nhập với HTTP 403 Forbidden $\rightarrow$ Hiển thị thông báo "Tài khoản của bạn đã bị khóa."<br>**E3:** Hết hạn phiên (Session Expired): Cookie `sgu_refresh` không hợp lệ hoặc đã quá 7 ngày $\rightarrow$ Backend trả về HTTP 401 $\rightarrow$ Frontend xóa phiên và yêu cầu Admin đăng nhập lại. |
| **Hậu điều kiện** | **Thành công:** Phiên làm việc được thiết lập an toàn qua HttpOnly Cookie; mở khóa toàn quyền quản trị cho **UC06**, **UC07**, **UC08**.<br>**Thất bại:** Giữ nguyên màn hình đăng nhập, ghi log cảnh báo đăng nhập thất bại. |
| **Liên kết use case** | Là tiền điều kiện bắt buộc để thực hiện **UC06**, **UC07** và **UC08**. |

---

### BẢNG ĐẶC TẢ USE CASE UC06: BIÊN TẬP NỘI DUNG VÀ AUDIO ĐỊA ĐIỂM

| Trường | Nội dung chi tiết |
| :--- | :--- |
| **Mã use case** | **UC06** |
| **Tên use case** | **Biên tập nội dung và audio địa điểm** |
| **Tác nhân chính** | Quản trị viên (Admin) |
| **Tác nhân hỗ trợ** | Content Service, Audio Service, GridFS (`fs.files`, `fs.chunks`), CSDL `tours`, `assets`, `audio_selections` |
| **Mức độ đặc tả** | Chi tiết |
| **Tóm tắt** | Cho phép Admin chỉnh sửa thông tin mô tả, bản dịch tiếng Anh/Hàn, nguồn tư liệu của 10 địa điểm cố định và tải lên tệp âm thanh MP3 tương ứng theo cơ chế chống ghi đè CAS Revision. |
| **Tiền điều kiện** | Admin đã đăng nhập thành công (UC05). |
| **Sự kiện kích hoạt** | Admin truy cập màn hình Quản trị nội dung (`/#/admin`) và chọn một địa điểm trong danh sách 10 điểm. |
| **Trình tự tương tác (Luồng sự kiện chính)** | **Hành động tác nhân** <br><br> 1. Admin truy cập `/#/admin`, hệ thống tải dữ liệu bản nháp tour hiện tại. <br><br> 3. Admin chọn một địa điểm (ví dụ: POI-01), chọn tab ngôn ngữ Tiếng Anh ("en"), chỉnh sửa tiêu đề và nội dung bài dịch. <br><br> 5. Admin bấm nút "Upload Audio" cho ngôn ngữ đang chọn, duyệt chọn tệp âm thanh `poi01_en.mp3` từ máy tính và nhấn "Tải lên". <br><br> 7. Admin bấm nút "Nghe thử" để thẩm định chất lượng tệp vừa tải lên. <br><br> 9. Admin nhấn nút "Lưu bản nháp" (Save Draft) trên thanh công cụ quản trị. <br><br> **Phản hồi hệ thống** <br><br> 2. Gửi `GET /api/v1/admin/campus`; Backend kiểm tra quyền Admin, đọc collection `tours` lấy bản nháp tour hiện hành (mã revision, danh sách 10 POI); render danh mục 10 POI. <br><br> 4. Giao diện tự động tính mã băm SHA-256 của đoạn văn bản gốc Tiếng Việt để gán vào thuộc tính `source_text_sha256` của bản dịch, bảo đảm đồng bộ bản dịch với bản gốc. <br><br> 6. Trình duyệt gửi request `PUT /api/v1/admin/campus/places/{place_id}/audio?revision={rev}&language={lang}` kèm file nhị phân và CSRF token. Backend xử lý:<br>- Kiểm tra dung lượng $\le$ 10MB và phân tích cấu trúc header khung MP3 (Valid frame headers).<br>- Tính mã băm SHA-256 của file nhị phân.<br>- Nạp luồng nhị phân vào GridFS (`fs.files`, `fs.chunks`).<br>- Tạo bản ghi tài sản trong `assets` và cập nhật liên kết trong `audio_selections`. Trả về HTTP 200 `{asset_id, status: "ready"}`. <br><br> 8. Trình duyệt gọi luồng phát kiểm thử nội bộ, phát trực tiếp đoạn âm thanh MP3 vừa tải lên để Admin nghiệm thu. <br><br> 10. Gửi `PUT /api/v1/admin/campus` kèm payload `{revision, draft: {places: [10 POI]}}` và CSRF token. Backend kiểm tra:<br>- Danh sách địa điểm phải giữ nguyên đúng 10 ID cố định (không thêm/xóa).<br>- Thực hiện nguyên tử CAS Optimistic Locking: `find_one_and_update({_id: "campus-main", revision: rev}, {$set: {places, revision: rev + 1}})`. Trả về HTTP 200 kèm revision mới. Giao diện thông báo "Đã lưu bản nháp thành công". |
| **Luồng thay thế và ngoại lệ** | **A1:** Xóa file audio: Admin chọn xóa tệp audio của một ngôn ngữ $\rightarrow$ Cập nhật ghim trong `audio_selections`, không xóa tệp nhị phân trong GridFS nếu đã từng được snapshot công bố.<br>**E1:** Xung đột phiên bản (Stale Revision Conflict): Revision gửi lên không khớp với CSDL (do phiên làm việc khác đã lưu trước) $\rightarrow$ Backend trả về HTTP 409 Conflict $\rightarrow$ Frontend cảnh báo: "Bản nháp đã bị thay đổi bởi phiên làm việc khác. Vui lòng tải lại dữ liệu mới nhất!"<br>**E2:** Tệp tải lên sai định dạng hoặc vượt quá 10MB: Backend trả về HTTP 413 hoặc HTTP 415 $\rightarrow$ Báo lỗi chi tiết và hủy thao tác upload. |
| **Hậu điều kiện** | **Thành công:** Bản nháp tour được lưu an toàn với số revision tăng thêm 1; các tệp MP3 lưu trong GridFS sẵn sàng cho việc công bố.<br>**Thất bại:** Giữ nguyên trạng thái bản nháp trước đó trong CSDL, thông báo lỗi rõ ràng cho Admin. |
| **Liên kết use case** | Phụ thuộc vào **UC05**; cung cấp dữ liệu đầu vào trực tiếp cho **UC07** (Công bố tour). |

---

### BẢNG ĐẶC TẢ USE CASE UC07: QUẢN LÝ CÔNG BỐ BẢN THUYẾT MINH

| Trường | Nội dung chi tiết |
| :--- | :--- |
| **Mã use case** | **UC07** |
| **Tên use case** | **Quản lý công bố bản thuyết minh** |
| **Tác nhân chính** | Quản trị viên (Admin) |
| **Tác nhân hỗ trợ** | Release Management Service, CSDL `tours`, `tour_releases`, `audio_selections` |
| **Mức độ đặc tả** | Chi tiết |
| **Tóm tắt** | Đóng gói toàn bộ bản nháp 10 địa điểm, tọa độ và các tệp âm thanh đã ghim thành một bản phát hành Snapshot bất biến (`tour_releases`) và cập nhật con trỏ phát hành công khai cho khách tham quan. |
| **Tiền điều kiện** | Admin đã đăng nhập thành công (UC05); bản nháp trong `tours` đã được hoàn thiện và kiểm tra hợp lệ. |
| **Sự kiện kích hoạt** | Admin nhấn nút "Công bố phiên bản đã lưu" (Publish Tour) hoặc nút "Gỡ công bố" (Unpublish). |
| **Trình tự tương tác (Luồng sự kiện chính)** | **Hành động tác nhân** <br><br> 1. Admin bấm nút "Công bố phiên bản đã lưu" trên giao diện Quản trị. <br><br> 3. Admin kiểm tra danh sách kiểm tra (Pre-publish Checklist) trên popup xác nhận và bấm nút "Xác nhận công bố". <br><br> 5. Trình duyệt nhận kết quả công bố thành công và cập nhật trạng thái hiển thị. <br><br> 7. Admin truy cập thử trang khách `/#/explore` trên tab ẩn danh để kiểm tra thực tế. <br><br> 9. (Tùy chọn) Khi cần bảo trì, Admin bấm nút "Gỡ công bố" (Unpublish Tour). <br><br> **Phản hồi hệ thống** <br><br> 2. Frontend thực hiện kiểm tra sơ bộ: đủ 10 POI, có đủ tọa độ hợp lệ, kiểm tra trạng thái audio; hiển thị hộp thoại xác nhận công bố. <br><br> 4. Gửi request `POST /api/v1/admin/campus/publish` kèm `{revision}` và CSRF token. Backend thực thi chuỗi xử lý nghiêm ngặt:<br>- Xác thực CAS: `tour.revision == revision` gửi lên.<br>- Đọc danh sách file âm thanh hợp lệ hiện hành từ `audio_selections`.<br>- Sinh mã định danh bất biến `release_id = UUIDv4()`.<br>- Đóng gói Snapshot hoàn chỉnh (10 POI, tọa độ, bản dịch, asset_id của từng file audio, timestamp phát hành UTC).<br>- Ghi bản ghi mới vào collection `tour_releases` (Insert-only, không bao giờ sửa đổi snapshot cũ).<br>- Cập nhật con trỏ phát hành trong collection `tours`: `{$set: {published_release_id: release_id}}`. Trả về HTTP 200 `{release_id, published_at, status: "published"}`. <br><br> 6. Giao diện cập nhật nhãn trạng thái: "Đang công bố phiên bản [Mã Release] phát hành lúc [Thời gian]"; hiển thị nút "Gỡ công bố". <br><br> 8. Request `GET /api/v1/content/campus` trả về đúng Snapshot vừa được công bố; khách tham quan trên toàn hệ thống lập tức tiếp cận nội dung mới nhất. <br><br> 10. Gửi request `POST /api/v1/admin/campus/unpublish` kèm CSRF token. Backend cập nhật `published_release_id = null` trong `tours`; mọi truy cập của khách tham quan sẽ nhận HTTP 404 cho đến khi có bản công bố mới. |
| **Luồng thay thế và ngoại lệ** | **E1:** Bản nháp chưa hợp lệ: Có điểm thiếu tọa độ GPS hoặc dữ liệu bị sai lệch $\rightarrow$ Backend từ chối công bố với HTTP 422 Unprocessable Entity kèm thông báo chi tiết lỗi.<br>**E2:** Xung đột revision: Bản nháp bị lưu sửa đổi trong lúc đang mở popup công bố $\rightarrow$ Backend trả về HTTP 409 Conflict $\rightarrow$ Yêu cầu Admin tải lại dữ liệu trước khi công bố. |
| **Hậu điều kiện** | **Thành công:** Snapshot bất biến được tạo lập trong `tour_releases`; con trỏ `published_release_id` chuyển sang bản mới.<br>**Thất bại:** Không sinh snapshot rác, giữ nguyên bản phát hành cũ nếu có. |
| **Liên kết use case** | Nhận kết quả từ **UC06**; cung cấp dữ liệu phát hành cho **UC01**, **UC02**, **UC03**, **UC04**. |

---

### BẢNG ĐẶC TẢ USE CASE UC08: XEM THỐNG KÊ BÁO CÁO (DASHBOARD)

| Trường | Nội dung chi tiết |
| :--- | :--- |
| **Mã use case** | **UC08** |
| **Tên use case** | **Xem thống kê báo cáo (Dashboard)** |
| **Tác nhân chính** | Quản trị viên (Admin) |
| **Tác nhân hỗ trợ** | Dashboard Analytics Service, CSDL MongoDB (`usage_events`, `visitor_presence`, `users`, `tour_releases`) |
| **Mức độ đặc tả** | Chi tiết |
| **Tóm tắt** | Cung cấp dashboard trực quan thống kê các chỉ số vận hành thực tế theo ngày (múi giờ ICT): Số lượng khách duy nhất, số lượt hành trình, tổng lượt nghe audio, số người đang online theo thời gian thực (Heartbeat 90s) và biểu đồ phân bổ lượt nghe cho từng điểm tham quan. |
| **Tiền điều kiện** | Admin đã đăng nhập thành công (UC05). |
| **Sự kiện kích hoạt** | Admin nhấn chọn tab "Quản trị" trên thanh điều hướng (`/#/management`). |
| **Trình tự tương tác (Luồng sự kiện chính)** | **Hành động tác nhân** <br><br> 1. Admin truy cập đường dẫn `/#/management`. <br><br> 3. Trình duyệt nhận dữ liệu tổng hợp và hiển thị dashboard ngày hiện tại. <br><br> 5. Admin chọn một ngày cụ thể trong quá khứ trên bộ chọn ngày (Date Picker, ví dụ: `2026-10-24`). <br><br> 7. Admin quan sát sự biến động của biểu đồ lượt nghe giữa 10 điểm tham quan. <br><br> 9. Admin giữ màn hình Dashboard mở để theo dõi số người đang online trong khuôn viên trường. <br><br> **Phản hồi hệ thống** <br><br> 2. Gửi request `GET /api/v1/admin/dashboard` kèm cookie xác thực. Backend xác định ngày mặc định `day = now(ICT).date()`; thực thi song song các câu lệnh tổng hợp:<br>- Đếm số bản ghi trong `users` $\rightarrow$ `total_accounts`.<br>- Đếm số bản ghi trong `visitor_presence` có `last_seen >= now - 90s` $\rightarrow$ `active_browsers_online`.<br>- Lọc `usage_events` theo `day == day_str` và `is_simulated == false`:<br>  + Đếm số `visitor_id` phân biệt $\rightarrow$ `guest_visitors`.<br>  + Đếm sự kiện `journey_started` $\rightarrow$ `guest_journeys`.<br>  + Đếm sự kiện `audio_played` $\rightarrow$ `guest_audio_plays`.<br>- Thực hiện aggregation nhóm theo `place_id` cho các sự kiện `audio_played` để tính lượt nghe của từng POI trong ngày. Trả về HTTP 200 kèm JSON kết quả. <br><br> 4. Frontend render 4 thẻ chỉ số tóm tắt (Cards) và vẽ biểu đồ cột tương tác (Bar Chart) thể hiện số lượt nghe của 10 POI. <br><br> 6. Gửi request `GET /api/v1/admin/dashboard?day=2026-10-24`. Backend tính toán lại số liệu cho đúng ngày đó và trả về JSON; giao diện cập nhật lại toàn bộ biểu đồ. <br><br> 8. Hiển thị điểm tham quan có lượt nghe cao nhất (Top POI) và các điểm ít được quan tâm hơn để phục vụ công tác nâng cao chất lượng nội dung. <br><br> 10. Định kỳ mỗi 30 giây, Dashboard tự động gửi request cập nhật chỉ số `active_browsers_online` dựa trên luồng heartbeat gửi về từ các trình duyệt của khách (`POST /api/v1/events/presence` với cơ chế MongoDB TTL Index tự hủy sau 180s). |
| **Luồng thay thế và ngoại lệ** | **A1:** Làm mới thủ công: Admin bấm nút "Làm mới" trên thanh công cụ để cưỡng bức cập nhật số liệu ngay lập tức.<br>**E1:** Ngày được chọn không có dữ liệu tham quan: Backend trả về các chỉ số bằng 0, mảng breakdown rỗng $\rightarrow$ Frontend hiển thị biểu đồ phẳng và thông báo "Chưa có lượt tham quan nào trong ngày đã chọn".<br>**E2:** Mất kết nối CSDL: Backend trả về HTTP 500 $\rightarrow$ Frontend hiển thị thông báo lỗi hệ thống và giữ nguyên số liệu đã nạp ở lần gần nhất. |
| **Hậu điều kiện** | **Thành công:** Admin nắm bắt chính xác và trực quan tình hình tham quan thực tế của trường, số liệu mô phỏng được loại trừ hoàn toàn.<br>**Thất bại:** Báo lỗi tải số liệu, không làm treo giao diện. |
| **Liên kết use case** | Tiêu thụ và phân tích dữ liệu sự kiện được sinh ra tự động từ **UC01**, **UC02** và **UC03**. |
