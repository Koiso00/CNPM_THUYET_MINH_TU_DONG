# Frontend

React 19, TypeScript và Vite. Ứng dụng có welcome cho khách, trang khám phá sau khi bắt đầu hành trình, bản đồ Stadia Maps, GPS opt-in/mô phỏng/geofence, trình phát audio và khu vực Admin.

## Trạng thái hiện tại

- `/#/welcome`: khách chọn VI/EN/KO; lựa chọn được lưu và giữ khi đi qua các trang. Trên mobile, bộ chọn ngôn ngữ hiển thị dạng gọn ở header.
- `/#/explore`: khách xem 10 địa điểm trên bản đồ và nghe audio đã công bố. Nội dung/audio Việt, English và Korean đã được duyệt và công bố cho 10 POI.
- `/#/admin`: Admin quản lý nội dung POI theo ngôn ngữ, bản nháp, công bố và MP3.
- `/#/management`: Admin xem thống kê theo ngày và quản lý tài khoản.
- GPS thật opt-in và mô phỏng đi qua chung luồng geofence. Người dùng đã kiểm chứng tọa độ và nghe được audio khi chạm điểm trên điện thoại. Safari có thể chặn tự phát theo geofence; nghiệm thu GPS tự nhận diện/autoplay và ngưỡng geofence còn để sau.
- Offline và service worker chưa triển khai; AI/dịch/TTS tự động hoãn.

## Chạy local

Từ thư mục `frontend`:

```powershell
npm ci
npm run dev
```

Vite proxy `/api` đến `127.0.0.1:8000`; khởi động backend riêng theo [README gốc](../README.md). Không đặt secrets trong biến `VITE_*` hoặc `public/`.

## Kiểm tra

```powershell
npm run typecheck
npm run build
npm test
npm run test:e2e
```

E2E cần cấu hình máy chủ/API và Atlas biệt lập; xem [hướng dẫn test](tests/README.md). Hồi quy frontend gần nhất trong báo cáo đa ngôn ngữ đạt 61 test, typecheck/build đạt. Chi tiết theo từng phần tại [báo cáo kiểm thử](../docs/test-reports/).

## Ranh giới mã

`src/app` chứa app shell/hash routing; `src/features` chia theo auth, guest, content, tours, map và admin; `src/shared` chứa thành phần dùng chung. Hash routing cho phép tải lại route khi cùng nguồn FastAPI phục vụ `dist`; không cần SPA fallback.
