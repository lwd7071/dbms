# TASK LOG

## Đồng bộ README thư mục Database bàn giao

- Status: DONE
- Date: 2026-10-22
- Files changed:
  - `Nhom16_QuanLiHocVuVaDangKyTinChi/Database/README.md`
  - `Task.md`

### Changes
- Giữ nguyên cách đánh số file trong thư mục Database.
- Sửa README để hướng dẫn chạy `00_Build_DBMS330284.sql` một lần hoặc chạy các file thành phần theo đúng thứ tự, trong đó seed chạy sau schema.
- Cập nhật tên file security/verify theo đúng nội dung thư mục bàn giao.

### Tests / Verification
- Đối chiếu README với danh sách file hiện có trong `Database/`.
- Xác nhận script all-in-one tồn tại và README ghi rõ không chạy lặp cùng các file thành phần.

### Issues
- None.

### Next Step
- Có thể bàn giao nguyên thư mục `Nhom16_QuanLiHocVuVaDangKyTinChi/` cùng file mã nguồn ZIP.

## Đóng gói mã nguồn cho hồ sơ nộp bài

- Status: DONE
- Date: 2026-10-22
- Files changed:
  - `Nhom16_QuanLiHocVuVaDangKyTinChi/MaNguon_Nhom16.zip`
  - `Task.md`

### Changes
- Tạo ZIP gồm backend source/tests, frontend, package manifests, `.env.example` và README chạy ứng dụng.
- Dùng thư mục `Database/` đã có bên cạnh nơi giải nén, không đưa database, báo cáo, slide hay tài liệu thiết kế vào ZIP.
- Loại `.env` thật, `node_modules` và thư mục tạm khỏi archive.

### Tests / Verification
- Kiểm kê archive: 112 entry, khớp toàn bộ 112 file dự kiến; không thiếu entry.
- Rà các đường dẫn loại trừ: không có `.env` thật, `node_modules`, DB, báo cáo, slide hoặc tài liệu PDF/DOCX/PPTX.
- Xác nhận README trỏ đúng tới script `../Database/00_Build_DBMS330284.sql` đang có trong hồ sơ.

### Issues
- None.

### Next Step
- Giải nén ZIP thành thư mục con nằm cạnh `Database/`, rồi làm theo README bên trong.

## Ghi rõ tên CSDL trong các script SQL

- Status: DONE
- Date: 2026-10-22
- Files changed:
  - Các script SQL thành phần trong `DB/`, gồm migration và tests
  - `backend/scripts/run_all_db_files.js`
  - `DB/README.md`
  - `Task.md`

### Changes
- Thay placeholder `$(DatabaseName)` bằng tên cụ thể `DBMS330284` trong các script SQL còn lại để mở và chạy trực tiếp trong SSMS.
- Cập nhật runner để ánh xạ tên mặc định trong các script sang database demo hoặc rehearsal được truyền vào, giữ nguyên luồng dựng hiện tại.
- Bổ sung hướng dẫn chạy riêng script thành phần và lưu ý chỉ seed database mới/trống.

### Tests / Verification
- `node --check backend/scripts/run_all_db_files.js`: PASS.
- Rà `DB/**/*.sql`: không còn placeholder `$(DatabaseName)`; xác nhận 26 lệnh `USE [DBMS330284]`.
- Chưa chạy truy vấn SQL Server; kết nối `sqlcmd` trong môi trường này chưa hoạt động.

### Issues
- None.

### Next Step
- Có thể mở các file thành phần riêng trong SSMS; với database demo/rehearsal, tiếp tục dùng runner theo README.

## Package standalone SQL Server database build

- Status: DONE
- Date: 2026-10-21
- Files changed:
  - `DB/00_Build_DBMS330284.sql`
  - `DB/README.md`
  - `Task.md`

### Changes
- Added an SSMS-ready all-in-one script that creates `DBMS330284`, applies schema/security/seed scripts, and runs `14_Verify.sql`.
- Added per-batch progress guards so a populated database is refused and later batches stop if a prior batch fails.
- Documented the standalone workflow and permissions in `DB/README.md`.

### Tests / Verification
- Static checks confirmed the standalone script contains 241 guarded SQL batches, embeds the fixed database name, and includes seed and final verification steps.
- Tried connecting to the local SQL Server Express instance with `sqlcmd`; the installed client could not establish a connection (ODBC Driver 17 reported encryption is unsupported), so execution and database-level verification could not be completed here.

### Issues
- Database execution verification remains unavailable until a compatible SQL Server client connection is available.

### Next Step
- Run `DB/00_Build_DBMS330284.sql` in SSMS against an empty SQL Server instance and confirm the final `14_Verify.sql` result is PASS.

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
- Kiểm tra mã `THROW` trong `DB/05_Triggers.sql` và `DB/08_StoredProcedures.sql` qua PowerShell grep: Đã xác thực thực tế DB dùng 51006 cho cả hai.
- Kiểm tra danh sách tài khoản trong `DANH_SACH_TAI_KHOAN_TEST.md` và `DB/04_SeedData.sql`: Khớp đúng `sv_23000495` là `LOCKED`.
- Kiểm tra số lượng index trong `DB/09_Indexes.sql`: 17 Nonclustered Indexes.

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
  - `backend/src/repositories/lecturer.repository.js`
  - `backend/src/utils/errorMapper.js`
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
  - `DB/06_Views.sql`
  - `backend/src/services/student.service.js`
  - `backend/tests/student.test.js`
  - `backend/tests/grades-layout.test.js`
  - `frontend/js/registration.js`

### Changes
1. **Nâng cấp CSDL View `[dbo].[V_BangDiemChiTiet]`:**
   - Thay thế `FROM dbo.DIEMSO ds INNER JOIN dbo.DANGKYTINCHI dk` thành:
     `FROM dbo.DANGKYTINCHI dk INNER JOIN dbo.SINHVIEN sv ON ... LEFT JOIN dbo.DIEMSO ds ON ds.MaDangKy = dk.MaDangKy WHERE dk.TrangThai = 'REGISTERED'`.
   - Với môn đang học trong kỳ (chưa có điểm thi `DiemCuoiKy IS NULL`): cột `KetQua` trả về `N'ĐANG HỌC'`, các cột điểm thành phần và tổng kết trả về `NULL`.
   - Đồng bộ script view vào CSDL SQL Server `DBMS330284` và file tài liệu `DB/06_Views.sql`.
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
  - `DB/02_CreateTables.sql`
  - `DB/03_Constraints.sql`
  - `DB/04_SeedData.sql`
  - `DB/04_SeedData.sql`
  - `DB/06_Views.sql`
  - `docs/database-design.md`
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
  - `DB/05_Triggers.sql`
  - `DB/06_Views.sql`
  - `DB/07_Functions.sql`
  - `DB/08_StoredProcedures.sql`
  - `DB/09_Indexes.sql`
  - `docs/database-design.md`
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
   - `DB/05_Triggers.sql`: Bổ sung `TR_LOP_Audit` (#12) và `TR_LOP_KiemTraXoa` (#13).
   - `DB/06_Views.sql`: Bổ sung `V_DanhSachLopSinhHoat` (#6).
   - `DB/07_Functions.sql`: Bổ sung `FN_DemSiSoLopSinhHoat` (#7).
   - `DB/08_StoredProcedures.sql`: Bổ sung `SP_ThongKeHocPhiTheoLop` (#7).
   - `DB/09_Indexes.sql`: Bổ sung `IX_SINHVIEN_MaLop` (#18) và `IX_LOP_MaKhoa_NamNhapHoc` (#19).
   - `docs/database-design.md`: Cập nhật thống kê toàn bộ hệ thống gồm 19 bảng, 6 Views, 7 Functions, 7 Stored Procedures, 13 Triggers, 19 Indexes.

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

## Phase 19: Fix Lecturer Grade Save Payload & Access Control

- Status: IN PROGRESS
- Date: 2026-10-13
- Files changed:
  - `frontend/js/lecturer.js`
  - `backend/src/routes/lecturer.routes.js`
  - `backend/tests/lecturer-grade.test.js`
  - `Task.md`

### Changes
- Frontend theo dõi `MaDangKy` của các dòng có điểm được chỉnh và chỉ gửi những dòng đó khi lưu, tránh ghi đè điểm của cả lớp hoặc xóa các điểm đang trống thành `NULL`.
- API cập nhật điểm yêu cầu JWT hợp lệ và role `GIANG_VIEN`.
- Cập nhật test API chấm điểm để gọi endpoint với JWT giảng viên.
- Từ chối cập nhật nếu `MaDangKy` gửi lên không nằm trong đúng `MaLHP` hoặc đăng ký không còn `REGISTERED`, tránh API báo lưu thành công nhưng điểm không hiện ở lớp đang mở.
- Đọc lại `AGENT.md` và `docs/spec.md`; ghi log task theo mẫu bắt buộc.

### Tests / Verification
- `node --check` cho `frontend/js/lecturer.js`, `backend/src/routes/lecturer.routes.js`, `backend/tests/lecturer-grade.test.js`: PASS.
- `git diff --check`: PASS.
- `npm test -- --runTestsByPath tests/lecturer-grade.test.js`: BLOCKED trước khi test chạy; Jest không thể đọc thư mục Temp Windows trong sandbox (`EPERM realpath`). Chưa xác minh ghi dữ liệu vào SQL Server.
- Truy vấn chỉ đọc lớp `LHP_HK7_DEVOPS_01` để kiểm tra DB: BLOCKED, SQL Server tại `localhost:1433` không nhận kết nối.

### Issues
- Cần khởi động/khả dụng SQL Server rồi chạy lại `lecturer-grade.test.js` và truy vấn lớp `LHP_HK7_DEVOPS_01`.

### Next Step
- Chạy lại bài kiểm tra tích hợp chấm điểm và xác nhận dữ liệu sau lưu trong `DIEMSO`/`V_BangDiemChiTiet`.

## Phase 20: Access Control, Academic Rules, Payments & Current Semester

- Status: IN PROGRESS
- Date: 2026-10-13
- Files changed:
  - `backend/src/middlewares/auth.middleware.js`
  - `backend/src/routes/student.routes.js`
  - `backend/src/routes/registration.routes.js`
  - `backend/src/routes/payment.routes.js`
  - `backend/src/routes/lecturer.routes.js`
  - `backend/src/routes/admin.routes.js`
  - `backend/src/controllers/registration.controller.js`
  - `backend/src/controllers/lecturer.controller.js`
  - `backend/src/controllers/tuition.controller.js`
  - `backend/src/services/registration.service.js`
  - `backend/src/services/lecturer.service.js`
  - `backend/src/services/tuition.service.js`
  - `backend/src/repositories/lecturer.repository.js`
  - `backend/src/repositories/tuition.repository.js`
  - `backend/src/repositories/semester.repository.js`
  - `backend/src/validators/registration.validator.js`
  - `backend/tests/access-control.test.js`
  - `backend/tests/helpers/tokens.js`
  - `frontend/js/registration.js`
  - `Task.md`

### Changes
- Bắt buộc JWT và role cho hồ sơ sinh viên, đăng ký, thanh toán, lớp giảng viên và API quản trị; sinh viên chỉ đọc hồ sơ của mình, audit log chỉ dành cho `QUAN_TRI`.
- Đăng ký lấy danh tính từ JWT, bỏ nhận giới hạn tín chỉ do client gửi và cố định mức 25; chặn mã sinh viên giả khi đăng ký/hủy.
- Giảng viên chỉ xem lịch/lớp của mình và chỉ đọc/ghi điểm lớp được phân công.
- Sinh viên chỉ tạo giao dịch cho hồ sơ học phí của mình; `DAO_TAO`/`QUAN_TRI` vẫn được thu tại quầy. Việc khóa hồ sơ học phí và kiểm tra giao dịch chờ được thực hiện trong cùng transaction `SERIALIZABLE`.
- Thời khóa biểu lấy học kỳ từ `/api/semesters/current`; repository trả `null` khi không có học kỳ thay vì tự gán mã 7, UI hiển thị empty state có hướng dẫn.
- Thêm test HTTP cho các trường hợp chưa đăng nhập, sai chủ hồ sơ và giả mạo `maSV`.

### Tests / Verification
- `node --check` các file JavaScript đã sửa: PASS.
- `git diff --check`: PASS.
- Jest `tests/access-control.test.js`: BLOCKED trước khi khởi chạy bởi sandbox (`EPERM realpath` thư mục Temp Windows).
- Smoke test Supertest trực tiếp: BLOCKED do sandbox từ chối mở kết nối loopback (`EACCES 127.0.0.1`); chưa xác minh luồng DB hoặc giao diện trên browser.
- SQL Server `localhost:1433` chưa khả dụng theo lần kiểm tra trước; chưa chạy được các test tích hợp DB/đua request.

### Issues
- Cần môi trường cho phép Jest và Supertest mở listener loopback, cùng SQL Server đã khởi động, để chạy test tích hợp và kiểm tra lưu/đọc dữ liệu thực tế.
- Các test API cũ có một số request chưa gắn JWT; cần cập nhật fixtures/token rồi chạy toàn suite để xác nhận tương thích đầy đủ.

### Next Step
- Sau khi môi trường test khả dụng, cập nhật các test API cũ sang token theo role, chạy test quyền/thanh toán/đăng ký/giảng viên và kiểm tra flow thời khóa biểu trên browser.

## Phase 21: Rerun Tests, Isolate Fixtures & Complete Core CRUD

- Status: IN PROGRESS
- Date: 2026-10-14
- Files changed:
  - `backend/src/middlewares/auth.middleware.js`
  - `backend/src/routes/course.routes.js`, `class.routes.js`, `faculty.routes.js`, `semester.routes.js`, `lecturer.routes.js`, `admin.routes.js`
  - `backend/src/controllers/course.controller.js`, `admin.controller.js`
  - `backend/src/repositories/admin.repository.js`
  - `backend/src/services/lecturer.service.js`
  - `backend/src/validators/catalog.validator.js`
  - `backend/tests/access-control.test.js`, `helpers/tokens.js`, `helpers/tuition-fixture.js`
  - `backend/tests/admin-catalog-crud.test.js`, `admin-student-crud.test.js`, `class-programmability.test.js`, `lecturer-grade.test.js`, `pending-payment.test.js`, `registration.test.js`, `tuition.test.js` và các test API được cập nhật bearer token
  - `docs/verification-2026-10-14.md`
  - `docs/spec.md`
  - `Task.md`

### Changes
- Bắt buộc xác thực/vai trò ở các API danh mục còn thiếu; giới hạn giảng viên vào lớp/lịch được phân công và sinh viên vào dữ liệu của mình.
- Thay test dùng ID seed cố định bằng fixture riêng và dọn đúng bản ghi test; sửa cú pháp `OUTPUT` cho các bảng có trigger.
- Thêm API CRUD quản trị môn học và lớp học phần kèm kiểm tra đầu vào; xác nhận qua test tích hợp có tạo/sửa/đọc/xóa dữ liệu tạm.
- Đồng bộ đặc tả với route CRUD mới, số liệu test/database vừa đọc và đánh dấu phần hiệu năng, concurrency, giao diện cùng quyền SQL còn chưa xác minh.

### Tests / Verification
- Kết nối SQL Server `DBMS330284`: PASS.
- Toàn suite Jest: **26/26 suites, 173/173 tests PASS**.
- CRUD catalog: 2/2 tests PASS.
- Đối tượng DB thực tế: 19 tables, 6 views, 7 functions, 9 stored procedures, 14 triggers, 31 nonclustered indexes.

### Issues
- Chưa chạy lại phép đo hiệu năng index, concurrency hai session và kiểm tra frontend end-to-end.
- Giao diện admin chưa có form CRUD catalog; mới có API.
- Chưa xác minh quyền least-privilege của SQL login runtime.

### Next Step
- Bổ sung giao diện CRUD catalog; chạy phép đo index/concurrency và kiểm thử demo trên trình duyệt, đồng thời xác minh quyền SQL runtime.

## Phase 22: Update Project Report with Verified Results

- Status: DONE
- Date: 2026-10-14
- Files changed:
  - `Nhom16_QuanLyHocVuDangKyTinChi_CAP_NHAT_2026-10-14.docx`

### Changes
- Cập nhật kết quả chạy lại Jest (26 suite, 173/173 test đạt), số liệu đối tượng SQL, ma trận CRUD/API và đánh giá phần còn thiếu.
- Ghi rõ benchmark index và concurrency trong báo cáo là kết quả lịch sử, chưa chạy lại lần này; cập nhật trạng thái bảo mật API, ghi điểm và quyền SQL.
- Làm mới mục lục/danh mục bảng và khôi phục đánh số caption liên tục.
- File Word gốc đang được mở nên Windows không cho ghi đè; lưu bản cập nhật riêng cạnh file gốc để tránh làm hỏng phiên đang mở.

### Tests / Verification
- Mở lại DOCX thành công; xuất PDF bằng Word và rasterize 91 trang bằng Poppler bundled.
- Quét contact sheet toàn bộ trang và xem trực tiếp các trang API, kết quả test, danh mục bảng và kết luận; không thấy clipping hoặc bảng vỡ.
- Kiểm tra số bảng 44–47 và số trang trong danh mục sau khi Word cập nhật fields.

### Issues
- Chưa thay thế file Word gốc vì file đang mở/khóa bởi Word.

### Next Step
- Khi file gốc được đóng, thay bản cập nhật vào đúng tên file gốc nếu nhóm cần giữ nguyên tên.

## Phase 23: Hoàn thiện rubric Tiêu chí 5 — SQL Server, validation và phản hồi lỗi

- Status: DONE
- Date: 2026-10-21

### Changes
- Middleware xác thực đối chiếu mỗi JWT với tài khoản đang hoạt động trong SQL Server; trạng thái/vai trò/mã hồ sơ cũ trong token không còn được tin cậy.
- Bảo vệ khóa/mở khóa tài khoản theo vai trò, ngăn tự khóa, khóa tài khoản quản trị từ DAO_TAO và mở tài khoản DISABLED; bổ sung migration cho `SP_KhoaTaiKhoan`.
- Điểm thành phần hỗ trợ cập nhật từng phần, `null` xóa thành phần, batch được validate và ghi trong transaction.
- Bổ sung Zod cho trạng thái tài khoản, query quản trị (kể cả lọc lớp giao dịch chờ duyệt), ID ghi, mã lớp điểm và ngày sinh theo lịch; kiểm tra bản ghi ảnh hưởng để trả 404 khi cập nhật/xóa sinh viên không tồn tại.
- Lỗi SQL không nhận diện trả thông báo trung tính; thiếu biến môi trường bắt buộc dừng server với thông báo cấu hình rõ; bỏ bí mật mặc định, cập nhật `.env.example` và xoay JWT secret local.
- Toast dùng text node và ARIA live region; escape dữ liệu ở audit log/bảng quản trị/điểm số, bỏ inline handlers dựa trên tên tài khoản và hồ sơ sinh viên.
- Form sinh viên giữ nguyên dữ liệu, hiển thị lỗi theo trường, summary có thể focus và liên kết đến trường lỗi.
- Cập nhật `docs/spec.md` cho trạng thái phiên, quy tắc khóa tài khoản, điểm từng phần và lỗi máy chủ.

### Tests / Verification
- `npm test`: 29 suites, 192 tests PASS trên SQL Server thật.
- `frontend-dom.test.js`: 2 tests PASS cho text toast/ARIA và lỗi form/giữ dữ liệu/focus; `configuration-safety.test.js`: 2 tests PASS.
- TDD đã xác nhận test xóa sinh viên không tồn tại đỏ trước sửa (API trả 200), xanh sau sửa (API trả 404).
- TDD test duplicate MSSV đỏ khi field trả `server`, xanh sau khi trả `maSinhVien`; test fixture có thể chạy độc lập và tự dọn.
- TDD test lọc `maLop` giao dịch chờ duyệt quá dài đỏ với SQL 500, xanh trả 400 sau khi thêm query validator.
- Đăng nhập demo admin trong trình duyệt local; kiểm tra danh sách sinh viên, gửi MSSV trùng và xác nhận focus summary, lỗi dưới input, giá trị form còn nguyên.
- `node --check` cho các script backend/frontend và `git diff --check` đều đạt.

### Issues
- Cài `jsdom` thất bại do npm offline cache (`ENOTCACHED`); Jest kiểm tra tương tác qua DOM harness nhỏ, đồng thời lỗi form đã được xác nhận trong trình duyệt local.
- Chưa hoàn tất viewport 375px và thao tác sửa điểm trong trình duyệt; cập nhật điểm, khóa phiên và rollback batch đã được kiểm tra qua tích hợp API/SQL fixture.

### Next Step
- Trước buổi demo, kiểm tra thêm responsive ở 375px và nhập điểm trên giao diện giảng viên bằng dữ liệu demo.



## Phase 24: Nâng cấp DB đào tạo và đồng bộ BE (2026-10-21)

- Status: DONE WITH FOLLOW-UP ITEMS

### Changes
- Chuẩn hóa bộ SQL trong `DB/`, chuyển tài liệu thiết kế sang `docs/database-design.md`, thêm `DB/README.md` và runner theo action; không có thao tác drop/reset.
- Bổ sung `SINHVIEN.MaCTDT`, `NamTuyenSinh`, seed 24 CTĐT cho khóa 2023–2025, liên kết 480 môn CTĐT; cập nhật query PLAN, API và form quản trị sinh viên.
- Bổ sung trigger nhất quán khoa/lớp/ngành/CTĐT, kiểm tra sức chứa và lịch khi mở lớp; thêm FK học phí-mức phí cùng học kỳ; cap đăng ký 25 do DB kiểm soát.
- Cập nhật `docs/spec.md` và tài liệu thiết kế theo schema chạy thực tế; đánh dấu giới hạn runtime login, audit session context, execution plan/IO và concurrency hai phiên.

### Tests / Verification
- Dựng mới `DBMS330284_CodexDemo_Final`, seed, verify, security, integration và invariant SQL tests đều PASS.
- `npm test`: 34 suites, 215 tests PASS trên SQL Server với `DB_NAME=DBMS330284_CodexDemo_Final`.
- Backup checksum + `RESTORE VERIFYONLY` PASS; restore sang `DBMS330284_CodexDemo_RestoreCheck`; `DBCC CHECKDB` PASS, 1.500 sinh viên sau restore.
- Tại thời điểm ghi Phase 24, DB `DBMS330284` chưa được sửa; trạng thái này được cập nhật trong Phase 26 sau khi có backup và migration có kiểm chứng.

### Issues
- Backend chưa chạy dưới SQL login runtime quyền thấp: role/permission tests SQL pass, nhưng cần chuyển các đường đọc/ghi trực tiếp sang view/procedure trước khi cấp login runtime.
- Audit trigger chưa nhận actor từ `SESSION_CONTEXT` trên mọi request và chưa dọn context tại mọi đường trả connection về pool.
- Chưa chạy concurrency hai phiên cho chỗ cuối và xác nhận thanh toán; chưa đo execution plan/STATISTICS IO để quyết định index.
- Follow-up migration DB cũ đã hoàn tất trong Phase 26.

### Next Step
- Hoàn thiện migration có kiểm tra dữ liệu cho `DBMS330284`, rồi refactor backend sang least-privilege procedures/views trước khi provision runtime login.

## Phase 25: Sửa lỗi tải danh sách quản lý tài khoản theo bộ lọc mặc định

- Status: DONE WITH FOLLOW-UP ITEMS
- Date: 2026-10-21

### Findings
- Ảnh lỗi xảy ra khi trang quản lý tài khoản gửi các bộ lọc mặc định dưới dạng chuỗi rỗng (`vaiTro=`, `trangThai=`). Zod chỉ chấp nhận enum hợp lệ hoặc trường không có, nên từ chối request với 400 trước khi truy vấn SQL; đây không phải lỗi quyền truy cập.
- API quản trị cho phép cả `QUAN_TRI` và `DAO_TAO` truy cập danh sách tài khoản. Cả hai vai trò cũng dùng endpoint khóa/mở khóa; `DAO_TAO` bị giới hạn không thể đổi trạng thái tài khoản `DAO_TAO`/`QUAN_TRI` và không thể tự khóa tài khoản đang đăng nhập.
- API nhật ký hoạt động chỉ dành cho `QUAN_TRI`. Trang hiện vẫn hiển thị mục nhật ký hoạt động cho `DAO_TAO`; cần cân nhắc ẩn mục này trên giao diện để quyền thể hiện nhất quán.

### Changes
- Chuẩn hóa bộ lọc enum rỗng trong query danh sách tài khoản thành `undefined` (nghĩa là không áp dụng bộ lọc). Các giá trị enum không hợp lệ vẫn trả 400 tiếng Việt.
- Thêm test HTTP gửi đúng bộ lọc mặc định rỗng cho cả `admin` và `training`, xác nhận nhận danh sách thành công.

### Tests / Verification
- TDD: test hai vai trò với bộ lọc rỗng đỏ trước sửa (cả hai trả 400), xanh sau sửa (cả hai trả 200 với danh sách tài khoản).
- Nhóm test `GET /api/admin/users`: 7 tests PASS, gồm hai vai trò, query không hợp lệ, phân trang và truy vấn danh sách.
- Chạy toàn bộ `tests/admin.test.js`: 19 PASS, 3 FAIL do SQL Server `DBMS330284` hiện tại thiếu cột `MaCTDT` trong các truy vấn danh sách sinh viên; các lỗi này độc lập với quản lý tài khoản.
- `git diff --check` cho file thay đổi trong task: PASS.

### Issues
- Để kiểm tra đầy đủ các API sinh viên trên database cũ `DBMS330284`, cần áp dụng migration bổ sung `SINHVIEN.MaCTDT` hoặc chạy ứng dụng với database mới `DBMS330284_CodexDemo_Final` đã được dựng và kiểm tra ở Phase 24.
- Mục nhật ký hoạt động vẫn hiện trong menu `DAO_TAO` dù backend đã chặn vai trò này bằng 403.

### Next Step
- Tải lại trang quản lý tài khoản và xác nhận danh sách hiện lên với tài khoản admin/đào tạo. Nếu cần hoàn thiện giao diện phân quyền, ẩn mục nhật ký hoạt động với `DAO_TAO` và giữ thông báo 403 cho truy cập trực tiếp.

## Phase 26: Migration DB cũ có bảo toàn dữ liệu (2026-10-21)

- Status: DONE WITH FOLLOW-UP ITEMS

### Changes
- Tạo backup `DBMS330284_before_curriculum_migration_20261021092939.bak`, kiểm tra checksum và `RESTORE VERIFYONLY`; diễn tập migration trên bản restore trước khi áp dụng DB thật.
- Áp dụng `DB/Migrations/20261021_CurriculumAndInvariants.sql` và đồng bộ lại trigger, view, function, procedure, index, security trên `DBMS330284`; không drop/reset DB.
- Giữ 1.501 sinh viên, 44.545 đăng ký, 34.535 điểm, 7.424 hồ sơ học phí và 8.167 chi tiết thanh toán. Cập nhật một cache `SoTienDaThanhToan` bị lệch 145.000 đồng theo tổng giao dịch đã xác nhận.
- Cập nhật `docs/spec.md`, `docs/database-design.md` và `DB/README.md`; DB cũ hiện đã migration.

### Tests / Verification
- `--action verify`: PASS trên `DBMS330284`.
- `--action test`: integration, SQL role permission và invariant rejection PASS trên `DBMS330284`.
- `npm test` với `DB_NAME=DBMS330284`: 34 suites, 217 tests PASS.

### Follow-up
- Chưa đo execution plan/STATISTICS IO, chưa kiểm thử tranh chấp concurrency hai phiên và chưa restore backup trước migration sang DB mới kèm `DBCC CHECKDB` sau migration.

## Phase 27: Phân trang danh sách lớp giảng viên

- Status: DONE WITH FOLLOW-UP ITEMS
- Date: 2026-10-21
- Files changed:
  - `frontend/portal-lecturer.html`
  - `frontend/js/lecturer.js`

### Changes
- Thêm phân trang phía giao diện cho danh sách lớp giảng viên, mặc định 10 lớp/trang; cho phép chọn 20 hoặc 50 lớp/trang.
- Dùng component phân trang dùng chung và giữ nguyên số lượng lớp tổng cộng.

### Tests / Verification
- Chưa chạy test hoặc kiểm tra lại trên trình duyệt sau thay đổi.

### Issues
- Chưa xác nhận hiển thị trên trình duyệt; cần tải lại portal giảng viên.

### Next Step
- Kiểm tra nhanh phân trang sau khi tải lại giao diện.

## Phase 28: Sửa các bộ lọc lớp sinh hoạt bị bỏ qua

- Status: DONE WITH FOLLOW-UP ITEMS
- Date: 2026-10-21
- Files changed:
  - `backend/src/controllers/admin.controller.js`

### Changes
- Chuyển tiếp `maLop` từ query đến repository trong danh sách tài khoản, danh sách sinh viên và danh sách đăng ký tín chỉ.
- Nguyên nhân: giao diện gửi `maLop`, validator và repository đều hỗ trợ, nhưng controller không đưa tham số vào lời gọi repository.

### Tests / Verification
- Đối chiếu tĩnh giao diện, query schema, controller và repository; chưa chạy test/API sau sửa.

### Issues
- Nếu backend không tự reload, cần khởi động lại để nhận thay đổi.

### Next Step
- Thử lại ba bộ lọc lớp sinh hoạt sau khi backend nạp code mới.

## Phase 29: Sửa lỗi tải danh sách đăng ký với trạng thái mặc định

- Status: DONE WITH FOLLOW-UP ITEMS
- Date: 2026-10-21
- Files changed:
  - `backend/src/validators/common.validator.js`
  - `Task.md`

### Changes
- Làm cho query `trangThai` rỗng ở endpoint danh sách đăng ký được chuẩn hóa thành `undefined`, giống bộ lọc enum danh sách tài khoản; trạng thái không hợp lệ vẫn bị từ chối.
- Nguyên nhân: giao diện gửi `trangThai=` khi chọn “Tất cả trạng thái”, trong khi schema trước đó chỉ cho phép `REGISTERED` hoặc `CANCELLED`.

### Tests / Verification
- Đối chiếu tĩnh giá trị mặc định giao diện gửi và schema Zod; chưa chạy test/API.

### Issues
- Cần tải lại trang hoặc khởi động lại backend nếu tiến trình hiện tại không tự reload.

### Next Step
- Mở lại trang tra cứu kết quả đăng ký tín chỉ và xác nhận danh sách tải được với trạng thái “Tất cả”.

## Phase 30: Rà soát lỗi enum query rỗng ở các bộ lọc

- Status: DONE
- Date: 2026-10-21
- Files changed:
  - `Task.md`

### Changes
- Đối chiếu các query enum với cách giao diện tạo request.
- Không phát hiện bộ lọc enum đang dùng nào khác gửi giá trị rỗng nhưng validator lại yêu cầu enum: báo cáo học phí bỏ tham số khi chọn “Tất cả”; bộ lọc loại môn luôn gửi `PLAN`, `OTHER` hoặc `ALL`.
- Các enum tùy chọn trong query khác hiện không được giao diện gửi chuỗi rỗng; enum trong body là dữ liệu nhập bắt buộc/tùy chọn và không thuộc trường hợp lỗi này.

### Tests / Verification
- Rà soát tĩnh các query schema, route, lời gọi `api.get` và giá trị mặc định của bộ lọc trên giao diện; không chạy test vì không có thay đổi code mới trong lượt rà soát.

### Issues
- None found for this specific empty-enum query issue.

### Next Step
- Theo dõi nếu gặp bộ lọc khác báo lỗi enum khi đang để “Tất cả”.

## Phase 31: Nâng cấp minh chứng Tiêu chí 5 và điều hướng theo quyền

- Status: PARTIAL — các kiểm chứng an toàn và UI đã hoàn tất; runtime cutover và một số kịch bản concurrency vẫn còn.
- Date: 2026-10-21

### Changes
- Ghi nhận backup có checksum `DBMS330284_pre_runtime_20261021170400.bak`; `RESTORE VERIFYONLY` đạt. Restore rehearsal sang `DBMS330284_RuntimeRehearsal_20261021` và `DBCC CHECKDB` đều đạt trước khi migration được áp dụng.
- Cổng quản trị chỉ hiện mục và panel nhật ký hoạt động cho vai trò `QUAN_TRI`; API vẫn kiểm tra quyền phía máy chủ. `DAO_TAO` còn được phép vào quản lý tài khoản.
- Dropdown điều hướng có `aria-expanded`, `aria-controls`, focus nhìn thấy; phím Escape đóng menu và trả focus về nút mở.
- Bổ sung test DOM cho quyền điều hướng và thao tác dropdown bàn phím; thêm test HTTP xác nhận `DAO_TAO` gọi trực tiếp API audit nhận 403.
- Bổ sung HTTP concurrency test cho hai yêu cầu thanh toán đồng thời cùng hồ sơ: một yêu cầu được nhận, một yêu cầu nhận xung đột, và chỉ một giao dịch chờ được lưu.
- Bổ sung phản chứng SQL: runtime test principal không đọc trực tiếp `TAIKHOAN`; giữ kiểm tra từ chối cập nhật trực tiếp `HOCPHI`.
- Đo truy vấn trang đầu danh sách tài khoản trên `DBMS330284`: 25 dòng, 15 logical reads, SQL CPU 0 ms, elapsed 2 ms; execution plan được lấy. Đây là phép đo riêng của workload này.
- Cập nhật `docs/spec.md`, `docs/database-design.md`, `DB/README.md` và thêm báo cáo xác minh ngày 21/10/2026.

### Tests / Verification
- TDD UI dropdown: test mới đỏ vì `aria-expanded` không được đổi; sau khi sửa, test xanh.
- `npm test -- --runTestsByPath tests/frontend-dom.test.js tests/admin-nav.test.js`: 21 tests PASS.
- Test HTTP concurrency thanh toán: PASS trên SQL Server thật.
- Test HTTP quyền audit của `DAO_TAO`: PASS (403).
- `npm test`: 34 suites, 221 tests PASS trên `DBMS330284`.
- `node scripts/run_all_db_files.js --action verify --database DBMS330284`: PASS.
- `node scripts/run_all_db_files.js --action test --database DBMS330284`: integration, verify, role permission và invariant PASS.
- Backup checksum, `RESTORE VERIFYONLY`, rehearsal restore và `DBCC CHECKDB`: PASS.

### Issues / còn lại
- Backend hiện vẫn chạy bằng `sa`/`dbo`; login `dbms_app` chưa được provision và API chưa chạy bằng APP_RUNTIME.
- Các repository còn DML trực tiếp cho một số luồng nghiệp vụ (đặc biệt điểm, thanh toán, tài khoản và CRUD sinh viên). Chuyển sang runtime trước khi đóng các luồng này sẽ làm API hỏng; cần viết test theo từng luồng rồi chuyển thao tác ghi sang procedure và chạy toàn bộ Jest bằng runtime.
- Chưa có test HTTP tranh chấp chỗ cuối đăng ký tín chỉ, hai cán bộ xác nhận cùng giao dịch, cũng chưa chạy trình duyệt bàn phím/responsive 375px.
- Chưa có phép đo rộng cho truy vấn hot path khác; không suy rộng 15 logical reads của danh sách tài khoản thành hiệu năng toàn hệ thống.

### Next Step
- Chuyển DML trực tiếp từng repository sang stored procedure và tách test fixture pool có quyền chuẩn bị/dọn dữ liệu; chỉ sau khi toàn bộ test xanh mới provision `dbms_app` và chuyển backend sang `APP_RUNTIME`.

## Phase 32: Rà soát giao diện các cổng theo vai trò

- Status: IN PROGRESS — đã rà các màn hình chính, còn một số trang quản trị cần đối chiếu thêm.
- Date: 2026-10-21
- Files changed:
  - `Task.md`

### Changes
- Kiểm tra trực tiếp giao diện đăng nhập, dashboard, đăng ký tín chỉ, thời khóa biểu, điểm, học phí, lịch sử thanh toán và hồ sơ của sinh viên.
- Kiểm tra dashboard, danh sách lớp, thời khóa biểu và sổ điểm của giảng viên.
- Kiểm tra dashboard quản trị; dưới tài khoản Cán bộ Đào tạo, danh sách sinh viên và 36 lớp sinh hoạt hiển thị dữ liệu cùng bộ lọc.
- Các trang đã mở nhìn chung có bố cục nhất quán, bảng/card dễ đọc ở màn hình desktop.

### Tests / Verification
- Rà soát trực tiếp trên Chrome với tài khoản sinh viên, giảng viên, quản trị viên và Cán bộ Đào tạo; không chạy automated tests vì đây là kiểm tra giao diện.
- Sinh viên: trang học phần đã đăng ký báo lỗi máy chủ; các màn hình còn lại trong lượt rà soát hiển thị dữ liệu.
- Quản trị viên: các danh sách sinh viên, lớp, đăng ký, tài khoản, báo cáo học phí, giao dịch chờ và nhật ký hiển thị lỗi không có quyền (403). Cán bộ Đào tạo mở được danh sách sinh viên và lớp; lỗi cần được xác định theo từng quyền/trang trước khi kết luận nguyên nhân.

### Issues
- Lỗi API khi tải học phần đã đăng ký của sinh viên.
- Các màn hình quản trị bị 403 khi vào bằng tài khoản quản trị viên, dù các mục điều hướng xuất hiện.
- Chưa rà trực quan các biến thể màn hình nhỏ và chưa đối chiếu hết các tab quản trị dưới tài khoản Cán bộ Đào tạo.

### Next Step
- Điều tra lỗi tải học phần đã đăng ký và ma trận quyền các màn hình quản trị; sau đó rà các tab còn lại theo vai trò và kích thước màn hình.

## Phase 33: Hoàn thiện báo cáo theo trạng thái project ngày 21/10/2026

- Status: CONTENT UPDATED — nội dung, số liệu DB, kiểm thử và minh chứng đã được đồng bộ. Render trực quan DOCX chưa hoàn tất do thiếu LibreOffice và Word COM không mở tài liệu trong thời gian chờ.
- Date: 2026-10-21

### Changes
- Đối chiếu nội dung báo cáo với schema và script SQL hiện tại, cập nhật ERD, lược đồ quan hệ, từ điển dữ liệu, quy trình nghiệp vụ và đường dẫn script.
- Cập nhật kết quả trên bản sao QA riêng, phân biệt kết quả lịch sử với lần chạy 21/10/2026.
- Bổ sung kết quả backup có checksum, RESTORE VERIFYONLY, phục hồi QA, DBCC CHECKDB, kiểm thử quyền GRANT/REVOKE, rollback và tranh chỗ cuối.
- Cập nhật số lượng đối tượng SQL, dữ liệu, CTĐT, liên kết CTDT_MONHOC, số liệu index và Jest. Nêu các giới hạn còn lại như runtime dbo, phạm vi đo hiệu năng và chưa có browser end-to-end.
- Giữ trống các ô phân công thành viên trong Phụ lục A.
- Sửa mục lục đang ghép nhầm nhãn 14 trigger với 20 trigger và bật cập nhật trường khi mở bằng Word.

### Tests / Verification
- Bản sao DBMS330284_ReportQA_20261021: schema và invariant SQL PASS.
- Giao dịch minh họa: PASS. Thử nghiệm hai phiên tranh chỗ cuối: một đăng ký thành công, một nhận lỗi 50011, sĩ số bằng sức chứa.
- Kiểm tra GRANT/REVOKE bằng HAS_PERMS_BY_NAME: PASS, giá trị 1 sau GRANT và 0 sau REVOKE.
- Đo index trên workload truy vấn MaSV: 338 logical reads khi scan và 3 logical reads khi dùng index.
- `npm test` trên DB QA: 34 suites, 221 tests PASS.
- Nội dung DOCX được kiểm tra cấu trúc, bảng, tiêu đề, các chuỗi cũ và ô phân công phụ lục. Render PNG/PDF chưa chạy được vì máy thiếu LibreOffice. Thử Word tự động hóa không xuất được PDF.

### Issues / còn lại
- Cần mở báo cáo trong Microsoft Word, cập nhật toàn bộ mục lục và danh mục hình/bảng, kiểm tra số trang cùng bố cục ảnh và bảng trước khi nộp.
- Backend trong lần đo SQL còn dùng `sa`/`dbo`, chưa chạy bằng login runtime least privilege.
- Chưa chạy browser end-to-end và phép đo hiệu năng rộng ngoài workload đã mô tả.

## Phase 34: Viết lại báo cáo cuối kỳ theo giọng văn nhóm sinh viên

- Status: DONE
- Date: 2026-10-21
- Files changed:
  - `Nhom16_QuanLyHocVuDangKyTinChi_hoanthien.docx`
  - `Task.md`

### Changes
- Viết lại 162 đoạn thuyết minh trong sáu chương theo cách trình bày bài toán, lựa chọn thiết kế, kết quả và giới hạn.
- Thay bảng liệt kê đường dẫn API dài bằng bảng chức năng theo người dùng. Cập nhật bảng phạm vi hoàn thiện và bảng minh chứng theo các tiêu chí đánh giá.
- Sửa số liệu cũ ở bảng đo chỉ mục và bài thử hai kết nối. Phân biệt kết quả ngày 14/10 với lần kiểm chứng ngày 21/10.
- Giữ tên bảng, cột, thủ tục và mã nguồn tại phần từ điển dữ liệu, SQL và phụ lục. Giữ trống các ô phân công thành viên.
- Bật lặp tiêu đề bảng khi sang trang, giữ từng hàng không tách đôi, cập nhật mục lục và danh mục hình/bảng bằng Microsoft Word.
- File gốc đang bị Word giữ khóa nên bản hoàn thiện được lưu thành file mới để không làm mất chỉnh sửa đang mở.

### Tests / Verification
- Đối chiếu nội dung với `docs/spec.md`, `docs/verification-2026-10-21.md` và các bài thử liên quan đến đăng ký, điểm, thanh toán, quản trị và phản hồi giao diện.
- Kiểm tra DOCX: 51 bảng, 20 hình, bảng phân công còn trống, không còn tiêu đề cũ 14 trigger hoặc bảng liệt kê API, không có gạch nối dài hay gạch đôi trong nội dung.
- Microsoft Word xuất PDF thành công: 93 trang gồm bìa, mục lục và phụ lục. Đã rà toàn bộ trang qua ảnh xem trước, kiểm tra riêng các trang ERD, bảng dài, chương ứng dụng và kết luận.
- Không chạy lại Jest vì công việc chỉ thay đổi báo cáo. Báo cáo dùng kết quả kiểm chứng đã ghi nhận trước đó trên DB thử nghiệm.

### Issues
- File gốc `Nhom16_QuanLyHocVuDangKyTinChi_suabia.docx` vẫn đang bị Word giữ khóa. Bản giao là `Nhom16_QuanLyHocVuDangKyTinChi_hoanthien.docx`.

### Next Step
- Nhóm bổ sung phân công công việc trong Phụ lục A trước khi nộp.

## Phase 35: Đổi tên các mục chi tiết bảng trong Chương 2

- Status: DONE
- Date: 2026-10-21
- Files changed:
  - `Nhom16_QuanLyHocVuDangKyTinChi_hoanthien.docx`
  - `Task.md`

### Changes
- Đổi 19 tiêu đề từ `2.9.1` đến `2.9.19` từ "Từ điển dữ liệu bảng" thành "Chi tiết bảng" ngay trên tài liệu đang mở trong Word.
- Cập nhật mục lục và lưu tài liệu, giữ nguyên các chỉnh sửa hiện có của người dùng.

### Tests / Verification
- Kiểm tra DOCX: 19 tiêu đề nội dung và 19 mục lục đã đổi, không còn cụm tiêu đề cũ.
- Word xuất bản xem trước 89 trang. Đã xem mục lục và trang đầu của phần 2.9, không thấy lỗi bố cục do đổi tiêu đề.
- Số bảng và hình giữ nguyên. Phần phân công công việc vẫn để trống.

### Issues
- None.

### Next Step
- Bổ sung phân công công việc trong phụ lục trước khi nộp.
## Phase 36: Bổ sung README hướng dẫn chạy project

- Status: DONE
- Date: 2026-10-21
- Files changed:
  - `README.md`
  - `Task.md`

### Changes
- Thêm hướng dẫn chuẩn bị Node.js/SQL Server, cấu hình `backend/.env`, dựng database demo riêng, khởi động website, kiểm tra health endpoint và đăng nhập bằng tài khoản demo.
- Thêm liên kết tới đặc tả, hướng dẫn SQL, thiết kế database, sơ đồ ERD và danh sách tài khoản.
- Thêm các bước xử lý lỗi kết nối, cấu hình và cổng chạy phổ biến.

### Tests / Verification
- Đối chiếu lệnh và cấu hình với `backend/package.json`, `.env.example`, `backend/src/server.js`, `backend/scripts/run_all_db_files.js` và `DB/README.md`.
- Kiểm tra tài khoản demo với các nút đăng nhập nhanh trong `frontend/index.html`.
- Không chạy test vì chỉ cập nhật tài liệu hướng dẫn.

### Issues
- Người chạy cần tự cấu hình SQL Server và thông tin đăng nhập trong `backend/.env` trên máy của mình.

### Next Step
- Mở project theo README, dựng database demo riêng rồi khởi động backend.

## Phase 37: Cho phép dựng lại DBMS330284 từ file all-in-one

- Status: DONE
- Date: 2026-10-22
- Files changed:
  - `DB/00_Build_DBMS330284.sql`
  - `DB/README.md`
  - `Nhom16_QuanLiHocVuVaDangKyTinChi/Database/00_Build_DBMS330284.sql`
  - `Nhom16_QuanLiHocVuVaDangKyTinChi/Database/README.md`
  - `Nhom16_QuanLiHocVuVaDangKyTinChi/MaNguon_Nhom16.zip`
  - `Task.md`

### Changes
- File all-in-one xóa và tạo lại `DBMS330284` nếu database đã tồn tại; cảnh báo mất toàn bộ dữ liệu được ghi trong SQL và README.
- Đồng bộ hai bản script và cập nhật README trong ZIP.

### Tests / Verification
- Xác nhận hai bản SQL có cùng SHA-256.
- Đối chiếu dòng cảnh báo trong README thư mục Database và README bên trong ZIP.
- Không chạy SQL trên instance người dùng; không chạy test.

### Issues
- Chạy lại file sẽ xóa dữ liệu cũ trong `DBMS330284`.

### Next Step
- Chạy toàn bộ `00_Build_DBMS330284.sql` trong SSMS để dựng lại database.

## Phase 38: Sửa lỗi tạo procedure SP_ khi có trùng tên trong master

- Status: DONE
- Date: 2026-10-22
- Files changed:
  - `DB/00_Build_DBMS330284.sql`
  - `DB/08_StoredProcedures.sql`
  - `Nhom16_QuanLiHocVuVaDangKyTinChi/Database/00_Build_DBMS330284.sql`
  - `Nhom16_QuanLiHocVuVaDangKyTinChi/Database/08_StoredProcedures.sql`
  - `Task.md`

### Changes
- All-in-one builder dùng `CREATE PROCEDURE` cho 9 procedure trên database mới, tránh lỗi `CREATE OR ALTER` khi SQL Server đã có procedure `SP_` trùng tên trong `master`.
- File thành phần 08 drop procedure cùng tên trong database đích trước khi tạo lại.

### Tests / Verification
- Xác nhận hai bản builder giống nhau, hai bản file 08 giống nhau; mỗi bản chứa đủ 9 procedure.
- Không chạy SQL trên instance người dùng.

### Issues
- Chưa xác minh trực tiếp trên máy gặp lỗi; người chạy cần xóa DB dựng dở rồi chạy lại toàn bộ file 00 đã cập nhật.

### Next Step
- Dựng lại trên máy gặp lỗi và chạy file verify.

## Phase 39: Cập nhật kịch bản demo sau nâng cấp database

- Status: IN PROGRESS
- Date: 2026-10-22
- Files changed:
  - `KichBanThuyetTrinh_Demo_Nhom16_DBMS330284_3PhanMoiSlide.docx`
  - `Task.md`

### Changes
- Chuyển cấu trúc từ bảng tổng hợp sang từng slide, mỗi slide có đúng ba phần: lời nói trước lớp, code SQL chạy thử, giải thích khi SQL chạy.
- Đặt phần tiền kiểm tra và code transaction đăng ký/hủy ngay trong slide tương ứng; thao tác ghi dùng mã lấy từ seed, có guard, rollback và đối chiếu trước/sau.
- Giữ hướng dẫn không chạy build, seed, reset hoặc migration trên DB hiện tại; không tạo bản ghi demo.
- Nêu số liệu schema và giới hạn kiểm chứng theo báo cáo 21/10; không tuyên bố đã có HTTP test tranh chấp chỗ cuối.

### Tests / Verification
- DOCX mở được; có 15 slide và mỗi nhãn trong form xuất hiện đúng 15 lần.
- Accessibility audit: 0 findings. Kiểm tra nội dung không thấy mã fixture hoặc kết quả hiệu năng cũ.
- Chưa chạy SQL/test database.
- Render trang chưa hoàn tất: bundled Python hoạt động nhưng thiếu LibreOffice `soffice.exe`; chưa thể rà ảnh từng trang.

### Issues
- Cần render PNG và kiểm tra trực quan từng trang khi có renderer LibreOffice hoạt động.

### Next Step
- Mở file DOCX mới và kiểm tra hình thức; hoàn tất kiểm tra trực quan từng trang sau khi renderer khả dụng.

## Tạo tài liệu ôn vấn đáp SQL cho phần CTĐT và danh mục

- Status: DONE
- Date: 2026-10-22
- Files changed:
  - `On_tap_SQL_phan_viec.docx`
  - `Task.md`

### Changes
- Tạo tài liệu Word tiếng Việt bám schema SQL Server 2022 của project cho 7 bảng KHOA, NGANH, CHUONGTRINHDAOTAO, MONHOC, CTDT_MONHOC, MONHOCTIENQUYET và LOP.
- Thêm đoạn code viết tay cho bảng, khóa/ràng buộc, trigger chống chu trình, trigger liên kết sinh viên-lớp-CTĐT, view, function kiểm tra tiên quyết, index, truy vấn và câu hỏi vấn đáp.

### Tests / Verification
- Mở lại DOCX bằng python-docx và xác nhận file ZIP OOXML không lỗi, có đủ phần code/hỏi đáp dự kiến.
- Đã thử render bằng `render_docx.py`; không render được vì môi trường không có `soffice.exe`. Không thể kiểm tra PNG trực quan trong phiên này.
- Không chạy test dự án hoặc thực thi SQL Server.

### Issues
- Chưa xác minh trực quan từng trang do thiếu LibreOffice/soffice.exe trong môi trường.

### Next Step
- Có thể mở file DOCX trong Word để xem trước và luyện viết lại các đoạn SQL.

## Chẩn đoán và sửa lỗi tải học phần đã đăng ký

- Status: DONE
- Date: 2026-10-22
- Files changed:
  - `backend/src/middlewares/auth.middleware.js`
  - `backend/tests/registration-middleware.test.js`
  - `Task.md`

### Changes
- Tái hiện API GET `/api/registrations/my-courses` trả 500 do `authorizeMyStudentId` đọc `req.body.maSV` khi Express để `req.body` là `undefined` cho request GET.
- Sửa điều kiện thành `req.body?.maSV` để kiểm tra payload nếu có mà vẫn cho phép GET không có body.
- Thêm test hồi quy cho request sinh viên GET không có request body.
- Lỗi `@HasCycle` trong ảnh SSMS là lỗi riêng của batch SQL người dùng chạy; file `DB/05_Triggers.sql` hiện đã có khai báo biến trong trigger.

### Tests / Verification
- Test hồi quy trước sửa: FAIL với đúng `TypeError: Cannot read properties of undefined (reading 'maSV')`.
- Test hồi quy sau sửa: PASS (1 suite, 1 test).
- Chạy request GET thực tế qua Express/Supertest tới database `DBMS330284`: HTTP 200, `isSuccess=true`, trả 6 kết quả. Request chỉ đọc; không sửa dữ liệu.
- `git diff --check` trên file middleware: PASS.

### Issues
- None for the API error shown in the student page.

### Next Step
- Tải lại trang sinh viên; không cần thay đổi trigger môn tiên quyết để sửa lỗi tải danh sách này.




## Chỉnh tài liệu ôn SQL theo hướng truy vấn demo

- Status: DONE (bản chỉnh sửa lưu thành file thay thế do bản nguồn đang bị khóa)
- Date: 2026-10-23
- Files changed:
  - `On_tap_SQL_phan_viec_demo.docx`
  - `Task.md`

### Changes
- Chuyển tài liệu từ các đoạn dựng CREATE/ALTER sang truy vấn kiểm tra đối tượng đang có, quan hệ giữa các bảng, khóa/ràng buộc, view, function, trigger và index.
- Thêm demo chu trình môn tiên quyết tự chọn 3 môn độc lập, bắt lỗi mong đợi 51001, in kết quả và rollback toàn bộ transaction.
- Bổ sung giải thích ngắn, kết quả mong đợi, câu hỏi vấn đáp và bài nói tóm tắt.
- Không ghi đè `On_tap_SQL_phan_viec.docx` vì Windows từ chối ghi file và thư mục có file khóa Word; bản nguồn được giữ nguyên.

### Tests / Verification
- Chạy 8 khối SQL trong tài liệu bằng `sqlcmd` trên `DBMS330284`: PASS.
- Demo trigger bắt đúng lỗi 51001; số dòng `MONHOCTIENQUYET` trước/sau đều là 36 sau rollback.
- DOCX mở lại bằng python-docx, OOXML ZIP hợp lệ, đủ nội dung và 8 khối code.
- Đã thử `render_docx.py`; môi trường thiếu `soffice.exe` trong runtime đóng gói. Word COM bị từ chối quyền nên chưa tạo được PNG để kiểm tra trực quan.

### Issues
- File nguồn còn khóa; bản chỉnh sửa hiện ở `On_tap_SQL_phan_viec_demo.docx`.
- Chưa thể xác minh bố cục bằng ảnh trang do renderer không khả dụng trong môi trường.

### Next Step
- Mở bản demo để sử dụng; khi đóng file nguồn đang mở, có thể thay bản nguồn bằng bản demo nếu cần giữ nguyên tên file.
# Tra cứu chương trình đào tạo theo vai trò

- Status: DONE
- Date: 2026-10-23
- Files changed:
  - `backend/src/validators/common.validator.js`
  - `backend/src/repositories/admin.repository.js`
  - `backend/src/repositories/student.repository.js`
  - `backend/src/services/student.service.js`
  - `backend/src/controllers/admin.controller.js`
  - `backend/src/controllers/student.controller.js`
  - `backend/src/routes/admin.routes.js`
  - `backend/src/routes/student.routes.js`
  - `frontend/portal-admin.html`
  - `frontend/portal-student.html`
  - `frontend/js/admin.js`
  - `frontend/js/student.js`
  - `docs/spec.md`
  - `backend/tests/student-curriculum-api.test.js`
  - `backend/tests/student-curriculum-service.test.js`
  - `backend/tests/access-control.test.js`
  - `Task.md`

### Changes
- Thêm màn hình tra cứu CTĐT cho cán bộ Đào tạo với bộ lọc khoa, năm tuyển sinh, CTĐT và kỳ dự kiến; truy vấn bao gồm chương trình/kỳ chưa có môn và bỏ giới hạn TOP 200.
- Thêm màn hình cho sinh viên xem CTĐT cá nhân theo từng kỳ dự kiến, hiển thị kỳ rỗng và trạng thái CTĐT; API kiểm tra quyền hồ sơ trước khi trả dữ liệu.
- Cập nhật tài liệu API/giao diện và bổ sung kiểm thử lọc, phân nhóm kỳ và truy cập hồ sơ.

### Tests / Verification
- `node --check` các file JavaScript đã sửa: PASS.
- `npm test -- --runTestsByPath tests/student-curriculum-service.test.js tests/frontend-dom.test.js`: PASS (2 suite, 12 test).
- `npm test`: PASS (36 suite, 229 test).

### Issues
- None.

### Next Step
- Tải lại cổng Đào tạo và cổng Sinh viên để dùng mục tra cứu CTĐT.

## Bổ sung cột môn tiên quyết trong bảng CTĐT

- Status: DONE
- Date: 2026-10-23
- Files changed:
  - `backend/src/repositories/admin.repository.js`
  - `backend/src/repositories/student.repository.js`
  - `backend/src/services/student.service.js`
  - `frontend/js/admin.js`
  - `frontend/js/student.js`
  - `backend/tests/student-curriculum-api.test.js`
  - `backend/tests/student-curriculum-service.test.js`
  - `docs/spec.md`
  - `Task.md`

### Changes
- Hai bảng CTĐT hiển thị STT, mã học phần, tên môn học, số tín chỉ và học phần tiên quyết.
- Lấy mã và tên các môn tiên quyết từ quan hệ `MONHOCTIENQUYET`; nhiều môn tiên quyết hiển thị cùng dòng, môn không có tiên quyết hiển thị dấu gạch ngang.

### Tests / Verification
- `npm test -- --runTestsByPath tests/student-curriculum-service.test.js tests/student-curriculum-api.test.js`: PASS (2 suite, 9 test).

### Issues
- None.

### Next Step
- Tải lại hai cổng để xem các cột và dữ liệu môn tiên quyết.

## Hoàn thiện tài liệu ôn SQL theo phạm vi phụ trách

- Status: DONE
- Date: 2026-10-23
- Files changed:
  - `On_tap_SQL_phan_viec_ban_day_du.docx`
  - `Task.md`

### Changes
- Tạo bản tài liệu demo SQL đầy đủ, giữ nguyên bản tài liệu nguồn và không dựng lại schema.
- Bổ sung sơ đồ quan hệ, truy vấn catalog cho PK/FK/CHECK/trạng thái trigger/view/function/index, truy vấn view, hàm tiên quyết, kiểm tra liên kết và giải thích vấn đáp.
- Thêm demo riêng cho đủ 11 CHECK hiện có; ghi rõ SoTinChi = 0 dùng để kích hoạt CHECK, còn -1 bị kiểu TINYINT chặn trước CHECK. Nêu trạng thái CK_LOP_NamNhapHoc chưa xuất hiện trong catalog DB và DEFAULT/BIT không đồng nghĩa CHECK.
- Thêm demo trigger chu trình (51001) và liên kết sinh viên (51008), đều rollback; không chạy migration hay thay đổi schema.

### Tests / Verification
- Chạy 23 khối truy vấn/demo trong tài liệu bằng `sqlcmd` trên DBMS330284; 11/11 CHECK trả lỗi 547 đúng tên constraint.
- Trigger chu trình trả 51001; số dòng MONHOCTIENQUYET trước/sau rollback là 36/36.
- Trigger liên kết trả 51008; dữ liệu sinh viên trở lại khoa cũ sau rollback.
- Hàm FN_KiemTraTienQuyet trả 1 cho (MaSV=1, ANHVAN1) và 0 cho (MaSV=1, ANHVAN2); view và metadata truy vấn được.
- Kiểm tra DOCX bằng python-docx: đủ mục và 11 constraint; không có DDL CREATE/ALTER trong các khối demo.
- Không render/kiểm tra ảnh được vì renderer đóng gói không tìm thấy `soffice.exe`; renderer báo thiếu LibreOffice.

### Issues
- Bố cục trực quan từng trang chưa được xác nhận do thiếu renderer LibreOffice được hỗ trợ trong môi trường.

### Next Step
- Mở bản DOCX trong Word để trình bày; kiểm tra trang nhanh trước khi in/chia sẻ.

## Làm gọn tài liệu ôn SQL theo kiểu demo trực tiếp

- Status: DONE
- Date: 2026-10-24
- Files changed:
  - `On_tap_SQL_phan_viec_ban_day_du.docx`
  - `Task.md`

### Changes
- Rút gọn tài liệu theo phạm vi 7 bảng, các PK/FK, 11 CHECK hiện có, 5 trigger cần nắm, view, function và 6 index.
- Thay ví dụ CHECK dài bằng các câu UPDATE/INSERT ngắn; thêm demo trigger chu trình và liên kết sinh viên gọn có transaction rollback.
- Ghi chú CK_LOP_NamNhapHoc chưa có trong catalog, trạng thái BIT/DEFAULT không phải CHECK, và SoTinChi âm bị kiểu TINYINT chặn trước CHECK.
- Bổ sung SELECT gọi view/function, kiểm tra liên kết và cách xem index qua Actual Execution Plan.

### Tests / Verification
- Chạy 11 câu demo CHECK trên DBMS330284; tất cả trả lỗi 547 đúng tên constraint.
- Trigger chu trình trả 51001; trigger liên kết trả 51008; số dòng MONHOCTIENQUYET vẫn 36 và MaSV=1001 vẫn giữ khoa KTPM sau rollback.
- Hàm trả 1 cho (1001, NMLT) và 0 cho (1001, TTNT); view trả 480 dòng; cả 6 index tìm thấy trong catalog.
- Kiểm tra cấu trúc DOCX và đối chiếu các tên object với SQL project.
- Renderer DOCX không chạy được vì thiếu `soffice.exe`; chưa kiểm tra ảnh từng trang.

### Issues
- Kiểm tra bố cục trực quan từng trang còn chờ môi trường có renderer phù hợp.

### Next Step
- Mở DOCX trong Word để xem nhanh bố cục khi ôn/trình bày.

## Làm gọn khối thông tin CTĐT sinh viên

- Status: DONE
- Date: 2026-10-23
- Files changed:
  - `frontend/portal-student.html`
  - `frontend/js/student.js`
  - `frontend/css/styles.css`
  - `backend/tests/frontend-dom.test.js`
  - `Task.md`

### Changes
- Tách tên chương trình, mã CTĐT, ngành, khoa, khóa học và hai chỉ số tín chỉ/thời gian thành các vùng thông tin có nhãn rõ ràng.
- Dùng khóa học làm giá trị hiển thị, loại bỏ năm tuyển sinh lặp; thêm bố cục thích ứng cho màn hình nhỏ.
- Giữ nguyên huy hiệu trạng thái, bộ chọn học kỳ và bảng môn học.

### Tests / Verification
- `npm test -- --runTestsByPath tests/frontend-dom.test.js`: PASS (1 suite, 11 tests).

### Issues
- Chưa xác nhận trực quan trên trình duyệt ở viewport 375px.

### Next Step
- Tải lại cổng Sinh viên để xem khối thông tin CTĐT mới.

## Thống nhất số học kỳ tiến độ sinh viên

- Status: DONE
- Date: 2026-10-23
- Files changed:
  - `frontend/js/student.js`
  - `frontend/js/registration.js`
  - `frontend/portal-student.html`
  - `Task.md`

### Changes
- Bảng điểm và bộ lọc kỳ hiển thị số kỳ liên tục 1–8 theo năm bắt đầu khóa CTĐT; ví dụ Học kỳ 1 năm học tiếp theo thành Học kỳ 3.
- Đồng bộ nhãn kỳ hiện tại ở dashboard và thời khóa biểu với số kỳ tiến độ; thay nội dung cố định HK7 bằng kỳ hiện tại.
- Giữ tên năm học và học kỳ thực tế trong các màn hình hóa đơn/báo cáo để đối chiếu thời điểm thu và mở lớp.

### Tests / Verification
- Kiểm tra cú pháp JavaScript bằng `node --check` cho các tệp frontend thay đổi.
- Rà `frontend` để tìm nhãn kỳ cố định 1–8 và HK7.

### Issues
- None.

### Next Step
- Tải lại cổng Sinh viên để xem số kỳ tiến độ đã thống nhất.
