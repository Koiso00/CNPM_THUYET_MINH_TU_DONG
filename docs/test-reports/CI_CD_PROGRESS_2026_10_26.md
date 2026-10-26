# Nhật ký thiết lập CI/CD — 26/10/2026

## Mục tiêu

Thiết lập kiểm tra tự động cho frontend/backend khi cập nhật nhánh `main` và chuẩn bị
Render chỉ tự triển khai sau khi CI đạt.

## Công việc đã làm

- Thêm GitHub Actions workflow tại `.github/workflows/ci.yml`, chạy khi mở/cập nhật Pull
  Request vào `main` và khi push lên `main`.
- Frontend CI cài dependencies bằng `npm ci`, chạy Vitest và `npm run build` (bao gồm
  typecheck).
- Backend CI cài dependencies theo `uv.lock`, chạy Ruff lint, kiểm tra format và pytest
  mặc định. Workflow không dùng Atlas credentials hoặc chạy integration test ghi dữ liệu.
- Sửa lỗi Node.js của frontend: workflow ban đầu dùng Node 22.12 trong khi `undici` 8.12.3
  yêu cầu Node `>=22.19.0`. Nâng Node CI và mức engines của frontend lên 22.19.
- Sửa Ruff E501 trong `generate_demo_audio_en.py`, sắp xếp import trong
  `tests/serve_auth_browser.py`, và format bốn file khác Ruff format kiểm tra báo chưa chuẩn.

## Kết quả đã xác nhận

- `ruff check app tests`: đạt.
- `ruff format --check app tests`: đạt, 97 file đã đúng định dạng.
- GitHub Actions run #3 trên `main`, commit `342d3e5`: trạng thái Success; cả Frontend
  checks và Backend checks đều đạt. Vitest báo 9/9 test files và 61/61 tests đạt.
- Sau khi service Render được tiếp tục hoạt động, người dùng gọi
  `https://sgu-campus-guide-demo.onrender.com/api/v1/health/ready` và nhận
  `{"status":"ready","database":"connected"}`. Điều này xác nhận API đang hoạt động
  và kết nối được MongoDB Atlas.

## Phần chưa xác nhận

- Chưa có bằng chứng trong nhật ký rằng Auto-Deploy trên Render đã được đổi sang
  **After CI Checks Pass**. Cần xem lại trong Render Dashboard → service → Settings.
- Health check không chứng minh phiên bản `main` mới nhất đã được triển khai hoặc toàn bộ
  luồng khách/audio trên giao diện đã được kiểm tra.
- Chưa ghi nhận kiểm thử Playwright/E2E hoặc kiểm thử nghiệp vụ sau lần deploy này.

## Lần triển khai tiếp theo

Khi xác nhận Auto-Deploy = **After CI Checks Pass**, push commit mới lên `main`, đợi CI
đạt rồi kiểm tra Render Deploys tới trạng thái Live và mở trang khách để thử hành trình/audio.
