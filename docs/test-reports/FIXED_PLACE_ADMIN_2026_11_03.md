# Giới hạn quản trị địa điểm — 03/11/2026

**Cập nhật sau đó:** Rủi ro ghép tọa độ theo tên được khắc phục bằng tọa độ theo ID trong release. Xem [báo cáo đồng bộ tọa độ](COORDINATE_MIGRATION_2026_11_03.md).

Theo yêu cầu người dùng, bỏ nút thêm và xóa địa điểm khỏi trang Nội dung. API lưu bản nháp chỉ chấp nhận tập ID địa điểm giống bản nháp hiện tại; thêm hoặc xóa bị từ chối HTTP 422, revision cũ trả 409. Admin tiếp tục sửa nội dung, bản dịch và audio của các điểm hiện có; snapshot công bố không bị thay đổi bởi việc sửa mã.

Kiểm tra cục bộ: backend 183 test đạt, 16 integration test bỏ qua; Ruff check/format đạt. Frontend: 12 test tập trung đạt, typecheck và production build đạt; build cảnh báo kích thước chunk MapLibre. Không chạy integration Atlas hoặc nghiệm thu trên bản deploy.

Giới hạn cần lưu ý: tọa độ dự phòng trong frontend đang được ghép theo tên tiếng Việt. Nếu điểm không có tọa độ trong dữ liệu và Admin đổi tên gốc, marker có thể không còn được ghép tọa độ dự phòng. Thay đổi lần này không sửa cơ chế định vị hoặc dữ liệu đã lưu.
