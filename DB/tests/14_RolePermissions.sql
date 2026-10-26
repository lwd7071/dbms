USE [DBMS330284];
GO
SET NOCOUNT ON;
DECLARE @Passed int = 0;
EXECUTE AS USER = 'dbms_test_student';
BEGIN TRY
    IF ISNULL(HAS_PERMS_BY_NAME(N'dbo.SP_App_Student_Schedule', N'OBJECT', N'EXECUTE'), 0) <> 1
        THROW 52026, N'Sinh viên không có quyền chạy thủ tục lịch học.', 1;
    SET @Passed += 1;
END TRY BEGIN CATCH REVERT; THROW; END CATCH;
BEGIN TRY
    SELECT TOP (0) Username FROM dbo.TAIKHOAN;
    REVERT;
    THROW 52020, N'Sinh viên đọc được bảng tài khoản.', 1;
END TRY BEGIN CATCH
    IF ERROR_NUMBER() = 52020 THROW;
    SET @Passed += 1;
END CATCH;
BEGIN TRY
    UPDATE dbo.DIEMSO SET DiemQuaTrinh = DiemQuaTrinh WHERE 1 = 0;
    REVERT;
    THROW 52021, N'Sinh viên có quyền ghi trực tiếp bảng điểm.', 1;
END TRY BEGIN CATCH
    IF ERROR_NUMBER() = 52021 THROW;
    SET @Passed += 1;
END CATCH;
REVERT;
EXECUTE AS USER = 'dbms_test_training';
IF ISNULL(HAS_PERMS_BY_NAME(N'dbo.SP_App_Admin_Users_List', N'OBJECT', N'EXECUTE'), 0) <> 1
    THROW 52027, N'Đào tạo không có quyền chạy thủ tục danh sách tài khoản.', 1;
REVERT;
EXECUTE AS USER = 'dbms_test_lecturer';
IF ISNULL(HAS_PERMS_BY_NAME(N'dbo.SP_App_Lecturer_Classes', N'OBJECT', N'EXECUTE'), 0) <> 1
    THROW 52028, N'Giảng viên không có quyền chạy thủ tục lớp được phân công.', 1;
REVERT;
EXECUTE AS USER = 'dbms_test_admin';
BEGIN TRY
    SELECT TOP (0) Username FROM dbo.TAIKHOAN;
    REVERT;
    THROW 52024, N'Quản trị đọc được bảng tài khoản trực tiếp.', 1;
END TRY BEGIN CATCH
    IF ERROR_NUMBER() = 52024 THROW;
    SET @Passed += 1;
END CATCH;
BEGIN TRY
    UPDATE dbo.HOCPHI SET TongTien = TongTien WHERE 1 = 0;
    REVERT;
    THROW 52022, N'Quản trị có quyền ghi trực tiếp hồ sơ học phí.', 1;
END TRY BEGIN CATCH
    IF ERROR_NUMBER() = 52022 THROW;
    SET @Passed += 1;
END CATCH;
REVERT;
IF @Passed <> 5 THROW 52023, N'Thiếu phản chứng quyền SQL.', 1;
IF DATABASE_PRINCIPAL_ID(N'APP_RUNTIME') IS NOT NULL OR DATABASE_PRINCIPAL_ID(N'APP_AUTH') IS NOT NULL
    THROW 52025, N'Còn role kỹ thuật ngoài bốn role nghiệp vụ.', 1;
SELECT 'PASS' AS Result, @Passed AS PermissionAssertions;
GO
