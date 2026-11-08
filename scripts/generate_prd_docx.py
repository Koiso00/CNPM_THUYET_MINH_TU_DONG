import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
import os

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def create_styled_table(doc, headers, data, col_widths=None):
    table = doc.add_table(rows=len(data) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    # Header Row
    hdr_cells = table.rows[0].cells
    for i, header_text in enumerate(headers):
        hdr_cells[i].text = header_text
        set_cell_background(hdr_cells[i], "1F4E79")
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=140, right=140)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        for run in p.runs:
            run.font.bold = True
            run.font.color.rgb = RGBColor(255, 255, 255)
            run.font.size = Pt(10)
            run.font.name = "Arial"

    # Data Rows
    for row_idx, row_data in enumerate(data):
        row_cells = table.rows[row_idx + 1].cells
        bg_color = "F2F5F8" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, cell_value in enumerate(row_data):
            row_cells[col_idx].text = str(cell_value)
            set_cell_background(row_cells[col_idx], bg_color)
            set_cell_margins(row_cells[col_idx], top=80, bottom=80, left=140, right=140)
            p = row_cells[col_idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for run in p.runs:
                run.font.size = Pt(9.5)
                run.font.name = "Arial"
                run.font.color.rgb = RGBColor(51, 51, 51)

    if col_widths:
        for row in table.rows:
            for idx, width in enumerate(col_widths):
                row.cells[idx].width = Inches(width)

    # Spacing after table
    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(4)
    p_after.paragraph_format.space_after = Pt(8)
    return table

def add_heading_1(doc, text):
    h = doc.add_heading(text, level=1)
    h.paragraph_format.space_before = Pt(16)
    h.paragraph_format.space_after = Pt(6)
    h.paragraph_format.keep_with_next = True
    for run in h.runs:
        run.font.size = Pt(15)
        run.font.bold = True
        run.font.name = "Arial"
        run.font.color.rgb = RGBColor(31, 78, 121)
    return h

def add_heading_2(doc, text):
    h = doc.add_heading(text, level=2)
    h.paragraph_format.space_before = Pt(12)
    h.paragraph_format.space_after = Pt(4)
    h.paragraph_format.keep_with_next = True
    for run in h.runs:
        run.font.size = Pt(12.5)
        run.font.bold = True
        run.font.name = "Arial"
        run.font.color.rgb = RGBColor(46, 117, 182)
    return h

def add_heading_3(doc, text):
    h = doc.add_heading(text, level=3)
    h.paragraph_format.space_before = Pt(8)
    h.paragraph_format.space_after = Pt(2)
    h.paragraph_format.keep_with_next = True
    for run in h.runs:
        run.font.size = Pt(11)
        run.font.bold = True
        run.font.name = "Arial"
        run.font.color.rgb = RGBColor(89, 89, 89)
    return h

def add_p(doc, text, bold_prefix="", italic=False):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_bold = p.add_run(bold_prefix)
        r_bold.font.bold = True
        r_bold.font.name = "Arial"
        r_bold.font.size = Pt(10)
        r_bold.font.color.rgb = RGBColor(30, 41, 59)
    run = p.add_run(text)
    run.font.name = "Arial"
    run.font.size = Pt(10)
    run.font.italic = italic
    run.font.color.rgb = RGBColor(51, 65, 85)
    return p

def add_bullet(doc, text, bold_prefix=""):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_bold = p.add_run(bold_prefix)
        r_bold.font.bold = True
        r_bold.font.name = "Arial"
        r_bold.font.size = Pt(10)
        r_bold.font.color.rgb = RGBColor(30, 41, 59)
    run = p.add_run(text)
    run.font.name = "Arial"
    run.font.size = Pt(10)
    run.font.color.rgb = RGBColor(51, 65, 85)
    return p

def build_prd():
    doc = Document()

    # Page setup (A4, 1-inch margins)
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)

    # Title & Header
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(24)
    title_p.paragraph_format.space_after = Pt(6)
    title_run = title_p.add_run("TÀI LIỆU YÊU CẦU SẢN PHẨM (PRD)")
    title_run.font.name = "Arial"
    title_run.font.size = Pt(22)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(31, 78, 121)

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(18)
    sub_run = sub_p.add_run("SGU SMART CAMPUS AUDIO GUIDE - HỆ THỐNG THUYẾT MINH TỰ ĐỘNG ĐA NGÔN NGỮ")
    sub_run.font.name = "Arial"
    sub_run.font.size = Pt(12)
    sub_run.font.bold = True
    sub_run.font.color.rgb = RGBColor(46, 117, 182)

    # Document Information Table
    meta_headers = ["Thông tin dự án", "Chi tiết"]
    meta_data = [
        ["Tên dự án", "Hệ thống Thuyết minh Tự động SGU Campus Guide"],
        ["Mã định danh dự án", "CNPM_THUYET_MINH_TU_DONG / sgu-campus-guide-demo"],
        ["Phiên bản PRD", "2.1 (Cập nhật sau nghiệm thu Đa ngôn ngữ & Dashboard)"],
        ["Đối tượng áp dụng", "Cơ sở chính Đại học Sài Gòn (273 An Dương Vương, Q.5, TP.HCM)"],
        ["Ngôn ngữ hỗ trợ", "Tiếng Việt (Gốc), English, 한국어 (Korean)"],
        ["Kiến trúc nền tảng", "FastAPI (Async Python), React 18 (TypeScript), MongoDB Atlas & GridFS"],
        ["Trạng thái hiện hành", "Đã nghiệm thu MVP Demo, chuẩn bị triển khai QR Code & Offline"]
    ]
    create_styled_table(doc, meta_headers, meta_data, col_widths=[2.2, 4.3])

    # 1. TỔNG QUAN SẢN PHẨM
    add_heading_1(doc, "1. TỔNG QUAN SẢN PHẨM (EXECUTIVE SUMMARY)")
    add_heading_2(doc, "1.1. Bối cảnh dự án")
    add_p(doc, "Trường Đại học Sài Gòn (Cơ sở chính: 273 An Dương Vương, Phường 3, Quận 5, TP.HCM) là ngôi trường giàu truyền thống với kiến trúc cổ kính giao thoa phong cách Pháp - Việt. Hàng năm, khuôn viên đón tiếp hàng nghìn tân sinh viên, cựu sinh viên, phụ huynh cùng các đoàn công tác, đối tác quốc tế. Tuy nhiên, trường chưa có đội ngũ thuyết minh viên thường trực, gây khó khăn cho du khách trong việc tìm hiểu văn hóa, lịch sử và kiến trúc các tòa nhà.")

    add_heading_2(doc, "1.2. Vấn đề cần giải quyết")
    add_bullet(doc, "Không bắt buộc tải ứng dụng từ App Store / Google Play nhằm loại bỏ rào cản 70-80% người dùng bỏ cuộc.", "Rào cản cài đặt app: ")
    add_bullet(doc, "Khách tham quan không bị ép buộc đăng ký/đăng nhập tài khoản, có thể trải nghiệm tức thì ngay khi truy cập web.", "Rào cản tài khoản: ")
    add_bullet(doc, "Nội dung và giọng thuyết minh phải phục vụ du khách quốc tế (đặc biệt là tiếng Anh và tiếng Hàn).", "Rào cản ngôn ngữ: ")
    add_bullet(doc, "Ban quản trị thiếu công cụ đo lường thực tế số lượng khách tham quan và mức độ quan tâm đến từng địa điểm.", "Thiếu dữ liệu phân tích: ")

    add_heading_2(doc, "1.3. Mục tiêu & Định vị sản phẩm")
    add_p(doc, "Xây dựng Web App PWA responsive di động, định vị GPS / Geofence để tự động phát thuyết minh audio chất lượng cao khi người dùng đến gần 10 điểm mốc đã kiểm chứng thực địa, đồng thời cung cấp hệ thống quản trị nội dung an toàn với cơ chế CAS Optimistic Locking và Dashboard thống kê thời gian thực.")

    # 2. CHÂN DUNG NGƯỜI DÙNG & KỊCH BẢN
    add_heading_1(doc, "2. CHÂN DUNG NGƯỜI DÙNG & KỊCH BẢN CỐT LÕI")
    persona_headers = ["Chân dung", "Mô tả vai trò", "Kịch bản cốt lõi (Core Scenario)"]
    persona_data = [
        [
            "P1: Tân sinh viên / Khách Việt Nam",
            "Du khách nội địa tham quan trường, sử dụng smartphone cá nhân.",
            "Vào #/welcome -> Chọn Tiếng Việt -> Bấm Bắt đầu -> Xem bản đồ số #/explore -> Đi đến điểm mốc -> Nghe audio tự động."
        ],
        [
            "P2: Khách quốc tế (EN / KO)",
            "Đoàn chuyên gia, đối tác, du khách nước ngoài nói tiếng Anh hoặc Hàn.",
            "Quét mã/truy cập web -> Chọn English hoặc 한국어 -> Nội dung và audio giọng bản xứ phát chuẩn xác theo ngôn ngữ đã chọn."
        ],
        [
            "P3: Quản trị viên (Admin)",
            "Cán bộ phòng Truyền thông / Thiết bị phụ trách dữ liệu và vận hành.",
            "Đăng nhập #/login -> Biên soạn POI tại #/admin -> Nghe thử MP3 -> Bấm Công bố (CAS check) -> Xem thống kê tại #/management."
        ]
    ]
    create_styled_table(doc, persona_headers, persona_data, col_widths=[1.8, 2.0, 2.7])

    # 3. YÊU CẦU CHỨC NĂNG
    add_heading_1(doc, "3. YÊU CẦU CHỨC NĂNG CHI TIẾT (FUNCTIONAL REQUIREMENTS)")
    add_heading_2(doc, "FR1: Phân hệ Du khách & Khám phá khuôn viên (Guest Tour)")
    add_bullet(doc, "Khách vào #/welcome không cần tài khoản; chọn 1 trong 3 ngôn ngữ (VI/EN/KO); sinh guest_id và journey_id độc lập trong trình duyệt.", "FR1.1 Trải nghiệm không rào cản: ")
    add_bullet(doc, "Hiển thị 10 địa điểm thực địa trên bản đồ Stadia Maps / OSM; hiển thị vị trí hiện tại của khách kèm vòng bán kính độ chính xác.", "FR1.2 Bản đồ số tương tác: ")
    add_bullet(doc, "Trình phát âm thanh đơn nhất (Single Audio Player), hỗ trợ HTTP Range 206 Partial Content giúp phát tức thì; tự dừng khi đổi điểm.", "FR1.3 Phát âm thanh thuyết minh: ")

    add_heading_2(doc, "FR2: Định vị GPS & Bộ điều khiển Geofence tự động")
    add_bullet(doc, "Hỗ trợ GPS thiết bị thật (Opt-in) và chế độ giả lập (Simulation mode) phục vụ kiểm thử và thuyết trình.", "FR2.1 Nguồn vị trí linh hoạt: ")
    add_bullet(doc, "Chỉ nhận tọa độ có accuracy <= 25m, timestamp không quá 15s; tần suất xử lý tối thiểu 5.000ms.", "FR2.2 Bộ lọc dữ liệu vào: ")
    add_bullet(doc, "Bán kính vào vùng 30m; thoát vùng 45m; xác nhận 2 lần liên tiếp để chống chập chờn (Hysteresis & Debounce).", "FR2.3 Ngưỡng kích hoạt Geofence: ")

    add_heading_2(doc, "FR3: Quản lý Nội dung Đa ngôn ngữ & Xuất bản CAS")
    add_bullet(doc, "Biên tập tên, bài thuyết minh, tọa độ GeoJSON theo từng ngôn ngữ VI, EN, KO tại #/admin.", "FR3.1 Biên soạn đa ngữ: ")
    add_bullet(doc, "Tự động băm SHA-256 nội dung tiếng Việt gốc (source_text_sha256). Bản dịch cũ sẽ tự hết hạn nếu tiếng Việt bị sửa.", "FR3.2 Ràng buộc toàn vẹn bản dịch: ")
    add_bullet(doc, "Admin tải MP3 <= 10 MiB; backend kiểm tra MIME audio/mpeg và header frame MP3; lưu trữ GridFS.", "FR3.3 Quản lý tệp MP3: ")
    add_bullet(doc, "Kiểm tra revision trước khi xuất bản; tạo snapshot bất biến (tour_releases); trả lỗi 409 Conflict nếu có xung đột ghi đè.", "FR3.4 Xuất bản an toàn CAS: ")

    add_heading_2(doc, "FR4: Quản lý Tài khoản & Dashboard Thời gian thực")
    add_bullet(doc, "Phân quyền User/Admin; khóa/mở khóa tài khoản (khóa sẽ thu hồi phiên ngay lập tức); bảo vệ Admin đang hoạt động khỏi bị hạ quyền.", "FR4.1 Quản trị người dùng: ")
    add_bullet(doc, "Lọc số liệu theo ngày ICT; đếm số trình duyệt online qua heartbeat 30s/90s window; thống kê lượt khách, hành trình, lượt nghe từng POI.", "FR4.2 Bảng điều khiển phân tích: ")

    # 4. YÊU CẦU PHI CHỨC NĂNG
    add_heading_1(doc, "4. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)")
    nfr_headers = ["Tiêu chí", "Chỉ số yêu cầu", "Giải pháp kỹ thuật thực tế trong mã nguồn"]
    nfr_data = [
        ["Hiệu năng tải trang", "FCP <= 1.5s trên 4G", "Vite bundle splitting, CDN tiles Stadia, tài nguyên nén tối ưu."],
        ["Độ trễ phản hồi API", "< 150ms", "FastAPI async, AsyncMongoClient connection pool theo lifespan."],
        ["Khởi tạo âm thanh", "< 500ms", "GridFS Range stream 206 Partial Content, đọc từng chunk 255KB."],
        ["Bảo mật xác thực", "Chống rò rỉ Token & XSS", "JWT HttpOnly cookie, Secure trên HTTPS, SameSite=Lax, không lưu token ở Web Storage."],
        ["Phòng chống CSRF", "Bảo vệ 100% POST/PUT/DELETE", "Token CSRF ký HMAC-SHA256 gắn session_id; so sánh an toàn bằng hmac.compare_digest; kiểm tra Origin & Sec-Fetch-Site."],
        ["Mã hóa mật khẩu", "Chống vét cạn (Brute-force)", "Băm mật khẩu bằng Argon2id chạy trong threadpool riêng biệt."],
        ["Khả năng chịu tải", ">= 500 người dùng đồng thời", "Kiến trúc phi trạng thái (Stateless API), TTL database tự động dọn session/presence."]
    ]
    create_styled_table(doc, nfr_headers, nfr_data, col_widths=[1.6, 1.8, 3.1])

    # 5. THIẾT KẾ CƠ SỞ DỮ LIỆU CHI TIẾT
    add_heading_1(doc, "5. THIẾT KẾ CƠ SỞ DỮ LIỆU CHI TIẾT (DATABASE SPECIFICATION)")
    add_p(doc, "Hệ thống sử dụng MongoDB Atlas 7.0+ kết hợp với GridFS Bucket phân tán. Dưới đây là đặc tả chi tiết của toàn bộ 8 Collections nghiệp vụ và 2 GridFS Collections:")

    add_heading_2(doc, "5.1. Phân hệ Người dùng & Phiên xác thực (users & sessions)")
    add_p(doc, "Bảng users lưu trữ thông tin tài khoản; bảng sessions quản lý luân chuyển Refresh Token và tự động hết hạn phiên.")
    u_headers = ["Collection", "Tên trường", "Kiểu dữ liệu", "Bắt buộc", "Mô tả & Ràng buộc kỹ thuật"]
    u_data = [
        ["users", "_id", "String (UUIDv4)", "Có", "Khóa chính định danh người dùng."],
        ["users", "username", "String", "Có", "Tên tài khoản hiển thị (1-128 ký tự in được)."],
        ["users", "username_key", "String", "Có", "Username chuẩn hóa (trim + casefold). Unique Index uq_users_username_key."],
        ["users", "password_hash", "String", "Có", "Chuỗi băm mật khẩu bằng thuật toán Argon2id."],
        ["users", "role", "String", "Có", "Vai trò: 'user' hoặc 'admin'."],
        ["users", "is_active", "Boolean", "Có", "Trạng thái tài khoản (True: hoạt động, False: bị khóa)."],
        ["users", "created_at / updated_at", "DateTime", "Có", "Thời gian tạo và cập nhật gần nhất (chuẩn UTC BSON millisecond)."],
        ["sessions", "_id", "String (UUIDv4)", "Có", "Khóa chính phiên làm việc (session_id)."],
        ["sessions", "user_id", "String", "Có", "Khóa ngoại trỏ về users._id. Standard Index ix_sessions_user_id."],
        ["sessions", "refresh_token_hash", "String", "Có", "Mã băm SHA-256 của Refresh Token 256-bit. Unique Index uq_sessions_refresh_token_hash."],
        ["sessions", "expires_at", "DateTime", "Có", "Hạn chót tuyệt đối của phiên (7 ngày). TTL Index ttl_sessions_expires_at."],
        ["sessions", "revoked_at", "DateTime", "Không", "Thời điểm thu hồi phiên (khi logout hoặc admin khóa tài khoản)."]
    ]
    create_styled_table(doc, u_headers, u_data, col_widths=[1.1, 1.4, 1.2, 0.7, 2.1])

    add_heading_2(doc, "5.2. Phân hệ Biên tập Tour & Đề xuất Duyệt (tours, tour_releases & content_submissions)")
    add_p(doc, "Áp dụng mô hình Snapshot Isolation: tours lưu bản nháp đang chỉnh sửa, tour_releases lưu bản chụp đóng băng vĩnh viễn lúc công bố, và content_submissions lưu trữ các đề xuất nội dung của Creator gửi Admin xét duyệt.")
    t_headers = ["Collection", "Tên trường", "Kiểu dữ liệu", "Bắt buộc", "Mô tả & Ràng buộc kỹ thuật"]
    t_data = [
        ["tours", "_id", "String", "Có", "Khóa chính cố định: 'campus-main'."],
        ["tours", "revision", "Integer", "Có", "Biến đếm CAS (bắt đầu từ 1, tăng 1 sau mỗi lần lưu hoặc xuất bản)."],
        ["tours", "draft", "Object", "Có", "Cấu trúc JSON: {title, language:'vi', places: [10 POIs]}."],
        ["tours", "draft.places[].location", "Object", "Không", "Tọa độ GeoJSON Point: {type:'Point', coordinates: [lng, lat]}."],
        ["tours", "draft.places[].translations", "Object", "Không", "Chứa bản dịch 'en' và 'ko' kèm hash kiểm tra source_text_sha256."],
        ["tours", "published_release_id", "String", "Không", "Khóa ngoại trỏ về tour_releases._id đang được công bố."],
        ["tours", "updated_at / updated_by", "DateTime / String", "Có", "Thời gian sửa đổi và ID tài khoản Admin thực hiện."],
        ["tour_releases", "_id", "String (UUIDv4)", "Có", "Khóa chính bản phát hành (release_id)."],
        ["tour_releases", "tour_id", "String", "Có", "Khóa ngoại trỏ về tours._id ('campus-main')."],
        ["tour_releases", "source_revision", "Integer", "Có", "Revision gốc của bản nháp lúc công bố."],
        ["tour_releases", "draft", "Object", "Có", "Snapshot đóng băng toàn bộ nội dung 10 POIs và ghim audio_id cụ thể."],
        ["tour_releases", "published_by / at", "String / DateTime", "Có", "ID Admin công bố và thời điểm xuất bản (UTC)."],
        ["content_submissions", "_id", "String (UUIDv4)", "Có", "Khóa chính bản đề xuất tour từ Creator."],
        ["content_submissions", "creator_id", "String", "Có", "ID Creator gửi đề xuất. Index: (creator_id, updated_at)."],
        ["content_submissions", "draft / base_revision", "Object / Int", "Có", "Nội dung đề xuất và revision gốc dựa vào."],
        ["content_submissions", "status", "String", "Có", "Trạng thái: draft, submitted, approved, rejected. Index: (status, updated_at)."],
        ["content_submissions", "review_note / reviewed_by", "String", "Không", "Ghi chú đánh giá và ID Admin phê duyệt."]
    ]
    create_styled_table(doc, t_headers, t_data, col_widths=[1.1, 1.4, 1.2, 0.7, 2.1])

    add_heading_2(doc, "5.3. Phân hệ Âm thanh & GridFS (assets, audio_selections, fs.files, fs.chunks)")
    add_p(doc, "Lưu trữ tệp âm thanh theo cơ chế Content-Addressed Storage (định danh bằng SHA-256) và chia nhỏ nhị phân thành các khối 255KB.")
    a_headers = ["Collection", "Tên trường", "Kiểu dữ liệu", "Bắt buộc", "Mô tả & Ràng buộc kỹ thuật"]
    a_data = [
        ["assets", "_id", "String", "Có", "Mã băm SHA-256 của tệp MP3 (Content-Addressed ID)."],
        ["assets", "text_sha256", "String", "Có", "Mã băm SHA-256 của đoạn văn bản thuyết minh tương ứng."],
        ["assets", "language", "String", "Có", "Ngôn ngữ của file audio ('vi', 'en', hoặc 'ko')."],
        ["assets", "gridfs_id", "ObjectId", "Có", "Khóa ngoại trỏ đến tệp nhị phân trong fs.files._id."],
        ["assets", "filename / length", "String / Int", "Có", "Tên file MP3 gốc và dung lượng tính bằng byte (<= 10 MiB)."],
        ["assets", "status", "String", "Có", "Trạng thái file ('ready' sau khi upload và validate MP3 frames)."],
        ["audio_selections", "_id", "String", "Có", "Khóa ánh xạ: text_sha256 (tiếng Việt) hoặc '{lang}:{text_sha256}'."],
        ["audio_selections", "asset_id", "String", "Có", "Khóa ngoại trỏ về assets._id được ưu tiên phát."],
        ["fs.files", "_id / filename", "ObjectId / String", "Có", "Metadata tệp GridFS và tên file."],
        ["fs.files", "chunkSize / length", "Integer", "Có", "Kích thước chunk (255 KB) và tổng dung lượng."],
        ["fs.chunks", "_id / files_id", "ObjectId", "Có", "Định danh chunk và khóa ngoại trỏ về fs.files._id."],
        ["fs.chunks", "n / data", "Integer / Binary", "Có", "Chỉ số thứ tự chunk (0, 1, 2...) và dữ liệu nhị phân."]
    ]
    create_styled_table(doc, a_headers, a_data, col_widths=[1.2, 1.4, 1.2, 0.7, 2.0])

    add_heading_2(doc, "5.4. Phân hệ Sự kiện Khách & Trực tuyến (usage_events & visitor_presence)")
    add_p(doc, "Ghi nhận luồng trải nghiệm khách tham quan và nhịp tim trực tuyến với cơ chế TTL tự dọn dẹp.")
    e_headers = ["Collection", "Tên trường", "Kiểu dữ liệu", "Bắt buộc", "Mô tả & Ràng buộc kỹ thuật"]
    e_data = [
        ["usage_events", "_id", "String", "Có", "Mã sự kiện UUIDv4 duy nhất từ client (chống gửi trùng lặp)."],
        ["usage_events", "visitor_id / journey_id", "String", "Có", "Định danh khách tham quan và định danh phiên hành trình."],
        ["usage_events", "event_type", "String", "Có", "Loại sự kiện: 'visit', 'journey_started', 'audio_played'."],
        ["usage_events", "place_id", "String", "Không", "Mã POI tương ứng nếu là sự kiện nghe thuyết minh."],
        ["usage_events", "day", "String", "Có", "Ngày theo múi giờ ICT: 'YYYY-MM-DD'. Compound Index: (event_type, day)."],
        ["usage_events", "timestamp", "DateTime", "Có", "Thời gian ghi nhận sự kiện (UTC)."],
        ["visitor_presence", "_id", "String", "Có", "Khóa chính visitor_id của trình duyệt khách."],
        ["visitor_presence", "last_seen", "DateTime", "Có", "Thời điểm ping cuối (cập nhật 30s/lần). TTL Index tự xóa sau 180s."]
    ]
    create_styled_table(doc, e_headers, e_data, col_widths=[1.2, 1.5, 1.2, 0.7, 1.9])

    # 6. LỘ TRÌNH PHÁT TRIỂN & CHỈ SỐ THÀNH CÔNG
    add_heading_1(doc, "6. LỘ TRÌNH PHÁT TRIỂN & CHỈ SỐ THÀNH CÔNG")
    add_heading_2(doc, "6.1. Lộ trình triển khai (Product Roadmap)")
    add_bullet(doc, "Hoàn tất nền tảng FastAPI + MongoDB Atlas, xác thực JWT HttpOnly, bảo vệ CSRF HMAC, quản lý tài khoản Admin.", "Giai đoạn 1 (Đã hoàn thành): ")
    add_bullet(doc, "Nhập 10 mô tả nguồn tiếng Việt, 10 file audio nam MP3, kiến trúc CAS revision, GridFS Range streaming.", "Giai đoạn 2 (Đã hoàn thành): ")
    add_bullet(doc, "Tích hợp bản đồ Stadia OSM, 10 tọa độ kiểm chứng thực địa, bản dịch & audio English/Korean cho đủ 10 POI, Dashboard ICT.", "Giai đoạn 3 (Đã nghiệm thu): ")
    add_bullet(doc, "Sinh mã QR tại 10 điểm mốc campus, tối ưu tự phát Safari iOS, đóng gói Offline theo ngôn ngữ vào IndexedDB.", "Giai đoạn 4 (Kế tiếp): ")

    add_heading_2(doc, "6.2. Chỉ số đo lường hiệu quả (KPIs)")
    add_bullet(doc, ">= 85% du khách tiếp tục hành trình sau khi vào màn hình Welcome.", "Tỷ lệ tiếp cận: ")
    add_bullet(doc, "Trung bình du khách nghe tối thiểu 4 trên tổng số 10 địa điểm mốc.", "Độ sâu trải nghiệm: ")
    add_bullet(doc, "Nhận diện đúng địa điểm trong bán kính 30m thực tế đạt >= 90%; tỷ lệ kích hoạt nhầm giữa các tòa nhà <= 5%.", "Độ chính xác Geofence: ")
    add_bullet(doc, "Tỷ lệ lỗi 5xx trên server < 0.1%; giải quyết xung đột đồng thời CAS đạt 100%.", "Độ ổn định hệ thống: ")

    # 7. QUẢN TRỊ RỦI RO
    add_heading_1(doc, "7. QUẢN TRỊ RỦI RO & PHƯƠNG ÁN XỬ LÝ (RISK MANAGEMENT)")
    risk_headers = ["Rủi ro tiềm ẩn", "Mức độ", "Phương án xử lý trong mã nguồn"]
    risk_data = [
        [
            "Safari / iOS chặn tự phát Audio khi vào vùng Geofence",
            "Cao",
            "Duy trì cơ chế Fallback: Hiển thị thanh thông báo nổi để du khách bấm 1 chạm (User Gesture) kích hoạt phát âm thanh."
        ],
        [
            "Sóng GPS chập chờn khi di chuyển qua các dãy nhà cổ",
            "Trung bình",
            "Bộ lọc GeofenceTracker tự động bỏ qua mẫu tọa độ có accuracy > 25m hoặc tuổi > 15s; hỗ trợ chọn nghe thủ công trên danh sách."
        ],
        [
            "Sửa tiếng Việt nhưng chưa cập nhật bản dịch tiếng Anh/Hàn",
            "Trung bình",
            "Backend tự động đối chiếu source_text_sha256; bản dịch không khớp sẽ bị loại khỏi bản phát hành mới cho đến khi Admin sửa lại."
        ],
        [
            "Hai Admin cùng sửa nội dung gây mất dữ liệu",
            "Thấp",
            "Kiểm soát phiên bản bằng CAS revision trên tour document; trả lỗi 409 Conflict bắt buộc tải lại trước khi ghi đè."
        ]
    ]
    create_styled_table(doc, risk_headers, risk_data, col_widths=[2.1, 1.0, 3.4])

    # Save document
    output_dir = "docs"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "PRD_SGU_CAMPUS_GUIDE.docx")
    try:
        doc.save(output_path)
        print(f"Document successfully created at: {output_path}")
    except PermissionError:
        fallback_path = os.path.join(output_dir, "PRD_SGU_CAMPUS_GUIDE_v2.docx")
        doc.save(fallback_path)
        print(f"Original file is open in another program. Successfully saved updated version at: {fallback_path}")

if __name__ == "__main__":
    build_prd()
