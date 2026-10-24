USE [DBMS330284];
GO
SET NOCOUNT ON;
DECLARE @Passed int = 0;
EXECUTE AS USER = 'dbms_test_student';
BEGIN TRY
    SELECT TOP (0) MaSV FROM dbo.V_ThoiKhoaBieuSinhVien;
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
SELECT TOP (0) Username FROM dbo.V_TaiKhoanNguoiDung;
REVERT;
EXECUTE AS USER = 'dbms_test_lecturer';
SELECT TOP (0) MaDangKy FROM dbo.V_BangDiemChiTiet;
REVERT;
EXECUTE AS USER = 'dbms_test_runtime';
SELECT TOP (0) MaHocPhi FROM dbo.V_HocPhiSinhVien;
BEGIN TRY
    SELECT TOP (0) Username FROM dbo.TAIKHOAN;
    REVERT;
    THROW 52024, N'Runtime đọc được bảng tài khoản trực tiếp.', 1;
END TRY BEGIN CATCH
    IF ERROR_NUMBER() = 52024 THROW;
    SET @Passed += 1;
END CATCH;
BEGIN TRY
    UPDATE dbo.HOCPHI SET TongTien = TongTien WHERE 1 = 0;
    REVERT;
    THROW 52022, N'Runtime có quyền ghi trực tiếp hồ sơ học phí.', 1;
END TRY BEGIN CATCH
    IF ERROR_NUMBER() = 52022 THROW;
    SET @Passed += 1;
END CATCH;
REVERT;
IF @Passed <> 5 THROW 52023, N'Thiếu phản chứng quyền SQL.', 1;
SELECT 'PASS' AS Result, @Passed AS PermissionAssertions;
GO
