# P1.2 — User/session và index

Ngày kiểm tra: 21/10/2026. Môi trường: Windows, Python 3.12.10, MongoDB Atlas phát triển.
Phạm vi: lớp dữ liệu; chưa triển khai đăng ký/đăng nhập HTTP hoặc giao diện auth.

## Quyết định được người dùng xác nhận

- Tên đăng nhập không phân biệt hoa/thường.
- Access token 15 phút, tự gia hạn trong phiên có hạn tuyệt đối 7 ngày.

## Đã thực hiện

- Model User/session, UUIDv4 lưu chuỗi, datetime UTC theo millisecond BSON.
- Username key trim/casefold và unique index; role user/creator/admin, mặc định user.
- Hash mật khẩu/refresh ẩn trong serialization thông thường; không lưu token rõ.
- Session tối đa 7 ngày, truy vấn kiểm tra hết hạn/thu hồi, thay refresh digest nguyên tử.
- Unique refresh digest, TTL expires_at và index user_id.
- Lệnh khởi tạo index tường minh, thông báo lỗi đã lọc bí mật, không tự xóa dữ liệu.
- Đã chạy lệnh khởi tạo thành công trên database ứng dụng Atlas, không tạo tài khoản.

## Kết quả kiểm tra

Từ thư mục backend:

| Kiểm tra | Kết quả |
| --- | --- |
| `uv run --frozen pytest -q --tb=short` | 69 passed, 12 skipped (0.89s); không dùng Atlas |
| `uv run --frozen pytest tests/integration -q --tb=short --run-mongodb-integration --run-mongodb-write-integration` | 12 passed (15.18s), Atlas thật |
| Ruff check và format | Đạt |
| `uv run --frozen python -m app.commands.init_database` | Thành công; tạo index users/sessions ứng dụng |

12 test Atlas gồm một ping, bốn test User và bảy test session.
Đã kiểm tra unique username khi chèn đồng thời, đọc/ghi UUID/UTC, idempotence index,
unique digest, hai refresh đồng thời chỉ một thắng, token cũ không dùng lại được,
thu hồi đúng chủ sở hữu, thu hồi nhiều phiên và từ chối phiên hết hạn.
Mỗi test ghi dùng collection tạm riêng và xác minh cleanup hoàn tất.
Test TTL kiểm tra metadata index và hết hạn bằng truy vấn, không khẳng định thời điểm MongoDB xóa vật lý.

## Lỗi đã sửa và giới hạn

Kiểm tra định dạng phát hiện ba dòng quá dài; đã định dạng lại, lint và test đạt.
Không còn lỗi được phát hiện trong phạm vi kiểm thử trên.

Chưa có băm/kiểm tra mật khẩu, sinh token, JWT/cookie/CSRF/RBAC hoặc tự gia hạn từ trình duyệt.
Repository nhận hash nội bộ; service P1.3 phải tạo hash, xác minh user và thực thi quyền.
Chưa có tài khoản seed, GridFS, Docker runtime hoặc nghiệm thu auth trên thiết bị.
Không chạy lại frontend vì phần này không sửa frontend.

## Đối chiếu kế hoạch

Hoàn thành tiêu chí P1.2 trong WORK_BREAKDOWN, không thay phạm vi kế hoạch gốc.
UUID chuỗi, index có tên và lệnh khởi tạo là lựa chọn kỹ thuật của lớp lưu trữ.
Phần tiếp theo P1.3 thực hiện chính sách đã chốt qua API JWT cookie/CSRF/RBAC;
P1.4 triển khai giao diện và gia hạn tự động.
