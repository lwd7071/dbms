-- ENCODING: UTF-8 WITH BOM
USE [$(DatabaseName)];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @MaSVTest INT;
    DECLARE @MaLHPTest VARCHAR(20);

    SELECT TOP (1) @MaSVTest = sv.MaSV
    FROM dbo.SINHVIEN sv
    WHERE sv.TrangThai = 'DANG_HOC'
      AND NOT EXISTS (
          SELECT 1 FROM dbo.DANGKYTINCHI dk 
          INNER JOIN dbo.LOPHOCPHAN l ON dk.MaLHP = l.MaLHP
          WHERE dk.MaSV = sv.MaSV AND l.MaMonHoc = 'TRIET'
      )
    ORDER BY sv.MaSV;

    SELECT TOP (1) @MaLHPTest = lhp.MaLHP
    FROM dbo.LOPHOCPHAN lhp
    WHERE lhp.TrangThai = 'MO_DANG_KY' AND lhp.MaMonHoc = 'TRIET'
    ORDER BY lhp.MaLHP;

    IF @MaSVTest IS NOT NULL AND @MaLHPTest IS NOT NULL
    BEGIN
        EXEC dbo.SP_DangKyTinChi
            @MaSV = @MaSVTest,
            @MaLHP = @MaLHPTest;
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @MaSVTest INT;
    DECLARE @MaLHPTest VARCHAR(20);

    SELECT TOP (1) 
        @MaSVTest = dk.MaSV,
        @MaLHPTest = dk.MaLHP
    FROM dbo.DANGKYTINCHI dk
    INNER JOIN dbo.LOPHOCPHAN lhp ON dk.MaLHP = lhp.MaLHP
    WHERE dk.TrangThai = 'REGISTERED'
      AND lhp.TrangThai = 'MO_DANG_KY'
    ORDER BY dk.MaDangKy DESC;

    IF @MaSVTest IS NOT NULL AND @MaLHPTest IS NOT NULL
    BEGIN
        EXEC dbo.SP_HuyDangKy
            @MaSV = @MaSVTest,
            @MaLHP = @MaLHPTest;
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @MaSVTest INT;
    DECLARE @MaHocKyTest INT;

    SELECT TOP (1) @MaHocKyTest = MaHocKy
    FROM dbo.HOCKY
    WHERE TrangThai = 'DANG_MO';

    SELECT TOP (1) @MaSVTest = dk.MaSV
    FROM dbo.DANGKYTINCHI dk
    INNER JOIN dbo.LOPHOCPHAN lhp ON dk.MaLHP = lhp.MaLHP
    WHERE lhp.MaHocKy = @MaHocKyTest
      AND dk.TrangThai = 'REGISTERED'
      AND NOT EXISTS (
          SELECT 1 FROM dbo.HOCPHI hp 
          WHERE hp.MaSV = dk.MaSV AND hp.MaHocKy = @MaHocKyTest
      )
    ORDER BY dk.MaSV DESC;

    IF @MaSVTest IS NOT NULL AND @MaHocKyTest IS NOT NULL
    BEGIN
        EXEC dbo.SP_TinhHocPhiSinhVien
            @MaSV = @MaSVTest,
            @MaHocKy = @MaHocKyTest;
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @MaHocPhi BIGINT;
    DECLARE @SoTien DECIMAL(14,2);

    SELECT TOP (1)
        @MaHocPhi = MaHocPhi,
        @SoTien = TongTien - SoTienDaThanhToan
    FROM dbo.HOCPHI
    WHERE TrangThai IN ('UNPAID', 'PARTIAL')
      AND TongTien > SoTienDaThanhToan
    ORDER BY MaHocPhi DESC;

    IF @MaHocPhi IS NULL
        THROW 51201, N'Khong co hoc phi chua thanh toan.', 1;

    INSERT INTO dbo.CHITIETTHANHTOAN
    (
        MaHocPhi,
        SoTien,
        PhuongThuc
    )
    VALUES
    (
        @MaHocPhi,
        @SoTien,
        'CHUYEN_KHOAN'
    );

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @MaHocPhiRollback BIGINT;

    SELECT TOP (1)
        @MaHocPhiRollback = MaHocPhi
    FROM dbo.HOCPHI
    ORDER BY MaHocPhi DESC;

    IF @MaHocPhiRollback IS NULL
        THROW 51202, N'Khong co hoc phi de thuc hien transaction.', 1;

    UPDATE dbo.HOCPHI
    SET NgayCapNhat = SYSUTCDATETIME()
    WHERE MaHocPhi = @MaHocPhiRollback;

    THROW 51203, N'Giao dich that bai, thuc hien ROLLBACK.', 1;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0
        ROLLBACK TRANSACTION;

    IF ERROR_NUMBER() <> 51203
        THROW;
END CATCH;
GO