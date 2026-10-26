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

-- Application API procedures used by role-specific backend pools.
SET NOCOUNT ON;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Auth_FindByUsername @Username VARCHAR(50)
AS
BEGIN
  SET NOCOUNT ON;
  SELECT tk.MaTaiKhoan, tk.Username, tk.PasswordHash, tk.VaiTro, tk.TrangThai, tk.MaSV, tk.MaGV,
    sv.MaSinhVien, sv.HoTen AS HoTenSinhVien, sv.MaKhoa AS MaKhoaSV, sv.MaLop, l.TenLop AS TenLopSV,
    sv.TrangThai AS TrangThaiSV, gv.MaGiangVien, gv.HoTen AS HoTenGiangVien, gv.MaKhoa AS MaKhoaGV
  FROM dbo.TAIKHOAN tk
  LEFT JOIN dbo.SINHVIEN sv ON tk.MaSV=sv.MaSV
  LEFT JOIN dbo.LOP l ON sv.MaLop=l.MaLop
  LEFT JOIN dbo.GIANGVIEN gv ON tk.MaGV=gv.MaGV
  WHERE tk.Username=@Username;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Auth_FindById @MaTaiKhoan INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT tk.MaTaiKhoan, tk.Username, tk.VaiTro, tk.TrangThai, tk.MaSV, tk.MaGV,
    sv.MaSinhVien, sv.HoTen AS HoTenSinhVien, sv.MaLop, l.TenLop AS TenLopSV,
    gv.MaGiangVien, gv.HoTen AS HoTenGiangVien
  FROM dbo.TAIKHOAN tk
  LEFT JOIN dbo.SINHVIEN sv ON tk.MaSV=sv.MaSV
  LEFT JOIN dbo.LOP l ON sv.MaLop=l.MaLop
  LEFT JOIN dbo.GIANGVIEN gv ON tk.MaGV=gv.MaGV
  WHERE tk.MaTaiKhoan=@MaTaiKhoan;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Auth_UpdateLastLogin @MaTaiKhoan INT
AS
BEGIN
  SET NOCOUNT ON;
  EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=@MaTaiKhoan;
  BEGIN TRY
    UPDATE dbo.TAIKHOAN SET LanDangNhapCuoi=GETDATE() WHERE MaTaiKhoan=@MaTaiKhoan;
    EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL;
  END TRY BEGIN CATCH
    EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL;
    THROW;
  END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Registration_Create @MaSV INT,@MaLHP VARCHAR(20),@ActorMaTaiKhoan INT
AS
BEGIN
  SET NOCOUNT ON;
  IF NOT EXISTS(SELECT 1 FROM dbo.TAIKHOAN WHERE MaTaiKhoan=@ActorMaTaiKhoan AND MaSV=@MaSV AND VaiTro='SINH_VIEN' AND TrangThai='ACTIVE' AND IS_MEMBER('SINH_VIEN')=1)
    THROW 50003,'Invalid registration actor.',1;
  EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=@ActorMaTaiKhoan;
  BEGIN TRY
    EXEC dbo.SP_DangKyTinChi @MaSV=@MaSV,@MaLHP=@MaLHP;
    EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL;
  END TRY BEGIN CATCH
    EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL;
    THROW;
  END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Registration_Cancel @MaSV INT,@MaLHP VARCHAR(20),@ActorMaTaiKhoan INT
AS
BEGIN
  SET NOCOUNT ON;
  IF NOT EXISTS(SELECT 1 FROM dbo.TAIKHOAN WHERE MaTaiKhoan=@ActorMaTaiKhoan AND MaSV=@MaSV AND VaiTro='SINH_VIEN' AND TrangThai='ACTIVE' AND IS_MEMBER('SINH_VIEN')=1)
    THROW 50003,'Invalid registration actor.',1;
  EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=@ActorMaTaiKhoan;
  BEGIN TRY
    EXEC dbo.SP_HuyDangKy @MaSV=@MaSV,@MaLHP=@MaLHP;
    EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL;
  END TRY BEGIN CATCH
    EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL;
    THROW;
  END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Tuition_ConfirmPayment @MaThanhToan BIGINT,@ActorMaTaiKhoan INT
AS
BEGIN
  SET NOCOUNT ON;
  IF NOT EXISTS(SELECT 1 FROM dbo.TAIKHOAN WHERE MaTaiKhoan=@ActorMaTaiKhoan AND TrangThai='ACTIVE' AND VaiTro IN('DAO_TAO','QUAN_TRI')
    AND ((VaiTro='DAO_TAO' AND IS_MEMBER('DAO_TAO')=1) OR (VaiTro='QUAN_TRI' AND IS_MEMBER('QUAN_TRI')=1)))
    THROW 51404,'Invalid payment confirmation actor.',1;
  EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=@ActorMaTaiKhoan;
  BEGIN TRY
    EXEC dbo.SP_XacNhanThanhToan @MaThanhToan=@MaThanhToan,@MaTaiKhoanXacNhan=@ActorMaTaiKhoan;
    EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL;
  END TRY BEGIN CATCH
    EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL;
    THROW;
  END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Tuition_RejectPayment @MaThanhToan BIGINT,@ActorMaTaiKhoan INT
AS
BEGIN
  SET NOCOUNT ON;
  IF NOT EXISTS(SELECT 1 FROM dbo.TAIKHOAN WHERE MaTaiKhoan=@ActorMaTaiKhoan AND TrangThai='ACTIVE' AND VaiTro IN('DAO_TAO','QUAN_TRI')
    AND ((VaiTro='DAO_TAO' AND IS_MEMBER('DAO_TAO')=1) OR (VaiTro='QUAN_TRI' AND IS_MEMBER('QUAN_TRI')=1)))
    THROW 51404,'Invalid payment rejection actor.',1;
  EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=@ActorMaTaiKhoan;
  BEGIN TRY
    EXEC dbo.SP_TuChoiThanhToan @MaThanhToan=@MaThanhToan,@MaTaiKhoanXacNhan=@ActorMaTaiKhoan;
    EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL;
  END TRY BEGIN CATCH
    EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL;
    THROW;
  END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Faculty_List @ActiveOnly BIT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT MaKhoa,TenKhoa,Email,SoDienThoai,TrangThai FROM dbo.KHOA
  WHERE @ActiveOnly=0 OR TrangThai=1 ORDER BY TenKhoa ASC;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Faculty_ListMajors @MaKhoa VARCHAR(10)=NULL
AS
BEGIN
  SET NOCOUNT ON;
  SELECT n.MaNganh,n.TenNganh,n.MaKhoa,k.TenKhoa,n.MoTa,n.TrangThai
  FROM dbo.NGANH n INNER JOIN dbo.KHOA k ON k.MaKhoa=n.MaKhoa
  WHERE @MaKhoa IS NULL OR n.MaKhoa=@MaKhoa ORDER BY k.TenKhoa,n.TenNganh;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Faculty_Create @MaKhoa VARCHAR(10),@TenKhoa NVARCHAR(100),@Email VARCHAR(100)=NULL,@SoDienThoai VARCHAR(15)=NULL,@TrangThai BIT=1
AS
BEGIN
  SET NOCOUNT ON;
  INSERT dbo.KHOA(MaKhoa,TenKhoa,Email,SoDienThoai,TrangThai) VALUES(@MaKhoa,@TenKhoa,@Email,@SoDienThoai,@TrangThai);
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Faculty_Update @MaKhoa VARCHAR(10),@TenKhoa NVARCHAR(100),@Email VARCHAR(100)=NULL,@SoDienThoai VARCHAR(15)=NULL,@TrangThai BIT=1
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.KHOA SET TenKhoa=@TenKhoa,Email=@Email,SoDienThoai=@SoDienThoai,TrangThai=@TrangThai WHERE MaKhoa=@MaKhoa;
  SELECT @@ROWCOUNT AS affected;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Faculty_DeleteFaculty @MaKhoa VARCHAR(10)
AS
BEGIN
  SET NOCOUNT ON;
  DELETE dbo.KHOA WHERE MaKhoa=@MaKhoa;
  SELECT @@ROWCOUNT AS affected;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Major_List @MaKhoa VARCHAR(10)=NULL
AS
BEGIN
  SET NOCOUNT ON;
  SELECT n.MaNganh,n.MaKhoa,n.TenNganh,n.MoTa,n.TrangThai FROM dbo.NGANH n
  WHERE @MaKhoa IS NULL OR n.MaKhoa=@MaKhoa ORDER BY n.TenNganh;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Major_Create @MaNganh VARCHAR(10),@MaKhoa VARCHAR(10),@TenNganh NVARCHAR(100),@MoTa NVARCHAR(500)=NULL,@TrangThai BIT=1
AS
BEGIN
  SET NOCOUNT ON;
  INSERT dbo.NGANH(MaNganh,MaKhoa,TenNganh,MoTa,TrangThai) VALUES(@MaNganh,@MaKhoa,@TenNganh,@MoTa,@TrangThai);
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Major_Update @MaNganh VARCHAR(10),@MaKhoa VARCHAR(10),@TenNganh NVARCHAR(100),@MoTa NVARCHAR(500)=NULL,@TrangThai BIT=1
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.NGANH SET MaKhoa=@MaKhoa,TenNganh=@TenNganh,MoTa=@MoTa,TrangThai=@TrangThai WHERE MaNganh=@MaNganh;
  SELECT @@ROWCOUNT AS affected;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Major_Delete @MaNganh VARCHAR(10)
AS
BEGIN
  SET NOCOUNT ON;
  DELETE dbo.NGANH WHERE MaNganh=@MaNganh;
  SELECT @@ROWCOUNT AS affected;
END;
GO
USE [DBMS330284];
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Course_DefaultOpenSemester
AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @MaHocKy INT;
  SELECT TOP(1) @MaHocKy=MaHocKy FROM dbo.HOCKY WHERE TrangThai='DANG_MO' ORDER BY MaHocKy DESC;
  IF @MaHocKy IS NULL SELECT TOP(1) @MaHocKy=MaHocKy FROM dbo.LOPHOCPHAN WHERE TrangThai='MO_DANG_KY' ORDER BY MaHocKy DESC;
  SELECT ISNULL(@MaHocKy,7) AS MaHocKy;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Course_ListAvailable
  @MaHocKy INT,@MaKhoa VARCHAR(10)=NULL,@Search NVARCHAR(100)=NULL,@Type VARCHAR(10)=NULL,
  @MaSV INT=NULL,@Offset INT=0,@PageSize INT=10
AS
BEGIN
  SET NOCOUNT ON;
  SELECT COUNT(*) AS TotalItems
  FROM dbo.LOPHOCPHAN lhp INNER JOIN dbo.MONHOC mh ON lhp.MaMonHoc=mh.MaMonHoc
  WHERE lhp.MaHocKy=@MaHocKy AND lhp.TrangThai='MO_DANG_KY'
    AND (@MaKhoa IS NULL OR mh.MaKhoa=@MaKhoa)
    AND (@Search IS NULL OR lhp.MaLHP LIKE N'%'+@Search+N'%' OR lhp.TenLHP LIKE N'%'+@Search+N'%' OR mh.TenMonHoc LIKE N'%'+@Search+N'%' OR mh.MaMonHoc LIKE N'%'+@Search+N'%')
    AND (@Type IS NULL OR @Type<>'PLAN' OR @MaSV IS NULL OR EXISTS(
      SELECT 1 FROM dbo.CTDT_MONHOC ctm INNER JOIN dbo.CHUONGTRINHDAOTAO ctdt ON ctm.MaCTDT=ctdt.MaCTDT
      INNER JOIN dbo.SINHVIEN sv ON sv.MaCTDT=ctdt.MaCTDT INNER JOIN dbo.HOCKY hk ON hk.MaHocKy=lhp.MaHocKy
      WHERE sv.MaSV=@MaSV AND ctm.MaMonHoc=lhp.MaMonHoc AND ctm.HocKyDuKien=((YEAR(hk.NgayBatDau)-CASE WHEN hk.TenHocKy LIKE N'%2%' THEN 1 ELSE 0 END-ctdt.NamTuyenSinh)*2)+CASE WHEN hk.TenHocKy LIKE N'%2%' THEN 2 ELSE 1 END))
    AND (@Type IS NULL OR @Type<>'OTHER' OR @MaSV IS NULL OR NOT EXISTS(
      SELECT 1 FROM dbo.CTDT_MONHOC ctm INNER JOIN dbo.CHUONGTRINHDAOTAO ctdt ON ctm.MaCTDT=ctdt.MaCTDT
      INNER JOIN dbo.SINHVIEN sv ON sv.MaCTDT=ctdt.MaCTDT INNER JOIN dbo.HOCKY hk ON hk.MaHocKy=lhp.MaHocKy
      WHERE sv.MaSV=@MaSV AND ctm.MaMonHoc=lhp.MaMonHoc AND ctm.HocKyDuKien=((YEAR(hk.NgayBatDau)-CASE WHEN hk.TenHocKy LIKE N'%2%' THEN 1 ELSE 0 END-ctdt.NamTuyenSinh)*2)+CASE WHEN hk.TenHocKy LIKE N'%2%' THEN 2 ELSE 1 END));

  SELECT lhp.MaLHP,lhp.TenLHP,lhp.MaMonHoc,mh.TenMonHoc,mh.SoTinChi,lhp.SoLuongToiDa,ISNULL(dk.SiSoHienTai,0) AS SiSoHienTai,
    CASE WHEN @MaSV IS NOT NULL AND EXISTS(
      SELECT 1 FROM dbo.CTDT_MONHOC ctm INNER JOIN dbo.CHUONGTRINHDAOTAO ctdt ON ctm.MaCTDT=ctdt.MaCTDT
      INNER JOIN dbo.SINHVIEN sv ON sv.MaCTDT=ctdt.MaCTDT INNER JOIN dbo.HOCKY hk ON hk.MaHocKy=lhp.MaHocKy
      WHERE sv.MaSV=@MaSV AND ctm.MaMonHoc=lhp.MaMonHoc AND ctm.HocKyDuKien=((YEAR(hk.NgayBatDau)-CASE WHEN hk.TenHocKy LIKE N'%2%' THEN 1 ELSE 0 END-ctdt.NamTuyenSinh)*2)+CASE WHEN hk.TenHocKy LIKE N'%2%' THEN 2 ELSE 1 END) THEN 1 ELSE 0 END AS LaTheoKeHoach,
    gv.HoTen AS TenGiangVien,lh.Thu,lh.TietBatDau,lh.SoTiet,lh.PhongHoc
  FROM dbo.LOPHOCPHAN lhp INNER JOIN dbo.MONHOC mh ON lhp.MaMonHoc=mh.MaMonHoc LEFT JOIN dbo.GIANGVIEN gv ON lhp.MaGiangVien=gv.MaGV
  OUTER APPLY(SELECT TOP 1 Thu,TietBatDau,SoTiet,PhongHoc FROM dbo.LICHHOC lh0 WHERE lh0.MaLHP=lhp.MaLHP ORDER BY Thu,TietBatDau) lh
  OUTER APPLY(SELECT COUNT(*) AS SiSoHienTai FROM dbo.DANGKYTINCHI d WHERE d.MaLHP=lhp.MaLHP AND d.TrangThai='REGISTERED') dk
  WHERE lhp.MaHocKy=@MaHocKy AND lhp.TrangThai='MO_DANG_KY'
    AND (@MaKhoa IS NULL OR mh.MaKhoa=@MaKhoa)
    AND (@Search IS NULL OR lhp.MaLHP LIKE N'%'+@Search+N'%' OR lhp.TenLHP LIKE N'%'+@Search+N'%' OR mh.TenMonHoc LIKE N'%'+@Search+N'%' OR mh.MaMonHoc LIKE N'%'+@Search+N'%')
    AND (@Type IS NULL OR @Type<>'PLAN' OR @MaSV IS NULL OR EXISTS(
      SELECT 1 FROM dbo.CTDT_MONHOC ctm INNER JOIN dbo.CHUONGTRINHDAOTAO ctdt ON ctm.MaCTDT=ctdt.MaCTDT INNER JOIN dbo.SINHVIEN sv ON sv.MaCTDT=ctdt.MaCTDT INNER JOIN dbo.HOCKY hk ON hk.MaHocKy=lhp.MaHocKy
      WHERE sv.MaSV=@MaSV AND ctm.MaMonHoc=lhp.MaMonHoc AND ctm.HocKyDuKien=((YEAR(hk.NgayBatDau)-CASE WHEN hk.TenHocKy LIKE N'%2%' THEN 1 ELSE 0 END-ctdt.NamTuyenSinh)*2)+CASE WHEN hk.TenHocKy LIKE N'%2%' THEN 2 ELSE 1 END))
    AND (@Type IS NULL OR @Type<>'OTHER' OR @MaSV IS NULL OR NOT EXISTS(
      SELECT 1 FROM dbo.CTDT_MONHOC ctm INNER JOIN dbo.CHUONGTRINHDAOTAO ctdt ON ctm.MaCTDT=ctdt.MaCTDT INNER JOIN dbo.SINHVIEN sv ON sv.MaCTDT=ctdt.MaCTDT INNER JOIN dbo.HOCKY hk ON hk.MaHocKy=lhp.MaHocKy
      WHERE sv.MaSV=@MaSV AND ctm.MaMonHoc=lhp.MaMonHoc AND ctm.HocKyDuKien=((YEAR(hk.NgayBatDau)-CASE WHEN hk.TenHocKy LIKE N'%2%' THEN 1 ELSE 0 END-ctdt.NamTuyenSinh)*2)+CASE WHEN hk.TenHocKy LIKE N'%2%' THEN 2 ELSE 1 END))
  ORDER BY lhp.MaLHP OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Semester_List
AS
BEGIN
  SET NOCOUNT ON;
  SELECT MaHocKy,TenHocKy,NamHoc,TrangThai FROM dbo.HOCKY ORDER BY MaHocKy DESC;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Semester_Current
AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @MaHocKy INT;
  SELECT TOP(1) @MaHocKy=MaHocKy FROM dbo.HOCKY WHERE TrangThai='DANG_MO' ORDER BY MaHocKy DESC;
  IF @MaHocKy IS NULL SELECT TOP(1) @MaHocKy=MaHocKy FROM dbo.LOPHOCPHAN WHERE TrangThai='MO_DANG_KY' ORDER BY MaHocKy DESC;
  SELECT MaHocKy,TenHocKy,NamHoc,TrangThai FROM dbo.HOCKY WHERE MaHocKy=@MaHocKy;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Class_CreateHomeroom
  @MaLop VARCHAR(20),@TenLop NVARCHAR(100),@MaKhoa VARCHAR(10),@KhoaHoc VARCHAR(20),@NamNhapHoc INT,@TrangThai BIT,@ActorMaTaiKhoan INT
AS
BEGIN
  SET NOCOUNT ON;
  IF NOT EXISTS(SELECT 1 FROM dbo.TAIKHOAN WHERE MaTaiKhoan=@ActorMaTaiKhoan AND TrangThai='ACTIVE' AND VaiTro IN('DAO_TAO','QUAN_TRI')
    AND ((VaiTro='DAO_TAO' AND IS_MEMBER('DAO_TAO')=1) OR (VaiTro='QUAN_TRI' AND IS_MEMBER('QUAN_TRI')=1))) THROW 52072,'Actor role mismatch.',1;
  EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=@ActorMaTaiKhoan;
  BEGIN TRY INSERT dbo.LOP(MaLop,TenLop,MaKhoa,KhoaHoc,NamNhapHoc,TrangThai) VALUES(@MaLop,@TenLop,@MaKhoa,@KhoaHoc,@NamNhapHoc,@TrangThai);
    EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL;
  END TRY BEGIN CATCH EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL; THROW; END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Class_UpdateHomeroom
  @MaLop VARCHAR(20),@TenLop NVARCHAR(100),@MaKhoa VARCHAR(10),@KhoaHoc VARCHAR(20),@NamNhapHoc INT,@TrangThai BIT,@ActorMaTaiKhoan INT
AS
BEGIN
  SET NOCOUNT ON;
  IF NOT EXISTS(SELECT 1 FROM dbo.TAIKHOAN WHERE MaTaiKhoan=@ActorMaTaiKhoan AND TrangThai='ACTIVE' AND VaiTro IN('DAO_TAO','QUAN_TRI')
    AND ((VaiTro='DAO_TAO' AND IS_MEMBER('DAO_TAO')=1) OR (VaiTro='QUAN_TRI' AND IS_MEMBER('QUAN_TRI')=1))) THROW 52072,'Actor role mismatch.',1;
  EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=@ActorMaTaiKhoan;
  BEGIN TRY UPDATE dbo.LOP SET TenLop=@TenLop,MaKhoa=@MaKhoa,KhoaHoc=@KhoaHoc,NamNhapHoc=@NamNhapHoc,TrangThai=@TrangThai WHERE MaLop=@MaLop;
    DECLARE @Affected INT=@@ROWCOUNT; SELECT @Affected AS affected;
    EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL;
  END TRY BEGIN CATCH EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL; THROW; END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Class_DeleteHomeroom @MaLop VARCHAR(20),@ActorMaTaiKhoan INT
AS
BEGIN
  SET NOCOUNT ON;
  IF NOT EXISTS(SELECT 1 FROM dbo.TAIKHOAN WHERE MaTaiKhoan=@ActorMaTaiKhoan AND TrangThai='ACTIVE' AND VaiTro IN('DAO_TAO','QUAN_TRI')
    AND ((VaiTro='DAO_TAO' AND IS_MEMBER('DAO_TAO')=1) OR (VaiTro='QUAN_TRI' AND IS_MEMBER('QUAN_TRI')=1))) THROW 52072,'Actor role mismatch.',1;
  EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=@ActorMaTaiKhoan;
  BEGIN TRY DELETE dbo.LOP WHERE MaLop=@MaLop;
    DECLARE @Affected INT=@@ROWCOUNT; SELECT @Affected AS affected;
    EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL;
  END TRY BEGIN CATCH EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL; THROW; END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Class_ListHomerooms @MaKhoa VARCHAR(10)=NULL,@NamNhapHoc INT=NULL
AS
BEGIN
  SET NOCOUNT ON;
  SELECT v.MaLop AS maLop,v.TenLop AS tenLop,v.MaKhoa AS maKhoa,v.TenKhoa AS tenKhoa,v.KhoaHoc AS khoaHoc,v.NamNhapHoc AS namNhapHoc,v.TrangThai AS trangThai,CAST(v.SiSoThucTe AS INT) AS soLuongSV
  FROM dbo.V_DanhSachLopSinhHoat v WHERE (@MaKhoa IS NULL OR v.MaKhoa=@MaKhoa) AND (@NamNhapHoc IS NULL OR v.NamNhapHoc=@NamNhapHoc)
  ORDER BY v.NamNhapHoc DESC,v.MaKhoa,v.MaLop;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Class_GetHomeroom @MaLop VARCHAR(20)
AS
BEGIN
  SET NOCOUNT ON;
  SELECT l.MaLop AS maLop,l.TenLop AS tenLop,l.MaKhoa AS maKhoa,k.TenKhoa AS tenKhoa,l.KhoaHoc AS khoaHoc,l.NamNhapHoc AS namNhapHoc,l.TrangThai AS trangThai
  FROM dbo.LOP l INNER JOIN dbo.KHOA k ON l.MaKhoa=k.MaKhoa WHERE l.MaLop=@MaLop;
  SELECT sv.MaSV AS maSV,sv.MaCTDT AS maCTDT,sv.MaSinhVien AS maSinhVien,sv.HoTen AS hoTen,sv.NgaySinh AS ngaySinh,sv.Email AS email,sv.SoDienThoai AS soDienThoai,sv.TrangThai AS trangThai
  FROM dbo.SINHVIEN sv WHERE sv.MaLop=@MaLop ORDER BY sv.MaSinhVien;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Registration_GetById @MaDangKy BIGINT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT dk.MaDangKy,dk.MaSV,dk.MaLHP,dk.NgayDangKy,dk.TrangThai,lhp.MaMonHoc,lhp.MaHocKy
  FROM dbo.DANGKYTINCHI dk INNER JOIN dbo.LOPHOCPHAN lhp ON dk.MaLHP=lhp.MaLHP WHERE dk.MaDangKy=@MaDangKy;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Registration_ListStudent @MaSV INT,@MaHocKy INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT dk.MaDangKy,dk.MaLHP,lhp.TenLHP,mh.MaMonHoc,mh.TenMonHoc,mh.SoTinChi,gv.HoTen AS TenGiangVien,lh.Thu,lh.TietBatDau,lh.SoTiet,lh.PhongHoc,dk.NgayDangKy,dk.TrangThai
  FROM dbo.DANGKYTINCHI dk INNER JOIN dbo.LOPHOCPHAN lhp ON dk.MaLHP=lhp.MaLHP INNER JOIN dbo.MONHOC mh ON lhp.MaMonHoc=mh.MaMonHoc
  LEFT JOIN dbo.GIANGVIEN gv ON lhp.MaGiangVien=gv.MaGV LEFT JOIN dbo.LICHHOC lh ON lhp.MaLHP=lh.MaLHP
  WHERE dk.MaSV=@MaSV AND lhp.MaHocKy=@MaHocKy AND dk.TrangThai='REGISTERED' ORDER BY lhp.MaLHP;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Lecturer_Schedule @MaGV INT,@MaHocKy INT=NULL
AS
BEGIN
  SET NOCOUNT ON;
  SELECT lhp.MaLHP,lhp.TenLHP,lhp.MaMonHoc,mh.TenMonHoc,mh.SoTinChi,hk.MaHocKy,hk.NamHoc,hk.TenHocKy,lh.MaLichHoc,lh.Thu,lh.TietBatDau,lh.SoTiet,lh.PhongHoc
  FROM dbo.LOPHOCPHAN lhp INNER JOIN dbo.MONHOC mh ON lhp.MaMonHoc=mh.MaMonHoc INNER JOIN dbo.HOCKY hk ON lhp.MaHocKy=hk.MaHocKy
  INNER JOIN dbo.LICHHOC lh ON lhp.MaLHP=lh.MaLHP WHERE lhp.MaGiangVien=@MaGV AND (@MaHocKy IS NULL OR lhp.MaHocKy=@MaHocKy) ORDER BY lh.Thu,lh.TietBatDau;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Lecturer_Classes @MaGV INT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT lhp.MaLHP,lhp.TenLHP,lhp.MaMonHoc,mh.TenMonHoc,mh.SoTinChi,hk.TenHocKy,hk.NamHoc,lhp.SoLuongToiDa,ISNULL(dk.SiSoHienTai,0) AS SiSoHienTai,lhp.TrangThai
  FROM dbo.LOPHOCPHAN lhp INNER JOIN dbo.MONHOC mh ON lhp.MaMonHoc=mh.MaMonHoc INNER JOIN dbo.HOCKY hk ON lhp.MaHocKy=hk.MaHocKy
  OUTER APPLY(SELECT COUNT(*) AS SiSoHienTai FROM dbo.DANGKYTINCHI d WHERE d.MaLHP=lhp.MaLHP AND d.TrangThai='REGISTERED') dk
  WHERE lhp.MaGiangVien=@MaGV ORDER BY hk.MaHocKy DESC,lhp.MaLHP ASC;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Lecturer_ClassStudents @MaLHP VARCHAR(30)
AS
BEGIN
  SET NOCOUNT ON;
  SELECT dk.MaDangKy,sv.MaSV,sv.MaSinhVien,sv.HoTen AS HoTenSinhVien,COALESCE(l.TenLop,sv.MaLop) AS LopHoc,sv.MaLop,bd.DiemQuaTrinh,bd.DiemGiuaKy,bd.DiemCuoiKy,bd.DiemTongKet,bd.DiemChu,bd.KetQua
  FROM dbo.DANGKYTINCHI dk INNER JOIN dbo.SINHVIEN sv ON dk.MaSV=sv.MaSV LEFT JOIN dbo.LOP l ON sv.MaLop=l.MaLop
  LEFT JOIN dbo.V_BangDiemChiTiet bd ON bd.MaDangKy=dk.MaDangKy WHERE dk.MaLHP=@MaLHP AND dk.TrangThai='REGISTERED' ORDER BY sv.MaSinhVien ASC;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Lecturer_IsAssigned @MaGV INT,@MaLHP VARCHAR(30)
AS
BEGIN
  SET NOCOUNT ON;
  SELECT CAST(CASE WHEN EXISTS(SELECT 1 FROM dbo.LOPHOCPHAN WHERE MaLHP=@MaLHP AND MaGiangVien=@MaGV) THEN 1 ELSE 0 END AS BIT) AS Assigned;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Lecturer_UpdateClassGrades @MaLHP VARCHAR(30),@GradesJson NVARCHAR(MAX),@ActorMaTaiKhoan INT
AS
BEGIN
  SET NOCOUNT ON;
  IF ISJSON(@GradesJson)<>1 THROW 50031,'Danh sách điểm không hợp lệ.',1;
  DECLARE @MaGV INT;
  SELECT @MaGV=MaGV FROM dbo.TAIKHOAN WHERE MaTaiKhoan=@ActorMaTaiKhoan AND VaiTro='GIANG_VIEN' AND TrangThai='ACTIVE' AND IS_MEMBER('GIANG_VIEN')=1;
  IF @MaGV IS NULL THROW 50032,'Tài khoản giảng viên không hoạt động hoặc không hợp lệ.',1;
  IF NOT EXISTS(SELECT 1 FROM dbo.LOPHOCPHAN WHERE MaLHP=@MaLHP AND MaGiangVien=@MaGV) THROW 50033,'Giảng viên không được phân công lớp học phần này.',1;
  DECLARE @Grades TABLE(MaDangKy BIGINT PRIMARY KEY,HasDiemQuaTrinh BIT,DiemQuaTrinh DECIMAL(4,2),HasDiemGiuaKy BIT,DiemGiuaKy DECIMAL(4,2),HasDiemCuoiKy BIT,DiemCuoiKy DECIMAL(4,2));
  INSERT @Grades SELECT MaDangKy,HasDiemQuaTrinh,DiemQuaTrinh,HasDiemGiuaKy,DiemGiuaKy,HasDiemCuoiKy,DiemCuoiKy
  FROM OPENJSON(@GradesJson) WITH(MaDangKy BIGINT '$.maDangKy',HasDiemQuaTrinh BIT '$.hasDiemQuaTrinh',DiemQuaTrinh DECIMAL(4,2) '$.diemQuaTrinh',HasDiemGiuaKy BIT '$.hasDiemGiuaKy',DiemGiuaKy DECIMAL(4,2) '$.diemGiuaKy',HasDiemCuoiKy BIT '$.hasDiemCuoiKy',DiemCuoiKy DECIMAL(4,2) '$.diemCuoiKy');
  IF EXISTS(SELECT 1 FROM @Grades g LEFT JOIN dbo.DANGKYTINCHI dk ON dk.MaDangKy=g.MaDangKy AND dk.MaLHP=@MaLHP AND dk.TrangThai='REGISTERED' WHERE dk.MaDangKy IS NULL) THROW 50030,'Mã đăng ký không thuộc lớp học phần này hoặc không còn hiệu lực.',1;
  EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=@ActorMaTaiKhoan;
  BEGIN TRY
    BEGIN TRANSACTION;
    UPDATE ds SET DiemQuaTrinh=CASE WHEN g.HasDiemQuaTrinh=1 THEN g.DiemQuaTrinh ELSE ds.DiemQuaTrinh END,DiemGiuaKy=CASE WHEN g.HasDiemGiuaKy=1 THEN g.DiemGiuaKy ELSE ds.DiemGiuaKy END,DiemCuoiKy=CASE WHEN g.HasDiemCuoiKy=1 THEN g.DiemCuoiKy ELSE ds.DiemCuoiKy END
    FROM dbo.DIEMSO ds INNER JOIN @Grades g ON g.MaDangKy=ds.MaDangKy;
    INSERT dbo.DIEMSO(MaDangKy,DiemQuaTrinh,DiemGiuaKy,DiemCuoiKy,TyTrongQT,TyTrongGK,TyTrongCK)
    SELECT g.MaDangKy,g.DiemQuaTrinh,g.DiemGiuaKy,g.DiemCuoiKy,20,30,50 FROM @Grades g WHERE NOT EXISTS(SELECT 1 FROM dbo.DIEMSO ds WHERE ds.MaDangKy=g.MaDangKy);
    COMMIT TRANSACTION;
    EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL;
  END TRY BEGIN CATCH
    IF @@TRANCOUNT>0 ROLLBACK TRANSACTION;
    EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL;
    THROW;
  END CATCH;
  SELECT COUNT(*) AS updatedCount FROM @Grades;
END;
GO
USE [DBMS330284];
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Student_Schedule @MaSV INT,@MaHocKy INT=NULL
AS
BEGIN
 SET NOCOUNT ON;
 SELECT MaSV,MaSinhVien,HoTenSinhVien,MaHocKy,NamHoc,TenHocKy,MaLHP,MaMonHoc,TenMonHoc,TenLHP,HoTenGiangVien,Thu,TietBatDau,SoTiet,PhongHoc
 FROM dbo.V_ThoiKhoaBieuSinhVien WHERE MaSV=@MaSV AND (@MaHocKy IS NULL OR MaHocKy=@MaHocKy) ORDER BY Thu,TietBatDau;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Student_Grades @MaSV INT,@MaHocKy INT=NULL
AS
BEGIN
 SET NOCOUNT ON;
 SELECT MaDangKy,MaSV,MaSinhVien,HoTenSinhVien,MaHocKy,NamHoc,TenHocKy,MaLHP,MaMonHoc,TenMonHoc,SoTinChi,DiemQuaTrinh,DiemGiuaKy,DiemCuoiKy,TyTrongQT,TyTrongGK,TyTrongCK,DiemTongKet,DiemChu,KetQua
 FROM dbo.V_BangDiemChiTiet WHERE MaSV=@MaSV AND (@MaHocKy IS NULL OR MaHocKy=@MaHocKy) ORDER BY MaHocKy,MaMonHoc;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Student_Tuition @MaSV INT
AS
BEGIN
 SET NOCOUNT ON;
 SELECT hp.MaHocPhi,hp.MaSV,hp.MaSinhVien,hp.HoTenSinhVien,hp.MaHocKy,hp.NamHoc,hp.TenHocKy,hp.SoTinChi,hp.DonGiaTinChi,hp.TongTien,hp.SoTienDaThanhToan,hp.SoTienConLai,hp.TrangThai,hp.NgayCapNhat,
   ISNULL(pending.SoGiaoDich,0) AS SoGiaoDichChoDuyet,ISNULL(pending.TongTienChoDuyet,0) AS SoTienChoDuyet
 FROM dbo.V_HocPhiSinhVien hp OUTER APPLY(SELECT COUNT(*) AS SoGiaoDich,SUM(SoTien) AS TongTienChoDuyet FROM dbo.CHITIETTHANHTOAN ct WHERE ct.MaHocPhi=hp.MaHocPhi AND ct.TrangThai='CHO_XAC_NHAN') pending
 WHERE hp.MaSV=@MaSV ORDER BY hp.MaHocKy DESC;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Student_PaymentHistory @MaSV INT,@Offset INT,@PageSize INT
AS
BEGIN
 SET NOCOUNT ON;
 SELECT COUNT(*) AS TotalItems FROM dbo.CHITIETTHANHTOAN ct INNER JOIN dbo.HOCPHI hp ON ct.MaHocPhi=hp.MaHocPhi WHERE hp.MaSV=@MaSV;
 SELECT ct.MaThanhToan,ct.MaHocPhi,ct.SoTien,ct.PhuongThuc,ct.TrangThai,ct.NgayThanhToan,ct.NgayXacNhan,hk.TenHocKy,hk.NamHoc
 FROM dbo.CHITIETTHANHTOAN ct INNER JOIN dbo.HOCPHI hp ON ct.MaHocPhi=hp.MaHocPhi INNER JOIN dbo.HOCKY hk ON hp.MaHocKy=hk.MaHocKy
 WHERE hp.MaSV=@MaSV ORDER BY ct.NgayThanhToan DESC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Student_Profile @MaSV INT
AS
BEGIN
 SET NOCOUNT ON;
 SELECT sv.MaSV,sv.MaSinhVien,sv.HoTen,sv.NgaySinh,sv.Email,sv.SoDienThoai,sv.MaKhoa,k.TenKhoa,sv.MaLop,l.TenLop,l.KhoaHoc,sv.TrangThai,sv.NgayTao,tk.Username,tk.VaiTro,tk.TrangThai AS TrangThaiTaiKhoan,tk.LanDangNhapCuoi
 FROM dbo.SINHVIEN sv INNER JOIN dbo.KHOA k ON sv.MaKhoa=k.MaKhoa LEFT JOIN dbo.LOP l ON sv.MaLop=l.MaLop LEFT JOIN dbo.TAIKHOAN tk ON sv.MaSV=tk.MaSV WHERE sv.MaSV=@MaSV;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Student_Curriculum @MaSV INT
AS
BEGIN
 SET NOCOUNT ON;
 SELECT sv.MaSV,c.MaCTDT,c.TenCTDT,c.KhoaHoc,c.NamTuyenSinh,c.TongTinChiYeuCau,c.ThoiGianDaoTao,c.TrangThai AS TrangThaiCTDT,n.MaKhoa,k.TenKhoa,n.TenNganh AS Nganh,
  mh.MaMonHoc,mh.MaKhoa AS MaKhoaMon,km.TenKhoa AS TenKhoaMon,mh.TenMonHoc,mh.SoTinChi,mh.SoTietLyThuyet,mh.SoTietThucHanh,mh.MoTa,mh.TrangThai AS TrangThaiMon,ctm.HocKyDuKien,ctm.LoaiMon,ctm.ThuTu,
  (SELECT STRING_AGG(CONVERT(NVARCHAR(MAX),CONCAT(pre.MaMonHoc,N' - ',pre.TenMonHoc)),N'; ') FROM dbo.MONHOCTIENQUYET mtq INNER JOIN dbo.MONHOC pre ON pre.MaMonHoc=mtq.MaMonTienQuyet WHERE mtq.MaMonHoc=mh.MaMonHoc) AS HocPhanTienQuyet,
  (SELECT mtq.MaMonTienQuyet AS maMonHoc,pre.TenMonHoc AS tenMonHoc,mtq.MucDo AS mucDo FROM dbo.MONHOCTIENQUYET mtq INNER JOIN dbo.MONHOC pre ON pre.MaMonHoc=mtq.MaMonTienQuyet WHERE mtq.MaMonHoc=mh.MaMonHoc FOR JSON PATH) AS HocPhanTienQuyetChiTiet
 FROM dbo.SINHVIEN sv LEFT JOIN dbo.CHUONGTRINHDAOTAO c ON c.MaCTDT=sv.MaCTDT LEFT JOIN dbo.NGANH n ON n.MaNganh=c.MaNganh LEFT JOIN dbo.KHOA k ON k.MaKhoa=n.MaKhoa
 LEFT JOIN dbo.CTDT_MONHOC ctm ON ctm.MaCTDT=c.MaCTDT LEFT JOIN dbo.MONHOC mh ON mh.MaMonHoc=ctm.MaMonHoc LEFT JOIN dbo.KHOA km ON km.MaKhoa=mh.MaKhoa
 WHERE sv.MaSV=@MaSV ORDER BY ctm.HocKyDuKien,ctm.ThuTu,mh.MaMonHoc;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Tuition_CreatePayment @MaHocPhi INT,@SoTien DECIMAL(18,2),@PhuongThuc VARCHAR(20),@OwnerMaSV INT=NULL,@ActorMaTaiKhoan INT
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 BEGIN TRY
  BEGIN TRANSACTION;
  DECLARE @MaSV INT,@MaHocKy INT,@TongTien DECIMAL(18,2),@DaThanhToan DECIMAL(18,2),@TrangThai VARCHAR(20);
  SELECT @MaSV=MaSV,@MaHocKy=MaHocKy,@TongTien=TongTien,@DaThanhToan=SoTienDaThanhToan,@TrangThai=TrangThai
  FROM dbo.HOCPHI WITH(UPDLOCK,HOLDLOCK) WHERE MaHocPhi=@MaHocPhi;
  IF @MaSV IS NULL THROW 51501,'Tuition record not found.',1;
  IF @OwnerMaSV IS NOT NULL AND @MaSV<>@OwnerMaSV THROW 51502,'Payment owner mismatch.',1;
  IF NOT EXISTS(SELECT 1 FROM dbo.TAIKHOAN WHERE MaTaiKhoan=@ActorMaTaiKhoan AND TrangThai='ACTIVE'
    AND ((VaiTro='SINH_VIEN' AND MaSV=@MaSV AND IS_MEMBER('SINH_VIEN')=1)
      OR (VaiTro='DAO_TAO' AND IS_MEMBER('DAO_TAO')=1)
      OR (VaiTro='QUAN_TRI' AND IS_MEMBER('QUAN_TRI')=1))) THROW 51503,'Invalid payment actor.',1;
  IF @SoTien<=0 OR @SoTien>@TongTien-@DaThanhToan THROW 51504,'Payment exceeds the outstanding balance.',1;
  IF EXISTS(SELECT 1 FROM dbo.CHITIETTHANHTOAN WHERE MaHocPhi=@MaHocPhi AND TrangThai='CHO_XAC_NHAN') THROW 51505,'A payment is already pending.',1;
  EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=@ActorMaTaiKhoan;
  DECLARE @Inserted TABLE(MaThanhToan BIGINT,MaHocPhi INT,SoTien DECIMAL(18,2),PhuongThuc VARCHAR(20),TrangThai VARCHAR(20),NgayThanhToan DATETIME2);
  INSERT dbo.CHITIETTHANHTOAN(MaHocPhi,SoTien,PhuongThuc,TrangThai,NgayThanhToan)
  OUTPUT INSERTED.MaThanhToan,INSERTED.MaHocPhi,INSERTED.SoTien,INSERTED.PhuongThuc,INSERTED.TrangThai,INSERTED.NgayThanhToan INTO @Inserted
  VALUES(@MaHocPhi,@SoTien,@PhuongThuc,'CHO_XAC_NHAN',SYSUTCDATETIME());
  SELECT i.*,hp.MaSV,hp.MaHocKy,hp.TongTien,hp.SoTienDaThanhToan,(hp.TongTien-hp.SoTienDaThanhToan) AS SoTienConLai,hp.TrangThai AS TrangThaiHocPhi,hp.NgayCapNhat
  FROM @Inserted i INNER JOIN dbo.HOCPHI hp ON hp.MaHocPhi=i.MaHocPhi;
  EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL;
  COMMIT TRANSACTION;
 END TRY BEGIN CATCH
  IF @@TRANCOUNT>0 ROLLBACK TRANSACTION;
  EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL;
  THROW;
 END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Tuition_PendingPayments @MaLop VARCHAR(20)=NULL
AS
BEGIN
 SET NOCOUNT ON;
 SELECT ct.MaThanhToan,ct.MaHocPhi,ct.SoTien,ct.PhuongThuc,ct.TrangThai,ct.NgayThanhToan,hp.MaSV,sv.MaSinhVien,sv.HoTen AS HoTenSinhVien,sv.MaLop,l.TenLop AS TenLopSinhVien,hk.TenHocKy,hk.NamHoc
 FROM dbo.CHITIETTHANHTOAN ct INNER JOIN dbo.HOCPHI hp ON ct.MaHocPhi=hp.MaHocPhi INNER JOIN dbo.SINHVIEN sv ON hp.MaSV=sv.MaSV
 LEFT JOIN dbo.LOP l ON sv.MaLop=l.MaLop INNER JOIN dbo.HOCKY hk ON hp.MaHocKy=hk.MaHocKy
 WHERE ct.TrangThai='CHO_XAC_NHAN' AND (@MaLop IS NULL OR sv.MaLop=@MaLop) ORDER BY ct.NgayThanhToan DESC;
END;
GO
USE [DBMS330284];
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_Course_List
AS BEGIN SET NOCOUNT ON; SELECT MaMonHoc AS maMonHoc,MaKhoa AS maKhoa,TenMonHoc AS tenMonHoc,SoTinChi AS soTinChi,SoTietLyThuyet AS soTietLyThuyet,SoTietThucHanh AS soTietThucHanh,MoTa AS moTa,TrangThai AS trangThai FROM dbo.MONHOC ORDER BY MaMonHoc; END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_Course_Create @MaMonHoc VARCHAR(15),@MaKhoa VARCHAR(10),@TenMonHoc NVARCHAR(150),@SoTinChi TINYINT,@SoTietLyThuyet SMALLINT,@SoTietThucHanh SMALLINT,@MoTa NVARCHAR(500)=NULL,@TrangThai BIT
AS BEGIN SET NOCOUNT ON; INSERT dbo.MONHOC(MaMonHoc,MaKhoa,TenMonHoc,SoTinChi,SoTietLyThuyet,SoTietThucHanh,MoTa,TrangThai) VALUES(@MaMonHoc,@MaKhoa,@TenMonHoc,@SoTinChi,@SoTietLyThuyet,@SoTietThucHanh,@MoTa,@TrangThai); END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_Course_Update @MaMonHoc VARCHAR(15),@MaKhoa VARCHAR(10),@TenMonHoc NVARCHAR(150),@SoTinChi TINYINT,@SoTietLyThuyet SMALLINT,@SoTietThucHanh SMALLINT,@MoTa NVARCHAR(500)=NULL,@TrangThai BIT
AS BEGIN SET NOCOUNT ON; UPDATE dbo.MONHOC SET MaKhoa=@MaKhoa,TenMonHoc=@TenMonHoc,SoTinChi=@SoTinChi,SoTietLyThuyet=@SoTietLyThuyet,SoTietThucHanh=@SoTietThucHanh,MoTa=@MoTa,TrangThai=@TrangThai WHERE MaMonHoc=@MaMonHoc; SELECT @@ROWCOUNT AS changed; END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_Course_Delete @MaMonHoc VARCHAR(15)
AS BEGIN SET NOCOUNT ON; DELETE dbo.MONHOC WHERE MaMonHoc=@MaMonHoc; SELECT @@ROWCOUNT AS changed; END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_CurriculumCourse_Create @MaCTDT VARCHAR(24),@MaMonHoc VARCHAR(15),@MaKhoa VARCHAR(10),@TenMonHoc NVARCHAR(150),@SoTinChi TINYINT,@SoTietLyThuyet SMALLINT,@SoTietThucHanh SMALLINT,@MoTa NVARCHAR(500)=NULL,@TrangThai BIT,@HocKyDuKien TINYINT,@LoaiMon VARCHAR(20),@ThuTu SMALLINT=NULL,@PrerequisitesJson NVARCHAR(MAX)=N'[]'
AS
BEGIN SET NOCOUNT ON; SET XACT_ABORT ON; IF ISJSON(@PrerequisitesJson)<>1 THROW 50041,'Prerequisite data is invalid.',1;
BEGIN TRY BEGIN TRANSACTION;
 INSERT dbo.MONHOC(MaMonHoc,MaKhoa,TenMonHoc,SoTinChi,SoTietLyThuyet,SoTietThucHanh,MoTa,TrangThai) VALUES(@MaMonHoc,@MaKhoa,@TenMonHoc,@SoTinChi,@SoTietLyThuyet,@SoTietThucHanh,@MoTa,@TrangThai);
 INSERT dbo.CTDT_MONHOC(MaCTDT,MaMonHoc,HocKyDuKien,LoaiMon,ThuTu) VALUES(@MaCTDT,@MaMonHoc,@HocKyDuKien,@LoaiMon,@ThuTu);
 INSERT dbo.MONHOCTIENQUYET(MaMonHoc,MaMonTienQuyet,MucDo) SELECT @MaMonHoc,MaMonTienQuyet,MucDo FROM OPENJSON(@PrerequisitesJson) WITH(MaMonTienQuyet VARCHAR(15) '$.maMonTienQuyet',MucDo VARCHAR(20) '$.mucDo');
 COMMIT TRANSACTION; END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK TRANSACTION; THROW; END CATCH; END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_CurriculumCourse_Update @MaCTDT VARCHAR(24),@MaMonHoc VARCHAR(15),@MaKhoa VARCHAR(10),@TenMonHoc NVARCHAR(150),@SoTinChi TINYINT,@SoTietLyThuyet SMALLINT,@SoTietThucHanh SMALLINT,@MoTa NVARCHAR(500)=NULL,@TrangThai BIT,@HocKyDuKien TINYINT,@LoaiMon VARCHAR(20),@ThuTu SMALLINT=NULL,@PrerequisitesJson NVARCHAR(MAX)=N'[]'
AS
BEGIN SET NOCOUNT ON; SET XACT_ABORT ON; IF ISJSON(@PrerequisitesJson)<>1 THROW 50041,'Prerequisite data is invalid.',1;
IF NOT EXISTS(SELECT 1 FROM dbo.CTDT_MONHOC WHERE MaCTDT=@MaCTDT AND MaMonHoc=@MaMonHoc) THROW 52051,'Curriculum course was not found.',1;
BEGIN TRY BEGIN TRANSACTION;
 UPDATE dbo.MONHOC SET MaKhoa=@MaKhoa,TenMonHoc=@TenMonHoc,SoTinChi=@SoTinChi,SoTietLyThuyet=@SoTietLyThuyet,SoTietThucHanh=@SoTietThucHanh,MoTa=@MoTa,TrangThai=@TrangThai WHERE MaMonHoc=@MaMonHoc;
 UPDATE dbo.CTDT_MONHOC SET HocKyDuKien=@HocKyDuKien,LoaiMon=@LoaiMon,ThuTu=@ThuTu WHERE MaCTDT=@MaCTDT AND MaMonHoc=@MaMonHoc;
 DELETE dbo.MONHOCTIENQUYET WHERE MaMonHoc=@MaMonHoc;
 INSERT dbo.MONHOCTIENQUYET(MaMonHoc,MaMonTienQuyet,MucDo) SELECT @MaMonHoc,MaMonTienQuyet,MucDo FROM OPENJSON(@PrerequisitesJson) WITH(MaMonTienQuyet VARCHAR(15) '$.maMonTienQuyet',MucDo VARCHAR(20) '$.mucDo');
 COMMIT TRANSACTION; END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK TRANSACTION; THROW; END CATCH; END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_CurriculumCourse_Delete @MaCTDT VARCHAR(24),@MaMonHoc VARCHAR(15)
AS BEGIN SET NOCOUNT ON; DELETE dbo.CTDT_MONHOC WHERE MaCTDT=@MaCTDT AND MaMonHoc=@MaMonHoc; SELECT @@ROWCOUNT AS changed; END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_Class_Create @MaLHP VARCHAR(20),@MaMonHoc VARCHAR(15),@MaHocKy INT,@MaGiangVien INT=NULL,@TenLHP NVARCHAR(100),@SoLuongToiDa INT,@TrangThai VARCHAR(20),@SchedulesJson NVARCHAR(MAX)=N'[]'
AS
BEGIN SET NOCOUNT ON; SET XACT_ABORT ON; IF ISJSON(@SchedulesJson)<>1 THROW 50042,'Schedule data is invalid.',1;
BEGIN TRY BEGIN TRANSACTION;
 INSERT dbo.LOPHOCPHAN(MaLHP,MaMonHoc,MaHocKy,MaGiangVien,TenLHP,SoLuongToiDa,TrangThai) VALUES(@MaLHP,@MaMonHoc,@MaHocKy,@MaGiangVien,@TenLHP,@SoLuongToiDa,'DA_KHOA');
 INSERT dbo.LICHHOC(MaLHP,Thu,TietBatDau,SoTiet,PhongHoc) SELECT @MaLHP,Thu,TietBatDau,SoTiet,PhongHoc FROM OPENJSON(@SchedulesJson) WITH(Thu TINYINT '$.thu',TietBatDau TINYINT '$.tietBatDau',SoTiet TINYINT '$.soTiet',PhongHoc VARCHAR(20) '$.phongHoc');
 IF @TrangThai<>'DA_KHOA' UPDATE dbo.LOPHOCPHAN SET TrangThai=@TrangThai WHERE MaLHP=@MaLHP;
 COMMIT TRANSACTION; END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK TRANSACTION; THROW; END CATCH; END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_Class_Update @MaLHP VARCHAR(20),@MaMonHoc VARCHAR(15),@MaHocKy INT,@MaGiangVien INT=NULL,@TenLHP NVARCHAR(100),@SoLuongToiDa INT,@TrangThai VARCHAR(20)=NULL,@SchedulesJson NVARCHAR(MAX)=NULL
AS
BEGIN SET NOCOUNT ON; SET XACT_ABORT ON; IF @SchedulesJson IS NOT NULL AND ISJSON(@SchedulesJson)<>1 THROW 50042,'Schedule data is invalid.',1;
BEGIN TRY BEGIN TRANSACTION;
 DECLARE @CurrentStatus VARCHAR(20); SELECT @CurrentStatus=TrangThai FROM dbo.LOPHOCPHAN WITH(UPDLOCK,HOLDLOCK) WHERE MaLHP=@MaLHP;
 IF @CurrentStatus IS NULL THROW 52061,'Class section was not found.',1;
 UPDATE dbo.LOPHOCPHAN SET MaMonHoc=@MaMonHoc,MaHocKy=@MaHocKy,MaGiangVien=@MaGiangVien,TenLHP=@TenLHP,SoLuongToiDa=@SoLuongToiDa,TrangThai='DA_KHOA' WHERE MaLHP=@MaLHP;
 IF @SchedulesJson IS NOT NULL BEGIN DELETE dbo.LICHHOC WHERE MaLHP=@MaLHP; INSERT dbo.LICHHOC(MaLHP,Thu,TietBatDau,SoTiet,PhongHoc) SELECT @MaLHP,Thu,TietBatDau,SoTiet,PhongHoc FROM OPENJSON(@SchedulesJson) WITH(Thu TINYINT '$.thu',TietBatDau TINYINT '$.tietBatDau',SoTiet TINYINT '$.soTiet',PhongHoc VARCHAR(20) '$.phongHoc'); END;
 IF COALESCE(@TrangThai,@CurrentStatus)<>'DA_KHOA' UPDATE dbo.LOPHOCPHAN SET TrangThai=COALESCE(@TrangThai,@CurrentStatus) WHERE MaLHP=@MaLHP;
 COMMIT TRANSACTION; SELECT COALESCE(@TrangThai,@CurrentStatus) AS trangThai; END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK TRANSACTION; THROW; END CATCH; END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_Class_Delete @MaLHP VARCHAR(20)
AS BEGIN SET NOCOUNT ON; SET XACT_ABORT ON; BEGIN TRY BEGIN TRANSACTION;
 IF NOT EXISTS(SELECT 1 FROM dbo.LOPHOCPHAN WITH(UPDLOCK,HOLDLOCK) WHERE MaLHP=@MaLHP) THROW 52061,'Class section was not found.',1;
 IF EXISTS(SELECT 1 FROM dbo.DANGKYTINCHI WHERE MaLHP=@MaLHP) THROW 52060,'Cannot delete a class with registration history.',1;
 UPDATE dbo.LOPHOCPHAN SET TrangThai='DA_KHOA' WHERE MaLHP=@MaLHP;
 DELETE dbo.LICHHOC WHERE MaLHP=@MaLHP; DELETE dbo.LOPHOCPHAN WHERE MaLHP=@MaLHP;
 COMMIT TRANSACTION; END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK TRANSACTION; THROW; END CATCH; END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_Class_Get @MaLHP VARCHAR(20)
AS BEGIN SET NOCOUNT ON; SELECT lhp.MaLHP AS maLHP,lhp.MaMonHoc AS maMonHoc,lhp.MaHocKy AS maHocKy,lhp.MaGiangVien AS maGiangVien,lhp.TenLHP AS tenLHP,lhp.SoLuongToiDa AS soLuongToiDa,lhp.TrangThai AS trangThai,
(SELECT lh.MaLichHoc AS maLichHoc,lh.Thu AS thu,lh.TietBatDau AS tietBatDau,lh.SoTiet AS soTiet,lh.PhongHoc AS phongHoc FROM dbo.LICHHOC lh WHERE lh.MaLHP=lhp.MaLHP ORDER BY lh.Thu,lh.TietBatDau FOR JSON PATH) AS schedules
FROM dbo.LOPHOCPHAN lhp WHERE lhp.MaLHP=@MaLHP; END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_LecturerOptions @MaKhoa VARCHAR(10)=NULL,@TrangThai VARCHAR(20)=NULL
AS BEGIN SET NOCOUNT ON; SELECT MaGV AS maGV,HoTen AS hoTen,MaKhoa AS maKhoa,TrangThai AS trangThai FROM dbo.GIANGVIEN WHERE (@MaKhoa IS NULL OR MaKhoa=@MaKhoa) AND (@TrangThai IS NULL OR TrangThai=@TrangThai) ORDER BY HoTen,MaGV; END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_ClassSchedule_Create @MaLHP VARCHAR(20),@Thu TINYINT,@TietBatDau TINYINT,@SoTiet TINYINT,@PhongHoc VARCHAR(20)
AS BEGIN SET NOCOUNT ON; DECLARE @Created TABLE(MaLichHoc INT); INSERT dbo.LICHHOC(MaLHP,Thu,TietBatDau,SoTiet,PhongHoc) OUTPUT INSERTED.MaLichHoc INTO @Created VALUES(@MaLHP,@Thu,@TietBatDau,@SoTiet,@PhongHoc); SELECT MaLichHoc FROM @Created; END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_ClassSchedule_Update @MaLHP VARCHAR(20),@MaLichHoc INT,@Thu TINYINT,@TietBatDau TINYINT,@SoTiet TINYINT,@PhongHoc VARCHAR(20)
AS BEGIN SET NOCOUNT ON; UPDATE dbo.LICHHOC SET Thu=@Thu,TietBatDau=@TietBatDau,SoTiet=@SoTiet,PhongHoc=@PhongHoc WHERE MaLichHoc=@MaLichHoc AND MaLHP=@MaLHP; SELECT @@ROWCOUNT AS changed; END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_ClassSchedule_Delete @MaLHP VARCHAR(20),@MaLichHoc INT
AS BEGIN SET NOCOUNT ON; DELETE dbo.LICHHOC WHERE MaLichHoc=@MaLichHoc AND MaLHP=@MaLHP; SELECT @@ROWCOUNT AS changed; END;
GO
USE [DBMS330284];
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_Users_List @VaiTro VARCHAR(20)=NULL,@TrangThai VARCHAR(20)=NULL,@MaLop VARCHAR(20)=NULL,@Search NVARCHAR(100)=NULL,@Offset INT=0,@PageSize INT=10
AS BEGIN SET NOCOUNT ON;
SELECT COUNT(*) AS TotalItems FROM dbo.V_TaiKhoanNguoiDung WHERE (@VaiTro IS NULL OR VaiTro=@VaiTro) AND (@TrangThai IS NULL OR TrangThai=@TrangThai) AND (@MaLop IS NULL OR MaLop=@MaLop) AND (@Search IS NULL OR Username LIKE N'%'+@Search+N'%' OR HoTenSinhVien LIKE N'%'+@Search+N'%' OR HoTenGiangVien LIKE N'%'+@Search+N'%');
SELECT MaTaiKhoan,Username,VaiTro,TrangThai,MaSV,MaSinhVien,HoTenSinhVien,EmailSinhVien,MaLop,TenLopSinhVien,MaGV,MaGiangVien,HoTenGiangVien,EmailGiangVien,NgayTao,LanDangNhapCuoi
FROM dbo.V_TaiKhoanNguoiDung WHERE (@VaiTro IS NULL OR VaiTro=@VaiTro) AND (@TrangThai IS NULL OR TrangThai=@TrangThai) AND (@MaLop IS NULL OR MaLop=@MaLop) AND (@Search IS NULL OR Username LIKE N'%'+@Search+N'%' OR HoTenSinhVien LIKE N'%'+@Search+N'%' OR HoTenGiangVien LIKE N'%'+@Search+N'%') ORDER BY MaTaiKhoan DESC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_UserStatus @Username VARCHAR(50),@TrangThai VARCHAR(20),@ActorMaTaiKhoan INT
AS BEGIN SET NOCOUNT ON; SET XACT_ABORT ON; BEGIN TRY BEGIN TRANSACTION;
DECLARE @TargetId INT,@TargetRole VARCHAR(20),@CurrentStatus VARCHAR(20),@ActorRole VARCHAR(20);
SELECT @TargetId=MaTaiKhoan,@TargetRole=VaiTro,@CurrentStatus=TrangThai FROM dbo.TAIKHOAN WITH(UPDLOCK,HOLDLOCK) WHERE Username=@Username;
SELECT @ActorRole=VaiTro FROM dbo.TAIKHOAN WHERE MaTaiKhoan=@ActorMaTaiKhoan AND TrangThai='ACTIVE';
IF @TargetId IS NULL THROW 52071,'Account not found.',1;
IF @ActorRole NOT IN ('DAO_TAO','QUAN_TRI') OR NOT ((@ActorRole='DAO_TAO' AND IS_MEMBER('DAO_TAO')=1) OR (@ActorRole='QUAN_TRI' AND IS_MEMBER('QUAN_TRI')=1)) THROW 52072,'Actor role mismatch.',1;
IF @ActorRole='DAO_TAO' AND @TargetRole IN('DAO_TAO','QUAN_TRI') THROW 52073,'Training cannot change privileged accounts.',1;
IF @TargetId=@ActorMaTaiKhoan AND @TrangThai='LOCKED' THROW 52074,'Cannot lock own account.',1;
IF @CurrentStatus='DISABLED' AND @TrangThai='ACTIVE' THROW 52075,'Disabled account cannot be reactivated.',1;
EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=@ActorMaTaiKhoan;
IF @TrangThai='LOCKED' BEGIN EXEC dbo.SP_KhoaTaiKhoan @MaTaiKhoan=@TargetId,@MaTaiKhoanNguoiThaoTac=@ActorMaTaiKhoan; END
ELSE IF @CurrentStatus<>'ACTIVE' UPDATE dbo.TAIKHOAN SET TrangThai='ACTIVE' WHERE MaTaiKhoan=@TargetId AND TrangThai='LOCKED';
EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL;
COMMIT TRANSACTION; END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK TRANSACTION; EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL; THROW; END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_Dashboard
AS BEGIN SET NOCOUNT ON; SELECT (SELECT COUNT(*) FROM dbo.SINHVIEN) AS TongSinhVien,(SELECT COUNT(*) FROM dbo.LOP) AS TongLopSinhHoat,(SELECT COUNT(*) FROM dbo.LOPHOCPHAN) AS TongLopHocPhan,(SELECT COUNT(*) FROM dbo.DANGKYTINCHI WHERE TrangThai='REGISTERED') AS TongLuotDangKy,(SELECT ISNULL(SUM(TongTien),0) FROM dbo.HOCPHI) AS TongHocPhiPhaiThu,(SELECT ISNULL(SUM(SoTienDaThanhToan),0) FROM dbo.HOCPHI) AS TongTienDaThu,(SELECT COUNT(*) FROM dbo.CHITIETTHANHTOAN WHERE TrangThai='CHO_XAC_NHAN') AS SoGiaoDichChoXacNhan; END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_Students_List @MaKhoa VARCHAR(10)=NULL,@MaLop VARCHAR(20)=NULL,@TrangThai VARCHAR(20)=NULL,@Search NVARCHAR(100)=NULL,@Offset INT=0,@PageSize INT=10
AS BEGIN SET NOCOUNT ON;
IF @MaKhoa IS NOT NULL AND @MaLop IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.LOP WHERE MaKhoa=@MaKhoa AND MaLop=@MaLop) THROW 52076,'Class does not belong to selected faculty.',1;
SELECT COUNT(*) AS TotalItems FROM dbo.SINHVIEN sv WHERE (@MaKhoa IS NULL OR sv.MaKhoa=@MaKhoa) AND (@MaLop IS NULL OR sv.MaLop=@MaLop) AND (@TrangThai IS NULL OR sv.TrangThai=@TrangThai) AND (@Search IS NULL OR sv.MaSinhVien LIKE N'%'+@Search+N'%' OR sv.HoTen LIKE N'%'+@Search+N'%' OR sv.Email LIKE N'%'+@Search+N'%');
SELECT sv.MaSV,sv.MaSinhVien,sv.HoTen,sv.NgaySinh,sv.Email,sv.SoDienThoai,sv.MaKhoa,k.TenKhoa,sv.MaLop,l.TenLop,sv.MaCTDT,sv.TrangThai,sv.NgayTao FROM dbo.SINHVIEN sv INNER JOIN dbo.KHOA k ON sv.MaKhoa=k.MaKhoa LEFT JOIN dbo.LOP l ON sv.MaLop=l.MaLop
WHERE (@MaKhoa IS NULL OR sv.MaKhoa=@MaKhoa) AND (@MaLop IS NULL OR sv.MaLop=@MaLop) AND (@TrangThai IS NULL OR sv.TrangThai=@TrangThai) AND (@Search IS NULL OR sv.MaSinhVien LIKE N'%'+@Search+N'%' OR sv.HoTen LIKE N'%'+@Search+N'%' OR sv.Email LIKE N'%'+@Search+N'%') ORDER BY sv.MaSV OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_Classes_List @MaHocKy INT=NULL,@Search NVARCHAR(100)=NULL,@Offset INT=0,@PageSize INT=10
AS BEGIN SET NOCOUNT ON;
SELECT COUNT(*) AS TotalItems FROM dbo.LOPHOCPHAN lhp INNER JOIN dbo.MONHOC mh ON lhp.MaMonHoc=mh.MaMonHoc INNER JOIN dbo.HOCKY hk ON lhp.MaHocKy=hk.MaHocKy WHERE (@MaHocKy IS NULL OR lhp.MaHocKy=@MaHocKy) AND (@Search IS NULL OR lhp.MaLHP LIKE N'%'+@Search+N'%' OR mh.TenMonHoc LIKE N'%'+@Search+N'%');
SELECT lhp.MaLHP,lhp.TenLHP,mh.MaMonHoc,mh.TenMonHoc,mh.SoTinChi,hk.MaHocKy,hk.TenHocKy,hk.NamHoc,gv.HoTen AS HoTenGiangVien,lhp.SoLuongToiDa,lhp.TrangThai,(SELECT COUNT(*) FROM dbo.DANGKYTINCHI dk WHERE dk.MaLHP=lhp.MaLHP AND dk.TrangThai='REGISTERED') AS SiSoHienTai,
(SELECT lh.MaLichHoc AS maLichHoc,lh.Thu AS thu,lh.TietBatDau AS tietBatDau,lh.SoTiet AS soTiet,lh.PhongHoc AS phongHoc FROM dbo.LICHHOC lh WHERE lh.MaLHP=lhp.MaLHP ORDER BY lh.Thu,lh.TietBatDau FOR JSON PATH) AS Schedules,lh.Thu,lh.TietBatDau,lh.SoTiet,lh.PhongHoc
FROM dbo.LOPHOCPHAN lhp INNER JOIN dbo.MONHOC mh ON lhp.MaMonHoc=mh.MaMonHoc INNER JOIN dbo.HOCKY hk ON lhp.MaHocKy=hk.MaHocKy LEFT JOIN dbo.GIANGVIEN gv ON lhp.MaGiangVien=gv.MaGV
OUTER APPLY(SELECT TOP(1) lh1.Thu,lh1.TietBatDau,lh1.SoTiet,lh1.PhongHoc FROM dbo.LICHHOC lh1 WHERE lh1.MaLHP=lhp.MaLHP ORDER BY lh1.Thu,lh1.TietBatDau) lh
WHERE (@MaHocKy IS NULL OR lhp.MaHocKy=@MaHocKy) AND (@Search IS NULL OR lhp.MaLHP LIKE N'%'+@Search+N'%' OR mh.TenMonHoc LIKE N'%'+@Search+N'%') ORDER BY lhp.MaLHP OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_Registrations_List @MaSV INT=NULL,@MaSinhVien VARCHAR(20)=NULL,@MaLHP VARCHAR(20)=NULL,@MaLop VARCHAR(20)=NULL,@TrangThai VARCHAR(20)=NULL,@Search NVARCHAR(100)=NULL,@Offset INT=0,@PageSize INT=10
AS BEGIN SET NOCOUNT ON;
SELECT COUNT(*) AS TotalItems FROM dbo.DANGKYTINCHI dk INNER JOIN dbo.SINHVIEN sv ON dk.MaSV=sv.MaSV INNER JOIN dbo.LOPHOCPHAN lhp ON dk.MaLHP=lhp.MaLHP INNER JOIN dbo.MONHOC mh ON lhp.MaMonHoc=mh.MaMonHoc
WHERE (@MaSV IS NULL OR dk.MaSV=@MaSV) AND (@MaSinhVien IS NULL OR sv.MaSinhVien=@MaSinhVien) AND (@MaLHP IS NULL OR dk.MaLHP=@MaLHP) AND (@MaLop IS NULL OR sv.MaLop=@MaLop) AND (@TrangThai IS NULL OR dk.TrangThai=@TrangThai) AND (@Search IS NULL OR sv.MaSinhVien LIKE N'%'+@Search+N'%' OR sv.HoTen LIKE N'%'+@Search+N'%' OR dk.MaLHP LIKE N'%'+@Search+N'%');
SELECT dk.MaDangKy,dk.MaSV,sv.MaSinhVien,sv.HoTen AS HoTenSinhVien,sv.MaLop,l.TenLop AS TenLopSinhVien,dk.MaLHP,mh.TenMonHoc,mh.SoTinChi,dk.NgayDangKy,dk.TrangThai
FROM dbo.DANGKYTINCHI dk INNER JOIN dbo.SINHVIEN sv ON dk.MaSV=sv.MaSV LEFT JOIN dbo.LOP l ON sv.MaLop=l.MaLop INNER JOIN dbo.LOPHOCPHAN lhp ON dk.MaLHP=lhp.MaLHP INNER JOIN dbo.MONHOC mh ON lhp.MaMonHoc=mh.MaMonHoc
WHERE (@MaSV IS NULL OR dk.MaSV=@MaSV) AND (@MaSinhVien IS NULL OR sv.MaSinhVien=@MaSinhVien) AND (@MaLHP IS NULL OR dk.MaLHP=@MaLHP) AND (@MaLop IS NULL OR sv.MaLop=@MaLop) AND (@TrangThai IS NULL OR dk.TrangThai=@TrangThai) AND (@Search IS NULL OR sv.MaSinhVien LIKE N'%'+@Search+N'%' OR sv.HoTen LIKE N'%'+@Search+N'%' OR dk.MaLHP LIKE N'%'+@Search+N'%') ORDER BY dk.MaDangKy DESC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_AuditLogs @MaTaiKhoan INT=NULL,@TuNgay DATE=NULL,@DenNgay DATE=NULL,@Offset INT=0,@PageSize INT=10
AS BEGIN SET NOCOUNT ON;
SELECT COUNT(*) AS TotalItems FROM dbo.LOGHOATDONG lg WHERE (@MaTaiKhoan IS NULL OR lg.MaTaiKhoan=@MaTaiKhoan) AND (@TuNgay IS NULL OR lg.ThoiGian>=@TuNgay) AND (@DenNgay IS NULL OR lg.ThoiGian<DATEADD(day,1,@DenNgay));
SELECT lg.MaLog,lg.MaTaiKhoan,tk.Username,tk.VaiTro,lg.ThoiGian,lg.HanhDong,lg.TenBang,lg.KhoaBanGhi,lg.NoiDungCu,lg.NoiDungMoi FROM dbo.LOGHOATDONG lg LEFT JOIN dbo.TAIKHOAN tk ON lg.MaTaiKhoan=tk.MaTaiKhoan
WHERE (@MaTaiKhoan IS NULL OR lg.MaTaiKhoan=@MaTaiKhoan) AND (@TuNgay IS NULL OR lg.ThoiGian>=@TuNgay) AND (@DenNgay IS NULL OR lg.ThoiGian<DATEADD(day,1,@DenNgay)) ORDER BY lg.MaLog DESC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END;
GO
USE [DBMS330284];
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_Student_Create @MaSinhVien VARCHAR(20),@HoTen NVARCHAR(100),@NgaySinh DATE=NULL,@Email VARCHAR(254)=NULL,@SoDienThoai VARCHAR(20)=NULL,@MaKhoa VARCHAR(10),@MaLop VARCHAR(20)=NULL,@MaCTDT VARCHAR(24),@TrangThai VARCHAR(20),@ActorMaTaiKhoan INT
AS BEGIN SET NOCOUNT ON; SET XACT_ABORT ON;
IF EXISTS(SELECT 1 FROM dbo.SINHVIEN WHERE MaSinhVien=@MaSinhVien) THROW 52080,'Student number already exists.',1;
IF NOT EXISTS(SELECT 1 FROM dbo.CHUONGTRINHDAOTAO c INNER JOIN dbo.NGANH n ON n.MaNganh=c.MaNganh WHERE c.MaCTDT=@MaCTDT AND n.MaKhoa=@MaKhoa) THROW 52081,'Curriculum does not belong to selected faculty.',1;
IF @MaLop IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.LOP l INNER JOIN dbo.CHUONGTRINHDAOTAO c ON c.NamTuyenSinh=l.NamNhapHoc WHERE l.MaLop=@MaLop AND l.MaKhoa=@MaKhoa AND c.MaCTDT=@MaCTDT) THROW 52082,'Homeroom class and curriculum do not match.',1;
IF NOT EXISTS(SELECT 1 FROM dbo.TAIKHOAN WHERE MaTaiKhoan=@ActorMaTaiKhoan AND TrangThai='ACTIVE' AND VaiTro IN('DAO_TAO','QUAN_TRI') AND ((VaiTro='DAO_TAO' AND IS_MEMBER('DAO_TAO')=1) OR (VaiTro='QUAN_TRI' AND IS_MEMBER('QUAN_TRI')=1))) THROW 52072,'Actor role mismatch.',1;
EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=@ActorMaTaiKhoan;
BEGIN TRY
DECLARE @Output TABLE(MaSV INT,MaSinhVien VARCHAR(20),HoTen NVARCHAR(100),NgaySinh DATE,Email VARCHAR(254),SoDienThoai VARCHAR(20),MaKhoa VARCHAR(10),MaLop VARCHAR(20),MaCTDT VARCHAR(24),TrangThai VARCHAR(20),NgayTao DATETIME2(0));
INSERT dbo.SINHVIEN(MaSinhVien,HoTen,NgaySinh,Email,SoDienThoai,MaKhoa,MaLop,MaCTDT,TrangThai)
OUTPUT inserted.MaSV,inserted.MaSinhVien,inserted.HoTen,inserted.NgaySinh,inserted.Email,inserted.SoDienThoai,inserted.MaKhoa,inserted.MaLop,inserted.MaCTDT,inserted.TrangThai,inserted.NgayTao INTO @Output
VALUES(@MaSinhVien,@HoTen,@NgaySinh,@Email,@SoDienThoai,@MaKhoa,@MaLop,@MaCTDT,@TrangThai);
SELECT * FROM @Output; EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL;
END TRY BEGIN CATCH EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL; THROW; END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_Student_Update @MaSV INT,@HoTen NVARCHAR(100)=NULL,@NgaySinh DATE=NULL,@Email VARCHAR(254)=NULL,@SoDienThoai VARCHAR(20)=NULL,@MaKhoa VARCHAR(10)=NULL,@MaLop VARCHAR(20)=NULL,@MaCTDT VARCHAR(24)=NULL,@TrangThai VARCHAR(20)=NULL,@HasNgaySinh BIT,@HasEmail BIT,@HasSoDienThoai BIT,@HasMaKhoa BIT,@HasMaLop BIT,@HasMaCTDT BIT,@HasTrangThai BIT,@ActorMaTaiKhoan INT
AS BEGIN SET NOCOUNT ON; SET XACT_ABORT ON;
DECLARE @Current TABLE(MaSinhVien VARCHAR(20),HoTen NVARCHAR(100),NgaySinh DATE,Email VARCHAR(254),SoDienThoai VARCHAR(20),MaKhoa VARCHAR(10),MaLop VARCHAR(20),MaCTDT VARCHAR(24),TrangThai VARCHAR(20),NgayTao DATETIME2(0));
INSERT @Current SELECT MaSinhVien,HoTen,NgaySinh,Email,SoDienThoai,MaKhoa,MaLop,MaCTDT,TrangThai,NgayTao FROM dbo.SINHVIEN WHERE MaSV=@MaSV;
IF NOT EXISTS(SELECT 1 FROM @Current) THROW 52083,'Student record was not found.',1;
DECLARE @FinalFaculty VARCHAR(10)=CASE WHEN @HasMaKhoa=1 THEN @MaKhoa ELSE (SELECT MaKhoa FROM @Current) END;
DECLARE @FinalClass VARCHAR(20)=CASE WHEN @HasMaLop=1 THEN @MaLop ELSE (SELECT MaLop FROM @Current) END;
DECLARE @FinalCurriculum VARCHAR(24)=CASE WHEN @HasMaCTDT=1 THEN @MaCTDT ELSE (SELECT MaCTDT FROM @Current) END;
IF NOT EXISTS(SELECT 1 FROM dbo.CHUONGTRINHDAOTAO c INNER JOIN dbo.NGANH n ON n.MaNganh=c.MaNganh WHERE c.MaCTDT=@FinalCurriculum AND n.MaKhoa=@FinalFaculty) THROW 52081,'Curriculum does not belong to selected faculty.',1;
IF @FinalClass IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.LOP l INNER JOIN dbo.CHUONGTRINHDAOTAO c ON c.NamTuyenSinh=l.NamNhapHoc WHERE l.MaLop=@FinalClass AND l.MaKhoa=@FinalFaculty AND c.MaCTDT=@FinalCurriculum) THROW 52082,'Homeroom class and curriculum do not match.',1;
IF NOT EXISTS(SELECT 1 FROM dbo.TAIKHOAN WHERE MaTaiKhoan=@ActorMaTaiKhoan AND TrangThai='ACTIVE' AND VaiTro IN('DAO_TAO','QUAN_TRI')
 AND ((VaiTro='DAO_TAO' AND IS_MEMBER('DAO_TAO')=1) OR (VaiTro='QUAN_TRI' AND IS_MEMBER('QUAN_TRI')=1))) THROW 52072,'Actor role mismatch.',1;
EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=@ActorMaTaiKhoan;
BEGIN TRY
UPDATE dbo.SINHVIEN SET HoTen=COALESCE(@HoTen,HoTen),NgaySinh=CASE WHEN @HasNgaySinh=1 THEN @NgaySinh ELSE NgaySinh END,Email=CASE WHEN @HasEmail=1 THEN @Email ELSE Email END,
SoDienThoai=CASE WHEN @HasSoDienThoai=1 THEN @SoDienThoai ELSE SoDienThoai END,MaKhoa=@FinalFaculty,MaLop=@FinalClass,MaCTDT=@FinalCurriculum,TrangThai=CASE WHEN @HasTrangThai=1 THEN @TrangThai ELSE TrangThai END WHERE MaSV=@MaSV;
SELECT MaSV,MaSinhVien,HoTen,NgaySinh,Email,SoDienThoai,MaKhoa,MaLop,MaCTDT,TrangThai,NgayTao FROM dbo.SINHVIEN WHERE MaSV=@MaSV;
EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL;
END TRY BEGIN CATCH EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL; THROW; END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_Student_Delete @MaSV INT,@ActorMaTaiKhoan INT
AS BEGIN SET NOCOUNT ON; SET XACT_ABORT ON; BEGIN TRY BEGIN TRANSACTION;
IF NOT EXISTS(SELECT 1 FROM dbo.SINHVIEN WITH(UPDLOCK,HOLDLOCK) WHERE MaSV=@MaSV) THROW 52083,'Student record was not found.',1;
IF NOT EXISTS(SELECT 1 FROM dbo.TAIKHOAN WHERE MaTaiKhoan=@ActorMaTaiKhoan AND TrangThai='ACTIVE' AND VaiTro IN('DAO_TAO','QUAN_TRI')
 AND ((VaiTro='DAO_TAO' AND IS_MEMBER('DAO_TAO')=1) OR (VaiTro='QUAN_TRI' AND IS_MEMBER('QUAN_TRI')=1))) THROW 52072,'Actor role mismatch.',1;
EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=@ActorMaTaiKhoan;
IF EXISTS(SELECT 1 FROM dbo.DANGKYTINCHI WHERE MaSV=@MaSV) OR EXISTS(SELECT 1 FROM dbo.HOCPHI WHERE MaSV=@MaSV)
BEGIN UPDATE dbo.SINHVIEN SET TrangThai='THOI_HOC' WHERE MaSV=@MaSV; SELECT 'SOFT_DELETE' AS action; END
ELSE BEGIN DELETE dbo.TAIKHOAN WHERE MaSV=@MaSV; DELETE dbo.SINHVIEN WHERE MaSV=@MaSV; SELECT 'HARD_DELETE' AS action; END;
EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL; COMMIT TRANSACTION;
END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK TRANSACTION; EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL; THROW; END CATCH; END;
GO
USE [DBMS330284];
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_Curriculums_List @MaKhoa VARCHAR(10)=NULL,@MaNganh VARCHAR(10)=NULL,@NamTuyenSinh SMALLINT=NULL,@MaCTDT VARCHAR(24)=NULL,@TuKhoaMonHoc NVARCHAR(100)=NULL,@MaMonTienQuyet VARCHAR(15)=NULL,@HocKyDuKien TINYINT=NULL
AS BEGIN SET NOCOUNT ON;
SELECT c.MaCTDT,c.TenCTDT,n.MaNganh,n.TenNganh AS Nganh,c.KhoaHoc,c.NamTuyenSinh,c.TongTinChiYeuCau,c.ThoiGianDaoTao,c.TrangThai AS TrangThaiCTDT,n.MaKhoa,k.TenKhoa,mh.MaMonHoc,mh.MaKhoa AS MaKhoaMon,km.TenKhoa AS TenKhoaMon,mh.TenMonHoc,mh.SoTinChi,mh.SoTietLyThuyet,mh.SoTietThucHanh,mh.MoTa,mh.TrangThai AS TrangThaiMon,ctm.HocKyDuKien,ctm.LoaiMon,ctm.ThuTu,
(SELECT STRING_AGG(CONVERT(NVARCHAR(MAX),CONCAT(pre.MaMonHoc,N' - ',pre.TenMonHoc)),N'; ') FROM dbo.MONHOCTIENQUYET mtq INNER JOIN dbo.MONHOC pre ON pre.MaMonHoc=mtq.MaMonTienQuyet WHERE mtq.MaMonHoc=mh.MaMonHoc) AS HocPhanTienQuyet,
(SELECT mtq.MaMonTienQuyet AS maMonHoc,pre.TenMonHoc AS tenMonHoc,mtq.MucDo AS mucDo FROM dbo.MONHOCTIENQUYET mtq INNER JOIN dbo.MONHOC pre ON pre.MaMonHoc=mtq.MaMonTienQuyet WHERE mtq.MaMonHoc=mh.MaMonHoc FOR JSON PATH) AS HocPhanTienQuyetChiTiet
FROM dbo.CHUONGTRINHDAOTAO c INNER JOIN dbo.NGANH n ON n.MaNganh=c.MaNganh INNER JOIN dbo.KHOA k ON k.MaKhoa=n.MaKhoa
LEFT JOIN dbo.CTDT_MONHOC ctm ON ctm.MaCTDT=c.MaCTDT AND (@HocKyDuKien IS NULL OR ctm.HocKyDuKien=@HocKyDuKien)
AND (@MaMonTienQuyet IS NULL OR EXISTS(SELECT 1 FROM dbo.MONHOCTIENQUYET rowMtq WHERE rowMtq.MaMonTienQuyet=@MaMonTienQuyet AND rowMtq.MaMonHoc=ctm.MaMonHoc))
LEFT JOIN dbo.MONHOC mh ON mh.MaMonHoc=ctm.MaMonHoc LEFT JOIN dbo.KHOA km ON km.MaKhoa=mh.MaKhoa
WHERE (@MaKhoa IS NULL OR n.MaKhoa=@MaKhoa) AND (@MaNganh IS NULL OR c.MaNganh=@MaNganh) AND (@NamTuyenSinh IS NULL OR c.NamTuyenSinh=@NamTuyenSinh) AND (@MaCTDT IS NULL OR c.MaCTDT=@MaCTDT)
AND (@TuKhoaMonHoc IS NULL OR mh.MaMonHoc LIKE N'%'+@TuKhoaMonHoc+N'%' OR mh.TenMonHoc LIKE N'%'+@TuKhoaMonHoc+N'%')
AND (@MaMonTienQuyet IS NULL OR EXISTS(SELECT 1 FROM dbo.MONHOCTIENQUYET filterMtq INNER JOIN dbo.CTDT_MONHOC filterCtm ON filterCtm.MaMonHoc=filterMtq.MaMonHoc WHERE filterMtq.MaMonTienQuyet=@MaMonTienQuyet AND filterCtm.MaCTDT=c.MaCTDT AND (@HocKyDuKien IS NULL OR filterCtm.HocKyDuKien=@HocKyDuKien)))
ORDER BY c.MaCTDT,ctm.HocKyDuKien,ctm.ThuTu,mh.MaMonHoc;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_CurriculumOptions @MaKhoa VARCHAR(10)=NULL,@NamTuyenSinh SMALLINT=NULL
AS BEGIN SET NOCOUNT ON; SELECT c.MaCTDT,c.TenCTDT,c.KhoaHoc,c.NamTuyenSinh,n.MaKhoa FROM dbo.CHUONGTRINHDAOTAO c INNER JOIN dbo.NGANH n ON n.MaNganh=c.MaNganh WHERE c.TrangThai=1 AND (@MaKhoa IS NULL OR n.MaKhoa=@MaKhoa) AND (@NamTuyenSinh IS NULL OR c.NamTuyenSinh=@NamTuyenSinh) ORDER BY c.NamTuyenSinh DESC,c.MaCTDT; END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_CurriculumPrograms_List
AS BEGIN SET NOCOUNT ON; SELECT c.MaCTDT,c.MaNganh,n.TenNganh,n.MaKhoa,k.TenKhoa,c.TenCTDT,c.KhoaHoc,c.NamTuyenSinh,c.TongTinChiYeuCau,c.ThoiGianDaoTao,c.TrangThai FROM dbo.CHUONGTRINHDAOTAO c INNER JOIN dbo.NGANH n ON n.MaNganh=c.MaNganh INNER JOIN dbo.KHOA k ON k.MaKhoa=n.MaKhoa ORDER BY k.TenKhoa,n.TenNganh,c.NamTuyenSinh DESC,c.MaCTDT; END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_CurriculumProgram_Get @MaCTDT VARCHAR(24)
AS BEGIN SET NOCOUNT ON; SELECT c.MaCTDT,c.MaNganh,n.TenNganh,k.MaKhoa,k.TenKhoa,c.TenCTDT,c.KhoaHoc,c.NamTuyenSinh,c.TongTinChiYeuCau,c.ThoiGianDaoTao,c.TrangThai FROM dbo.CHUONGTRINHDAOTAO c INNER JOIN dbo.NGANH n ON n.MaNganh=c.MaNganh INNER JOIN dbo.KHOA k ON k.MaKhoa=n.MaKhoa WHERE c.MaCTDT=@MaCTDT; END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_CurriculumProgram_Create @MaCTDT VARCHAR(24),@MaNganh VARCHAR(10),@TenCTDT NVARCHAR(150),@NamTuyenSinh SMALLINT,@TongTinChiYeuCau INT,@ThoiGianDaoTao INT,@TrangThai BIT,@ActorMaTaiKhoan INT
AS BEGIN SET NOCOUNT ON; IF NOT EXISTS(SELECT 1 FROM dbo.TAIKHOAN WHERE MaTaiKhoan=@ActorMaTaiKhoan AND TrangThai='ACTIVE' AND VaiTro IN('DAO_TAO','QUAN_TRI')
 AND ((VaiTro='DAO_TAO' AND IS_MEMBER('DAO_TAO')=1) OR (VaiTro='QUAN_TRI' AND IS_MEMBER('QUAN_TRI')=1))) THROW 52072,'Actor role mismatch.',1;
EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=@ActorMaTaiKhoan;
BEGIN TRY INSERT dbo.CHUONGTRINHDAOTAO(MaCTDT,MaNganh,TenCTDT,KhoaHoc,NamTuyenSinh,TongTinChiYeuCau,ThoiGianDaoTao,TrangThai) VALUES(@MaCTDT,@MaNganh,@TenCTDT,CONCAT(@NamTuyenSinh,'-',@NamTuyenSinh+@ThoiGianDaoTao),@NamTuyenSinh,@TongTinChiYeuCau,@ThoiGianDaoTao,@TrangThai); EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL; END TRY BEGIN CATCH EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL; THROW; END CATCH; END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_CurriculumProgram_Update @MaCTDT VARCHAR(24),@MaNganh VARCHAR(10),@TenCTDT NVARCHAR(150),@NamTuyenSinh SMALLINT,@TongTinChiYeuCau INT,@ThoiGianDaoTao INT,@TrangThai BIT,@ActorMaTaiKhoan INT
AS BEGIN SET NOCOUNT ON; DECLARE @OldYear SMALLINT,@OldDuration INT;
SELECT @OldYear=NamTuyenSinh,@OldDuration=ThoiGianDaoTao FROM dbo.CHUONGTRINHDAOTAO WHERE MaCTDT=@MaCTDT;
IF @OldYear IS NULL THROW 52085,'Curriculum program was not found.',1;
IF NOT EXISTS(SELECT 1 FROM dbo.TAIKHOAN WHERE MaTaiKhoan=@ActorMaTaiKhoan AND TrangThai='ACTIVE' AND VaiTro IN('DAO_TAO','QUAN_TRI')
 AND ((VaiTro='DAO_TAO' AND IS_MEMBER('DAO_TAO')=1) OR (VaiTro='QUAN_TRI' AND IS_MEMBER('QUAN_TRI')=1))) THROW 52072,'Actor role mismatch.',1;
IF @OldYear<>@NamTuyenSinh OR @OldDuration<>@ThoiGianDaoTao OR EXISTS(SELECT 1 FROM dbo.CHUONGTRINHDAOTAO WHERE MaCTDT=@MaCTDT AND MaNganh<>@MaNganh) EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=@ActorMaTaiKhoan;
BEGIN TRY
IF @OldYear<>@NamTuyenSinh OR @OldDuration<>@ThoiGianDaoTao OR EXISTS(SELECT 1 FROM dbo.CHUONGTRINHDAOTAO WHERE MaCTDT=@MaCTDT AND MaNganh<>@MaNganh)
 UPDATE dbo.CHUONGTRINHDAOTAO SET MaNganh=@MaNganh,NamTuyenSinh=@NamTuyenSinh,ThoiGianDaoTao=@ThoiGianDaoTao,KhoaHoc=CONCAT(@NamTuyenSinh,'-',@NamTuyenSinh+@ThoiGianDaoTao),TenCTDT=@TenCTDT,TongTinChiYeuCau=@TongTinChiYeuCau,TrangThai=@TrangThai WHERE MaCTDT=@MaCTDT;
ELSE UPDATE dbo.CHUONGTRINHDAOTAO SET TenCTDT=@TenCTDT,TongTinChiYeuCau=@TongTinChiYeuCau,TrangThai=@TrangThai WHERE MaCTDT=@MaCTDT;
EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL;
END TRY BEGIN CATCH EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL; THROW; END CATCH;
END;
GO
CREATE OR ALTER PROCEDURE dbo.SP_App_Admin_CurriculumProgram_Delete @MaCTDT VARCHAR(24),@ActorMaTaiKhoan INT
AS BEGIN SET NOCOUNT ON; SET XACT_ABORT ON; BEGIN TRY BEGIN TRANSACTION;
IF NOT EXISTS(SELECT 1 FROM dbo.CHUONGTRINHDAOTAO WITH(UPDLOCK,HOLDLOCK) WHERE MaCTDT=@MaCTDT) THROW 52085,'Curriculum program was not found.',1;
IF EXISTS(SELECT 1 FROM dbo.SINHVIEN WHERE MaCTDT=@MaCTDT) THROW 52084,'Students are linked to this curriculum.',1;
IF NOT EXISTS(SELECT 1 FROM dbo.TAIKHOAN WHERE MaTaiKhoan=@ActorMaTaiKhoan AND TrangThai='ACTIVE' AND VaiTro IN('DAO_TAO','QUAN_TRI')
 AND ((VaiTro='DAO_TAO' AND IS_MEMBER('DAO_TAO')=1) OR (VaiTro='QUAN_TRI' AND IS_MEMBER('QUAN_TRI')=1))) THROW 52072,'Actor role mismatch.',1;
EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=@ActorMaTaiKhoan;
DELETE dbo.CTDT_MONHOC WHERE MaCTDT=@MaCTDT; DELETE dbo.CHUONGTRINHDAOTAO WHERE MaCTDT=@MaCTDT;
EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL; COMMIT TRANSACTION;
END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK TRANSACTION; EXEC sys.sp_set_session_context @key=N'MaTaiKhoan',@value=NULL; THROW; END CATCH; END;
GO
