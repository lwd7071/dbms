-- Upgrade the existing sample database without deleting student/history rows.
-- Rehearse against DBMS330284_MigrationRehearsal before applying to DBMS330284.
USE [$(DatabaseName)];
GO
SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

IF DB_NAME() NOT IN (N'DBMS330284', N'DBMS330284_MigrationRehearsal', N'DBMS330284_MigrationRehearsal2')
    THROW 52070, N'Migration is restricted to DBMS330284 or its rehearsal copy.', 1;
IF COL_LENGTH(N'dbo.SINHVIEN', N'MaCTDT') IS NOT NULL
    THROW 52071, N'MaCTDT already exists; refusing to run this one-time migration twice.', 1;
IF EXISTS (SELECT 1 FROM dbo.HOCPHI hp JOIN dbo.MUCHOCPHI m ON m.MaMucHocPhi = hp.MaMucHocPhi WHERE m.MaHocKy <> hp.MaHocKy)
    THROW 52072, N'Existing tuition records reference a rate from a different semester; resolve before migration.', 1;
IF EXISTS (SELECT 1 FROM dbo.HOCPHI hp JOIN (SELECT MaHocPhi, SUM(SoTien) AS Confirmed FROM dbo.CHITIETTHANHTOAN WHERE TrangThai = 'DA_XAC_NHAN' GROUP BY MaHocPhi) p ON p.MaHocPhi = hp.MaHocPhi WHERE p.Confirmed > hp.TongTien)
    THROW 52078, N'Confirmed payments exceed a tuition total; resolve before migration.', 1;
IF EXISTS (SELECT 1 FROM dbo.CHUONGTRINHDAOTAO WHERE TRY_CONVERT(SMALLINT, LEFT(KhoaHoc, 4)) NOT BETWEEN 2000 AND 2100)
    THROW 52073, N'Cannot derive an intake year from every existing KhoaHoc value.', 1;
IF EXISTS (SELECT 1 FROM dbo.LOP WHERE NamNhapHoc NOT BETWEEN 2000 AND 2100)
    THROW 52074, N'Existing class intake years violate the supported range.', 1;
IF EXISTS (SELECT 1 FROM dbo.LOPHOCPHAN lhp WHERE lhp.TrangThai IN ('MO_DANG_KY', 'DANG_MO') AND NOT EXISTS (SELECT 1 FROM dbo.LICHHOC lh WHERE lh.MaLHP = lhp.MaLHP))
    THROW 52075, N'An open class section has no schedule; resolve before migration.', 1;
IF EXISTS (SELECT 1 FROM dbo.SINHVIEN sv JOIN dbo.LOP l ON l.MaLop = sv.MaLop WHERE sv.MaKhoa <> l.MaKhoa)
    THROW 52076, N'Student and class faculties differ; resolve before migration.', 1;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    -- Widen both related curriculum keys; preserve all rows while rebuilding dependent keys.
    ALTER TABLE dbo.CTDT_MONHOC DROP CONSTRAINT FK_CTDT_MONHOC_CTDT;
    ALTER TABLE dbo.CTDT_MONHOC DROP CONSTRAINT PK_CTDT_MONHOC;
    ALTER TABLE dbo.CHUONGTRINHDAOTAO DROP CONSTRAINT PK_CHUONGTRINHDAOTAO;
    ALTER TABLE dbo.CHUONGTRINHDAOTAO ALTER COLUMN MaCTDT VARCHAR(24) NOT NULL;
    ALTER TABLE dbo.CTDT_MONHOC ALTER COLUMN MaCTDT VARCHAR(24) NOT NULL;
    ALTER TABLE dbo.CHUONGTRINHDAOTAO ADD CONSTRAINT PK_CHUONGTRINHDAOTAO PRIMARY KEY (MaCTDT);
    ALTER TABLE dbo.CTDT_MONHOC ADD CONSTRAINT PK_CTDT_MONHOC PRIMARY KEY (MaCTDT, MaMonHoc);
    ALTER TABLE dbo.CTDT_MONHOC ADD CONSTRAINT FK_CTDT_MONHOC_CTDT FOREIGN KEY (MaCTDT) REFERENCES dbo.CHUONGTRINHDAOTAO(MaCTDT);

    ALTER TABLE dbo.CHUONGTRINHDAOTAO ADD NamTuyenSinh SMALLINT NULL;
    EXEC sys.sp_executesql N'UPDATE dbo.CHUONGTRINHDAOTAO SET NamTuyenSinh = TRY_CONVERT(SMALLINT, LEFT(KhoaHoc, 4));';
    EXEC sys.sp_executesql N'ALTER TABLE dbo.CHUONGTRINHDAOTAO ALTER COLUMN NamTuyenSinh SMALLINT NOT NULL;
        ALTER TABLE dbo.CHUONGTRINHDAOTAO ADD CONSTRAINT CK_CHUONGTRINHDAOTAO_NamTuyenSinh CHECK (NamTuyenSinh BETWEEN 2000 AND 2100);';
    ALTER TABLE dbo.LOP ADD CONSTRAINT CK_LOP_NamNhapHoc CHECK (NamNhapHoc BETWEEN 2000 AND 2100);

    -- Preserve all eight 2023 programs and their course mappings; add 2024/2025 cohorts.
    EXEC sys.sp_executesql N'
        INSERT dbo.CHUONGTRINHDAOTAO (MaCTDT, MaNganh, TenCTDT, KhoaHoc, NamTuyenSinh, TongTinChiYeuCau, ThoiGianDaoTao, TrangThai)
        SELECT CONCAT(c.MaCTDT, ''_'', RIGHT(CONVERT(VARCHAR(4), cohort.NamTuyenSinh), 2)),
               c.MaNganh, c.TenCTDT, CONCAT(cohort.NamTuyenSinh, ''-'', cohort.NamTuyenSinh + c.ThoiGianDaoTao),
               cohort.NamTuyenSinh, c.TongTinChiYeuCau, c.ThoiGianDaoTao, c.TrangThai
        FROM dbo.CHUONGTRINHDAOTAO c
        CROSS JOIN (VALUES (2024), (2025)) cohort(NamTuyenSinh)
        WHERE c.NamTuyenSinh = 2023;';

    EXEC sys.sp_executesql N'
        INSERT dbo.CTDT_MONHOC (MaCTDT, MaMonHoc, HocKyDuKien, LoaiMon, ThuTu)
        SELECT CONCAT(cm.MaCTDT, ''_'', RIGHT(CONVERT(VARCHAR(4), cohort.NamTuyenSinh), 2)),
               cm.MaMonHoc, cm.HocKyDuKien, cm.LoaiMon, cm.ThuTu
        FROM dbo.CTDT_MONHOC cm
        INNER JOIN dbo.CHUONGTRINHDAOTAO c ON c.MaCTDT = cm.MaCTDT AND c.NamTuyenSinh = 2023
        CROSS JOIN (VALUES (2024), (2025)) cohort(NamTuyenSinh);';

    ALTER TABLE dbo.SINHVIEN ADD MaCTDT VARCHAR(24) NULL;

    EXEC sys.sp_executesql N';WITH StudentCurriculum AS
    (
        SELECT sv.MaSV,
               CASE
                   WHEN l.MaLop IS NOT NULL THEN l.NamNhapHoc
                   WHEN TRY_CONVERT(INT, LEFT(sv.MaSinhVien, 2)) BETWEEN 23 AND 25 THEN 2000 + TRY_CONVERT(INT, LEFT(sv.MaSinhVien, 2))
                   ELSE 2023
               END AS NamTuyenSinh,
               CASE
                   WHEN sv.MaKhoa = ''CNTT'' AND RIGHT(COALESCE(l.MaLop, ''''), 2) = ''02'' THEN ''CTDT_CNTT_CLC''
                   WHEN sv.MaKhoa = ''CNTT'' THEN ''CTDT_CNTT_CQ''
                   WHEN sv.MaKhoa = ''HTTT'' AND RIGHT(COALESCE(l.MaLop, ''''), 2) = ''02'' THEN ''CTDT_TMDT_CQ''
                   WHEN sv.MaKhoa = ''HTTT'' THEN ''CTDT_HTTT_CQ''
                   WHEN sv.MaKhoa = ''KTPM'' THEN ''CTDT_KTPM_CQ''
                   WHEN sv.MaKhoa = ''KHMT'' THEN ''CTDT_KHMT_CQ''
                   WHEN sv.MaKhoa = ''MMT'' THEN ''CTDT_MMT_CQ''
                   WHEN sv.MaKhoa = ''ATTT'' THEN ''CTDT_ATTT_CQ''
                   ELSE NULL
               END AS MaCTDTGoc
        FROM dbo.SINHVIEN sv
        LEFT JOIN dbo.LOP l ON l.MaLop = sv.MaLop
    )
    UPDATE sv
       SET MaCTDT = CASE WHEN sc.NamTuyenSinh = 2023 THEN sc.MaCTDTGoc
                         ELSE CONCAT(sc.MaCTDTGoc, ''_'', RIGHT(CONVERT(VARCHAR(4), sc.NamTuyenSinh), 2)) END
    FROM dbo.SINHVIEN sv
    INNER JOIN StudentCurriculum sc ON sc.MaSV = sv.MaSV;';

    EXEC sys.sp_executesql N'IF EXISTS (SELECT 1 FROM dbo.SINHVIEN WHERE MaCTDT IS NULL)
        THROW 52077, N''At least one student could not be assigned a curriculum; migration rolled back.'', 1;';

    EXEC sys.sp_executesql N'ALTER TABLE dbo.SINHVIEN ALTER COLUMN MaCTDT VARCHAR(24) NOT NULL;
        ALTER TABLE dbo.SINHVIEN ADD CONSTRAINT FK_SINHVIEN_CTDT FOREIGN KEY (MaCTDT) REFERENCES dbo.CHUONGTRINHDAOTAO(MaCTDT);';

    -- Existing records were preflighted to have same-semester rates.
    ALTER TABLE dbo.HOCPHI DROP CONSTRAINT FK_HOCPHI_MUCHOCPHI;
    ALTER TABLE dbo.MUCHOCPHI ADD CONSTRAINT UQ_MUCHOCPHI_MaMucHocPhi_MaHocKy UNIQUE (MaMucHocPhi, MaHocKy);
    ALTER TABLE dbo.HOCPHI ADD CONSTRAINT FK_HOCPHI_MUCHOCPHI FOREIGN KEY (MaMucHocPhi, MaHocKy) REFERENCES dbo.MUCHOCPHI(MaMucHocPhi, MaHocKy);

    -- Reconcile the one stale derived cache found in the pre-migration check.
    ;WITH ConfirmedPayments AS
    (
        SELECT MaHocPhi, SUM(SoTien) AS Confirmed
        FROM dbo.CHITIETTHANHTOAN
        WHERE TrangThai = 'DA_XAC_NHAN'
        GROUP BY MaHocPhi
    )
    UPDATE hp
       SET SoTienDaThanhToan = COALESCE(cp.Confirmed, 0),
           TrangThai = CASE WHEN COALESCE(cp.Confirmed, 0) = 0 THEN 'UNPAID'
                            WHEN COALESCE(cp.Confirmed, 0) >= hp.TongTien THEN 'PAID'
                            ELSE 'PARTIAL' END
    FROM dbo.HOCPHI hp
    LEFT JOIN ConfirmedPayments cp ON cp.MaHocPhi = hp.MaHocPhi
    WHERE hp.SoTienDaThanhToan <> COALESCE(cp.Confirmed, 0)
       OR hp.TrangThai <> CASE WHEN COALESCE(cp.Confirmed, 0) = 0 THEN 'UNPAID'
                               WHEN COALESCE(cp.Confirmed, 0) >= hp.TongTien THEN 'PAID'
                               ELSE 'PARTIAL' END;

    ALTER TABLE dbo.LOPHOCPHAN DROP CONSTRAINT DF_LOPHOCPHAN_TrangThai;
    ALTER TABLE dbo.LOPHOCPHAN ADD CONSTRAINT DF_LOPHOCPHAN_TrangThai DEFAULT ('DA_KHOA') FOR TrangThai;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
