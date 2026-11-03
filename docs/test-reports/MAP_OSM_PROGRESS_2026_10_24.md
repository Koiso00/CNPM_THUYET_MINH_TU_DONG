# Tiến độ bản đồ khuôn viên — 24/10/2026

## Phạm vi và quyết định

- Người dùng chọn OpenStreetMap trực tuyến làm nguồn nền bản đồ.
- Người dùng đã cung cấp đủ 10 cặp vĩ độ/kinh độ theo tên địa điểm ngày 24/10; đã nhập vào dữ liệu giao diện và chuyển đúng thứ tự GeoJSON `[kinh độ, vĩ độ]`.
- Tâm nhìn ban đầu đặt tại khuôn viên cơ sở chính theo đối tượng khuôn viên trên bản đồ, chỉ dùng để mở bản đồ; không đại diện tọa độ của bất kỳ POI nào.

## Đã triển khai

- Thêm MapLibre GL JS và bản đồ raster tương tác vào trang Explore.
- Có điều khiển phóng to/thu nhỏ, attribution OpenStreetMap, trạng thái tải/lỗi và nút thử lại.
- Giới hạn góc nghiêng để bản đồ giữ dạng phẳng; hỗ trợ cấu hình URL tile qua `VITE_OSM_TILE_URL`.
- Đã gắn marker có nhãn cho 10 địa điểm; chọn marker đồng bộ địa điểm đang xem trong panel nội dung.
- Tọa độ là dữ liệu người dùng cung cấp, chưa được kiểm chứng thực địa. Không suy diễn bán kính geofence.
- Sửa lỗi người dùng phản ánh 24/10: dữ liệu release dùng UUID, trong khi lần đầu ghép tọa độ theo ID mẫu cố định nên không có marker. Hiện ghép theo tên địa điểm trong release; marker là nút DOM, không phụ thuộc glyph/layer nhãn của style raster.
- Theo góp ý giao diện tiếp theo: tăng chiều cao bản đồ (mobile tối thiểu 480px, desktop 540px), mở bản đồ toàn chiều ngang trước; thay số trên marker bằng biểu tượng theo loại địa điểm; panel mô tả/audio chỉ hiện sau khi chọn marker hoặc nút địa điểm. Danh sách bên dưới có tên/biểu tượng, nội dung thuyết minh đầy đủ và nút chọn; phần văn bản không bị cắt ngắn.
- Cập nhật nhãn marker theo góp ý: Khu A–E dùng chữ cái A, B, C, D, E; các điểm còn lại giữ biểu tượng theo loại.
- Cập nhật hướng dẫn ưu tiên trong README, AGENTS, kiến trúc, bối cảnh, kế hoạch và bảng công việc.

## Kiểm tra

- Frontend test: **45/45 đạt** (bao gồm đối chiếu đủ tọa độ, ký hiệu A–E và các biểu tượng loại điểm, chọn địa điểm từ marker, ẩn mô tả trước khi chọn và hiện mô tả sau khi chọn).
- Typecheck và production build: **đạt**.
- Lượt kiểm tra đầu trên trình duyệt: tile bị lỗi tải. Sau đó khi mở lại `#/explore`, nền OSM đã tải và hiện attribution; trạng thái báo “Bản đồ trực tuyến”.
- Sau sửa ghép tên/UUID: trình duyệt hiển thị đủ marker đánh số **1–10**; bấm marker **8** cập nhật panel sang “Căng tin”.
- Sau thiết kế lại: trình duyệt desktop hiển thị bản đồ mở rộng và đủ biểu tượng (tòa nhà, căng tin, sách, gửi xe, thể thao); panel mô tả không hiện lúc đầu, chỉ xuất hiện sau khi bấm marker. Bấm marker Căng tin mở nội dung/audio tương ứng.
- Kiểm tra kết nối tile trực tiếp từ tiến trình PowerShell bị môi trường chặn socket; tuy nhiên trình duyệt sau đó tải tile thành công. Việc kiểm tra mạng trực tiếp không đại diện đường mạng của trình duyệt.
- Build cảnh báo chunk MapLibre lớn hơn 500 kB sau minify; build vẫn thành công.
- Backend unit, Atlas integration và E2E không chạy lại trong thay đổi này vì chỉ sửa frontend bản đồ/tài liệu. Các kết quả hồi quy trước đó được tham chiếu trong `docs/TEST_AND_DEMO.md`, không coi là test bản đồ.

## GPS thật, mô phỏng và geofence — cập nhật 24/10/2026

- GPS browser `watchPosition` chỉ khởi động sau khi khách bấm “Bật GPS & tự phát”; có nút dừng, thông báo quyền bị từ chối/lỗi/timeout và không gửi tọa độ lên API.
- Mô phỏng cho chọn một POI, phát fix tổng hợp (accuracy ±5 m) mỗi 5 giây, gắn nhãn rõ; không gọi API event nên không làm tăng thống kê thật. Đây chỉ là dữ liệu thử nghiệm.
- GPS và mô phỏng dùng chung `GeofenceTracker`; giới hạn xử lý 1 fix/5 giây, loại accuracy >25 m, fix cũ >15 giây hoặc tọa độ sai; vào 30 m, ra 45 m; xác nhận bằng hai fix hợp lệ; điểm gần nhất thắng, hòa theo thứ tự tour.
- Bản đồ hiển thị chấm vị trí khác màu theo GPS/mô phỏng và dịch tâm nhìn đến fix mới. Khi geofence xác nhận, panel điểm tương ứng mở và player gọi `play()`; nếu trình duyệt từ chối, giao diện báo để khách nhấn phát thủ công. Không gọi play trên mỗi fix; một lần xác nhận điểm mới mới tạo yêu cầu tự phát.
- Ngưỡng 30/45/25 m là mặc định thử nghiệm từ runtime plan, chưa được hiệu chỉnh hoặc nghiệm thu tại khuôn viên. GPS trên điện thoại cần HTTPS; chưa yêu cầu/nhận quyền location trong lần kiểm tra này.
- Thêm 6 bài unit geofence, 1 bài tích hợp Explore và 2 bài AudioPlayer: khoảng cách, xác nhận hai fix, mẫu lỗi/cũ/sai số, hysteresis 45 m, chọn điểm gần nhất/thứ tự hòa, GPS/mô phỏng/throttle, yêu cầu tự phát, fallback khi bị chặn và loại autoplay mô phỏng khỏi thống kê. Tổng frontend hiện 54 test đạt; TypeScript và build đạt. Build còn cảnh báo bundle MapLibre >500 kB như trước.
- Smoke DOM trên trang Explore đang mở xác nhận các nút GPS thật/mô phỏng, chọn điểm và thông báo rõ ngưỡng/không ghi mô phỏng vào thống kê. Thao tác bấm thử trình duyệt không hoàn thành do phiên điều khiển đầu vào bị timeout; không cấp quyền vị trí và không khẳng định đã kiểm thử browser permission thật.
- Theo yêu cầu giao diện mới nhất, các thẻ danh sách hiển thị đầy đủ tên khu và nội dung thuyết minh; panel chi tiết trên bản đồ/audio vẫn ẩn đến khi chọn địa điểm. Ký hiệu thẻ Khu A–E dùng chữ cái xanh/trắng đồng nhất với marker bản đồ; các địa điểm khác giữ biểu tượng. Frontend test: **55/55 đạt**; typecheck và build đạt. Build vẫn có cảnh báo chunk MapLibre lớn hơn 500 kB.

## Thử nguồn tile Stadia Maps — cập nhật 24/10/2026

- Sau khi người dùng báo điện thoại không truy cập được OSM, đổi nguồn mặc định của MapLibre sang raster Alidade Bright tại `tiles.stadiamaps.com`; giữ nguyên 10 tọa độ, marker, lựa chọn địa điểm và luồng GPS/geofence.
- Attribution đã đổi sang Stadia Maps, OpenMapTiles và OpenStreetMap. Có thể thay URL tile bằng `VITE_MAP_TILE_URL`; không cấu hình API key trong bundle frontend.
- Web production phải thêm chính xác domain deploy trong Stadia Dashboard (domain-based authentication). Localhost được thử theo chính sách phát triển nhưng có rate limit.
- Frontend test: **56/56 đạt**; TypeScript và production build đạt. Build còn cảnh báo chunk MapLibre >500 kB.
- Chưa xác minh tile tải thành công từ trình duyệt điện thoại: domain production chưa được cấu hình tại Stadia và không có quyền truy cập tài khoản Stadia của người dùng. Đây mới là thay đổi nguồn và kiểm tra cấu hình cục bộ; cần người dùng cấu hình domain, deploy, rồi xác nhận trên điện thoại.
- Stadia vẫn cần Internet; đây không phải thay đổi sang bản đồ offline. Nếu tile từ Stadia cũng không truy cập được trên mạng điện thoại thì cần đánh giá mạng hoặc quay lại phương án offline.

## Còn lại / điều kiện chuyển bước

1. Xác minh đủ 10 tọa độ/marker trên thực địa; sửa dữ liệu chỉ theo xác nhận của người dùng.
2. Dùng điện thoại thật qua HTTPS, kiểm tra cho phép/từ chối quyền, sai số thực tế, tab nền và tiết kiệm pin.
3. Khảo sát/hiệu chỉnh bán kính vào-ra cho khuôn viên; xác nhận cách xử lý các geofence gần/chồng lấn.
4. E2E GPS (mock provider ở test) và mô phỏng qua 2 mẫu/đóng-dừng, đảm bảo sự kiện mô phỏng không vào dashboard thật.
5. GPS tự nhận diện, autoplay theo geofence và xác nhận ngưỡng vẫn cần hoàn tất trước demo chính thức.

Không có thao tác ghi/xóa dữ liệu Atlas trong phần việc này.

## Phản hồi thực địa và sửa luồng audio — 24/10/2026

- Người dùng xác nhận đã cấu hình domain Stadia, bản đồ và GPS hoạt động trên điện thoại, và đã kiểm chứng 10 tọa độ tại thực địa. Các mục “chưa xác minh” ở trên là nhật ký của thời điểm triển khai trước phản hồi này.
- Trên iPhone/Safari, khi geofence xác nhận điểm, audio không tự phát và giao diện báo trình duyệt chặn; bấm Phát thủ công thì nghe được. Đây là kết quả người dùng quan sát, không phải kết quả kiểm thử thiết bị do nhóm phát triển thực hiện.
- Nguyên nhân khả dĩ từ mã: thẻ `<audio>` trước đây chỉ được tạo sau khi nhận điểm, nằm ngoài thao tác người dùng. Safari yêu cầu lần tải/phát đầu tiên của thẻ media gắn với thao tác người dùng. Đã giữ một thẻ audio xuyên suốt trang và gọi `load()` ngay trong thao tác bật GPS/mô phỏng; đổi điểm vẫn dùng thẻ đó. Đây là thay đổi cần người dùng thử lại trên iPhone, chưa thể coi là sửa xong trên thiết bị.
- Chưa nhận xác nhận riêng rằng ngưỡng vào 30 m, ra 45 m và sai số 25 m phù hợp với mọi điểm.
- Kiểm tra mã sau sửa: 10/10 test tập trung `AudioPlayer` và `ExplorePage` đạt; typecheck/production build đạt; `git diff --check` đạt. Build vẫn cảnh báo bundle MapLibre lớn. Chưa chạy E2E hoặc kiểm tra iPhone/Safari trong phiên sửa này; kết quả trên thiết bị chỉ có thể xác nhận khi người dùng mở bản cập nhật.

### Chạy thử trực tiếp sau sửa

- Chạy lại toàn bộ frontend: **56/56 test đạt**; typecheck và production build đạt. Cảnh báo dung lượng chunk MapLibre vẫn còn.
- Backend kết nối Atlas sau khi chạy trong môi trường có quyền mạng: readiness **200**, database `connected`; API nội dung công khai **200**, trả 10 địa điểm với 10 audio ID. Lượt khởi động đầu trong sandbox bị chặn mạng và trả readiness 503; sau đó khởi động lại với quyền mạng và đạt.
- Trình duyệt Edge với viewport điện thoại 390×844: luồng mô phỏng xác nhận Khu A sau hai mẫu, dùng MP3 công bố thật qua HTTP **206**, thẻ audio ở trạng thái đang phát và thời gian phát tăng từ 0 lên khoảng 1,94 giây; không có thông báo chặn tự phát. Trình duyệt thử dùng ID hành trình đặt cục bộ để vào thẳng Explore; không dùng tài khoản Admin hay sửa dữ liệu tour.
- Đây là kết quả trên Edge có kích thước điện thoại, chưa phải Safari chạy trên iPhone. Safari vẫn cần người dùng thử lại bản cập nhật để xác nhận hành vi tự phát.

### Phát audio khi chạm điểm — 24/10/2026

- Phản hồi người dùng: chạm một điểm trên màn hình không tự phát audio. Hành vi cũ chỉ chọn địa điểm; tự phát chỉ được gọi khi geofence xác nhận.
- Đã đổi marker và nút thẻ có audio để gọi `play()` đồng bộ ngay trong thao tác chạm; thẻ audio được giữ lại và thay nguồn khi chuyển điểm. Nút danh sách đổi thành “Nghe thuyết minh”; điểm chưa có audio vẫn chỉ mở nội dung.
- Kiểm tra hồi quy: **57/57 frontend test đạt**. Trên Edge viewport 390×844 với MP3 công bố từ Atlas, chạm “Nghe thuyết minh” chọn Khu A và audio phát (currentTime tăng ~2,54 giây, readyState 4). Đây chưa phải kiểm tra iPhone/Safari.
- Một sự kiện audio thử đã được gửi nhầm vào Atlas do chạy thử với ID hành trình giả; đã xóa đúng một bản ghi khớp đồng thời visitor ID, journey ID, release ID và place ID của bài thử. Không có dữ liệu tour/audio nào thay đổi.
- Người dùng xác nhận sau khi dùng bản cập nhật trên điện thoại, chạm địa điểm và nghe audio đã hoạt động.

## Khắc phục bản đồ local — 26/10/2026

- Nguyên nhân local: Vite không tải được module tối ưu `maplibre-gl` tại `/node_modules/.vite/deps/maplibre-gl.js`; module bị thiếu trong `node_modules`. Stadia không phải nguyên nhân: tile khuôn viên và lưới tile lân cận trả HTTP 200; cùng trình duyệt tải trực tiếp ảnh tile 256×256 thành công, WebGL2 khả dụng.
- Khôi phục dependencies theo `package-lock.json`, khởi động lại Vite local. Sau đó trang `#/explore` tải MapLibre, hiển thị nền Stadia, attribution và đủ 10 marker. Trạng thái lỗi không còn xuất hiện.
- Cập nhật `CampusMap` để lỗi tile đơn lẻ sau khi style đã tải không đánh dấu toàn bản đồ là lỗi; thông báo tải/lỗi/thử lại được hiển thị theo VI/EN/KO. Lỗi khởi tạo trong dev có thông tin chẩn đoán đã lọc query string.
- Frontend **61/61 test đạt**, typecheck và production build đạt; build vẫn báo chunk MapLibre lớn hơn 500 kB. `git diff --check` đạt.
- Bản đồ đã xác nhận trong trình duyệt local trên máy này; chưa kiểm tra lại mạng điện thoại hoặc Safari/iPhone.
