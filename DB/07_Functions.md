-- ENCODING: UTF-8 WITH BOM
USE [DBMS330284];
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER FUNCTION [dbo].[FN_KiemTraTienQuyet]
(
    @MaSV INT,
    @MaMonHoc VARCHAR(15)
)
RETURNS BIT
AS
BEGIN
    DECLARE @KetQua BIT = 1;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.MONHOCTIENQUYET mtq
        WHERE mtq.MaMonHoc = @MaMonHoc
          AND mtq.MucDo = 'BAT_BUOC'
          AND NOT EXISTS
          (
              SELECT 1
              FROM dbo.DANGKYTINCHI dk
              INNER JOIN dbo.DIEMSO ds
                  ON ds.MaDangKy = dk.MaDangKy
              INNER JOIN dbo.LOPHOCPHAN lhp
                  ON lhp.MaLHP = dk.MaLHP
              WHERE dk.MaSV = @MaSV
                AND lhp.MaMonHoc = mtq.MaMonTienQuyet
                AND dk.TrangThai = 'REGISTERED'
                AND
                (
                    ds.DiemQuaTrinh * ds.TyTrongQT / 100.0
                    + ds.DiemGiuaKy * ds.TyTrongGK / 100.0
                    + ds.DiemCuoiKy * ds.TyTrongCK / 100.0
                ) >= 5.0
          )
    )
    BEGIN
        SET @KetQua = 0;
    END;

    RETURN @KetQua;
END;
GO

CREATE OR ALTER FUNCTION [dbo].[FN_KiemTraThoiGianDangKy]
(
    @MaHocKy INT,
    @ThoiDiem DATETIME2
)
RETURNS BIT
AS
BEGIN
    DECLARE @KetQua BIT = 0;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.HOCKY
        WHERE MaHocKy = @MaHocKy
          AND TrangThai = 'DANG_MO'
          AND @ThoiDiem >= NgayMoDangKy
          AND @ThoiDiem <= NgayDongDangKy
    )
    BEGIN
        SET @KetQua = 1;
    END;

    RETURN @KetQua;
END;
GO

CREATE OR ALTER FUNCTION [dbo].[FN_TongTinChiDangKy]
(
    @MaSV INT,
    @MaHocKy INT
)
RETURNS INT
AS
BEGIN
    DECLARE @TongTinChi INT;

    SELECT
        @TongTinChi = ISNULL(SUM(mh.SoTinChi), 0)
    FROM dbo.DANGKYTINCHI dk
    INNER JOIN dbo.LOPHOCPHAN lhp
        ON lhp.MaLHP = dk.MaLHP
    INNER JOIN dbo.MONHOC mh
        ON mh.MaMonHoc = lhp.MaMonHoc
    WHERE dk.MaSV = @MaSV
      AND dk.TrangThai = 'REGISTERED'
      AND lhp.MaHocKy = @MaHocKy;

    RETURN @TongTinChi;
END;
GO

CREATE OR ALTER FUNCTION [dbo].[FN_TinhDiemTongKet]
(
    @DiemQuaTrinh DECIMAL(4,2),
    @DiemGiuaKy DECIMAL(4,2),
    @DiemCuoiKy DECIMAL(4,2),
    @TyTrongQT TINYINT,
    @TyTrongGK TINYINT,
    @TyTrongCK TINYINT
)
RETURNS DECIMAL(4,2)
AS
BEGIN
    RETURN CAST
    (
        @DiemQuaTrinh * @TyTrongQT / 100.0
        + @DiemGiuaKy * @TyTrongGK / 100.0
        + @DiemCuoiKy * @TyTrongCK / 100.0
        AS DECIMAL(4,2)
    );
END;
GO

CREATE OR ALTER FUNCTION [dbo].[FN_KiemTraTaiKhoanDangHoatDong]
(
    @MaTaiKhoan INT
)
RETURNS BIT
AS
BEGIN
    DECLARE @KetQua BIT = 0;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.TAIKHOAN
        WHERE MaTaiKhoan = @MaTaiKhoan
          AND TrangThai = 'ACTIVE'
    )
    BEGIN
        SET @KetQua = 1;
    END;

    RETURN @KetQua;
END;
GO

CREATE OR ALTER FUNCTION [dbo].[FN_LayDonGiaTinChi]
(
    @MaHocKy INT,
    @NgayTinh DATE
)
RETURNS DECIMAL(12,2)
AS
BEGIN
    DECLARE @DonGia DECIMAL(12,2);

    SELECT TOP 1
        @DonGia = DonGiaTinChi
    FROM dbo.MUCHOCPHI
    WHERE MaHocKy = @MaHocKy
      AND PhamViApDung = 'TOAN_TRUONG'
      AND TrangThai = 'ACTIVE'
      AND NgayHieuLuc <= @NgayTinh
      AND
      (
          NgayHetHieuLuc IS NULL
          OR NgayHetHieuLuc >= @NgayTinh
      )
    ORDER BY NgayHieuLuc DESC, MaMucHocPhi DESC;

    RETURN @DonGia;
END;
GO

-- 7. Hàm đếm sĩ số sinh viên của lớp sinh hoạt
CREATE OR ALTER FUNCTION [dbo].[FN_DemSiSoLopSinhHoat]
(
    @MaLop VARCHAR(20)
)
RETURNS INT
AS
BEGIN
    DECLARE @SiSo INT = 0;
    SELECT @SiSo = COUNT(*)
    FROM dbo.SINHVIEN
    WHERE MaLop = @MaLop;
    RETURN ISNULL(@SiSo, 0);
END;
GO