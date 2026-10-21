-- ENCODING: UTF-8 WITH BOM
USE [$(DatabaseName)];
GO

CREATE OR ALTER TRIGGER [dbo].[TR_MONHOCTIENQUYET_KiemTraChuTrinh]
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
        THROW 51001, N'Không thể tạo môn tiên quyết bị vòng lặp.', 1;
    END
END;
GO

CREATE OR ALTER TRIGGER [dbo].[TR_DANGKYTINCHI_KiemTraSiSo]
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
            WHERE TrangThai = 'REGISTERED'
            GROUP BY MaLHP
        ) x
        INNER JOIN dbo.LOPHOCPHAN lhp
            ON lhp.MaLHP = x.MaLHP
        WHERE x.SoLuongDangKy > lhp.SoLuongToiDa
    )
    BEGIN
        THROW 51002, N'Số lượng sinh viên đăng ký đã vượt quá sĩ số tối đa của lớp học phần.', 1;
    END
END;
GO

CREATE OR ALTER TRIGGER [dbo].[TR_LICHHOC_KiemTraTrungLich]
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
              N'Lịch học bị trùng giảng viên hoặc phòng học trong cùng thời gian.',
              1;
    END
END;
GO

CREATE OR ALTER TRIGGER [dbo].[TR_MUCHOCPHI_KiemTraHieuLuc]
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
            AND a.TrangThai = 'ACTIVE'
            AND b.TrangThai = 'ACTIVE'
            AND a.NgayHieuLuc <= ISNULL(b.NgayHetHieuLuc, '9999-12-31')
            AND b.NgayHieuLuc <= ISNULL(a.NgayHetHieuLuc, '9999-12-31')
        INNER JOIN
        (
            SELECT MaMucHocPhi FROM inserted
        ) i
            ON i.MaMucHocPhi = a.MaMucHocPhi
            OR i.MaMucHocPhi = b.MaMucHocPhi
    )
    BEGIN
        THROW 51004, N'Mức học phí đang ACTIVE bị trùng khoảng thời gian hiệu lực trong cùng học kỳ.', 1;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM inserted
        WHERE PhamViApDung <> 'TOAN_TRUONG'
    )
    BEGIN
        THROW 51005, N'Phiên bản hiện tại chỉ hỗ trợ phạm vi áp dụng TOAN_TRUONG.', 1;
    END
END;
GO

CREATE OR ALTER TRIGGER [dbo].[TR_CHITIETTHANHTOAN_CapNhatHocPhi]
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
        ISNULL(SUM(CASE WHEN ct.TrangThai = 'DA_XAC_NHAN' THEN ct.SoTien ELSE 0 END), 0) AS SoTienDaThanhToan
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
                WHEN ps.SoTienDaThanhToan = 0 THEN 'UNPAID'
                WHEN ps.SoTienDaThanhToan < hp.TongTien THEN 'PARTIAL'
                ELSE 'PAID'
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
        THROW 51006, N'Tổng số tiền thanh toán không được vượt quá tổng học phí.', 1;
    END
END;
GO

CREATE OR ALTER TRIGGER [dbo].[TR_TAIKHOAN_Audit]
ON [dbo].[TAIKHOAN]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaTaiKhoan INT =
        TRY_CONVERT(INT, SESSION_CONTEXT(N'MaTaiKhoan'));

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
             AND EXISTS (SELECT 1 FROM deleted) THEN 'UPDATE'
            WHEN EXISTS (SELECT 1 FROM inserted) THEN 'INSERT'
            ELSE 'DELETE'
        END,
        'TAIKHOAN',
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
END;
GO

CREATE OR ALTER TRIGGER [dbo].[TR_DANGKYTINCHI_Audit]
ON [dbo].[DANGKYTINCHI]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaTaiKhoan INT =
        TRY_CONVERT(INT, SESSION_CONTEXT(N'MaTaiKhoan'));

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
            WHEN i.MaDangKy IS NOT NULL AND d.MaDangKy IS NOT NULL THEN 'UPDATE'
            WHEN i.MaDangKy IS NOT NULL THEN 'INSERT'
            ELSE 'DELETE'
        END,
        'DANGKYTINCHI',
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
END;
GO

CREATE OR ALTER TRIGGER [dbo].[TR_DIEMSO_Audit]
ON [dbo].[DIEMSO]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaTaiKhoan INT =
        TRY_CONVERT(INT, SESSION_CONTEXT(N'MaTaiKhoan'));

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
            WHEN i.MaDangKy IS NOT NULL AND d.MaDangKy IS NOT NULL THEN 'UPDATE'
            WHEN i.MaDangKy IS NOT NULL THEN 'INSERT'
            ELSE 'DELETE'
        END,
        'DIEMSO',
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
END;
GO

CREATE OR ALTER TRIGGER [dbo].[TR_MUCHOCPHI_Audit]
ON [dbo].[MUCHOCPHI]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaTaiKhoan INT =
        TRY_CONVERT(INT, SESSION_CONTEXT(N'MaTaiKhoan'));

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
            WHEN i.MaMucHocPhi IS NOT NULL AND d.MaMucHocPhi IS NOT NULL THEN 'UPDATE'
            WHEN i.MaMucHocPhi IS NOT NULL THEN 'INSERT'
            ELSE 'DELETE'
        END,
        'MUCHOCPHI',
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
END;
GO

CREATE OR ALTER TRIGGER [dbo].[TR_HOCPHI_Audit]
ON [dbo].[HOCPHI]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaTaiKhoan INT =
        TRY_CONVERT(INT, SESSION_CONTEXT(N'MaTaiKhoan'));

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
            WHEN i.MaHocPhi IS NOT NULL AND d.MaHocPhi IS NOT NULL THEN 'UPDATE'
            WHEN i.MaHocPhi IS NOT NULL THEN 'INSERT'
            ELSE 'DELETE'
        END,
        'HOCPHI',
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
END;
GO

CREATE OR ALTER TRIGGER [dbo].[TR_CHITIETTHANHTOAN_Audit]
ON [dbo].[CHITIETTHANHTOAN]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaTaiKhoan INT =
        TRY_CONVERT(INT, SESSION_CONTEXT(N'MaTaiKhoan'));

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
            WHEN i.MaThanhToan IS NOT NULL AND d.MaThanhToan IS NOT NULL THEN 'UPDATE'
            WHEN i.MaThanhToan IS NOT NULL THEN 'INSERT'
            ELSE 'DELETE'
        END,
        'CHITIETTHANHTOAN',
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
END;
GO

-- 12. Trigger Audit ghi nhật ký hoạt động trên bảng LOP
CREATE OR ALTER TRIGGER [dbo].[TR_LOP_Audit]
ON [dbo].[LOP]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaTaiKhoan INT =
        TRY_CONVERT(INT, SESSION_CONTEXT(N'MaTaiKhoan'));

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
            WHEN i.MaLop IS NOT NULL AND d.MaLop IS NOT NULL THEN 'UPDATE'
            WHEN i.MaLop IS NOT NULL THEN 'INSERT'
            ELSE 'DELETE'
        END,
        'LOP',
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
END;
GO

-- 13. Trigger ngăn chặn xóa Lớp sinh hoạt đang có Sinh viên trực thuộc
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
        THROW 51007, N'Không thể xóa lớp sinh hoạt đang có sinh viên trực thuộc.', 1;
    END

    DELETE l
    FROM dbo.LOP l
    INNER JOIN deleted d ON l.MaLop = d.MaLop;
END;
GO

CREATE OR ALTER TRIGGER dbo.TR_LOPHOCPHAN_KiemTraSucChua
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
            WHERE dk.MaLHP = i.MaLHP AND dk.TrangThai = 'REGISTERED'
        ) d
        WHERE d.SiSo > i.SoLuongToiDa
    )
        THROW 51002, N'Không thể giảm sức chứa thấp hơn số sinh viên đã đăng ký.', 1;
END;
GO

CREATE OR ALTER TRIGGER dbo.TR_LOPHOCPHAN_MoCanLich
ON dbo.LOPHOCPHAN
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS
    (
        SELECT 1 FROM inserted i
        WHERE i.TrangThai IN ('MO_DANG_KY', 'DANG_MO')
          AND NOT EXISTS (SELECT 1 FROM dbo.LICHHOC lh WHERE lh.MaLHP = i.MaLHP)
    )
        THROW 51311, N'Lớp học phần chỉ được mở khi có ít nhất một lịch học hợp lệ.', 1;
END;
GO

CREATE OR ALTER TRIGGER dbo.TR_LICHHOC_LopMoCanLich
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
        WHERE lhp.TrangThai IN ('MO_DANG_KY', 'DANG_MO')
          AND NOT EXISTS (SELECT 1 FROM dbo.LICHHOC lh WHERE lh.MaLHP = d.MaLHP)
    )
        THROW 51311, N'Không thể xóa lịch cuối cùng của lớp học phần đang mở.', 1;
END;
GO

CREATE OR ALTER TRIGGER dbo.TR_SINHVIEN_KiemTraKhoaLop
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
        THROW 51008, N'Khoa, lớp và khóa tuyển sinh của sinh viên phải khớp với CTĐT.', 1;
    IF EXISTS
    (
        SELECT 1 FROM inserted i
        INNER JOIN dbo.CHUONGTRINHDAOTAO c ON c.MaCTDT = i.MaCTDT
        INNER JOIN dbo.NGANH n ON n.MaNganh = c.MaNganh
        WHERE i.MaKhoa <> n.MaKhoa
    )
        THROW 51008, N'Khoa của sinh viên phải khớp với khoa ngành của CTĐT.', 1;
END;
GO

CREATE OR ALTER TRIGGER dbo.TR_LOP_KiemTraSinhVien
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
        THROW 51008, N'Không thể đổi khoa hoặc khóa lớp khi sinh viên hiện tại không còn khớp CTĐT.', 1;
END;
GO

CREATE OR ALTER TRIGGER dbo.TR_CHUONGTRINHDAOTAO_KiemTraSinhVien
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
        THROW 51008, N'Không thể đổi ngành hoặc khóa CTĐT khi sinh viên hiện tại không còn khớp.', 1;
END;
GO

CREATE OR ALTER TRIGGER dbo.TR_NGANH_KiemTraSinhVien
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
        THROW 51008, N'Không thể chuyển ngành sang khoa khác khi CTĐT đang có sinh viên.', 1;
END;
GO
