# CI/CD

## GitHub Actions CI

Workflow tại `.github/workflows/ci.yml` tự chạy khi mở/cập nhật Pull Request vào
`main` và khi push trực tiếp lên `main`.

- Frontend: cài đúng dependencies từ lockfile, chạy test, typecheck và production build.
- Backend: cài dependencies theo `uv.lock`, chạy Ruff lint/format và pytest mặc định.
- CI không kết nối Atlas, không cần secrets và không chạy integration tests có ghi dữ liệu.

## Bật CI

Sau khi push workflow lên GitHub:

1. Mở repository → **Actions** và xác nhận workflow **CI** chạy thành công.
2. Tạo Pull Request vào `main`; chờ cả **Frontend checks** và **Backend checks** đạt.
3. Trong **Settings → Branches** hoặc **Rules → Rulesets**, tạo quy tắc cho `main`
   và yêu cầu hai check này đạt trước khi merge. Tên check có thể hiện dưới tên job.

## Bật CD qua Render

Render đã liên kết repository/branch theo hướng dẫn tại [DEPLOY_RENDER](DEPLOY_RENDER.md).
Trong Render Dashboard, mở service `sgu-campus-guide-demo` → **Settings** → **Auto-Deploy**
và chọn **After CI Checks Pass**. Khi GitHub Actions báo thành công cho commit trên branch
được deploy, Render tự build và deploy. Nếu CI thất bại, Render không deploy commit đó.

Không cần deploy hook hoặc Render secret trong GitHub Actions cho cách này. Nếu service vẫn
đang suspended, cần resume service trong Render trước khi deploy được phục vụ khách. Kiểm tra
**Deploys** tới trạng thái Live và gọi `/api/v1/health/ready` sau khi deploy.

Render hỗ trợ chờ CI checks trước khi auto-deploy; xem [tài liệu Render](https://render.com/docs/deploys).
