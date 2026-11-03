# Rà tiến độ và tính nhất quán tài liệu — 03/11/2026

## Phạm vi và giới hạn

Rà 50 file Markdown được `rg --files -g '*.md'` liệt kê trong repository, đối chiếu các quyết định ngày 23–27/10 và đọc thêm mã liên quan đến ngôn ngữ/audio/API. Không tính thư mục bị Git ignore hoặc dependencies là tài liệu dự án. Không sửa tài liệu nguồn, mã ứng dụng, dữ liệu Atlas hoặc cấu hình triển khai trong lượt này.

Workspace đã có thay đổi chưa commit trong 11 file Markdown trước lượt rà, cùng DOCX và thư mục tmp chưa theo dõi. Báo cáo này đối chiếu nội dung working tree, không mặc định đó là bản trên GitHub/Render.

Không chạy test ứng dụng, truy cập Atlas hay kiểm tra Render trực tiếp. Các kết quả dưới đây là bằng chứng đã lưu trong repository; không phải xác nhận dịch vụ đang hoạt động ngày 03/11.

## Tiến độ có bằng chứng

| Phần | Trạng thái theo tài liệu |
| --- | --- |
| Khách | Welcome → bắt đầu hành trình → Explore, không đăng nhập; giữ ID khách và ngôn ngữ, tạo ID hành trình khi bắt đầu |
| Admin |Nội dung tại `#/admin`; dashboard/tài khoản tại `#/management`. |
| Nội dung/audio | 10 POI; Việt, Anh, Hàn đã được người dùng duyệt/công bố; release ghi nhận ngày 26/10 là `2cebd7fb-7ca8-4719-819b-abb2a2191038` |
| Bản đồ/GPS | Stadia, 10 tọa độ đã kiểm chứng, GPS opt-in/mô phỏng/geofence có mã; người dùng xác nhận chạm điểm phát audio trên điện thoại |
| Dashboard | Thống kê ngày ICT và audio theo điểm đã được người dùng xác nhận trên deploy; tính năng presence bổ sung 26/10 cần phân biệt với phần đã nghiệm thu |
| CI/deploy | CI run #3, commit `342d3e5`, đạt; readiness Render ngày 26/10 được ghi nhận ready/connected. Chưa xác nhận commit đang chạy, After CI Checks Pass và nghiệm thu UI/audio sau deploy |
| Còn nghiệm thu | GPS tự phát trên Safari/iPhone, ngưỡng geofence, hàng đợi/chống lặp, thiết bị thật và diễn tập tổng thể |
| Dài hạn ||
| Offline | Đã loại khỏi cả demo và kế hoạch dài hạn ngày 27/10; không phải đầu việc đang chờ |

Nguồn chính: [WORK_BREAKDOWN](../WORK_BREAKDOWN.md), [báo cáo audio Hàn](DEMO_AUDIO_KO_DRAFT_2026_10_26.md), [CI/CD](CI_CD_PROGRESS_2026_10_26.md), [dashboard](ADMIN_DASHBOARD_PROGRESS_2026_10_24.md).

Không quy đổi thành phần trăm hoặc tuần hoàn thành: các hạng mục có độ lớn khác nhau và bảng P1–P5 trộn phạm vi demo với mục tiêu dài hạn.

## Các điểm xung đột hoặc chưa đồng bộ

### 1. Chính sách thiếu audio theo ngôn ngữ — cần ưu tiên

- `docs/DEMO_GUEST_QR_PLAN.md:68` yêu cầu không tự phát ngôn ngữ khác.
- `docs/test-reports/MULTILINGUAL_UI_PROGRESS_2026_10_24.md:11` mô tả giữ audio Việt khi thiếu audio ngôn ngữ đang chọn.
- `frontend/src/features/tours/ExplorePage.tsx:86` xác nhận mã chọn audio ngôn ngữ yêu cầu nếu có, nếu không chọn `vi` khi có `audio_id`.
- Đây là chênh lệch giữa yêu cầu và hành vi mã, không chỉ câu chữ. Release hiện đủ ba ngôn ngữ không chứng minh trường hợp thiếu audio được xử lý đúng. Cần đối chiếu quyết định đã chốt trước khi sửa mã; không tự ghi fallback là yêu cầu được duyệt.

### 2. Nội dung English dự phòng ngoài snapshot

- AGENTS và DATA_AND_API quy định khách chỉ đọc nội dung công bố, bản dịch không khớp nguồn bị loại khỏi snapshot.
- `ExplorePage.tsx:81` có fallback `getCampusEnglishDraft` khi thiếu bản dịch English trong POI công bố. Nguồn fallback là nội dung cục bộ, không được kiểm tra checksum nguồn tại nhánh này.
- Báo cáo đa ngôn ngữ gọi đây là fallback khi release chưa tải được, nhưng mã chỉ áp dụng sau khi có POI; `ExploreScreen.tsx` vẫn báo lỗi khi API không tải được release.
- Cần rà riêng chính sách fallback để tránh hiển thị bản dịch cũ khi nguồn Việt thay đổi. Không kết luận dữ liệu hiện tại đã bị sai hoặc bản nháp bí mật đã bị lộ.

### 3. Offline đã loại nhưng vẫn còn trong danh mục thực hiện

- Quyết định 27/10 ở AGENTS/README loại offline hoàn toàn.
- `frontend/src/features/README.md:12` vẫn có module offline với Manifest/IndexedDB/Workbox.
- `docs/PROJECT_PLAN.md:90` còn màn hình quản lý gói tải; dòng 73 còn manifest tải xuống. Ghi chú đầu file có ghi đè nhưng phần thân vẫn gây nhầm khi dùng như kế hoạch dài hạn.
- `frontend/README.md` chỉ nói offline/service worker chưa triển khai; CONTENT_GUIDE vẫn hướng dẫn đóng gói bản đồ.
- Nên loại khỏi danh mục công việc hiện hành hoặc đánh dấu rõ là nội dung đã hủy, giữ nhật ký cũ theo ngày.

### 4. Bản đồ vừa có vừa chưa triển khai trong cùng tài liệu

- `docs/ARCHITECTURE.md:9` ghi Stadia/GPS đã tích hợp.
- Dòng 38–39 còn liệt kê bản đồ chưa triển khai; dòng 44 gọi vùng sơ đồ là placeholder.
- `frontend/src/features/README.md:3` nói các module khác vẫn giữ chỗ, trái với chính bảng module và trạng thái README.

### 5. Tiếng Hàn và audio Việt chưa được cập nhật đồng đều

- `frontend/README.md:8` nói Korean chưa có nội dung/audio; báo cáo 26/10 xác nhận đã công bố đủ 10 điểm.
- `docs/CONTENT_GUIDE.md:12` nói MP3 Việt chưa nghe duyệt; báo cáo khách/Atlas 24/10 đã ghi người dùng nghe duyệt.
- WORK_BREAKDOWN P3.2/P3.3 và mở đầu backend README vẫn chỉ tổng kết Việt–Anh. Báo cáo đa ngôn ngữ có cập nhật Hàn nhưng mục “Còn lại” bên dưới vẫn nói chưa có.
- Cần cập nhật các đoạn tổng kết hiện hành; tên file có chữ draft không tự chứng minh asset vẫn chưa duyệt.

### 6. Render bị suspend hay đã hoạt động lại

- `AGENTS.md:5`, `infra/README.md:9` vẫn dùng trạng thái suspend như hiện hành.
- README, PROJECT_CONTEXT, DEPLOY_RENDER và CI_CD ghi nhận service đã tiếp tục hoạt động, readiness đạt ngày 26/10.
- Trạng thái chuẩn nên ghi “lần xác nhận gần nhất trong hồ sơ: 26/10 ready/connected; chưa kiểm tra lại hiện tại”. Không suy ra code mới nhất đã deploy từ health check.

### 7. Thứ tự demo và nghiệm thu GPS


### 8. Danh sách “cần chốt” của demo có việc đã xong

- Các phần khác đã xác nhận VI/EN/KO, ngày ICT, Admin active và tài khoản/đề xuất legacy đã được dọn.
- Nhiều tab đã có kết quả thử nhưng không tự coi mọi quy tắc vòng đời đã chốt.

### 9. quản trị hiện hành và quản trị dài hạn chưa tách rõ ở README con

- Ba vai trò trong PROJECT_PLAN không tự là mâu thuẫn vì được giữ cho dài hạn.

### 10. Hàng đợi, phát lại và chỉ số audio

- TOUR_RUNTIME ghi chưa có hàng đợi nhưng phần ngưỡng vẫn nói bỏ POI đang chờ và không ngắt bài đang nghe.
- PROJECT_PLAN yêu cầu mỗi điểm chỉ tự phát một lần/phiên; TOUR_RUNTIME ghi có thể phát lại sau khi ra/vào vùng.
- Kế hoạch dài hạn và ma trận test dùng “nghe hoàn tất”; API/dashboard hiện dùng `audio_played` khi phát thành công.
- Cần chia rõ “đang có” và “tiêu chí chưa đạt”, không gọi lượt bắt đầu nghe là lượt nghe hết hoặc đánh dấu P2.3 hoàn tất.

### 11. Báo cáo kiểm thử và presence chưa được tổng hợp theo đúng mốc

- Frontend tests README gọi 39 test là hồi quy hiện hành; báo cáo đa ngôn ngữ/bản đồ và CI sau đó ghi 61.
- Backend tests README mở đầu 152/15 skip nhưng bên dưới vẫn ghi 14 skip; WORK_BREAKDOWN tổng hợp 181/16 skip ở đợt đa ngôn ngữ.
- Đây không phải bằng chứng test thất bại: số lượng thuộc những phiên bản khác nhau. Cần ghi ngày/commit/phạm vi thay vì nhiều con số cùng mang nhãn hiện hành.
- Báo cáo dashboard 26/10 ghi presence được bổ sung, sửa CSRF với 4 test backend đạt, frontend/deploy còn chờ. Không nên suy rộng xác nhận dashboard trước đó thành nghiệm thu presence mới.
- Báo cáo Hàn ghi việc thiếu dependencies khiến build/test chưa chạy được; báo cáo bản đồ 26/10 ghi đã khôi phục và 61 test/build đạt. Cần liên kết mốc khắc phục thay vì để lỗi cũ như blocker chưa xử lý.

### 12. Hướng dẫn và thứ tự ưu tiên nguồn

- `backend/README.md` mục “Tạo lại audio demo” viết “Lệnh trên tạo lại 10 MP3” nhưng lệnh ngay trước đó là `init_database`; cần bổ sung đúng `generate_demo_audio`.
- `scripts/README.md` nói chưa có script seed/TTS; cần giới hạn rõ chỉ trong thư mục scripts, vì lệnh thực tế ở backend/app/commands đã có.
- DEPLOY_RENDER còn hướng dẫn đăng ký tài khoản trên giao diện dù UI đăng ký đã bỏ. Mục cập nhật dùng On Commit trong khi CI_CD hướng dẫn After CI Checks Pass; nên dẫn về một cấu hình mục tiêu và ghi trạng thái chưa xác nhận.
- PROJECT_CONTEXT nói PROJECT_PLAN “giữ nguyên” và là nguồn chuẩn; working tree đã sửa bản kế hoạch để loại offline theo yêu cầu mới. Cần thống nhất thứ tự: quyết định mới trực tiếp của người dùng → phạm vi demo hiện hành → kế hoạch dài hạn chưa bị thay thế → nhật ký lịch sử.

## Kiểm tra tài liệu đã thực hiện

- Kiểm tra sự tồn tại của đích liên kết Markdown nội bộ dạng đường dẫn: không thấy đích bị thiếu trong 50 file nguồn. Chưa kiểm tra anchor, URL ngoài hoặc link dạng tham chiếu.
- Đọc mã chọn ngôn ngữ/audio và endpoint events/audio để xác minh các chênh lệch nêu trên. Không chạy luồng trình duyệt hay test nghiệp vụ mới.

## Hướng đồng bộ đề xuất

1. Dùng PROJECT_CONTEXT làm một bản tổng kết hiện hành có ngày xác nhận; README/AGENTS/README con dẫn tới đó, tránh lặp quá nhiều đoạn tiến độ.
3. Giữ báo cáo lịch sử; thêm dòng chỉ tới mốc thay thế thay vì sửa kết quả test cũ thành kết quả mới.
4. Tách mỗi đầu việc thành: đã có mã, đã kiểm thử local, đã công bố dữ liệu, đã deploy, đã nghiệm thu thiết bị. Không gộp các mức này thành một chữ “xong”.

Đây là đề xuất tổ chức tài liệu, chưa phải quyết định thay đổi phạm vi hoặc xác nhận nghiệm thu mới.
