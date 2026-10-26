-- Bốn role nghiệp vụ; tài khoản xác thực dbms_app chỉ nhận quyền trên ba thủ tục đăng nhập.
USE [DBMS330284];
GO
IF DATABASE_PRINCIPAL_ID('SINH_VIEN') IS NULL CREATE ROLE SINH_VIEN;
IF DATABASE_PRINCIPAL_ID('GIANG_VIEN') IS NULL CREATE ROLE GIANG_VIEN;
IF DATABASE_PRINCIPAL_ID('DAO_TAO') IS NULL CREATE ROLE DAO_TAO;
IF DATABASE_PRINCIPAL_ID('QUAN_TRI') IS NULL CREATE ROLE QUAN_TRI;
GO

-- Phụ trách: Trần Biểu Hương
GRANT SELECT ON dbo.V_ThoiKhoaBieuSinhVien TO SINH_VIEN;
GRANT SELECT ON dbo.V_BangDiemChiTiet TO SINH_VIEN;
GRANT SELECT ON dbo.V_CauTrucChuongTrinhDAOTAO TO SINH_VIEN;
GRANT EXECUTE ON dbo.SP_DangKyTinChi TO SINH_VIEN;
GRANT EXECUTE ON dbo.SP_HuyDangKy TO SINH_VIEN;

-- Phụ trách: Trần Biểu Hương
GRANT SELECT ON dbo.V_BangDiemChiTiet TO GIANG_VIEN;
GRANT SELECT ON dbo.V_CauTrucChuongTrinhDAOTAO TO GIANG_VIEN;
GRANT EXECUTE ON dbo.FN_TinhDiemTongKet TO GIANG_VIEN;

-- Phụ trách: Lê Trung Đông
GRANT SELECT ON dbo.V_TaiKhoanNguoiDung TO DAO_TAO;

-- Phụ trách: Lương Viết Vĩ Đông
GRANT SELECT ON dbo.V_CauTrucChuongTrinhDAOTAO TO DAO_TAO;

-- Phụ trách: Trần Biểu Hương
GRANT SELECT ON dbo.V_BangDiemChiTiet TO DAO_TAO;
GRANT SELECT ON dbo.V_ThoiKhoaBieuSinhVien TO DAO_TAO;

-- Phụ trách: Âu Quốc Khánh
GRANT SELECT ON dbo.V_HocPhiSinhVien TO DAO_TAO;
-- Phụ trách: Lê Trung Đông
GRANT EXECUTE ON dbo.SP_TaoTaiKhoan TO DAO_TAO;
GRANT EXECUTE ON dbo.SP_KhoaTaiKhoan TO DAO_TAO;

-- Phụ trách: Âu Quốc Khánh
GRANT EXECUTE ON dbo.SP_TinhHocPhiSinhVien TO DAO_TAO;
GRANT EXECUTE ON dbo.SP_ThongKeHocPhi TO DAO_TAO;
GRANT EXECUTE ON dbo.SP_ThongKeHocPhiTheoLop TO DAO_TAO;
GRANT EXECUTE ON dbo.SP_XacNhanThanhToan TO DAO_TAO;
GRANT EXECUTE ON dbo.SP_TuChoiThanhToan TO DAO_TAO;
GO

-- Web CRUD phải đi qua procedure; không cấp DML trực tiếp trên bảng danh mục cho QUAN_TRI.
-- Phụ trách: Lê Trung Đông
GRANT SELECT ON dbo.V_TaiKhoanNguoiDung TO QUAN_TRI;

-- Phụ trách: Lương Viết Vĩ Đông
GRANT SELECT ON dbo.V_CauTrucChuongTrinhDAOTAO TO QUAN_TRI;

-- Phụ trách: Trần Biểu Hương
GRANT SELECT ON dbo.V_ThoiKhoaBieuSinhVien TO QUAN_TRI;
GRANT SELECT ON dbo.V_BangDiemChiTiet TO QUAN_TRI;

-- Phụ trách: Âu Quốc Khánh
GRANT SELECT ON dbo.V_HocPhiSinhVien TO QUAN_TRI;

-- Phụ trách: Trần Biểu Hương
GRANT EXECUTE ON dbo.SP_DangKyTinChi TO QUAN_TRI;
GRANT EXECUTE ON dbo.SP_HuyDangKy TO QUAN_TRI;

-- Phụ trách: Lê Trung Đông
GRANT EXECUTE ON dbo.SP_TaoTaiKhoan TO QUAN_TRI;
GRANT EXECUTE ON dbo.SP_KhoaTaiKhoan TO QUAN_TRI;

-- Phụ trách: Âu Quốc Khánh
GRANT EXECUTE ON dbo.SP_TinhHocPhiSinhVien TO QUAN_TRI;
GRANT EXECUTE ON dbo.SP_ThongKeHocPhi TO QUAN_TRI;
GRANT EXECUTE ON dbo.SP_ThongKeHocPhiTheoLop TO QUAN_TRI;
GRANT EXECUTE ON dbo.SP_XacNhanThanhToan TO QUAN_TRI;
GRANT EXECUTE ON dbo.SP_TuChoiThanhToan TO QUAN_TRI;
GO

-- Phụ trách: Lương Viết Vĩ Đông
-- Chặn truy cập trực tiếp; các thao tác hợp lệ đi qua stored procedure đã cấp cho role nghiệp vụ.
DENY SELECT ON dbo.TAIKHOAN TO SINH_VIEN, GIANG_VIEN, DAO_TAO, QUAN_TRI;
DENY INSERT, UPDATE, DELETE ON dbo.DANGKYTINCHI TO SINH_VIEN, GIANG_VIEN, DAO_TAO, QUAN_TRI;
DENY INSERT, UPDATE, DELETE ON dbo.DIEMSO TO SINH_VIEN, GIANG_VIEN, DAO_TAO, QUAN_TRI;
DENY INSERT, UPDATE, DELETE ON dbo.HOCPHI TO SINH_VIEN, GIANG_VIEN, DAO_TAO, QUAN_TRI;
DENY INSERT, UPDATE, DELETE ON dbo.CHITIETTHANHTOAN TO SINH_VIEN, GIANG_VIEN, DAO_TAO, QUAN_TRI;
DENY INSERT, UPDATE, DELETE ON dbo.LOGHOATDONG TO SINH_VIEN, GIANG_VIEN, DAO_TAO, QUAN_TRI;
GO

-- Phụ trách: Lương Viết Vĩ Đông
-- Map an already-provisioned low-privilege SQL login; this script never creates a password.
IF SUSER_ID(N'dbms_app') IS NOT NULL AND DATABASE_PRINCIPAL_ID(N'dbms_app') IS NULL
    CREATE USER dbms_app FOR LOGIN dbms_app;
GO
-- Principals without a login make role tests exercise SQL permissions safely.
IF DATABASE_PRINCIPAL_ID(N'dbms_test_student') IS NULL CREATE USER dbms_test_student WITHOUT LOGIN;
IF DATABASE_PRINCIPAL_ID(N'dbms_test_lecturer') IS NULL CREATE USER dbms_test_lecturer WITHOUT LOGIN;
IF DATABASE_PRINCIPAL_ID(N'dbms_test_training') IS NULL CREATE USER dbms_test_training WITHOUT LOGIN;
IF DATABASE_PRINCIPAL_ID(N'dbms_test_admin') IS NULL CREATE USER dbms_test_admin WITHOUT LOGIN;
GO
IF NOT EXISTS (SELECT 1 FROM sys.database_role_members WHERE role_principal_id=DATABASE_PRINCIPAL_ID('SINH_VIEN') AND member_principal_id=DATABASE_PRINCIPAL_ID('dbms_test_student')) ALTER ROLE SINH_VIEN ADD MEMBER dbms_test_student;
IF NOT EXISTS (SELECT 1 FROM sys.database_role_members WHERE role_principal_id=DATABASE_PRINCIPAL_ID('GIANG_VIEN') AND member_principal_id=DATABASE_PRINCIPAL_ID('dbms_test_lecturer')) ALTER ROLE GIANG_VIEN ADD MEMBER dbms_test_lecturer;
IF NOT EXISTS (SELECT 1 FROM sys.database_role_members WHERE role_principal_id=DATABASE_PRINCIPAL_ID('DAO_TAO') AND member_principal_id=DATABASE_PRINCIPAL_ID('dbms_test_training')) ALTER ROLE DAO_TAO ADD MEMBER dbms_test_training;
IF NOT EXISTS (SELECT 1 FROM sys.database_role_members WHERE role_principal_id=DATABASE_PRINCIPAL_ID('QUAN_TRI') AND member_principal_id=DATABASE_PRINCIPAL_ID('dbms_test_admin')) ALTER ROLE QUAN_TRI ADD MEMBER dbms_test_admin;
GO

-- Phụ trách: Âu Quốc Khánh
DENY UPDATE, DELETE ON dbo.LOGHOATDONG TO SINH_VIEN;
DENY UPDATE, DELETE ON dbo.LOGHOATDONG TO GIANG_VIEN;
DENY UPDATE, DELETE ON dbo.LOGHOATDONG TO DAO_TAO;
-- Phụ trách: Lê Trung Đông
-- dbms_app xác thực bằng stored procedure, không đọc trực tiếp dữ liệu tài khoản.
IF DATABASE_PRINCIPAL_ID(N'dbms_app') IS NOT NULL
BEGIN
    DENY SELECT ON dbo.TAIKHOAN TO dbms_app;
    DENY INSERT, UPDATE, DELETE ON dbo.DANGKYTINCHI TO dbms_app;
    DENY INSERT, UPDATE, DELETE ON dbo.DIEMSO TO dbms_app;
    DENY INSERT, UPDATE, DELETE ON dbo.HOCPHI TO dbms_app;
    DENY INSERT, UPDATE, DELETE ON dbo.CHITIETTHANHTOAN TO dbms_app;
    DENY INSERT, UPDATE, DELETE ON dbo.LOGHOATDONG TO dbms_app;
END;
GO

GO
-- Remove legacy broad grants as well, so rerunning this file tightens existing databases.
REVOKE INSERT, UPDATE, DELETE ON dbo.KHOA FROM QUAN_TRI;
REVOKE INSERT, UPDATE, DELETE ON dbo.NGANH FROM QUAN_TRI;
REVOKE INSERT, UPDATE, DELETE ON dbo.CHUONGTRINHDAOTAO FROM QUAN_TRI;
REVOKE INSERT, UPDATE, DELETE ON dbo.MONHOC FROM QUAN_TRI;
REVOKE INSERT, UPDATE, DELETE ON dbo.CTDT_MONHOC FROM QUAN_TRI;
REVOKE INSERT, UPDATE, DELETE ON dbo.MONHOCTIENQUYET FROM QUAN_TRI;
REVOKE INSERT, UPDATE, DELETE ON dbo.SINHVIEN FROM QUAN_TRI;
REVOKE INSERT, UPDATE, DELETE ON dbo.GIANGVIEN FROM QUAN_TRI;
REVOKE INSERT, UPDATE, DELETE ON dbo.TAIKHOAN FROM QUAN_TRI;
REVOKE INSERT, UPDATE ON dbo.HOCKY FROM QUAN_TRI;
REVOKE INSERT, UPDATE, DELETE ON dbo.LOPHOCPHAN FROM QUAN_TRI;
REVOKE INSERT, UPDATE, DELETE ON dbo.LICHHOC FROM QUAN_TRI;
REVOKE SELECT ON dbo.LOGHOATDONG FROM DAO_TAO;

-- Keep legacy route reads available to the two staff roles while the remaining repositories migrate to procedures.
GRANT SELECT ON dbo.KHOA TO DAO_TAO, QUAN_TRI;
GRANT SELECT ON dbo.NGANH TO DAO_TAO, QUAN_TRI;
GRANT SELECT ON dbo.CHUONGTRINHDAOTAO TO DAO_TAO, QUAN_TRI;
GRANT SELECT ON dbo.MONHOC TO DAO_TAO, QUAN_TRI;
GRANT SELECT ON dbo.CTDT_MONHOC TO DAO_TAO, QUAN_TRI;
GRANT SELECT ON dbo.MONHOCTIENQUYET TO DAO_TAO, QUAN_TRI;
GRANT SELECT ON dbo.SINHVIEN TO DAO_TAO, QUAN_TRI;
GRANT SELECT ON dbo.GIANGVIEN TO DAO_TAO, QUAN_TRI;
GRANT SELECT ON dbo.HOCKY TO DAO_TAO, QUAN_TRI;
GRANT SELECT ON dbo.LOPHOCPHAN TO DAO_TAO, QUAN_TRI;
GRANT SELECT ON dbo.LICHHOC TO DAO_TAO, QUAN_TRI;

-- Mỗi business login thuộc đúng một role nghiệp vụ; dbms_app chỉ được chạy thủ tục xác thực.
IF SUSER_ID(N'dbms_app') IS NOT NULL
BEGIN
  IF DATABASE_PRINCIPAL_ID(N'dbms_app') IS NULL CREATE USER [dbms_app] FOR LOGIN [dbms_app];
END;
IF SUSER_ID(N'dbms_student') IS NOT NULL
BEGIN
  IF DATABASE_PRINCIPAL_ID(N'dbms_student') IS NULL CREATE USER [dbms_student] FOR LOGIN [dbms_student];
  IF NOT EXISTS (SELECT 1 FROM sys.database_role_members WHERE role_principal_id=DATABASE_PRINCIPAL_ID(N'SINH_VIEN') AND member_principal_id=DATABASE_PRINCIPAL_ID(N'dbms_student')) ALTER ROLE SINH_VIEN ADD MEMBER [dbms_student];
END;
IF SUSER_ID(N'dbms_lecturer') IS NOT NULL
BEGIN
  IF DATABASE_PRINCIPAL_ID(N'dbms_lecturer') IS NULL CREATE USER [dbms_lecturer] FOR LOGIN [dbms_lecturer];
  IF NOT EXISTS (SELECT 1 FROM sys.database_role_members WHERE role_principal_id=DATABASE_PRINCIPAL_ID(N'GIANG_VIEN') AND member_principal_id=DATABASE_PRINCIPAL_ID(N'dbms_lecturer')) ALTER ROLE GIANG_VIEN ADD MEMBER [dbms_lecturer];
END;
IF SUSER_ID(N'dbms_training') IS NOT NULL
BEGIN
  IF DATABASE_PRINCIPAL_ID(N'dbms_training') IS NULL CREATE USER [dbms_training] FOR LOGIN [dbms_training];
  IF NOT EXISTS (SELECT 1 FROM sys.database_role_members WHERE role_principal_id=DATABASE_PRINCIPAL_ID(N'DAO_TAO') AND member_principal_id=DATABASE_PRINCIPAL_ID(N'dbms_training')) ALTER ROLE DAO_TAO ADD MEMBER [dbms_training];
END;
IF SUSER_ID(N'dbms_admin') IS NOT NULL
BEGIN
  IF DATABASE_PRINCIPAL_ID(N'dbms_admin') IS NULL CREATE USER [dbms_admin] FOR LOGIN [dbms_admin];
  IF NOT EXISTS (SELECT 1 FROM sys.database_role_members WHERE role_principal_id=DATABASE_PRINCIPAL_ID(N'QUAN_TRI') AND member_principal_id=DATABASE_PRINCIPAL_ID(N'dbms_admin')) ALTER ROLE QUAN_TRI ADD MEMBER [dbms_admin];
END;
GO
-- Authentication boundary: dbms_app receives only the three authentication procedures.
IF DATABASE_PRINCIPAL_ID(N'dbms_app') IS NOT NULL
BEGIN
    GRANT EXECUTE ON dbo.SP_App_Auth_FindByUsername TO dbms_app;
    GRANT EXECUTE ON dbo.SP_App_Auth_FindById TO dbms_app;
    GRANT EXECUTE ON dbo.SP_App_Auth_UpdateLastLogin TO dbms_app;
END;
GO
-- Shared catalog reads and role-scoped CRUD procedures.
GRANT EXECUTE ON dbo.SP_App_Faculty_List TO SINH_VIEN, GIANG_VIEN, DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Faculty_ListMajors TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Major_List TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Faculty_Create TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Faculty_Update TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Faculty_DeleteFaculty TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Major_Create TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Major_Update TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Major_Delete TO DAO_TAO, QUAN_TRI;
GO

GO
GRANT EXECUTE ON dbo.SP_App_Course_DefaultOpenSemester TO SINH_VIEN, GIANG_VIEN, DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Course_ListAvailable TO SINH_VIEN, GIANG_VIEN, DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Semester_List TO SINH_VIEN, GIANG_VIEN, DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Semester_Current TO SINH_VIEN, GIANG_VIEN, DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Class_CreateHomeroom TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Class_UpdateHomeroom TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Class_DeleteHomeroom TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Class_ListHomerooms TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Class_GetHomeroom TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Registration_GetById TO SINH_VIEN;
GRANT EXECUTE ON dbo.SP_App_Registration_ListStudent TO SINH_VIEN;
GRANT EXECUTE ON dbo.SP_App_Lecturer_Schedule TO GIANG_VIEN;
GRANT EXECUTE ON dbo.SP_App_Lecturer_Classes TO GIANG_VIEN;
GRANT EXECUTE ON dbo.SP_App_Lecturer_ClassStudents TO GIANG_VIEN;
GRANT EXECUTE ON dbo.SP_App_Lecturer_IsAssigned TO GIANG_VIEN;
GRANT EXECUTE ON dbo.SP_App_Lecturer_UpdateClassGrades TO GIANG_VIEN;
GO

GO
GRANT EXECUTE ON dbo.SP_App_Student_Schedule TO SINH_VIEN, DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Student_Grades TO SINH_VIEN, DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Student_Tuition TO SINH_VIEN, DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Student_PaymentHistory TO SINH_VIEN, DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Student_Profile TO SINH_VIEN, DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Student_Curriculum TO SINH_VIEN, DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Tuition_CreatePayment TO SINH_VIEN, DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Tuition_PendingPayments TO DAO_TAO, QUAN_TRI;
GO

GO
GRANT EXECUTE ON dbo.SP_App_Admin_Course_List TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_Course_Create TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_Course_Update TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_Course_Delete TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_CurriculumCourse_Create TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_CurriculumCourse_Update TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_CurriculumCourse_Delete TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_Class_Create TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_Class_Update TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_Class_Delete TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_Class_Get TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_LecturerOptions TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_ClassSchedule_Create TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_ClassSchedule_Update TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_ClassSchedule_Delete TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_Users_List TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_UserStatus TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_Dashboard TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_Students_List TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_Classes_List TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_Registrations_List TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_AuditLogs TO QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_Student_Create TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_Student_Update TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_Student_Delete TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_Curriculums_List TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_CurriculumOptions TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_CurriculumPrograms_List TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_CurriculumProgram_Get TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_CurriculumProgram_Create TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_CurriculumProgram_Update TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Admin_CurriculumProgram_Delete TO DAO_TAO, QUAN_TRI;
GO
-- Request handlers now use role-scoped procedures; remove legacy direct reads from web roles.
REVOKE SELECT ON dbo.V_ThoiKhoaBieuSinhVien FROM SINH_VIEN, DAO_TAO, QUAN_TRI;
REVOKE SELECT ON dbo.V_BangDiemChiTiet FROM SINH_VIEN, GIANG_VIEN, DAO_TAO, QUAN_TRI;
REVOKE SELECT ON dbo.V_CauTrucChuongTrinhDAOTAO FROM SINH_VIEN, GIANG_VIEN, DAO_TAO, QUAN_TRI;
REVOKE SELECT ON dbo.V_TaiKhoanNguoiDung FROM DAO_TAO, QUAN_TRI;
REVOKE SELECT ON dbo.V_HocPhiSinhVien FROM DAO_TAO, QUAN_TRI;
REVOKE SELECT ON dbo.KHOA FROM DAO_TAO, QUAN_TRI;
REVOKE SELECT ON dbo.NGANH FROM DAO_TAO, QUAN_TRI;
REVOKE SELECT ON dbo.CHUONGTRINHDAOTAO FROM DAO_TAO, QUAN_TRI;
REVOKE SELECT ON dbo.MONHOC FROM DAO_TAO, QUAN_TRI;
REVOKE SELECT ON dbo.CTDT_MONHOC FROM DAO_TAO, QUAN_TRI;
REVOKE SELECT ON dbo.MONHOCTIENQUYET FROM DAO_TAO, QUAN_TRI;
REVOKE SELECT ON dbo.SINHVIEN FROM DAO_TAO, QUAN_TRI;
REVOKE SELECT ON dbo.GIANGVIEN FROM DAO_TAO, QUAN_TRI;
REVOKE SELECT ON dbo.HOCKY FROM DAO_TAO, QUAN_TRI;
REVOKE SELECT ON dbo.LOPHOCPHAN FROM DAO_TAO, QUAN_TRI;
REVOKE SELECT ON dbo.LICHHOC FROM DAO_TAO, QUAN_TRI;
REVOKE EXECUTE ON dbo.SP_DangKyTinChi FROM SINH_VIEN, QUAN_TRI;
REVOKE EXECUTE ON dbo.SP_HuyDangKy FROM SINH_VIEN, QUAN_TRI;
REVOKE EXECUTE ON dbo.SP_XacNhanThanhToan FROM DAO_TAO, QUAN_TRI;
REVOKE EXECUTE ON dbo.SP_TuChoiThanhToan FROM DAO_TAO, QUAN_TRI;
REVOKE EXECUTE ON dbo.SP_TinhHocPhiSinhVien FROM DAO_TAO, QUAN_TRI;
REVOKE EXECUTE ON dbo.SP_KhoaTaiKhoan FROM DAO_TAO, QUAN_TRI;
REVOKE EXECUTE ON dbo.SP_TaoTaiKhoan FROM DAO_TAO, QUAN_TRI;
GO
GRANT EXECUTE ON dbo.SP_App_Registration_Create TO SINH_VIEN;
GRANT EXECUTE ON dbo.SP_App_Registration_Cancel TO SINH_VIEN;
GRANT EXECUTE ON dbo.SP_App_Tuition_ConfirmPayment TO DAO_TAO, QUAN_TRI;
GRANT EXECUTE ON dbo.SP_App_Tuition_RejectPayment TO DAO_TAO, QUAN_TRI;
GO

-- Remove the retired shared role from databases that were secured by an older script.
IF DATABASE_PRINCIPAL_ID(N'APP_RUNTIME') IS NOT NULL
BEGIN
    DECLARE @RuntimeMember sysname, @DropRuntimeMember nvarchar(300);
    DECLARE runtime_members CURSOR LOCAL STATIC READ_ONLY FOR
        SELECT member.name
        FROM sys.database_role_members AS membership
        JOIN sys.database_principals AS member ON member.principal_id = membership.member_principal_id
        WHERE membership.role_principal_id = DATABASE_PRINCIPAL_ID(N'APP_RUNTIME');
    OPEN runtime_members;
    FETCH NEXT FROM runtime_members INTO @RuntimeMember;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @DropRuntimeMember = N'ALTER ROLE APP_RUNTIME DROP MEMBER ' + QUOTENAME(@RuntimeMember);
        EXEC sys.sp_executesql @DropRuntimeMember;
        FETCH NEXT FROM runtime_members INTO @RuntimeMember;
    END;
    CLOSE runtime_members;
    DEALLOCATE runtime_members;
    DROP ROLE APP_RUNTIME;
END;
IF DATABASE_PRINCIPAL_ID(N'APP_AUTH') IS NOT NULL
BEGIN
    DECLARE @AuthMember sysname, @DropAuthMember nvarchar(300);
    DECLARE auth_members CURSOR LOCAL STATIC READ_ONLY FOR
        SELECT member.name
        FROM sys.database_role_members AS membership
        JOIN sys.database_principals AS member ON member.principal_id = membership.member_principal_id
        WHERE membership.role_principal_id = DATABASE_PRINCIPAL_ID(N'APP_AUTH');
    OPEN auth_members;
    FETCH NEXT FROM auth_members INTO @AuthMember;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @DropAuthMember = N'ALTER ROLE APP_AUTH DROP MEMBER ' + QUOTENAME(@AuthMember);
        EXEC sys.sp_executesql @DropAuthMember;
        FETCH NEXT FROM auth_members INTO @AuthMember;
    END;
    CLOSE auth_members;
    DEALLOCATE auth_members;
    DROP ROLE APP_AUTH;
END;
IF DATABASE_PRINCIPAL_ID(N'dbms_test_runtime') IS NOT NULL DROP USER dbms_test_runtime;
GO
GO
