# Demo khách và thống kê cơ bản — 23/10/2026

## Cập nhật giao diện và luồng thực tế — 23/10/2026

- `#/welcome` luôn hiển thị trang chào khách, kể cả khi trình duyệt còn ID khách hoặc ID hành trình cũ; chỉ nút bắt đầu mới chuyển sang `#/explore`.
- Trang welcome đã được thiết kế lại theo hướng SGU: nền ảnh khuôn viên, phần giới thiệu, card bắt đầu hành trình, thông tin audio và responsive cho màn hình nhỏ.
- Trang explore của khách hiển thị `Xin chào`, không hiển thị tên tài khoản. Header explore không còn bộ chọn ngôn ngữ hoặc nút đăng nhập quản trị.
- Admin vẫn có liên kết `Admin` vào `#/management` khi đã đăng nhập, kể cả ở route `#/login`. Giao diện đăng ký Admin đã bỏ; `#/register` chuyển về `#/login`. API đăng ký dài hạn chưa bị xóa khỏi backend.
- Bộ chọn ngôn ngữ chỉ còn ở welcome/login: có icon globe, mặc định Tiếng Việt; English và 한국어 chỉ là lựa chọn giao diện trạng thái “Sắp có”, chưa đổi dữ liệu.
- Header explore ở viewport khoảng 803px tự xuống dòng, không che hero hoặc làm lệch chữ.

## Đã triển khai

- `GET /api/v1/content/campus` và `GET/HEAD /api/v1/audio/{release_id}/{place_id}` chỉ đọc snapshot/audio đã công bố và không yêu cầu đăng nhập.
- Trang mặc định là trang chào; người nghe chọn tiếng Việt, bấm bắt đầu và không cần tài khoản.
- ID khách giữ trong `localStorage`; ID hành trình mới được tạo mỗi lần bắt đầu.
- Ghi visit một lần/ngày theo ID khách, journey bắt đầu và audio bắt đầu phát.
- Dashboard Admin có số khách, hành trình và audio trong ngày theo múi giờ ICT (UTC+7).
- `event_id` chống ghi trùng khi request được gửi lại.

## Giới hạn hiện tại

- Chỉ có tiếng Việt; chưa có lựa chọn ngôn ngữ thật.
- Chưa có QR, camera, GPS, offline, AI hoặc dịch/TTS tự động.
- ID khách là định danh trình duyệt, không đại diện chắc chắn cho một người thật.
- Event endpoint là API công khai phục vụ demo; vẫn kiểm tra Origin và chỉ nhận schema sự kiện giới hạn.

## Kiểm thử

- Backend: **173 passed, 16 skipped**; Ruff và format đạt.
- Frontend: **39 passed**, typecheck và build đạt.
- Atlas: đã kiểm tra read-only trạng thái `phong`; chưa ghi/xóa dữ liệu tài khoản trong bước này.
- Runtime: `/api/v1/health` và `/api/v1/health/ready` trả **200/200**; readiness xác nhận database `connected`. Tiến trình backend cũ giữ cổng 8000 đã được dừng đúng PID và khởi động lại; không sửa secret hoặc xóa dữ liệu Atlas.

## Kiểm tra bổ sung — 23/10/2026

- E2E khách chạy trên server Atlas biệt lập: desktop và viewport mobile đều đạt. Kiểm tra visit khi mở welcome, journey mới khi bắt đầu, giữ trang explore sau tải lại, giữ visitor/journey khi mở tab mới và tạo journey ID khác khi bắt đầu lần nữa.
- E2E Admin/nội dung/audio: 6/6 lượt desktop/mobile đạt trong cùng phiên kiểm tra biệt lập. Bao gồm quản lý tài khoản thử nghiệm, phát GridFS, sửa/lưu nháp nhưng không đổi release công khai, thay MP3/công bố trên collection tạm, dashboard và route Creator cũ.
- Toàn bộ server E2E được nối vào collection/bucket thử nghiệm. Sau kiểm tra gọi `/_test/shutdown`; log xác nhận collection tạm đã được xóa và xác minh.
- Frontend: 39 test đạt; `npm run build` (gồm typecheck) đạt. Backend test tập trung sự kiện khách và setup Admin: 20 đạt. Một lượt chạy ban đầu gặp quyền truy cập cache/temp của hệ thống; chạy lại với cache/basetemp trong vùng dự án thành công.
- Môi trường Atlas: DNS/network bị chặn trong sandbox ban đầu; server biệt lập khởi động được khi chạy với quyền mạng được duyệt. Không thay đổi tài khoản hoặc collection ứng dụng.
- E2E tổng hợp sau khi sửa race của test: **8/8** lượt (4 tình huống × desktop/mobile) đạt trong 2,3 phút.
- Đọc Atlas ứng dụng trực tiếp theo chế độ chỉ đọc: `phong` tồn tại, role Admin, active; tour có 10 địa điểm nháp và đã có release công bố; 10 asset ready, 10 file GridFS và 10 audio selection. Collection `usage_events` có 18 bản ghi trong ngày ICT lúc kiểm tra; đây là số bản ghi sự kiện, không phải số khách duy nhất.
- Không ghi/xóa tài khoản hoặc dữ liệu Atlas ứng dụng trong lần kiểm tra trạng thái này. E2E thay đổi dữ liệu chỉ trong collection/bucket tạm đã xác nhận dọn sạch.

## Kiểm kê tiếp theo — 24/10/2026

- Atlas sau dọn: `phong` vẫn là Admin active; role counts hiện tại là 0 User, 0 Creator, 1 Admin (trước dọn là 2 User, 1 Creator, 1 Admin).
- Đã thu hồi hai phiên User legacy, sau đó theo phạm vi đã chốt xóa đúng hai tài khoản `123`, `AGT`; xác minh cả hai không còn.
- Theo xác nhận của người dùng, đã xóa tài khoản Creator `phong11` cùng đúng 1 đề xuất `pending` gắn với tài khoản đó; không có phiên cần thu hồi thêm.
- Xác minh sau thao tác: các tài khoản legacy và đề xuất liên kết đều không còn; Admin `phong` vẫn active. Không thay đổi tour nháp, release công bố hoặc audio.
- Tour có 10 địa điểm nháp; release đang được trỏ tới tồn tại và đủ 10/10 địa điểm đã gắn audio. Các bản nháp chưa gắn audio ID là đúng theo luồng snapshot; audio được ghim khi công bố.
- Không xóa nội dung tour, release hoặc audio; thao tác tài khoản chỉ giới hạn ba account legacy đã xác định và đề xuất Creator người dùng chỉ định. Không đọc/in nội dung đề xuất hoặc secret.
- Người dùng đã nghe 10 MP3 demo và xác nhận audio đúng, không cần thay. Atlas đã có release gắn audio cho đủ 10/10 địa điểm; không thay đổi release trong bước xác nhận này.
- Sau khi dọn: `setup_admin phong --status` xác nhận Atlas kết nối, `phong` Admin active và role counts 0 User / 0 Creator / 1 Admin.
- Hồi quy mã trong lượt dọn: backend unit **173 passed**; frontend **39 passed**; `npm run build` (typecheck + production build) đạt. Các test này chạy sau khi dọn Creator và trước khi xóa hai User; chúng không ghi vào Atlas ứng dụng. Lần chạy backend đầu gặp quyền truy cập thư mục pytest temp của Windows; chạy lại với basetemp trong workspace thì toàn bộ test đạt.
- E2E dùng dữ liệu biệt lập: **12/12 đạt** trên desktop/mobile, gồm route khách, signup legacy chuyển về login, Admin login/refresh/logout, quản trị tài khoản, nội dung, audio GridFS và route Creator cũ. E2E chạy sau khi dọn Creator và trước thao tác xóa hai User; fixture không sử dụng các tài khoản ứng dụng.
- E2E dùng collection/bucket Atlas tạm; gọi shutdown và log xác nhận toàn bộ collection/bucket tạm đã được xóa/xác minh. Lượt toàn bộ đầu tiên lộ `auth.spec.ts` cũ còn kiểm tra đăng ký/Creator; đã cập nhật test theo hành vi demo hiện hành và chạy lại toàn bộ thành công.
- Sau thao tác xóa hai User, transaction xác minh role counts 0/0/1 và Admin active. QR/GPS/offline vẫn hoãn; chưa thực hiện kiểm thử camera hoặc thiết bị điện thoại thật.

## Smoke test demo đang chạy — 24/10/2026

- Backend readiness trả `ready`, MongoDB `connected`; frontend Vite trả HTTP 200 và có app root.
- API nội dung công khai trả release hiện hành với **10 địa điểm; 10/10 có audio ID**. Chỉ đọc dữ liệu, không gọi API ghi và không thay đổi Atlas.
- Frontend: **39 test đạt**; `npm run build` đạt, gồm TypeScript typecheck và production build.
- Trình duyệt của người dùng đang có phiên Admin `phong`: trang Quản trị hiển thị dashboard/danh sách tài khoản; trang Nội dung tải đủ danh sách 10 địa điểm, thao tác lưu/công bố và thư viện audio. Chỉ kiểm tra hiển thị/điều hướng; không lưu, công bố, xóa, upload hay phát audio.
- Đây là smoke test guest/API, build và điều hướng Admin; chưa xác nhận thao tác ghi thật của Admin trên giao diện hoặc phát audio trong trình duyệt.
- Demo tiếp tục chạy tại `http://127.0.0.1:5173/#/welcome`; backend tại `http://127.0.0.1:8000`. E2E Atlas ghi tạm không chạy lại để tránh tạo dữ liệu kiểm thử ngoài lượt này. QR/GPS/offline vẫn chưa triển khai.
