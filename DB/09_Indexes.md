-- ENCODING: UTF-8 WITH BOM
USE [DBMS330284];
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_CTDT_MONHOC_MaCTDT'
      AND object_id = OBJECT_ID('dbo.CTDT_MONHOC')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_CTDT_MONHOC_MaCTDT
    ON dbo.CTDT_MONHOC (MaCTDT, MaMonHoc)
    INCLUDE (HocKyDuKien, LoaiMon, ThuTu);
END;
GO
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_MONHOCTIENQUYET_MaMonTienQuyet'
      AND object_id = OBJECT_ID('dbo.MONHOCTIENQUYET')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_MONHOCTIENQUYET_MaMonTienQuyet
    ON dbo.MONHOCTIENQUYET (MaMonTienQuyet, MaMonHoc)
    INCLUDE (MucDo);
END;
GO
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_MONHOC_MaKhoa'
      AND object_id = OBJECT_ID('dbo.MONHOC')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_MONHOC_MaKhoa
    ON dbo.MONHOC (MaKhoa, TrangThai)
    INCLUDE (TenMonHoc, SoTinChi);
END;
GO
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_SINHVIEN_MaKhoa_TrangThai'
      AND object_id = OBJECT_ID('dbo.SINHVIEN')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_SINHVIEN_MaKhoa_TrangThai
    ON dbo.SINHVIEN (MaKhoa, TrangThai)
    INCLUDE (MaSinhVien, HoTen, Email);
END;
GO
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_GIANGVIEN_MaKhoa_TrangThai'
      AND object_id = OBJECT_ID('dbo.GIANGVIEN')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_GIANGVIEN_MaKhoa_TrangThai
    ON dbo.GIANGVIEN (MaKhoa, TrangThai)
    INCLUDE (MaGiangVien, HoTen, Email);
END;
GO
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_TAIKHOAN_VaiTro_TrangThai'
      AND object_id = OBJECT_ID('dbo.TAIKHOAN')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_TAIKHOAN_VaiTro_TrangThai
    ON dbo.TAIKHOAN (VaiTro, TrangThai)
    INCLUDE (Username, MaSV, MaGV, LanDangNhapCuoi);
END;
GO
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_HOCKY_TrangThai_NgayMoDangKy'
      AND object_id = OBJECT_ID('dbo.HOCKY')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_HOCKY_TrangThai_NgayMoDangKy
    ON dbo.HOCKY (TrangThai, NgayMoDangKy)
    INCLUDE (NgayDongDangKy, NamHoc, TenHocKy);
END;
GO
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_DANGKYTINCHI_MaSV_MaLHP'
      AND object_id = OBJECT_ID('dbo.DANGKYTINCHI')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_DANGKYTINCHI_MaSV_MaLHP
    ON dbo.DANGKYTINCHI (MaSV, MaLHP)
    INCLUDE (TrangThai, NgayDangKy);
END;
GO
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_DANGKYTINCHI_MaLHP_TrangThai'
      AND object_id = OBJECT_ID('dbo.DANGKYTINCHI')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_DANGKYTINCHI_MaLHP_TrangThai
    ON dbo.DANGKYTINCHI (MaLHP, TrangThai)
    INCLUDE (MaSV, NgayDangKy);
END;
GO
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_LOPHOCPHAN_MaHocKy_MaMonHoc'
      AND object_id = OBJECT_ID('dbo.LOPHOCPHAN')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_LOPHOCPHAN_MaHocKy_MaMonHoc
    ON dbo.LOPHOCPHAN (MaHocKy, MaMonHoc)
    INCLUDE (MaLHP, MaGiangVien, SoLuongToiDa, TrangThai);
END;
GO
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_LICHHOC_MaLHP_Thu_Tiet'
      AND object_id = OBJECT_ID('dbo.LICHHOC')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_LICHHOC_MaLHP_Thu_Tiet
    ON dbo.LICHHOC (MaLHP, Thu, TietBatDau)
    INCLUDE (SoTiet, PhongHoc);
END;
GO
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_HOCPHI_MaSV_MaHocKy'
      AND object_id = OBJECT_ID('dbo.HOCPHI')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_HOCPHI_MaSV_MaHocKy
    ON dbo.HOCPHI (MaSV, MaHocKy);
END;
GO
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_HOCPHI_MaHocKy_TrangThai'
      AND object_id = OBJECT_ID('dbo.HOCPHI')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_HOCPHI_MaHocKy_TrangThai
    ON dbo.HOCPHI (MaHocKy, TrangThai);
END;
GO
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_LOGHOATDONG_ThoiGian'
      AND object_id = OBJECT_ID('dbo.LOGHOATDONG')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_LOGHOATDONG_ThoiGian
    ON dbo.LOGHOATDONG (ThoiGian);
END;
GO
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_LOGHOATDONG_MaTaiKhoan_ThoiGian'
      AND object_id = OBJECT_ID('dbo.LOGHOATDONG')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_LOGHOATDONG_MaTaiKhoan_ThoiGian
    ON dbo.LOGHOATDONG (MaTaiKhoan, ThoiGian);
END;
GO
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_NGANH_MaKhoa'
      AND object_id = OBJECT_ID('dbo.NGANH')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_NGANH_MaKhoa
    ON dbo.NGANH (MaKhoa);
END;
GO
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_CHUONGTRINHDAOTAO_MaNganh'
      AND object_id = OBJECT_ID('dbo.CHUONGTRINHDAOTAO')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_CHUONGTRINHDAOTAO_MaNganh
    ON dbo.CHUONGTRINHDAOTAO (MaNganh);
END;
GO
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_SINHVIEN_MaLop'
      AND object_id = OBJECT_ID('dbo.SINHVIEN')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_SINHVIEN_MaLop
    ON dbo.SINHVIEN (MaLop)
    INCLUDE (HoTen, Email, TrangThai);
END;
GO
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_LOP_MaKhoa_NamNhapHoc'
      AND object_id = OBJECT_ID('dbo.LOP')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_LOP_MaKhoa_NamNhapHoc
    ON dbo.LOP (MaKhoa, NamNhapHoc)
    INCLUDE (TenLop, KhoaHoc, TrangThai);
END;
GO
SELECT
    OBJECT_NAME(object_id) AS TenBang,
    name AS TenIndex,
    type_desc AS LoaiIndex
FROM sys.indexes
WHERE name IN
(
    'IX_NGANH_MaKhoa',
    'IX_CHUONGTRINHDAOTAO_MaNganh',
    'IX_CTDT_MONHOC_MaCTDT',
    'IX_MONHOCTIENQUYET_MaMonTienQuyet',
    'IX_MONHOC_MaKhoa',
    'IX_SINHVIEN_MaKhoa_TrangThai',
    'IX_SINHVIEN_MaLop',
    'IX_LOP_MaKhoa_NamNhapHoc',
    'IX_GIANGVIEN_MaKhoa_TrangThai',
    'IX_TAIKHOAN_VaiTro_TrangThai',
    'IX_HOCKY_TrangThai_NgayMoDangKy',
    'IX_DANGKYTINCHI_MaSV_MaLHP',
    'IX_DANGKYTINCHI_MaLHP_TrangThai',
    'IX_LOPHOCPHAN_MaHocKy_MaMonHoc',
    'IX_LICHHOC_MaLHP_Thu_Tiet',
    'IX_HOCPHI_MaSV_MaHocKy',
    'IX_HOCPHI_MaHocKy_TrangThai',
    'IX_LOGHOATDONG_ThoiGian',
    'IX_LOGHOATDONG_MaTaiKhoan_ThoiGian'
)
ORDER BY TenBang, TenIndex;
GO