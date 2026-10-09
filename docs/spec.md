# TÀI LIỆU ĐẶC TẢ KỸ THUẬT WEB DEMO HỆ THỐNG DBMS330284
> **Hệ thống Quản lý Đăng ký Tín chỉ & Học vụ Đại học**  
> **Phiên bản:** 1.2.0 | **Ngày cập nhật:** 09/10/2026  
> **Kiến trúc:** Node.js (Express) + Vanilla HTML/CSS/JS + Microsoft SQL Server 2022

---

## 1. TỔNG QUAN HỆ THỐNG & NGUYÊN TẮC CỐT LÕI

Hệ thống Web App phục vụ mục tiêu demo toàn diện các tính năng của CSDL **`DBMS330284`** (19 bảng, 6 views, 7 functions, 9 stored procedures, 13 triggers, 4 security roles và hệ thống 19 indexes theo DB specification, >210.000 dòng dữ liệu).

### 5 Nguyên tắc phát triển bắt buộc:
1. **Validate API Input trước khi chạm DB:** Toàn bộ request payload phải được validate chặt chẽ ở tầng middleware; không cho phép request sai định dạng chạy xuống SQL Server.
2. **Response Format chuẩn hóa 100%:** Mọi API (thành công hoặc thất bại) đều dùng một cấu trúc JSON thống nhất kèm HTTP status code ngữ nghĩa.
3. **Phân tầng MVC + Service + Repository:** Controller chỉ điều hướng HTTP; Service xử lý business flow & ánh xạ lỗi; Repository chuyên trách giao tiếp SQL Server (gọi SP/View/Query).
4. **RESTful thực dụng & Tối ưu hiệu năng:** API giữ chuẩn REST ở bề mặt (POST/GET/PATCH/DELETE); bên dưới gọi trực tiếp các Stored Procedure, View, Function có sẵn; tận dụng Connection Pool và Index; tính toán sĩ số động từ `DANGKYTINCHI`.
5. **Đặc tả & API trước, Giao diện sau:** Xây dựng nền tảng API vững chắc, có kiểm thử TDD (Red-Green-Refactor) trước khi ghép UI. Giao diện thực dụng, tinh gọn, chuẩn Cổng học vụ Đại học, không rườm rà (Anti AI-slop).

---

## 2. CẤU TRÚC DỰ ÁN (PROJECT STRUCTURE)

```text
ProjectDBMS/
├── DB/                          # 14 file SQL/MD chuẩn nguồn sự thật CSDL
├── docs/
│   └── spec.md                  # Bản đặc tả kỹ thuật này
├── backend/                     # Backend Node.js / Express
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js            # mssql Connection Pool cấu hình sẵn timeout/retry
│   │   ├── utils/
│   │   │   ├── apiResponse.js   # Helper đóng gói response chuẩn
│   │   │   └── errorMapper.js   # Translation layer ánh xạ mã lỗi SQL sang tiếng Việt
│   │   ├── middlewares/
│   │   │   ├── validate.middleware.js # Middleware validate schema (Zod)
│   │   │   ├── auth.middleware.js     # Xác thực JWT token & kiểm tra Role
│   │   │   └── errorHandler.middleware.js # Global error handler
│   │   ├── validators/
│   │   │   ├── auth.validator.js
│   │   │   ├── course.validator.js
│   │   │   ├── registration.validator.js
│   │   │   └── payment.validator.js
│   │   ├── repositories/
│   │   │   ├── admin.repository.js
│   │   │   ├── auth.repository.js
│   │   │   ├── class.repository.js
│   │   │   ├── course.repository.js
│   │   │   ├── faculty.repository.js
│   │   │   ├── lecturer.repository.js
│   │   │   ├── registration.repository.js
│   │   │   ├── semester.repository.js
│   │   │   ├── student.repository.js
│   │   │   └── tuition.repository.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── class.service.js
│   │   │   ├── course.service.js
│   │   │   ├── lecturer.service.js
│   │   │   ├── registration.service.js
│   │   │   ├── student.service.js
│   │   │   └── tuition.service.js
│   │   ├── controllers/
│   │   │   ├── admin.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── class.controller.js
│   │   │   ├── course.controller.js
│   │   │   ├── faculty.controller.js
│   │   │   ├── health.controller.js
│   │   │   ├── lecturer.controller.js
│   │   │   ├── registration.controller.js
│   │   │   ├── semester.controller.js
│   │   │   ├── student.controller.js
│   │   │   └── tuition.controller.js
│   │   ├── routes/
│   │   │   ├── admin.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── class.routes.js
│   │   │   ├── course.routes.js
│   │   │   ├── faculty.routes.js
│   │   │   ├── health.routes.js
│   │   │   ├── lecturer.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── registration.routes.js
│   │   │   ├── semester.routes.js
│   │   │   ├── student.routes.js
│   │   │   └── index.js
│   │   └── app.js               # Khởi tạo Express app & gắn route
│   ├── tests/                   # 22 Test Suites Jest tự động hóa 100%
│   ├── scripts/
│   │   └── migrate_payment_confirmation.js # Script migrate xác nhận 2 bước
│   ├── package.json
│   └── .env
└── frontend/                    # Giao diện HTML/CSS/JS thuần thực dụng
    ├── css/
    │   └── styles.css           # Design tokens, màu Slate/Navy học vụ
    ├── js/
    │   ├── api.js               # Fetch client bọc API response
    │   ├── auth.js              # Quản lý đăng nhập, Quick Login, Session
    │   ├── registration.js      # Xử lý tương tác đăng ký môn
    │   └── tuition.js           # Xử lý tra cứu & nộp học phí
    ├── index.html               # Trang đăng nhập & bảng Quick Login demo
    ├── portal-student.html      # Cổng Sinh viên: ĐK tín chỉ, TKB, Bảng điểm, Học phí
    ├── portal-lecturer.html     # Cổng Giảng viên: Lịch dạy, Sổ điểm lớp học phần
    └── portal-admin.html        # Cổng Đào tạo / Quản trị: 9 phân hệ điều hành
```

---

## 3. QUY CHUẨN API & FORMAT DỮ LIỆU

### 3.1. Thống nhất Response Envelope
Mọi endpoint đều trả về theo định dạng duy nhất:

#### Thành công (Success):
```json
{
  "isSuccess": true,
  "data": { ... },
  "errors": []
}
```

#### Thất bại (Failure):
```json
{
  "isSuccess": false,
  "data": null,
  "errors": [
    {
      "field": "maLHP",
      "message": "Lớp học phần không tồn tại hoặc đã đóng đăng ký."
    }
  ]
}
```

### 3.2. Chuẩn phân trang (Pagination Envelope)
Áp dụng cho mọi API trả về danh sách có số lượng lớn:
```json
{
  "isSuccess": true,
  "data": {
    "items": [ ... ],
    "page": 1,
    "pageSize": 10,
    "totalItems": 84,
    "totalPages": 9
  },
  "errors": []
}
```

### 3.3. HTTP Status Codes ngữ nghĩa
- **`200 OK`**: Truy vấn hoặc cập nhật thành công.
- **`201 Created`**: Tạo mới bản ghi thành công (Đăng ký tín chỉ, Tạo tài khoản, Thanh toán học phí).
- **`400 Bad Request`**: Dữ liệu gửi lên sai định dạng, thiếu trường bắt buộc (bắt bởi Validator).
- **`401 Unauthorized`**: Chưa đăng nhập hoặc thông tin đăng nhập không chính xác.
- **`403 Forbidden`**: Đã đăng nhập nhưng Role không có quyền truy cập endpoint (VD: Sinh viên gọi báo cáo Đào tạo).
- **`404 Not Found`**: Không tìm thấy tài nguyên (Sinh viên, Lớp học phần, Học kỳ).
- **`409 Conflict`**: Xung đột nghiệp vụ CSDL (Trùng lịch học, Trùng môn tiên quyết, Đã đủ sĩ số tối đa, Đã có học phí).
- **`500 Internal Server Error`**: Lỗi kết nối CSDL hoặc lỗi hệ thống không kiểm soát.

---

## 4. BẢNG TRANSLATION LAYER: ÁNH XẠ MÃ LỖI SQL THỰC TẾ SANG API

Hệ thống bắt chính xác mã lỗi `THROW` từ `05_Triggers.md` và `08_StoredProcedures.md` để chuyển thành thông báo nghiệp vụ tiếng Việt dễ hiểu, gán đúng `field` và HTTP code tương ứng:

| Mã lỗi SQL | Nguồn phát sinh | HTTP Status | Field | Thông báo người dùng (User Message) |
| :---: | :--- | :---: | :--- | :--- |
| **50001** | `SP_DangKyTinChi` | `404` | `maSV` | Sinh viên không tồn tại trong hệ thống. |
| **50002** | `SP_DangKyTinChi` | `409` | `maSV` | Sinh viên không ở trạng thái Đang học (có thể đang Bảo lưu hoặc Thôi học). |
| **50003** | `SP_DangKyTinChi` | `403` | `taiKhoan` | Tài khoản sinh viên hiện đang bị khóa hoặc vô hiệu hóa. |
| **50004** | `SP_DangKyTinChi` | `404` | `maLHP` | Lớp học phần không tồn tại trong hệ thống. |
| **50005** | `SP_DangKyTinChi` | `409` | `maLHP` | Lớp học phần hiện không mở đăng ký. |
| **50006** | `SP_DangKyTinChi` | `409` | `thoiGian` | Hiện không nằm trong khoảng thời gian mở đăng ký tín chỉ của học kỳ. |
| **50007** | `SP_DangKyTinChi` | `409` | `maMonHoc` | Sinh viên đã đăng ký môn học này trong học kỳ hiện tại. |
| **50008** | `SP_DangKyTinChi` | `409` | `tienQuyet` | Sinh viên chưa hoàn thành môn tiên quyết bắt buộc của môn học này. |
| **50009** | `SP_DangKyTinChi` | `409` | `lichHoc` | Lịch học của lớp này bị trùng với thời khóa biểu đã đăng ký của bạn. |
| **50010** | `SP_DangKyTinChi` | `409` | `tinChi` | Vượt quá số tín chỉ tối đa được phép đăng ký trong học kỳ. |
| **50011** | `SP_DangKyTinChi` | `409` | `siSo` | Lớp học phần đã đủ sĩ số tối đa (hết chỗ). |
| **50021** | `SP_HuyDangKy` | `404` | `maDangKy` | Không tìm thấy đăng ký học phần hợp lệ để hủy. |
| **50022** | `SP_HuyDangKy` | `409` | `thoiGian` | Đã hết thời hạn đăng ký hoặc hủy học phần trong học kỳ. |
| **50023** | `SP_HuyDangKy` | `409` | `diemSo` | Không thể hủy học phần vì sinh viên đã có điểm thành phần trong hệ thống. |
| **50014** | `SP_TinhHocPhiSinhVien` | `409` | `hocPhi` | Sinh viên đã có hồ sơ học phí trong học kỳ này. |
| **50017** | `SP_TinhHocPhiSinhVien` | `409` | `tinChi` | Sinh viên không có tín chỉ hợp lệ nào trong học kỳ để tính học phí. |
| **51001** | `TR_MONHOCTIENQUYET` | `409` | `chuTrinh` | Không thể thiết lập môn tiên quyết do tạo thành chu trình phụ thuộc vòng lặp. |
| **51002** | `TR_DANGKYTINCHI_KiemTraSiSo` | `409` | `siSo` | Lớp học phần đã đạt ngưỡng sĩ số tối đa cho phép. |
| **51004** | `TR_MUCHOCPHI_KiemTraHieuLuc` / `SP_TaoTaiKhoan` | `409` | `mucHocPhi` / `vaiTro` | Mức học phí bị trùng thời gian hiệu lực / Vai trò tài khoản không tương thích với liên kết người dùng. |
| **51005** | `TR_MUCHOCPHI_KiemTraHieuLuc` / `SP_TaoTaiKhoan` | `409` / `404` | `phamVi` / `maSV` | Chỉ hỗ trợ phạm vi TOAN_TRUONG / Không tìm thấy mã sinh viên hoặc giảng viên liên kết. |
| **51006** | `TR_CHITIETTHANHTOAN_CapNhatHocPhi`| `409` | `soTien` | Tổng số tiền thanh toán không được vượt quá số dư học phí còn lại. *(Ngữ cảnh: PAYMENT)* |
| **51006** | `SP_TaoTaiKhoan` | `409` | `username` | Tên đăng nhập đã tồn tại trong hệ thống. *(Ngữ cảnh: CREATE_USER)* |
| **51007** | `TR_LOP_KiemTraXoa` / `SP_TaoTaiKhoan` | `409` | `maLop` / `maSV` | Không thể xóa lớp sinh hoạt đang có sinh viên trực thuộc / Sinh viên đã được liên kết tài khoản khác. |
| **51008** | `SP_TaoTaiKhoan` / `SP_ThongKeHocPhiTheoLop` | `409` / `404` | `maGV` / `maLop` | Giảng viên đã được liên kết với tài khoản khác / Không tìm thấy lớp sinh hoạt được yêu cầu. |
| **51009** | `SP_KhoaTaiKhoan` | `400` | `maTaiKhoan` | Mã tài khoản không được để trống khi thực hiện khóa tài khoản. |
| **51010** | `SP_KhoaTaiKhoan` | `404` | `maTaiKhoan` | Không tìm thấy tài khoản người dùng cần thao tác. |
| **51310** | `TR_LICHHOC_KiemTraTrungLich` | `409` | `phongHoc` | Lịch học bị trùng giảng viên hoặc trùng phòng học trong cùng khung giờ. |
| **51401** | `SP_XacNhanThanhToan` / `SP_TuChoiThanhToan` | `404` | `maThanhToan` | Giao dịch thanh toán không tồn tại trong hệ thống. |
| **51402** | `SP_XacNhanThanhToan` | `409` | `trangThai` | Giao dịch thanh toán đã được xác nhận trước đó. |
| **51403** | `SP_XacNhanThanhToan` | `409` | `trangThai` | Không thể xác nhận giao dịch thanh toán đã bị từ chối. |
| **51404** | `SP_XacNhanThanhToan` / `SP_TuChoiThanhToan` | `403` | `taiKhoan` | Tài khoản không có quyền xác nhận hoặc từ chối thanh toán. |
| **51405** | `SP_XacNhanThanhToan` / `SP_TuChoiThanhToan` | `409` | `trangThai` | Chỉ có thể thao tác với giao dịch đang ở trạng thái chờ xác nhận. |

> **Lưu ý kỹ thuật cho `errorMapper.js`:** CSDL thực tế có một số mã lỗi `THROW` được dùng chung giữa các Trigger và Stored Procedure (như `51004`, `51005`, `51006`, `51007`, `51008`). Tầng Backend `errorMapper(error, context)` sử dụng tham số `context` (ví dụ: `'PAYMENT'`, `'CREATE_USER'`, `'CLASS'`, `'TUITION_RATE'`) để phân biệt ngữ cảnh nghiệp vụ, ánh xạ chính xác `field` và thông báo lỗi tương ứng sang HTTP response mà không làm thay đổi mã lỗi đã triển khai trên SQL Server.

---

## 5. DANH SÁCH CHI TIẾT ENDPOINTS API

### 5.1. Nhóm Health & System
- **`GET /api/health`**
  - **Mô tả:** Kiểm tra Node.js web server đang chạy độc lập (không gọi DB).
  - **Status:** `200 OK`
  - **Response:** `{ "status": "UP", "timestamp": "..." }`
- **`GET /api/health/db`**
  - **Mô tả:** Kiểm tra kết nối Connection Pool đến SQL Server `DBMS330284` qua query `SELECT @@VERSION`.
  - **Status:** `200 OK` / `500 Internal Server Error`

### 5.2. Nhóm Authentication & Profile
- **`POST /api/auth/login`**
  - **Body:** `{ "username": "string", "password": "string" }`
  - **Xử lý:** 
    1. Validator kiểm tra không rỗng.
    2. Băm `password` bằng đúng chuẩn SHA-256 chữ thường (`crypto.createHash('sha256').update(password).digest('hex')`) để khớp 100% với giá trị `PasswordHash` trong `DB/04_SeedData.sql` (VD: `123456` -> `8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92`); không tự ý đổi thuật toán hoặc format hash.
    3. Truy vấn bảng `TAIKHOAN` theo `Username` + `PasswordHash` + `TrangThai = 'ACTIVE'`.
    4. Trả thông tin phiên đăng nhập kèm thông tin `SINHVIEN` hoặc `GIANGVIEN` tương ứng. **Tuyệt đối không trả `PasswordHash` về client.**
  - **Status:** `200 OK` (Thành công) | `401 Unauthorized` (Sai tài khoản/mật khẩu hoặc tài khoản bị khóa).
- **`GET /api/auth/me`**
  - **Mô tả:** Lấy thông tin tài khoản hiện tại từ phiên đăng nhập.

### 5.3. Nhóm Tra cứu Lớp học phần (Đăng ký tín chỉ)
- **`GET /api/courses/available`**
  - **Query:** `?maHocKy=7&maKhoa=CNTT&search=CSDL&type=ALL&page=1&pageSize=10`
  - **Xử lý DB:**
    ```sql
    -- 1. Query lấy tổng số bản ghi khớp bộ lọc
    SELECT COUNT(*) AS TotalItems
    FROM dbo.LOPHOCPHAN lhp
    INNER JOIN dbo.MONHOC mh ON lhp.MaMonHoc = mh.MaMonHoc
    WHERE lhp.MaHocKy = @MaHocKy AND lhp.TrangThai = 'MO_DANG_KY';

    -- 2. Query lấy dữ liệu phân trang (JOIN chính xác gv.MaGV)
    SELECT 
        lhp.MaLHP, lhp.TenLHP, lhp.MaMonHoc, mh.TenMonHoc, mh.SoTinChi,
        lhp.SoLuongToiDa,
        ISNULL(dk.SiSoHienTai, 0) AS SiSoHienTai, -- Sĩ số tính toán động trong query
        gv.HoTen AS TenGiangVien,
        lh.Thu, lh.TietBatDau, lh.SoTiet, lh.PhongHoc
    FROM dbo.LOPHOCPHAN lhp
    INNER JOIN dbo.MONHOC mh ON lhp.MaMonHoc = mh.MaMonHoc
    LEFT JOIN dbo.GIANGVIEN gv ON lhp.MaGiangVien = gv.MaGV -- Khóa ngoại INT tham chiếu MaGV kỹ thuật
    LEFT JOIN dbo.LICHHOC lh ON lhp.MaLHP = lh.MaLHP
    OUTER APPLY (
        SELECT COUNT(*) AS SiSoHienTai
        FROM dbo.DANGKYTINCHI d
        WHERE d.MaLHP = lhp.MaLHP AND d.TrangThai = 'REGISTERED'
    ) dk
    WHERE lhp.MaHocKy = @MaHocKy AND lhp.TrangThai = 'MO_DANG_KY'
    ORDER BY lhp.MaLHP
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
    ```
  - **Lưu ý nghiệp vụ:** `SiSoHienTai` là giá trị **tính toán động trong query**, tuyệt đối **không phải cột vật lý của bảng `LOPHOCPHAN`** (CSDL chuẩn 3NF không lưu sĩ số tĩnh để bảo toàn tính toàn vẹn dữ liệu). Sĩ số được tính động từ `DANGKYTINCHI WHERE TrangThai = 'REGISTERED'`.

### 5.4. Nhóm Giao dịch Đăng ký Tín chỉ (Core Transaction)
- **`POST /api/registrations`**
  - **Body:** `{ "maLHP": "LHP_HK7_CSDL_01" }`
  - **Bảo mật & Phân quyền (Security Enforcement):**
    - `maSV`: Trích xuất trực tiếp từ token JWT xác thực (`req.user.maSV` đối với vai trò `SINH_VIEN`). Không cho phép sinh viên tự truyền `maSV` khác từ body để ngăn chặn đăng ký hộ hoặc giả mạo người khác (IDOR protection).
    - `tinChiToiDa`: Do hệ thống/học kỳ ấn định cố định (mặc định 24-25 tín chỉ), không cho phép client tùy ý nâng hạn mức.
  - **Xử lý DB:** Gọi Stored Procedure **`SP_DangKyTinChi`**.
  - **Status:** `201 Created` nếu thành công; `409 Conflict` nếu vi phạm ràng buộc (bắt mã lỗi 50001–50011 qua Translation Layer).
- **`DELETE /api/registrations/:id`** (với `:id` là `maDangKy`)
  - **Xử lý DB:** Lấy thông tin đăng ký và gọi Stored Procedure **`SP_HuyDangKy`**.
  - **Status:** `200 OK` | `409 Conflict` (Mã 50021–50023).
- **`GET /api/registrations/my-courses`**
  - **Query:** `?maHocKy=7`
  - **Mô tả:** Lấy danh sách lớp học phần sinh viên đang đăng nhập đã đăng ký trong học kỳ.

### 5.5. Nhóm Học vụ Sinh viên (Views & Báo cáo)
- **Bảo mật truy cập (IDOR Defense):** Toàn bộ các route `/api/students/:id/...` kiểm tra tham số `:id` phải khớp với `req.user.maSV` trong JWT token, trừ khi người dùng có vai trò `DAO_TAO` hoặc `QUAN_TRI`.
- **`GET /api/students/:id/schedule`**
  - **Query:** `?maHocKy=7`
  - **Xử lý DB:** `SELECT * FROM dbo.V_ThoiKhoaBieuSinhVien WHERE MaSV = @MaSV AND (@MaHocKy IS NULL OR MaHocKy = @MaHocKy);`
- **`GET /api/students/:id/grades`**
  - **Query:** `?maHocKy=7`
  - **Xử lý DB:** `SELECT * FROM dbo.V_BangDiemChiTiet WHERE MaSV = @MaSV AND (@MaHocKy IS NULL OR MaHocKy = @MaHocKy) ORDER BY MaHocKy, MaMonHoc;`
- **`GET /api/students/:id/tuition`**
  - **Xử lý DB:** `SELECT * FROM dbo.V_HocPhiSinhVien WHERE MaSV = @MaSV ORDER BY MaHocKy DESC;`
- **`GET /api/students/:id/payments`**
  - **Query:** `?page=1&pageSize=10`
  - **Mô tả:** Lịch sử chi tiết các lần nộp học phí của sinh viên (kèm trạng thái xác nhận và học kỳ).
- **`GET /api/students/:id/profile`**
  - **Mô tả:** Hồ sơ sinh viên, thông tin Lớp sinh hoạt, Khoa, niên khóa và tài khoản.

### 5.6. Nhóm Thanh toán Học phí (Cơ chế Xác nhận 2 bước)
- **`POST /api/payments`**
  - **Mô tả:** Sinh viên tạo yêu cầu nộp học phí. Giao dịch ban đầu được tạo ở trạng thái `CHO_XAC_NHAN`. Hệ thống chưa tự động tăng `HOCPHI.SoTienDaThanhToan`.
  - **Bảo mật:** Kiểm tra hồ sơ học phí `maHocPhi` thuộc đúng sinh viên đang đăng nhập (`hp.MaSV = req.user.maSV`).
  - **Body:** `{ "maHocPhi": 123, "soTien": 4500000.00, "phuongThuc": "CHUYEN_KHOAN" }` (Phương thức: `CHUYEN_KHOAN` hoặc `TIEN_MAT`).
  - **Xử lý DB:** `INSERT INTO dbo.CHITIETTHANHTOAN (MaHocPhi, SoTien, PhuongThuc, TrangThai) VALUES (@MaHocPhi, @SoTien, @PhuongThuc, 'CHO_XAC_NHAN')`.
  - **Status:** `201 Created` | `409 Conflict` (Nếu số tiền nộp vượt mức dư còn lại hoặc sai constraint).
- **`GET /api/payments/pending`**
  - **Mô tả:** Lấy danh sách giao dịch nộp học phí đang ở trạng thái `CHO_XAC_NHAN`.
  - **Quyền:** Chỉ `DAO_TAO` hoặc `QUAN_TRI`.
  - **Status:** `200 OK` | `403 Forbidden`.
- **`POST /api/payments/:id/confirm`**
  - **Mô tả:** Xác nhận giao dịch thanh toán thành công. Gọi Stored Procedure `SP_XacNhanThanhToan` trong transaction, chuyển `TrangThai = 'DA_XAC_NHAN'`, lưu `MaTaiKhoanXacNhan` và `NgayXacNhan`. Trigger `TR_CHITIETTHANHTOAN_CapNhatHocPhi` kích hoạt để cộng tiền vào `HOCPHI.SoTienDaThanhToan` và đổi trạng thái sang `PARTIAL` hoặc `PAID`.
  - **Quyền:** Chỉ `DAO_TAO` hoặc `QUAN_TRI`. Chặn sinh viên và giảng viên.
  - **Status:** `200 OK` | `403 Forbidden` | `404 Not Found` | `409 Conflict` (Nếu đã xác nhận hoặc đã bị từ chối trước đó).
- **`POST /api/payments/:id/reject`**
  - **Mô tả:** Từ chối giao dịch thanh toán. Gọi Stored Procedure `SP_TuChoiThanhToan`, chuyển `TrangThai = 'TU_CHOI'`. Khoản tiền này không bao giờ được tính vào học phí.
  - **Quyền:** Chỉ `DAO_TAO` hoặc `QUAN_TRI`.
  - **Status:** `200 OK` | `403 Forbidden` | `404 Not Found` | `409 Conflict`.

### 5.7. Nhóm Endpoint Quản trị, Giảng viên & Danh mục
- **`GET /api/admin/dashboard`**: Thống kê số lượng sinh viên, giảng viên, lớp học phần mở, tỷ lệ thu học phí và số giao dịch chờ duyệt.
- **`GET /api/admin/reports/tuition`**: Báo cáo thống kê tài chính học phí theo học kỳ (gọi Stored Procedure `SP_ThongKeHocPhi`).
- **`GET /api/admin/users`**: Quản lý danh sách tài khoản người dùng từ View `V_TaiKhoanNguoiDung`.
- **`PATCH /api/admin/users/:username/status`**: Khóa / kích hoạt tài khoản người dùng (gọi Stored Procedure `SP_KhoaTaiKhoan`).
- **`GET /api/admin/students`**: Danh sách sinh viên toàn trường kèm thông tin Lớp sinh hoạt và Khoa.
- **`GET /api/admin/classes`**: Danh sách tất cả lớp học phần đang mở và sĩ số động.
- **`GET /api/admin/registrations`**: Tra cứu toàn bộ giao dịch đăng ký tín chỉ của sinh viên.
- **`GET /api/admin/audit-logs`**: Nhật ký kiểm toán bảo mật từ bảng `LOGHOATDONG` (chỉ role `QUAN_TRI`).
- **`GET /api/admin/curriculums`**: Khung chương trình đào tạo từ View `V_CauTrucChuongTrinhDaoTao`.
- **`GET /api/lecturers/:id/schedule`**: Lịch giảng dạy theo tuần của Giảng viên.
- **`GET /api/lecturers/:id/classes`**: Danh sách các lớp học phần Giảng viên đang phụ trách.
- **`GET /api/lecturers/classes/:maLHP/students`**: Danh sách sinh viên và bảng điểm thành phần của lớp học phần.
- **`GET /api/classes`**: Danh sách 36 lớp sinh hoạt niên chế kèm sĩ số từ View `V_DanhSachLopSinhHoat`.
- **`GET /api/classes/:id`**: Chi tiết lớp sinh hoạt và danh sách sinh viên trực thuộc.
- **`GET /api/classes/:id/tuition-report`**: Thống kê học phí theo lớp sinh hoạt (gọi `SP_ThongKeHocPhiTheoLop`).
- **`GET /api/faculties`**: Danh mục các khoa trong trường.
- **`GET /api/semesters`**: Danh mục các năm học và học kỳ.
- **`GET /api/semesters/open`**: Lấy học kỳ đang mở đăng ký tín chỉ hiện tại.

---

## 6. QUY TRÌNH KIỂM THỬ TDD (VERTICAL SLICES WORKFLOW)

Triển khai từng Slice độc lập theo vòng lặp **Red → Green → Refactor**:

```
[RED] Viết 1 Test kiểm tra hành vi đầu cuối qua HTTP interface → Test thất bại
  ↓
[GREEN] Viết mã nguồn tối thiểu (Route → Controller → Service → Repo) → Test thành công
  ↓
[REFACTOR] Tối ưu hóa code, cấu trúc, đặt biến → Đảm bảo Test vẫn xanh
  ↓
Lặp lại với hành vi/nghiệp vụ tiếp theo
```

### Chi tiết các Vertical Slices:
1. **Slice 1 (App Health):** Test `GET /api/health` trả về `{ isSuccess: true, data: { status: "UP" } }` mà không cần gọi DB.
2. **Slice 2 (DB Health):** Test `GET /api/health/db` kiểm tra mssql pool kết nối thành công đến `DBMS330284`.
3. **Slice 3 (Authentication):** Test `POST /api/auth/login` với tài khoản thật (`admin`, `123456`) -> 200 OK; tài khoản sai mật khẩu -> 401 Unauthorized; tài khoản bị khóa (`sv_23000495` trạng thái `LOCKED`) -> 403 Forbidden (theo test `auth.test.js` thực tế) / 401 Unauthorized (theo chuẩn từ chối đăng nhập).
4. **Slice 4 (Available Courses with Sĩ số):** Test `GET /api/courses/available` trả về cấu trúc phân trang chuẩn, có tính `SiSoHienTai` động từ bảng `DANGKYTINCHI`.
5. **Slice 5 (Registration Validation):** Test `POST /api/registrations` thiếu trường bắt buộc `maLHP` (hoặc thiếu `maSV` khi gọi trực tiếp không kèm token) trả về `400 Bad Request` kèm `{ field: "maLHP" / "maSV", message: "..." }`.
6. **Slice 6 (Registration Core & Errors):**
   - Test case thành công: Đăng ký môn hợp lệ trả về `201 Created`.
   - Test case trùng lịch: Bắt mã `50009` trả về `409 Conflict`.
   - Test case thiếu tiên quyết: Bắt mã `50008` trả về `409 Conflict`.
7. **Slice 7 (Cancellation):** Test `DELETE /api/registrations/:id` thành công và case không tìm thấy môn trả về `404 Not Found`.
8. **Slice 8 (Payment & 2-Step Confirmation Flow):** Test flow thanh toán xác nhận 2 bước: `POST /api/payments` tạo payment mới ở trạng thái `CHO_XAC_NHAN` (`HOCPHI.SoTienDaThanhToan` chưa tăng); chỉ khi gọi `POST /api/payments/:id/confirm` (bởi `DAO_TAO` hoặc `QUAN_TRI`) thì `HOCPHI.SoTienDaThanhToan` mới tự động cộng dồn qua Trigger và `HOCPHI.TrangThai` chuyển sang `PARTIAL` hoặc `PAID`.

---

## 7. ĐẶC TẢ GIAO DIỆN THỰC DỤNG (UI/UX SPECIFICATION)

### 7.1. Định hướng thị giác (Visual Direction)
- **Phong cách:** Cổng thông tin Đào tạo Đại học (Academic Portal) tối giản, hiện đại, mật độ thông tin cao nhưng thoáng đãng, tập trung vào khả năng thao tác nhanh của người dùng.
- **Không dùng AI-slop:** Tránh gradient màu tím neon, tránh hiệu ứng đổ bóng mờ nhòe (glow), tránh hoạt ảnh kéo rê thừa thãi làm chậm tương tác.

### 7.2. Design Tokens
- **Màu sắc chủ đạo (Palette):**
  - `Primary Navy`: `#1E3A8A` (Thanh điều hướng, nút hành động chính, nhận diện trường).
  - `Surface / Background`: `#F8FAFC` (Slate-50, nền trang), `#FFFFFF` (Card nền trắng).
  - `Border / Divider`: `#E2E8F0` (Slate-200, đường kẻ bảng phân cách sắc nét).
  - `Text Primary`: `#0F172A` (Slate-900, tiêu đề và số liệu).
  - `Text Secondary`: `#475569` (Slate-600, nhãn và mô tả).
  - `Status Badge`:
    - `Success`: Nền `#DCFCE7`, chữ `#166534` (Đạt môn, Đã đóng đủ).
    - `Warning`: Nền `#FEF3C7`, chữ `#92400E` (Đóng một phần, Chờ thanh toán).
    - `Danger`: Nền `#FEE2E2`, chữ `#991B1B` (Rớt môn, Nợ học phí, Trùng lịch, Hết chỗ).
- **Typography:** Font hệ thống (`system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`) tải nhanh tức thì, không phụ thuộc Google Fonts ngoài mạng.
- **Bố cục:** Desktop-first (độ rộng container 1280px), thanh Header cố định hiển thị học kỳ hiện tại (`2025-2026 HK1 / Học kỳ 7`) và thông tin người dùng đăng nhập.

### 7.3. Tính năng "Quick Login Demo" (Thay thế Role Switcher)
Tại màn hình đăng nhập (`index.html`), cung cấp bảng **Quick Login Presets** với các kịch bản demo điển hình (đã đối chiếu khớp 100% với `DANH_SACH_TAI_KHOAN_TEST.md` và `DB/04_SeedData.sql`):
- Nút **"Sinh viên Khóa 23 (Đang học)"**: Tự động điền `sv_23000001` / `123456` (Role `SINH_VIEN`, `TrangThai = 'ACTIVE'`).
- Nút **"Sinh viên Nợ học phí"**: Tự động điền `sv_23000005` / `123456` (Role `SINH_VIEN`, `TrangThai = 'ACTIVE'`, có hồ sơ học phí `UNPAID`/`PARTIAL`).
- Nút **"Sinh viên Bảo lưu (LOCKED)"**: Tự động điền `sv_23000495` / `123456` (Role `SINH_VIEN`, `TrangThai = 'LOCKED'` — kiểm chứng kịch bản bị từ chối đăng nhập / báo lỗi tài khoản bị khóa).
- Nút **"Giảng viên CNTT"**: Tự động điền `gv_gv0001` / `123456` (Role `GIANG_VIEN`, `TrangThai = 'ACTIVE'`).
- Nút **"Phòng Đào tạo"**: Tự động điền `daotao01` / `123456` (Role `DAO_TAO`, `TrangThai = 'ACTIVE'`).
- Nút **"Quản trị viên"**: Tự động điền `admin` / `123456` (Role `QUAN_TRI`, `TrangThai = 'ACTIVE'`).

> **Nguyên tắc an toàn:** Nút bấm chỉ hỗ trợ điền nhanh thông tin vào form đăng nhập. Toàn bộ quá trình đăng nhập vẫn gửi qua `POST /api/auth/login` để Backend xác thực mật khẩu thật trong bảng `TAIKHOAN`. Mọi tài khoản test đều có mật khẩu gốc là `123456` và chuỗi SHA-256 hash chuẩn là `8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92`.

### 7.4. Các màn hình chính (Screens Specification)

#### Màn hình 1: Đăng nhập (`index.html`)
- Form đăng nhập chuẩn mực (Username, Password, nút Đăng nhập).
- Panel bên phải chứa bảng "Quick Login Demo" để giáo viên/người chấm thi có thể bấm 1-click để trải nghiệm ngay mọi role mà không cần nhớ tài khoản.

#### Màn hình 2: Cổng Sinh viên (`portal-student.html`)

Bao gồm 7 phân hệ màn hình chức năng chính:

1. **Dashboard / Tổng quan**
   - Thông tin sinh viên (Họ tên, MSSV, Khóa, Ngành/Khoa, Lớp sinh hoạt).
   - Học kỳ hiện tại (2025-2026 HK1 / Học kỳ 7).
   - GPA / kết quả học tập tích lũy.
   - Số tín chỉ đã đăng ký trong học kỳ hiện tại.
   - Tổng học phí và trạng thái thanh toán (UNPAID / PARTIAL / PAID).
   - Các thông báo hoặc trạng thái quan trọng (Tình trạng học vụ, hạn đóng học phí).

2. **Đăng ký học phần**
   - Danh sách lớp học phần có thể đăng ký (kèm phân trang).
   - Tìm kiếm / lọc môn học theo từ khóa, lọc theo khoa/bộ môn.
   - Hiển thị đầy đủ: Số tín chỉ, Giảng viên phụ trách, Lịch học và phòng học.
   - Sĩ số hiện tại / sức chứa (tính toán động qua `OUTER APPLY` từ `DANGKYTINCHI`).
   - Trạng thái đăng ký và tiến độ lấp đầy chỗ (Progress bar trực quan).
   - Thao tác: Đăng ký học phần / Hủy đăng ký học phần đã chọn.
   - Hiển thị lỗi nghiệp vụ từ SQL Server (Trùng lịch, thiếu môn tiên quyết, vượt tín chỉ tối đa, lớp hết chỗ).

3. **Thời khóa biểu**
   - Hiển thị lịch học trực quan theo tuần (Thứ 2 đến Thứ 7 / Chủ nhật, Tiết 1 đến Tiết 10/12).
   - Chi tiết từng ô lịch: Tên môn, Lớp học phần, Phòng học và Giảng viên.
   - Cho phép lọc/chuyển học kỳ tra cứu.

4. **Kết quả học tập**
   - Trích xuất dữ liệu từ View `V_BangDiemChiTiet`.
   - Danh sách môn đã học kèm lọc theo học kỳ.
   - Điểm thành phần: Điểm quá trình (QT), Điểm giữa kỳ (GK), Điểm cuối kỳ (CK).
   - Tỷ trọng các điểm thành phần, Điểm tổng kết hệ 10, Điểm chữ hệ 4.
   - Kết quả: ĐẠT / KHÔNG ĐẠT.

5. **Học phí**
   - Trích xuất dữ liệu từ View `V_HocPhiSinhVien`.
   - Chi tiết từng học kỳ: Tổng học phí phải nộp, Đơn giá tín chỉ, Số tín chỉ đăng ký.
   - Số tiền đã thanh toán thực tế (Chỉ tính các giao dịch `DA_XAC_NHAN`).
   - Số tiền còn lại phải nộp.
   - Trạng thái công nợ: `UNPAID` / `PARTIAL` / `PAID`.
   - Lịch sử các giao dịch thanh toán của sinh viên.

6. **Thanh toán**
   - Tạo yêu cầu nộp học phí trực tuyến (chuyển khoản, tiền mặt).
   - Hiển thị danh sách giao dịch đang ở trạng thái `CHO_XAC_NHAN`.
   - Hiển thị giao dịch đã duyệt `DA_XAC_NHAN` hoặc bị từ chối `TU_CHOI`.
   - Nghiệp vụ bảo mật: Tuyệt đối không cho phép sinh viên tự chuyển trạng thái xác nhận thanh toán.

7. **Thông tin tài khoản**
   - Thông tin cá nhân sinh viên, email, số điện thoại, ngày tạo.
   - Username tài khoản đăng nhập.
   - Trạng thái tài khoản (ACTIVE / LOCKED).
   - Đăng xuất an toàn khỏi phiên làm việc.

#### Màn hình 3: Cổng Đào tạo & Quản trị (`portal-admin.html`)

Bao gồm 9 phân hệ màn hình chức năng chính:

1. **Dashboard / Tổng quan**
   - Thống kê tổng số lượng sinh viên toàn trường và theo khoa.
   - Thống kê lớp học phần đang mở trong học kỳ.
   - Thống kê tình hình đăng ký tín chỉ.
   - Thống kê tài chính học phí (Tổng phải thu, Đã thu, Tồn đọng).
   - Số lượng giao dịch nộp học phí đang chờ xác nhận (`CHO_XAC_NHAN`).

2. **Quản lý sinh viên**
   - Tìm kiếm sinh viên theo MSSV, Họ tên, Lớp.
   - Xem chi tiết hồ sơ sinh viên: Khoa, Ngành, Khóa học, CTĐT.
   - Xem tình trạng đăng ký học phần và công nợ học phí của sinh viên.

3. **Quản lý lớp học phần**
   - Danh sách lớp học phần theo học kỳ.
   - Thông tin môn học, Giảng viên giảng dạy, Lịch học, Phòng học.
   - Sĩ số hiện tại / Sức chứa tối đa.
   - Trạng thái lớp (`MO_DANG_KY`, `DANG_MO`, `DA_KHOA`, `DA_HUY`).

4. **Quản lý đăng ký tín chỉ**
   - Tra cứu danh sách đăng ký tín chỉ toàn hệ thống.
   - Lọc theo sinh viên, theo lớp học phần, theo học kỳ.
   - Xem trạng thái đăng ký (`REGISTERED`, `CANCELLED`) và thời điểm đăng ký.

5. **Xác nhận thanh toán**
   - Danh sách toàn bộ giao dịch đang ở trạng thái `CHO_XAC_NHAN`.
   - Xem chi tiết giao dịch: Mã GD, Sinh viên, Học kỳ, Số tiền, Phương thức nộp, Thời gian gửi.
   - Nút thao tác: **Xác nhận thanh toán** (Gọi `SP_XacNhanThanhToan` -> chuyển `DA_XAC_NHAN` -> kích hoạt trigger cập nhật `HOCPHI`).
   - Nút thao tác: **Từ chối thanh toán** (Gọi `SP_TuChoiThanhToan` -> chuyển `TU_CHOI`).
   - Hiển thị thông tin người xác nhận (`MaTaiKhoanXacNhan`) và thời gian xác nhận (`NgayXacNhan`).

6. **Quản lý học phí**
   - Tra cứu công nợ học phí theo sinh viên / theo học kỳ.
   - Hiển thị Tổng phải đóng, Đã thanh toán, Còn lại.
   - Trạng thái học phí: `UNPAID` / `PARTIAL` / `PAID`.
   - Quầy thu học phí trực tiếp tại quầy cho sinh viên.

7. **Báo cáo / Thống kê**
   - Báo cáo đăng ký tín chỉ.
   - Báo cáo tài chính thu học phí theo học kỳ (gọi Stored Procedure `SP_ThongKeHocPhi`).
   - Thống kê số lượng sinh viên, lớp học phần.
   - Nguyên tắc: Ưu tiên sử dụng View / Stored Procedure từ SQL Server thay vì tự tính lại dữ liệu ở frontend.

8. **Quản lý tài khoản**
   - Danh sách toàn bộ tài khoản người dùng từ View `V_TaiKhoanNguoiDung`.
   - Lọc theo vai trò (`QUAN_TRI`, `DAO_TAO`, `GIANG_VIEN`, `SINH_VIEN`).
   - Trạng thái: `ACTIVE` / `LOCKED`.
   - Thao tác khóa / mở khóa tài khoản người dùng phù hợp với quyền được cấp.

9. **Audit Log**
   - Danh sách lịch sử hoạt động hệ thống từ bảng `LOGHOATDONG`.
   - Thời gian thực hiện, Tài khoản thực hiện.
   - Hành động (`INSERT`, `UPDATE`, `DELETE`).
   - Bảng / đối tượng bị tác động và dữ liệu thay đổi.
   - Bảo mật: Chỉ cho phép tài khoản có quyền Quản trị (`QUAN_TRI`) truy cập màn hình này.

#### 7.5. UI Components dùng chung
- **Sidebar navigation / Tabs navigation:** Điều hướng phân hệ mượt mà, phản hồi active rõ nét.
- **Header / Breadcrumb:** Nhận diện hệ thống, học kỳ hiện tại, thông tin tài khoản đăng nhập.
- **Dashboard summary cards:** Thẻ KPI số liệu lớn, tương phản cao, nhãn rõ ràng.
- **Data table:** Bảng dữ liệu viền sắc nét, header phân cách, hover từng dòng, căn chỉnh số liệu chuẩn (số/tiền tệ căn phải, font monospace).
- **Search / Filter bar:** Thanh tìm kiếm và bộ lọc dropdown theo khoa/học kỳ/trạng thái.
- **Pagination (UI/UX Pro Max):** Phân trang chuẩn SQL Server (`OFFSET...FETCH NEXT`), hiển thị dải số dòng (`start - end / total`), dropdown chọn kích thước trang linh hoạt (`5/10/20/50`), điều hướng SVG icons ngữ nghĩa (`Đầu, Trước, Sau, Cuối`), rút gọn `...` thông minh, tuân thủ WCAG (focus-visible, disabled, aria-label).
- **Status badge:** Hệ thống badge ngữ nghĩa (`badge-success`, `badge-warning`, `badge-danger`, `badge-info`).
- **Modal xác nhận thao tác:** Hộp thoại pop-up nền mờ blur, nút xác nhận và hủy bỏ rõ ràng.
- **Toast notification:** Thông báo nổi góc màn hình tự ẩn sau 3-4 giây cho các hành động thành công/lỗi.
- **Loading / Empty / Error state:** Trạng thái đang tải, không có dữ liệu, báo lỗi thân thiện.
- **Form validation:** Bắt lỗi trường nhập liệu trước khi gửi request.
- **Hover / focus / disabled states:** Hiệu ứng phản hồi tương tác chuẩn mực (150-200ms).

#### 7.6. Nguyên tắc UI
- Ưu tiên table cho dữ liệu quản trị và báo cáo.
- Card chỉ dùng cho dashboard hoặc một đơn vị thông tin độc lập.
- Hover / transition chỉ dùng để phản hồi tương tác, khoảng 150–200ms.
- Không sử dụng glassmorphism, neon gradient, glow, particle, 3D effect hoặc animation trang trí.
- Không sử dụng emoji làm icon; sử dụng SVG icons đồng bộ.
- UI phải giống một hệ thống Cổng thông tin học vụ thực tế, ưu tiên khả năng đọc và thao tác.
- Không thêm component hoặc hiệu ứng chỉ để làm giao diện "trông hiện đại" nếu không phục vụ nghiệp vụ.
- Các trạng thái nghiệp vụ phải được thể hiện rõ bằng badge, màu trạng thái và thông báo phù hợp.

#### 7.7. Quy chuẩn Trạng thái Hệ thống & Ghi chú Bảo mật

##### 1. Phân biệt trạng thái Học kỳ (`HOCKY.TrangThai`) và Lớp học phần (`LOPHOCPHAN.TrangThai`)
- **`HOCKY.TrangThai`:**
  - `CHUA_MO`: Học kỳ tương lai, chưa tới thời gian tổ chức học vụ.
  - `DANG_MO`: Học kỳ đang diễn ra; cổng đăng ký tín chỉ mở theo khung thời gian xác định bởi `NgayMoDangKy` và `NgayDongDangKy`.
  - `KET_THUC`: Học kỳ đã hoàn thành toàn bộ công tác giảng dạy, chấm điểm và thanh quyết toán học phí.
- **`LOPHOCPHAN.TrangThai`:**
  - `MO_DANG_KY`: Lớp học phần đang mở cổng cho sinh viên đăng ký tín chỉ trực tuyến (trong đợt mở cổng của học kỳ).
  - `DANG_MO`: Lớp học phần đã chốt sĩ số / đóng đăng ký, đang trong thời gian giảng dạy học kỳ.
  - `DA_KHOA`: Giảng viên đã hoàn thành nhập điểm, lớp học phần được khóa sổ học thuật.
  - `DA_HUY`: Lớp bị hủy mở do không đạt sĩ số sinh viên tối thiểu.

##### 2. Ghi chú kỹ thuật về Băm mật khẩu (SHA-256)
- **Mục đích đồ án:** Hệ thống sử dụng thuật toán băm SHA-256 (`crypto.createHash('sha256').update(password).digest('hex')`) để tạo và xác thực `PasswordHash`. Thiết kế này đồng bộ 100% với hàm `HASHBYTES('SHA2_256', ...)` trong mã nguồn SQL Server (`04_SeedData.sql`, `SP_TaoTaiKhoan`), cho phép nhóm kiểm thử và giảng viên đối chiếu trực tiếp dữ liệu giữa Backend và Database mà không phụ thuộc thư viện native bên ngoài.
- **Khuyến nghị sản xuất (Production Best Practice):** Trong môi trường ứng dụng thực tế, mật khẩu cần được bảo vệ bằng thuật toán băm chuyên dụng cho mật khẩu như **Argon2id** hoặc **bcrypt** với cryptographic salt ngẫu nhiên và cost factor thích hợp để phòng chống tấn công brute-force và tra cứu từ điển Rainbow Table.

---

## 8. LỘ TRÌNH TRIỂN KHAI THEO VERTICAL SLICES

- **Giai đoạn 1 (Khởi tạo & Kết nối DB):**
  - Khởi tạo thư mục `backend/` và cấu trúc dự án.
  - Cài đặt dependencies: `express`, `mssql`, `cors`, `dotenv`, `zod`, `jest`, `supertest`.
  - Slice 1 & Slice 2: Hoàn thành `GET /api/health` và `GET /api/health/db`.
- **Giai đoạn 2 (Xác thực & Danh mục môn học):**
  - Slice 3: Hoàn thành Auth Login với `TAIKHOAN`, phân quyền Role, che giấu mật khẩu.
  - Slice 4: Hoàn thành `GET /api/courses/available` có tính sĩ số động và phân trang.
- **Giai đoạn 3 (Giao dịch Đăng ký & Học vụ Core):**
  - Slice 5 & 6: Hoàn thành `POST /api/registrations` gọi `SP_DangKyTinChi` và bộ ánh xạ lỗi Trigger.
  - Slice 7: Hoàn thành `DELETE /api/registrations/:id` gọi `SP_HuyDangKy`.
  - Hoàn thành các API View: Thời khóa biểu, Bảng điểm, Công nợ học phí.
- **Giai đoạn 4 (Thanh toán & Báo cáo Đào tạo):**
  - Slice 8: Hoàn thành `POST /api/payments` tạo giao dịch chờ duyệt (`CHO_XAC_NHAN`) và luồng xác nhận qua `POST /api/payments/:id/confirm` kích hoạt trigger cập nhật học phí (kịch bản migration cấu trúc DB nằm tại `backend/scripts/migrate_payment_confirmation.js`).
  - Hoàn thành `GET /api/admin/reports/tuition`.
- **Giai đoạn 5 (Giao diện Frontend Thực dụng):**
  - Khởi tạo `frontend/`, dựng layout CSS Slate/Navy học vụ theo chuẩn `/ui-ux-pro-max`.
  - Dựng trang `index.html` với Quick Login Presets.
  - Dựng Student Portal (`portal-student.html`) đầy đủ 7 phân hệ: Dashboard, Đăng ký học phần, TKB, Kết quả học tập, Học phí, Thanh toán, Thông tin tài khoản.
  - Dựng Admin Portal (`portal-admin.html`) đầy đủ 9 phân hệ: Dashboard, Quản lý sinh viên, Lớp học phần, Đăng ký tín chỉ, Xác nhận thanh toán, Quản lý học phí, Báo cáo thống kê, Quản lý tài khoản, Audit Log.
  - Dựng Cổng Giảng viên (`portal-lecturer.html`) quản lý lịch dạy và danh sách sinh viên lớp.
- **Giai đoạn 6 (Kiểm thử Toàn diện & Báo cáo):**
  - Chạy toàn bộ test suite Jest đảm bảo pass 100%.
  - Kiểm tra end-to-end trên trình duyệt với các kịch bản demo thực tế.
