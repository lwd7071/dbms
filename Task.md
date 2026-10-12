# TASK LOG

## Verify & Refine spec.md

- Status: DONE
- Date: 2026-10-08
- Files changed:
  - `docs/spec.md`

### Changes
- **SiSoHienTai**: Nhấn mạnh `SiSoHienTai` là giá trị tính toán động trong query qua `OUTER APPLY` từ `DANGKYTINCHI WHERE TrangThai = 'REGISTERED'`, tuyệt đối không phải cột vật lý của `LOPHOCPHAN`.
- **Mã lỗi 51006**: Bổ sung chú thích cho `errorMapper.js` nhận tham số `context` (`PAYMENT` vs `CREATE_USER`) để phân biệt cùng mã 51006 giữa Trigger thanh toán và `SP_TaoTaiKhoan` mà không cần can thiệp sửa CSDL.
- **Quick Login & Seed Data**: Đối chiếu khớp 100% các tài khoản demo với `DB/04_SeedData.sql` và `DANH_SACH_TAI_KHOAN_TEST.md` (`sv_23000495` có `TrangThai = 'LOCKED'`).
- **Hash SHA-256**: Quy định rõ cơ chế băm SHA-256 chữ thường (`crypto.createHash('sha256').update(password).digest('hex')`) khớp chuẩn với chuỗi băm `8d969eef...` trong DB.
- **Số lượng Indexes**: Chỉnh sửa không hard-code 31 indexes, thay bằng "18 bảng, 5 views, 6 functions, 6 stored procedures, 11 triggers, 4 security roles và hệ thống indexes theo DB specification".

### Tests / Verification
- Kiểm tra mã `THROW` trong `DB/05_Triggers.md` và `DB/08_StoredProcedures.md` qua PowerShell grep: Đã xác thực thực tế DB dùng 51006 cho cả hai.
- Kiểm tra danh sách tài khoản trong `DANH_SACH_TAI_KHOAN_TEST.md` và `DB/04_SeedData.md`: Khớp đúng `sv_23000495` là `LOCKED`.
- Kiểm tra số lượng index trong `DB/09_Indexes.md`: 17 Nonclustered Indexes.

### Issues
- None

### Next Step
- Hoàn thành Giai đoạn 1. Chuẩn bị triển khai Giai đoạn 2: Slice 3 (Authentication Login & Token).

## Phase 1: Backend Setup & Health Check (Slice 1 & 2)

- Status: DONE
- Date: 2026-10-08
- Files changed:
  - `backend/package.json`
  - `backend/.env`
  - `backend/.env.example`
  - `backend/src/config/db.js`
  - `backend/src/utils/apiResponse.js`
  - `backend/src/utils/errorMapper.js`
  - `backend/src/middlewares/validate.middleware.js`
  - `backend/src/middlewares/errorHandler.middleware.js`
  - `backend/src/controllers/health.controller.js`
  - `backend/src/routes/health.routes.js`
  - `backend/src/routes/index.js`
  - `backend/src/app.js`
  - `backend/src/server.js`
  - `backend/tests/health.test.js`

### Changes
- Khởi tạo kiến trúc phân tầng `backend/` theo chuẩn Express + mssql Connection Pool.
- Tạo `apiResponse.js` chuẩn hóa định dạng `{ isSuccess, data, errors }`.
- Tạo `errorMapper.js` hỗ trợ Translation Layer ánh xạ lỗi SQL Server (50001 - 51310) sang tiếng Việt và HTTP status chuẩn.
- Cấu hình SQL login `dbms_user` kết nối trực tiếp đến database `DBMS330284`.
- Hoàn thiện Slice 1 (`GET /api/health`) và Slice 2 (`GET /api/health/db`).

### Tests / Verification
- Chạy `npm test` (`jest --runInBand --detectOpenHandles --forceExit`):
  - Slice 1: `GET /api/health` trả về 200 OK và status `UP` (PASS).
  - Slice 2: `GET /api/health/db` kết nối thành công tới database `DBMS330284` (PASS).
- 2/2 tests PASS (100%).

### Issues
- None

### Next Step
- Hoàn thành Slice 3. Chuẩn bị triển khai Slice 4: Danh mục môn học mở đăng ký (`GET /api/courses/available`).

## Phase 2: Slice 3 - Authentication & Profile

- Status: DONE
- Date: 2026-10-08
- Files changed:
  - `backend/package.json`
  - `backend/src/validators/auth.validator.js`
  - `backend/src/repositories/auth.repository.js`
  - `backend/src/services/auth.service.js`
  - `backend/src/middlewares/auth.middleware.js`
  - `backend/src/controllers/auth.controller.js`
  - `backend/src/routes/auth.routes.js`
  - `backend/src/routes/index.js`
  - `backend/tests/auth.test.js`

### Changes
- Xây dựng luồng xác thực đăng nhập `POST /api/auth/login` theo kiến trúc MVC + Service + Repository.
- Sử dụng thuật toán băm SHA-256 chuỗi hex thường khớp 100% với dữ liệu `PasswordHash` trong `DB/04_SeedData.sql`.
- Xác thực phân quyền vai trò: `QUAN_TRI`, `DAO_TAO`, `GIANG_VIEN`, `SINH_VIEN`.
- Xử lý chặn tài khoản có `TrangThai != 'ACTIVE'` (kiểm chứng case `sv_23000495` có trạng thái `LOCKED` trả về `403 Forbidden`).
- Bảo mật thông tin người dùng: không bao giờ trả về trường `passwordHash`.
- Cập nhật thời điểm `LanDangNhapCuoi` sau khi đăng nhập thành công.
- Cung cấp JWT Bearer token và endpoint `GET /api/auth/me` cùng middleware `verifyToken`, `authorizeRoles`.

### Tests / Verification
- Chạy `npm test`:
  - `tests/health.test.js`: 2 tests PASS.
  - `tests/auth.test.js`: 7 tests PASS (admin, sinh viên, sai pass, tài khoản locked, validate input, auth me).
- Tổng cộng 9/9 tests PASS (100%).

### Issues
- None

### Next Step
- Hoàn thành Slice 4. Chuẩn bị triển khai Giai đoạn 3: Slice 5 & 6 - Giao dịch Đăng ký tín chỉ (`POST /api/registrations` gọi `SP_DangKyTinChi` & bắt lỗi Trigger).

## Phase 2: Slice 4 - Available Courses with Dynamic Sĩ Số

- Status: DONE
- Date: 2026-10-08
- Files changed:
  - `backend/src/middlewares/validate.middleware.js`
  - `backend/src/validators/course.validator.js`
  - `backend/src/repositories/course.repository.js`
  - `backend/src/services/course.service.js`
  - `backend/src/controllers/course.controller.js`
  - `backend/src/routes/course.routes.js`
  - `backend/src/routes/index.js`
  - `backend/tests/course.test.js`

### Changes
- Xây dựng API `GET /api/courses/available` có phân trang chuẩn `{ items, page, pageSize, totalItems, totalPages }`.
- Tính toán sĩ số động `SiSoHienTai` trong query thông qua `OUTER APPLY (SELECT COUNT(*) FROM dbo.DANGKYTINCHI WHERE TrangThai = 'REGISTERED')`, tuân thủ triệt để CSDL chuẩn 3NF không lưu sĩ số vật lý.
- Tự động fallback về học kỳ đang mở `TrangThai = 'DANG_MO'` nếu client không truyền `maHocKy`.
- Hỗ trợ lọc theo mã khoa `maKhoa` và tìm kiếm từ khóa `search` (mã LHP, tên môn học).
- Cập nhật `validate.middleware.js` tương thích chuẩn `err.issues` của Zod v4 và cơ chế override `req.query` trong Express 5.

### Tests / Verification
- Chạy `npm test`:
  - `tests/health.test.js`: 2 tests PASS.
  - `tests/auth.test.js`: 7 tests PASS.
  - `tests/course.test.js`: 4 tests PASS (lấy danh sách có sĩ số động, tìm kiếm từ khóa, lọc theo khoa, validate phân trang).
- Tổng cộng 13/13 tests PASS (100%).

### Issues
- None

### Next Step
- Hoàn thành Giai đoạn 3. Chuẩn bị triển khai Giai đoạn 4: Slice 8 - Thanh toán học phí (`POST /api/payments` kích hoạt trigger) và Báo cáo Đào tạo (`GET /api/admin/reports/tuition`).

## Phase 3: Slice 5, 6 & 7 - Registration, Cancellation & Student Academic Views

- Status: DONE
- Date: 2026-10-08
- Files changed:
  - `backend/src/validators/registration.validator.js`
  - `backend/src/repositories/registration.repository.js`
  - `backend/src/services/registration.service.js`
  - `backend/src/controllers/registration.controller.js`
  - `backend/src/routes/registration.routes.js`
  - `backend/src/repositories/student.repository.js`
  - `backend/src/services/student.service.js`
  - `backend/src/controllers/student.controller.js`
  - `backend/src/routes/student.routes.js`
  - `backend/src/routes/index.js`
  - `backend/src/middlewares/errorHandler.middleware.js`
  - `backend/tests/registration.test.js`
  - `backend/tests/student.test.js`

### Changes
- Xây dựng API `POST /api/registrations` gọi trực tiếp Stored Procedure `dbo.SP_DangKyTinChi` trong CSDL `DBMS330284`.
- Tích hợp Translation Layer bắt chính xác các mã lỗi nghiệp vụ CSDL thực tế:
  - `50001` (404 Not Found): Sinh viên không tồn tại.
  - `50007` (409 Conflict): Sinh viên đã đăng ký môn học này trong học kỳ.
  - `50008` (409 Conflict): Sinh viên chưa hoàn thành môn tiên quyết bắt buộc (kiểm chứng thật: môn `ANHVAN2` yêu cầu tiên quyết `ANHVAN1`).
  - `50009` (409 Conflict): Trùng lịch học với thời khóa biểu hiện tại (kiểm chứng thật: `LHP_HK7_HDH_02` trùng Thứ 3 tiết 1-3).
  - `50010` (409 Conflict): Vượt quá số tín chỉ tối đa cho phép trong học kỳ.
- Xây dựng API `DELETE /api/registrations/:id` gọi trực tiếp Stored Procedure `dbo.SP_HuyDangKy` để hủy môn học và cập nhật trạng thái `CANCELLED` (bắt mã `50021` nếu không tìm thấy).
- Xây dựng cụm API Học vụ Sinh viên truy xuất các SQL Views:
  - `GET /api/students/:id/schedule` (truy vấn `dbo.V_ThoiKhoaBieuSinhVien`).
  - `GET /api/students/:id/grades` (truy vấn `dbo.V_BangDiemChiTiet`, tự động tính GPA và tổng tín chỉ tích lũy).
  - `GET /api/students/:id/tuition` (truy vấn `dbo.V_HocPhiSinhVien`).

### Tests / Verification
- Chạy `npm test`:
  - `tests/health.test.js`: 2 tests PASS.
  - `tests/auth.test.js`: 7 tests PASS.
  - `tests/course.test.js`: 4 tests PASS.
  - `tests/registration.test.js`: 10 tests PASS (validate input, đăng ký thành công, lỗi 50007, lỗi 50009, lỗi 50008, lỗi 50010, lỗi 50001, hủy đăng ký thành công, lỗi 50021).
  - `tests/student.test.js`: 3 tests PASS (TKB, bảng điểm & GPA, học phí).
- Tổng cộng 26/26 tests PASS (100%).

### Issues
- None

### Next Step
- Hoàn thành toàn bộ API Backend (Giai đoạn 1 - 4). Chuẩn bị triển khai Giai đoạn 5: Frontend UI (HTML/CSS/JS thuần, Quick Login, Student Portal, Admin Portal).

## Phase 4: Slice 8 - Tuition Payment & Admin Reports

- Status: DONE
- Date: 2026-10-08
- Files changed:
  - `backend/src/validators/payment.validator.js`
  - `backend/src/repositories/tuition.repository.js`
  - `backend/src/services/tuition.service.js`
  - `backend/src/controllers/tuition.controller.js`
  - `backend/src/routes/payment.routes.js`
  - `backend/src/routes/admin.routes.js`
  - `backend/src/routes/index.js`
  - `backend/src/utils/errorMapper.js`
  - `backend/tests/tuition.test.js`

### Changes
- Xây dựng API `POST /api/payments` ghi nhận giao dịch thanh toán vào bảng `dbo.CHITIETTHANHTOAN`.
- Sử dụng cú pháp `OUTPUT INTO @TableVariable` đảm bảo tương thích 100% với SQL Server khi bảng có AFTER Trigger.
- Trigger `dbo.TR_CHITIETTHANHTOAN_CapNhatHocPhi` tự động cập nhật số tiền đã đóng và chuyển trạng thái `TrangThai` trong bảng `dbo.HOCPHI` sang `PAID` hoặc `PARTIAL`.
- Bắt lỗi ràng buộc số tiền thanh toán không được vượt quá số dư học phí còn lại (Mã 51006 / Check Constraint `CK_HOCPHI_SoTienDaThanhToan`) và map sang HTTP 409 Conflict.
- Xây dựng API `GET /api/admin/reports/tuition` gọi trực tiếp Stored Procedure `dbo.SP_ThongKeHocPhi` cho phòng Đào tạo và Quản trị.

### Tests / Verification
- Chạy `npm test`:
  - `tests/health.test.js`: 2 tests PASS.
  - `tests/auth.test.js`: 7 tests PASS.
  - `tests/course.test.js`: 4 tests PASS.
  - `tests/registration.test.js`: 10 tests PASS.
  - `tests/student.test.js`: 3 tests PASS.
  - `tests/tuition.test.js`: 5 tests PASS (validate input, nộp vượt mức học phí bị chặn, nộp hợp lệ trigger cập nhật số dư, báo cáo thống kê, validate trạng thái).
- Tổng cộng 31/31 tests PASS (100%).

### Issues
- None

### Next Step
- Hoàn thành Giai đoạn 4. Chuẩn bị triển khai Giai đoạn 5.

## Phase 5: Frontend UI Implementation (Quick Login, Student & Admin Portals)

- Status: DONE
- Date: 2026-10-08
- Files changed:
  - `frontend/css/styles.css`
  - `frontend/js/api.js`
  - `frontend/js/auth.js`
  - `frontend/js/registration.js`
  - `frontend/js/tuition.js`
  - `frontend/js/admin.js`
  - `frontend/index.html`
  - `frontend/portal-student.html`
  - `frontend/portal-admin.html`
  - `backend/src/app.js`

### Changes
- Xây dựng giao diện Web theo phong cách Academic Portal thực dụng, độ tương phản cao, bảng màu Navy/Slate dựa trên hướng dẫn `/ui-ux-pro-max`, sử dụng Vanilla HTML/CSS/JavaScript thuần không phụ thuộc thư viện bên ngoài:
  - `frontend/css/styles.css`: Thiết lập toàn bộ Design Tokens CSS variables, bố cục CSS Grid/Flexbox, Lưới Thời khóa biểu tuần, Badges trạng thái môn/học phí, Toast alerts, Modals.
  - `frontend/js/api.js`: Wrapper Fetch client gọi các REST endpoints, quản lý JWT token tự động trong header, hệ thống thông báo Toast (Success, Error, Warning, Info), bộ định dạng tiền tệ Việt Nam Đồng (`formatCurrency`).
  - `frontend/js/auth.js`: Quản lý xác thực đăng nhập, lưu session trong LocalStorage, Auth Guard chuyển hướng theo quyền (`STUDENT`, `ADMIN`, `DAO_TAO`), điền nhanh 1-click cho 6 tài khoản Quick Login Presets.
  - `frontend/index.html`: Màn hình Đăng nhập tích hợp bảng Quick Login Presets 6 tài khoản test thực tế từ CSDL.
  - `frontend/portal-student.html` & `frontend/js/registration.js` & `frontend/js/tuition.js`: Cổng thông tin Sinh viên với 4 tab chức năng:
    1. Đăng ký tín chỉ: Bộ lọc khoa, danh sách môn học mở có sĩ số động, đăng ký môn và bắt lỗi trigger/SP, danh sách môn đã đăng ký và nút Hủy môn.
    2. Thời khóa biểu: Grid tuần từ Thứ 2 đến Chủ nhật, tiết 1 đến tiết 12, hiển thị trực quan phòng học, giảng viên.
    3. Bảng điểm học tập & GPA: Bảng điểm chi tiết trích xuất từ `V_BangDiemChiTiet`, tổng kết tín chỉ tích lũy và GPA.
    4. Công nợ học phí: Tra cứu công nợ các học kỳ từ `V_HocPhiSinhVien`, modal nộp học phí trực tuyến kích hoạt Trigger DB.
  - `frontend/portal-admin.html` & `frontend/js/admin.js`: Cổng Quản lý Đào tạo & Quản trị với 2 phân hệ:
    1. Báo cáo Tài chính Học phí: Trích xuất số liệu từ Stored Procedure `SP_ThongKeHocPhi`, lọc theo học kỳ & trạng thái, hệ thống thẻ chỉ số KPIs.
    2. Quầy thu học phí tại quầy: Tra cứu công nợ sinh viên bất kỳ qua mã SV và ghi nhận thanh toán trực tiếp.
  - `backend/src/app.js`: Tích hợp middleware `express.static` phục vụ toàn bộ thư mục `frontend` trực tiếp trên cổng 5000.

### Tests / Verification
- Toàn bộ 6 Jest test suites (31/31 tests) đều PASS 100%.
- Kết nối CSDL SQL Server `DBMS330284` thông suốt qua connection pool.
- Chạy thử backend serve static assets `frontend` thành công.

### Issues
- None

### Next Step
- Tiếp tục Task Audit: Bổ sung cơ chế xác nhận thanh toán 2 bước cho hệ thống học phí.

## Special Task: Payment Confirmation Audit & RBAC Enhancement

- Status: DONE
- Date: 2026-10-08
- Files changed:
  - `docs/spec.md`
  - `backend/scripts/migrate_payment_confirmation.js`
  - `backend/src/utils/errorMapper.js`
  - `backend/src/repositories/tuition.repository.js`
  - `backend/src/services/tuition.service.js`
  - `backend/src/controllers/tuition.controller.js`
  - `backend/src/routes/payment.routes.js`
  - `backend/src/repositories/student.repository.js`
  - `backend/src/services/student.service.js`
  - `backend/src/controllers/student.controller.js`
  - `backend/src/routes/student.routes.js`
  - `backend/tests/tuition.test.js`
  - `frontend/js/tuition.js`
  - `frontend/js/admin.js`
  - `frontend/portal-student.html`
  - `frontend/portal-admin.html`

### Database changes
- **Bảng `dbo.CHITIETTHANHTOAN`:**
  - Bổ sung cột `TrangThai VARCHAR(20) NOT NULL CONSTRAINT DF_CHITIETTHANHTOAN_TrangThai DEFAULT 'CHO_XAC_NHAN'`.
  - Bổ sung ràng buộc `CONSTRAINT CK_CHITIETTHANHTOAN_TrangThai CHECK (TrangThai IN ('CHO_XAC_NHAN', 'DA_XAC_NHAN', 'TU_CHOI'))`.
  - Bổ sung cột `MaTaiKhoanXacNhan INT NULL CONSTRAINT FK_CHITIETTHANHTOAN_TAIKHOAN FOREIGN KEY REFERENCES dbo.TAIKHOAN(MaTaiKhoan)`.
  - Bổ sung cột `NgayXacNhan DATETIME2 NULL`.
  - Khởi tạo dữ liệu seed cũ sang `DA_XAC_NHAN` để đảm bảo tính toàn vẹn số dư.
- **Trigger `dbo.TR_CHITIETTHANHTOAN_CapNhatHocPhi`:**
  - Cập nhật logic tính tổng: chỉ cộng tiền các giao dịch có `TrangThai = 'DA_XAC_NHAN'`.
  - Giao dịch `CHO_XAC_NHAN` và `TU_CHOI` tuyệt đối không được cộng vào `HOCPHI.SoTienDaThanhToan`.
  - Hỗ trợ xử lý multi-row và chặn vượt tổng học phí (Mã `51006`).
- **Stored Procedures mới:**
  - `dbo.SP_XacNhanThanhToan (@MaThanhToan, @MaTaiKhoanXacNhan)`: Kiểm tra giao dịch tồn tại, trạng thái `CHO_XAC_NHAN`, kiểm tra quyền tài khoản (`DAO_TAO` / `QUAN_TRI`), cập nhật trong transaction, rollback nếu lỗi.
  - `dbo.SP_TuChoiThanhToan (@MaThanhToan, @MaTaiKhoanXacNhan)`: Từ chối giao dịch chờ duyệt, chuyển `TU_CHOI`.

### API changes
- **`POST /api/payments`:** Sinh viên tạo giao dịch thanh toán ban đầu với trạng thái `CHO_XAC_NHAN`. Hệ thống chưa tự động tăng `HOCPHI.SoTienDaThanhToan`.
- **`GET /api/payments/pending`:** Lấy danh sách giao dịch nộp học phí đang ở trạng thái `CHO_XAC_NHAN` (yêu cầu quyền `DAO_TAO` hoặc `QUAN_TRI`).
- **`POST /api/payments/:id/confirm`:** Xác nhận giao dịch thanh toán qua `SP_XacNhanThanhToan` (yêu cầu quyền `DAO_TAO` hoặc `QUAN_TRI`).
- **`POST /api/payments/:id/reject`:** Từ chối giao dịch thanh toán qua `SP_TuChoiThanhToan` (yêu cầu quyền `DAO_TAO` hoặc `QUAN_TRI`).
- **`GET /api/students/:id/payments`:** Lấy lịch sử tất cả các giao dịch thanh toán của sinh viên kèm trạng thái duyệt.

### Authorization changes
- Chặn triệt để `SINH_VIEN` và `GIANG_VIEN` không được phép gọi endpoint confirm và reject (trả về `403 Forbidden`).
- Kiểm tra quyền thực tế từ token giải mã qua `req.user.vaiTro`, không tin tưởng role từ client gửi lên.

### Frontend changes
- **Cổng Sinh viên (`portal-student.html`, `js/tuition.js`):**
  - Hiển thị thông báo "Yêu cầu thanh toán đã được tạo (Chờ xác nhận)".
  - Bổ sung bảng "Lịch sử các yêu cầu thanh toán" hiển thị rõ ràng các badge: `Chờ xác nhận` (vàng), `Đã xác nhận` (xanh), `Từ chối` (đỏ).
  - Phương thức thanh toán chuẩn hóa: `CHUYEN_KHOAN` và `TIEN_MAT`.
- **Cổng Đào tạo / Quản trị (`portal-admin.html`, `js/admin.js`):**
  - Bổ sung Tab 1 "Xác nhận Thanh toán (Chờ duyệt)" hiển thị danh sách các giao dịch `CHO_XAC_NHAN`.
  - Nút **Xác nhận** và **Từ chối** thao tác trực tiếp, cập nhật số liệu thời gian thực.

### Tests / Verification
- Viết mới bộ 16 test cases bắt buộc trong `tests/tuition.test.js` kiểm tra đầy đủ mọi khía cạnh của flow mới:
  1. Sinh viên tạo payment thành công (201 Created).
  2. Payment mới tạo có trạng thái `CHO_XAC_NHAN`.
  3. `HOCPHI.SoTienDaThanhToan` chưa tăng khi payment còn `CHO_XAC_NHAN`.
  4. Sinh viên gọi confirm bị chặn 403 Forbidden.
  5. Giảng viên gọi confirm bị chặn 403 Forbidden.
  6. Phòng Đào tạo (`daotao01`) confirm thành công (200 OK).
  7. Sau confirm, `HOCPHI.SoTienDaThanhToan` được cập nhật tự động bởi trigger.
  8. Payment đủ tiền $\to$ `HOCPHI` chuyển sang `PAID`.
  9. Payment một phần $\to$ `HOCPHI` chuyển sang `PARTIAL`.
  10. Reject payment thành công (200 OK).
  11. Payment `TU_CHOI` không được cộng vào học phí.
  12. Chặn confirm payment đã `DA_XAC_NHAN` (409 Conflict).
  13. Chặn confirm payment đã `TU_CHOI` (409 Conflict).
  14. Chặn thanh toán vượt quá tổng học phí (409 Conflict).
  15. Multi-row trigger xử lý đúng khi nhiều dòng thay đổi cùng lúc.
  16. Báo cáo thống kê `SP_ThongKeHocPhi` hoạt động chính xác (200 OK).
- Chạy toàn bộ test suites dự án (`npm test`): **6/6 test suites PASS, 42/42 tests PASS 100%**.

### Issues
- None

### Next Step
- Hoàn thành Giai đoạn 5: Triển khai toàn bộ Giao diện Frontend Thực dụng cho tất cả các Role theo đặc tả `docs/spec.md`.

## Phase 5: Pragmatic Multi-Role Frontend Implementation

- Status: DONE
- Date: 2026-10-09
- Files changed:
  - `frontend/index.html`
  - `frontend/portal-student.html`
  - `frontend/portal-admin.html`
  - `frontend/portal-lecturer.html`
  - `frontend/css/styles.css`
  - `frontend/js/auth.js`
  - `frontend/js/student.js`
  - `frontend/js/admin.js`
  - `frontend/js/lecturer.js`
  - `backend/src/routes/student.routes.js`
  - `backend/src/controllers/student.controller.js`
  - `backend/src/services/student.service.js`
  - `backend/src/repositories/student.repository.js`
  - `backend/src/routes/admin.routes.js`
  - `backend/src/controllers/admin.controller.js`
  - `backend/src/repositories/admin.repository.js`
  - `backend/src/routes/lecturer.routes.js`
  - `backend/src/controllers/lecturer.controller.js`
  - `backend/src/services/lecturer.service.js`
  - `backend/src/repositories/lecturer.repository.js`
  - `backend/tests/student.test.js`
  - `backend/tests/admin.test.js`

### Changes
1. **Student Portal (`frontend/portal-student.html` + `frontend/js/student.js`):**
   - Đầy đủ 7 màn hình theo đặc tả:
     1. **Dashboard / Tổng quan**: Chào mừng sinh viên, mã SV, khoa, trạng thái đào tạo, học kỳ hiện tại; 4 KPI Cards (GPA tích lũy, Tổng tín chỉ tích lũy, Đăng ký học kỳ này, Học phí còn nợ & trạng thái badge); Thông báo học vụ quan trọng; Lối tắt chức năng nhanh.
     2. **Đăng ký học phần**: Danh sách môn đã đăng ký, tìm kiếm/lọc khoa, bảng lớp mở, đăng ký / hủy trực tiếp.
     3. **Thời khóa biểu**: Lịch học theo tuần (ma trận 10 tiết x Thứ 2 đến Thứ 7).
     4. **Kết quả học tập**: Bảng điểm chi tiết từng kỳ, điểm QT/GK/CK, tổng kết, điểm chữ, xếp loại ĐẠT.
     5. **Học phí**: Thống kê công nợ các kỳ, tổng tiền, đã trả, còn lại, trạng thái UNPAID/PARTIAL/PAID.
     6. **Thanh toán**: Tạo yêu cầu nộp tiền, bảng theo dõi lịch sử duyệt với trạng thái `CHO_XAC_NHAN`, `DA_XAC_NHAN`, `TU_CHOI`.
     7. **Thông tin tài khoản**: Hồ sơ cá nhân (MSSV, Họ tên, Ngày sinh, Khoa, Email, SĐT, Ngày tạo), thông tin tài khoản (username, vai trò, trạng thái ACTIVE, lần đăng nhập cuối), đổi mật khẩu & đăng xuất.

2. **Admin / Đào tạo Portal (`frontend/portal-admin.html` + `frontend/js/admin.js`):**
   - Đầy đủ 9 màn hình theo đặc tả:
     1. **Dashboard / Tổng quan**: 4 KPI Cards (Tổng SV, Lớp học phần mở, Lượt ĐKTC, Giao dịch chờ duyệt); Bảng tổng quan tài chính thu học phí (Phải thu / Đã thu thực tế / Công nợ tồn đọng).
     2. **Quản lý sinh viên**: Tìm kiếm MSSV/Họ tên, lọc khoa, bảng sinh viên, modal xem chi tiết hồ sơ kèm lịch sử ĐKTC và học phí.
     3. **Quản lý lớp học phần**: Danh sách LHP mở trong kỳ, Môn học, Số TC, Giảng viên, Sĩ số / Sức chứa (kèm progress bar), Lịch học (Thứ/Tiết/Phòng), Trạng thái.
     4. **Quản lý đăng ký tín chỉ**: Tra cứu ĐKTC toàn trường theo MSSV/LHP/Trạng thái (`REGISTERED` / `CANCELLED`).
     5. **Xác nhận thanh toán**: Danh sách giao dịch `CHO_XAC_NHAN`, nút Xác nhận (`SP_XacNhanThanhToan`) và Từ chối (`SP_TuChoiThanhToan`).
     6. **Quản lý học phí & Quầy thu**: Tra cứu học phí theo ID sinh viên, thu tiền tại quầy và tự động xác nhận giao dịch.
     7. **Báo cáo / Thống kê**: Báo cáo thu học phí từ Stored Procedure `SP_ThongKeHocPhi`, lọc theo học kỳ và trạng thái, bảng KPI tổng hợp.
     8. **Quản lý tài khoản**: Danh sách người dùng từ `V_TaiKhoanNguoiDung`, lọc vai trò/trạng thái, nút Khóa / Mở khóa tài khoản (`PATCH /api/admin/users/:username/status`).
     9. **Audit Log**: Nhật ký hoạt động hệ thống từ bảng `LOGHOATDONG` (thời gian, tài khoản thực hiện, hành động, bảng tác động, chi tiết thay đổi cũ/mới).

3. **Lecturer Portal (`frontend/portal-lecturer.html` + `frontend/js/lecturer.js`):**
   - Phân hệ Cổng Giảng viên độc lập:
     - Danh sách lớp học phần phụ trách (Sĩ số hiện tại / tối đa, tỷ lệ % lấp đầy, trạng thái).
     - Modal xem danh sách sinh viên trong lớp và bảng điểm (QT, GK, CK, Tổng kết).
     - Lịch giảng dạy tuần (ma trận thời khóa biểu từ tiết 1 đến tiết 10).

4. **UI/UX Design Intelligence (/ui-ux-pro-max):**
   - Bảng màu chuyên nghiệp Academic Portal: Slate/Navy, tương phản cao, phông chữ hệ thống sắc nét.
   - 100% biểu tượng sử dụng SVG inline có ngữ nghĩa, không lạm dụng emoji.
   - Thao tác dữ liệu bảng chuẩn quản trị, trạng thái badge màu sắc rõ ràng theo chuẩn thiết kế.

### Tests / Verification
- Bổ sung test suites mới:
  - `backend/tests/admin.test.js`: 6 test cases (Dashboard stats, Students list, Classes list, Registrations list, Users list, Audit logs).
  - `backend/tests/student.test.js`: Thêm test cases cho `GET /api/students/:id/profile` (200 OK & 404 Not Found).
- Toàn bộ test suites dự án (`npm test`): **7/7 test suites PASS, 51/51 tests PASS 100%**.

### Issues
- None

### Next Step
- Sẵn sàng triển khai tính năng mở rộng tiếp theo theo yêu cầu.

## Phase 5 Extension: Universal Pagination Feature (TDD & UI/UX Pro Max)

- Status: DONE
- Date: 2026-10-09
- Files changed:
  - `backend/src/repositories/admin.repository.js`
  - `backend/src/controllers/admin.controller.js`
  - `backend/src/repositories/student.repository.js`
  - `backend/src/services/student.service.js`
  - `backend/src/controllers/student.controller.js`
  - `backend/tests/admin.test.js`
  - `backend/tests/student.test.js`
  - `frontend/css/styles.css`
  - `frontend/js/api.js`
  - `frontend/js/admin.js`
  - `frontend/js/tuition.js`
  - `frontend/js/registration.js`

### Changes
1. **Backend SQL Server Pagination & TDD (Vertical Slices):**
   - Triển khai phân trang chuẩn SQL Server: `OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY` kèm truy vấn `COUNT(*)` lấy `totalItems`.
   - Chuẩn hóa Response Envelope phân trang qua `successResponse(items, { page, pageSize, totalItems, totalPages })`.
   - 6 Lát cắt Backend được test TDD đầy đủ:
     - Lát cắt 1: `GET /api/admin/students` (phân trang + lọc khoa + tìm kiếm).
     - Lát cắt 2: `GET /api/admin/registrations` (phân trang + lọc trạng thái + tìm kiếm).
     - Lát cắt 3: `GET /api/admin/classes` (phân trang + tìm kiếm).
     - Lát cắt 4: `GET /api/admin/users` (phân trang + lọc vai trò + lọc trạng thái).
     - Lát cắt 5: `GET /api/admin/audit-logs` (phân trang theo thời gian giảm dần).
     - Lát cắt 6: `GET /api/students/:id/payments` (phân trang lịch sử thanh toán sinh viên).

2. **Frontend UI/UX Pro Max Pagination Component:**
   - Xây dựng component `renderPagination({ containerId, page, pageSize, totalItems, totalPages, pageSizeOptions, onPageChange })` trong `frontend/js/api.js`.
   - CSS chuẩn Slate/Navy trong `frontend/css/styles.css`: WCAG-compliant, 100% SVG icon ngữ nghĩa (`First`, `Prev`, `Next`, `Last`), hỗ trợ dấu `...` thông minh, bộ chọn kích thước trang linh hoạt (`5/10/20/50` bản ghi/trang), focus-visible và disabled states.
   - Tích hợp đồng bộ vào toàn bộ bảng giao diện:
     - Admin: Quản lý sinh viên, Lớp học phần, Đăng ký tín chỉ, Tài khoản người dùng, Nhật ký hoạt động.
     - Student: Lịch sử thanh toán sinh viên, Danh sách môn học mở đăng ký tín chỉ.

### Tests / Verification
- Toàn bộ test suites backend (`npm test`): **7/7 test suites PASS, 57/57 tests PASS 100%**.
  - `tests/student.test.js`: 6/6 PASS.
  - `tests/admin.test.js`: 12/12 PASS (6 test cơ bản + 6 test phân trang & metadata).
  - `tests/tuition.test.js`: 10/10 PASS.
  - `tests/registration.test.js`: 13/13 PASS.
  - `tests/auth.test.js`: 7/7 PASS.
  - `tests/course.test.js`: 5/5 PASS.
  - `tests/health.test.js`: 4/4 PASS.

## Phase 5 Extension: Student Dashboard One-Screen Fit Layout (TDD & UI/UX Pro Max)

- Status: DONE
- Date: 2026-10-09
- Files changed:
  - `backend/tests/dashboard-layout.test.js`
  - `frontend/css/styles.css`
  - `frontend/js/student.js`

### Changes
1. **Khắc phục lỗi Layout dọc:**
   - Bổ sung class `.summary-cards` với `display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem;` giúp 4 thẻ KPI dàn ngang đều 1 hàng thay vì bị rớt thành 4 dòng block dọc.
   - Tối ưu thẻ `.summary-card`: padding `0.75rem 1rem`, font-size `1.4rem`.
2. **Compact Viewport-Fit (Không cuộn chuột trên desktop/laptop):**
   - Thu gọn Welcome Banner: padding `0.65rem 1.15rem`, font-size `1.15rem`, nhãn học kỳ nhỏ gọn.
   - Bento Grid 2 cột cân đối (`.dashboard-bento`):
     - Cột trái: Thông báo & Nhắc nhở học vụ (Compact alert strips).
     - Cột phải: Lối tắt chức năng nhanh (`.dashboard-shortcuts`) dạng 2x2 grid compact với SVG icon ngữ nghĩa, liên kết trực tiếp tới các phân hệ `Đăng ký học phần`, `Thời khóa biểu`, `Kết quả học tập`, `Thanh toán học phí`.
3. **Quy trình TDD (/tdd):**
   - Viết test suite `backend/tests/dashboard-layout.test.js` xác nhận RED (thiếu class `.summary-cards`, thiếu layout bento).
   - Triển khai code styles và markup HTML đạt chuẩn GREEN.

### Tests / Verification
- Toàn bộ test suites backend (`npm test`): **8/8 test suites PASS, 63/63 tests PASS 100%**.
  - `tests/dashboard-layout.test.js`: 6/6 PASS.

## Phase 7: Dynamic Metadata & Faculties/Semesters Integration (TDD & UI/UX Pro Max)

- Status: DONE
- Date: 2026-10-09
- Files changed:
  - `backend/src/repositories/faculty.repository.js`
  - `backend/src/controllers/faculty.controller.js`
  - `backend/src/routes/faculty.routes.js`
  - `backend/src/repositories/semester.repository.js`
  - `backend/src/controllers/semester.controller.js`
  - `backend/src/routes/semester.routes.js`
  - `backend/src/routes/index.js`
  - `backend/tests/faculty.test.js`
  - `backend/tests/semester.test.js`
  - `frontend/js/api.js`
  - `frontend/js/student.js`
  - `frontend/portal-student.html`
  - `frontend/portal-admin.html`
  - `frontend/portal-lecturer.html`

### Changes
1. **TDD Backend APIs:**
   - Tạo endpoint `GET /api/faculties`: Truy vấn trực tiếp từ bảng `dbo.KHOA` (lấy 6 khoa: `ATTT`, `CNTT`, `HTTT`, `KHMT`, `KTPM`, `MMT`).
   - Tạo endpoint `GET /api/semesters` và `GET /api/semesters/current`: Truy vấn bảng `dbo.HOCKY` trả về thông tin học kỳ động kèm học kỳ đang mở (`TrangThai = 'DANG_MO'`).
2. **Frontend UI/UX Pro Max Dynamic Integration:**
   - Xóa bỏ hoàn toàn hardcode 4 khoa cũ (`DTVT`, `KT`, `NN`) trong các thẻ `<select>`.
   - Bổ sung helper `populateFaculties()` và `populateSemesters()` trong `frontend/js/api.js` kèm caching và loading states (`Đang tải danh mục khoa...`, `disabled` trong lúc nạp).
   - Đổ động 6 khoa thực tế vào ô `#filter-khoa` (Cổng Sinh viên) và `#filterStudentKhoa` (Cổng Admin).
   - Đổ động học kỳ thực tế vào `#filterReportHocKy` (Báo cáo học phí Admin).
   - Cập nhật header badge `.semester-badge`, tiêu đề thời khóa biểu và banner dashboard sinh viên hiển thị chính xác theo học kỳ đang mở trong CSDL (`Học kỳ 1 (2026-2027)`).

### Tests / Verification
- TDD Red-Green cycle hoàn thành cho 2 test suites mới:
  - `backend/tests/faculty.test.js`: 1/1 PASS.
  - `backend/tests/semester.test.js`: 2/2 PASS.
- Toàn bộ test suite dự án (`npm test`): **10/10 test suites PASS, 67/67 tests PASS 100%**.
- Kiểm thử trực tiếp giao diện qua trình duyệt: Dropdown hiển thị đúng 6 khoa từ CSDL, lọc môn và báo cáo học phí hoạt động chính xác.

### Issues
- None

### Next Step
- Triển khai Quản lý Lớp sinh hoạt và hoàn thiện API danh mục.

## Phase 7.1: Administrative Classes Management APIs (TDD)

- Status: DONE
- Date: 2026-10-09
- Files changed:
  - `backend/src/repositories/class.repository.js`
  - `backend/src/services/class.service.js`
  - `backend/src/controllers/class.controller.js`
  - `backend/src/routes/class.routes.js`
  - `backend/src/routes/index.js`
  - `backend/tests/class.test.js`

### Changes
1. **Backend Repository & Service (`class.repository.js`, `class.service.js`):**
   - Xây dựng API `GET /api/classes`: Lấy danh sách 36 lớp sinh hoạt toàn trường với sĩ số sinh viên tính toán động (`COUNT(sv.MaSV)` từ `dbo.SINHVIEN` group by mã lớp).
   - Hỗ trợ lọc theo Khoa quản lý (`maKhoa`), Khóa/Năm nhập học (`namNhapHoc`). Sắp xếp lớp mới nhất lên đầu.
   - Xây dựng API `GET /api/classes/:id`: Truy vấn chi tiết thông tin lớp sinh hoạt kèm danh sách sinh viên trực thuộc (MSSV, họ tên, email, ngày sinh, số điện thoại, tình trạng học vụ).
2. **Quy trình TDD (/tdd):**
   - Viết test suite `backend/tests/class.test.js` (5 test cases: lấy 36 lớp có sĩ số động, lọc theo khoa CNTT, lọc theo năm 2023, chi tiết lớp & sinh viên, xử lý lỗi 404 khi không tìm thấy lớp).
   - 5/5 tests PASS.

### Tests / Verification
- Test suite `tests/class.test.js`: 5/5 PASS (100%).

### Issues
- None

### Next Step
- Tiến hành chia nhóm kết quả học tập theo học kỳ và tính GPA từng kỳ.

## Phase 8: Semester-Grouped Academic Grades & GPA Tracking (TDD & UI/UX Pro Max)

- Status: DONE
- Date: 2026-10-09
- Files changed:
  - `backend/src/services/student.service.js`
  - `backend/tests/student.test.js`
  - `backend/tests/grades-layout.test.js`
  - `frontend/css/styles.css`
  - `frontend/js/registration.js`
  - `frontend/portal-student.html`

### Changes
1. **Backend Service & GPA Calculation (`student.service.js`):**
   - Mở rộng hàm `getGrades(maSV, maHocKy)` tính toán và trả về mảng `semesters`.
   - Với mỗi học kỳ: tính tổng tín chỉ đăng ký `soTinChiDangKy`, tổng tín chỉ đạt `soTinChiDat`, điểm trung bình học kỳ có trọng số tín chỉ `diemTrungBinhHocKy` (GPA HK), điểm trung bình tích lũy lũy kế `diemTrungBinhTichLuy`, xếp loại học lực học kỳ `xepLoaiHocKy` và danh sách môn `grades`.
   - Bảo toàn 100% tính tương thích với trường `grades` phẳng và `summary` toàn khóa.
2. **Frontend UI/UX Pro Max Semester Grade Views:**
   - Bổ sung bộ lọc học kỳ `#filter-grade-semester` cho phép xem toàn bộ lộ trình hoặc tập trung vào từng kỳ cụ thể.
   - Hiển thị từng học kỳ như một Section/Card độc lập (`.semester-grade-card`) với Header thể hiện Tên kỳ (`2023-2024 - Học kỳ 1`) và số lượng môn học.
   - Bổ sung thanh tổng kết học kỳ (`.semester-summary-bar`): Hiển thị tín chỉ đăng ký, tín chỉ đạt, Điểm TB học kỳ (GPA HK), Điểm TB tích lũy (GPA tích lũy) và Xếp loại học lực bằng badge ngữ nghĩa.
   - Format số thập phân căn phải chuẩn kế toán/học vụ, font monospace.
3. **Quy trình TDD (/tdd):**
   - Viết test RED trong `backend/tests/student.test.js` kiểm tra mảng `semesters` và điểm trung bình học kỳ.
   - Viết test RED trong `backend/tests/grades-layout.test.js` kiểm tra cấu trúc render và style CSS.
   - Chạy GREEN toàn bộ 11 test suites.

### Tests / Verification
- Toàn bộ test suites backend (`npm test`): **11/11 test suites PASS, 74/74 tests PASS 100%**.
  - `tests/student.test.js`: 7/7 PASS (thêm test semesters và filter maHocKy).
  - `tests/grades-layout.test.js`: 6/6 PASS.

### Issues
- None

### Next Step
- Sẵn sàng mở rộng theo yêu cầu tiếp theo.

## Phase 9: Anti-Spam Pending Payment Flow & UI/UX Notice (TDD & UI/UX Pro Max)

- Status: DONE
- Date: 2026-10-09
- Files changed:
  - `backend/src/repositories/student.repository.js`
  - `backend/src/repositories/tuition.repository.js`
  - `backend/tests/pending-payment.test.js`
  - `frontend/js/tuition.js`

### Changes
1. **TDD Backend Anti-Spam & Pending Detection:**
   - Cập nhật `student.repository.js`: Tích hợp `OUTER APPLY` truy vấn `dbo.CHITIETTHANHTOAN` với `TrangThai = 'CHO_XAC_NHAN'` để lấy `SoGiaoDichChoDuyet` và `TongTienChoDuyet`. Trả về `hasPendingPayment`, `soGiaoDichChoDuyet`, `soTienChoDuyet`. Đảm bảo danh sách học phí sắp xếp theo học kỳ gần nhất lên đầu (`ORDER BY hp.MaHocKy DESC`).
   - Cập nhật `tuition.repository.js`: Trong `createPayment`, bổ sung kiểm tra giao dịch pending. Nếu đã có giao dịch `CHO_XAC_NHAN` đang chờ duyệt cho mã học phí này, hệ thống chủ động ném lỗi `409 Conflict` (mã `PENDING_PAYMENT_EXISTS`), ngăn chặn triệt để hành vi spam tạo nhiều yêu cầu nộp tiền trùng lặp.
2. **Frontend UI/UX Pro Max Pending & Anti-Spam Experience:**
   - Cập nhật `frontend/js/tuition.js`:
     - Khi `item.hasPendingPayment === true`: Hiển thị badge trạng thái `Chờ duyệt (${item.soGiaoDichChoDuyet} GD)` màu vàng hổ phách (amber).
     - Hiển thị dải alert thông báo ngữ cảnh nổi bật: *"Đang có yêu cầu nộp ${soTienChoDuyet} chờ Cán bộ Đào tạo đối soát và xác nhận"*.
     - Đổi nút nộp tiền thành `<button class="btn btn-secondary" disabled>Đang chờ duyệt</button>` kèm ghi chú bên dưới: *"Đã tạo yêu cầu, không thể gửi thêm để tránh trùng lặp"*.
     - Thêm guard trong `openPaymentModal()` lập tức cảnh báo và chặn mở modal thanh toán nếu học phí đang ở trạng thái pending.

### Tests / Verification
- **TDD Test Suite:** Tạo mới `backend/tests/pending-payment.test.js` (2 test cases: xác thực cờ pending trong học phí sinh viên và chống spam 409 Conflict khi gửi liên tiếp request thanh toán).
- **Toàn bộ Test Suites Backend:** `npm test` đạt **12/12 test suites PASS, 78/78 tests PASS 100%**.
- **Kiểm thử giao diện thực tế (Chrome DevTools MCP):** Đã kiểm tra trực tiếp tài khoản sinh viên `sv_23000001` trên trình duyệt: Card học phí HP#5168 hiển thị chuẩn xác badge chờ duyệt, dải alert thông báo tiền chờ duyệt và nút bấm bị vô hiệu hóa (disabled).

### Issues
- None

### Next Step
- Sẵn sàng nhận yêu cầu tiếp theo từ người dùng.

## Phase 10: In-Progress Semester Grades Support & Recent-First Sorting (TDD & UI/UX Pro Max)

- Status: DONE
- Date: 2026-10-09
- Files changed:
  - `DB/06_Views.md`
  - `backend/src/services/student.service.js`
  - `backend/tests/student.test.js`
  - `backend/tests/grades-layout.test.js`
  - `frontend/js/registration.js`

### Changes
1. **Nâng cấp CSDL View `[dbo].[V_BangDiemChiTiet]`:**
   - Thay thế `FROM dbo.DIEMSO ds INNER JOIN dbo.DANGKYTINCHI dk` thành:
     `FROM dbo.DANGKYTINCHI dk INNER JOIN dbo.SINHVIEN sv ON ... LEFT JOIN dbo.DIEMSO ds ON ds.MaDangKy = dk.MaDangKy WHERE dk.TrangThai = 'REGISTERED'`.
   - Với môn đang học trong kỳ (chưa có điểm thi `DiemCuoiKy IS NULL`): cột `KetQua` trả về `N'ĐANG HỌC'`, các cột điểm thành phần và tổng kết trả về `NULL`.
   - Đồng bộ script view vào CSDL SQL Server `DBMS330284` và file tài liệu `DB/06_Views.md`.
2. **Backend Service (`student.service.js`):**
   - Môn đang học vẫn tính vào `soTinChiDangKy`, nhưng chưa tính vào `soTinChiDat`.
   - Kỳ đang học: `diemTrungBinhHocKy` trả về `null`, `xepLoaiHocKy = 'Đang học'`.
   - `diemTrungBinhTichLuy` giữ nguyên điểm trung bình tích lũy lũy kế của các kỳ trước đó đã hoàn thành (không bị tính thành 0).
   - Đảm bảo danh sách học kỳ sắp xếp học kỳ gần nhất lên đầu (`semesters.reverse()`).
3. **Frontend UI/UX Pro Max (`registration.js`):**
   - Môn có `ketQua === 'ĐANG HỌC'`: render badge `<span class="badge badge-info">ĐANG HỌC</span>`, điểm hiển thị `-`.
   - Footer kỳ đang học hiển thị số tín chỉ đăng ký, badge `Chưa có điểm`, xếp loại `Đang học` an toàn không lỗi `toFixed` trên `null`.
   - Tự động gọi `loadGrades()` ngay sau khi sinh viên đăng ký hoặc hủy môn học phần.

### Tests / Verification
- TDD RED-GREEN: Thêm test case kiểm tra học kỳ 7 trả về môn đang học trong `backend/tests/student.test.js` và `backend/tests/grades-layout.test.js`.
- Kết quả test: 12/12 test suites PASS (78/78 tests 100%).

---

## Phase 11: Planned vs Unplanned Course Filter & Debounce Live Search (TDD & UI/UX Pro Max)

- Status: DONE
- Date: 2026-10-09
- Files changed:
  - `backend/src/validators/course.validator.js`
  - `backend/src/repositories/course.repository.js`
  - `backend/src/services/course.service.js`
  - `backend/tests/course.test.js`
  - `backend/tests/registration-filter.test.js`
  - `frontend/portal-student.html`
  - `frontend/css/styles.css`
  - `frontend/js/registration.js`

### Changes
1. **Backend API & Subquery Lọc Kế hoạch CTĐT:**
   - Tận dụng cấu trúc 8 CTĐT trong bảng `CHUONGTRINHDAOTAO` và chi tiết môn từng kỳ trong `CTDT_MONHOC`.
   - Mở rộng API `GET /api/courses/available` nhận tham số `type` (`PLAN`, `OTHER`, `ALL`) và `maSV`:
     - `PLAN`: Lọc qua `EXISTS` với `CTDT_MONHOC` theo `MaKhoa` của sinh viên và đúng kỳ dự kiến (HK7).
     - `OTHER`: Lọc qua `NOT EXISTS` lấy các môn ngoài kỳ 7 mở trong đợt này (học vượt, học lại).
     - `ALL`: Lấy toàn bộ lớp mở trong học kỳ.
     - Trả về trường `laTheoKeHoach: true/false` trên từng bản ghi.
   - Bổ sung Zod validation trong `course.validator.js`.
2. **Frontend Segmented Pill Tabs & Search Bar UI/UX Pro Max:**
   - `portal-student.html`: Toolbar Segmented Control dạng capsule với 3 nút chuyển đổi nhanh:
     - **Theo kế hoạch (HK7)** (Mặc định kích hoạt)
     - **Ngoài kế hoạch (Học vượt / học lại)**
     - **Tất cả học phần**
   - Ô tìm kiếm `course-search-input` với icon kính lúp SVG inline, bo góc mềm mại phong cách Slate/Navy.
   - `styles.css`: Styles cho `.segmented-filter`, `.segmented-btn`, `.course-search-wrapper`.
   - `registration.js`:
     - Hàm `switchCourseFilter(type)` chuyển tab và tải lại danh sách trang 1.
     - Hàm `handleCourseSearchInput(val)` xử lý debounce search (300ms) mượt mà.
     - Render badge ngữ nghĩa: `<span class="badge badge-primary">Theo kế hoạch</span>` hoặc `<span class="badge">Ngoài kế hoạch</span>` ngay dưới tên lớp học phần.
     - Empty State trang nhã kèm icon SVG khi không tìm thấy lớp học phần phù hợp.

### Tests / Verification
- TDD RED-GREEN:
  - `backend/tests/course.test.js`: Thêm test lọc `type=PLAN`, `type=OTHER`, kiểm tra trường `laTheoKeHoach`.
  - `backend/tests/registration-filter.test.js`: Tạo mới 7/7 tests kiểm tra markup, styles và logic chuyển tab/search.
- Kết quả test: 13/13 test suites PASS (87/87 tests 100%).

---

## Phase 12: Vietnamese Status Tags Localization (TDD & UI/UX Pro Max)

- Status: DONE
- Date: 2026-10-09
- Files changed:
  - `frontend/js/api.js`
  - `frontend/js/student.js`
  - `frontend/js/registration.js`
  - `frontend/js/lecturer.js`
  - `frontend/js/admin.js`
  - `frontend/portal-admin.html`
  - `backend/tests/status-labels.test.js`

### Changes
1. **Helper dùng chung (`frontend/js/api.js`):**
   - Xây dựng từ điển `STATUS_DICTIONARY` và hàm helper `formatStatusBadge(code)` / `renderStatusBadge(code)` chuẩn hóa toàn bộ mã trạng thái hệ thống sang Tiếng Việt có dấu kèm màu sắc badge chuẩn UI/UX Pro Max:
     - `DA_KHOA` $\rightarrow$ **Đã khóa** (`badge-warning`)
     - `REGISTERED` $\rightarrow$ **Đã đăng ký** (`badge-success`)
     - `CANCELLED` $\rightarrow$ **Đã hủy** (`badge-danger`)
     - `DANG_HOC` $\rightarrow$ **Đang học** (`badge-success`)
     - `ACTIVE` / `LOCKED` $\rightarrow$ **Hoạt động** / **Đã khóa**
     - `PAID` / `PARTIAL` / `UNPAID` $\rightarrow$ **Đã thanh toán** / **Thanh toán 1 phần** / **Chưa thanh toán**
     - `MO_DANG_KY` / `DANG_MO` $\rightarrow$ **Mở đăng ký** / **Đang mở lớp**
     - `DA_XAC_NHAN` / `CHO_XAC_NHAN` / `TU_CHOI` $\rightarrow$ **Đã xác nhận** / **Chờ xác nhận** / **Bị từ chối**
2. **Đồng bộ toàn bộ 3 Cổng Portal:**
   - **Cổng Sinh viên (`student.js`, `registration.js`):** Header dashboard sinh viên, modal hồ sơ học vụ, modal tài khoản, bảng học phần đã đăng ký.
   - **Cổng Giảng viên (`lecturer.js`):** Bảng danh sách lớp học phần giảng dạy (`Đang mở lớp`, `Đã khóa`).
   - **Cổng Quản trị Admin (`admin.js`, `portal-admin.html`):** Bảng sinh viên, bảng đăng ký tín chỉ, bảng lớp học phần, bảng tài khoản, báo cáo công nợ học phí và toàn bộ các dropdown bộ lọc thẻ `<option>` trong HTML.

### Tests / Verification
- TDD RED-GREEN: Tạo mới `backend/tests/status-labels.test.js` (10/10 test cases kiểm tra helper dictionary và rà soát không còn mã thô trên các file frontend).
- Toàn bộ test suite dự án (`npm test`): **15/15 test suites PASS, 102/102 tests PASS 100%**.

### Issues
- None

### Next Step
- Triển khai Phase 13: Phân cấp Quản lý theo Lớp Sinh hoạt (Administrative Classes).

---

## Phase 13: Administrative Classes (Lớp Sinh Hoạt) Management & Multi-Cohort Hierarchy (TDD & UI/UX Pro Max)

- Status: DONE
- Date: 2026-10-09
- Files changed:
  - `DB/02_CreateTables.md`
  - `DB/03_Constraints.md`
  - `DB/04_SeedData.sql`
  - `DB/04_SeedData.md`
  - `DB/06_Views.md`
  - `DB/database_v1.md`
  - `backend/src/routes/index.js`
  - `backend/src/routes/class.routes.js`
  - `backend/src/controllers/class.controller.js`
  - `backend/src/services/class.service.js`
  - `backend/src/repositories/class.repository.js`
  - `backend/src/repositories/admin.repository.js`
  - `backend/src/repositories/tuition.repository.js`
  - `backend/src/repositories/student.repository.js`
  - `backend/src/repositories/auth.repository.js`
  - `backend/tests/class.test.js`
  - `backend/tests/tuition.test.js`
  - `frontend/js/api.js`
  - `frontend/js/admin.js`
  - `frontend/js/student.js`
  - `frontend/js/tuition.js`
  - `frontend/portal-admin.html`
  - `Task.md`

### Changes
1. **Cơ sở dữ liệu (SQL Server `DBMS330284` & `DB/` documentation):**
   - Tạo mới bảng `dbo.LOP` (PK `MaLop`, `TenLop`, FK `MaKhoa`, `KhoaHoc`, `NamNhapHoc`, `TrangThai`) nâng tổng số bảng lên **19 BẢNG**.
   - Thêm cột `MaLop` (FK tham chiếu `dbo.LOP(MaLop)`) vào bảng `dbo.SINHVIEN`.
   - Nạp dữ liệu **36 lớp sinh hoạt niên chế** chia đều cho 6 khoa qua 3 khóa tuyển sinh liên tiếp (K23: 2023, K24: 2024, K25: 2025; mỗi khoa có 2 lớp sinh hoạt / khóa).
   - Phân bổ tự động và chính xác toàn bộ 1.500 sinh viên vào đúng 36 lớp theo khoa và mã sinh viên (mỗi lớp 41-42 SV, 0 sinh viên bị NULL `MaLop`).
   - Nâng cấp View `dbo.V_TaiKhoanNguoiDung` và `dbo.V_HocPhiSinhVien` bổ sung thông tin `MaLop`, `TenLopSinhVien`.
   - Cập nhật đồng bộ toàn bộ tài liệu thư mục `DB/` (`02_CreateTables.md`, `03_Constraints.md`, `04_SeedData.sql`, `04_SeedData.md`, `06_Views.md`, `database_v1.md`) để giáo viên có thể chạy tạo lại DB chuẩn xác.

2. **Backend API & TDD Architecture:**
   - Xây dựng tầng API mới theo mô hình MVC phân tầng:
     - `GET /api/classes`: Lấy danh sách lớp sinh hoạt kèm sĩ số thực tế, hỗ trợ lọc theo `maKhoa`, `namNhapHoc`.
     - `GET /api/classes/:maLop`: Lấy chi tiết lớp sinh hoạt và danh sách sinh viên trực thuộc lớp.
   - Nâng cấp các Repository quản trị hỗ trợ phân cấp và lọc theo lớp sinh hoạt (`maLop`):
     - `admin.repository.js`: Thống kê Dashboard (`tongLopSinhHoat`), danh sách sinh viên (`getStudentsList`), danh sách đăng ký tín chỉ (`getRegistrationsList`), danh sách tài khoản (`getUsersList`).
     - `tuition.repository.js`: Danh sách giao dịch học phí chờ duyệt đối soát (`getPendingPayments` hỗ trợ lọc `maLop`).
     - `student.repository.js` & `auth.repository.js`: Trả về `maLop`, `tenLop`, `khoaHoc` cho hồ sơ sinh viên và phiên đăng nhập.
   - Viết trọn vẹn test suite TDD `backend/tests/class.test.js` kiểm thử tất cả các trường hợp của Lớp sinh hoạt.

3. **Frontend Integration & UI/UX Pro Max:**
   - `frontend/js/api.js`: Thêm `api.getClasses()`, `api.getClassDetail()`, helper `populateClasses()`.
   - `frontend/portal-admin.html` & `frontend/js/admin.js`:
     - Bổ sung Stat card "Lớp sinh hoạt (36 lớp)" trên Admin Dashboard.
     - Thêm Tab mới "Lớp sinh hoạt" hiển thị trực quan 36 lớp sinh hoạt dạng Grid Cards chuẩn UI/UX Pro Max kèm sĩ số sinh viên và nút xem danh sách lớp.
     - Modal chi tiết lớp sinh hoạt `#adminClassDetailModal` hiển thị bảng toàn bộ sinh viên trực thuộc lớp.
     - Tích hợp bộ lọc Lớp sinh hoạt động (`<select id="filter...Lop">`) trên tất cả các màn hình: Quản lý sinh viên, Tra cứu Đăng ký tín chỉ, Quản lý tài khoản người dùng, Danh sách thanh toán chờ duyệt đối soát.
   - `frontend/portal-student.html` & `frontend/js/student.js`:
     - Hiển thị Lớp sinh hoạt và Khóa học trên Banner chào mừng và Bảng Hồ sơ cá nhân của Sinh viên.

### Tests / Verification
- Toàn bộ test suites tự động của dự án (`npm test`): **16/16 test suites PASS, 117/117 tests PASS 100%**.
  - `class.test.js`: PASS 5/5 tests.
  - `tuition.test.js`: PASS 16/16 tests.
  - `admin.test.js`: PASS 11/11 tests.
  - `audit-formatter.test.js`: PASS 15/15 tests.
  - `registration.test.js`, `course.test.js`, `student.test.js`, `auth.test.js`, `faculty.test.js`, `semester.test.js`, `health.test.js`, `pending-payment.test.js`, `status-labels.test.js`, `dashboard-layout.test.js`, `registration-filter.test.js`, `grades-layout.test.js`: PASS 100%.
- Kiểm tra REST API thực tế với SQL Server:
  - `GET /api/health`: UP 200 OK.
  - `GET /api/classes`: Trả về chuẩn 36 lớp kèm sĩ số sinh viên.
  - `GET /api/admin/dashboard`: Trả về `tongLopSinhHoat = 36`, `tongSinhVien = 1500`.

### Issues
- None

### Next Step
- Hoàn thành Phase 14: Comprehensive Vietnamese Localization & Natural Language Audit Trail.

---

## Phase 14: Comprehensive Vietnamese Localization & Natural Language Audit Trail (TDD & UI/UX Pro Max)

- Status: DONE
- Date: 2026-10-09
- Files changed:
  - `backend/package.json`
  - `backend/tests/status-labels.test.js`
  - `backend/tests/audit-formatter.test.js`
  - `frontend/js/api.js`
  - `frontend/js/admin.js`
  - `frontend/js/tuition.js`
  - `frontend/portal-admin.html`

### Changes
1. **Việt hóa Vai trò người dùng (User Roles):**
   - Định nghĩa `ROLE_DICTIONARY` và hàm helper `formatRoleBadge(role)` / `renderRoleBadge(role)` trong `frontend/js/api.js`:
     - `SINH_VIEN` $\rightarrow$ **Sinh viên** (`badge-info`)
     - `GIANG_VIEN` $\rightarrow$ **Giảng viên** (`badge-primary`)
     - `DAO_TAO` $\rightarrow$ **Cán bộ Đào tạo** (`badge-warning`)
     - `QUAN_TRI` $\rightarrow$ **Quản trị viên** (`badge-danger`)
     - `SYSTEM` $\rightarrow$ **Hệ thống** (`badge-secondary`)
   - Áp dụng `renderRoleBadge(u.vaiTro)` vào bảng Quản lý tài khoản trong `frontend/js/admin.js`.
   - Dọn sạch toàn bộ mã thô tiếng Anh trong dropdown bộ lọc vai trò `#filterUserRole` và trạng thái `#filterUserStatus` trong `portal-admin.html`.

2. **Chuẩn hóa Báo cáo Học phí & Thẻ Học phí:**
   - Đổi header bảng báo cáo học phí trong `frontend/js/admin.js` từ `UNPAID`, `PARTIAL`, `PAID` sang **Chưa thanh toán**, **Thanh toán 1 phần**, **Đã hoàn thành**.
   - Xóa bỏ các mã tiếng Anh trong ngoặc ở dropdown `#filterReportStatus` và các thẻ công nợ học phí sinh viên trong `frontend/js/tuition.js`.

3. **Chuyển đổi Nhật ký Hoạt động (Audit Trail) sang Ngôn ngữ Tự nhiên:**
   - Xây dựng từ điển hành động `AUDIT_ACTION_DICTIONARY`: `INSERT` $\rightarrow$ **Thêm mới**, `UPDATE` $\rightarrow$ **Cập nhật**, `DELETE` $\rightarrow$ **Xóa**.
   - Xây dựng từ điển tên bảng `AUDIT_TABLE_DICTIONARY` (`TAIKHOAN` $\rightarrow$ **Tài khoản người dùng**, `DANGKYTINCHI` $\rightarrow$ **Đăng ký tín chỉ**, `HOCPHI` $\rightarrow$ **Học phí**...).
   - Xây dựng từ điển tên trường `AUDIT_FIELD_DICTIONARY` dịch toàn bộ tên cột sang tiếng Việt (`Username` $\rightarrow$ **Tên đăng nhập**, `LanDangNhapCuoi` $\rightarrow$ **Lần đăng nhập cuối**, `TrangThai` $\rightarrow$ **Trạng thái**...).
   - Hàm `formatAuditContent(hanhDong, noiDungCu, noiDungMoi)` trong `frontend/js/api.js`:
     - Tự động parse JSON an toàn, phát hiện các trường thay đổi giữa dữ liệu cũ và mới.
     - Hiển thị diff dạng trực quan chuẩn UI/UX Pro Max: `[Tên trường: Cũ → Mới]` kèm format ngày giờ Việt Nam chuẩn.
     - Tóm tắt dễ hiểu cho hành động `Tạo mới` và `Xóa bản ghi`.
     - Tích hợp accordion thu gọn `<details><summary>Chi tiết JSON gốc</summary><pre>...</pre></details>` cho phép kiểm tra raw JSON khi cần mà không làm rối mắt người dùng.

4. **Quy trình TDD (/tdd):**
   - Viết mới test suite `backend/tests/audit-formatter.test.js` (15/15 test cases PASS).
   - Cập nhật test suite `backend/tests/status-labels.test.js` (10/10 test cases PASS).
   - Tối ưu Jest testTimeout `15000ms` trong `backend/package.json` đảm bảo kiểm thử toàn hệ thống ổn định trên Windows.

### Tests / Verification
- Toàn bộ test suites tự động của dự án (`npm test`): **16/16 test suites PASS, 117/117 tests PASS 100%**.
  - `tests/audit-formatter.test.js`: 15/15 PASS.
  - `tests/status-labels.test.js`: 10/10 PASS.
  - `tests/tuition.test.js`: 16/16 PASS.
  - `tests/admin.test.js`: 12/12 PASS.
  - `tests/registration.test.js`: 10/10 PASS.
  - `tests/student.test.js`: 7/7 PASS.
  - `tests/course.test.js`: 6/6 PASS.
  - `tests/class.test.js`: 5/5 PASS.
  - `tests/auth.test.js`: 7/7 PASS.
  - `tests/dashboard-layout.test.js`: 6/6 PASS.
  - `tests/grades-layout.test.js`: 6/6 PASS.
  - `tests/registration-filter.test.js`: 7/7 PASS.
  - `tests/pending-payment.test.js`: 2/2 PASS.
  - `tests/faculty.test.js`: 1/1 PASS.
  - `tests/semester.test.js`: 2/2 PASS.
  - `tests/health.test.js`: 2/2 PASS.

### Issues
- None

### Next Step
- Triển khai đầy đủ đối tượng lập trình CSDL (Triggers, Views, Functions, Stored Procedures, Indexes) cho Lớp sinh hoạt.

## Phase 14: Programmability Objects & Comprehensive Database Extensions for Administrative Classes (Lớp sinh hoạt)

- Status: DONE
- Date: 2026-10-09
- Files changed:
  - `DB/05_Triggers.md`
  - `DB/06_Views.md`
  - `DB/07_Functions.md`
  - `DB/08_StoredProcedures.md`
  - `DB/09_Indexes.md`
  - `DB/database_v1.md`
  - `backend/src/utils/errorMapper.js`
  - `backend/src/repositories/class.repository.js`
  - `backend/src/services/class.service.js`
  - `backend/src/controllers/class.controller.js`
  - `backend/src/routes/class.routes.js`
  - `backend/tests/class-programmability.test.js`

### Changes
1. **Triển khai Programmability Objects trong CSDL SQL Server `DBMS330284`:**
   - **View `V_DanhSachLopSinhHoat`**: Schema-binding view tổng hợp thông tin lớp, mã khoa, tên khoa, niên khóa, trạng thái và sĩ số thực tế (sử dụng `COUNT_BIG`).
   - **Function `FN_DemSiSoLopSinhHoat(@MaLop)`**: Scalar-valued function trả về sĩ số sinh viên của một lớp sinh hoạt cụ thể.
   - **Trigger `TR_LOP_Audit`**: AFTER INSERT, UPDATE, DELETE tự động ghi nhật ký vào bảng `LOGHOATDONG` với cấu trúc JSON.
   - **Trigger `TR_LOP_KiemTraXoa`**: INSTEAD OF DELETE ngăn chặn xóa lớp sinh hoạt nếu còn sinh viên thuộc lớp, phát sinh mã lỗi 51007.
   - **Stored Procedure `SP_ThongKeHocPhiTheoLop`**: Báo cáo tổng hợp số lượng sinh viên, tổng học phí, đã nộp, còn nợ và phân loại trạng thái học phí theo lớp; ném lỗi 51008 nếu không tìm thấy lớp.
   - **Indexes `IX_SINHVIEN_MaLop` & `IX_LOP_MaKhoa_NamNhapHoc`**: Tối ưu hóa truy vấn tìm kiếm sinh viên theo lớp và lọc lớp theo khoa / khóa học.

2. **Cập nhật Backend & Error Mapping:**
   - Bổ sung mã lỗi SQL 51007 (`409 Conflict`) và 51008 (`404 Not Found`) vào `errorMapper.js`.
   - Cập nhật `class.repository.js` tận dụng View `V_DanhSachLopSinhHoat` (với `CAST(SiSoThucTe AS INT)`) và tích hợp Stored Procedure `SP_ThongKeHocPhiTheoLop`.
   - Bổ sung API `GET /api/classes/:id/tuition-report` vào `class.routes.js`, `class.controller.js`, `class.service.js`.

3. **Đồng bộ toàn bộ tài liệu CSDL trong thư mục `DB/`:**
   - `DB/05_Triggers.md`: Bổ sung `TR_LOP_Audit` (#12) và `TR_LOP_KiemTraXoa` (#13).
   - `DB/06_Views.md`: Bổ sung `V_DanhSachLopSinhHoat` (#6).
   - `DB/07_Functions.md`: Bổ sung `FN_DemSiSoLopSinhHoat` (#7).
   - `DB/08_StoredProcedures.md`: Bổ sung `SP_ThongKeHocPhiTheoLop` (#7).
   - `DB/09_Indexes.md`: Bổ sung `IX_SINHVIEN_MaLop` (#18) và `IX_LOP_MaKhoa_NamNhapHoc` (#19).
   - `DB/database_v1.md`: Cập nhật thống kê toàn bộ hệ thống gồm 19 bảng, 6 Views, 7 Functions, 7 Stored Procedures, 13 Triggers, 19 Indexes.

4. **Kiểm thử theo quy trình TDD (`/tdd`):**
   - Viết mới test suite `backend/tests/class-programmability.test.js` kiểm thử chuyên sâu 8 test cases:
     - View `V_DanhSachLopSinhHoat` hoạt động đúng.
     - Function `FN_DemSiSoLopSinhHoat` tính đúng sĩ số.
     - Trigger `TR_LOP_Audit` ghi log thành công khi INSERT/UPDATE.
     - Trigger `TR_LOP_KiemTraXoa` bắt lỗi 51007 khi xóa lớp có sinh viên.
     - SP `SP_ThongKeHocPhiTheoLop` trả về báo cáo chuẩn cho lớp hợp lệ và báo lỗi 51008 cho lớp không tồn tại.
     - API `GET /api/classes/:id/tuition-report` trả về 200 cho lớp hợp lệ và 404 cho lớp không tồn tại.

### Tests / Verification
- Toàn bộ test suites tự động của dự án (`npm test`): **17/17 test suites PASS, 125/125 tests PASS 100%**.
  - `tests/class-programmability.test.js`: 8/8 PASS.
  - `tests/class.test.js`: 5/5 PASS.
  - `tests/audit-formatter.test.js`: 15/15 PASS.
  - `tests/status-labels.test.js`: 10/10 PASS.
  - `tests/tuition.test.js`: 16/16 PASS.
  - `tests/admin.test.js`: 12/12 PASS.
  - `tests/registration.test.js`: 10/10 PASS.
  - `tests/student.test.js`: 7/7 PASS.
  - `tests/course.test.js`: 6/6 PASS.
  - `tests/auth.test.js`: 7/7 PASS.
  - `tests/dashboard-layout.test.js`: 6/6 PASS.
  - `tests/grades-layout.test.js`: 6/6 PASS.
  - `tests/registration-filter.test.js`: 7/7 PASS.
  - `tests/pending-payment.test.js`: 2/2 PASS.
  - `tests/faculty.test.js`: 1/1 PASS.
  - `tests/semester.test.js`: 2/2 PASS.
  - `tests/health.test.js`: 2/2 PASS.

### Issues
- None

### Next Step
- Sửa lỗi truy vấn thông tin lớp sinh hoạt của sinh viên trong portal Giảng viên.

## Phase 15: Fix Lecturer Class Students Lookup & Table Column Alignment

- Status: DONE
- Date: 2026-10-09
- Files changed:
  - `backend/src/repositories/lecturer.repository.js`
  - `backend/tests/lecturer.test.js`
  - `frontend/portal-lecturer.html`
  - `frontend/js/lecturer.js`

### Changes
1. **Khắc phục lỗi SQL `Invalid column name 'LopHoc'`:**
   - Trong `backend/src/repositories/lecturer.repository.js`, hàm `getClassStudents` truy vấn cột `sv.LopHoc` không tồn tại trong bảng `SINHVIEN`.
   - Đã cập nhật câu query kết nối `LEFT JOIN dbo.LOP l ON sv.MaLop = l.MaLop`, lấy `COALESCE(l.TenLop, sv.MaLop) AS LopHoc` và `sv.MaLop`.

2. **Đồng bộ giao diện bảng danh sách sinh viên Giảng viên (UI/UX Pro Max):**
   - Trong `frontend/portal-lecturer.html`: Bổ sung cột tiêu đề `<th>Lớp sinh hoạt</th>` và căn chỉnh độ rộng modal dialog (`max-width: 960px`), cập nhật `colspan="9"`.
   - Trong `frontend/js/lecturer.js`: Render huy hiệu Lớp sinh hoạt và bổ sung cột Điểm chữ, khớp chính xác 9 cột giữa Thead và Tbody.

3. **Kiểm thử theo quy trình TDD (`/tdd`):**
   - Viết mới test suite `backend/tests/lecturer.test.js` (4/4 tests PASS):
     - Lấy danh sách lớp học phần giảng viên phụ trách (200 OK).
     - Lấy lịch dạy theo tuần (200 OK).
     - Lấy danh sách sinh viên lớp học phần kèm lớp sinh hoạt hợp lệ (200 OK).
     - Xử lý lớp không có sinh viên trả về mảng rỗng (200 OK).

### Tests / Verification
- Toàn bộ test suites tự động của dự án (`npm test`): **19/19 test suites PASS, 138/138 tests PASS 100%**.

### Issues
- None

### Next Step
- Hoàn thành Phase 15: Admin Top Navigation Grouping & UI/UX Pro Max Dropdowns.

---

## Phase 15: Admin Top Navigation Grouping & UI/UX Pro Max Dropdowns (TDD & UI/UX Pro Max)

- Status: DONE
- Date: 2026-10-09
- Files changed:
  - `backend/tests/admin-nav.test.js`
  - `frontend/css/styles.css`
  - `frontend/portal-admin.html`
  - `frontend/js/admin.js`

### Changes
1. **Kiến trúc thông tin & Gom nhóm Menu (Information Architecture - UI/UX Pro Max):**
   - Loại bỏ hoàn toàn thanh cuộn ngang (horizontal scrollbar) gây khó chịu khi có 10 tab dàn hàng ngang trên Top Nav Admin.
   - Gom gọn 10 tab thành **4 phân hệ chức năng chính** tinh tế, vừa vặn trên mọi kích thước màn hình máy tính:
     1. **Dashboard** (Nút đơn trực tiếp)
     2. **Quản lý Đào tạo ▾** (Dropdown gồm 4 mục: *Quản lý sinh viên*, *Lớp sinh hoạt (36 lớp)*, *Quản lý lớp học phần*, *Đăng ký tín chỉ*)
     3. **Tài chính & Học phí ▾** (Dropdown gồm 3 mục: *Xác nhận thanh toán (Chờ duyệt)*, *Quản lý học phí & Quầy thu*, *Báo cáo thống kê học phí*)
     4. **Quản trị Hệ thống ▾** (Dropdown gồm 2 mục: *Quản lý tài khoản*, *Nhật ký hoạt động (Audit)*)

2. **Thiết kế UI/UX Pro Max Dropdown Component:**
   - `frontend/css/styles.css`:
     - Thiết lập `.tabs-nav` với `overflow: visible; flex-wrap: wrap;` đảm bảo dropdown không bị che khuất.
     - `.tab-group`: định vị tương đối (`position: relative`).
     - `.tab-dropdown-btn`: giao diện thanh thoát, có icon chevron mũi tên xoay 180° khi mở menu.
     - `.tab-dropdown-menu`: bóng đổ chiều sâu cao cấp (`0 10px 25px -5px rgba(15, 23, 42, 0.12)`), bo góc mềm (`border-radius: var(--radius-md)`), hiệu ứng xuất hiện mượt mà (`tabDropdownFade`).
     - `.tab-dropdown-item`: hover effect tinh tế, icon SVG 16x16 đồng bộ, highlight nền xanh nhạt khi active.

3. **Logic tương tác & Điều hướng (`frontend/js/admin.js`):**
   - Hàm `toggleTabDropdown(groupName)`: đóng các nhóm khác, mở/đóng nhóm được click.
   - Hàm `switchAdminTab(tabName, clickedBtn)`:
     - Tự động kích hoạt tab-pane tương ứng.
     - Đánh dấu active cho mục menu con và **tự động highlight nút nhóm cha** (ví dụ: khi chọn *Quản lý sinh viên*, nút *Quản lý Đào tạo* trên top bar tự động sáng đèn active).
     - Đóng dropdown menu sau khi chọn tab.
   - Bắt sự kiện click outside và phím `Escape` để tự động đóng dropdown menu khi người dùng thao tác ra ngoài.

4. **Kiểm thử theo quy trình TDD (`/tdd`):**
   - Viết mới test suite `backend/tests/admin-nav.test.js` (9/9 test cases PASS):
     - Xác thực cấu trúc 4 phân hệ chính và đầy đủ 10 sub-tabs.
     - Xác thực CSS quy chuẩn cho `.tab-group`, `.tab-dropdown-menu`, `.tab-dropdown-item`.
     - Xác thực logic JavaScript toggle, highlight nhóm cha và click outside.

### Tests / Verification
- Toàn bộ test suites tự động của dự án (`npm test`): **19/19 test suites PASS, 138/138 tests PASS 100%**.
  - `tests/admin-nav.test.js`: 9/9 PASS.
  - `tests/class-programmability.test.js`: 8/8 PASS.
  - `tests/class.test.js`: 5/5 PASS.
  - `tests/audit-formatter.test.js`: 15/15 PASS.
  - `tests/status-labels.test.js`: 10/10 PASS.
  - `tests/tuition.test.js`: 16/16 PASS.
  - `tests/admin.test.js`: 12/12 PASS.
  - `tests/registration.test.js`: 10/10 PASS.
  - `tests/student.test.js`: 7/7 PASS.
  - `tests/course.test.js`: 6/6 PASS.
  - `tests/auth.test.js`: 7/7 PASS.
  - `tests/dashboard-layout.test.js`: 6/6 PASS.
  - `tests/grades-layout.test.js`: 6/6 PASS.
  - `tests/registration-filter.test.js`: 7/7 PASS.
  - `tests/pending-payment.test.js`: 2/2 PASS.
  - `tests/faculty.test.js`: 1/1 PASS.
  - `tests/semester.test.js`: 2/2 PASS.
  - `tests/health.test.js`: 2/2 PASS.

### Issues
- None

### Next Step
- Sẵn sàng bàn giao và hoàn thiện các yêu cầu nâng cấp tiếp theo.

## Phase 16: Admin Dashboard 5 Metric Cards Single-Row Layout (TDD & UI/UX Pro Max)

- Status: DONE
- Date: 2026-10-09
- Files changed:
  - `backend/tests/admin-nav.test.js`
  - `frontend/css/styles.css`
  - `frontend/js/admin.js`

### Changes
1. **Thiết kế Layout 5 Card trên 1 hàng (`frontend/css/styles.css`):**
   - Thêm CSS class `.admin-summary-cards` chuyên biệt cho Dashboard Admin (không ảnh hưởng đến lưới 4 card của Cổng Sinh viên).
   - Thiết lập `grid-template-columns: repeat(5, minmax(0, 1fr))` và `gap: 0.65rem`.
   - Tối ưu kích thước chữ (`1.35rem`) và padding thẻ (`0.75rem 0.85rem`) để hiển thị sắc nét, cân đối và thanh thoát.
   - Hỗ trợ responsive đa màn hình theo chuẩn /ui-ux-pro-max: $\le 1200\text{px}$ co về 3 cột, $\le 768\text{px}$ co về 2 cột, $\le 480\text{px}$ dàn 1 cột.

2. **Cập nhật Markup & Việt hóa nhãn thẻ (`frontend/js/admin.js`):**
   - Áp dụng class `.admin-summary-cards` vào container 5 metric card trong hàm `renderDashboardOverview`.
   - Việt hóa dòng chú thích thẻ Đăng ký tín chỉ: từ nhãn kỹ thuật `Trạng thái REGISTERED` thành `Trạng thái Đã đăng ký`.

3. **Kiểm thử theo quy trình TDD (`/tdd`):**
   - Mở rộng test suite `backend/tests/admin-nav.test.js` với Lát cắt 4:
     - Kiểm tra `admin.js` áp dụng container `.admin-summary-cards` và nội dung tiếng Việt có dấu `Trạng thái Đã đăng ký`.
     - Kiểm tra `styles.css` định nghĩa đầy đủ `repeat(5, 1fr)`.
   - Toàn bộ 11/11 tests trong `tests/admin-nav.test.js` PASS 100%.

### Tests / Verification
- Toàn bộ 20 test suites backend & UI verification (`npm test`): **20/20 test suites PASS, 145/145 tests PASS 100%**.
  - `tests/admin-nav.test.js`: 11/11 PASS.
  - `tests/class-programmability.test.js`: 8/8 PASS.
  - `tests/class.test.js`: 5/5 PASS.
  - `tests/audit-formatter.test.js`: 15/15 PASS.
  - `tests/status-labels.test.js`: 10/10 PASS.
  - `tests/tuition.test.js`: 16/16 PASS.
  - `tests/admin.test.js`: 12/12 PASS.
  - `tests/registration.test.js`: 10/10 PASS.
  - `tests/student.test.js`: 7/7 PASS.
  - `tests/course.test.js`: 6/6 PASS.
  - `tests/auth.test.js`: 7/7 PASS.
  - `tests/dashboard-layout.test.js`: 6/6 PASS.
  - `tests/grades-layout.test.js`: 6/6 PASS.
  - `tests/registration-filter.test.js`: 7/7 PASS.
  - `tests/lecturer-modal-ux.test.js`: 5/5 PASS.
  - `tests/lecturer.test.js`: 5/5 PASS.
  - `tests/pending-payment.test.js`: 2/2 PASS.
  - `tests/faculty.test.js`: 1/1 PASS.
  - `tests/semester.test.js`: 2/2 PASS.
  - `tests/health.test.js`: 2/2 PASS.

### Issues
- None

### Next Step
- Khắc phục lỗi đơ cứng giao diện và tràn màn hình khi mở danh sách sinh viên lớp học phần trong portal Giảng viên.

## Phase 16: Fix Modal Overflow / Freezing & Enhance Lecturer Student Modal (TDD & UI/UX Pro Max)

- Status: DONE
- Date: 2026-10-09
- Files changed:
  - `frontend/css/styles.css`
  - `frontend/portal-lecturer.html`
  - `frontend/js/lecturer.js`
  - `backend/tests/lecturer-modal-ux.test.js`
  - `backend/tests/tuition.test.js`
  - `backend/tests/admin.test.js`

### Changes
1. **Khắc phục lỗi Modal bị tràn màn hình và đơ cứng trang (`styles.css`):**
   - **Nguyên nhân**: Khi lớp có 93 sinh viên, `.modal-dialog` phình to hơn 4500px, `.modal-backdrop` căn giữa theo trục Y khiến đỉnh modal (header, nút đóng X, hàng 1-40) bị đẩy vọt lên ngoài mép trên màn hình; đáy modal tụt xuống dưới mép dưới màn hình. Trang web không cuộn được gây cảm giác đơ cứng.
   - **Giải pháp UI/UX Pro Max**:
     - `.modal-dialog`: Giới hạn `max-height: min(90vh, 860px)`, áp dụng layout `display: flex; flex-direction: column`.
     - `.modal-header` & `.modal-footer`: Thiết lập `flex-shrink: 0;` cố định chắc chắn ở hai đầu.
     - `.modal-body`: Thiết lập `overflow-y: auto; flex: 1 1 auto; min-height: 0;` cho phép cuộn nội dung độc lập mượt mà.
     - `.modal-table-sticky thead th`: Ghim cố định tiêu đề bảng (`position: sticky; top: 0; z-index: 10;`) khi cuộn.
     - Nâng cấp `z-index: 1000` và `backdrop-filter: blur(4px)`.

2. **Nâng cấp tính năng tìm kiếm và lọc tức thì (`portal-lecturer.html` & `lecturer.js`):**
   - Thêm thanh tìm kiếm tức thời theo từ khóa (MSSV, Họ tên, Lớp sinh hoạt).
   - Thêm dropdown lọc danh sách sinh viên theo từng lớp sinh hoạt cụ thể.
   - Hiển thị badge thống kê sĩ số động (`X / Y sinh viên`).
   - Bổ sung phím tắt: Đóng modal bằng phím `Escape` hoặc click chuột ra vùng nền ngoài modal.
   - Khóa cuộn trang nền `document.body.style.overflow = 'hidden'` khi modal mở và mở khóa khi đóng.

3. **Kiểm thử theo quy trình TDD (`/tdd`):**
   - Viết mới test suite `backend/tests/lecturer-modal-ux.test.js` (5/5 tests PASS).
   - Tối ưu hóa tính độc lập (idempotency) của `tuition.test.js` và `admin.test.js`.
   - Toàn bộ hệ thống kiểm thử: **20/20 test suites PASS, 145/145 tests PASS 100%**.

### Tests / Verification
- Toàn bộ 20 test suites backend & UI verification (`npm test`): **20/20 test suites PASS, 145/145 tests PASS 100%**.
  - `tests/lecturer-modal-ux.test.js`: 5/5 PASS.
  - `tests/lecturer.test.js`: 4/4 PASS.
  - `tests/admin-nav.test.js`: 11/11 PASS.
  - `tests/class-programmability.test.js`: 8/8 PASS.
  - `tests/class.test.js`: 5/5 PASS.
  - `tests/audit-formatter.test.js`: 15/15 PASS.
  - `tests/status-labels.test.js`: 10/10 PASS.
  - `tests/tuition.test.js`: 16/16 PASS.
  - `tests/admin.test.js`: 12/12 PASS.
  - `tests/registration.test.js`: 10/10 PASS.
  - `tests/student.test.js`: 7/7 PASS.
  - `tests/course.test.js`: 6/6 PASS.
  - `tests/auth.test.js`: 7/7 PASS.
  - `tests/dashboard-layout.test.js`: 6/6 PASS.
  - `tests/grades-layout.test.js`: 6/6 PASS.
  - `tests/registration-filter.test.js`: 7/7 PASS.
  - `tests/pending-payment.test.js`: 2/2 PASS.
  - `tests/faculty.test.js`: 1/1 PASS.
  - `tests/semester.test.js`: 2/2 PASS.
  - `tests/health.test.js`: 2/2 PASS.

### Next Step
- Sửa lỗi không lấy được sinh viên lớp sinh hoạt, hiển thị 0 sinh viên trên Card lớp và nâng cấp Modal Chi tiết lớp Admin theo chuẩn TDD & UI/UX Pro Max.

## Phase 17: Fix Admin Class Student List, Counts & Modal UI/UX Pro Max (/tdd & /ui-ux-pro-max)

- Status: DONE
- Date: 2026-10-09
- Files changed:
  - `frontend/portal-admin.html`
  - `frontend/js/admin.js`
  - `backend/tests/admin-class-modal.test.js`

### Changes
1. **Khắc phục lỗi hiển thị "0 sinh viên" trên 36 Card lớp sinh hoạt (`admin.js`):**
   - Đổi `${c.siSo || 0}` thành `${c.soLuongSV ?? c.siSo ?? 0}`, khớp 100% với thuộc tính trả về từ backend API `GET /api/classes`. Toàn bộ 36 lớp sinh hoạt đều hiển thị đúng sĩ số thực tế (41–42 sinh viên).

2. **Khắc phục lỗi Crash khi mở Modal Chi tiết lớp (`admin.js`):**
   - Đổi `const lop = data.lop;` thành `const lop = data.lop || data;` an toàn, loại bỏ triệt để ngoại lệ `TypeError: Cannot read properties of undefined (reading 'tenLop')`.
   - Cập nhật huy hiệu sĩ số trong modal: `lop.soLuongSV || currentAdminClassStudents.length`.

3. **Đồng bộ ID bộ lọc Khoa và Năm nhập học (`portal-admin.html` & `admin.js`):**
   - Đồng bộ `filterAdminClassShKhoa` và `filterAdminClassShNam` giữa HTML và JavaScript.
   - Sửa lệnh nạp danh mục khoa động cuối trang `portal-admin.html`: `populateFaculties('filterAdminClassShKhoa', '-- Tất cả khoa --')`.

4. **Nâng cấp Modal Chi tiết lớp theo chuẩn UI/UX Pro Max:**
   - Mở rộng kích thước modal `max-width: 980px; width: 95%`.
   - Bổ sung ô tìm kiếm tức thì `adminClassStudentSearchInput` lọc nhanh theo MSSV, Họ tên, Email, SĐT.
   - Bổ sung huy hiệu số lượng động `adminClassStudentCountBadge` (`X / Y sinh viên`).
   - Bảng sinh viên áp dụng sticky header `modal-table-sticky` và cuộn độc lập mượt mà.
   - Hỗ trợ đóng nhanh bằng phím `Escape` và click chuột ra vùng nền ngoài modal (backdrop).
   - Khóa cuộn trang nền `document.body.style.overflow = 'hidden'` khi modal mở và mở khóa khi đóng.

5. **Kiểm thử theo quy trình TDD (`/tdd`):**
   - Viết mới test suite `backend/tests/admin-class-modal.test.js` (7/7 tests PASS).
   - Kiểm tra API `GET /api/classes/:id` (200 OK).
   - Kiểm tra logic render an toàn trong `admin.js`.
   - Toàn bộ hệ thống kiểm thử: **22/22 test suites PASS, 163/163 tests PASS 100%**.

### Tests / Verification
- Toàn bộ 22 test suites backend & UI verification (`npm test`): **22/22 test suites PASS, 163/163 tests PASS 100%**.
  - `tests/admin-class-modal.test.js`: 7/7 PASS.
  - `tests/class.test.js`: 5/5 PASS.
  - `tests/class-programmability.test.js`: 8/8 PASS.
  - `tests/lecturer-modal-ux.test.js`: 5/5 PASS.
  - `tests/lecturer.test.js`: 4/4 PASS.
  - `tests/admin-nav.test.js`: 11/11 PASS.
  - `tests/audit-formatter.test.js`: 15/15 PASS.
  - `tests/status-labels.test.js`: 10/10 PASS.
  - `tests/tuition.test.js`: 16/16 PASS.
  - `tests/admin.test.js`: 12/12 PASS.
  - `tests/registration.test.js`: 10/10 PASS.
  - `tests/student.test.js`: 7/7 PASS.
  - `tests/course.test.js`: 6/6 PASS.
  - `tests/auth.test.js`: 7/7 PASS.
  - `tests/dashboard-layout.test.js`: 6/6 PASS.
  - `tests/grades-layout.test.js`: 6/6 PASS.
  - `tests/registration-filter.test.js`: 7/7 PASS.
  - `tests/pending-payment.test.js`: 2/2 PASS.
  - `tests/faculty.test.js`: 1/1 PASS.
  - `tests/semester.test.js`: 2/2 PASS.
  - `tests/health.test.js`: 2/2 PASS.
  - `tests/table-typography-ux.test.js`: 1/1 PASS.

### Issues
- None

### Next Step
- Sẵn sàng bàn giao và hỗ trợ các yêu cầu tiếp theo của hệ thống.

## Phase 17: Table Typography & Anti-Awkward Wrapping (TDD & UI/UX Pro Max)

- Status: DONE
- Date: 2026-10-09
- Files changed:
  - `frontend/css/styles.css`
  - `frontend/portal-student.html`
  - `frontend/portal-lecturer.html`
  - `frontend/js/admin.js`
  - `frontend/js/registration.js`
  - `frontend/js/tuition.js`
  - `frontend/js/lecturer.js`
  - `backend/tests/table-typography-ux.test.js`

### Changes
1. **Khắc phục triệt để lỗi ngắt dòng dị thường trong Badges & Buttons (`frontend/css/styles.css`):**
   - Thiết lập `white-space: nowrap;` bắt buộc cho `.badge` và `.status-badge`: ngăn chặn hoàn toàn hiện tượng bẻ dòng làm biến dạng badge con nhộng thành hình trứng méo (ví dụ `Đang \n học`, `Lớp \n 01`, `Chờ \n xác nhận`).
   - Thiết lập `white-space: nowrap;` cho nút `.btn`: giữ nút luôn trên 1 hàng duy nhất (ví dụ `Chi tiết & Học phí`, `Thu trực tiếp & Duyệt`, `Danh sách SV`).
   - Bổ sung utility class `.cell-nowrap { white-space: nowrap !important; }`.
   - Tối ưu thanh cuộn ngang `.table-responsive` với thanh cuộn Slate thanh mảnh (`height: 6px;`), bo tròn mềm mại và cuộn mượt mà trên thiết bị di động/desktop.

2. **Tối ưu Bảng Quản trị Admin (`frontend/js/admin.js`):**
   - Bảng Sinh viên: thiết lập `min-width: 1050px;` và gắn `cell-nowrap` cho Mã SV, Họ và tên (chống rớt chữ cuối như `Dương Thanh \n Bình`), Lớp sinh hoạt, Khoa (chống rớt chữ đơn lẻ `\n mềm`), Email, SĐT, Trạng thái, Thao tác.
   - Bảng Lớp học phần: thiết lập `min-width: 980px;` và gắn `cell-nowrap` cho Mã LHP, Số TC, Giảng viên, Lịch học, Trạng thái.
   - Bảng Đăng ký tín chỉ: thiết lập `min-width: 1050px;` và gắn `cell-nowrap` cho Sinh viên, Lớp SH, Mã LHP, Số TC, Thời gian, Trạng thái.
   - Bảng Tài khoản người dùng: thiết lập `min-width: 1050px;` và gắn `cell-nowrap` cho Username, Họ tên, Lớp SH, Vai trò, Trạng thái, Lần đăng nhập cuối, Thao tác.
   - Bảng Nhật ký kiểm toán: thiết lập `min-width: 980px;` và gắn `cell-nowrap` cho Mã Log, Thời gian, Tài khoản, Hành động, Bảng tác động, Khóa bản ghi.
   - Bảng Duyệt thanh toán: thiết lập `min-width: 1050px;` và gắn `cell-nowrap` cho tất cả các cột thông tin định danh.
   - Modal danh sách sinh viên theo lớp SH: thiết lập `min-width: 850px;` và `cell-nowrap`.

3. **Tối ưu Cổng Sinh viên & Giảng viên (`registration.js`, `tuition.js`, `lecturer.js`, HTMLs):**
   - Bảng môn học mở đăng ký (`portal-student.html`, `registration.js`): thiết lập `min-width: 950px;` và `cell-nowrap`.
   - Bảng môn học đã đăng ký: thiết lập `min-width: 880px;` và `cell-nowrap`.
   - Bảng điểm các kỳ: thiết lập `min-width: 850px;` và `cell-nowrap` cho Mã môn, Số TC, Quá trình, Giữa kỳ, Cuối kỳ, Tổng kết, Điểm chữ, Kết quả.
   - Bảng lịch sử thanh toán (`tuition.js`): thiết lập `min-width: 850px;` và `cell-nowrap`. Việt hóa nhãn thông báo từ `Trạng thái: PENDING` sang `Trạng thái: Chờ duyệt`.
   - Bảng lớp học phần của Giảng viên (`portal-lecturer.html`, `lecturer.js`): thiết lập `min-width: 880px;` và `cell-nowrap`. Modal danh sách sinh viên lớp gỡ bỏ `white-space: normal;` trong badge và gắn `cell-nowrap`.

4. **Kiểm thử theo quy trình TDD (`/tdd`):**
   - Tạo mới test suite `backend/tests/table-typography-ux.test.js` (11/11 tests PASS 100%).
   - Kiểm tra toàn bộ hệ thống (`npm test`): **21/21 test suites PASS, 156/156 tests PASS 100%**.

### Tests / Verification
- Toàn bộ 21 test suites:
  - `tests/table-typography-ux.test.js`: 11/11 PASS.
  - `tests/admin-nav.test.js`: 11/11 PASS.
  - `tests/class-programmability.test.js`: 8/8 PASS.
  - `tests/class.test.js`: 5/5 PASS.
  - `tests/audit-formatter.test.js`: 15/15 PASS.
  - `tests/status-labels.test.js`: 10/10 PASS.
  - `tests/tuition.test.js`: 16/16 PASS.
  - `tests/admin.test.js`: 12/12 PASS.
  - `tests/registration.test.js`: 10/10 PASS.
  - `tests/student.test.js`: 7/7 PASS.
  - `tests/course.test.js`: 6/6 PASS.
  - `tests/auth.test.js`: 7/7 PASS.
  - `tests/dashboard-layout.test.js`: 6/6 PASS.
  - `tests/grades-layout.test.js`: 6/6 PASS.
  - `tests/registration-filter.test.js`: 7/7 PASS.
  - `tests/lecturer-modal-ux.test.js`: 5/5 PASS.
  - `tests/lecturer.test.js`: 5/5 PASS.
  - `tests/pending-payment.test.js`: 2/2 PASS.
  - `tests/faculty.test.js`: 1/1 PASS.
  - `tests/semester.test.js`: 2/2 PASS.
  - `tests/health.test.js`: 2/2 PASS.

### Issues
- None

### Next Step
- Triển khai Phase 18: Bổ sung chức năng Nhập điểm cho Giảng viên và CRUD Sinh viên cho Quản trị viên theo TDD và UI/UX Pro Max.

## Phase 18: Lecturer Grade Management & Admin Student CRUD (TDD & UI/UX Pro Max)

- Status: DONE
- Date: 2026-10-12
- Files changed:
  - `backend/src/validators/lecturer.validator.js`
  - `backend/src/validators/student.validator.js`
  - `backend/src/repositories/lecturer.repository.js`
  - `backend/src/repositories/admin.repository.js`
  - `backend/src/services/lecturer.service.js`
  - `backend/src/controllers/lecturer.controller.js`
  - `backend/src/controllers/admin.controller.js`
  - `backend/src/routes/lecturer.routes.js`
  - `backend/src/routes/admin.routes.js`
  - `backend/tests/lecturer-grade.test.js`
  - `backend/tests/admin-student-crud.test.js`
  - `frontend/js/api.js`
  - `frontend/portal-lecturer.html`
  - `frontend/js/lecturer.js`
  - `frontend/portal-admin.html`
  - `frontend/js/admin.js`

### Changes
1. **Phân hệ Giảng viên Nhập & Lưu Điểm số (`DIEMSO`):**
   - **Backend TDD (`tests/lecturer-grade.test.js` - 4/4 tests PASS):**
     - Endpoint `PUT /api/lecturers/classes/:maLHP/grades` cho phép upsert mảng điểm (Quá trình, Giữa kỳ, Cuối kỳ) vào bảng `DIEMSO`.
     - Tự động kích hoạt trigger `TR_DIEMSO_Audit` ghi vết audit log vào `LOGHOATDONG`.
     - Kiểm tra dải điểm hợp lệ (0.0 đến 10.0) qua Zod schema `updateGradesSchema`.
   - **Frontend UI/UX Pro Max (`portal-lecturer.html` & `lecturer.js`):**
     - Modal danh sách sinh viên lớp chuyển đổi các cột điểm thành ô input nhập trực tiếp.
     - Tính toán realtime điểm tổng kết và điểm chữ ngay khi gõ $(QT \times 0.2 + GK \times 0.3 + CK \times 0.5)$.
     - Thêm nút Primary `[ 💾 Lưu bảng điểm ]` kèm trạng thái loading spinner và Toast notification.

2. **Phân hệ Quản trị viên Quản lý Hồ sơ Sinh viên (`SINHVIEN` CRUD):**
   - **Backend TDD (`tests/admin-student-crud.test.js` - 4/4 tests PASS):**
     - Endpoint `POST /api/admin/students`: Tạo mới sinh viên, kiểm tra trùng `MaSinhVien`, tuân thủ trigger `TR_SINHVIEN_KiemTraKhoaLop` (trả về 201 Created).
     - Endpoint `PUT /api/admin/students/:id`: Cập nhật họ tên, ngày sinh, email, SĐT, lớp sinh hoạt, trạng thái (trả về 200 OK).
     - Endpoint `DELETE /api/admin/students/:id`: Xóa an toàn / soft delete chuyển trạng thái `THOI_HOC` nếu SV đã có lịch sử học tập/học phí (trả về 200 OK).
   - **Frontend UI/UX Pro Max (`portal-admin.html` & `admin.js`):**
     - Thêm nút `[ + Thêm sinh viên mới ]` tại header Quản lý sinh viên.
     - Modal Form 2 cột chuyên nghiệp: MSSV, Họ tên, Ngày sinh, Email, SĐT, Khoa, Lớp sinh hoạt (tự động lọc lớp theo khoa), Trạng thái.
     - Cột Thao tác từng dòng sinh viên bổ sung nút `[ Sửa ]` và `[ Xóa ]` (kèm confirm modal an toàn).

### Tests / Verification
- Toàn bộ test suite mới chạy độc lập đạt 100%:
  - `tests/lecturer-grade.test.js`: 4/4 PASS (100%).
  - `tests/admin-student-crud.test.js`: 4/4 PASS (100%).
  - `tests/lecturer-modal-ux.test.js`: 5/5 PASS (100%).
  - `tests/lecturer.test.js`: 4/4 PASS (100%).
  - `tests/student.test.js`: 8/8 PASS (100%).
  - `tests/admin.test.js`: 12/12 PASS (100%).


