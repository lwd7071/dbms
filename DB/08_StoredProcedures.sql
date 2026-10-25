-- ENCODING: UTF-8 WITH BOM
USE [DBMS330284];
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
IF OBJECT_ID(N'dbo.SP_TaoTaiKhoan', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[SP_TaoTaiKhoan];
GO
-- Phụ trách: Lê Trung Đông
CREATE PROCEDURE [dbo].[SP_TaoTaiKhoan]
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
DECLARE @LaDaoTao BIT = ISNULL(IS_MEMBER(N'DAO_TAO'), 0);
DECLARE @LaQuanTri BIT = ISNULL(IS_MEMBER(N'QUAN_TRI'), 0);

SET @MaTaiKhoanMoi = NULL;
SET @Username = LTRIM(RTRIM(@Username));
SET @VaiTro = UPPER(LTRIM(RTRIM(@VaiTro)));

BEGIN TRY
    IF @Username IS NULL OR @Username = ''
        THROW 51001, N'Username khong duoc de trong.', 1;

    IF @PasswordHash IS NULL OR LTRIM(RTRIM(@PasswordHash)) = ''
        THROW 51002, N'PasswordHash khong duoc de trong.', 1;

    IF @VaiTro NOT IN ('SINH_VIEN', 'GIANG_VIEN', 'DAO_TAO', 'QUAN_TRI')
        THROW 51003, N'VaiTro khong hop le.', 1;

    IF @LaDaoTao = 0 AND @LaQuanTri = 0 AND USER_NAME() <> N'dbo'
        THROW 51012, N'Chi DAO_TAO hoac QUAN_TRI duoc tao tai khoan.', 1;

    IF @LaDaoTao = 1
       AND @LaQuanTri = 0
       AND @VaiTro IN ('DAO_TAO', 'QUAN_TRI')
        THROW 51013, N'Role DAO_TAO khong duoc tao tai khoan quan tri.', 1;

    IF @VaiTro = 'SINH_VIEN'
       AND (@MaSV IS NULL OR @MaGV IS NOT NULL)
        THROW 51004, N'Role SINH_VIEN phai gan dung mot MaSV.', 1;

    IF @VaiTro = 'GIANG_VIEN'
       AND (@MaGV IS NULL OR @MaSV IS NOT NULL)
        THROW 51004, N'Role GIANG_VIEN phai gan dung mot MaGV.', 1;

    IF @VaiTro IN ('DAO_TAO', 'QUAN_TRI')
       AND (@MaSV IS NOT NULL OR @MaGV IS NOT NULL)
        THROW 51004, N'Role DAO_TAO va QUAN_TRI khong gan MaSV hoac MaGV.', 1;

    IF @MaSV IS NOT NULL AND @MaGV IS NOT NULL
        THROW 51004, N'Tai khoan khong duoc lien ket dong thoi voi SINHVIEN va GIANGVIEN.', 1;

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
        THROW 51006, N'Username da ton tai.', 1;

    IF @MaSV IS NOT NULL
    BEGIN
        IF NOT EXISTS
        (
            SELECT 1
            FROM dbo.SINHVIEN WITH (UPDLOCK, HOLDLOCK)
            WHERE MaSV = @MaSV
        )
            THROW 51005, N'MaSV khong ton tai.', 1;

        IF EXISTS
        (
            SELECT 1
            FROM dbo.TAIKHOAN WITH (UPDLOCK, HOLDLOCK)
            WHERE MaSV = @MaSV
        )
            THROW 51007, N'Sinh vien da duoc lien ket voi tai khoan khac.', 1;
    END;

    IF @MaGV IS NOT NULL
    BEGIN
        IF NOT EXISTS
        (
            SELECT 1
            FROM dbo.GIANGVIEN WITH (UPDLOCK, HOLDLOCK)
            WHERE MaGV = @MaGV
        )
            THROW 51005, N'MaGV khong ton tai.', 1;

        IF EXISTS
        (
            SELECT 1
            FROM dbo.TAIKHOAN WITH (UPDLOCK, HOLDLOCK)
            WHERE MaGV = @MaGV
        )
            THROW 51008, N'Giang vien da duoc lien ket voi tai khoan khac.', 1;
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
        'ACTIVE',
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

END;
GO
IF OBJECT_ID(N'dbo.SP_KhoaTaiKhoan', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[SP_KhoaTaiKhoan];
GO
-- Phụ trách: Lê Trung Đông
CREATE PROCEDURE [dbo].[SP_KhoaTaiKhoan]
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

    SELECT
        @TrangThaiHienTai = TrangThai,
        @VaiTroHienTai = VaiTro
    FROM dbo.TAIKHOAN WITH (UPDLOCK, HOLDLOCK)
    WHERE MaTaiKhoan = @MaTaiKhoan;

    IF @TrangThaiHienTai IS NULL
        THROW 51010, N'Khong tim thay tai khoan.', 1;

    IF @MaTaiKhoanNguoiThaoTac IS NOT NULL
    BEGIN
        SELECT
            @VaiTroNguoiThaoTac = VaiTro,
            @TrangThaiNguoiThaoTac = TrangThai
        FROM dbo.TAIKHOAN WITH (UPDLOCK, HOLDLOCK)
        WHERE MaTaiKhoan = @MaTaiKhoanNguoiThaoTac;

        IF @VaiTroNguoiThaoTac IS NULL
           OR @TrangThaiNguoiThaoTac <> 'ACTIVE'
           OR @VaiTroNguoiThaoTac NOT IN ('DAO_TAO', 'QUAN_TRI')
            THROW 51012, N'Chi DAO_TAO hoac QUAN_TRI dang hoat dong duoc khoa tai khoan.', 1;

        IF @MaTaiKhoanNguoiThaoTac = @MaTaiKhoan
            THROW 51015, N'Khong the tu khoa tai khoan dang dang nhap.', 1;

        IF @VaiTroNguoiThaoTac = 'DAO_TAO'
           AND @VaiTroHienTai IN ('DAO_TAO', 'QUAN_TRI')
            THROW 51014, N'Role DAO_TAO khong duoc khoa tai khoan DAO_TAO hoac QUAN_TRI.', 1;
    END
    ELSE
    BEGIN
        IF @LaDaoTao = 0 AND @LaQuanTri = 0 AND USER_NAME() <> N'dbo'
            THROW 51012, N'Chi DAO_TAO hoac QUAN_TRI duoc khoa tai khoan.', 1;

        IF @LaDaoTao = 1
           AND @LaQuanTri = 0
           AND @VaiTroHienTai IN ('DAO_TAO', 'QUAN_TRI')
            THROW 51014, N'Role DAO_TAO khong duoc khoa tai khoan quan tri.', 1;
    END;

    IF @TrangThaiHienTai = 'DISABLED'
        THROW 51011, N'Tai khoan DISABLED khong the chuyen sang LOCKED.', 1;

    IF @TrangThaiHienTai <> 'LOCKED'
    BEGIN
        UPDATE dbo.TAIKHOAN
        SET TrangThai = 'LOCKED'
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

END;
GO
IF OBJECT_ID(N'dbo.SP_DangKyTinChi', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[SP_DangKyTinChi];
GO
-- Phụ trách: Trần Biểu Hương
CREATE PROCEDURE [dbo].[SP_DangKyTinChi]
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
        THROW 50001, N'Sinh vien khong ton tai trong he thong.', 1;

    IF @TrangThaiSV <> 'DANG_HOC'
        THROW 50002, N'Sinh vien khong o trang thai DANG_HOC.', 1;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.TAIKHOAN tk
        WHERE tk.MaSV = @MaSV
          AND tk.TrangThai <> 'ACTIVE'
    )
        THROW 50003, N'Tai khoan sinh vien dang bi khoa hoac vo hieu hoa.', 1;

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
        THROW 50004, N'Lop hoc phan khong ton tai.', 1;

    IF @TrangThaiLHP NOT IN ('MO_DANG_KY', 'DANG_MO')
        THROW 50005, N'Lop hoc phan hien khong mo dang ky.', 1;

    IF dbo.FN_KiemTraThoiGianDangKy(@MaHocKy, SYSUTCDATETIME()) = 0
        THROW 50006, N'Hien khong nam trong thoi gian dang ky tin chi.', 1;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.DANGKYTINCHI dk WITH (UPDLOCK, HOLDLOCK)
        INNER JOIN dbo.LOPHOCPHAN lhp
            ON lhp.MaLHP = dk.MaLHP
        WHERE dk.MaSV = @MaSV
          AND lhp.MaHocKy = @MaHocKy
          AND lhp.MaMonHoc = @MaMonHoc
          AND dk.TrangThai = 'REGISTERED'
    )
        THROW 50007, N'Sinh vien da dang ky mon hoc nay trong hoc ky.', 1;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.MONHOCTIENQUYET tq
        WHERE tq.MaMonHoc = @MaMonHoc
          AND tq.MucDo = 'BAT_BUOC'
          AND NOT EXISTS
          (
              SELECT 1
              FROM dbo.V_BangDiemChiTiet bd
              WHERE bd.MaSV = @MaSV
                AND bd.MaMonHoc = tq.MaMonTienQuyet
                AND bd.DiemTongKet >= 5.0
          )
    )
        THROW 50008, N'Sinh vien chua hoan thanh mon tien quyet bat buoc.', 1;

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
        THROW 50009, N'Lich hoc bi trung voi thoi khoa bieu hien tai cua sinh vien.', 1;

    SET @TongTinChiHienTai =
        dbo.FN_TongTinChiDangKy(@MaSV, @MaHocKy);

    IF (@TongTinChiHienTai + @SoTinChiMon) > 25
        THROW 50010, N'Vuot qua so tin chi toi da cho phep trong hoc ky.', 1;

    SELECT
        @SiSoHienTai = COUNT(*)
    FROM dbo.DANGKYTINCHI WITH (UPDLOCK, HOLDLOCK)
    WHERE MaLHP = @MaLHP
      AND TrangThai = 'REGISTERED';

    IF @SiSoHienTai >= @SoLuongToiDa
        THROW 50011, N'Lop hoc phan da du si so toi da.', 1;

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
        'REGISTERED'
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

END;
GO
IF OBJECT_ID(N'dbo.SP_HuyDangKy', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[SP_HuyDangKy];
GO
-- Phụ trách: Trần Biểu Hương
CREATE PROCEDURE [dbo].[SP_HuyDangKy]
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
      AND dk.TrangThai = 'REGISTERED';

    IF @MaDangKy IS NULL
        THROW 50021, N'Khong tim thay dang ky REGISTERED de huy.', 1;

    IF dbo.FN_KiemTraThoiGianDangKy(@MaHocKy, SYSUTCDATETIME()) = 0
        THROW 50022, N'Da het thoi han dang ky hoac huy hoc phan.', 1;

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
        THROW 50023, N'Khong the huy hoc phan vi da co diem thanh phan.', 1;

    DELETE FROM dbo.DIEMSO
    WHERE MaDangKy = @MaDangKy;

    UPDATE dbo.DANGKYTINCHI
    SET TrangThai = 'CANCELLED'
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

END;
GO
IF OBJECT_ID(N'dbo.SP_TinhHocPhiSinhVien', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[SP_TinhHocPhiSinhVien];
GO
-- Phụ trách: Âu Quốc Khánh
CREATE PROCEDURE [dbo].[SP_TinhHocPhiSinhVien]
    @MaSV INT,
    @MaHocKy INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
BEGIN TRY
    IF @MaSV IS NULL OR @MaSV <= 0
        THROW 50010, N'MaSV khong hop le.', 1;

    IF @MaHocKy IS NULL OR @MaHocKy <= 0
        THROW 50011, N'MaHocKy khong hop le.', 1;

    BEGIN TRANSACTION;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.SINHVIEN
        WHERE MaSV = @MaSV
    )
        THROW 50012, N'Sinh vien khong ton tai.', 1;

    IF NOT EXISTS
    (
        SELECT 1
        FROM dbo.HOCKY
        WHERE MaHocKy = @MaHocKy
    )
        THROW 50013, N'Hoc ky khong ton tai.', 1;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.HOCPHI WITH (UPDLOCK, HOLDLOCK)
        WHERE MaSV = @MaSV
          AND MaHocKy = @MaHocKy
    )
        THROW 50014, N'Sinh vien da co hoc phi trong hoc ky nay.', 1;

    DECLARE @Ngay DATE = CONVERT(DATE, SYSUTCDATETIME());
    DECLARE @DonGia DECIMAL(12,2);

    SELECT TOP (1)
        @DonGia = DonGiaTinChi
    FROM dbo.MUCHOCPHI WITH (UPDLOCK, HOLDLOCK)
    WHERE MaHocKy = @MaHocKy
      AND PhamViApDung = 'TOAN_TRUONG'
      AND TrangThai = 'ACTIVE'
      AND NgayHieuLuc <= @Ngay
      AND
      (
          NgayHetHieuLuc IS NULL
          OR NgayHetHieuLuc >= @Ngay
      )
    ORDER BY NgayHieuLuc DESC, MaMucHocPhi DESC;

    IF @DonGia IS NULL OR @DonGia <= 0
        THROW 50015, N'Khong tim thay muc hoc phi ACTIVE phu hop.', 1;

    DECLARE @MaMucHocPhi INT;

    SELECT TOP (1)
        @MaMucHocPhi = MaMucHocPhi
    FROM dbo.MUCHOCPHI WITH (UPDLOCK, HOLDLOCK)
    WHERE MaHocKy = @MaHocKy
      AND PhamViApDung = 'TOAN_TRUONG'
      AND TrangThai = 'ACTIVE'
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
      AND dk.TrangThai = 'REGISTERED'
      AND lhp.MaHocKy = @MaHocKy;

    IF @SoTinChi <= 0
        THROW 50017, N'Sinh vien khong co tin chi REGISTERED trong hoc ky.', 1;

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
        'UNPAID',
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

END;
GO
IF OBJECT_ID(N'dbo.SP_ThongKeHocPhi', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[SP_ThongKeHocPhi];
GO
-- Phụ trách: Âu Quốc Khánh
CREATE PROCEDURE [dbo].[SP_ThongKeHocPhi]
    @MaHocKy INT = NULL,
    @TrangThai VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
IF @TrangThai IS NOT NULL
   AND @TrangThai NOT IN ('UNPAID', 'PARTIAL', 'PAID')
    THROW 50020, N'TrangThai hoc phi khong hop le.', 1;

IF @MaHocKy IS NOT NULL
   AND NOT EXISTS
   (
       SELECT 1
       FROM dbo.HOCKY
       WHERE MaHocKy = @MaHocKy
   )
    THROW 50021, N'Hoc ky khong ton tai.', 1;

SELECT
    hp.MaHocKy,
    hk.NamHoc,
    hk.TenHocKy,
    COUNT(*) AS SoHoSoHocPhi,
    SUM(hp.TongTien) AS TongTienPhaiThu,
    SUM(hp.SoTienDaThanhToan) AS TongTienDaThu,
    SUM(hp.TongTien - hp.SoTienDaThanhToan) AS TongTienConLai,
    SUM(CASE WHEN hp.TrangThai = 'UNPAID' THEN 1 ELSE 0 END) AS SoUNPAID,
    SUM(CASE WHEN hp.TrangThai = 'PARTIAL' THEN 1 ELSE 0 END) AS SoPARTIAL,
    SUM(CASE WHEN hp.TrangThai = 'PAID' THEN 1 ELSE 0 END) AS SoPAID
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

END;
GO

-- 7. Thủ tục báo cáo thống kê học phí chi tiết theo Lớp sinh hoạt
IF OBJECT_ID(N'dbo.SP_ThongKeHocPhiTheoLop', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[SP_ThongKeHocPhiTheoLop];
GO
-- Phụ trách: Âu Quốc Khánh
CREATE PROCEDURE [dbo].[SP_ThongKeHocPhiTheoLop]
    @MaLop VARCHAR(20),
    @MaHocKy INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.LOP WHERE MaLop = @MaLop)
    BEGIN
        THROW 51008, N'Không tìm thấy lớp sinh hoạt được yêu cầu.', 1;
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
        SUM(CASE WHEN hp.TrangThai = 'PAID' THEN 1 ELSE 0 END) AS SoSV_DaHoanThanh,
        SUM(CASE WHEN hp.TrangThai = 'PARTIAL' THEN 1 ELSE 0 END) AS SoSV_NopMotPhan,
        SUM(CASE WHEN hp.TrangThai = 'UNPAID' THEN 1 ELSE 0 END) AS SoSV_ChuaNop
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
END;
GO

-- ============================================================================
-- 8. SP_XacNhanThanhToan: Xác nhận giao dịch học phí (CHO_XAC_NHAN -> DA_XAC_NHAN)
-- ============================================================================
IF OBJECT_ID(N'dbo.SP_XacNhanThanhToan', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[SP_XacNhanThanhToan];
GO
-- Phụ trách: Âu Quốc Khánh
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
            THROW 51401, N'Giao dịch thanh toán không tồn tại.', 1;
        END;

        -- 2. Kiểm tra trạng thái hiện tại
        IF @CurrentStatus = 'DA_XAC_NHAN'
        BEGIN
            THROW 51402, N'Giao dịch đã được xác nhận trước đó.', 1;
        END;

        IF @CurrentStatus = 'TU_CHOI'
        BEGIN
            THROW 51403, N'Không thể xác nhận giao dịch đã bị từ chối.', 1;
        END;

        IF @CurrentStatus <> 'CHO_XAC_NHAN'
        BEGIN
            THROW 51405, N'Chỉ có thể xác nhận giao dịch đang ở trạng thái chờ xác nhận.', 1;
        END;

        -- 3. Kiểm tra quyền tài khoản
        DECLARE @VaiTro VARCHAR(20);
        DECLARE @TrangThaiTK VARCHAR(20);

        SELECT 
            @VaiTro = VaiTro,
            @TrangThaiTK = TrangThai
        FROM dbo.TAIKHOAN
        WHERE MaTaiKhoan = @MaTaiKhoanXacNhan;

        IF @VaiTro IS NULL OR @TrangThaiTK <> 'ACTIVE' OR @VaiTro NOT IN ('DAO_TAO', 'QUAN_TRI')
        BEGIN
            THROW 51404, N'Tài khoản không có quyền xác nhận thanh toán.', 1;
        END;

        -- 4. Cập nhật DA_XAC_NHAN (Kích hoạt Trigger cập nhật HOCPHI)
        UPDATE dbo.CHITIETTHANHTOAN
        SET 
            TrangThai = 'DA_XAC_NHAN',
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
END;
GO

-- ============================================================================
-- 9. SP_TuChoiThanhToan: Từ chối giao dịch học phí (CHO_XAC_NHAN -> TU_CHOI)
-- ============================================================================
IF OBJECT_ID(N'dbo.SP_TuChoiThanhToan', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[SP_TuChoiThanhToan];
GO
-- Phụ trách: Âu Quốc Khánh
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
            THROW 51401, N'Giao dịch thanh toán không tồn tại.', 1;
        END;

        -- 2. Kiểm tra trạng thái hiện tại
        IF @CurrentStatus <> 'CHO_XAC_NHAN'
        BEGIN
            THROW 51405, N'Chỉ có thể từ chối giao dịch đang ở trạng thái chờ xác nhận.', 1;
        END;

        -- 3. Kiểm tra quyền tài khoản
        DECLARE @VaiTro VARCHAR(20);
        DECLARE @TrangThaiTK VARCHAR(20);

        SELECT 
            @VaiTro = VaiTro,
            @TrangThaiTK = TrangThai
        FROM dbo.TAIKHOAN
        WHERE MaTaiKhoan = @MaTaiKhoanXacNhan;

        IF @VaiTro IS NULL OR @TrangThaiTK <> 'ACTIVE' OR @VaiTro NOT IN ('DAO_TAO', 'QUAN_TRI')
        BEGIN
            THROW 51404, N'Tài khoản không có quyền từ chối thanh toán.', 1;
        END;

        -- 4. Cập nhật TU_CHOI
        UPDATE dbo.CHITIETTHANHTOAN
        SET 
            TrangThai = 'TU_CHOI',
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
END;
GO
