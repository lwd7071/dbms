USE [DBMS330284];
GO
SET NOCOUNT ON;
IF (SELECT COUNT(*) FROM sys.tables WHERE is_ms_shipped = 0) <> 19 THROW 52010, N'Sai số lượng bảng; mong đợi 19.', 1;
IF (SELECT COUNT(*) FROM sys.views WHERE is_ms_shipped = 0) < 6 THROW 52011, N'Thiếu view.', 1;
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE is_disabled = 1 OR is_not_trusted = 1) THROW 52012, N'Có FK bị tắt hoặc chưa trusted.', 1;
IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE is_disabled = 1 OR is_not_trusted = 1) THROW 52013, N'Có CHECK constraint bị tắt hoặc chưa trusted.', 1;
IF EXISTS (SELECT 1 FROM sys.triggers WHERE parent_class = 1 AND is_disabled = 1) THROW 52014, N'Có trigger bảng bị tắt.', 1;
IF (SELECT COUNT(*) FROM dbo.CHUONGTRINHDAOTAO) <> 24 THROW 52015, N'Mong đợi 24 CTĐT cho ba khóa.', 1;
IF EXISTS (SELECT 1 FROM dbo.SINHVIEN sv INNER JOIN dbo.LOP l ON l.MaLop=sv.MaLop INNER JOIN dbo.CHUONGTRINHDAOTAO c ON c.MaCTDT=sv.MaCTDT INNER JOIN dbo.NGANH n ON n.MaNganh=c.MaNganh WHERE sv.MaKhoa<>l.MaKhoa OR sv.MaKhoa<>n.MaKhoa OR l.NamNhapHoc<>c.NamTuyenSinh) THROW 52016, N'Sinh viên có CTĐT/khoa/khóa không nhất quán.', 1;
IF EXISTS (SELECT 1 FROM dbo.HOCPHI hp INNER JOIN dbo.MUCHOCPHI m ON m.MaMucHocPhi=hp.MaMucHocPhi WHERE hp.MaHocKy<>m.MaHocKy) THROW 52017, N'Hồ sơ học phí tham chiếu sai học kỳ mức phí.', 1;
SELECT 'PASS' AS Result, DB_NAME() AS DatabaseName,
       (SELECT COUNT(*) FROM sys.tables WHERE is_ms_shipped=0) AS Tables,
       (SELECT COUNT(*) FROM sys.views WHERE is_ms_shipped=0) AS Views,
       (SELECT COUNT(*) FROM sys.procedures WHERE is_ms_shipped=0) AS Procedures,
       (SELECT COUNT(*) FROM sys.triggers WHERE parent_class=1 AND is_disabled=0) AS EnabledTableTriggers,
       (SELECT COUNT(*) FROM dbo.CHUONGTRINHDAOTAO) AS Curricula,
       (SELECT COUNT(*) FROM dbo.SINHVIEN) AS Students;
GO
