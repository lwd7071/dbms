USE [DBMS330284];
GO

CREATE OR ALTER PROCEDURE [dbo].[SP_KhoaTaiKhoan]
    @MaTaiKhoan INT,
    @MaTaiKhoanNguoiThaoTac INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @TuMoTran BIT = 0;
    DECLARE @DaTaoSavepoint BIT = 0;
    DECLARE @TrangThaiHienTai VARCHAR(20);
    DECLARE @VaiTroHienTai VARCHAR(30);
    DECLARE @VaiTroNguoiThaoTac VARCHAR(30);
    DECLARE @TrangThaiNguoiThaoTac VARCHAR(20);
    DECLARE @LaDaoTao BIT = ISNULL(IS_MEMBER(N'DAO_TAO'), 0);
    DECLARE @LaQuanTri BIT = ISNULL(IS_MEMBER(N'QUAN_TRI'), 0);

    BEGIN TRY
        IF @MaTaiKhoan IS NULL
            THROW 51009, N'MaTaiKhoan khong duoc de trong.', 1;

        IF @@TRANCOUNT = 0
        BEGIN
            BEGIN TRANSACTION;
            SET @TuMoTran = 1;
        END
        ELSE
        BEGIN
            SAVE TRANSACTION SP_KhoaTaiKhoan_Save;
            SET @DaTaoSavepoint = 1;
        END;

        SELECT @TrangThaiHienTai = TrangThai, @VaiTroHienTai = VaiTro
        FROM dbo.TAIKHOAN WITH (UPDLOCK, HOLDLOCK)
        WHERE MaTaiKhoan = @MaTaiKhoan;

        IF @TrangThaiHienTai IS NULL
            THROW 51010, N'Khong tim thay tai khoan.', 1;

        IF @MaTaiKhoanNguoiThaoTac IS NOT NULL
        BEGIN
            SELECT @VaiTroNguoiThaoTac = VaiTro, @TrangThaiNguoiThaoTac = TrangThai
            FROM dbo.TAIKHOAN WITH (UPDLOCK, HOLDLOCK)
            WHERE MaTaiKhoan = @MaTaiKhoanNguoiThaoTac;

            IF @VaiTroNguoiThaoTac IS NULL OR @TrangThaiNguoiThaoTac <> 'ACTIVE'
               OR @VaiTroNguoiThaoTac NOT IN ('DAO_TAO', 'QUAN_TRI')
                THROW 51012, N'Chi DAO_TAO hoac QUAN_TRI dang hoat dong duoc khoa tai khoan.', 1;

            IF @MaTaiKhoanNguoiThaoTac = @MaTaiKhoan
                THROW 51015, N'Khong the tu khoa tai khoan dang dang nhap.', 1;

            IF @VaiTroNguoiThaoTac = 'DAO_TAO' AND @VaiTroHienTai IN ('DAO_TAO', 'QUAN_TRI')
                THROW 51014, N'Role DAO_TAO khong duoc khoa tai khoan DAO_TAO hoac QUAN_TRI.', 1;
        END
        ELSE
        BEGIN
            IF @LaDaoTao = 0 AND @LaQuanTri = 0 AND USER_NAME() <> N'dbo'
                THROW 51012, N'Chi DAO_TAO hoac QUAN_TRI duoc khoa tai khoan.', 1;

            IF @LaDaoTao = 1 AND @LaQuanTri = 0 AND @VaiTroHienTai IN ('DAO_TAO', 'QUAN_TRI')
                THROW 51014, N'Role DAO_TAO khong duoc khoa tai khoan quan tri.', 1;
        END;

        IF @TrangThaiHienTai = 'DISABLED'
            THROW 51011, N'Tai khoan DISABLED khong the chuyen sang LOCKED.', 1;

        IF @TrangThaiHienTai <> 'LOCKED'
        BEGIN
            UPDATE dbo.TAIKHOAN SET TrangThai = 'LOCKED' WHERE MaTaiKhoan = @MaTaiKhoan;
        END;

        IF @TuMoTran = 1 COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() = 1
        BEGIN
            IF @TuMoTran = 1 ROLLBACK TRANSACTION;
            ELSE IF @DaTaoSavepoint = 1 ROLLBACK TRANSACTION SP_KhoaTaiKhoan_Save;
        END
        ELSE IF XACT_STATE() = -1 AND @TuMoTran = 1 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO
