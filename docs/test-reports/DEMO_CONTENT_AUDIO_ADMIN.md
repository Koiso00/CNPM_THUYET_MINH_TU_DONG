# Demo nội dung, audio và quản trị — 22/10/2026

## Phạm vi và kết quả

Triển khai phần tiếp theo của demo 2 ngày theo yêu cầu người dùng:

- Một tour khuôn viên có bản nháp MongoDB và snapshot công bố độc lập. Nội dung tiếng Việt
  từ nguồn đã chọn, không sửa văn bản nguồn hoặc tạo tọa độ giả.
- Admin sửa tên tour, thêm/sửa/xóa điểm trong nháp, ghi nguồn, lưu, công bố/gỡ công bố.
  Revision CAS trả 409 nếu bản nháp thay đổi; lỗi mạng giữ dữ liệu form.
- User chỉ đọc snapshot hiện hành qua API; chưa công bố trả thông báo, không fallback
  sang 10 mô tả tĩnh. Creator không đọc/sửa API Admin.
- GridFS lưu MP3, metadata có checksum và checksum văn bản. Snapshot ghim asset ID;
  sửa chữ hoặc tải audio mới không thay audio của release đã công bố.
- API MP3 GET/HEAD, single Range 206, suffix/open-ended, lỗi 416. Preview riêng cho Admin.
  Đổi địa điểm/rời trang dừng audio cũ, không tự phát khi mở trang.
- Admin upload MP3 thô tối đa 10 MiB theo giới hạn người dùng chốt. Kiểm tra MIME,
  kích thước khi đọc stream và parser MP3; không nhận filename/path do client điều khiển.
- Admin xem danh sách user có phân trang, đổi role, khóa/mở khóa; không xóa tài khoản.
  Không trả hash mật khẩu/token. Khóa thu hồi phiên, mở khóa không khôi phục phiên đã thu hồi.
  Chặn tự sửa tài khoản và bảo vệ Admin đang hoạt động khỏi khóa/hạ quyền trên web,
  tránh hai Admin đồng thời làm mất toàn bộ quyền quản trị.
- Dashboard đếm users/active_users/audio_assets/draft_places/published_places/published_tours
  từ database. Không tạo số lượt nghe/lượt đến. Audio count gồm các phiên bản file đã nhập.

Lệnh `seed_demo_content` chỉ tạo nháp khi chưa có; không thay công việc cũ. Lệnh
`import_demo_audio` kiểm tra toàn bộ manifest/nguồn/file trước ghi, dùng ID theo checksum,
chạy lại không nhân đôi hoặc thay lựa chọn MP3 người quản trị đã upload. Lệnh
`bootstrap_admin` chỉ nâng tài khoản đã đăng ký và đang hoạt động; không tạo mật khẩu mặc định.

Đã chạy trên Atlas ứng dụng: tạo nháp 10 mô tả, nhập 10 asset MP3 và nâng tài khoản
người dùng chỉ định. Không ghi thông tin tài khoản vào báo cáo. Không tự công bố nội dung;
Admin cần nghe duyệt rồi bấm công bố trên giao diện.

Chạy lại seed/import trên database ứng dụng: nháp được giữ nguyên và **0 asset mới**,
xác nhận 10 MP3 không bị nhân đôi. Sau khi dọn server kiểm thử, đã khởi động app thật
phục vụ frontend build cùng nguồn tại `http://127.0.0.1:8000`.

## Kiểm thử

- Backend cục bộ: **151 passed, 15 skipped**. 15 test Atlas bị bỏ qua có chủ đích.
  Các test mới kiểm tra bản nháp không lộ, CSRF/RBAC, snapshot không đổi khi sửa,
  xung đột revision, audio sai phiên bản, Range/HEAD, từ chối MP3 giả và giới hạn 10 MiB.
- Atlas thật: **15 passed**, gồm toàn bộ test auth/User/session cũ và test demo mới.
  Test demo dùng collection và bucket GridFS có tên ngẫu nhiên riêng, kiểm tra lưu nháp,
  seed không ghi đè, công bố, đọc GridFS theo Range, sửa không đổi snapshot, CAS đồng thời,
  dashboard đúng, projection user không có hash, khóa/mở khóa vẫn chặn phiên cũ,
  bảo vệ Admin và gỡ công bố chặn audio. Đã dọn và xác minh đúng các collection tạo ra.
  Fixture Range dùng 10 byte kiểm thử lưu trữ, không coi đó là MP3 có thể phát.
- Frontend: **27 passed**, gồm 22 test hồi quy và 5 test nội dung/quản trị/player mới.
  Có kiểm tra API 404 không hiển thị dữ liệu tĩnh, giữ form khi lỗi mạng,
  chặn công bố bản chưa lưu, dùng revision mới sau lưu, gửi đúng role/trạng thái và dừng player cũ.
- TypeScript/Vite production build: đạt.
- Edge headless với API/Atlas/GridFS thật: **6 passed**, 3 kịch bản × desktop 1366×900
  và mobile viewport 390×844. Ngoài auth/nhiều tab/role/mất mạng còn có phát MP3 thật
  (currentTime tăng), đổi địa điểm chỉ còn một player, sửa/lưu nháp không đổi bản công bố,
  tải MP3 qua input file rồi công bố và phát bản mới. Không tràn ngang ở cả hai kích thước.
  Ảnh nằm trong `frontend/test-results/.../admin-demo.png` và `explore-demo.png` trên máy,
  không commit dữ liệu test hoặc media sinh ra. Đã kiểm tra trực quan ảnh desktop/mobile.
- Ruff check/format và git diff --check được kiểm tra; chỉ có cảnh báo chuẩn hóa LF/CRLF Windows.

## Lỗi đã sửa trong lượt triển khai

- Python launcher và cache hệ thống bị giới hạn trong sandbox: chạy bằng Python 3.12
  được đóng gói cùng app, dùng site-packages đã khóa của dự án và thư mục tmp riêng.
  Không thay dependency hoặc đọc/in secrets. Atlas cần mạng ngoài sandbox, đã chạy được.
- Test auth cũ giả mọi phản hồi là grant đăng nhập, không có response cho API Admin mới;
  cập nhật fixture đúng endpoint và tiêu đề UI mới. Không sửa mã để bỏ qua lỗi nghiệp vụ.
- TypeScript phát hiện nhánh tiêu đề Admin cũ không thể tới sau khi tách AdminPage;
  cập nhật nhánh Creator. Tách GET/HEAD decorator để không trùng OpenAPI operation ID.
- Test upload dùng lại CSRF sau khi một request khác đã thay cookie: lấy token mới trước
  lượt kiểm tra quá cỡ. CSRF middleware hoạt động đúng, không nới kiểm tra token.

## Giới hạn và đối chiếu kế hoạch

Đây là tập con demo tiếng Việt/một tour. Chưa hoàn thành toàn bộ P1.5/P2.3/P3.1/P3.3/P5.2:
POI/localization đang nhúng trong draft, chưa tách collection; chưa có Creator gửi duyệt,
workflow song ngữ, jobs/TTS/dịch/fallback, phiên tour/geofence, usage events/audit.
Vị trí có thể null; UI chưa cung cấp công cụ nhập tọa độ do chưa có khảo sát.
Release không còn tham chiếu và các phiên bản audio cũ chưa có tác vụ dọn tự động;
không xóa snapshot/asset đang dùng. Publish dùng snapshot insert trước CAS, không transaction.
Mất tiến trình giữa các bước import GridFS có thể để lại file chưa được metadata tham chiếu;
đường lỗi thông thường đã dọn file, chưa có công cụ quét orphan sau crash.
Số dashboard là các phép đọc liên tiếp, không phải snapshot transaction cùng thời điểm.

Chưa nghe duyệt phát âm/nội dung đủ 10 file, chưa xác minh lịch sử/tọa độ thực địa,
chưa thử điện thoại vật lý/Safari, Docker, HTTPS/cloud, offline, GPS hoặc AI.
Kiểm tra playback tự động không thay việc người dùng nghe duyệt nội dung.

## Chạy lại

Theo các lệnh trong README và `backend/tests/README.md`. Test Atlas mới:

```powershell
uv run --frozen pytest tests/integration -q --tb=no --run-mongodb-integration --run-mongodb-write-integration
```

Không dùng `--showlocals` với cấu hình có secrets. Test Edge dùng server
`python -m tests.serve_auth_browser`, cần bộ MP3/manifest đã chuẩn bị, không gọi dịch vụ TTS.
Server test override mọi service dữ liệu sang collection riêng và phải dừng bằng route
`/_test/shutdown` để dọn/xác minh dữ liệu tạm; không dùng route này trong app thật.
