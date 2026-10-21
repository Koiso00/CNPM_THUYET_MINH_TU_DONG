# Kiểm thử và demo

## Kiểm tra khung

Typecheck/build frontend; kiểm tra cú pháp và lint Python; smoke test health/OpenAPI.
Kiểm tra frontend build được phục vụ cùng nguồn FastAPI.
Những kiểm tra này không xác nhận chức năng nghiệp vụ, kết nối MongoDB hoặc Docker.

### Kết quả khung ngày 21/10/2026

- Đạt: TypeScript và production build với React 19.2.9, Vite 7.3.7, Node.js 24.19.0.
- Đạt: lint, kiểm tra định dạng và biên dịch Python 3.12.10.
- Đạt: smoke test health/OpenAPI bằng TestClient; router chưa triển khai trả 404.
- Đạt: FastAPI phục vụ frontend đã build và các tài nguyên JS/CSS cùng nguồn với API.
- Đạt: liên kết Markdown nội bộ; bản kế hoạch gốc trùng nội dung byte với file được chọn.
- Đạt: cấu trúc YAML của Compose đọc được. Chưa chạy Docker vì máy chưa có Docker.
- Chưa kiểm thử: MongoDB/GridFS, auth/RBAC, GPS, audio, PWA/offline, AI hoặc triển khai cloud.

Đây là kết quả kiểm tra nền tảng, không phải báo cáo nghiệm thu sản phẩm.

## Ma trận nghiệm thu mục tiêu

| Nhóm | Tình huống cần chứng minh |
| --- | --- |
| Auth/RBAC | Đăng ký không tự chọn quyền; User không xem nháp; Creator không sửa nội dung ngoài quyền; CSRF, hết hạn/thu hồi phiên |
| Công bố | Từ chối/gửi lại; sửa nháp giữ nguyên release; bản dịch/audio đúng phiên bản; asset nháp không tải trái phép |
| GPS | Sai số, mẫu cũ, ranh giới vùng, vùng chồng nhau, từ chối quyền, ẩn/hiện trang |
| Audio | Một nguồn phát; không phát lặp; đổi ngôn ngữ; từng tầng fallback; thiếu giọng cục bộ; autoplay bị chặn |
| Jobs | Yêu cầu trùng, giới hạn đồng thời, provider lỗi, retry hữu hạn, restart và kết quả lỗi thời |
| Offline | Đủ gói, tắt mạng, đóng/mở lại, thiếu dung lượng, tải dở, checksum sai, cập nhật lỗi, dữ liệu bị browser xóa |
| Đăng xuất | Xóa cache/quyền theo tài khoản, nhiều tab, đăng xuất offline rồi kết nối lại |
| Dashboard | Bắt đầu tour/nghe hoàn tất đúng, sự kiện gửi lại không nhân đôi, loại mô phỏng khỏi dữ liệu thật |
| Triển khai | Secrets không vào frontend; HTTPS; restart không mất asset; phục hồi bản chạy trên máy |

Thiết bị chính: Chrome Android và Chrome/Edge máy tính.
Safari iPhone kiểm tra bổ sung, báo rõ kết quả; không tuyên bố hỗ trợ khi chưa thử.

## Kịch bản demo mục tiêu

1. Creator nhập một điểm có nguồn, Việt–Anh, ảnh và audio; gửi duyệt.
2. Admin duyệt; User chỉ thấy bản đã công bố.
3. User bắt đầu tour, bật mô phỏng và đi qua các điểm; không cần cấp GPS trong chế độ này.
4. Chuyển Việt/Anh, nghe lại thủ công, kiểm tra hàng đợi.
5. Tải đủ pack; tắt mạng, đóng/mở lại rồi tiếp tục xem bản đồ/nghe.
6. Có mạng lại, đồng bộ sự kiện một lần; dashboard không trộn dữ liệu mô phỏng.
7. Thử đăng xuất offline, kết nối lại và xác nhận phiên không tự khôi phục ngoài ý muốn.

GPS mô phỏng không thay thế khảo sát thực địa. Chuẩn bị bản local và tài nguyên từ trước,
không phụ thuộc dịch/TTS/Gemini trực tiếp trong buổi trình bày.

## Ghi nhận kết quả

Mỗi lần nghiệm thu lưu commit, trình duyệt/thiết bị, dữ liệu sử dụng, bước thực hiện,
kết quả thực tế và lỗi còn lại. Chưa có báo cáo nghiệm thu nghiệp vụ ở thời điểm tạo khung.
