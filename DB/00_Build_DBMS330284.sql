-- Dựng CSDL DBMS330284 hoàn chỉnh bằng cách chạy trực tiếp file này trong SSMS.
-- CẢNH BÁO: nếu DBMS330284 đã tồn tại, script sẽ xóa toàn bộ database và dữ liệu cũ rồi dựng lại.
-- Script dùng extended property để dừng an toàn nếu một batch thất bại.
USE [master];
SET NOCOUNT ON;
DECLARE @DatabaseName sysname = N'DBMS330284';
IF DB_ID(@DatabaseName) IS NOT NULL
BEGIN
    EXEC (N'ALTER DATABASE [DBMS330284] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;');
    EXEC (N'DROP DATABASE [DBMS330284];');
END;
EXEC (N'CREATE DATABASE [DBMS330284];');
EXEC sys.sp_executesql N'
    USE [DBMS330284];
    IF EXISTS (SELECT 1 FROM sys.extended_properties WHERE class = 0 AND name = N''DBMS330284_BuildState'')
        THROW 52101, N''Dung lai: phat hien dau vet mot lan build truoc; can kiem tra DB truoc khi chay lai.'', 1;
    EXEC sys.sp_addextendedproperty @name=N''DBMS330284_BuildState'', @value=0;
';
GO
USE [DBMS330284];
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 0 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'-- ENCODING: UTF-8 WITH BOM
USE [DBMS330284];';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=1;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 1 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE TABLE KHOA
(
    MaKhoa VARCHAR(10) NOT NULL,
    TenKhoa NVARCHAR(100) NOT NULL,
    Email VARCHAR(100) NULL,
    SoDienThoai VARCHAR(15) NULL,
    TrangThai BIT NOT NULL CONSTRAINT DF_KHOA_TrangThai DEFAULT 1
);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=2;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 2 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE TABLE NGANH
(
    MaNganh VARCHAR(10) NOT NULL,
    MaKhoa VARCHAR(10) NOT NULL,
    TenNganh NVARCHAR(100) NOT NULL,
    MoTa NVARCHAR(500) NULL,
    TrangThai BIT NOT NULL CONSTRAINT DF_NGANH_TrangThai DEFAULT 1
);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=3;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 3 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE TABLE CHUONGTRINHDAOTAO
(
    MaCTDT VARCHAR(24) NOT NULL,
    MaNganh VARCHAR(10) NOT NULL,
    TenCTDT NVARCHAR(150) NOT NULL,
    KhoaHoc VARCHAR(20) NOT NULL,
    NamTuyenSinh SMALLINT NOT NULL,
    TongTinChiYeuCau INT NOT NULL,
    ThoiGianDaoTao INT NOT NULL,
    TrangThai BIT NOT NULL CONSTRAINT DF_CHUONGTRINHDAOTAO_TrangThai DEFAULT 1
);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=4;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 4 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE TABLE MONHOC
(
    MaMonHoc VARCHAR(15) NOT NULL,
    MaKhoa VARCHAR(10) NOT NULL,
    TenMonHoc NVARCHAR(150) NOT NULL,
    SoTinChi TINYINT NOT NULL,
    SoTietLyThuyet SMALLINT NOT NULL,
    SoTietThucHanh SMALLINT NOT NULL,
    MoTa NVARCHAR(500) NULL,
    TrangThai BIT NOT NULL CONSTRAINT DF_MONHOC_TrangThai DEFAULT 1
);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=5;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 5 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE TABLE CTDT_MONHOC
(
    MaCTDT VARCHAR(24) NOT NULL,
    MaMonHoc VARCHAR(15) NOT NULL,
    HocKyDuKien TINYINT NOT NULL,
    LoaiMon VARCHAR(20) NOT NULL,
    ThuTu SMALLINT NULL
);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=6;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 6 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE TABLE MONHOCTIENQUYET
(
    MaMonHoc VARCHAR(15) NOT NULL,
    MaMonTienQuyet VARCHAR(15) NOT NULL,
    MucDo VARCHAR(20) NOT NULL CONSTRAINT DF_MONHOCTIENQUYET_MucDo DEFAULT ''BAT_BUOC''
);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=7;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 7 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE TABLE LOP
(
    MaLop VARCHAR(20) NOT NULL,
    TenLop NVARCHAR(100) NOT NULL,
    MaKhoa VARCHAR(10) NOT NULL,
    KhoaHoc VARCHAR(20) NOT NULL,
    NamNhapHoc INT NOT NULL,
    TrangThai BIT NOT NULL CONSTRAINT DF_LOP_TrangThai DEFAULT 1
);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=8;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 8 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE TABLE SINHVIEN
(
    MaSV INT IDENTITY(1,1) NOT NULL,
    MaSinhVien VARCHAR(20) NOT NULL,
    HoTen NVARCHAR(100) NOT NULL,
    NgaySinh DATE NULL,
    Email VARCHAR(254) NULL,
    SoDienThoai VARCHAR(20) NULL,
    MaKhoa VARCHAR(10) NOT NULL,
    MaLop VARCHAR(20) NULL,
    MaCTDT VARCHAR(24) NOT NULL,
    TrangThai VARCHAR(20) NOT NULL CONSTRAINT DF_SINHVIEN_TrangThai DEFAULT ''DANG_HOC'',
    NgayTao DATETIME2(0) NOT NULL CONSTRAINT DF_SINHVIEN_NgayTao DEFAULT SYSUTCDATETIME()
);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=9;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 9 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE TABLE GIANGVIEN
(
    MaGV INT IDENTITY(1,1) NOT NULL,
    MaGiangVien VARCHAR(20) NOT NULL,
    HoTen NVARCHAR(100) NOT NULL,
    Email VARCHAR(254) NULL,
    SoDienThoai VARCHAR(20) NULL,
    MaKhoa VARCHAR(10) NOT NULL,
    TrangThai VARCHAR(20) NOT NULL CONSTRAINT DF_GIANGVIEN_TrangThai DEFAULT ''DANG_CONG_TAC'',
    NgayTao DATETIME2(0) NOT NULL CONSTRAINT DF_GIANGVIEN_NgayTao DEFAULT SYSUTCDATETIME()
);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=10;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 10 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE TABLE TAIKHOAN
(
    MaTaiKhoan INT IDENTITY(1,1) NOT NULL,
    Username VARCHAR(50) NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    VaiTro VARCHAR(30) NOT NULL,
    TrangThai VARCHAR(20) NOT NULL CONSTRAINT DF_TAIKHOAN_TrangThai DEFAULT ''ACTIVE'',
    MaSV INT NULL,
    MaGV INT NULL,
    NgayTao DATETIME2(0) NOT NULL CONSTRAINT DF_TAIKHOAN_NgayTao DEFAULT SYSUTCDATETIME(),
    LanDangNhapCuoi DATETIME2(0) NULL
);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=11;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 11 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE TABLE HOCKY
(
    MaHocKy INT IDENTITY(1,1) NOT NULL,
    NamHoc VARCHAR(9) NOT NULL,
    TenHocKy NVARCHAR(30) NOT NULL,
    NgayBatDau DATE NOT NULL,
    NgayKetThuc DATE NOT NULL,
    NgayMoDangKy DATETIME2 NOT NULL,
    NgayDongDangKy DATETIME2 NOT NULL,
    TrangThai VARCHAR(20) NOT NULL CONSTRAINT DF_HOCKY_TrangThai DEFAULT ''CHUA_MO''
);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=12;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 12 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE TABLE LOPHOCPHAN
(
    MaLHP VARCHAR(20) NOT NULL,
    MaMonHoc VARCHAR(15) NOT NULL,
    MaHocKy INT NOT NULL,
    MaGiangVien INT NULL,
    TenLHP NVARCHAR(100) NOT NULL,
    SoLuongToiDa INT NOT NULL CONSTRAINT DF_LOPHOCPHAN_SoLuongToiDa DEFAULT 50,
    TrangThai VARCHAR(20) NOT NULL CONSTRAINT DF_LOPHOCPHAN_TrangThai DEFAULT ''DA_KHOA''
);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=13;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 13 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE TABLE LICHHOC
(
    MaLichHoc INT IDENTITY(1,1) NOT NULL,
    MaLHP VARCHAR(20) NOT NULL,
    Thu TINYINT NOT NULL,
    TietBatDau TINYINT NOT NULL,
    SoTiet TINYINT NOT NULL,
    PhongHoc VARCHAR(20) NOT NULL
);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=14;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 14 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE TABLE DANGKYTINCHI
(
    MaDangKy BIGINT IDENTITY(1,1) NOT NULL,
    MaSV INT NOT NULL,
    MaLHP VARCHAR(20) NOT NULL,
    NgayDangKy DATETIME2 NOT NULL CONSTRAINT DF_DANGKYTINCHI_NgayDangKy DEFAULT SYSUTCDATETIME(),
    TrangThai VARCHAR(20) NOT NULL CONSTRAINT DF_DANGKYTINCHI_TrangThai DEFAULT ''REGISTERED''
);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=15;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 15 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE TABLE DIEMSO
(
    MaDangKy BIGINT NOT NULL,
    DiemQuaTrinh DECIMAL(4,2) NULL,
    DiemGiuaKy DECIMAL(4,2) NULL,
    DiemCuoiKy DECIMAL(4,2) NULL,
    TyTrongQT TINYINT NOT NULL CONSTRAINT DF_DIEMSO_TyTrongQT DEFAULT 20,
    TyTrongGK TINYINT NOT NULL CONSTRAINT DF_DIEMSO_TyTrongGK DEFAULT 30,
    TyTrongCK TINYINT NOT NULL CONSTRAINT DF_DIEMSO_TyTrongCK DEFAULT 50
);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=16;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 16 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE TABLE MUCHOCPHI
(
    MaMucHocPhi INT IDENTITY(1,1) NOT NULL,
    MaHocKy INT NOT NULL,
    PhamViApDung VARCHAR(50) NOT NULL,
    DonGiaTinChi DECIMAL(12,2) NOT NULL,
    NgayHieuLuc DATE NOT NULL,
    NgayHetHieuLuc DATE NULL,
    TrangThai VARCHAR(20) NOT NULL CONSTRAINT DF_MUCHOCPHI_TrangThai DEFAULT ''ACTIVE''
);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=17;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 17 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE TABLE HOCPHI
(
    MaHocPhi INT IDENTITY(1,1) NOT NULL,
    MaSV INT NOT NULL,
    MaHocKy INT NOT NULL,
    MaMucHocPhi INT NOT NULL,
    SoTinChi INT NOT NULL,
    DonGiaTinChi DECIMAL(12,2) NOT NULL,
    TongTien DECIMAL(14,2) NOT NULL,
    SoTienDaThanhToan DECIMAL(14,2) NOT NULL CONSTRAINT DF_HOCPHI_SoTienDaThanhToan DEFAULT 0,
    TrangThai VARCHAR(20) NOT NULL CONSTRAINT DF_HOCPHI_TrangThai DEFAULT ''UNPAID'',
    NgayCapNhat DATETIME2 NOT NULL CONSTRAINT DF_HOCPHI_NgayCapNhat DEFAULT SYSUTCDATETIME()
);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=18;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 18 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE TABLE CHITIETTHANHTOAN
(
    MaThanhToan BIGINT IDENTITY(1,1) NOT NULL,
    MaHocPhi INT NOT NULL,
    SoTien DECIMAL(14,2) NOT NULL,
    NgayThanhToan DATETIME2 NOT NULL CONSTRAINT DF_CHITIETTHANHTOAN_NgayThanhToan DEFAULT SYSUTCDATETIME(),
    PhuongThuc VARCHAR(20) NOT NULL,
    TrangThai VARCHAR(20) NOT NULL CONSTRAINT DF_CHITIETTHANHTOAN_TrangThai DEFAULT ''CHO_XAC_NHAN'',
    MaTaiKhoanXacNhan INT NULL,
    NgayXacNhan DATETIME2 NULL
);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=19;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 19 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE TABLE LOGHOATDONG
(
    MaLog BIGINT IDENTITY(1,1) NOT NULL,
    MaTaiKhoan INT NULL,
    ThoiGian DATETIME2 NOT NULL CONSTRAINT DF_LOGHOATDONG_ThoiGian DEFAULT SYSUTCDATETIME(),
    HanhDong VARCHAR(20) NOT NULL,
    TenBang VARCHAR(128) NOT NULL,
    KhoaBanGhi NVARCHAR(200) NULL,
    NoiDungCu NVARCHAR(MAX) NULL,
    NoiDungMoi NVARCHAR(MAX) NULL
);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=20;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 20 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'-- ENCODING: UTF-8 WITH BOM
USE [DBMS330284];';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=21;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 21 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'SET QUOTED_IDENTIFIER ON;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=22;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 22 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE KHOA
ADD CONSTRAINT PK_KHOA PRIMARY KEY (MaKhoa);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=23;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 23 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE KHOA
ADD CONSTRAINT UQ_KHOA_TenKhoa UNIQUE (TenKhoa);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=24;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 24 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE NGANH
ADD CONSTRAINT PK_NGANH PRIMARY KEY (MaNganh);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=25;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 25 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE NGANH
ADD CONSTRAINT FK_NGANH_KHOA
FOREIGN KEY (MaKhoa) REFERENCES KHOA(MaKhoa);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=26;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 26 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE NGANH
ADD CONSTRAINT UQ_NGANH_TenNganh UNIQUE (TenNganh);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=27;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 27 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE CHUONGTRINHDAOTAO
ADD CONSTRAINT PK_CHUONGTRINHDAOTAO PRIMARY KEY (MaCTDT);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=28;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 28 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE CHUONGTRINHDAOTAO
ADD CONSTRAINT FK_CHUONGTRINHDAOTAO_NGANH
FOREIGN KEY (MaNganh) REFERENCES NGANH(MaNganh);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=29;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 29 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE MONHOC
ADD CONSTRAINT PK_MONHOC PRIMARY KEY (MaMonHoc);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=30;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 30 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE MONHOC
ADD CONSTRAINT FK_MONHOC_KHOA
FOREIGN KEY (MaKhoa) REFERENCES KHOA(MaKhoa);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=31;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 31 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE CTDT_MONHOC
ADD CONSTRAINT PK_CTDT_MONHOC
PRIMARY KEY (MaCTDT, MaMonHoc);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=32;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 32 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE CTDT_MONHOC
ADD CONSTRAINT FK_CTDT_MONHOC_CTDT
FOREIGN KEY (MaCTDT) REFERENCES CHUONGTRINHDAOTAO(MaCTDT);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=33;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 33 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE CTDT_MONHOC
ADD CONSTRAINT FK_CTDT_MONHOC_MONHOC
FOREIGN KEY (MaMonHoc) REFERENCES MONHOC(MaMonHoc);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=34;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 34 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE MONHOCTIENQUYET
ADD CONSTRAINT PK_MONHOCTIENQUYET
PRIMARY KEY (MaMonHoc, MaMonTienQuyet);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=35;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 35 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE MONHOCTIENQUYET
ADD CONSTRAINT FK_MONHOCTIENQUYET_MONHOC
FOREIGN KEY (MaMonHoc) REFERENCES MONHOC(MaMonHoc);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=36;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 36 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE MONHOCTIENQUYET
ADD CONSTRAINT FK_MONHOCTIENQUYET_MONHOCTIENQUYET
FOREIGN KEY (MaMonTienQuyet) REFERENCES MONHOC(MaMonHoc);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=37;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 37 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE LOP
ADD CONSTRAINT PK_LOP PRIMARY KEY (MaLop);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=38;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 38 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE LOP
ADD CONSTRAINT FK_LOP_KHOA
FOREIGN KEY (MaKhoa) REFERENCES KHOA(MaKhoa);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=39;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 39 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE SINHVIEN
ADD CONSTRAINT PK_SINHVIEN PRIMARY KEY (MaSV);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=40;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 40 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE SINHVIEN
ADD CONSTRAINT UQ_SINHVIEN_MaSinhVien UNIQUE (MaSinhVien);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=41;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 41 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE SINHVIEN
ADD CONSTRAINT FK_SINHVIEN_KHOA
FOREIGN KEY (MaKhoa) REFERENCES KHOA(MaKhoa);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=42;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 42 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE SINHVIEN
ADD CONSTRAINT FK_SINHVIEN_LOP
FOREIGN KEY (MaLop) REFERENCES LOP(MaLop);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=43;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 43 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE SINHVIEN
ADD CONSTRAINT FK_SINHVIEN_CTDT
FOREIGN KEY (MaCTDT) REFERENCES CHUONGTRINHDAOTAO(MaCTDT);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=44;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 44 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE GIANGVIEN
ADD CONSTRAINT PK_GIANGVIEN PRIMARY KEY (MaGV);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=45;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 45 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE GIANGVIEN
ADD CONSTRAINT UQ_GIANGVIEN_MaGiangVien UNIQUE (MaGiangVien);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=46;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 46 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE GIANGVIEN
ADD CONSTRAINT FK_GIANGVIEN_KHOA
FOREIGN KEY (MaKhoa) REFERENCES KHOA(MaKhoa);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=47;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 47 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE TAIKHOAN
ADD CONSTRAINT PK_TAIKHOAN PRIMARY KEY (MaTaiKhoan);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=48;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 48 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE TAIKHOAN
ADD CONSTRAINT UQ_TAIKHOAN_Username UNIQUE (Username);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=49;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 49 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE TAIKHOAN
ADD CONSTRAINT FK_TAIKHOAN_SINHVIEN
FOREIGN KEY (MaSV) REFERENCES SINHVIEN(MaSV);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=50;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 50 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE TAIKHOAN
ADD CONSTRAINT FK_TAIKHOAN_GIANGVIEN
FOREIGN KEY (MaGV) REFERENCES GIANGVIEN(MaGV);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=51;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 51 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE HOCKY
ADD CONSTRAINT PK_HOCKY PRIMARY KEY (MaHocKy);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=52;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 52 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE HOCKY
ADD CONSTRAINT UQ_HOCKY_NamHoc_TenHocKy
UNIQUE (NamHoc, TenHocKy);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=53;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 53 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE LOPHOCPHAN
ADD CONSTRAINT PK_LOPHOCPHAN PRIMARY KEY (MaLHP);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=54;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 54 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE LOPHOCPHAN
ADD CONSTRAINT FK_LOPHOCPHAN_MONHOC
FOREIGN KEY (MaMonHoc) REFERENCES MONHOC(MaMonHoc);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=55;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 55 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE LOPHOCPHAN
ADD CONSTRAINT FK_LOPHOCPHAN_HOCKY
FOREIGN KEY (MaHocKy) REFERENCES HOCKY(MaHocKy);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=56;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 56 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE LOPHOCPHAN
ADD CONSTRAINT FK_LOPHOCPHAN_GIANGVIEN
FOREIGN KEY (MaGiangVien) REFERENCES GIANGVIEN(MaGV);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=57;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 57 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE LICHHOC
ADD CONSTRAINT PK_LICHHOC PRIMARY KEY (MaLichHoc);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=58;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 58 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE LICHHOC
ADD CONSTRAINT FK_LICHHOC_LOPHOCPHAN
FOREIGN KEY (MaLHP) REFERENCES LOPHOCPHAN(MaLHP);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=59;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 59 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE DANGKYTINCHI
ADD CONSTRAINT PK_DANGKYTINCHI PRIMARY KEY (MaDangKy);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=60;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 60 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE DANGKYTINCHI
ADD CONSTRAINT FK_DANGKYTINCHI_SINHVIEN
FOREIGN KEY (MaSV) REFERENCES SINHVIEN(MaSV);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=61;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 61 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE DANGKYTINCHI
ADD CONSTRAINT FK_DANGKYTINCHI_LOPHOCPHAN
FOREIGN KEY (MaLHP) REFERENCES LOPHOCPHAN(MaLHP);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=62;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 62 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE DIEMSO
ADD CONSTRAINT PK_DIEMSO PRIMARY KEY (MaDangKy);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=63;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 63 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE DIEMSO
ADD CONSTRAINT FK_DIEMSO_DANGKYTINCHI
FOREIGN KEY (MaDangKy) REFERENCES DANGKYTINCHI(MaDangKy);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=64;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 64 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE MUCHOCPHI
ADD CONSTRAINT PK_MUCHOCPHI PRIMARY KEY (MaMucHocPhi);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=65;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 65 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE MUCHOCPHI
ADD CONSTRAINT FK_MUCHOCPHI_HOCKY
FOREIGN KEY (MaHocKy) REFERENCES HOCKY(MaHocKy);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=66;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 66 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE HOCPHI
ADD CONSTRAINT PK_HOCPHI PRIMARY KEY (MaHocPhi);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=67;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 67 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE HOCPHI
ADD CONSTRAINT FK_HOCPHI_SINHVIEN
FOREIGN KEY (MaSV) REFERENCES SINHVIEN(MaSV);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=68;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 68 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE HOCPHI
ADD CONSTRAINT FK_HOCPHI_HOCKY
FOREIGN KEY (MaHocKy) REFERENCES HOCKY(MaHocKy);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=69;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 69 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE MUCHOCPHI
ADD CONSTRAINT UQ_MUCHOCPHI_MaMucHocPhi_MaHocKy UNIQUE (MaMucHocPhi, MaHocKy);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=70;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 70 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE HOCPHI
ADD CONSTRAINT FK_HOCPHI_MUCHOCPHI_HOCKY
FOREIGN KEY (MaMucHocPhi, MaHocKy) REFERENCES MUCHOCPHI(MaMucHocPhi, MaHocKy);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=71;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 71 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE CHITIETTHANHTOAN
ADD CONSTRAINT PK_CHITIETTHANHTOAN PRIMARY KEY (MaThanhToan);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=72;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 72 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE CHITIETTHANHTOAN
ADD CONSTRAINT FK_CHITIETTHANHTOAN_HOCPHI
FOREIGN KEY (MaHocPhi) REFERENCES HOCPHI(MaHocPhi);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=73;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 73 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE CHITIETTHANHTOAN
ADD CONSTRAINT FK_CHITIETTHANHTOAN_TAIKHOAN
FOREIGN KEY (MaTaiKhoanXacNhan) REFERENCES TAIKHOAN(MaTaiKhoan);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=74;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 74 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE LOGHOATDONG
ADD CONSTRAINT PK_LOGHOATDONG PRIMARY KEY (MaLog);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=75;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 75 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE LOGHOATDONG
ADD CONSTRAINT FK_LOGHOATDONG_TAIKHOAN
FOREIGN KEY (MaTaiKhoan) REFERENCES TAIKHOAN(MaTaiKhoan);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=76;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 76 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE CTDT_MONHOC
ADD CONSTRAINT CK_CTDT_MONHOC_HocKyDuKien
CHECK (HocKyDuKien > 0);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=77;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 77 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE CTDT_MONHOC
ADD CONSTRAINT CK_CTDT_MONHOC_LoaiMon
CHECK (LoaiMon IN (''BAT_BUOC'', ''TU_CHON''));';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=78;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 78 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE CTDT_MONHOC
ADD CONSTRAINT CK_CTDT_MONHOC_ThuTu
CHECK (ThuTu IS NULL OR ThuTu > 0);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=79;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 79 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE MONHOCTIENQUYET
ADD CONSTRAINT CK_MONHOCTIENQUYET_MaMonHoc
CHECK (MaMonHoc <> MaMonTienQuyet);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=80;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 80 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE MONHOCTIENQUYET
ADD CONSTRAINT CK_MONHOCTIENQUYET_MucDo
CHECK (MucDo IN (''BAT_BUOC'', ''KHUYEN_NGHI''));';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=81;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 81 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE CHUONGTRINHDAOTAO
ADD CONSTRAINT CK_CHUONGTRINHDAOTAO_NamTuyenSinh
CHECK (NamTuyenSinh BETWEEN 2000 AND 2100);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=82;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 82 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE CHUONGTRINHDAOTAO
ADD CONSTRAINT CK_CHUONGTRINHDAOTAO_TongTinChi
CHECK (TongTinChiYeuCau > 0);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=83;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 83 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE CHUONGTRINHDAOTAO
ADD CONSTRAINT CK_CHUONGTRINHDAOTAO_ThoiGian
CHECK (ThoiGianDaoTao > 0);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=84;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 84 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE MONHOC
ADD CONSTRAINT CK_MONHOC_SoTinChi
CHECK (SoTinChi > 0);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=85;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 85 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE MONHOC
ADD CONSTRAINT CK_MONHOC_SoTietLyThuyet
CHECK (SoTietLyThuyet >= 0);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=86;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 86 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE MONHOC
ADD CONSTRAINT CK_MONHOC_SoTietThucHanh
CHECK (SoTietThucHanh >= 0);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=87;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 87 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE SINHVIEN
ADD CONSTRAINT CK_SINHVIEN_TrangThai
CHECK (TrangThai IN (''DANG_HOC'', ''BAO_LUU'', ''TOT_NGHIEP'', ''THOI_HOC''));';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=88;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 88 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE GIANGVIEN
ADD CONSTRAINT CK_GIANGVIEN_TrangThai
CHECK (TrangThai IN (''DANG_CONG_TAC'', ''TAM_NGHI'', ''NGHI_VIEC''));';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=89;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 89 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE TAIKHOAN
ADD CONSTRAINT CK_TAIKHOAN_VaiTro
CHECK (VaiTro IN (''SINH_VIEN'', ''GIANG_VIEN'', ''DAO_TAO'', ''QUAN_TRI''));';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=90;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 90 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE TAIKHOAN
ADD CONSTRAINT CK_TAIKHOAN_TrangThai
CHECK (TrangThai IN (''ACTIVE'', ''LOCKED'', ''DISABLED''));';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=91;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 91 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE TAIKHOAN
ADD CONSTRAINT CK_TAIKHOAN_NguoiDung
CHECK (NOT (MaSV IS NOT NULL AND MaGV IS NOT NULL));';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=92;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 92 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE dbo.HOCKY
ADD CONSTRAINT CK_HOCKY_NgayHoc
CHECK (NgayBatDau <= NgayKetThuc);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=93;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 93 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE dbo.HOCKY
ADD CONSTRAINT CK_HOCKY_DangKy
CHECK (NgayMoDangKy <= NgayDongDangKy);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=94;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 94 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE HOCKY
ADD CONSTRAINT CK_HOCKY_TrangThai
CHECK (TrangThai IN (''CHUA_MO'', ''DANG_MO'', ''KET_THUC''));';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=95;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 95 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE LOPHOCPHAN
ADD CONSTRAINT CK_LOPHOCPHAN_SoLuongToiDa
CHECK (SoLuongToiDa > 0);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=96;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 96 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE LOPHOCPHAN
ADD CONSTRAINT CK_LOPHOCPHAN_TrangThai
CHECK (TrangThai IN (''MO_DANG_KY'', ''DANG_MO'', ''DA_KHOA'', ''DA_HUY''));';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=97;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 97 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE LICHHOC
ADD CONSTRAINT CK_LICHHOC_Thu
CHECK (Thu BETWEEN 2 AND 8);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=98;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 98 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE LICHHOC
ADD CONSTRAINT CK_LICHHOC_TietBatDau
CHECK (TietBatDau BETWEEN 1 AND 12);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=99;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 99 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE LICHHOC
ADD CONSTRAINT CK_LICHHOC_SoTiet
CHECK (SoTiet BETWEEN 1 AND 6);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=100;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 100 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE LICHHOC
ADD CONSTRAINT CK_LICHHOC_TietKetThuc
CHECK (TietBatDau + SoTiet - 1 <= 12);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=101;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 101 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE DANGKYTINCHI
ADD CONSTRAINT CK_DANGKYTINCHI_TrangThai
CHECK (TrangThai IN (''REGISTERED'', ''CANCELLED''));';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=102;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 102 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE DIEMSO
ADD CONSTRAINT CK_DIEMSO_DiemQuaTrinh
CHECK (DiemQuaTrinh IS NULL OR DiemQuaTrinh BETWEEN 0 AND 10);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=103;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 103 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE DIEMSO
ADD CONSTRAINT CK_DIEMSO_DiemGiuaKy
CHECK (DiemGiuaKy IS NULL OR DiemGiuaKy BETWEEN 0 AND 10);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=104;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 104 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE DIEMSO
ADD CONSTRAINT CK_DIEMSO_DiemCuoiKy
CHECK (DiemCuoiKy IS NULL OR DiemCuoiKy BETWEEN 0 AND 10);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=105;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 105 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE DIEMSO
ADD CONSTRAINT CK_DIEMSO_TyTrong
CHECK (TyTrongQT + TyTrongGK + TyTrongCK = 100);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=106;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 106 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE MUCHOCPHI
ADD CONSTRAINT CK_MUCHOCPHI_PhamViApDung
CHECK (PhamViApDung = ''TOAN_TRUONG'');';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=107;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 107 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE MUCHOCPHI
ADD CONSTRAINT CK_MUCHOCPHI_DonGia
CHECK (DonGiaTinChi > 0);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=108;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 108 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE MUCHOCPHI
ADD CONSTRAINT CK_MUCHOCPHI_NgayHieuLuc
CHECK (NgayHetHieuLuc IS NULL OR NgayHetHieuLuc >= NgayHieuLuc);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=109;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 109 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE MUCHOCPHI
ADD CONSTRAINT CK_MUCHOCPHI_TrangThai
CHECK (TrangThai IN (''ACTIVE'', ''INACTIVE''));';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=110;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 110 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE HOCPHI
ADD CONSTRAINT UQ_HOCPHI_SinhVien_HocKy
UNIQUE (MaSV, MaHocKy);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=111;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 111 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE HOCPHI
ADD CONSTRAINT CK_HOCPHI_SoTinChi
CHECK (SoTinChi > 0);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=112;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 112 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE HOCPHI
ADD CONSTRAINT CK_HOCPHI_DonGia
CHECK (DonGiaTinChi > 0);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=113;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 113 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE HOCPHI
ADD CONSTRAINT CK_HOCPHI_TongTien
CHECK (TongTien >= 0);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=114;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 114 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE HOCPHI
ADD CONSTRAINT CK_HOCPHI_SoTienDaThanhToan
CHECK (
    SoTienDaThanhToan >= 0
    AND SoTienDaThanhToan <= TongTien
);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=115;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 115 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE HOCPHI
ADD CONSTRAINT CK_HOCPHI_TrangThai
CHECK (TrangThai IN (''UNPAID'', ''PARTIAL'', ''PAID''));';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=116;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 116 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE CHITIETTHANHTOAN
ADD CONSTRAINT CK_CHITIETTHANHTOAN_SoTien
CHECK (SoTien > 0);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=117;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 117 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE CHITIETTHANHTOAN
ADD CONSTRAINT CK_CHITIETTHANHTOAN_PhuongThuc
CHECK (PhuongThuc IN (''TIEN_MAT'', ''CHUYEN_KHOAN''));';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=118;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 118 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE CHITIETTHANHTOAN
ADD CONSTRAINT CK_CHITIETTHANHTOAN_TrangThai
CHECK (TrangThai IN (''CHO_XAC_NHAN'', ''DA_XAC_NHAN'', ''TU_CHOI''));';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=119;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 119 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'ALTER TABLE LOGHOATDONG
ADD CONSTRAINT CK_LOGHOATDONG_HanhDong
CHECK (HanhDong IN (''INSERT'', ''UPDATE'', ''DELETE''));';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=120;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 120 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE UNIQUE INDEX UQ_SINHVIEN_Email
ON SINHVIEN(Email)
WHERE Email IS NOT NULL;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=121;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 121 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE UNIQUE INDEX UQ_GIANGVIEN_Email
ON GIANGVIEN(Email)
WHERE Email IS NOT NULL;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=122;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 122 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE UNIQUE INDEX UQ_TAIKHOAN_MaSV
ON TAIKHOAN(MaSV)
WHERE MaSV IS NOT NULL;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=123;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 123 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE UNIQUE INDEX UQ_TAIKHOAN_MaGV
ON TAIKHOAN(MaGV)
WHERE MaGV IS NOT NULL;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=124;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 124 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE UNIQUE INDEX UQ_DANGKYTINCHI_SinhVien_LopHocPhan
ON DANGKYTINCHI(MaSV, MaLHP)
WHERE TrangThai = ''REGISTERED'';';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=125;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 125 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'-- ENCODING: UTF-8 WITH BOM
USE [DBMS330284];';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=126;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 126 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER TRIGGER [dbo].[TR_MONHOCTIENQUYET_KiemTraChuTrinh]
ON [dbo].[MONHOCTIENQUYET]
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @HasCycle BIT = 0;

    ;WITH DependencyPath AS
    (
        SELECT
            i.MaMonHoc AS RootMonHoc,
            i.MaMonTienQuyet AS CurrentPrerequisite
        FROM inserted i

        UNION ALL

        SELECT
            dp.RootMonHoc,
            mt.MaMonTienQuyet
        FROM DependencyPath dp
        INNER JOIN dbo.MONHOCTIENQUYET mt
            ON mt.MaMonHoc = dp.CurrentPrerequisite
    )
    SELECT TOP 1 @HasCycle = 1
    FROM DependencyPath
    WHERE CurrentPrerequisite = RootMonHoc
    OPTION (MAXRECURSION 32767);

    IF @HasCycle = 1
    BEGIN
        THROW 51001, N''Không thể tạo môn tiên quyết bị vòng lặp.'', 1;
    END
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=127;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 127 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER TRIGGER [dbo].[TR_DANGKYTINCHI_KiemTraSiSo]
ON [dbo].[DANGKYTINCHI]
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS
    (
        SELECT 1
        FROM
        (
            SELECT
                MaLHP,
                COUNT_BIG(*) AS SoLuongDangKy
            FROM dbo.DANGKYTINCHI WITH (UPDLOCK, HOLDLOCK)
            WHERE TrangThai = ''REGISTERED''
            GROUP BY MaLHP
        ) x
        INNER JOIN dbo.LOPHOCPHAN lhp
            ON lhp.MaLHP = x.MaLHP
        WHERE x.SoLuongDangKy > lhp.SoLuongToiDa
    )
    BEGIN
        THROW 51002, N''Số lượng sinh viên đăng ký đã vượt quá sĩ số tối đa của lớp học phần.'', 1;
    END
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=128;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 128 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER TRIGGER [dbo].[TR_LICHHOC_KiemTraTrungLich]
ON [dbo].[LICHHOC]
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS
    (
        SELECT 1
        FROM inserted i
        INNER JOIN dbo.LOPHOCPHAN l1
            ON l1.MaLHP = i.MaLHP
        INNER JOIN dbo.LICHHOC l2
            ON l2.Thu = i.Thu
          AND (l2.MaLHP <> i.MaLHP OR l2.MaLichHoc <> i.MaLichHoc)
        INNER JOIN dbo.LOPHOCPHAN l2_lhp
            ON l2_lhp.MaLHP = l2.MaLHP
        WHERE l1.MaHocKy = l2_lhp.MaHocKy
          AND i.TietBatDau <= l2.TietBatDau + l2.SoTiet - 1
          AND l2.TietBatDau <= i.TietBatDau + i.SoTiet - 1
          AND
          (
              (
                  l1.MaGiangVien IS NOT NULL
                  AND l1.MaGiangVien = l2_lhp.MaGiangVien
              )
              OR
              (
                  i.PhongHoc IS NOT NULL
                  AND l2.PhongHoc IS NOT NULL
                  AND i.PhongHoc = l2.PhongHoc
              )
          )
    )
    BEGIN
        THROW 51310,
              N''Lịch học bị trùng giảng viên hoặc phòng học trong cùng thời gian.'',
              1;
    END
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=129;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 129 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER TRIGGER [dbo].[TR_MUCHOCPHI_KiemTraHieuLuc]
ON [dbo].[MUCHOCPHI]
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.MUCHOCPHI a
        INNER JOIN dbo.MUCHOCPHI b
            ON a.MaHocKy = b.MaHocKy
            AND a.PhamViApDung = b.PhamViApDung
            AND a.MaMucHocPhi < b.MaMucHocPhi
            AND a.TrangThai = ''ACTIVE''
            AND b.TrangThai = ''ACTIVE''
            AND a.NgayHieuLuc <= ISNULL(b.NgayHetHieuLuc, ''9999-12-31'')
            AND b.NgayHieuLuc <= ISNULL(a.NgayHetHieuLuc, ''9999-12-31'')
        INNER JOIN
        (
            SELECT MaMucHocPhi FROM inserted
        ) i
            ON i.MaMucHocPhi = a.MaMucHocPhi
            OR i.MaMucHocPhi = b.MaMucHocPhi
    )
    BEGIN
        THROW 51004, N''Mức học phí đang ACTIVE bị trùng khoảng thời gian hiệu lực trong cùng học kỳ.'', 1;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM inserted
        WHERE PhamViApDung <> ''TOAN_TRUONG''
    )
    BEGIN
        THROW 51005, N''Phiên bản hiện tại chỉ hỗ trợ phạm vi áp dụng TOAN_TRUONG.'', 1;
    END
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=130;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 130 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER TRIGGER [dbo].[TR_CHITIETTHANHTOAN_CapNhatHocPhi]
ON [dbo].[CHITIETTHANHTOAN]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ChangedHocPhi TABLE (MaHocPhi INT PRIMARY KEY);

    INSERT INTO @ChangedHocPhi (MaHocPhi)
    SELECT DISTINCT MaHocPhi FROM inserted
    UNION
    SELECT DISTINCT MaHocPhi FROM deleted;

    DECLARE @PaymentSummary TABLE (
        MaHocPhi INT PRIMARY KEY,
        SoTienDaThanhToan DECIMAL(14,2)
    );

    -- Chỉ tính tổng tiền các giao dịch DA_XAC_NHAN
    INSERT INTO @PaymentSummary (MaHocPhi, SoTienDaThanhToan)
    SELECT
        hp.MaHocPhi,
        ISNULL(SUM(CASE WHEN ct.TrangThai = ''DA_XAC_NHAN'' THEN ct.SoTien ELSE 0 END), 0) AS SoTienDaThanhToan
    FROM @ChangedHocPhi ch
    INNER JOIN dbo.HOCPHI hp
        ON hp.MaHocPhi = ch.MaHocPhi
    LEFT JOIN dbo.CHITIETTHANHTOAN ct
        ON ct.MaHocPhi = hp.MaHocPhi
    GROUP BY hp.MaHocPhi;

    UPDATE hp
    SET
        hp.SoTienDaThanhToan = ps.SoTienDaThanhToan,
        hp.TrangThai =
            CASE
                WHEN ps.SoTienDaThanhToan = 0 THEN ''UNPAID''
                WHEN ps.SoTienDaThanhToan < hp.TongTien THEN ''PARTIAL''
                ELSE ''PAID''
            END,
        hp.NgayCapNhat = SYSUTCDATETIME()
    FROM dbo.HOCPHI hp
    INNER JOIN @PaymentSummary ps
        ON ps.MaHocPhi = hp.MaHocPhi;

    IF EXISTS
    (
        SELECT 1
        FROM @PaymentSummary ps
        INNER JOIN dbo.HOCPHI hp
            ON hp.MaHocPhi = ps.MaHocPhi
        WHERE ps.SoTienDaThanhToan > hp.TongTien
    )
    BEGIN
        THROW 51006, N''Tổng số tiền thanh toán không được vượt quá tổng học phí.'', 1;
    END
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=131;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 131 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER TRIGGER [dbo].[TR_TAIKHOAN_Audit]
ON [dbo].[TAIKHOAN]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaTaiKhoan INT =
        TRY_CONVERT(INT, SESSION_CONTEXT(N''MaTaiKhoan''));

    INSERT INTO dbo.LOGHOATDONG
    (
        MaTaiKhoan,
        ThoiGian,
        HanhDong,
        TenBang,
        KhoaBanGhi,
        NoiDungCu,
        NoiDungMoi
    )
    SELECT
        @MaTaiKhoan,
        SYSUTCDATETIME(),
        CASE
            WHEN EXISTS (SELECT 1 FROM inserted)
             AND EXISTS (SELECT 1 FROM deleted) THEN ''UPDATE''
            WHEN EXISTS (SELECT 1 FROM inserted) THEN ''INSERT''
            ELSE ''DELETE''
        END,
        ''TAIKHOAN'',
        COALESCE(
            CONVERT(NVARCHAR(200), i.MaTaiKhoan),
            CONVERT(NVARCHAR(200), d.MaTaiKhoan)
        ),
        CASE
            WHEN EXISTS (SELECT 1 FROM deleted)
            THEN
            (
                SELECT
                    d.Username,
                    d.VaiTro,
                    d.TrangThai,
                    d.MaSV,
                    d.MaGV,
                    d.NgayTao,
                    d.LanDangNhapCuoi
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            )
        END,
        CASE
            WHEN EXISTS (SELECT 1 FROM inserted)
            THEN
            (
                SELECT
                    i.Username,
                    i.VaiTro,
                    i.TrangThai,
                    i.MaSV,
                    i.MaGV,
                    i.NgayTao,
                    i.LanDangNhapCuoi
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            )
        END
    FROM inserted i
    FULL OUTER JOIN deleted d
        ON i.MaTaiKhoan = d.MaTaiKhoan;
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=132;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 132 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER TRIGGER [dbo].[TR_DANGKYTINCHI_Audit]
ON [dbo].[DANGKYTINCHI]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaTaiKhoan INT =
        TRY_CONVERT(INT, SESSION_CONTEXT(N''MaTaiKhoan''));

    INSERT INTO dbo.LOGHOATDONG
    (
        MaTaiKhoan,
        ThoiGian,
        HanhDong,
        TenBang,
        KhoaBanGhi,
        NoiDungCu,
        NoiDungMoi
    )
    SELECT
        @MaTaiKhoan,
        SYSUTCDATETIME(),
        CASE
            WHEN i.MaDangKy IS NOT NULL AND d.MaDangKy IS NOT NULL THEN ''UPDATE''
            WHEN i.MaDangKy IS NOT NULL THEN ''INSERT''
            ELSE ''DELETE''
        END,
        ''DANGKYTINCHI'',
        CONVERT(NVARCHAR(200), COALESCE(i.MaDangKy, d.MaDangKy)),
        CASE
            WHEN d.MaDangKy IS NOT NULL THEN
            (
                SELECT
                    d.MaSV,
                    d.MaLHP,
                    d.NgayDangKy,
                    d.TrangThai
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            )
        END,
        CASE
            WHEN i.MaDangKy IS NOT NULL THEN
            (
                SELECT
                    i.MaSV,
                    i.MaLHP,
                    i.NgayDangKy,
                    i.TrangThai
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            )
        END
    FROM inserted i
    FULL OUTER JOIN deleted d
        ON i.MaDangKy = d.MaDangKy;
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=133;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 133 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER TRIGGER [dbo].[TR_DIEMSO_Audit]
ON [dbo].[DIEMSO]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaTaiKhoan INT =
        TRY_CONVERT(INT, SESSION_CONTEXT(N''MaTaiKhoan''));

    INSERT INTO dbo.LOGHOATDONG
    (
        MaTaiKhoan,
        ThoiGian,
        HanhDong,
        TenBang,
        KhoaBanGhi,
        NoiDungCu,
        NoiDungMoi
    )
    SELECT
        @MaTaiKhoan,
        SYSUTCDATETIME(),
        CASE
            WHEN i.MaDangKy IS NOT NULL AND d.MaDangKy IS NOT NULL THEN ''UPDATE''
            WHEN i.MaDangKy IS NOT NULL THEN ''INSERT''
            ELSE ''DELETE''
        END,
        ''DIEMSO'',
        CONVERT(NVARCHAR(200), COALESCE(i.MaDangKy, d.MaDangKy)),
        CASE
            WHEN d.MaDangKy IS NOT NULL THEN
            (
                SELECT
                    d.DiemQuaTrinh,
                    d.DiemGiuaKy,
                    d.DiemCuoiKy,
                    d.TyTrongQT,
                    d.TyTrongGK,
                    d.TyTrongCK
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            )
        END,
        CASE
            WHEN i.MaDangKy IS NOT NULL THEN
            (
                SELECT
                    i.DiemQuaTrinh,
                    i.DiemGiuaKy,
                    i.DiemCuoiKy,
                    i.TyTrongQT,
                    i.TyTrongGK,
                    i.TyTrongCK
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            )
        END
    FROM inserted i
    FULL OUTER JOIN deleted d
        ON i.MaDangKy = d.MaDangKy;
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=134;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 134 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER TRIGGER [dbo].[TR_MUCHOCPHI_Audit]
ON [dbo].[MUCHOCPHI]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaTaiKhoan INT =
        TRY_CONVERT(INT, SESSION_CONTEXT(N''MaTaiKhoan''));

    INSERT INTO dbo.LOGHOATDONG
    (
        MaTaiKhoan,
        ThoiGian,
        HanhDong,
        TenBang,
        KhoaBanGhi,
        NoiDungCu,
        NoiDungMoi
    )
    SELECT
        @MaTaiKhoan,
        SYSUTCDATETIME(),
        CASE
            WHEN i.MaMucHocPhi IS NOT NULL AND d.MaMucHocPhi IS NOT NULL THEN ''UPDATE''
            WHEN i.MaMucHocPhi IS NOT NULL THEN ''INSERT''
            ELSE ''DELETE''
        END,
        ''MUCHOCPHI'',
        CONVERT(NVARCHAR(200), COALESCE(i.MaMucHocPhi, d.MaMucHocPhi)),
        CASE
            WHEN d.MaMucHocPhi IS NOT NULL THEN
            (
                SELECT
                    d.MaHocKy,
                    d.PhamViApDung,
                    d.DonGiaTinChi,
                    d.NgayHieuLuc,
                    d.NgayHetHieuLuc,
                    d.TrangThai
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            )
        END,
        CASE
            WHEN i.MaMucHocPhi IS NOT NULL THEN
            (
                SELECT
                    i.MaHocKy,
                    i.PhamViApDung,
                    i.DonGiaTinChi,
                    i.NgayHieuLuc,
                    i.NgayHetHieuLuc,
                    i.TrangThai
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            )
        END
    FROM inserted i
    FULL OUTER JOIN deleted d
        ON i.MaMucHocPhi = d.MaMucHocPhi;
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=135;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 135 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER TRIGGER [dbo].[TR_HOCPHI_Audit]
ON [dbo].[HOCPHI]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaTaiKhoan INT =
        TRY_CONVERT(INT, SESSION_CONTEXT(N''MaTaiKhoan''));

    INSERT INTO dbo.LOGHOATDONG
    (
        MaTaiKhoan,
        ThoiGian,
        HanhDong,
        TenBang,
        KhoaBanGhi,
        NoiDungCu,
        NoiDungMoi
    )
    SELECT
        @MaTaiKhoan,
        SYSUTCDATETIME(),
        CASE
            WHEN i.MaHocPhi IS NOT NULL AND d.MaHocPhi IS NOT NULL THEN ''UPDATE''
            WHEN i.MaHocPhi IS NOT NULL THEN ''INSERT''
            ELSE ''DELETE''
        END,
        ''HOCPHI'',
        CONVERT(NVARCHAR(200), COALESCE(i.MaHocPhi, d.MaHocPhi)),
        CASE
            WHEN d.MaHocPhi IS NOT NULL THEN
            (
                SELECT
                    d.MaSV,
                    d.MaHocKy,
                    d.MaMucHocPhi,
                    d.SoTinChi,
                    d.DonGiaTinChi,
                    d.TongTien,
                    d.SoTienDaThanhToan,
                    d.TrangThai,
                    d.NgayCapNhat
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            )
        END,
        CASE
            WHEN i.MaHocPhi IS NOT NULL THEN
            (
                SELECT
                    i.MaSV,
                    i.MaHocKy,
                    i.MaMucHocPhi,
                    i.SoTinChi,
                    i.DonGiaTinChi,
                    i.TongTien,
                    i.SoTienDaThanhToan,
                    i.TrangThai,
                    i.NgayCapNhat
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            )
        END
    FROM inserted i
    FULL OUTER JOIN deleted d
        ON i.MaHocPhi = d.MaHocPhi;
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=136;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 136 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER TRIGGER [dbo].[TR_CHITIETTHANHTOAN_Audit]
ON [dbo].[CHITIETTHANHTOAN]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaTaiKhoan INT =
        TRY_CONVERT(INT, SESSION_CONTEXT(N''MaTaiKhoan''));

    INSERT INTO dbo.LOGHOATDONG
    (
        MaTaiKhoan,
        ThoiGian,
        HanhDong,
        TenBang,
        KhoaBanGhi,
        NoiDungCu,
        NoiDungMoi
    )
    SELECT
        @MaTaiKhoan,
        SYSUTCDATETIME(),
        CASE
            WHEN i.MaThanhToan IS NOT NULL AND d.MaThanhToan IS NOT NULL THEN ''UPDATE''
            WHEN i.MaThanhToan IS NOT NULL THEN ''INSERT''
            ELSE ''DELETE''
        END,
        ''CHITIETTHANHTOAN'',
        CONVERT(NVARCHAR(200), COALESCE(i.MaThanhToan, d.MaThanhToan)),
        CASE
            WHEN d.MaThanhToan IS NOT NULL THEN
            (
                SELECT
                    d.MaHocPhi,
                    d.SoTien,
                    d.NgayThanhToan,
                    d.PhuongThuc
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            )
        END,
        CASE
            WHEN i.MaThanhToan IS NOT NULL THEN
            (
                SELECT
                    i.MaHocPhi,
                    i.SoTien,
                    i.NgayThanhToan,
                    i.PhuongThuc
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            )
        END
    FROM inserted i
    FULL OUTER JOIN deleted d
        ON i.MaThanhToan = d.MaThanhToan;
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=137;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 137 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'-- 12. Trigger Audit ghi nhật ký hoạt động trên bảng LOP
CREATE OR ALTER TRIGGER [dbo].[TR_LOP_Audit]
ON [dbo].[LOP]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaTaiKhoan INT =
        TRY_CONVERT(INT, SESSION_CONTEXT(N''MaTaiKhoan''));

    INSERT INTO dbo.LOGHOATDONG
    (
        MaTaiKhoan,
        ThoiGian,
        HanhDong,
        TenBang,
        KhoaBanGhi,
        NoiDungCu,
        NoiDungMoi
    )
    SELECT
        @MaTaiKhoan,
        SYSUTCDATETIME(),
        CASE
            WHEN i.MaLop IS NOT NULL AND d.MaLop IS NOT NULL THEN ''UPDATE''
            WHEN i.MaLop IS NOT NULL THEN ''INSERT''
            ELSE ''DELETE''
        END,
        ''LOP'',
        CONVERT(NVARCHAR(200), COALESCE(i.MaLop, d.MaLop)),
        CASE
            WHEN d.MaLop IS NOT NULL THEN
            (
                SELECT
                    d.MaLop,
                    d.TenLop,
                    d.MaKhoa,
                    d.KhoaHoc,
                    d.NamNhapHoc,
                    d.TrangThai
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            )
        END,
        CASE
            WHEN i.MaLop IS NOT NULL THEN
            (
                SELECT
                    i.MaLop,
                    i.TenLop,
                    i.MaKhoa,
                    i.KhoaHoc,
                    i.NamNhapHoc,
                    i.TrangThai
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            )
        END
    FROM inserted i
    FULL OUTER JOIN deleted d
        ON i.MaLop = d.MaLop;
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=138;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 138 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'-- 13. Trigger ngăn chặn xóa Lớp sinh hoạt đang có Sinh viên trực thuộc
CREATE OR ALTER TRIGGER [dbo].[TR_LOP_KiemTraXoa]
ON [dbo].[LOP]
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM deleted d
        INNER JOIN dbo.SINHVIEN sv ON d.MaLop = sv.MaLop
    )
    BEGIN
        THROW 51007, N''Không thể xóa lớp sinh hoạt đang có sinh viên trực thuộc.'', 1;
    END

    DELETE l
    FROM dbo.LOP l
    INNER JOIN deleted d ON l.MaLop = d.MaLop;
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=139;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 139 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER TRIGGER dbo.TR_LOPHOCPHAN_KiemTraSucChua
ON dbo.LOPHOCPHAN
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(SoLuongToiDa) AND EXISTS
    (
        SELECT 1
        FROM inserted i
        CROSS APPLY
        (
            SELECT COUNT_BIG(*) AS SiSo
            FROM dbo.DANGKYTINCHI dk
            WHERE dk.MaLHP = i.MaLHP AND dk.TrangThai = ''REGISTERED''
        ) d
        WHERE d.SiSo > i.SoLuongToiDa
    )
        THROW 51002, N''Không thể giảm sức chứa thấp hơn số sinh viên đã đăng ký.'', 1;
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=140;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 140 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER TRIGGER dbo.TR_LOPHOCPHAN_MoCanLich
ON dbo.LOPHOCPHAN
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS
    (
        SELECT 1 FROM inserted i
        WHERE i.TrangThai IN (''MO_DANG_KY'', ''DANG_MO'')
          AND NOT EXISTS (SELECT 1 FROM dbo.LICHHOC lh WHERE lh.MaLHP = i.MaLHP)
    )
        THROW 51311, N''Lớp học phần chỉ được mở khi có ít nhất một lịch học hợp lệ.'', 1;
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=141;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 141 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER TRIGGER dbo.TR_LICHHOC_LopMoCanLich
ON dbo.LICHHOC
AFTER DELETE, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS
    (
        SELECT 1
        FROM deleted d
        INNER JOIN dbo.LOPHOCPHAN lhp ON lhp.MaLHP = d.MaLHP
        WHERE lhp.TrangThai IN (''MO_DANG_KY'', ''DANG_MO'')
          AND NOT EXISTS (SELECT 1 FROM dbo.LICHHOC lh WHERE lh.MaLHP = d.MaLHP)
    )
        THROW 51311, N''Không thể xóa lịch cuối cùng của lớp học phần đang mở.'', 1;
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=142;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 142 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER TRIGGER dbo.TR_SINHVIEN_KiemTraKhoaLop
ON dbo.SINHVIEN
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS
    (
        SELECT 1
        FROM inserted i
        INNER JOIN dbo.LOP l ON l.MaLop = i.MaLop
        INNER JOIN dbo.CHUONGTRINHDAOTAO c ON c.MaCTDT = i.MaCTDT
        INNER JOIN dbo.NGANH n ON n.MaNganh = c.MaNganh
        WHERE i.MaKhoa <> l.MaKhoa
           OR i.MaKhoa <> n.MaKhoa
           OR c.NamTuyenSinh <> l.NamNhapHoc
    )
        THROW 51008, N''Khoa, lớp và khóa tuyển sinh của sinh viên phải khớp với CTĐT.'', 1;
    IF EXISTS
    (
        SELECT 1 FROM inserted i
        INNER JOIN dbo.CHUONGTRINHDAOTAO c ON c.MaCTDT = i.MaCTDT
        INNER JOIN dbo.NGANH n ON n.MaNganh = c.MaNganh
        WHERE i.MaKhoa <> n.MaKhoa
    )
        THROW 51008, N''Khoa của sinh viên phải khớp với khoa ngành của CTĐT.'', 1;
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=143;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 143 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER TRIGGER dbo.TR_LOP_KiemTraSinhVien
ON dbo.LOP
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF (UPDATE(MaKhoa) OR UPDATE(NamNhapHoc)) AND EXISTS
    (
        SELECT 1
        FROM inserted i
        INNER JOIN dbo.SINHVIEN sv ON sv.MaLop = i.MaLop
        INNER JOIN dbo.CHUONGTRINHDAOTAO c ON c.MaCTDT = sv.MaCTDT
        INNER JOIN dbo.NGANH n ON n.MaNganh = c.MaNganh
        WHERE sv.MaKhoa <> i.MaKhoa OR n.MaKhoa <> i.MaKhoa
           OR c.NamTuyenSinh <> i.NamNhapHoc
    )
        THROW 51008, N''Không thể đổi khoa hoặc khóa lớp khi sinh viên hiện tại không còn khớp CTĐT.'', 1;
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=144;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 144 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER TRIGGER dbo.TR_CHUONGTRINHDAOTAO_KiemTraSinhVien
ON dbo.CHUONGTRINHDAOTAO
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF (UPDATE(MaNganh) OR UPDATE(NamTuyenSinh)) AND EXISTS
    (
        SELECT 1
        FROM inserted i
        INNER JOIN dbo.SINHVIEN sv ON sv.MaCTDT = i.MaCTDT
        INNER JOIN dbo.NGANH n ON n.MaNganh = i.MaNganh
        LEFT JOIN dbo.LOP l ON l.MaLop = sv.MaLop
        WHERE sv.MaKhoa <> n.MaKhoa
           OR (l.MaLop IS NOT NULL AND l.NamNhapHoc <> i.NamTuyenSinh)
    )
        THROW 51008, N''Không thể đổi ngành hoặc khóa CTĐT khi sinh viên hiện tại không còn khớp.'', 1;
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=145;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 145 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER TRIGGER dbo.TR_NGANH_KiemTraSinhVien
ON dbo.NGANH
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(MaKhoa) AND EXISTS
    (
        SELECT 1
        FROM inserted i
        INNER JOIN dbo.CHUONGTRINHDAOTAO c ON c.MaNganh = i.MaNganh
        INNER JOIN dbo.SINHVIEN sv ON sv.MaCTDT = c.MaCTDT
        WHERE sv.MaKhoa <> i.MaKhoa
    )
        THROW 51008, N''Không thể chuyển ngành sang khoa khác khi CTĐT đang có sinh viên.'', 1;
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=146;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 146 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'-- ENCODING: UTF-8 WITH BOM
USE [DBMS330284];';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=147;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 147 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'SET ANSI_NULLS ON;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=148;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 148 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'SET QUOTED_IDENTIFIER ON;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=149;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 149 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER VIEW [dbo].[V_CauTrucChuongTrinhDaoTao]
AS
SELECT
    ctdt.MaCTDT,
    ctdt.TenCTDT,
    n.TenNganh AS Nganh,
    ctdt.KhoaHoc,
    kh.MaKhoa,
    kh.TenKhoa,
    mh.MaMonHoc,
    mh.TenMonHoc,
    mh.SoTinChi,
    ctm.HocKyDuKien,
    ctm.LoaiMon,
    ctm.ThuTu
FROM dbo.CHUONGTRINHDAOTAO ctdt
INNER JOIN dbo.NGANH n
    ON ctdt.MaNganh = n.MaNganh
INNER JOIN dbo.KHOA kh
    ON kh.MaKhoa = n.MaKhoa
INNER JOIN dbo.CTDT_MONHOC ctm
    ON ctm.MaCTDT = ctdt.MaCTDT
INNER JOIN dbo.MONHOC mh
    ON mh.MaMonHoc = ctm.MaMonHoc;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=150;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 150 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER VIEW [dbo].[V_TaiKhoanNguoiDung]
AS
SELECT
    tk.MaTaiKhoan,
    tk.Username,
    tk.VaiTro,
    tk.TrangThai,
    tk.MaSV,
    sv.MaSinhVien,
    sv.HoTen AS HoTenSinhVien,
    sv.Email AS EmailSinhVien,
    sv.MaLop,
    l.TenLop AS TenLopSinhVien,
    tk.MaGV,
    gv.MaGiangVien,
    gv.HoTen AS HoTenGiangVien,
    gv.Email AS EmailGiangVien,
    tk.NgayTao,
    tk.LanDangNhapCuoi
FROM dbo.TAIKHOAN tk
LEFT JOIN dbo.SINHVIEN sv
    ON sv.MaSV = tk.MaSV
LEFT JOIN dbo.LOP l
    ON l.MaLop = sv.MaLop
LEFT JOIN dbo.GIANGVIEN gv
    ON gv.MaGV = tk.MaGV;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=151;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 151 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER VIEW [dbo].[V_ThoiKhoaBieuSinhVien]
AS
SELECT
    sv.MaSV,
    sv.MaSinhVien,
    sv.HoTen AS HoTenSinhVien,
    hk.MaHocKy,
    hk.NamHoc,
    hk.TenHocKy,
    lhp.MaLHP,
    mh.MaMonHoc,
    mh.TenMonHoc,
    lhp.TenLHP,
    gv.MaGV,
    gv.MaGiangVien,
    gv.HoTen AS HoTenGiangVien,
    lh.MaLichHoc,
    lh.Thu,
    lh.TietBatDau,
    lh.SoTiet,
    lh.PhongHoc
FROM dbo.SINHVIEN sv
INNER JOIN dbo.DANGKYTINCHI dk
    ON dk.MaSV = sv.MaSV
    AND dk.TrangThai = ''REGISTERED''
INNER JOIN dbo.LOPHOCPHAN lhp
    ON lhp.MaLHP = dk.MaLHP
INNER JOIN dbo.HOCKY hk
    ON hk.MaHocKy = lhp.MaHocKy
INNER JOIN dbo.MONHOC mh
    ON mh.MaMonHoc = lhp.MaMonHoc
LEFT JOIN dbo.GIANGVIEN gv
    ON gv.MaGV = lhp.MaGiangVien
INNER JOIN dbo.LICHHOC lh
    ON lh.MaLHP = lhp.MaLHP;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=152;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 152 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER VIEW [dbo].[V_BangDiemChiTiet]
AS
SELECT
    dk.MaDangKy,
    sv.MaSV,
    sv.MaSinhVien,
    sv.HoTen AS HoTenSinhVien,
    hk.MaHocKy,
    hk.NamHoc,
    hk.TenHocKy,
    lhp.MaLHP,
    mh.MaMonHoc,
    mh.TenMonHoc,
    mh.SoTinChi,
    ds.DiemQuaTrinh,
    ds.DiemGiuaKy,
    ds.DiemCuoiKy,
    ds.TyTrongQT,
    ds.TyTrongGK,
    ds.TyTrongCK,
    CASE
        WHEN ds.DiemCuoiKy IS NOT NULL THEN
            CAST(
                ds.DiemQuaTrinh * ds.TyTrongQT / 100.0
                + ds.DiemGiuaKy * ds.TyTrongGK / 100.0
                + ds.DiemCuoiKy * ds.TyTrongCK / 100.0
                AS DECIMAL(4,2)
            )
        ELSE NULL
    END AS DiemTongKet,
    CASE
        WHEN ds.DiemCuoiKy IS NULL THEN NULL
        WHEN ds.DiemQuaTrinh * ds.TyTrongQT / 100.0
            + ds.DiemGiuaKy * ds.TyTrongGK / 100.0
            + ds.DiemCuoiKy * ds.TyTrongCK / 100.0 >= 8.5 THEN ''A''
        WHEN ds.DiemQuaTrinh * ds.TyTrongQT / 100.0
            + ds.DiemGiuaKy * ds.TyTrongGK / 100.0
            + ds.DiemCuoiKy * ds.TyTrongCK / 100.0 >= 8.0 THEN ''B+''
        WHEN ds.DiemQuaTrinh * ds.TyTrongQT / 100.0
            + ds.DiemGiuaKy * ds.TyTrongGK / 100.0
            + ds.DiemCuoiKy * ds.TyTrongCK / 100.0 >= 7.0 THEN ''B''
        WHEN ds.DiemQuaTrinh * ds.TyTrongQT / 100.0
            + ds.DiemGiuaKy * ds.TyTrongGK / 100.0
            + ds.DiemCuoiKy * ds.TyTrongCK / 100.0 >= 6.5 THEN ''C+''
        WHEN ds.DiemQuaTrinh * ds.TyTrongQT / 100.0
            + ds.DiemGiuaKy * ds.TyTrongGK / 100.0
            + ds.DiemCuoiKy * ds.TyTrongCK / 100.0 >= 5.5 THEN ''C''
        WHEN ds.DiemQuaTrinh * ds.TyTrongQT / 100.0
            + ds.DiemGiuaKy * ds.TyTrongGK / 100.0
            + ds.DiemCuoiKy * ds.TyTrongCK / 100.0 >= 5.0 THEN ''D''
        ELSE ''F''
    END AS DiemChu,
    CASE
        WHEN ds.DiemCuoiKy IS NULL THEN N''ĐANG HỌC''
        WHEN ds.DiemQuaTrinh * ds.TyTrongQT / 100.0
            + ds.DiemGiuaKy * ds.TyTrongGK / 100.0
            + ds.DiemCuoiKy * ds.TyTrongCK / 100.0 >= 5.0
        THEN N''ĐẠT''
        ELSE N''KHÔNG ĐẠT''
    END AS KetQua
FROM dbo.DANGKYTINCHI dk
INNER JOIN dbo.SINHVIEN sv
    ON sv.MaSV = dk.MaSV
INNER JOIN dbo.LOPHOCPHAN lhp
    ON lhp.MaLHP = dk.MaLHP
INNER JOIN dbo.MONHOC mh
    ON mh.MaMonHoc = lhp.MaMonHoc
INNER JOIN dbo.HOCKY hk
    ON hk.MaHocKy = lhp.MaHocKy
LEFT JOIN dbo.DIEMSO ds
    ON ds.MaDangKy = dk.MaDangKy
WHERE dk.TrangThai = ''REGISTERED'';';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=153;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 153 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER VIEW [dbo].[V_HocPhiSinhVien]
AS
SELECT
    hp.MaHocPhi,
    sv.MaSV,
    sv.MaSinhVien,
    sv.HoTen AS HoTenSinhVien,
    sv.MaLop,
    l.TenLop AS TenLopSinhVien,
    hk.MaHocKy,
    hk.NamHoc,
    hk.TenHocKy,
    hp.MaMucHocPhi,
    hp.SoTinChi,
    hp.DonGiaTinChi,
    hp.TongTien,
    hp.SoTienDaThanhToan,
    hp.TongTien - hp.SoTienDaThanhToan AS SoTienConLai,
    hp.TrangThai,
    hp.NgayCapNhat
FROM dbo.HOCPHI hp
INNER JOIN dbo.SINHVIEN sv
    ON sv.MaSV = hp.MaSV
LEFT JOIN dbo.LOP l
    ON l.MaLop = sv.MaLop
INNER JOIN dbo.HOCKY hk
    ON hk.MaHocKy = hp.MaHocKy;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=154;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 154 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'-- 6. View danh sách lớp sinh hoạt kèm sĩ số thực tế
CREATE OR ALTER VIEW [dbo].[V_DanhSachLopSinhHoat]
AS
SELECT
    l.MaLop,
    l.TenLop,
    l.MaKhoa,
    k.TenKhoa,
    l.KhoaHoc,
    l.NamNhapHoc,
    l.TrangThai,
    COUNT_BIG(sv.MaSV) AS SiSoThucTe
FROM dbo.LOP l
INNER JOIN dbo.KHOA k
    ON l.MaKhoa = k.MaKhoa
LEFT JOIN dbo.SINHVIEN sv
    ON l.MaLop = sv.MaLop
GROUP BY
    l.MaLop,
    l.TenLop,
    l.MaKhoa,
    k.TenKhoa,
    l.KhoaHoc,
    l.NamNhapHoc,
    l.TrangThai;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=155;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 155 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'-- ENCODING: UTF-8 WITH BOM
USE [DBMS330284];';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=156;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 156 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'SET ANSI_NULLS ON;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=157;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 157 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'SET QUOTED_IDENTIFIER ON;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=158;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 158 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER FUNCTION [dbo].[FN_KiemTraTienQuyet]
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
          AND mtq.MucDo = ''BAT_BUOC''
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
                AND dk.TrangThai = ''REGISTERED''
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
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=159;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 159 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER FUNCTION [dbo].[FN_KiemTraThoiGianDangKy]
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
          AND TrangThai = ''DANG_MO''
          AND @ThoiDiem >= NgayMoDangKy
          AND @ThoiDiem <= NgayDongDangKy
    )
    BEGIN
        SET @KetQua = 1;
    END;

    RETURN @KetQua;
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=160;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 160 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER FUNCTION [dbo].[FN_TongTinChiDangKy]
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
      AND dk.TrangThai = ''REGISTERED''
      AND lhp.MaHocKy = @MaHocKy;

    RETURN @TongTinChi;
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=161;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 161 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER FUNCTION [dbo].[FN_TinhDiemTongKet]
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
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=162;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 162 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER FUNCTION [dbo].[FN_KiemTraTaiKhoanDangHoatDong]
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
          AND TrangThai = ''ACTIVE''
    )
    BEGIN
        SET @KetQua = 1;
    END;

    RETURN @KetQua;
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=163;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 163 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE OR ALTER FUNCTION [dbo].[FN_LayDonGiaTinChi]
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
      AND PhamViApDung = ''TOAN_TRUONG''
      AND TrangThai = ''ACTIVE''
      AND NgayHieuLuc <= @NgayTinh
      AND
      (
          NgayHetHieuLuc IS NULL
          OR NgayHetHieuLuc >= @NgayTinh
      )
    ORDER BY NgayHieuLuc DESC, MaMucHocPhi DESC;

    RETURN @DonGia;
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=164;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 164 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'-- 7. Hàm đếm sĩ số sinh viên của lớp sinh hoạt
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
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=165;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 165 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'-- ENCODING: UTF-8 WITH BOM
USE [DBMS330284];';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=166;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 166 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'SET ANSI_NULLS ON;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=167;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 167 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'SET QUOTED_IDENTIFIER ON;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=168;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 168 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE PROCEDURE [dbo].[SP_TaoTaiKhoan]
    @Username       VARCHAR(50),
    @PasswordHash   VARCHAR(255),
    @VaiTro         VARCHAR(30),
    @MaSV           INT = NULL,
    @MaGV           INT = NULL,
    @MaTaiKhoanMoi  INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
DECLARE @TuMoTran BIT = 0;
DECLARE @DaTaoSavepoint BIT = 0;
DECLARE @LaDaoTao BIT = ISNULL(IS_MEMBER(N''DAO_TAO''), 0);
DECLARE @LaQuanTri BIT = ISNULL(IS_MEMBER(N''QUAN_TRI''), 0);

SET @MaTaiKhoanMoi = NULL;
SET @Username = LTRIM(RTRIM(@Username));
SET @VaiTro = UPPER(LTRIM(RTRIM(@VaiTro)));

BEGIN TRY
    IF @Username IS NULL OR @Username = ''''
        THROW 51001, N''Username khong duoc de trong.'', 1;

    IF @PasswordHash IS NULL OR LTRIM(RTRIM(@PasswordHash)) = ''''
        THROW 51002, N''PasswordHash khong duoc de trong.'', 1;

    IF @VaiTro NOT IN (''SINH_VIEN'', ''GIANG_VIEN'', ''DAO_TAO'', ''QUAN_TRI'')
        THROW 51003, N''VaiTro khong hop le.'', 1;

    IF @LaDaoTao = 0 AND @LaQuanTri = 0 AND USER_NAME() <> N''dbo''
        THROW 51012, N''Chi DAO_TAO hoac QUAN_TRI duoc tao tai khoan.'', 1;

    IF @LaDaoTao = 1
       AND @LaQuanTri = 0
       AND @VaiTro IN (''DAO_TAO'', ''QUAN_TRI'')
        THROW 51013, N''Role DAO_TAO khong duoc tao tai khoan quan tri.'', 1;

    IF @VaiTro = ''SINH_VIEN''
       AND (@MaSV IS NULL OR @MaGV IS NOT NULL)
        THROW 51004, N''Role SINH_VIEN phai gan dung mot MaSV.'', 1;

    IF @VaiTro = ''GIANG_VIEN''
       AND (@MaGV IS NULL OR @MaSV IS NOT NULL)
        THROW 51004, N''Role GIANG_VIEN phai gan dung mot MaGV.'', 1;

    IF @VaiTro IN (''DAO_TAO'', ''QUAN_TRI'')
       AND (@MaSV IS NOT NULL OR @MaGV IS NOT NULL)
        THROW 51004, N''Role DAO_TAO va QUAN_TRI khong gan MaSV hoac MaGV.'', 1;

    IF @MaSV IS NOT NULL AND @MaGV IS NOT NULL
        THROW 51004, N''Tai khoan khong duoc lien ket dong thoi voi SINHVIEN va GIANGVIEN.'', 1;

    IF @@TRANCOUNT = 0
    BEGIN
        BEGIN TRANSACTION;
        SET @TuMoTran = 1;
    END
    ELSE
    BEGIN
        SAVE TRANSACTION SP_TaoTaiKhoan_Save;
        SET @DaTaoSavepoint = 1;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.TAIKHOAN WITH (UPDLOCK, HOLDLOCK)
        WHERE Username = @Username
    )
        THROW 51006, N''Username da ton tai.'', 1;

    IF @MaSV IS NOT NULL
    BEGIN
        IF NOT EXISTS
        (
            SELECT 1
            FROM dbo.SINHVIEN WITH (UPDLOCK, HOLDLOCK)
            WHERE MaSV = @MaSV
        )
            THROW 51005, N''MaSV khong ton tai.'', 1;

        IF EXISTS
        (
            SELECT 1
            FROM dbo.TAIKHOAN WITH (UPDLOCK, HOLDLOCK)
            WHERE MaSV = @MaSV
        )
            THROW 51007, N''Sinh vien da duoc lien ket voi tai khoan khac.'', 1;
    END;

    IF @MaGV IS NOT NULL
    BEGIN
        IF NOT EXISTS
        (
            SELECT 1
            FROM dbo.GIANGVIEN WITH (UPDLOCK, HOLDLOCK)
            WHERE MaGV = @MaGV
        )
            THROW 51005, N''MaGV khong ton tai.'', 1;

        IF EXISTS
        (
            SELECT 1
            FROM dbo.TAIKHOAN WITH (UPDLOCK, HOLDLOCK)
            WHERE MaGV = @MaGV
        )
            THROW 51008, N''Giang vien da duoc lien ket voi tai khoan khac.'', 1;
    END;

    INSERT INTO dbo.TAIKHOAN
    (
        Username,
        PasswordHash,
        VaiTro,
        TrangThai,
        MaSV,
        MaGV
    )
    VALUES
    (
        @Username,
        @PasswordHash,
        @VaiTro,
        ''ACTIVE'',
        @MaSV,
        @MaGV
    );

    SET @MaTaiKhoanMoi = CONVERT(INT, SCOPE_IDENTITY());

    IF @TuMoTran = 1
        COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() = 1
    BEGIN
        IF @TuMoTran = 1
            ROLLBACK TRANSACTION;
        ELSE IF @DaTaoSavepoint = 1
            ROLLBACK TRANSACTION SP_TaoTaiKhoan_Save;
    END
    ELSE IF XACT_STATE() = -1 AND @TuMoTran = 1
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;

END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=169;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 169 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE PROCEDURE [dbo].[SP_KhoaTaiKhoan]
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
DECLARE @LaDaoTao BIT = ISNULL(IS_MEMBER(N''DAO_TAO''), 0);
DECLARE @LaQuanTri BIT = ISNULL(IS_MEMBER(N''QUAN_TRI''), 0);

BEGIN TRY
    IF @MaTaiKhoan IS NULL
        THROW 51009, N''MaTaiKhoan khong duoc de trong.'', 1;

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

    SELECT
        @TrangThaiHienTai = TrangThai,
        @VaiTroHienTai = VaiTro
    FROM dbo.TAIKHOAN WITH (UPDLOCK, HOLDLOCK)
    WHERE MaTaiKhoan = @MaTaiKhoan;

    IF @TrangThaiHienTai IS NULL
        THROW 51010, N''Khong tim thay tai khoan.'', 1;

    IF @MaTaiKhoanNguoiThaoTac IS NOT NULL
    BEGIN
        SELECT
            @VaiTroNguoiThaoTac = VaiTro,
            @TrangThaiNguoiThaoTac = TrangThai
        FROM dbo.TAIKHOAN WITH (UPDLOCK, HOLDLOCK)
        WHERE MaTaiKhoan = @MaTaiKhoanNguoiThaoTac;

        IF @VaiTroNguoiThaoTac IS NULL
           OR @TrangThaiNguoiThaoTac <> ''ACTIVE''
           OR @VaiTroNguoiThaoTac NOT IN (''DAO_TAO'', ''QUAN_TRI'')
            THROW 51012, N''Chi DAO_TAO hoac QUAN_TRI dang hoat dong duoc khoa tai khoan.'', 1;

        IF @MaTaiKhoanNguoiThaoTac = @MaTaiKhoan
            THROW 51015, N''Khong the tu khoa tai khoan dang dang nhap.'', 1;

        IF @VaiTroNguoiThaoTac = ''DAO_TAO''
           AND @VaiTroHienTai IN (''DAO_TAO'', ''QUAN_TRI'')
            THROW 51014, N''Role DAO_TAO khong duoc khoa tai khoan DAO_TAO hoac QUAN_TRI.'', 1;
    END
    ELSE
    BEGIN
        IF @LaDaoTao = 0 AND @LaQuanTri = 0 AND USER_NAME() <> N''dbo''
            THROW 51012, N''Chi DAO_TAO hoac QUAN_TRI duoc khoa tai khoan.'', 1;

        IF @LaDaoTao = 1
           AND @LaQuanTri = 0
           AND @VaiTroHienTai IN (''DAO_TAO'', ''QUAN_TRI'')
            THROW 51014, N''Role DAO_TAO khong duoc khoa tai khoan quan tri.'', 1;
    END;

    IF @TrangThaiHienTai = ''DISABLED''
        THROW 51011, N''Tai khoan DISABLED khong the chuyen sang LOCKED.'', 1;

    IF @TrangThaiHienTai <> ''LOCKED''
    BEGIN
        UPDATE dbo.TAIKHOAN
        SET TrangThai = ''LOCKED''
        WHERE MaTaiKhoan = @MaTaiKhoan;
    END;

    IF @TuMoTran = 1
        COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() = 1
    BEGIN
        IF @TuMoTran = 1
            ROLLBACK TRANSACTION;
        ELSE IF @DaTaoSavepoint = 1
            ROLLBACK TRANSACTION SP_KhoaTaiKhoan_Save;
    END
    ELSE IF XACT_STATE() = -1 AND @TuMoTran = 1
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;

END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=170;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 170 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE PROCEDURE [dbo].[SP_DangKyTinChi]
    @MaSV INT,
    @MaLHP VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
DECLARE @MaMonHoc VARCHAR(15);
DECLARE @MaHocKy INT;
DECLARE @SoLuongToiDa INT;
DECLARE @TrangThaiLHP VARCHAR(20);
DECLARE @SoTinChiMon INT;
DECLARE @SiSoHienTai INT;
DECLARE @TongTinChiHienTai INT;
DECLARE @TrangThaiSV VARCHAR(20);

BEGIN TRY
    BEGIN TRANSACTION;

    SELECT
        @TrangThaiSV = sv.TrangThai
    FROM dbo.SINHVIEN sv
    WHERE sv.MaSV = @MaSV;

    IF @TrangThaiSV IS NULL
        THROW 50001, N''Sinh vien khong ton tai trong he thong.'', 1;

    IF @TrangThaiSV <> ''DANG_HOC''
        THROW 50002, N''Sinh vien khong o trang thai DANG_HOC.'', 1;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.TAIKHOAN tk
        WHERE tk.MaSV = @MaSV
          AND tk.TrangThai <> ''ACTIVE''
    )
        THROW 50003, N''Tai khoan sinh vien dang bi khoa hoac vo hieu hoa.'', 1;

    SELECT
        @MaMonHoc = lhp.MaMonHoc,
        @MaHocKy = lhp.MaHocKy,
        @SoLuongToiDa = lhp.SoLuongToiDa,
        @TrangThaiLHP = lhp.TrangThai,
        @SoTinChiMon = mh.SoTinChi
    FROM dbo.LOPHOCPHAN lhp WITH (UPDLOCK, HOLDLOCK)
    INNER JOIN dbo.MONHOC mh
        ON mh.MaMonHoc = lhp.MaMonHoc
    WHERE lhp.MaLHP = @MaLHP;

    IF @MaMonHoc IS NULL
        THROW 50004, N''Lop hoc phan khong ton tai.'', 1;

    IF @TrangThaiLHP NOT IN (''MO_DANG_KY'', ''DANG_MO'')
        THROW 50005, N''Lop hoc phan hien khong mo dang ky.'', 1;

    IF dbo.FN_KiemTraThoiGianDangKy(@MaHocKy, SYSUTCDATETIME()) = 0
        THROW 50006, N''Hien khong nam trong thoi gian dang ky tin chi.'', 1;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.DANGKYTINCHI dk WITH (UPDLOCK, HOLDLOCK)
        INNER JOIN dbo.LOPHOCPHAN lhp
            ON lhp.MaLHP = dk.MaLHP
        WHERE dk.MaSV = @MaSV
          AND lhp.MaHocKy = @MaHocKy
          AND lhp.MaMonHoc = @MaMonHoc
          AND dk.TrangThai = ''REGISTERED''
    )
        THROW 50007, N''Sinh vien da dang ky mon hoc nay trong hoc ky.'', 1;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.MONHOCTIENQUYET tq
        WHERE tq.MaMonHoc = @MaMonHoc
          AND tq.MucDo = ''BAT_BUOC''
          AND NOT EXISTS
          (
              SELECT 1
              FROM dbo.V_BangDiemChiTiet bd
              WHERE bd.MaSV = @MaSV
                AND bd.MaMonHoc = tq.MaMonTienQuyet
                AND bd.DiemTongKet >= 5.0
          )
    )
        THROW 50008, N''Sinh vien chua hoan thanh mon tien quyet bat buoc.'', 1;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.LICHHOC lh_moi
        INNER JOIN dbo.V_ThoiKhoaBieuSinhVien tkb
            ON tkb.MaSV = @MaSV
           AND tkb.MaHocKy = @MaHocKy
           AND tkb.Thu = lh_moi.Thu
        WHERE lh_moi.MaLHP = @MaLHP
          AND lh_moi.TietBatDau < tkb.TietBatDau + tkb.SoTiet
          AND tkb.TietBatDau < lh_moi.TietBatDau + lh_moi.SoTiet
    )
        THROW 50009, N''Lich hoc bi trung voi thoi khoa bieu hien tai cua sinh vien.'', 1;

    SET @TongTinChiHienTai =
        dbo.FN_TongTinChiDangKy(@MaSV, @MaHocKy);

    IF (@TongTinChiHienTai + @SoTinChiMon) > 25
        THROW 50010, N''Vuot qua so tin chi toi da cho phep trong hoc ky.'', 1;

    SELECT
        @SiSoHienTai = COUNT(*)
    FROM dbo.DANGKYTINCHI WITH (UPDLOCK, HOLDLOCK)
    WHERE MaLHP = @MaLHP
      AND TrangThai = ''REGISTERED'';

    IF @SiSoHienTai >= @SoLuongToiDa
        THROW 50011, N''Lop hoc phan da du si so toi da.'', 1;

    INSERT INTO dbo.DANGKYTINCHI
    (
        MaSV,
        MaLHP,
        NgayDangKy,
        TrangThai
    )
    VALUES
    (
        @MaSV,
        @MaLHP,
        SYSUTCDATETIME(),
        ''REGISTERED''
    );

    COMMIT TRANSACTION;

    SELECT
        dk.MaDangKy,
        dk.MaSV,
        dk.MaLHP,
        dk.NgayDangKy,
        dk.TrangThai
    FROM dbo.DANGKYTINCHI dk
    WHERE dk.MaDangKy = SCOPE_IDENTITY();
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;

END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=171;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 171 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE PROCEDURE [dbo].[SP_HuyDangKy]
    @MaSV INT,
    @MaLHP VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
DECLARE @MaDangKy BIGINT;
DECLARE @MaHocKy INT;

BEGIN TRY
    BEGIN TRANSACTION;

    SELECT
        @MaDangKy = dk.MaDangKy,
        @MaHocKy = lhp.MaHocKy
    FROM dbo.DANGKYTINCHI dk WITH (UPDLOCK, HOLDLOCK)
    INNER JOIN dbo.LOPHOCPHAN lhp
        ON lhp.MaLHP = dk.MaLHP
    WHERE dk.MaSV = @MaSV
      AND dk.MaLHP = @MaLHP
      AND dk.TrangThai = ''REGISTERED'';

    IF @MaDangKy IS NULL
        THROW 50021, N''Khong tim thay dang ky REGISTERED de huy.'', 1;

    IF dbo.FN_KiemTraThoiGianDangKy(@MaHocKy, SYSUTCDATETIME()) = 0
        THROW 50022, N''Da het thoi han dang ky hoac huy hoc phan.'', 1;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.DIEMSO
        WHERE MaDangKy = @MaDangKy
          AND
          (
              DiemQuaTrinh IS NOT NULL
              OR DiemGiuaKy IS NOT NULL
              OR DiemCuoiKy IS NOT NULL
          )
    )
        THROW 50023, N''Khong the huy hoc phan vi da co diem thanh phan.'', 1;

    DELETE FROM dbo.DIEMSO
    WHERE MaDangKy = @MaDangKy;

    UPDATE dbo.DANGKYTINCHI
    SET TrangThai = ''CANCELLED''
    WHERE MaDangKy = @MaDangKy;

    COMMIT TRANSACTION;

    SELECT
        MaDangKy,
        MaSV,
        MaLHP,
        NgayDangKy,
        TrangThai
    FROM dbo.DANGKYTINCHI
    WHERE MaDangKy = @MaDangKy;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;

END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=172;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 172 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE PROCEDURE [dbo].[SP_TinhHocPhiSinhVien]
    @MaSV INT,
    @MaHocKy INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
BEGIN TRY
    IF @MaSV IS NULL OR @MaSV <= 0
        THROW 50010, N''MaSV khong hop le.'', 1;

    IF @MaHocKy IS NULL OR @MaHocKy <= 0
        THROW 50011, N''MaHocKy khong hop le.'', 1;

    BEGIN TRANSACTION;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.SINHVIEN
        WHERE MaSV = @MaSV
    )
        THROW 50012, N''Sinh vien khong ton tai.'', 1;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.HOCKY
        WHERE MaHocKy = @MaHocKy
    )
        THROW 50013, N''Hoc ky khong ton tai.'', 1;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.HOCPHI WITH (UPDLOCK, HOLDLOCK)
        WHERE MaSV = @MaSV
          AND MaHocKy = @MaHocKy
    )
        THROW 50014, N''Sinh vien da co hoc phi trong hoc ky nay.'', 1;

    DECLARE @Ngay DATE = CONVERT(DATE, SYSUTCDATETIME());
    DECLARE @DonGia DECIMAL(12,2);

    SELECT TOP (1)
        @DonGia = DonGiaTinChi
    FROM dbo.MUCHOCPHI WITH (UPDLOCK, HOLDLOCK)
    WHERE MaHocKy = @MaHocKy
      AND PhamViApDung = ''TOAN_TRUONG''
      AND TrangThai = ''ACTIVE''
      AND NgayHieuLuc <= @Ngay
      AND
      (
          NgayHetHieuLuc IS NULL
          OR NgayHetHieuLuc >= @Ngay
      )
    ORDER BY NgayHieuLuc DESC, MaMucHocPhi DESC;

    IF @DonGia IS NULL OR @DonGia <= 0
        THROW 50015, N''Khong tim thay muc hoc phi ACTIVE phu hop.'', 1;

    DECLARE @MaMucHocPhi INT;

    SELECT TOP (1)
        @MaMucHocPhi = MaMucHocPhi
    FROM dbo.MUCHOCPHI WITH (UPDLOCK, HOLDLOCK)
    WHERE MaHocKy = @MaHocKy
      AND PhamViApDung = ''TOAN_TRUONG''
      AND TrangThai = ''ACTIVE''
      AND NgayHieuLuc <= @Ngay
      AND
      (
          NgayHetHieuLuc IS NULL
          OR NgayHetHieuLuc >= @Ngay
      )
    ORDER BY NgayHieuLuc DESC, MaMucHocPhi DESC;

    DECLARE @SoTinChi INT;

    SELECT
        @SoTinChi = ISNULL(SUM(CONVERT(INT, mh.SoTinChi)), 0)
    FROM dbo.DANGKYTINCHI dk
    INNER JOIN dbo.LOPHOCPHAN lhp
        ON lhp.MaLHP = dk.MaLHP
    INNER JOIN dbo.MONHOC mh
        ON mh.MaMonHoc = lhp.MaMonHoc
    WHERE dk.MaSV = @MaSV
      AND dk.TrangThai = ''REGISTERED''
      AND lhp.MaHocKy = @MaHocKy;

    IF @SoTinChi <= 0
        THROW 50017, N''Sinh vien khong co tin chi REGISTERED trong hoc ky.'', 1;

    DECLARE @TongTien DECIMAL(14,2);

    SET @TongTien =
        CONVERT(DECIMAL(14,2), @SoTinChi * @DonGia);

    INSERT INTO dbo.HOCPHI
    (
        MaSV,
        MaHocKy,
        MaMucHocPhi,
        SoTinChi,
        DonGiaTinChi,
        TongTien,
        SoTienDaThanhToan,
        TrangThai,
        NgayCapNhat
    )
    VALUES
    (
        @MaSV,
        @MaHocKy,
        @MaMucHocPhi,
        @SoTinChi,
        @DonGia,
        @TongTien,
        0,
        ''UNPAID'',
        SYSUTCDATETIME()
    );

    DECLARE @MaHocPhi INT =
        CONVERT(INT, SCOPE_IDENTITY());

    COMMIT TRANSACTION;

    SELECT *
    FROM dbo.V_HocPhiSinhVien
    WHERE MaHocPhi = @MaHocPhi;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;

END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=173;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 173 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'CREATE PROCEDURE [dbo].[SP_ThongKeHocPhi]
    @MaHocKy INT = NULL,
    @TrangThai VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
IF @TrangThai IS NOT NULL
   AND @TrangThai NOT IN (''UNPAID'', ''PARTIAL'', ''PAID'')
    THROW 50020, N''TrangThai hoc phi khong hop le.'', 1;

IF @MaHocKy IS NOT NULL
   AND NOT EXISTS
   (
       SELECT 1
       FROM dbo.HOCKY
       WHERE MaHocKy = @MaHocKy
   )
    THROW 50021, N''Hoc ky khong ton tai.'', 1;

SELECT
    hp.MaHocKy,
    hk.NamHoc,
    hk.TenHocKy,
    COUNT(*) AS SoHoSoHocPhi,
    SUM(hp.TongTien) AS TongTienPhaiThu,
    SUM(hp.SoTienDaThanhToan) AS TongTienDaThu,
    SUM(hp.TongTien - hp.SoTienDaThanhToan) AS TongTienConLai,
    SUM(CASE WHEN hp.TrangThai = ''UNPAID'' THEN 1 ELSE 0 END) AS SoUNPAID,
    SUM(CASE WHEN hp.TrangThai = ''PARTIAL'' THEN 1 ELSE 0 END) AS SoPARTIAL,
    SUM(CASE WHEN hp.TrangThai = ''PAID'' THEN 1 ELSE 0 END) AS SoPAID
FROM dbo.HOCPHI hp
INNER JOIN dbo.HOCKY hk
    ON hk.MaHocKy = hp.MaHocKy
WHERE (@MaHocKy IS NULL OR hp.MaHocKy = @MaHocKy)
  AND (@TrangThai IS NULL OR hp.TrangThai = @TrangThai)
GROUP BY
    hp.MaHocKy,
    hk.NamHoc,
    hk.TenHocKy
ORDER BY
    hp.MaHocKy;

END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=174;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 174 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'-- 7. Thủ tục báo cáo thống kê học phí chi tiết theo Lớp sinh hoạt
CREATE PROCEDURE [dbo].[SP_ThongKeHocPhiTheoLop]
    @MaLop VARCHAR(20),
    @MaHocKy INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.LOP WHERE MaLop = @MaLop)
    BEGIN
        THROW 51008, N''Không tìm thấy lớp sinh hoạt được yêu cầu.'', 1;
    END

    IF @MaHocKy IS NULL
    BEGIN
        SELECT TOP 1 @MaHocKy = MaHocKy
        FROM dbo.HOCKY
        ORDER BY TrangThai DESC, MaHocKy DESC;
    END

    SELECT
        l.MaLop,
        l.TenLop,
        k.TenKhoa,
        hk.MaHocKy,
        hk.TenHocKy,
        hk.NamHoc,
        COUNT(sv.MaSV) AS TongSoSinhVien,
        COUNT(hp.MaHocPhi) AS SoSinhVienCoHocPhi,
        ISNULL(SUM(hp.TongTien), 0) AS TongTienPhaiThu,
        ISNULL(SUM(hp.SoTienDaThanhToan), 0) AS TongTienDaThu,
        ISNULL(SUM(CASE WHEN hp.TongTien > hp.SoTienDaThanhToan THEN hp.TongTien - hp.SoTienDaThanhToan ELSE 0 END), 0) AS TongTienConNo,
        SUM(CASE WHEN hp.TrangThai = ''PAID'' THEN 1 ELSE 0 END) AS SoSV_DaHoanThanh,
        SUM(CASE WHEN hp.TrangThai = ''PARTIAL'' THEN 1 ELSE 0 END) AS SoSV_NopMotPhan,
        SUM(CASE WHEN hp.TrangThai = ''UNPAID'' THEN 1 ELSE 0 END) AS SoSV_ChuaNop
    FROM dbo.LOP l
    INNER JOIN dbo.KHOA k ON l.MaKhoa = k.MaKhoa
    LEFT JOIN dbo.SINHVIEN sv ON l.MaLop = sv.MaLop
    LEFT JOIN dbo.HOCPHI hp ON sv.MaSV = hp.MaSV AND hp.MaHocKy = @MaHocKy
    LEFT JOIN dbo.HOCKY hk ON hk.MaHocKy = @MaHocKy
    WHERE l.MaLop = @MaLop
    GROUP BY
        l.MaLop,
        l.TenLop,
        k.TenKhoa,
        hk.MaHocKy,
        hk.TenHocKy,
        hk.NamHoc;
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=175;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 175 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'-- ============================================================================
-- 8. SP_XacNhanThanhToan: Xác nhận giao dịch học phí (CHO_XAC_NHAN -> DA_XAC_NHAN)
-- ============================================================================
CREATE PROCEDURE dbo.SP_XacNhanThanhToan
    @MaThanhToan BIGINT,
    @MaTaiKhoanXacNhan INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;
    BEGIN TRY
        -- 1. Kiểm tra giao dịch tồn tại
        DECLARE @CurrentStatus VARCHAR(20);
        DECLARE @MaHocPhi INT;
        DECLARE @SoTien DECIMAL(18, 2);

        SELECT
            @CurrentStatus = TrangThai,
            @MaHocPhi = MaHocPhi,
            @SoTien = SoTien
        FROM dbo.CHITIETTHANHTOAN WITH (UPDLOCK, ROWLOCK)
        WHERE MaThanhToan = @MaThanhToan;

        IF @CurrentStatus IS NULL
        BEGIN
            THROW 51401, N''Giao dịch thanh toán không tồn tại.'', 1;
        END;

        -- 2. Kiểm tra trạng thái hiện tại
        IF @CurrentStatus = ''DA_XAC_NHAN''
        BEGIN
            THROW 51402, N''Giao dịch đã được xác nhận trước đó.'', 1;
        END;

        IF @CurrentStatus = ''TU_CHOI''
        BEGIN
            THROW 51403, N''Không thể xác nhận giao dịch đã bị từ chối.'', 1;
        END;

        IF @CurrentStatus <> ''CHO_XAC_NHAN''
        BEGIN
            THROW 51405, N''Chỉ có thể xác nhận giao dịch đang ở trạng thái chờ xác nhận.'', 1;
        END;

        -- 3. Kiểm tra quyền tài khoản
        DECLARE @VaiTro VARCHAR(20);
        DECLARE @TrangThaiTK VARCHAR(20);

        SELECT
            @VaiTro = VaiTro,
            @TrangThaiTK = TrangThai
        FROM dbo.TAIKHOAN
        WHERE MaTaiKhoan = @MaTaiKhoanXacNhan;

        IF @VaiTro IS NULL OR @TrangThaiTK <> ''ACTIVE'' OR @VaiTro NOT IN (''DAO_TAO'', ''QUAN_TRI'')
        BEGIN
            THROW 51404, N''Tài khoản không có quyền xác nhận thanh toán.'', 1;
        END;

        -- 4. Cập nhật DA_XAC_NHAN (Kích hoạt Trigger cập nhật HOCPHI)
        UPDATE dbo.CHITIETTHANHTOAN
        SET
            TrangThai = ''DA_XAC_NHAN'',
            MaTaiKhoanXacNhan = @MaTaiKhoanXacNhan,
            NgayXacNhan = SYSUTCDATETIME()
        WHERE MaThanhToan = @MaThanhToan;

        COMMIT TRANSACTION;

        -- Trả về dữ liệu chi tiết
        SELECT
            ct.MaThanhToan,
            ct.MaHocPhi,
            ct.SoTien,
            ct.PhuongThuc,
            ct.TrangThai AS TrangThaiThanhToan,
            ct.NgayThanhToan,
            ct.MaTaiKhoanXacNhan,
            ct.NgayXacNhan,
            hp.MaSV,
            hp.TongTien,
            hp.SoTienDaThanhToan,
            (hp.TongTien - hp.SoTienDaThanhToan) AS SoTienConLai,
            hp.TrangThai AS TrangThaiHocPhi
        FROM dbo.CHITIETTHANHTOAN ct
        INNER JOIN dbo.HOCPHI hp ON ct.MaHocPhi = hp.MaHocPhi
        WHERE ct.MaThanhToan = @MaThanhToan;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=176;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 176 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'-- ============================================================================
-- 9. SP_TuChoiThanhToan: Từ chối giao dịch học phí (CHO_XAC_NHAN -> TU_CHOI)
-- ============================================================================
CREATE PROCEDURE dbo.SP_TuChoiThanhToan
    @MaThanhToan BIGINT,
    @MaTaiKhoanXacNhan INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;
    BEGIN TRY
        -- 1. Kiểm tra giao dịch tồn tại
        DECLARE @CurrentStatus VARCHAR(20);

        SELECT
            @CurrentStatus = TrangThai
        FROM dbo.CHITIETTHANHTOAN WITH (UPDLOCK, ROWLOCK)
        WHERE MaThanhToan = @MaThanhToan;

        IF @CurrentStatus IS NULL
        BEGIN
            THROW 51401, N''Giao dịch thanh toán không tồn tại.'', 1;
        END;

        -- 2. Kiểm tra trạng thái hiện tại
        IF @CurrentStatus <> ''CHO_XAC_NHAN''
        BEGIN
            THROW 51405, N''Chỉ có thể từ chối giao dịch đang ở trạng thái chờ xác nhận.'', 1;
        END;

        -- 3. Kiểm tra quyền tài khoản
        DECLARE @VaiTro VARCHAR(20);
        DECLARE @TrangThaiTK VARCHAR(20);

        SELECT
            @VaiTro = VaiTro,
            @TrangThaiTK = TrangThai
        FROM dbo.TAIKHOAN
        WHERE MaTaiKhoan = @MaTaiKhoanXacNhan;

        IF @VaiTro IS NULL OR @TrangThaiTK <> ''ACTIVE'' OR @VaiTro NOT IN (''DAO_TAO'', ''QUAN_TRI'')
        BEGIN
            THROW 51404, N''Tài khoản không có quyền từ chối thanh toán.'', 1;
        END;

        -- 4. Cập nhật TU_CHOI
        UPDATE dbo.CHITIETTHANHTOAN
        SET
            TrangThai = ''TU_CHOI'',
            MaTaiKhoanXacNhan = @MaTaiKhoanXacNhan,
            NgayXacNhan = SYSUTCDATETIME()
        WHERE MaThanhToan = @MaThanhToan;

        COMMIT TRANSACTION;

        SELECT
            ct.MaThanhToan,
            ct.MaHocPhi,
            ct.SoTien,
            ct.PhuongThuc,
            ct.TrangThai AS TrangThaiThanhToan,
            ct.NgayThanhToan,
            ct.MaTaiKhoanXacNhan,
            ct.NgayXacNhan,
            hp.MaSV,
            hp.TongTien,
            hp.SoTienDaThanhToan,
            (hp.TongTien - hp.SoTienDaThanhToan) AS SoTienConLai,
            hp.TrangThai AS TrangThaiHocPhi
        FROM dbo.CHITIETTHANHTOAN ct
        INNER JOIN dbo.HOCPHI hp ON ct.MaHocPhi = hp.MaHocPhi
        WHERE ct.MaThanhToan = @MaThanhToan;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=177;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 177 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'-- ENCODING: UTF-8 WITH BOM
USE [DBMS330284];';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=178;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 178 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'SET ANSI_NULLS ON;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=179;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 179 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'SET QUOTED_IDENTIFIER ON;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=180;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 180 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = ''IX_CTDT_MONHOC_MaCTDT''
      AND object_id = OBJECT_ID(''dbo.CTDT_MONHOC'')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_CTDT_MONHOC_MaCTDT
    ON dbo.CTDT_MONHOC (MaCTDT, MaMonHoc)
    INCLUDE (HocKyDuKien, LoaiMon, ThuTu);
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=181;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 181 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = ''IX_MONHOCTIENQUYET_MaMonTienQuyet''
      AND object_id = OBJECT_ID(''dbo.MONHOCTIENQUYET'')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_MONHOCTIENQUYET_MaMonTienQuyet
    ON dbo.MONHOCTIENQUYET (MaMonTienQuyet, MaMonHoc)
    INCLUDE (MucDo);
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=182;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 182 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = ''IX_MONHOC_MaKhoa''
      AND object_id = OBJECT_ID(''dbo.MONHOC'')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_MONHOC_MaKhoa
    ON dbo.MONHOC (MaKhoa, TrangThai)
    INCLUDE (TenMonHoc, SoTinChi);
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=183;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 183 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = ''IX_SINHVIEN_MaKhoa_TrangThai''
      AND object_id = OBJECT_ID(''dbo.SINHVIEN'')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_SINHVIEN_MaKhoa_TrangThai
    ON dbo.SINHVIEN (MaKhoa, TrangThai)
    INCLUDE (MaSinhVien, HoTen, Email);
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=184;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 184 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = ''IX_GIANGVIEN_MaKhoa_TrangThai''
      AND object_id = OBJECT_ID(''dbo.GIANGVIEN'')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_GIANGVIEN_MaKhoa_TrangThai
    ON dbo.GIANGVIEN (MaKhoa, TrangThai)
    INCLUDE (MaGiangVien, HoTen, Email);
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=185;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 185 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = ''IX_TAIKHOAN_VaiTro_TrangThai''
      AND object_id = OBJECT_ID(''dbo.TAIKHOAN'')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_TAIKHOAN_VaiTro_TrangThai
    ON dbo.TAIKHOAN (VaiTro, TrangThai)
    INCLUDE (Username, MaSV, MaGV, LanDangNhapCuoi);
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=186;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 186 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = ''IX_HOCKY_TrangThai_NgayMoDangKy''
      AND object_id = OBJECT_ID(''dbo.HOCKY'')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_HOCKY_TrangThai_NgayMoDangKy
    ON dbo.HOCKY (TrangThai, NgayMoDangKy)
    INCLUDE (NgayDongDangKy, NamHoc, TenHocKy);
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=187;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 187 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = ''IX_DANGKYTINCHI_MaSV_MaLHP''
      AND object_id = OBJECT_ID(''dbo.DANGKYTINCHI'')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_DANGKYTINCHI_MaSV_MaLHP
    ON dbo.DANGKYTINCHI (MaSV, MaLHP)
    INCLUDE (TrangThai, NgayDangKy);
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=188;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 188 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = ''IX_DANGKYTINCHI_MaLHP_TrangThai''
      AND object_id = OBJECT_ID(''dbo.DANGKYTINCHI'')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_DANGKYTINCHI_MaLHP_TrangThai
    ON dbo.DANGKYTINCHI (MaLHP, TrangThai)
    INCLUDE (MaSV, NgayDangKy);
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=189;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 189 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = ''IX_LOPHOCPHAN_MaHocKy_MaMonHoc''
      AND object_id = OBJECT_ID(''dbo.LOPHOCPHAN'')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_LOPHOCPHAN_MaHocKy_MaMonHoc
    ON dbo.LOPHOCPHAN (MaHocKy, MaMonHoc)
    INCLUDE (MaLHP, MaGiangVien, SoLuongToiDa, TrangThai);
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=190;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 190 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = ''IX_LICHHOC_MaLHP_Thu_Tiet''
      AND object_id = OBJECT_ID(''dbo.LICHHOC'')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_LICHHOC_MaLHP_Thu_Tiet
    ON dbo.LICHHOC (MaLHP, Thu, TietBatDau)
    INCLUDE (SoTiet, PhongHoc);
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=191;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 191 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = ''IX_HOCPHI_MaSV_MaHocKy''
      AND object_id = OBJECT_ID(''dbo.HOCPHI'')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_HOCPHI_MaSV_MaHocKy
    ON dbo.HOCPHI (MaSV, MaHocKy);
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=192;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 192 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = ''IX_HOCPHI_MaHocKy_TrangThai''
      AND object_id = OBJECT_ID(''dbo.HOCPHI'')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_HOCPHI_MaHocKy_TrangThai
    ON dbo.HOCPHI (MaHocKy, TrangThai);
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=193;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 193 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = ''IX_LOGHOATDONG_ThoiGian''
      AND object_id = OBJECT_ID(''dbo.LOGHOATDONG'')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_LOGHOATDONG_ThoiGian
    ON dbo.LOGHOATDONG (ThoiGian);
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=194;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 194 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = ''IX_LOGHOATDONG_MaTaiKhoan_ThoiGian''
      AND object_id = OBJECT_ID(''dbo.LOGHOATDONG'')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_LOGHOATDONG_MaTaiKhoan_ThoiGian
    ON dbo.LOGHOATDONG (MaTaiKhoan, ThoiGian);
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=195;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 195 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = ''IX_NGANH_MaKhoa''
      AND object_id = OBJECT_ID(''dbo.NGANH'')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_NGANH_MaKhoa
    ON dbo.NGANH (MaKhoa);
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=196;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 196 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = ''IX_CHUONGTRINHDAOTAO_MaNganh''
      AND object_id = OBJECT_ID(''dbo.CHUONGTRINHDAOTAO'')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_CHUONGTRINHDAOTAO_MaNganh
    ON dbo.CHUONGTRINHDAOTAO (MaNganh);
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=197;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 197 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = ''IX_SINHVIEN_MaLop''
      AND object_id = OBJECT_ID(''dbo.SINHVIEN'')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_SINHVIEN_MaLop
    ON dbo.SINHVIEN (MaLop)
    INCLUDE (HoTen, Email, TrangThai);
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=198;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 198 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = ''IX_LOP_MaKhoa_NamNhapHoc''
      AND object_id = OBJECT_ID(''dbo.LOP'')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_LOP_MaKhoa_NamNhapHoc
    ON dbo.LOP (MaKhoa, NamNhapHoc)
    INCLUDE (TenLop, KhoaHoc, TrangThai);
END;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=199;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 199 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'SELECT
    OBJECT_NAME(object_id) AS TenBang,
    name AS TenIndex,
    type_desc AS LoaiIndex
FROM sys.indexes
WHERE name IN
(
    ''IX_NGANH_MaKhoa'',
    ''IX_CHUONGTRINHDAOTAO_MaNganh'',
    ''IX_CTDT_MONHOC_MaCTDT'',
    ''IX_MONHOCTIENQUYET_MaMonTienQuyet'',
    ''IX_MONHOC_MaKhoa'',
    ''IX_SINHVIEN_MaKhoa_TrangThai'',
    ''IX_SINHVIEN_MaLop'',
    ''IX_LOP_MaKhoa_NamNhapHoc'',
    ''IX_GIANGVIEN_MaKhoa_TrangThai'',
    ''IX_TAIKHOAN_VaiTro_TrangThai'',
    ''IX_HOCKY_TrangThai_NgayMoDangKy'',
    ''IX_DANGKYTINCHI_MaSV_MaLHP'',
    ''IX_DANGKYTINCHI_MaLHP_TrangThai'',
    ''IX_LOPHOCPHAN_MaHocKy_MaMonHoc'',
    ''IX_LICHHOC_MaLHP_Thu_Tiet'',
    ''IX_HOCPHI_MaSV_MaHocKy'',
    ''IX_HOCPHI_MaHocKy_TrangThai'',
    ''IX_LOGHOATDONG_ThoiGian'',
    ''IX_LOGHOATDONG_MaTaiKhoan_ThoiGian''
)
ORDER BY TenBang, TenIndex;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=200;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 200 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'-- Roles nghiệp vụ và runtime least privilege.
USE [DBMS330284];';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=201;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 201 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'IF DATABASE_PRINCIPAL_ID(''SINH_VIEN'') IS NULL CREATE ROLE SINH_VIEN;
IF DATABASE_PRINCIPAL_ID(''GIANG_VIEN'') IS NULL CREATE ROLE GIANG_VIEN;
IF DATABASE_PRINCIPAL_ID(''DAO_TAO'') IS NULL CREATE ROLE DAO_TAO;
IF DATABASE_PRINCIPAL_ID(''QUAN_TRI'') IS NULL CREATE ROLE QUAN_TRI;
IF DATABASE_PRINCIPAL_ID(''APP_RUNTIME'') IS NULL CREATE ROLE APP_RUNTIME;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=202;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 202 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'GRANT SELECT ON dbo.V_ThoiKhoaBieuSinhVien TO SINH_VIEN;
GRANT SELECT ON dbo.V_BangDiemChiTiet TO SINH_VIEN;
GRANT SELECT ON dbo.V_CauTrucChuongTrinhDAOTAO TO SINH_VIEN;
GRANT EXECUTE ON dbo.SP_DangKyTinChi TO SINH_VIEN;
GRANT EXECUTE ON dbo.SP_HuyDangKy TO SINH_VIEN;

GRANT SELECT ON dbo.V_BangDiemChiTiet TO GIANG_VIEN;
GRANT SELECT ON dbo.V_CauTrucChuongTrinhDAOTAO TO GIANG_VIEN;
GRANT EXECUTE ON dbo.FN_TinhDiemTongKet TO GIANG_VIEN;

GRANT SELECT ON dbo.V_TaiKhoanNguoiDung TO DAO_TAO;
GRANT SELECT ON dbo.V_CauTrucChuongTrinhDAOTAO TO DAO_TAO;
GRANT SELECT ON dbo.V_BangDiemChiTiet TO DAO_TAO;
GRANT SELECT ON dbo.V_ThoiKhoaBieuSinhVien TO DAO_TAO;
GRANT SELECT ON dbo.V_HocPhiSinhVien TO DAO_TAO;
GRANT SELECT ON dbo.LOGHOATDONG TO DAO_TAO;
GRANT EXECUTE ON dbo.SP_TaoTaiKhoan TO DAO_TAO;
GRANT EXECUTE ON dbo.SP_KhoaTaiKhoan TO DAO_TAO;
GRANT EXECUTE ON dbo.SP_TinhHocPhiSinhVien TO DAO_TAO;
GRANT EXECUTE ON dbo.SP_ThongKeHocPhi TO DAO_TAO;
GRANT EXECUTE ON dbo.SP_ThongKeHocPhiTheoLop TO DAO_TAO;
GRANT EXECUTE ON dbo.SP_XacNhanThanhToan TO DAO_TAO;
GRANT EXECUTE ON dbo.SP_TuChoiThanhToan TO DAO_TAO;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=203;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 203 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'-- Quản trị demo vẫn cần DML danh mục; giao dịch nhạy cảm dùng các procedure nghiệp vụ.
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.KHOA TO QUAN_TRI;
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.NGANH TO QUAN_TRI;
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.CHUONGTRINHDAOTAO TO QUAN_TRI;
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.MONHOC TO QUAN_TRI;
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.CTDT_MONHOC TO QUAN_TRI;
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.MONHOCTIENQUYET TO QUAN_TRI;
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.SINHVIEN TO QUAN_TRI;
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.GIANGVIEN TO QUAN_TRI;
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.TAIKHOAN TO QUAN_TRI;
GRANT SELECT, INSERT, UPDATE ON dbo.HOCKY TO QUAN_TRI;
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.LOPHOCPHAN TO QUAN_TRI;
GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.LICHHOC TO QUAN_TRI;
GRANT SELECT ON dbo.DANGKYTINCHI TO QUAN_TRI;
GRANT SELECT ON dbo.DIEMSO TO QUAN_TRI;
GRANT SELECT, INSERT, UPDATE ON dbo.MUCHOCPHI TO QUAN_TRI;
GRANT SELECT ON dbo.HOCPHI TO QUAN_TRI;
GRANT SELECT ON dbo.CHITIETTHANHTOAN TO QUAN_TRI;
GRANT SELECT ON dbo.LOGHOATDONG TO QUAN_TRI;
GRANT SELECT ON dbo.V_TaiKhoanNguoiDung TO QUAN_TRI;
GRANT SELECT ON dbo.V_CauTrucChuongTrinhDAOTAO TO QUAN_TRI;
GRANT SELECT ON dbo.V_ThoiKhoaBieuSinhVien TO QUAN_TRI;
GRANT SELECT ON dbo.V_BangDiemChiTiet TO QUAN_TRI;
GRANT SELECT ON dbo.V_HocPhiSinhVien TO QUAN_TRI;
GRANT EXECUTE ON dbo.SP_DangKyTinChi TO QUAN_TRI;
GRANT EXECUTE ON dbo.SP_HuyDangKy TO QUAN_TRI;
GRANT EXECUTE ON dbo.SP_TaoTaiKhoan TO QUAN_TRI;
GRANT EXECUTE ON dbo.SP_KhoaTaiKhoan TO QUAN_TRI;
GRANT EXECUTE ON dbo.SP_TinhHocPhiSinhVien TO QUAN_TRI;
GRANT EXECUTE ON dbo.SP_ThongKeHocPhi TO QUAN_TRI;
GRANT EXECUTE ON dbo.SP_ThongKeHocPhiTheoLop TO QUAN_TRI;
GRANT EXECUTE ON dbo.SP_XacNhanThanhToan TO QUAN_TRI;
GRANT EXECUTE ON dbo.SP_TuChoiThanhToan TO QUAN_TRI;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=204;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 204 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'-- Runtime receives read-only catalog access and explicitly named procedure permissions.
GRANT SELECT ON dbo.V_TaiKhoanNguoiDung TO APP_RUNTIME;
GRANT SELECT ON dbo.V_CauTrucChuongTrinhDAOTAO TO APP_RUNTIME;
GRANT SELECT ON dbo.V_ThoiKhoaBieuSinhVien TO APP_RUNTIME;
GRANT SELECT ON dbo.V_BangDiemChiTiet TO APP_RUNTIME;
GRANT SELECT ON dbo.V_HocPhiSinhVien TO APP_RUNTIME;
GRANT SELECT ON dbo.V_DanhSachLopSinhHoat TO APP_RUNTIME;
GRANT SELECT ON dbo.LOGHOATDONG TO APP_RUNTIME;
GRANT EXECUTE ON dbo.SP_DangKyTinChi TO APP_RUNTIME;
GRANT EXECUTE ON dbo.SP_HuyDangKy TO APP_RUNTIME;
GRANT EXECUTE ON dbo.SP_TaoTaiKhoan TO APP_RUNTIME;
GRANT EXECUTE ON dbo.SP_KhoaTaiKhoan TO APP_RUNTIME;
GRANT EXECUTE ON dbo.SP_TinhHocPhiSinhVien TO APP_RUNTIME;
GRANT EXECUTE ON dbo.SP_ThongKeHocPhi TO APP_RUNTIME;
GRANT EXECUTE ON dbo.SP_ThongKeHocPhiTheoLop TO APP_RUNTIME;
GRANT EXECUTE ON dbo.SP_XacNhanThanhToan TO APP_RUNTIME;
GRANT EXECUTE ON dbo.SP_TuChoiThanhToan TO APP_RUNTIME;
DENY SELECT ON dbo.TAIKHOAN TO APP_RUNTIME;
DENY INSERT, UPDATE, DELETE ON dbo.DANGKYTINCHI TO APP_RUNTIME;
DENY INSERT, UPDATE, DELETE ON dbo.DIEMSO TO APP_RUNTIME;
DENY INSERT, UPDATE, DELETE ON dbo.HOCPHI TO APP_RUNTIME;
DENY INSERT, UPDATE, DELETE ON dbo.CHITIETTHANHTOAN TO APP_RUNTIME;
DENY INSERT, UPDATE, DELETE ON dbo.LOGHOATDONG TO APP_RUNTIME;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=205;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 205 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'-- Map an already-provisioned low-privilege SQL login; this script never creates a password.
IF SUSER_ID(N''dbms_app'') IS NOT NULL AND DATABASE_PRINCIPAL_ID(N''dbms_app'') IS NULL
    CREATE USER dbms_app FOR LOGIN dbms_app;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=206;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 206 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'IF DATABASE_PRINCIPAL_ID(N''dbms_app'') IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sys.database_role_members WHERE role_principal_id=DATABASE_PRINCIPAL_ID(''APP_RUNTIME'') AND member_principal_id=DATABASE_PRINCIPAL_ID(''dbms_app''))
    ALTER ROLE APP_RUNTIME ADD MEMBER dbms_app;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=207;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 207 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'-- Principals without a login make role tests exercise SQL permissions safely.
IF DATABASE_PRINCIPAL_ID(N''dbms_test_student'') IS NULL CREATE USER dbms_test_student WITHOUT LOGIN;
IF DATABASE_PRINCIPAL_ID(N''dbms_test_lecturer'') IS NULL CREATE USER dbms_test_lecturer WITHOUT LOGIN;
IF DATABASE_PRINCIPAL_ID(N''dbms_test_training'') IS NULL CREATE USER dbms_test_training WITHOUT LOGIN;
IF DATABASE_PRINCIPAL_ID(N''dbms_test_admin'') IS NULL CREATE USER dbms_test_admin WITHOUT LOGIN;
IF DATABASE_PRINCIPAL_ID(N''dbms_test_runtime'') IS NULL CREATE USER dbms_test_runtime WITHOUT LOGIN;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=208;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 208 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'IF NOT EXISTS (SELECT 1 FROM sys.database_role_members WHERE role_principal_id=DATABASE_PRINCIPAL_ID(''SINH_VIEN'') AND member_principal_id=DATABASE_PRINCIPAL_ID(''dbms_test_student'')) ALTER ROLE SINH_VIEN ADD MEMBER dbms_test_student;
IF NOT EXISTS (SELECT 1 FROM sys.database_role_members WHERE role_principal_id=DATABASE_PRINCIPAL_ID(''GIANG_VIEN'') AND member_principal_id=DATABASE_PRINCIPAL_ID(''dbms_test_lecturer'')) ALTER ROLE GIANG_VIEN ADD MEMBER dbms_test_lecturer;
IF NOT EXISTS (SELECT 1 FROM sys.database_role_members WHERE role_principal_id=DATABASE_PRINCIPAL_ID(''DAO_TAO'') AND member_principal_id=DATABASE_PRINCIPAL_ID(''dbms_test_training'')) ALTER ROLE DAO_TAO ADD MEMBER dbms_test_training;
IF NOT EXISTS (SELECT 1 FROM sys.database_role_members WHERE role_principal_id=DATABASE_PRINCIPAL_ID(''QUAN_TRI'') AND member_principal_id=DATABASE_PRINCIPAL_ID(''dbms_test_admin'')) ALTER ROLE QUAN_TRI ADD MEMBER dbms_test_admin;
IF NOT EXISTS (SELECT 1 FROM sys.database_role_members WHERE role_principal_id=DATABASE_PRINCIPAL_ID(''APP_RUNTIME'') AND member_principal_id=DATABASE_PRINCIPAL_ID(''dbms_test_runtime'')) ALTER ROLE APP_RUNTIME ADD MEMBER dbms_test_runtime;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=209;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 209 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'DENY UPDATE, DELETE ON dbo.LOGHOATDONG TO SINH_VIEN;
DENY UPDATE, DELETE ON dbo.LOGHOATDONG TO GIANG_VIEN;
DENY UPDATE, DELETE ON dbo.LOGHOATDONG TO DAO_TAO;
DENY SELECT ON dbo.TAIKHOAN TO SINH_VIEN;
DENY SELECT ON dbo.TAIKHOAN TO GIANG_VIEN;
DENY SELECT ON dbo.TAIKHOAN (PasswordHash) TO DAO_TAO;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=210;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 210 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'-- =========================================================
-- HE THONG QUAN LY DANG KY TIN CHI DBMS330284 - SEED DATA
-- ENCODING: UTF-8 WITH BOM
-- =========================================================
USE [DBMS330284];';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=211;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 211 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=212;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 212 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'/* Thiet lap session context ban dau = NULL khi chua co TAIKHOAN */
EXEC sys.sp_set_session_context @key = N''MaTaiKhoan'', @value = NULL;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=213;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 213 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'/* Seed chỉ chạy trên database mới, trống. Không xóa hay reseed dữ liệu đang có. */
IF EXISTS (SELECT 1 FROM sys.tables t WHERE t.is_ms_shipped = 0 AND EXISTS
    (SELECT 1 FROM sys.partitions p WHERE p.object_id = t.object_id AND p.index_id IN (0, 1) AND p.rows > 0))
    THROW 52001, N''Seed bị từ chối: database không trống.'', 1;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=214;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 214 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'/* =========================================================
   1. DANH MUC KHOA (6 Khoa)
   ========================================================= */
INSERT INTO dbo.KHOA (MaKhoa, TenKhoa, Email, SoDienThoai, TrangThai)
VALUES
(''CNTT'', N''Khoa Công nghệ Thông tin'', ''cntt@university.edu.vn'', ''02838123001'', 1),
(''KTPM'', N''Khoa Kỹ thuật Phần mềm'', ''ktpm@university.edu.vn'', ''02838123002'', 1),
(''HTTT'', N''Khoa Hệ thống Thông tin'', ''httt@university.edu.vn'', ''02838123003'', 1),
(''KHMT'', N''Khoa Khoa học Máy tính'', ''khmt@university.edu.vn'', ''02838123004'', 1),
(''MMT'',  N''Khoa Mạng Máy tính & Truyền thông'', ''mmt@university.edu.vn'', ''02838123005'', 1),
(''ATTT'', N''Khoa An toàn Thông tin'', ''attt@university.edu.vn'', ''02838123006'', 1);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=215;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 215 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'/* =========================================================
   1.1 DANH MUC NGANH (7 Ngành đào tạo)
   ========================================================= */
INSERT INTO dbo.NGANH (MaNganh, MaKhoa, TenNganh, MoTa, TrangThai)
VALUES
(''N01'', ''CNTT'', N''Công nghệ thông tin'', N''Đào tạo kỹ sư CNTT tổng hợp'', 1),
(''N02'', ''KTPM'', N''Kỹ thuật phần mềm'', N''Đào tạo kỹ sư phát triển phần mềm chuyên nghiệp'', 1),
(''N03'', ''HTTT'', N''Hệ thống thông tin'', N''Đào tạo phân tích thiết kế và quản trị hệ thống thông tin'', 1),
(''N04'', ''KHMT'', N''Khoa học máy tính'', N''Đào tạo thuật toán, AI và xử lý dữ liệu lớn'', 1),
(''N05'', ''MMT'',  N''Mạng máy tính & Truyền thông'', N''Đào tạo hạ tầng mạng, điện toán đám mây và viễn thông'', 1),
(''N06'', ''ATTT'', N''An toàn thông tin'', N''Đào tạo bảo mật hệ thống và an ninh mạng'', 1),
(''N07'', ''HTTT'', N''Thương mại điện tử'', N''Đào tạo ứng dụng HTTT trong kinh doanh trực tuyến'', 1);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=216;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 216 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'/* =========================================================
   2. CHUONG TRINH DAO TAO (8 CTDT)
   ========================================================= */
INSERT INTO dbo.CHUONGTRINHDAOTAO (MaCTDT, MaNganh, TenCTDT, KhoaHoc, NamTuyenSinh, TongTinChiYeuCau, ThoiGianDaoTao, TrangThai)
VALUES
(''CTDT_CNTT_CQ'',  ''N01'', N''Công nghệ Thông tin Chuẩn'', ''2023-2027'',  2023, 135, 4, 1),
(''CTDT_CNTT_CLC'', ''N01'', N''Công nghệ Thông tin Chất lượng cao'', ''2023-2027'',  2023, 140, 4, 1),
(''CTDT_KTPM_CQ'',  ''N02'', N''Kỹ thuật Phần mềm Chuẩn'', ''2023-2027'',  2023, 135, 4, 1),
(''CTDT_HTTT_CQ'',  ''N03'', N''Hệ thống Thông tin Chuẩn'', ''2023-2027'',  2023, 132, 4, 1),
(''CTDT_KHMT_CQ'',  ''N04'', N''Khoa học Máy tính Chuẩn'', ''2023-2027'',  2023, 135, 4, 1),
(''CTDT_MMT_CQ'',   ''N05'', N''Mạng Máy tính Chuẩn'', ''2023-2027'',  2023, 132, 4, 1),
(''CTDT_ATTT_CQ'',  ''N06'', N''An toàn Thông tin Chuẩn'', ''2023-2027'',  2023, 135, 4, 1),
(''CTDT_TMDT_CQ'',  ''N07'', N''Thương mại Điện tử Chuẩn'', ''2023-2027'',  2023, 130, 4, 1);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=217;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 217 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'INSERT INTO dbo.CHUONGTRINHDAOTAO (MaCTDT, MaNganh, TenCTDT, KhoaHoc, NamTuyenSinh, TongTinChiYeuCau, ThoiGianDaoTao, TrangThai)
SELECT CONCAT(src.MaCTDT, ''_'', RIGHT(CONVERT(VARCHAR(4), cohort.NamTuyenSinh), 2)),
       src.MaNganh, src.TenCTDT, CONCAT(cohort.NamTuyenSinh, ''-'', cohort.NamTuyenSinh + 4),
       cohort.NamTuyenSinh, src.TongTinChiYeuCau, src.ThoiGianDaoTao, src.TrangThai
FROM dbo.CHUONGTRINHDAOTAO src
CROSS JOIN (VALUES (2024), (2025)) cohort(NamTuyenSinh);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=218;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 218 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'/* =========================================================
   3. DANH MUC MON HOC (50 Môn học)
   ========================================================= */
INSERT INTO dbo.MONHOC (MaMonHoc, MaKhoa, TenMonHoc, SoTinChi, SoTietLyThuyet, SoTietThucHanh, TrangThai)
VALUES
(''TRIET'', ''CNTT'', N''Triết học Mác - Lênin'', 3, 45, 0, 1),
(''TOAN1'', ''KHMT'', N''Giải tích 1'', 3, 45, 0, 1),
(''TOAN2'', ''KHMT'', N''Đại số tuyến tính'', 3, 45, 0, 1),
(''XSTK'', ''KHMT'', N''Xác suất thống kê ứng dụng'', 3, 45, 0, 1),
(''VLDC'', ''MMT'', N''Vật lý đại cương cho CNTT'', 3, 45, 0, 1),
(''NMLT'', ''CNTT'', N''Nhập môn lập trình'', 4, 45, 30, 1),
(''KTLT'', ''CNTT'', N''Kỹ thuật lập trình'', 4, 45, 30, 1),
(''CTDLGT'', ''CNTT'', N''Cấu trúc dữ liệu và giải thuật'', 4, 45, 30, 1),
(''CSDL'', ''HTTT'', N''Cơ sở dữ liệu'', 4, 45, 30, 1),
(''HQTCSDL'', ''HTTT'', N''Hệ quản trị cơ sở dữ liệu'', 4, 45, 30, 1),
(''KTMT'', ''KHMT'', N''Kiến trúc máy tính'', 3, 45, 0, 1),
(''HDH'', ''KHMT'', N''Hệ điều hành'', 3, 30, 30, 1),
(''MMT'', ''MMT'', N''Mạng máy tính cơ bản'', 3, 30, 30, 1),
(''OOP'', ''KTPM'', N''Lập trình hướng đối tượng'', 4, 45, 30, 1),
(''CNPM'', ''KTPM'', N''Công nghệ phần mềm'', 3, 45, 0, 1),
(''PTTKHT'', ''HTTT'', N''Phân tích thiết kế hệ thống thông tin'', 3, 45, 0, 1),
(''WEB1'', ''KTPM'', N''Lập trình Web cơ bản'', 3, 30, 30, 1),
(''WEB2'', ''KTPM'', N''Phát triển ứng dụng Web nâng cao'', 3, 30, 30, 1),
(''MOBILE'', ''KTPM'', N''Lập trình ứng dụng di động'', 3, 30, 30, 1),
(''TTNT'', ''KHMT'', N''Trí tuệ nhân tạo'', 3, 45, 0, 1),
(''HOCMAY'', ''KHMT'', N''Học máy và ứng dụng'', 3, 30, 30, 1),
(''ATBM'', ''ATTT'', N''An toàn và bảo mật thông tin'', 3, 45, 0, 1),
(''MATMA'', ''ATTT'', N''Mật mã học cơ sở'', 3, 45, 0, 1),
(''ATMANG'', ''ATTT'', N''An ninh mạng máy tính'', 3, 30, 30, 1),
(''DPT'', ''CNTT'', N''Công nghệ đa phương tiện'', 3, 30, 30, 1),
(''CLOUD'', ''MMT'', N''Điện toán đám mây'', 3, 30, 30, 1),
(''IOT'', ''MMT'', N''Internet vạn vật & Ứng dụng'', 3, 30, 30, 1),
(''KTKD'', ''KTPM'', N''Kiến trúc phần mềm doanh nghiệp'', 3, 45, 0, 1),
(''KTPMNC'', ''KTPM'', N''Kiểm thử phần mềm'', 3, 30, 30, 1),
(''QLDA'', ''KTPM'', N''Quản lý dự án phần mềm'', 3, 45, 0, 1),
(''BIGDATA'', ''HTTT'', N''Xử lý và phân tích dữ liệu lớn'', 3, 30, 30, 1),
(''DWBI'', ''HTTT'', N''Kho dữ liệu & Business Intelligence'', 3, 30, 30, 1),
(''TMDT'', ''HTTT'', N''Phát triển hệ thống Thương mại điện tử'', 3, 45, 0, 1),
(''KHDL'', ''KHMT'', N''Khai phá dữ liệu'', 3, 30, 30, 1),
(''XLA'', ''KHMT'', N''Xử lý ảnh kỹ thuật số'', 3, 30, 30, 1),
(''NLP'', ''KHMT'', N''Xử lý ngôn ngữ tự nhiên'', 3, 30, 30, 1),
(''DEVOPS'', ''KTPM'', N''Thực hành DevOps & CI/CD'', 3, 30, 30, 1),
(''FORENSIC'', ''ATTT'', N''Điều tra số & Khắc phục sự cố'', 3, 30, 30, 1),
(''ETHICAL'', ''ATTT'', N''Kiểm thử xâm nhập & Đạo đức bảo mật'', 3, 30, 30, 1),
(''LINUX'', ''MMT'', N''Quản trị hệ thống máy chủ Linux'', 3, 30, 30, 1),
(''ROUTING'', ''MMT'', N''Định tuyến và chuyển mạch nâng cao'', 3, 30, 30, 1),
(''BLOCKCHAIN'', ''CNTT'', N''Công nghệ Chuỗi khối căn bản'', 3, 45, 0, 1),
(''UIUX'', ''KTPM'', N''Thiết kế giao diện người dùng UI/UX'', 3, 30, 30, 1),
(''ERP'', ''HTTT'', N''Hệ thống hoạch định nguồn lực ERP'', 3, 45, 0, 1),
(''KTN'', ''CNTT'', N''Kỹ năng nghề nghiệp & Giao tiếp'', 2, 30, 0, 1),
(''ANHVAN1'', ''CNTT'', N''Tiếng Anh chuyên ngành 1'', 3, 45, 0, 1),
(''ANHVAN2'', ''CNTT'', N''Tiếng Anh chuyên ngành 2'', 3, 45, 0, 1),
(''TTNN'', ''CNTT'', N''Thực tập tốt nghiệp doanh nghiệp'', 2, 0, 60, 1),
(''DATN1'', ''CNTT'', N''Đồ án chuyên ngành'', 3, 15, 60, 1),
(''DATN2'', ''CNTT'', N''Khóa luận tốt nghiệp'', 5, 0, 150, 1);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=219;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 219 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'/* =========================================================
   4. CTDT_MONHOC (160 liên kết môn học - CTĐT)
   ========================================================= */
INSERT INTO dbo.CTDT_MONHOC (MaCTDT, MaMonHoc, HocKyDuKien, LoaiMon, ThuTu)
VALUES
(''CTDT_CNTT_CQ'', ''TRIET'', 1, ''BAT_BUOC'', 1),
(''CTDT_CNTT_CQ'', ''TOAN1'', 1, ''BAT_BUOC'', 2),
(''CTDT_CNTT_CQ'', ''TOAN2'', 1, ''BAT_BUOC'', 3),
(''CTDT_CNTT_CQ'', ''XSTK'', 2, ''BAT_BUOC'', 4),
(''CTDT_CNTT_CQ'', ''VLDC'', 2, ''BAT_BUOC'', 5),
(''CTDT_CNTT_CQ'', ''NMLT'', 2, ''BAT_BUOC'', 6),
(''CTDT_CNTT_CQ'', ''KTLT'', 3, ''BAT_BUOC'', 7),
(''CTDT_CNTT_CQ'', ''CTDLGT'', 3, ''BAT_BUOC'', 8),
(''CTDT_CNTT_CQ'', ''CSDL'', 3, ''BAT_BUOC'', 9),
(''CTDT_CNTT_CQ'', ''HQTCSDL'', 4, ''BAT_BUOC'', 10),
(''CTDT_CNTT_CQ'', ''KTMT'', 4, ''BAT_BUOC'', 11),
(''CTDT_CNTT_CQ'', ''HDH'', 4, ''BAT_BUOC'', 12),
(''CTDT_CNTT_CQ'', ''MMT'', 5, ''BAT_BUOC'', 13),
(''CTDT_CNTT_CQ'', ''OOP'', 5, ''BAT_BUOC'', 14),
(''CTDT_CNTT_CQ'', ''CNPM'', 5, ''BAT_BUOC'', 15),
(''CTDT_CNTT_CQ'', ''PTTKHT'', 6, ''TU_CHON'', 16),
(''CTDT_CNTT_CQ'', ''WEB1'', 6, ''TU_CHON'', 17),
(''CTDT_CNTT_CQ'', ''WEB2'', 6, ''TU_CHON'', 18),
(''CTDT_CNTT_CQ'', ''MOBILE'', 7, ''TU_CHON'', 19),
(''CTDT_CNTT_CQ'', ''TTNT'', 7, ''TU_CHON'', 20),
(''CTDT_CNTT_CLC'', ''TRIET'', 1, ''BAT_BUOC'', 1),
(''CTDT_CNTT_CLC'', ''TOAN1'', 1, ''BAT_BUOC'', 2),
(''CTDT_CNTT_CLC'', ''TOAN2'', 1, ''BAT_BUOC'', 3),
(''CTDT_CNTT_CLC'', ''XSTK'', 2, ''BAT_BUOC'', 4),
(''CTDT_CNTT_CLC'', ''VLDC'', 2, ''BAT_BUOC'', 5),
(''CTDT_CNTT_CLC'', ''NMLT'', 2, ''BAT_BUOC'', 6),
(''CTDT_CNTT_CLC'', ''KTLT'', 3, ''BAT_BUOC'', 7),
(''CTDT_CNTT_CLC'', ''CTDLGT'', 3, ''BAT_BUOC'', 8),
(''CTDT_CNTT_CLC'', ''CSDL'', 3, ''BAT_BUOC'', 9),
(''CTDT_CNTT_CLC'', ''HQTCSDL'', 4, ''BAT_BUOC'', 10),
(''CTDT_CNTT_CLC'', ''KTMT'', 4, ''BAT_BUOC'', 11),
(''CTDT_CNTT_CLC'', ''HDH'', 4, ''BAT_BUOC'', 12),
(''CTDT_CNTT_CLC'', ''MMT'', 5, ''BAT_BUOC'', 13),
(''CTDT_CNTT_CLC'', ''OOP'', 5, ''BAT_BUOC'', 14),
(''CTDT_CNTT_CLC'', ''CNPM'', 5, ''BAT_BUOC'', 15),
(''CTDT_CNTT_CLC'', ''PTTKHT'', 6, ''TU_CHON'', 16),
(''CTDT_CNTT_CLC'', ''WEB1'', 6, ''TU_CHON'', 17),
(''CTDT_CNTT_CLC'', ''WEB2'', 6, ''TU_CHON'', 18),
(''CTDT_CNTT_CLC'', ''MOBILE'', 7, ''TU_CHON'', 19),
(''CTDT_CNTT_CLC'', ''TTNT'', 7, ''TU_CHON'', 20),
(''CTDT_KTPM_CQ'', ''TRIET'', 1, ''BAT_BUOC'', 1),
(''CTDT_KTPM_CQ'', ''TOAN1'', 1, ''BAT_BUOC'', 2),
(''CTDT_KTPM_CQ'', ''TOAN2'', 1, ''BAT_BUOC'', 3),
(''CTDT_KTPM_CQ'', ''XSTK'', 2, ''BAT_BUOC'', 4),
(''CTDT_KTPM_CQ'', ''VLDC'', 2, ''BAT_BUOC'', 5),
(''CTDT_KTPM_CQ'', ''NMLT'', 2, ''BAT_BUOC'', 6),
(''CTDT_KTPM_CQ'', ''KTLT'', 3, ''BAT_BUOC'', 7),
(''CTDT_KTPM_CQ'', ''CTDLGT'', 3, ''BAT_BUOC'', 8),
(''CTDT_KTPM_CQ'', ''CSDL'', 3, ''BAT_BUOC'', 9),
(''CTDT_KTPM_CQ'', ''HQTCSDL'', 4, ''BAT_BUOC'', 10),
(''CTDT_KTPM_CQ'', ''KTMT'', 4, ''BAT_BUOC'', 11),
(''CTDT_KTPM_CQ'', ''HDH'', 4, ''BAT_BUOC'', 12),
(''CTDT_KTPM_CQ'', ''MMT'', 5, ''BAT_BUOC'', 13),
(''CTDT_KTPM_CQ'', ''OOP'', 5, ''BAT_BUOC'', 14),
(''CTDT_KTPM_CQ'', ''CNPM'', 5, ''BAT_BUOC'', 15),
(''CTDT_KTPM_CQ'', ''PTTKHT'', 6, ''TU_CHON'', 16),
(''CTDT_KTPM_CQ'', ''WEB1'', 6, ''TU_CHON'', 17),
(''CTDT_KTPM_CQ'', ''WEB2'', 6, ''TU_CHON'', 18),
(''CTDT_KTPM_CQ'', ''MOBILE'', 7, ''TU_CHON'', 19),
(''CTDT_KTPM_CQ'', ''TTNT'', 7, ''TU_CHON'', 20),
(''CTDT_HTTT_CQ'', ''TRIET'', 1, ''BAT_BUOC'', 1),
(''CTDT_HTTT_CQ'', ''TOAN1'', 1, ''BAT_BUOC'', 2),
(''CTDT_HTTT_CQ'', ''TOAN2'', 1, ''BAT_BUOC'', 3),
(''CTDT_HTTT_CQ'', ''XSTK'', 2, ''BAT_BUOC'', 4),
(''CTDT_HTTT_CQ'', ''VLDC'', 2, ''BAT_BUOC'', 5),
(''CTDT_HTTT_CQ'', ''NMLT'', 2, ''BAT_BUOC'', 6),
(''CTDT_HTTT_CQ'', ''KTLT'', 3, ''BAT_BUOC'', 7),
(''CTDT_HTTT_CQ'', ''CTDLGT'', 3, ''BAT_BUOC'', 8),
(''CTDT_HTTT_CQ'', ''CSDL'', 3, ''BAT_BUOC'', 9),
(''CTDT_HTTT_CQ'', ''HQTCSDL'', 4, ''BAT_BUOC'', 10),
(''CTDT_HTTT_CQ'', ''KTMT'', 4, ''BAT_BUOC'', 11),
(''CTDT_HTTT_CQ'', ''HDH'', 4, ''BAT_BUOC'', 12),
(''CTDT_HTTT_CQ'', ''MMT'', 5, ''BAT_BUOC'', 13),
(''CTDT_HTTT_CQ'', ''OOP'', 5, ''BAT_BUOC'', 14),
(''CTDT_HTTT_CQ'', ''CNPM'', 5, ''BAT_BUOC'', 15),
(''CTDT_HTTT_CQ'', ''PTTKHT'', 6, ''TU_CHON'', 16),
(''CTDT_HTTT_CQ'', ''WEB1'', 6, ''TU_CHON'', 17),
(''CTDT_HTTT_CQ'', ''WEB2'', 6, ''TU_CHON'', 18),
(''CTDT_HTTT_CQ'', ''MOBILE'', 7, ''TU_CHON'', 19),
(''CTDT_HTTT_CQ'', ''TTNT'', 7, ''TU_CHON'', 20),
(''CTDT_KHMT_CQ'', ''TRIET'', 1, ''BAT_BUOC'', 1),
(''CTDT_KHMT_CQ'', ''TOAN1'', 1, ''BAT_BUOC'', 2),
(''CTDT_KHMT_CQ'', ''TOAN2'', 1, ''BAT_BUOC'', 3),
(''CTDT_KHMT_CQ'', ''XSTK'', 2, ''BAT_BUOC'', 4),
(''CTDT_KHMT_CQ'', ''VLDC'', 2, ''BAT_BUOC'', 5),
(''CTDT_KHMT_CQ'', ''NMLT'', 2, ''BAT_BUOC'', 6),
(''CTDT_KHMT_CQ'', ''KTLT'', 3, ''BAT_BUOC'', 7),
(''CTDT_KHMT_CQ'', ''CTDLGT'', 3, ''BAT_BUOC'', 8),
(''CTDT_KHMT_CQ'', ''CSDL'', 3, ''BAT_BUOC'', 9),
(''CTDT_KHMT_CQ'', ''HQTCSDL'', 4, ''BAT_BUOC'', 10),
(''CTDT_KHMT_CQ'', ''KTMT'', 4, ''BAT_BUOC'', 11),
(''CTDT_KHMT_CQ'', ''HDH'', 4, ''BAT_BUOC'', 12),
(''CTDT_KHMT_CQ'', ''MMT'', 5, ''BAT_BUOC'', 13),
(''CTDT_KHMT_CQ'', ''OOP'', 5, ''BAT_BUOC'', 14),
(''CTDT_KHMT_CQ'', ''CNPM'', 5, ''BAT_BUOC'', 15),
(''CTDT_KHMT_CQ'', ''PTTKHT'', 6, ''TU_CHON'', 16),
(''CTDT_KHMT_CQ'', ''WEB1'', 6, ''TU_CHON'', 17),
(''CTDT_KHMT_CQ'', ''WEB2'', 6, ''TU_CHON'', 18),
(''CTDT_KHMT_CQ'', ''MOBILE'', 7, ''TU_CHON'', 19),
(''CTDT_KHMT_CQ'', ''TTNT'', 7, ''TU_CHON'', 20),
(''CTDT_MMT_CQ'', ''TRIET'', 1, ''BAT_BUOC'', 1),
(''CTDT_MMT_CQ'', ''TOAN1'', 1, ''BAT_BUOC'', 2),
(''CTDT_MMT_CQ'', ''TOAN2'', 1, ''BAT_BUOC'', 3),
(''CTDT_MMT_CQ'', ''XSTK'', 2, ''BAT_BUOC'', 4),
(''CTDT_MMT_CQ'', ''VLDC'', 2, ''BAT_BUOC'', 5),
(''CTDT_MMT_CQ'', ''NMLT'', 2, ''BAT_BUOC'', 6),
(''CTDT_MMT_CQ'', ''KTLT'', 3, ''BAT_BUOC'', 7),
(''CTDT_MMT_CQ'', ''CTDLGT'', 3, ''BAT_BUOC'', 8),
(''CTDT_MMT_CQ'', ''CSDL'', 3, ''BAT_BUOC'', 9),
(''CTDT_MMT_CQ'', ''HQTCSDL'', 4, ''BAT_BUOC'', 10),
(''CTDT_MMT_CQ'', ''KTMT'', 4, ''BAT_BUOC'', 11),
(''CTDT_MMT_CQ'', ''HDH'', 4, ''BAT_BUOC'', 12),
(''CTDT_MMT_CQ'', ''MMT'', 5, ''BAT_BUOC'', 13),
(''CTDT_MMT_CQ'', ''OOP'', 5, ''BAT_BUOC'', 14),
(''CTDT_MMT_CQ'', ''CNPM'', 5, ''BAT_BUOC'', 15),
(''CTDT_MMT_CQ'', ''PTTKHT'', 6, ''TU_CHON'', 16),
(''CTDT_MMT_CQ'', ''WEB1'', 6, ''TU_CHON'', 17),
(''CTDT_MMT_CQ'', ''WEB2'', 6, ''TU_CHON'', 18),
(''CTDT_MMT_CQ'', ''MOBILE'', 7, ''TU_CHON'', 19),
(''CTDT_MMT_CQ'', ''TTNT'', 7, ''TU_CHON'', 20),
(''CTDT_ATTT_CQ'', ''TRIET'', 1, ''BAT_BUOC'', 1),
(''CTDT_ATTT_CQ'', ''TOAN1'', 1, ''BAT_BUOC'', 2),
(''CTDT_ATTT_CQ'', ''TOAN2'', 1, ''BAT_BUOC'', 3),
(''CTDT_ATTT_CQ'', ''XSTK'', 2, ''BAT_BUOC'', 4),
(''CTDT_ATTT_CQ'', ''VLDC'', 2, ''BAT_BUOC'', 5),
(''CTDT_ATTT_CQ'', ''NMLT'', 2, ''BAT_BUOC'', 6),
(''CTDT_ATTT_CQ'', ''KTLT'', 3, ''BAT_BUOC'', 7),
(''CTDT_ATTT_CQ'', ''CTDLGT'', 3, ''BAT_BUOC'', 8),
(''CTDT_ATTT_CQ'', ''CSDL'', 3, ''BAT_BUOC'', 9),
(''CTDT_ATTT_CQ'', ''HQTCSDL'', 4, ''BAT_BUOC'', 10),
(''CTDT_ATTT_CQ'', ''KTMT'', 4, ''BAT_BUOC'', 11),
(''CTDT_ATTT_CQ'', ''HDH'', 4, ''BAT_BUOC'', 12),
(''CTDT_ATTT_CQ'', ''MMT'', 5, ''BAT_BUOC'', 13),
(''CTDT_ATTT_CQ'', ''OOP'', 5, ''BAT_BUOC'', 14),
(''CTDT_ATTT_CQ'', ''CNPM'', 5, ''BAT_BUOC'', 15),
(''CTDT_ATTT_CQ'', ''PTTKHT'', 6, ''TU_CHON'', 16),
(''CTDT_ATTT_CQ'', ''WEB1'', 6, ''TU_CHON'', 17),
(''CTDT_ATTT_CQ'', ''WEB2'', 6, ''TU_CHON'', 18),
(''CTDT_ATTT_CQ'', ''MOBILE'', 7, ''TU_CHON'', 19),
(''CTDT_ATTT_CQ'', ''TTNT'', 7, ''TU_CHON'', 20),
(''CTDT_TMDT_CQ'', ''TRIET'', 1, ''BAT_BUOC'', 1),
(''CTDT_TMDT_CQ'', ''TOAN1'', 1, ''BAT_BUOC'', 2),
(''CTDT_TMDT_CQ'', ''TOAN2'', 1, ''BAT_BUOC'', 3),
(''CTDT_TMDT_CQ'', ''XSTK'', 2, ''BAT_BUOC'', 4),
(''CTDT_TMDT_CQ'', ''VLDC'', 2, ''BAT_BUOC'', 5),
(''CTDT_TMDT_CQ'', ''NMLT'', 2, ''BAT_BUOC'', 6),
(''CTDT_TMDT_CQ'', ''KTLT'', 3, ''BAT_BUOC'', 7),
(''CTDT_TMDT_CQ'', ''CTDLGT'', 3, ''BAT_BUOC'', 8),
(''CTDT_TMDT_CQ'', ''CSDL'', 3, ''BAT_BUOC'', 9),
(''CTDT_TMDT_CQ'', ''HQTCSDL'', 4, ''BAT_BUOC'', 10),
(''CTDT_TMDT_CQ'', ''KTMT'', 4, ''BAT_BUOC'', 11),
(''CTDT_TMDT_CQ'', ''HDH'', 4, ''BAT_BUOC'', 12),
(''CTDT_TMDT_CQ'', ''MMT'', 5, ''BAT_BUOC'', 13),
(''CTDT_TMDT_CQ'', ''OOP'', 5, ''BAT_BUOC'', 14),
(''CTDT_TMDT_CQ'', ''CNPM'', 5, ''BAT_BUOC'', 15),
(''CTDT_TMDT_CQ'', ''PTTKHT'', 6, ''TU_CHON'', 16),
(''CTDT_TMDT_CQ'', ''WEB1'', 6, ''TU_CHON'', 17),
(''CTDT_TMDT_CQ'', ''WEB2'', 6, ''TU_CHON'', 18),
(''CTDT_TMDT_CQ'', ''MOBILE'', 7, ''TU_CHON'', 19),
(''CTDT_TMDT_CQ'', ''TTNT'', 7, ''TU_CHON'', 20);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=220;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 220 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'INSERT INTO dbo.CTDT_MONHOC (MaCTDT, MaMonHoc, HocKyDuKien, LoaiMon, ThuTu)
SELECT CONCAT(ctm.MaCTDT, ''_'', RIGHT(CONVERT(VARCHAR(4), cohort.NamTuyenSinh), 2)),
       ctm.MaMonHoc, ctm.HocKyDuKien, ctm.LoaiMon, ctm.ThuTu
FROM dbo.CTDT_MONHOC ctm
CROSS JOIN (VALUES (2024), (2025)) cohort(NamTuyenSinh);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=221;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 221 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'/* =========================================================
   5. MONHOCTIENQUYET (36 quan hệ chuẩn, không chu trình)
   ========================================================= */
INSERT INTO dbo.MONHOCTIENQUYET (MaMonHoc, MaMonTienQuyet, MucDo)
VALUES
(''KTLT'', ''NMLT'', ''BAT_BUOC''),
(''CTDLGT'', ''KTLT'', ''BAT_BUOC''),
(''OOP'', ''KTLT'', ''BAT_BUOC''),
(''CSDL'', ''NMLT'', ''BAT_BUOC''),
(''HQTCSDL'', ''CSDL'', ''BAT_BUOC''),
(''HDH'', ''KTMT'', ''BAT_BUOC''),
(''MMT'', ''KTMT'', ''BAT_BUOC''),
(''CNPM'', ''OOP'', ''BAT_BUOC''),
(''PTTKHT'', ''CSDL'', ''BAT_BUOC''),
(''WEB1'', ''NMLT'', ''BAT_BUOC''),
(''WEB2'', ''WEB1'', ''BAT_BUOC''),
(''MOBILE'', ''OOP'', ''BAT_BUOC''),
(''TTNT'', ''CTDLGT'', ''BAT_BUOC''),
(''HOCMAY'', ''TTNT'', ''BAT_BUOC''),
(''ATBM'', ''MMT'', ''BAT_BUOC''),
(''MATMA'', ''TOAN2'', ''BAT_BUOC''),
(''ATMANG'', ''ATBM'', ''BAT_BUOC''),
(''CLOUD'', ''MMT'', ''BAT_BUOC''),
(''IOT'', ''MMT'', ''BAT_BUOC''),
(''KTKD'', ''CNPM'', ''BAT_BUOC''),
(''KTPMNC'', ''CNPM'', ''BAT_BUOC''),
(''QLDA'', ''CNPM'', ''BAT_BUOC''),
(''BIGDATA'', ''HQTCSDL'', ''BAT_BUOC''),
(''DWBI'', ''HQTCSDL'', ''BAT_BUOC''),
(''TMDT'', ''CSDL'', ''BAT_BUOC''),
(''KHDL'', ''HQTCSDL'', ''BAT_BUOC''),
(''XLA'', ''TOAN2'', ''BAT_BUOC''),
(''NLP'', ''TTNT'', ''BAT_BUOC''),
(''DEVOPS'', ''LINUX'', ''BAT_BUOC''),
(''LINUX'', ''HDH'', ''BAT_BUOC''),
(''ROUTING'', ''MMT'', ''BAT_BUOC''),
(''FORENSIC'', ''ATBM'', ''BAT_BUOC''),
(''ETHICAL'', ''ATBM'', ''BAT_BUOC''),
(''ANHVAN2'', ''ANHVAN1'', ''BAT_BUOC''),
(''DATN1'', ''TTNN'', ''BAT_BUOC''),
(''DATN2'', ''DATN1'', ''BAT_BUOC'');';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=222;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 222 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'/* =========================================================
   6. HOCKY (7 Học kỳ từ 2023 đến 2027)
   ========================================================= */
INSERT INTO dbo.HOCKY (NamHoc, TenHocKy, NgayBatDau, NgayKetThuc, NgayMoDangKy, NgayDongDangKy, TrangThai)
VALUES
(''2023-2024'', N''Học kỳ 1'', ''2023-09-01'', ''2024-01-31'', ''2023-08-15 00:00:00'', ''2023-08-25 23:59:59'', ''KET_THUC''),
(''2023-2024'', N''Học kỳ 2'', ''2024-02-15'', ''2024-06-30'', ''2024-01-20 00:00:00'', ''2024-01-30 23:59:59'', ''KET_THUC''),
(''2024-2025'', N''Học kỳ 1'', ''2024-09-01'', ''2025-01-31'', ''2024-08-15 00:00:00'', ''2024-08-25 23:59:59'', ''KET_THUC''),
(''2024-2025'', N''Học kỳ 2'', ''2025-02-15'', ''2025-06-30'', ''2025-01-20 00:00:00'', ''2025-01-30 23:59:59'', ''KET_THUC''),
(''2025-2026'', N''Học kỳ 1'', ''2025-09-01'', ''2026-01-31'', ''2025-08-15 00:00:00'', ''2025-08-25 23:59:59'', ''KET_THUC''),
(''2025-2026'', N''Học kỳ 2'', ''2026-02-15'', ''2026-06-30'', ''2026-01-20 00:00:00'', ''2026-01-30 23:59:59'', ''KET_THUC''),
(''2026-2027'', N''Học kỳ 1'', ''2026-09-01'', ''2027-01-31'', ''2026-08-15 00:00:00'', ''2027-01-31 23:59:59'', ''DANG_MO'');';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=223;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 223 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'/* =========================================================
   7. MUCHOCPHI (7 Mức học phí theo từng học kỳ)
   ========================================================= */

INSERT INTO dbo.MUCHOCPHI (MaHocKy, PhamViApDung, DonGiaTinChi, NgayHieuLuc, NgayHetHieuLuc, TrangThai)
SELECT
    hk.MaHocKy,
    ''TOAN_TRUONG'',
    val.DonGia,
    val.NgayHL,
    val.NgayHHL,
    ''ACTIVE''
FROM dbo.HOCKY hk
INNER JOIN (VALUES
    (''2023-2024'', N''Học kỳ 1'', 450000.00, ''2023-08-01'', ''2024-01-31''),
    (''2023-2024'', N''Học kỳ 2'', 450000.00, ''2024-02-01'', ''2024-06-30''),
    (''2024-2025'', N''Học kỳ 1'', 480000.00, ''2024-08-01'', ''2025-01-31''),
    (''2024-2025'', N''Học kỳ 2'', 480000.00, ''2025-02-01'', ''2025-06-30''),
    (''2025-2026'', N''Học kỳ 1'', 520000.00, ''2025-08-01'', ''2026-01-31''),
    (''2025-2026'', N''Học kỳ 2'', 520000.00, ''2026-02-01'', ''2026-06-30''),
    (''2026-2027'', N''Học kỳ 1'', 550000.00, ''2026-08-01'', ''2027-01-31'')
) AS val(NamHoc, TenHocKy, DonGia, NgayHL, NgayHHL)
    ON val.NamHoc = hk.NamHoc AND val.TenHocKy = hk.TenHocKy;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=224;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 224 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'/* =========================================================
   8. GIANGVIEN (25 Giảng viên)
   ========================================================= */
INSERT INTO dbo.GIANGVIEN (MaGiangVien, HoTen, Email, SoDienThoai, MaKhoa, TrangThai, NgayTao)
VALUES
(''GV0001'', N''Nguyễn Văn An'', ''an.nguyen@university.edu.vn'', ''0901234001'', ''CNTT'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00''),
(''GV0002'', N''Trần Thị Bích'', ''bich.tran@university.edu.vn'', ''0901234002'', ''CNTT'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00''),
(''GV0003'', N''Lê Hoàng Cường'', ''cuong.le@university.edu.vn'', ''0901234003'', ''CNTT'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00''),
(''GV0004'', N''Phạm Minh Dũng'', ''dung.pham@university.edu.vn'', ''0901234004'', ''CNTT'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00''),
(''GV0005'', N''Hoàng Thanh Giang'', ''giang.hoang@university.edu.vn'', ''0901234005'', ''KTPM'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00''),
(''GV0006'', N''Vũ Hải Đăng'', ''dang.vu@university.edu.vn'', ''0901234006'', ''KTPM'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00''),
(''GV0007'', N''Đặng Quốc Hùng'', ''hung.dang@university.edu.vn'', ''0901234007'', ''KTPM'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00''),
(''GV0008'', N''Bùi Anh Khoa'', ''khoa.bui@university.edu.vn'', ''0901234008'', ''KTPM'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00''),
(''GV0009'', N''Đỗ Phương Linh'', ''linh.do@university.edu.vn'', ''0901234009'', ''HTTT'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00''),
(''GV0010'', N''Hồ Bảo Long'', ''long.ho@university.edu.vn'', ''0901234010'', ''HTTT'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00''),
(''GV0011'', N''Ngô Quang Minh'', ''minh.ngo@university.edu.vn'', ''0901234011'', ''HTTT'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00''),
(''GV0012'', N''Dương Hoài Nam'', ''nam.duong@university.edu.vn'', ''0901234012'', ''HTTT'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00''),
(''GV0013'', N''Lý Vĩnh Phúc'', ''phuc.ly@university.edu.vn'', ''0901234013'', ''KHMT'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00''),
(''GV0014'', N''Mai Hồng Quân'', ''quan.mai@university.edu.vn'', ''0901234014'', ''KHMT'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00''),
(''GV0015'', N''Trịnh Thế Sơn'', ''son.trinh@university.edu.vn'', ''0901234015'', ''KHMT'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00''),
(''GV0016'', N''Đinh Hữu Tâm'', ''tam.dinh@university.edu.vn'', ''0901234016'', ''KHMT'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00''),
(''GV0017'', N''Phan Chiến Thắng'', ''thang.phan@university.edu.vn'', ''0901234017'', ''MMT'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00''),
(''GV0018'', N''Võ Đức Toàn'', ''toan.vo@university.edu.vn'', ''0901234018'', ''MMT'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00''),
(''GV0019'', N''Cao Thành Trung'', ''trung.cao@university.edu.vn'', ''0901234019'', ''MMT'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00''),
(''GV0020'', N''Lâm Minh Tú'', ''tu.lam@university.edu.vn'', ''0901234020'', ''MMT'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00''),
(''GV0021'', N''Hà Anh Tuấn'', ''tuan.ha@university.edu.vn'', ''0901234021'', ''ATTT'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00''),
(''GV0022'', N''Tạ Quốc Việt'', ''viet.ta@university.edu.vn'', ''0901234022'', ''ATTT'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00''),
(''GV0023'', N''Lương Thảo Vy'', ''vy.luong@university.edu.vn'', ''0901234023'', ''ATTT'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00''),
(''GV0024'', N''Phùng Khắc Huy'', ''huy.phung@university.edu.vn'', ''0901234024'', ''ATTT'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00''),
(''GV0025'', N''Trương Mỹ Duyên'', ''duyen.truong@university.edu.vn'', ''0901234025'', ''CNTT'', ''DANG_CONG_TAC'', ''2023-01-15 08:00:00'');';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=225;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 225 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'/* =========================================================
   8.1. LOP (36 Lớp sinh hoạt: 6 khoa x 3 khóa x 2 lớp)
   ========================================================= */
INSERT INTO dbo.LOP (MaLop, TenLop, MaKhoa, KhoaHoc, NamNhapHoc, TrangThai)
VALUES
(''CNTT23_01'', N''Công nghệ Thông tin 2023 - Lớp 01'', ''CNTT'', ''2023-2027'', 2023, 1),
(''CNTT23_02'', N''Công nghệ Thông tin 2023 - Lớp 02'', ''CNTT'', ''2023-2027'', 2023, 1),
(''CNTT24_01'', N''Công nghệ Thông tin 2024 - Lớp 01'', ''CNTT'', ''2024-2028'', 2024, 1),
(''CNTT24_02'', N''Công nghệ Thông tin 2024 - Lớp 02'', ''CNTT'', ''2024-2028'', 2024, 1),
(''CNTT25_01'', N''Công nghệ Thông tin 2025 - Lớp 01'', ''CNTT'', ''2025-2029'', 2025, 1),
(''CNTT25_02'', N''Công nghệ Thông tin 2025 - Lớp 02'', ''CNTT'', ''2025-2029'', 2025, 1),

(''KTPM23_01'', N''Kỹ thuật Phần mềm 2023 - Lớp 01'', ''KTPM'', ''2023-2027'', 2023, 1),
(''KTPM23_02'', N''Kỹ thuật Phần mềm 2023 - Lớp 02'', ''KTPM'', ''2023-2027'', 2023, 1),
(''KTPM24_01'', N''Kỹ thuật Phần mềm 2024 - Lớp 01'', ''KTPM'', ''2024-2028'', 2024, 1),
(''KTPM24_02'', N''Kỹ thuật Phần mềm 2024 - Lớp 02'', ''KTPM'', ''2024-2028'', 2024, 1),
(''KTPM25_01'', N''Kỹ thuật Phần mềm 2025 - Lớp 01'', ''KTPM'', ''2025-2029'', 2025, 1),
(''KTPM25_02'', N''Kỹ thuật Phần mềm 2025 - Lớp 02'', ''KTPM'', ''2025-2029'', 2025, 1),

(''HTTT23_01'', N''Hệ thống Thông tin 2023 - Lớp 01'', ''HTTT'', ''2023-2027'', 2023, 1),
(''HTTT23_02'', N''Hệ thống Thông tin 2023 - Lớp 02'', ''HTTT'', ''2023-2027'', 2023, 1),
(''HTTT24_01'', N''Hệ thống Thông tin 2024 - Lớp 01'', ''HTTT'', ''2024-2028'', 2024, 1),
(''HTTT24_02'', N''Hệ thống Thông tin 2024 - Lớp 02'', ''HTTT'', ''2024-2028'', 2024, 1),
(''HTTT25_01'', N''Hệ thống Thông tin 2025 - Lớp 01'', ''HTTT'', ''2025-2029'', 2025, 1),
(''HTTT25_02'', N''Hệ thống Thông tin 2025 - Lớp 02'', ''HTTT'', ''2025-2029'', 2025, 1),

(''KHMT23_01'', N''Khoa học Máy tính 2023 - Lớp 01'', ''KHMT'', ''2023-2027'', 2023, 1),
(''KHMT23_02'', N''Khoa học Máy tính 2023 - Lớp 02'', ''KHMT'', ''2023-2027'', 2023, 1),
(''KHMT24_01'', N''Khoa học Máy tính 2024 - Lớp 01'', ''KHMT'', ''2024-2028'', 2024, 1),
(''KHMT24_02'', N''Khoa học Máy tính 2024 - Lớp 02'', ''KHMT'', ''2024-2028'', 2024, 1),
(''KHMT25_01'', N''Khoa học Máy tính 2025 - Lớp 01'', ''KHMT'', ''2025-2029'', 2025, 1),
(''KHMT25_02'', N''Khoa học Máy tính 2025 - Lớp 02'', ''KHMT'', ''2025-2029'', 2025, 1),

(''MMT23_01'', N''Mạng máy tính & Truyền thông 2023 - Lớp 01'', ''MMT'', ''2023-2027'', 2023, 1),
(''MMT23_02'', N''Mạng máy tính & Truyền thông 2023 - Lớp 02'', ''MMT'', ''2023-2027'', 2023, 1),
(''MMT24_01'', N''Mạng máy tính & Truyền thông 2024 - Lớp 01'', ''MMT'', ''2024-2028'', 2024, 1),
(''MMT24_02'', N''Mạng máy tính & Truyền thông 2024 - Lớp 02'', ''MMT'', ''2024-2028'', 2024, 1),
(''MMT25_01'', N''Mạng máy tính & Truyền thông 2025 - Lớp 01'', ''MMT'', ''2025-2029'', 2025, 1),
(''MMT25_02'', N''Mạng máy tính & Truyền thông 2025 - Lớp 02'', ''MMT'', ''2025-2029'', 2025, 1),

(''ATTT23_01'', N''An toàn Thông tin 2023 - Lớp 01'', ''ATTT'', ''2023-2027'', 2023, 1),
(''ATTT23_02'', N''An toàn Thông tin 2023 - Lớp 02'', ''ATTT'', ''2023-2027'', 2023, 1),
(''ATTT24_01'', N''An toàn Thông tin 2024 - Lớp 01'', ''ATTT'', ''2024-2028'', 2024, 1),
(''ATTT24_02'', N''An toàn Thông tin 2024 - Lớp 02'', ''ATTT'', ''2024-2028'', 2024, 1),
(''ATTT25_01'', N''An toàn Thông tin 2025 - Lớp 01'', ''ATTT'', ''2025-2029'', 2025, 1),
(''ATTT25_02'', N''An toàn Thông tin 2025 - Lớp 02'', ''ATTT'', ''2025-2029'', 2025, 1);';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=226;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 226 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'/* =========================================================
   9. SINHVIEN (1.500 Sinh viên thực tế: Khóa 23, 24, 25)
   ========================================================= */

;WITH
HoList AS (
    SELECT id, Ho FROM (VALUES
        (0, N''Nguyễn''), (1, N''Trần''), (2, N''Lê''), (3, N''Phạm''), (4, N''Hoàng''),
        (5, N''Huỳnh''), (6, N''Phan''), (7, N''Vũ''), (8, N''Võ''), (9, N''Đặng''),
        (10, N''Bùi''), (11, N''Đỗ''), (12, N''Hồ''), (13, N''Ngô''), (14, N''Dương'')
    ) AS t(id, Ho)
),
DemList AS (
    SELECT id, Dem FROM (VALUES
        (0, N''Văn''), (1, N''Thị''), (2, N''Minh''), (3, N''Hoàng''), (4, N''Đức''),
        (5, N''Hữu''), (6, N''Tuấn''), (7, N''Thanh''), (8, N''Anh''), (9, N''Quang''),
        (10, N''Bảo''), (11, N''Thảo''), (12, N''Ngọc''), (13, N''Xuân''), (14, N''Hải'')
    ) AS t(id, Dem)
),
TenList AS (
    SELECT id, Ten FROM (VALUES
        (0, N''An''), (1, N''Bình''), (2, N''Cường''), (3, N''Dũng''), (4, N''Giang''),
        (5, N''Hải''), (6, N''Hùng''), (7, N''Khoa''), (8, N''Linh''), (9, N''Long''),
        (10, N''Minh''), (11, N''Nam''), (12, N''Phúc''), (13, N''Quân''), (14, N''Sơn''),
        (15, N''Tâm''), (16, N''Thắng''), (17, N''Toàn''), (18, N''Trung''), (19, N''Tú''),
        (20, N''Tuấn''), (21, N''Việt''), (22, N''Vy''), (23, N''Trang''), (24, N''Huy'')
    ) AS t(id, Ten)
),
KhoaSeq AS (
    SELECT id, MaKhoa FROM (VALUES
        (0, ''CNTT''), (1, ''KTPM''), (2, ''HTTT''), (3, ''KHMT''), (4, ''MMT''), (5, ''ATTT'')
    ) AS t(id, MaKhoa)
),
Nums AS (
    SELECT TOP (1500) ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS n
    FROM sys.all_columns a CROSS JOIN sys.all_columns b
),
RawSV AS (
    SELECT
        n,
        CASE
            WHEN n <= 500 THEN ''23''
            WHEN n <= 1000 THEN ''24''
            ELSE ''25''
        END AS KhoaTuyen,
        RIGHT(''00000'' + CAST(n AS VARCHAR), 6) AS SttStr,
        k.MaKhoa,
        h.Ho + N'' '' + d.Dem + N'' '' + t.Ten AS HoTen,
        DATEADD(DAY, (n * 37) % 1400, ''2004-01-01'') AS NgaySinh,
        CASE
            WHEN n <= 500 THEN ''2023-08-10 09:00:00''
            WHEN n <= 1000 THEN ''2024-08-10 09:00:00''
            ELSE ''2025-08-10 09:00:00''
        END AS NgayTao,
        CASE
            WHEN n IN (495, 496, 497, 498, 499, 500, 998, 999, 1000) THEN ''BAO_LUU''
            WHEN n BETWEEN 460 AND 485 THEN ''TOT_NGHIEP''
            WHEN n IN (488, 489, 988) THEN ''THOI_HOC''
            ELSE ''DANG_HOC''
        END AS TrangThai,
        CASE WHEN NTILE(2) OVER (PARTITION BY k.MaKhoa, CASE WHEN n <= 500 THEN ''23'' WHEN n <= 1000 THEN ''24'' ELSE ''25'' END ORDER BY n) = 1 THEN ''01'' ELSE ''02'' END AS LopNhom,
        CASE WHEN k.MaKhoa = ''CNTT'' AND NTILE(2) OVER (PARTITION BY k.MaKhoa, CASE WHEN n <= 500 THEN ''23'' WHEN n <= 1000 THEN ''24'' ELSE ''25'' END ORDER BY n) = 2 THEN ''CTDT_CNTT_CLC''
             WHEN k.MaKhoa = ''CNTT'' THEN ''CTDT_CNTT_CQ''
             WHEN k.MaKhoa = ''KTPM'' THEN ''CTDT_KTPM_CQ''
             WHEN k.MaKhoa = ''HTTT'' AND NTILE(2) OVER (PARTITION BY k.MaKhoa, CASE WHEN n <= 500 THEN ''23'' WHEN n <= 1000 THEN ''24'' ELSE ''25'' END ORDER BY n) = 2 THEN ''CTDT_TMDT_CQ''
             WHEN k.MaKhoa = ''HTTT'' THEN ''CTDT_HTTT_CQ''
             WHEN k.MaKhoa = ''KHMT'' THEN ''CTDT_KHMT_CQ''
             WHEN k.MaKhoa = ''MMT'' THEN ''CTDT_MMT_CQ'' ELSE ''CTDT_ATTT_CQ'' END AS MaCTDTGoc
    FROM Nums
    CROSS APPLY (SELECT (n * 7) % 15 AS hid) h1
    INNER JOIN HoList h ON h.id = h1.hid
    CROSS APPLY (SELECT (n * 11) % 15 AS did) d1
    INNER JOIN DemList d ON d.id = d1.did
    CROSS APPLY (SELECT (n * 13) % 25 AS tid) t1
    INNER JOIN TenList t ON t.id = t1.tid
    CROSS APPLY (SELECT (n % 6) AS kid) k1
    INNER JOIN KhoaSeq k ON k.id = k1.kid
)
INSERT INTO dbo.SINHVIEN (MaSinhVien, HoTen, NgaySinh, Email, SoDienThoai, MaKhoa, MaLop, MaCTDT, TrangThai, NgayTao)
SELECT
    KhoaTuyen + SttStr AS MaSinhVien,
    HoTen,
    NgaySinh,
    ''sv'' + KhoaTuyen + SttStr + ''@student.edu.vn'' AS Email,
    ''098'' + RIGHT(''0000000'' + CAST(n AS VARCHAR), 7) AS SoDienThoai,
    MaKhoa,
    MaKhoa + KhoaTuyen + ''_'' + LopNhom,
    CASE WHEN KhoaTuyen = ''23'' THEN MaCTDTGoc ELSE MaCTDTGoc + ''_'' + KhoaTuyen END,
    TrangThai,
    NgayTao
FROM RawSV;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=227;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 227 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'/* =========================================================
   10. TAIKHOAN (Admin, Dao tao, Giang vien, Sinh vien)
   ========================================================= */

-- 1. Tai khoan QUAN_TRI va DAO_TAO
INSERT INTO dbo.TAIKHOAN (Username, PasswordHash, VaiTro, TrangThai, MaSV, MaGV, NgayTao, LanDangNhapCuoi)
VALUES
(''admin'', ''8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'', ''QUAN_TRI'', ''ACTIVE'', NULL, NULL, ''2023-01-01'', ''2026-10-07 14:00:00''),
(''quantri01'', ''8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'', ''QUAN_TRI'', ''ACTIVE'', NULL, NULL, ''2023-01-01'', ''2026-10-06 09:30:00''),
(''daotao01'', ''8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'', ''DAO_TAO'', ''ACTIVE'', NULL, NULL, ''2023-01-01'', ''2026-10-08 08:15:00''),
(''daotao02'', ''8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'', ''DAO_TAO'', ''ACTIVE'', NULL, NULL, ''2023-01-01'', ''2026-09-30 11:20:00'');

-- 2. Tai khoan GIANG_VIEN
INSERT INTO dbo.TAIKHOAN (Username, PasswordHash, VaiTro, TrangThai, MaSV, MaGV, NgayTao, LanDangNhapCuoi)
SELECT
    ''gv_'' + LOWER(MaGiangVien),
    ''8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'',
    ''GIANG_VIEN'',
    ''ACTIVE'',
    NULL,
    MaGV,
    NgayTao,
    DATEADD(DAY, -((MaGV * 3) % 20), ''2026-10-08'')
FROM dbo.GIANGVIEN;

-- 3. Tai khoan SINH_VIEN (1.500 sinh vien)
INSERT INTO dbo.TAIKHOAN (Username, PasswordHash, VaiTro, TrangThai, MaSV, MaGV, NgayTao, LanDangNhapCuoi)
SELECT
    ''sv_'' + MaSinhVien,
    ''8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'',
    ''SINH_VIEN'',
    CASE
        WHEN TrangThai = ''THOI_HOC'' THEN ''DISABLED''
        WHEN TrangThai = ''BAO_LUU'' THEN ''LOCKED''
        ELSE ''ACTIVE''
    END,
    MaSV,
    NULL,
    NgayTao,
    DATEADD(DAY, -((MaSV * 7) % 45), ''2026-10-08'')
FROM dbo.SINHVIEN;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=228;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 228 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'/* Seed/bảo trì không giả lập người dùng đã xác thực trong audit log. */
EXEC sys.sp_set_session_context @key = N''MaTaiKhoan'', @value = NULL;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=229;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 229 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'/* =========================================================
   11. LOPHOCPHAN (588 Lớp học phần: 7 học kỳ x 84 lớp)
   ========================================================= */

;WITH
SemesterOrdered AS (
    SELECT MaHocKy,
           ROW_NUMBER() OVER(ORDER BY NgayBatDau) AS SemesterSeq,
           CAST(''DA_KHOA'' AS VARCHAR(20)) AS TrangThaiLHP
    FROM dbo.HOCKY
),
SelectedCourses AS (
    -- 42 mon hoc mo lop, moi mon mo 2 lop = 84 lop / hoc ky
    SELECT MaMonHoc, TenMonHoc, ROW_NUMBER() OVER(ORDER BY MaMonHoc) AS Seq
    FROM dbo.MONHOC
    WHERE MaMonHoc IN (
        ''TRIET'',''TOAN1'',''TOAN2'',''XSTK'',''VLDC'',''NMLT'',''KTLT'',''CTDLGT'',
        ''CSDL'',''HQTCSDL'',''KTMT'',''HDH'',''MMT'',''OOP'',''CNPM'',''PTTKHT'',
        ''WEB1'',''WEB2'',''MOBILE'',''TTNT'',''HOCMAY'',''ATBM'',''MATMA'',''ATMANG'',
        ''CLOUD'',''IOT'',''KTKD'',''KTPMNC'',''QLDA'',''BIGDATA'',''TMDT'',''KHDL'',
        ''LINUX'',''ROUTING'',''UIUX'',''ANHVAN1'',''ANHVAN2'',''XLA'',''NLP'',''DEVOPS'',
        ''FORENSIC'',''ETHICAL''
    )
),
ClassExpanded AS (
    SELECT
        s.MaHocKy,
        s.SemesterSeq,
        s.TrangThaiLHP,
        c.MaMonHoc,
        c.TenMonHoc,
        cls.LopIdx,
        -- Danh so thu tu lop hoc phan trong hoc ky: 1..84
        ((c.Seq - 1) * 2 + cls.LopIdx) AS SlotId
    FROM SemesterOrdered s
    CROSS JOIN SelectedCourses c
    CROSS JOIN (VALUES (1), (2)) AS cls(LopIdx)
),
GV_Numbered AS (
    SELECT MaGV, ROW_NUMBER() OVER(ORDER BY MaGV) AS GV_Seq
    FROM dbo.GIANGVIEN
)
INSERT INTO dbo.LOPHOCPHAN (MaLHP, MaMonHoc, MaHocKy, MaGiangVien, TenLHP, SoLuongToiDa, TrangThai)
SELECT
    ''LHP_HK'' + CAST(s.SemesterSeq AS VARCHAR) + ''_'' + s.MaMonHoc + ''_0'' + CAST(s.LopIdx AS VARCHAR) AS MaLHP,
    s.MaMonHoc,
    s.MaHocKy,
    gv.MaGV AS MaGiangVien,
    s.TenMonHoc + N'' - Lớp 0'' + CAST(s.LopIdx AS VARCHAR) + '' (HK'' + CAST(s.SemesterSeq AS VARCHAR) + '')'' AS TenLHP,
    120 AS SoLuongToiDa,
    s.TrangThaiLHP
FROM ClassExpanded s
-- Gan giang vien theo cong thuc dong bo voi TimeSlot de khong bao gio bi trung gio giang day
INNER JOIN GV_Numbered gv
    ON gv.GV_Seq = ((( (s.SlotId - 1) % 24 ) + ((s.SlotId - 1) / 24) * 6 + s.SemesterSeq ) % 25) + 1;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=230;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 230 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'/* =========================================================
   12. LICHHOC (Phân bổ phòng và giờ học không xung đột BR05)
   ========================================================= */

;WITH
LHP_Numbered AS (
    SELECT
        MaLHP,
        MaHocKy,
        MaGiangVien,
        ROW_NUMBER() OVER(PARTITION BY MaHocKy ORDER BY MaLHP) AS SlotId
    FROM dbo.LOPHOCPHAN
),
RoomList AS (
    SELECT rId, RoomName FROM (VALUES
        (0, ''A101''), (1, ''A102''), (2, ''A201''), (3, ''A202''),
        (4, ''B101''), (5, ''B102''), (6, ''B201''), (7, ''B202''),
        (8, ''C101''), (9, ''C102''), (10, ''C201''), (11, ''C202'')
    ) AS r(rId, RoomName)
),
ScheduleSlots AS (
    SELECT
        l.MaLHP,
        l.MaHocKy,
        l.SlotId,
        -- Thu: 2..7 (6 ngay trong tuan)
        (2 + ((l.SlotId - 1) % 6)) AS Thu,
        -- Ca hoc: 1, 4, 7, 10
        CASE (((l.SlotId - 1) % 24) / 6)
            WHEN 0 THEN 1
            WHEN 1 THEN 4
            WHEN 2 THEN 7
            ELSE 10
        END AS TietBatDau,
        3 AS SoTiet,
        rm.RoomName AS PhongHoc
    FROM LHP_Numbered l
    INNER JOIN RoomList rm
        ON rm.rId = ((l.SlotId - 1) / 24)
)
INSERT INTO dbo.LICHHOC (MaLHP, Thu, TietBatDau, SoTiet, PhongHoc)
SELECT
    MaLHP,
    Thu,
    TietBatDau,
    SoTiet,
    PhongHoc
FROM ScheduleSlots;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=231;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 231 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'UPDATE lhp
SET TrangThai = ''MO_DANG_KY''
FROM dbo.LOPHOCPHAN lhp
INNER JOIN dbo.HOCKY hk ON hk.MaHocKy = lhp.MaHocKy
WHERE hk.TrangThai = ''DANG_MO'';';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=232;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 232 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'/* =========================================================
   13. DANGKYTINCHI (~52.000 bản ghi qua 7 học kỳ)
   ========================================================= */

;WITH
SemesterOrdered AS (
    SELECT MaHocKy, NgayMoDangKy,
           ROW_NUMBER() OVER(ORDER BY NgayBatDau) AS SemesterSeq
    FROM dbo.HOCKY
),
SV_Semester AS (
    -- Khóa 23 học HK 1..7 (nếu DANG_HOC hoặc TOT_NGHIEP)
    -- Khóa 24 học HK 3..7
    -- Khóa 25 học HK 5..7
    SELECT s.MaSV, h.MaHocKy, h.NgayMoDangKy,
           ROW_NUMBER() OVER(PARTITION BY h.MaHocKy ORDER BY s.MaSV) AS SV_Seq
    FROM dbo.SINHVIEN s
    CROSS JOIN SemesterOrdered h
    WHERE s.TrangThai IN (''DANG_HOC'', ''TOT_NGHIEP'')
      AND (
          (s.MaSinhVien LIKE ''23%'' AND h.SemesterSeq BETWEEN 1 AND 7) OR
          (s.MaSinhVien LIKE ''24%'' AND h.SemesterSeq BETWEEN 3 AND 7) OR
          (s.MaSinhVien LIKE ''25%'' AND h.SemesterSeq BETWEEN 5 AND 7)
      )
),
LHP_Numbered AS (
    SELECT
        MaLHP,
        MaHocKy,
        ROW_NUMBER() OVER(PARTITION BY MaHocKy ORDER BY MaLHP) AS LHP_Seq
    FROM dbo.LOPHOCPHAN
),
Enrollments AS (
    -- Mỗi sinh viên đăng ký 6 lớp trong mỗi học kỳ theo công thức phân bổ đều
    SELECT
        sv.MaSV,
        lhp.MaLHP,
        DATEADD(MINUTE, (sv.MaSV * 17 + k * 13) % 14000, sv.NgayMoDangKy) AS NgayDangKy,
        CASE
            WHEN (sv.MaSV + k) % 30 = 0 THEN ''CANCELLED''
            ELSE ''REGISTERED''
        END AS TrangThai
    FROM SV_Semester sv
    CROSS JOIN (VALUES (0), (1), (2), (3), (4), (5)) AS sub(k)
    INNER JOIN LHP_Numbered lhp
        ON lhp.MaHocKy = sv.MaHocKy
       AND lhp.LHP_Seq = (((sv.SV_Seq * 5 + k * 11) % 84) + 1)
)
INSERT INTO dbo.DANGKYTINCHI (MaSV, MaLHP, NgayDangKy, TrangThai)
SELECT DISTINCT MaSV, MaLHP, NgayDangKy, TrangThai
FROM Enrollments;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=233;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 233 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'/* =========================================================
   14. DIEMSO (~42.000 bản ghi cho các học kỳ lịch sử 1..6)
   ========================================================= */

;WITH
SemesterOrdered AS (
    SELECT MaHocKy, ROW_NUMBER() OVER(ORDER BY NgayBatDau) AS SemesterSeq
    FROM dbo.HOCKY
),
CompletedRegistrations AS (
    SELECT
        dk.MaDangKy,
        dk.MaSV,
        lhp.MaHocKy
    FROM dbo.DANGKYTINCHI dk
    INNER JOIN dbo.LOPHOCPHAN lhp ON lhp.MaLHP = dk.MaLHP
    INNER JOIN SemesterOrdered sem ON sem.MaHocKy = lhp.MaHocKy
    WHERE dk.TrangThai = ''REGISTERED''
      AND sem.SemesterSeq BETWEEN 1 AND 6 -- Chi cho diem cac hoc ky da ket thuc
),
GradeGen AS (
    SELECT
        MaDangKy,
        -- Tao pho diem phong phu: ~85% dat (>= 5.0), ~15% rot (< 5.0)
        CASE
            WHEN (MaDangKy % 10) = 0 THEN 3.0 + ((MaDangKy % 15) * 0.1) -- Diem rot
            WHEN (MaDangKy % 7) = 0 THEN 8.5 + ((MaDangKy % 15) * 0.1)  -- Diem gioi (A)
            WHEN (MaDangKy % 3) = 0 THEN 7.0 + ((MaDangKy % 15) * 0.1)  -- Diem kha (B)
            ELSE 5.5 + ((MaDangKy % 20) * 0.1)                          -- Diem trung binh
        END AS BaseQT,
        CASE
            WHEN (MaDangKy % 10) = 0 THEN 3.5 + ((MaDangKy % 12) * 0.1)
            WHEN (MaDangKy % 7) = 0 THEN 8.0 + ((MaDangKy % 20) * 0.1)
            WHEN (MaDangKy % 3) = 0 THEN 7.2 + ((MaDangKy % 15) * 0.1)
            ELSE 6.0 + ((MaDangKy % 20) * 0.1)
        END AS BaseGK,
        CASE
            WHEN (MaDangKy % 10) = 0 THEN 2.5 + ((MaDangKy % 20) * 0.1)
            WHEN (MaDangKy % 7) = 0 THEN 9.0 + ((MaDangKy % 10) * 0.1)
            WHEN (MaDangKy % 3) = 0 THEN 7.0 + ((MaDangKy % 18) * 0.1)
            ELSE 6.2 + ((MaDangKy % 18) * 0.1)
        END AS BaseCK
    FROM CompletedRegistrations
)
INSERT INTO dbo.DIEMSO (MaDangKy, DiemQuaTrinh, DiemGiuaKy, DiemCuoiKy, TyTrongQT, TyTrongGK, TyTrongCK)
SELECT
    MaDangKy,
    CAST(CASE WHEN BaseQT > 10.0 THEN 10.0 WHEN BaseQT < 0 THEN 0 ELSE BaseQT END AS DECIMAL(4,2)),
    CAST(CASE WHEN BaseGK > 10.0 THEN 10.0 WHEN BaseGK < 0 THEN 0 ELSE BaseGK END AS DECIMAL(4,2)),
    CAST(CASE WHEN BaseCK > 10.0 THEN 10.0 WHEN BaseCK < 0 THEN 0 ELSE BaseCK END AS DECIMAL(4,2)),
    20, 30, 50
FROM GradeGen;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=234;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 234 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'/* =========================================================
   15. HOCPHI (~7.400 hồ sơ học phí theo từng sinh viên & học kỳ)
   ========================================================= */

;WITH
StudentCredits AS (
    SELECT
        dk.MaSV,
        lhp.MaHocKy,
        SUM(CAST(mh.SoTinChi AS INT)) AS TongTinChi
    FROM dbo.DANGKYTINCHI dk
    INNER JOIN dbo.LOPHOCPHAN lhp ON lhp.MaLHP = dk.MaLHP
    INNER JOIN dbo.MONHOC mh ON mh.MaMonHoc = lhp.MaMonHoc
    WHERE dk.TrangThai = ''REGISTERED''
    GROUP BY dk.MaSV, lhp.MaHocKy
)
INSERT INTO dbo.HOCPHI (MaSV, MaHocKy, MaMucHocPhi, SoTinChi, DonGiaTinChi, TongTien, SoTienDaThanhToan, TrangThai, NgayCapNhat)
SELECT
    sc.MaSV,
    sc.MaHocKy,
    mph.MaMucHocPhi,
    sc.TongTinChi,
    mph.DonGiaTinChi,
    CAST(sc.TongTinChi * mph.DonGiaTinChi AS DECIMAL(14,2)) AS TongTien,
    0.00 AS SoTienDaThanhToan,
    ''UNPAID'' AS TrangThai,
    DATEADD(DAY, 10, hk.NgayMoDangKy) AS NgayCapNhat
FROM StudentCredits sc
INNER JOIN dbo.HOCKY hk ON hk.MaHocKy = sc.MaHocKy
INNER JOIN dbo.MUCHOCPHI mph ON mph.MaHocKy = sc.MaHocKy AND mph.TrangThai = ''ACTIVE''
WHERE NOT (sc.MaSV = 1500 AND hk.TrangThai = ''DANG_MO'');';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=235;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 235 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'/* =========================================================
   16. CHITIETTHANHTOAN (Thanh toán nhiều đợt, Trigger tự đồng bộ)
   ========================================================= */

-- Dot 1: Thanh toan lan dau (Tat ca cac ho so tru 10% chua nop)
-- 50% dong 100%, 40% dong 50%, 10% chua dong
INSERT INTO dbo.CHITIETTHANHTOAN (MaHocPhi, SoTien, NgayThanhToan, PhuongThuc, TrangThai)
SELECT
    hp.MaHocPhi,
    CASE
        WHEN hp.MaHocPhi % 10 BETWEEN 0 AND 4 THEN hp.TongTien           -- Dong du 100%
        ELSE CAST(hp.TongTien * 0.50 AS DECIMAL(14,2))                  -- Dong 50%
    END AS SoTien,
    DATEADD(DAY, 12 + (hp.MaHocPhi % 15), hk.NgayMoDangKy) AS NgayThanhToan,
    CASE WHEN hp.MaHocPhi % 2 = 0 THEN ''CHUYEN_KHOAN'' ELSE ''TIEN_MAT'' END AS PhuongThuc,
    ''DA_XAC_NHAN'' AS TrangThai
FROM dbo.HOCPHI hp
INNER JOIN dbo.HOCKY hk ON hk.MaHocKy = hp.MaHocKy
WHERE (hp.MaHocPhi % 10) <> 9; -- 10% chua dong gi

-- Dot 2: Nop them 25% cho mot nua so ho so dang tra gop
INSERT INTO dbo.CHITIETTHANHTOAN (MaHocPhi, SoTien, NgayThanhToan, PhuongThuc, TrangThai)
SELECT
    hp.MaHocPhi,
    CAST(hp.TongTien * 0.25 AS DECIMAL(14,2)) AS SoTien,
    DATEADD(DAY, 28 + (hp.MaHocPhi % 10), hk.NgayMoDangKy) AS NgayThanhToan,
    ''CHUYEN_KHOAN'' AS PhuongThuc,
    ''DA_XAC_NHAN'' AS TrangThai
FROM dbo.HOCPHI hp
INNER JOIN dbo.HOCKY hk ON hk.MaHocKy = hp.MaHocKy
WHERE (hp.MaHocPhi % 10 BETWEEN 5 AND 8) -- Cac ho so da dong 50% o dot 1
  AND (hp.MaHocPhi % 2) = 0;

-- Dong bo SoTienDaThanhToan va TrangThai cua HOCPHI dam bao toan ven truoc khi tao Trigger
;WITH PaymentAgg AS (
    SELECT
        MaHocPhi,
        SUM(SoTien) AS TongDaNop
    FROM dbo.CHITIETTHANHTOAN
    GROUP BY MaHocPhi
)
UPDATE hp
SET
    hp.SoTienDaThanhToan = ISNULL(p.TongDaNop, 0.00),
    hp.TrangThai = CASE
        WHEN ISNULL(p.TongDaNop, 0.00) = 0 THEN ''UNPAID''
        WHEN ISNULL(p.TongDaNop, 0.00) >= hp.TongTien THEN ''PAID''
        ELSE ''PARTIAL''
    END
FROM dbo.HOCPHI hp
LEFT JOIN PaymentAgg p ON hp.MaHocPhi = p.MaHocPhi;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=236;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 236 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'/* =========================================================
   17. SEED AUDIT LOG LỊCH SỬ (LOGHOATDONG: >100.000 records)
   ========================================================= */

-- 1. Log dang ky tin chi tu DANGKYTINCHI (~44.500 rows)
INSERT INTO dbo.LOGHOATDONG (MaTaiKhoan, ThoiGian, HanhDong, TenBang, KhoaBanGhi, NoiDungCu, NoiDungMoi)
SELECT
    tk.MaTaiKhoan,
    DATEADD(SECOND, (dk.MaDangKy * 97) % (3 * 365 * 86400), ''2023-08-15 08:00:00''),
    ''INSERT'',
    ''DANGKYTINCHI'',
    CAST(dk.MaDangKy AS NVARCHAR(100)),
    NULL,
    N''{"MaSV":'' + CAST(dk.MaSV AS NVARCHAR) + N'',"MaLHP":"'' + dk.MaLHP + N''","TrangThai":"'' + dk.TrangThai + N''"}''
FROM dbo.DANGKYTINCHI dk
INNER JOIN dbo.TAIKHOAN tk ON tk.MaSV = dk.MaSV;

-- 2. Log cham diem tu DIEMSO (~34.400 rows)
INSERT INTO dbo.LOGHOATDONG (MaTaiKhoan, ThoiGian, HanhDong, TenBang, KhoaBanGhi, NoiDungCu, NoiDungMoi)
SELECT
    tk.MaTaiKhoan,
    DATEADD(SECOND, (ds.MaDangKy * 101) % (3 * 365 * 86400), ''2023-09-01 08:00:00''),
    ''INSERT'',
    ''DIEMSO'',
    CAST(ds.MaDangKy AS NVARCHAR(100)),
    NULL,
    N''{"MaDangKy":'' + CAST(ds.MaDangKy AS NVARCHAR) + N'',"DiemQT":'' + CAST(ds.DiemQuaTrinh AS NVARCHAR) + N'',"DiemGK":'' + CAST(ds.DiemGiuaKy AS NVARCHAR) + N'',"DiemCK":'' + CAST(ds.DiemCuoiKy AS NVARCHAR) + N''}''
FROM dbo.DIEMSO ds
CROSS JOIN (SELECT TOP (1) MaTaiKhoan FROM dbo.TAIKHOAN WHERE VaiTro = ''DAO_TAO'') tk;

-- 3. Log thanh toan hoc phi tu CHITIETTHANHTOAN (~8.100 rows)
INSERT INTO dbo.LOGHOATDONG (MaTaiKhoan, ThoiGian, HanhDong, TenBang, KhoaBanGhi, NoiDungCu, NoiDungMoi)
SELECT
    tk.MaTaiKhoan,
    CAST(ct.NgayThanhToan AS DATETIME2(7)),
    ''INSERT'',
    ''CHITIETTHANHTOAN'',
    CAST(ct.MaThanhToan AS NVARCHAR(100)),
    NULL,
    N''{"MaHocPhi":'' + CAST(ct.MaHocPhi AS NVARCHAR) + N'',"SoTien":'' + CAST(ct.SoTien AS NVARCHAR) + N'',"PhuongThuc":"'' + ct.PhuongThuc + N''"}''
FROM dbo.CHITIETTHANHTOAN ct
INNER JOIN dbo.HOCPHI hp ON hp.MaHocPhi = ct.MaHocPhi
INNER JOIN dbo.TAIKHOAN tk ON tk.MaSV = hp.MaSV;

-- 4. Log cap nhat trang thai tu HOCPHI (~7.400 rows)
INSERT INTO dbo.LOGHOATDONG (MaTaiKhoan, ThoiGian, HanhDong, TenBang, KhoaBanGhi, NoiDungCu, NoiDungMoi)
SELECT
    tk.MaTaiKhoan,
    DATEADD(DAY, 15, hk.NgayMoDangKy),
    ''UPDATE'',
    ''HOCPHI'',
    CAST(hp.MaHocPhi AS NVARCHAR(100)),
    N''{"TrangThai":"UNPAID","SoTienDaThanhToan":0.00}'',
    N''{"TrangThai":"'' + hp.TrangThai + N''","SoTienDaThanhToan":'' + CAST(hp.SoTienDaThanhToan AS NVARCHAR) + N''}''
FROM dbo.HOCPHI hp
INNER JOIN dbo.HOCKY hk ON hk.MaHocKy = hp.MaHocKy
INNER JOIN dbo.TAIKHOAN tk ON tk.MaSV = hp.MaSV;

-- 5. Log cap nhat hoat dong TAIKHOAN (~20.000 rows)
;WITH AccountUpdates AS (
    SELECT TOP (20000)
        tk.MaTaiKhoan,
        ROW_NUMBER() OVER(ORDER BY (SELECT NULL)) AS rn
    FROM dbo.TAIKHOAN tk
    CROSS JOIN (VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),(15)) v(i)
)
INSERT INTO dbo.LOGHOATDONG (MaTaiKhoan, ThoiGian, HanhDong, TenBang, KhoaBanGhi, NoiDungCu, NoiDungMoi)
SELECT
    l.MaTaiKhoan,
    DATEADD(MINUTE, (l.rn * 17) % (3 * 365 * 1440), ''2023-08-10 07:00:00''),
    ''UPDATE'',
    ''TAIKHOAN'',
    CAST(l.MaTaiKhoan AS NVARCHAR(100)),
    N''{"TrangThai":"ACTIVE"}'',
    N''{"TrangThai":"ACTIVE","LanDangNhap":'' + CAST(l.rn AS NVARCHAR) + N''}''
FROM AccountUpdates l;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=237;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 237 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'/* =========================================================
   18. TỔNG KẾT DỮ LIỆU SEED TRONG HỆ THỐNG
   ========================================================= */

SELECT
    t.name AS TenBang,
    SUM(p.rows) AS [SoLuongBanGhi]
FROM sys.tables t
INNER JOIN sys.partitions p
    ON p.object_id = t.object_id
   AND p.index_id IN (0, 1)
WHERE t.schema_id = SCHEMA_ID(N''dbo'')
GROUP BY t.name
ORDER BY t.name;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=238;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 238 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'PRINT N''============================================================'';
PRINT N''SEED DATA HOAN TAT THANH CONG!'';
PRINT N''============================================================'';';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=239;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 239 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'USE [DBMS330284];';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=240;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 240 THROW 52102, N'Build dung an toan do batch truoc that bai hoac database khong o trang thai moi.', 1;
DECLARE @BuildBatch nvarchar(max) = N'SET NOCOUNT ON;
IF (SELECT COUNT(*) FROM sys.tables WHERE is_ms_shipped = 0) <> 19 THROW 52010, N''Sai số lượng bảng; mong đợi 19.'', 1;
IF (SELECT COUNT(*) FROM sys.views WHERE is_ms_shipped = 0) < 6 THROW 52011, N''Thiếu view.'', 1;
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE is_disabled = 1 OR is_not_trusted = 1) THROW 52012, N''Có FK bị tắt hoặc chưa trusted.'', 1;
IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE is_disabled = 1 OR is_not_trusted = 1) THROW 52013, N''Có CHECK constraint bị tắt hoặc chưa trusted.'', 1;
IF EXISTS (SELECT 1 FROM sys.triggers WHERE parent_class = 1 AND is_disabled = 1) THROW 52014, N''Có trigger bảng bị tắt.'', 1;
IF (SELECT COUNT(*) FROM dbo.CHUONGTRINHDAOTAO) <> 24 THROW 52015, N''Mong đợi 24 CTĐT cho ba khóa.'', 1;
IF EXISTS (SELECT 1 FROM dbo.SINHVIEN sv INNER JOIN dbo.LOP l ON l.MaLop=sv.MaLop INNER JOIN dbo.CHUONGTRINHDAOTAO c ON c.MaCTDT=sv.MaCTDT INNER JOIN dbo.NGANH n ON n.MaNganh=c.MaNganh WHERE sv.MaKhoa<>l.MaKhoa OR sv.MaKhoa<>n.MaKhoa OR l.NamNhapHoc<>c.NamTuyenSinh) THROW 52016, N''Sinh viên có CTĐT/khoa/khóa không nhất quán.'', 1;
IF EXISTS (SELECT 1 FROM dbo.HOCPHI hp INNER JOIN dbo.MUCHOCPHI m ON m.MaMucHocPhi=hp.MaMucHocPhi WHERE hp.MaHocKy<>m.MaHocKy) THROW 52017, N''Hồ sơ học phí tham chiếu sai học kỳ mức phí.'', 1;
SELECT ''PASS'' AS Result, DB_NAME() AS DatabaseName,
       (SELECT COUNT(*) FROM sys.tables WHERE is_ms_shipped=0) AS Tables,
       (SELECT COUNT(*) FROM sys.views WHERE is_ms_shipped=0) AS Views,
       (SELECT COUNT(*) FROM sys.procedures WHERE is_ms_shipped=0) AS Procedures,
       (SELECT COUNT(*) FROM sys.triggers WHERE parent_class=1 AND is_disabled=0) AS EnabledTableTriggers,
       (SELECT COUNT(*) FROM dbo.CHUONGTRINHDAOTAO) AS Curricula,
       (SELECT COUNT(*) FROM dbo.SINHVIEN) AS Students;';
BEGIN TRY
    EXEC sys.sp_executesql @BuildBatch;
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=241;';
END TRY
BEGIN CATCH
    EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_updateextendedproperty @name=N''DBMS330284_BuildState'', @value=-1;';
    THROW;
END CATCH;
GO
DECLARE @BuildState int; SELECT @BuildState = TRY_CONVERT(int, value) FROM [DBMS330284].sys.extended_properties WHERE class = 0 AND name = N'DBMS330284_BuildState';
IF @BuildState IS NULL OR @BuildState <> 241 THROW 52103, N'Build chua hoan tat; khong the xoa dau vet kiem soat.', 1;
EXEC sys.sp_executesql N'USE [DBMS330284]; EXEC sys.sp_dropextendedproperty @name=N''DBMS330284_BuildState'';';
PRINT N'Da tao xong CSDL DBMS330284 va nap du lieu mau.';
