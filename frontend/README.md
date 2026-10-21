# Frontend

React 19.2, TypeScript, Vite 7. Chỉ có trang mở đầu; chưa tích hợp bản đồ,
đăng nhập, audio, service worker hoặc API client.

Từ thư mục frontend:
```powershell
npm ci
npm run dev
```

Vite proxy /api tới 127.0.0.1:8000 để phát triển cùng backend.
Không đặt secrets vào biến VITE_* hoặc public/.

Kiểm tra:
```powershell
npm run typecheck
npm run build
```

Build tạo dist/. Để thử frontend và API cùng địa chỉ, đặt FRONTEND_DIST
của backend trỏ tới thư mục dist đã build. Xem [README gốc](../README.md).
[Feature boundaries](src/features/README.md) mô tả các thư mục đang giữ chỗ.
MapLibre, PMTiles, Workbox và thư viện IndexedDB sẽ được thêm khi triển khai tính năng,
không được coi là đã tích hợp chỉ vì có trong kế hoạch.
