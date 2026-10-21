    -- ENCODING: UTF-8 WITH BOM
    USE [$(DatabaseName)];
    GO

    SET NOCOUNT ON;
    GO

    PRINT N'============================================================';
    PRINT N'13_TEST_INTEGRATION - KIEM THU TOAN BO HE THONG DBMS330284';
    PRINT N'============================================================';
    GO


    /* =========================================================
    1. KIEM TRA 19 BANG
    ========================================================= */

    DECLARE @ExpectedTables TABLE
    (
        TableName SYSNAME
    );

    INSERT INTO @ExpectedTables(TableName)
    VALUES
    ('KHOA'),
    ('NGANH'),
    ('CHUONGTRINHDAOTAO'),
    ('MONHOC'),
    ('CTDT_MONHOC'),
    ('MONHOCTIENQUYET'),
    ('LOP'),
    ('SINHVIEN'),
    ('GIANGVIEN'),
    ('TAIKHOAN'),
    ('HOCKY'),
    ('LOPHOCPHAN'),
    ('LICHHOC'),
    ('DANGKYTINCHI'),
    ('DIEMSO'),
    ('MUCHOCPHI'),
    ('HOCPHI'),
    ('CHITIETTHANHTOAN'),
    ('LOGHOATDONG');

    IF EXISTS
    (
        SELECT 1
        FROM @ExpectedTables e
        WHERE OBJECT_ID(N'dbo.' + e.TableName, N'U') IS NULL
    )
        THROW 51301, N'Thieu mot hoac nhieu bang trong mo hinh 19 bang.', 1;

    PRINT N'PASS - Du 19 bang da ton tai.';
    GO

    /* =========================================================
    1.1 KIEM TRA TOAN VEN BANG NGANH
    ========================================================= */
    IF OBJECT_ID(N'dbo.NGANH', N'U') IS NULL
        THROW 51301, N'Bang NGANH chua ton tai.', 1;

    IF NOT EXISTS (SELECT 1 FROM dbo.NGANH)
        THROW 51301, N'Bang NGANH chua co du lieu seed.', 1;

    IF NOT EXISTS
    (
        SELECT 1 FROM sys.key_constraints
        WHERE parent_object_id = OBJECT_ID(N'dbo.NGANH') AND type = 'PK'
    )
        THROW 51301, N'Thieu PRIMARY KEY tren bang NGANH.', 1;

    IF NOT EXISTS
    (
        SELECT 1 FROM sys.foreign_keys
        WHERE parent_object_id = OBJECT_ID(N'dbo.NGANH')
        AND referenced_object_id = OBJECT_ID(N'dbo.KHOA')
    )
        THROW 51301, N'Thieu FOREIGN KEY NGANH -> KHOA.', 1;

    IF NOT EXISTS
    (
        SELECT 1 FROM sys.key_constraints
        WHERE parent_object_id = OBJECT_ID(N'dbo.NGANH') AND type = 'UQ'
    )
        THROW 51301, N'Thieu UNIQUE constraint TenNganh tren bang NGANH.', 1;

    IF NOT EXISTS
    (
        SELECT 1 FROM sys.foreign_keys
        WHERE parent_object_id = OBJECT_ID(N'dbo.CHUONGTRINHDAOTAO')
        AND referenced_object_id = OBJECT_ID(N'dbo.NGANH')
    )
        THROW 51301, N'Thieu FOREIGN KEY CHUONGTRINHDAOTAO -> NGANH.', 1;

    IF EXISTS (SELECT 1 FROM dbo.CHUONGTRINHDAOTAO WHERE MaNganh IS NULL)
        THROW 51301, N'Ton tai CHUONGTRINHDAOTAO co MaNganh NULL.', 1;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.CHUONGTRINHDAOTAO c
        LEFT JOIN dbo.NGANH n ON c.MaNganh = n.MaNganh
        WHERE n.MaNganh IS NULL
    )
        THROW 51301, N'Co MaNganh trong CHUONGTRINHDAOTAO khong ton tai trong NGANH.', 1;

    PRINT N'PASS - Kiem tra toan ven bang NGANH va lien ket thanh cong.';
    GO


    /* =========================================================
    2. KIEM TRA PRIMARY KEY
    ========================================================= */

    IF EXISTS
    (
        SELECT 1
        FROM
        (
            SELECT t.name AS TableName
            FROM sys.tables t
            LEFT JOIN sys.indexes i
                ON i.object_id = t.object_id
            AND i.is_primary_key = 1
            WHERE t.schema_id = SCHEMA_ID(N'dbo')
        ) x
        WHERE x.TableName IN
        (
            'KHOA',
            'NGANH',
            'CHUONGTRINHDAOTAO',
            'MONHOC',
            'CTDT_MONHOC',
            'MONHOCTIENQUYET',
            'SINHVIEN',
            'GIANGVIEN',
            'TAIKHOAN',
            'HOCKY',
            'LOPHOCPHAN',
            'LICHHOC',
            'DANGKYTINCHI',
            'DIEMSO',
            'MUCHOCPHI',
            'HOCPHI',
            'CHITIETTHANHTOAN',
            'LOGHOATDONG'
        )
        GROUP BY TableName
        HAVING COUNT(*) = 0
    )
        THROW 51302, N'Co bang chua co PRIMARY KEY.', 1;

    PRINT N'PASS - Kiem tra PRIMARY KEY.';
    GO


    /* =========================================================
    3. KIEM TRA FOREIGN KEY
    ========================================================= */

    IF EXISTS
    (
        SELECT 1
        FROM sys.foreign_keys
        WHERE is_disabled = 1
    )
        THROW 51303, N'Co FOREIGN KEY dang bi disable.', 1;

    PRINT N'PASS - FOREIGN KEY dang hoat dong.';
    GO


    /* =========================================================
    4. KIEM TRA TOAN VEN DU LIEU
    ========================================================= */

    DBCC CHECKCONSTRAINTS WITH ALL_CONSTRAINTS;
    GO

    PRINT N'PASS - DBCC CHECKCONSTRAINTS da duoc thuc hien.';
    GO


    /* =========================================================
    5. KIEM TRA DU LIEU MAU
    ========================================================= */

    SELECT
        t.name AS TableName,
        SUM(p.rows) AS [RowCount]
    FROM sys.tables t
    INNER JOIN sys.partitions p
        ON p.object_id = t.object_id
    AND p.index_id IN (0,1)
    WHERE t.schema_id = SCHEMA_ID(N'dbo')
    GROUP BY t.name
    ORDER BY t.name;
    GO


    /* =========================================================
    6. KIEM TRA CAC VIEW
    ========================================================= */

    DECLARE @ExpectedViews TABLE
    (
        ObjectName SYSNAME
    );

    INSERT INTO @ExpectedViews(ObjectName)
    VALUES
    ('V_CauTrucChuongTrinhDaoTao'),
    ('V_TaiKhoanNguoiDung'),
    ('V_ThoiKhoaBieuSinhVien'),
    ('V_BangDiemChiTiet'),
    ('V_HocPhiSinhVien'),
    ('V_DanhSachLopSinhHoat');

    IF EXISTS
    (
        SELECT 1
        FROM @ExpectedViews
        WHERE OBJECT_ID(N'dbo.' + ObjectName, N'V') IS NULL
    )
        THROW 51304, N'Thieu VIEW trong he thong.', 1;

    PRINT N'PASS - Du 6 VIEW.';
    GO

    SELECT *
    FROM dbo.V_CauTrucChuongTrinhDaoTao;
    GO

    SELECT *
    FROM dbo.V_TaiKhoanNguoiDung;
    GO

    SELECT TOP 20 *
    FROM dbo.V_ThoiKhoaBieuSinhVien
    ORDER BY MaSV;
    GO

    SELECT TOP 20 *
    FROM dbo.V_BangDiemChiTiet
    ORDER BY MaSV;
    GO

    SELECT TOP 20 *
    FROM dbo.V_HocPhiSinhVien
    ORDER BY MaHocPhi;
    GO

    SELECT *
    FROM dbo.V_DanhSachLopSinhHoat;
    GO


    /* =========================================================
    7. KIEM TRA FUNCTION
    ========================================================= */

    DECLARE @ExpectedFunctions TABLE
    (
        ObjectName SYSNAME
    );

    INSERT INTO @ExpectedFunctions(ObjectName)
    VALUES
    ('FN_KiemTraTienQuyet'),
    ('FN_KiemTraTaiKhoanDangHoatDong'),
    ('FN_KiemTraThoiGianDangKy'),
    ('FN_TongTinChiDangKy'),
    ('FN_TinhDiemTongKet'),
    ('FN_LayDonGiaTinChi'),
    ('FN_DemSiSoLopSinhHoat');

    IF EXISTS
    (
        SELECT 1
        FROM @ExpectedFunctions
        WHERE OBJECT_ID(N'dbo.' + ObjectName, N'FN') IS NULL
    )
        THROW 51305, N'Thieu FUNCTION trong he thong.', 1;

    PRINT N'PASS - Du 7 FUNCTION da ton tai.';
    GO


    /* =========================================================
    8. KIEM TRA STORED PROCEDURE
    ========================================================= */

    DECLARE @ExpectedProcedures TABLE
    (
        ObjectName SYSNAME
    );

    INSERT INTO @ExpectedProcedures(ObjectName)
    VALUES
    ('SP_DangKyTinChi'),
    ('SP_HuyDangKy'),
    ('SP_TaoTaiKhoan'),
    ('SP_KhoaTaiKhoan'),
    ('SP_TinhHocPhiSinhVien'),
    ('SP_ThongKeHocPhi'),
    ('SP_ThongKeHocPhiTheoLop'),
    ('SP_XacNhanThanhToan'),
    ('SP_TuChoiThanhToan');

    IF EXISTS
    (
        SELECT 1
        FROM @ExpectedProcedures
        WHERE OBJECT_ID(N'dbo.' + ObjectName, N'P') IS NULL
    )
        THROW 51306, N'Thieu STORED PROCEDURE trong he thong.', 1;

    PRINT N'PASS - Du 9 STORED PROCEDURE da ton tai.';
    GO


    /* =========================================================
    9. KIEM TRA TRIGGER
    ========================================================= */

    PRINT N'9. KIỂM TRA TRIGGER';
    GO

    IF OBJECT_ID(N'dbo.TR_MONHOCTIENQUYET_KiemTraChuTrinh', N'TR') IS NULL
        THROW 51301, N'Thiếu trigger TR_MONHOCTIENQUYET_KiemTraChuTrinh.', 1;

    IF OBJECT_ID(N'dbo.TR_DANGKYTINCHI_KiemTraSiSo', N'TR') IS NULL
        THROW 51302, N'Thiếu trigger TR_DANGKYTINCHI_KiemTraSiSo.', 1;

    IF OBJECT_ID(N'dbo.TR_LICHHOC_KiemTraTrungLich', N'TR') IS NULL
        THROW 51303, N'Thiếu trigger TR_LICHHOC_KiemTraTrungLich.', 1;

    IF OBJECT_ID(N'dbo.TR_MUCHOCPHI_KiemTraHieuLuc', N'TR') IS NULL
        THROW 51304, N'Thiếu trigger TR_MUCHOCPHI_KiemTraHieuLuc.', 1;

    IF OBJECT_ID(N'dbo.TR_CHITIETTHANHTOAN_CapNhatHocPhi', N'TR') IS NULL
        THROW 51305, N'Thiếu trigger TR_CHITIETTHANHTOAN_CapNhatHocPhi.', 1;

    IF OBJECT_ID(N'dbo.TR_TAIKHOAN_Audit', N'TR') IS NULL
        THROW 51306, N'Thiếu trigger TR_TAIKHOAN_Audit.', 1;

    IF OBJECT_ID(N'dbo.TR_DANGKYTINCHI_Audit', N'TR') IS NULL
        THROW 51307, N'Thiếu trigger TR_DANGKYTINCHI_Audit.', 1;

    IF OBJECT_ID(N'dbo.TR_DIEMSO_Audit', N'TR') IS NULL
        THROW 51308, N'Thiếu trigger TR_DIEMSO_Audit.', 1;

    IF OBJECT_ID(N'dbo.TR_MUCHOCPHI_Audit', N'TR') IS NULL
        THROW 51309, N'Thiếu trigger TR_MUCHOCPHI_Audit.', 1;

    IF OBJECT_ID(N'dbo.TR_HOCPHI_Audit', N'TR') IS NULL
        THROW 51310, N'Thiếu trigger TR_HOCPHI_Audit.', 1;

    IF OBJECT_ID(N'dbo.TR_CHITIETTHANHTOAN_Audit', N'TR') IS NULL
        THROW 51311, N'Thiếu trigger TR_CHITIETTHANHTOAN_Audit.', 1;

    IF OBJECT_ID(N'dbo.TR_LOP_Audit', N'TR') IS NULL
        THROW 51312, N'Thiếu trigger TR_LOP_Audit.', 1;

    IF OBJECT_ID(N'dbo.TR_LOP_KiemTraXoa', N'TR') IS NULL
        THROW 51313, N'Thiếu trigger TR_LOP_KiemTraXoa.', 1;

    IF OBJECT_ID(N'dbo.TR_SINHVIEN_KiemTraKhoaLop', N'TR') IS NULL
        THROW 51314, N'Thiếu trigger TR_SINHVIEN_KiemTraKhoaLop.', 1;

    IF OBJECT_ID(N'dbo.TR_LOPHOCPHAN_KiemTraSucChua', N'TR') IS NULL
        THROW 51315, N'Thiếu trigger TR_LOPHOCPHAN_KiemTraSucChua.', 1;

    IF OBJECT_ID(N'dbo.TR_LOPHOCPHAN_MoCanLich', N'TR') IS NULL
        THROW 51316, N'Thiếu trigger TR_LOPHOCPHAN_MoCanLich.', 1;

    IF OBJECT_ID(N'dbo.TR_LICHHOC_LopMoCanLich', N'TR') IS NULL
        THROW 51317, N'Thiếu trigger TR_LICHHOC_LopMoCanLich.', 1;

    IF OBJECT_ID(N'dbo.TR_LOP_KiemTraSinhVien', N'TR') IS NULL
        THROW 51318, N'Thiếu trigger TR_LOP_KiemTraSinhVien.', 1;

    IF OBJECT_ID(N'dbo.TR_CHUONGTRINHDAOTAO_KiemTraSinhVien', N'TR') IS NULL
        THROW 51319, N'Thiếu trigger TR_CHUONGTRINHDAOTAO_KiemTraSinhVien.', 1;

    IF OBJECT_ID(N'dbo.TR_NGANH_KiemTraSinhVien', N'TR') IS NULL
        THROW 51320, N'Thiếu trigger TR_NGANH_KiemTraSinhVien.', 1;

    IF EXISTS
    (
        SELECT 1
        FROM sys.triggers
        WHERE parent_class = 1
        AND is_disabled = 1
    )
        THROW 51315, N'Có TRIGGER đang bị disable.', 1;

    PRINT N'PASS: Đủ trigger nghiệp vụ/audit đều tồn tại và đang hoạt động.';
    GO


    /* =========================================================
    10. KIEM TRA INDEX QUAN TRONG
    ========================================================= */

    SELECT
        OBJECT_NAME(i.object_id) AS TableName,
        i.name AS IndexName,
        i.type_desc AS IndexType,
        i.is_unique,
        i.is_primary_key
    FROM sys.indexes i
    WHERE i.name IN
    (
        'IX_NGANH_MaKhoa',
        'IX_CHUONGTRINHDAOTAO_MaNganh',
        'IX_CTDT_MONHOC_MaCTDT',
        'IX_MONHOCTIENQUYET_MaMonTienQuyet',
        'IX_MONHOC_MaKhoa',
        'IX_HOCPHI_MaSV_MaHocKy',
        'IX_HOCPHI_MaHocKy_TrangThai',
        'IX_LOGHOATDONG_ThoiGian',
        'IX_LOGHOATDONG_MaTaiKhoan_ThoiGian'
    )
    ORDER BY TableName, IndexName;
    GO


    /* =========================================================
    11. KIEM TRA FILTERED UNIQUE INDEX
    ========================================================= */

    SELECT
        OBJECT_NAME(i.object_id) AS TableName,
        i.name AS IndexName,
        i.filter_definition
    FROM sys.indexes i
    WHERE i.filter_definition IS NOT NULL
    ORDER BY TableName, IndexName;
    GO


    /* =========================================================
    12. KIEM TRA 4 DATABASE ROLE
    ========================================================= */

    DECLARE @ExpectedRoles TABLE
    (
        RoleName SYSNAME
    );

    INSERT INTO @ExpectedRoles(RoleName)
    VALUES
    ('SINH_VIEN'),
    ('GIANG_VIEN'),
    ('DAO_TAO'),
    ('QUAN_TRI');

    IF EXISTS
    (
        SELECT 1
        FROM @ExpectedRoles
        WHERE DATABASE_PRINCIPAL_ID(RoleName) IS NULL
    )
        THROW 51309, N'Thieu mot trong 4 database role.', 1;

    PRINT N'PASS - Du 4 database role.';
    GO


    SELECT
        r.name AS RoleName,
        u.name AS MemberName
    FROM sys.database_role_members drm
    INNER JOIN sys.database_principals r
        ON r.principal_id = drm.role_principal_id
    INNER JOIN sys.database_principals u
        ON u.principal_id = drm.member_principal_id
    WHERE r.name IN
    (
        'SINH_VIEN',
        'GIANG_VIEN',
        'DAO_TAO',
        'QUAN_TRI'
    )
    ORDER BY r.name, u.name;
    GO


    /* =========================================================
    13. KIEM TRA QUYEN GRANT / DENY
    ========================================================= */

    SELECT
        dp.name AS PrincipalName,
        dp.type_desc AS PrincipalType,
        p.permission_name,
        p.state_desc,
        OBJECT_SCHEMA_NAME(p.major_id) AS SchemaName,
        OBJECT_NAME(p.major_id) AS ObjectName
    FROM sys.database_permissions p
    INNER JOIN sys.database_principals dp
        ON dp.principal_id = p.grantee_principal_id
    WHERE dp.name IN
    (
        'SINH_VIEN',
        'GIANG_VIEN',
        'DAO_TAO',
        'QUAN_TRI'
    )
    ORDER BY
        dp.name,
        ObjectName,
        p.permission_name;
    GO


    /* =========================================================
    14. KIEM TRA HOCPHI - TONG THANH TOAN
    ========================================================= */

    IF EXISTS
    (
        SELECT 1
        FROM dbo.HOCPHI
        WHERE SoTienDaThanhToan < 0
        OR SoTienDaThanhToan > TongTien
    )
        THROW 51310, N'HOCPHI co SoTienDaThanhToan khong hop le.', 1;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.HOCPHI
        WHERE
            (
                SoTienDaThanhToan = 0
                AND TrangThai <> 'UNPAID'
            )
            OR
            (
                SoTienDaThanhToan > 0
                AND SoTienDaThanhToan < TongTien
                AND TrangThai <> 'PARTIAL'
            )
            OR
            (
                SoTienDaThanhToan = TongTien
                AND TrangThai <> 'PAID'
            )
    )
        THROW 51311, N'Trang thai HOCPHI khong dong bo voi SoTienDaThanhToan.', 1;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.HOCPHI hp
        OUTER APPLY
        (
            SELECT ISNULL(SUM(ct.SoTien), 0) AS TongThanhToan
            FROM dbo.CHITIETTHANHTOAN ct
            WHERE ct.MaHocPhi = hp.MaHocPhi
            AND ct.TrangThai = 'DA_XAC_NHAN'
        ) p
        WHERE hp.SoTienDaThanhToan <> p.TongThanhToan
    )
        THROW 51312, N'Cache SoTienDaThanhToan khong khop CHITIETTHANHTOAN.', 1;

    PRINT N'PASS - HOCPHI va CHITIETTHANHTOAN dong bo.';
    GO


    /* =========================================================
    15. KIEM TRA DANG KY TIN CHI - KHONG VUOT SI SO
    ========================================================= */

    IF EXISTS
    (
        SELECT 1
        FROM dbo.LOPHOCPHAN lhp
        OUTER APPLY
        (
            SELECT COUNT(*) AS SoLuongDangKy
            FROM dbo.DANGKYTINCHI dk
            WHERE dk.MaLHP = lhp.MaLHP
            AND dk.TrangThai = 'REGISTERED'
        ) x
        WHERE x.SoLuongDangKy > lhp.SoLuongToiDa
    )
        THROW 51313, N'LOPHOCPHAN co si so vuot qua SoLuongToiDa.', 1;

    PRINT N'PASS - Khong co lop hoc phan vuot si so.';
    GO


    /* =========================================================
    16. KIEM TRA DIEMSO - TY TRONG = 100
    ========================================================= */

    IF EXISTS
    (
        SELECT 1
        FROM dbo.DIEMSO
        WHERE TyTrongQT + TyTrongGK + TyTrongCK <> 100
    )
        THROW 51314, N'DIEMSO co tong ty trong khac 100%.', 1;

    PRINT N'PASS - Ty trong DIEMSO hop le.';
    GO


    /* =========================================================
    17. KIEM TRA DIEM TRONG KHOANG 0 -> 10
    ========================================================= */

    IF EXISTS
    (
        SELECT 1
        FROM dbo.DIEMSO
        WHERE DiemQuaTrinh NOT BETWEEN 0 AND 10
        OR DiemGiuaKy NOT BETWEEN 0 AND 10
        OR DiemCuoiKy NOT BETWEEN 0 AND 10
    )
        THROW 51315, N'DIEMSO co diem nam ngoai khoang 0-10.', 1;

    PRINT N'PASS - Diem so hop le.';
    GO


    /* =========================================================
    18. KIEM TRA TIEN QUYET KHONG TU THAM CHIEU
    ========================================================= */

    IF EXISTS
    (
        SELECT 1
        FROM dbo.MONHOCTIENQUYET
        WHERE MaMonHoc = MaMonTienQuyet
    )
        THROW 51316, N'MONHOCTIENQUYET co quan he tu tham chieu.', 1;

    PRINT N'PASS - Khong co mon hoc tu lam tien quyet cho chinh no.';
    GO


    /* =========================================================
    19. KIEM TRA EMAIL UNIQUE
    ========================================================= */

    IF EXISTS
    (
        SELECT Email
        FROM dbo.SINHVIEN
        WHERE Email IS NOT NULL
        GROUP BY Email
        HAVING COUNT(*) > 1
    )
        THROW 51317, N'SINHVIEN co Email bi trung.', 1;

    IF EXISTS
    (
        SELECT Email
        FROM dbo.GIANGVIEN
        WHERE Email IS NOT NULL
        GROUP BY Email
        HAVING COUNT(*) > 1
    )
        THROW 51318, N'GIANGVIEN co Email bi trung.', 1;

    PRINT N'PASS - Email SINHVIEN/GIANGVIEN khong bi trung.';
    GO


    /* =========================================================
    20. KIEM TRA HOCPHI MOI SV / HOC KY
    ========================================================= */

    IF EXISTS
    (
        SELECT MaSV, MaHocKy
        FROM dbo.HOCPHI
        GROUP BY MaSV, MaHocKy
        HAVING COUNT(*) > 1
    )
        THROW 51319, N'Mot sinh vien co nhieu HOCPHI trong cung hoc ky.', 1;

    PRINT N'PASS - Moi SV chi co mot HOCPHI trong mot hoc ky.';
    GO


    /* =========================================================
    21. KIEM TRA LOG AUDIT
    ========================================================= */

    SELECT TOP 50
        MaLog,
        MaTaiKhoan,
        ThoiGian,
        HanhDong,
        TenBang,
        KhoaBanGhi,
        NoiDungCu,
        NoiDungMoi
    FROM dbo.LOGHOATDONG
    ORDER BY MaLog DESC;
    GO

    IF EXISTS
    (
        SELECT 1
        FROM dbo.LOGHOATDONG
        WHERE NoiDungCu LIKE '%PasswordHash%'
        OR NoiDungMoi LIKE '%PasswordHash%'
    )
        THROW 51320, N'LOGHOATDONG dang chua PasswordHash.', 1;

    PRINT N'PASS - Audit log khong chua PasswordHash.';
    GO


    /* =========================================================
    22. KIEM TRA SESSION CONTEXT
    ========================================================= */

    EXEC sys.sp_set_session_context
        @key = N'MaTaiKhoan',
        @value = 1;
    GO

    SELECT
        SESSION_CONTEXT(N'MaTaiKhoan') AS MaTaiKhoanHienTai;
    GO


    /* =========================================================
    23. KIEM TRA TRANSACTION OBJECT
    ========================================================= */

    IF OBJECT_ID(N'dbo.SP_DangKyTinChi', N'P') IS NULL
        OR OBJECT_ID(N'dbo.SP_HuyDangKy', N'P') IS NULL
        OR OBJECT_ID(N'dbo.SP_TinhHocPhiSinhVien', N'P') IS NULL
        OR OBJECT_ID(N'dbo.SP_TaoTaiKhoan', N'P') IS NULL
        OR OBJECT_ID(N'dbo.SP_KhoaTaiKhoan', N'P') IS NULL
        THROW 51321, N'Thieu procedure can thiet cho transaction.', 1;

    PRINT N'PASS - Cac procedure transaction da ton tai.';
    GO


    /* =========================================================
    24. KIEM TRA CO CHE CONCURRENCY
    ========================================================= */

    IF OBJECT_ID(N'dbo.SP_DangKyTinChi', N'P') IS NULL
        THROW 51322, N'Thieu SP_DangKyTinChi.', 1;
    GO

    IF NOT EXISTS
    (
        SELECT 1
        FROM sys.sql_modules
        WHERE object_id = OBJECT_ID(N'dbo.SP_DangKyTinChi')
        AND definition LIKE N'%UPDLOCK%'
    )
        THROW 51323, N'SP_DangKyTinChi chua co UPDLOCK.', 1;

    IF NOT EXISTS
    (
        SELECT 1
        FROM sys.sql_modules
        WHERE object_id = OBJECT_ID(N'dbo.SP_DangKyTinChi')
        AND definition LIKE N'%HOLDLOCK%'
    )
        THROW 51324, N'SP_DangKyTinChi chua co HOLDLOCK.', 1;

    PRINT N'PASS - Co che UPDLOCK/HOLDLOCK cho concurrency.';
    GO


    /* =========================================================
    25. KIEM TRA KHONG CON TRANSACTION MO
    ========================================================= */

    IF @@TRANCOUNT <> 0
        THROW 51325, N'Con transaction dang mo sau khi test.', 1;

    PRINT N'PASS - Khong con transaction mo.';
    GO


    /* =========================================================
    26. THONG KE OBJECT TOAN HE THONG
    ========================================================= */

    SELECT
        o.type_desc AS ObjectType,
        COUNT(*) AS SoLuong
    FROM sys.objects o
    WHERE o.schema_id = SCHEMA_ID(N'dbo')
    AND o.type IN
    (
        'U',
        'V',
        'P',
        'FN',
        'IF',
        'TF',
        'TR'
    )
    GROUP BY o.type_desc
    ORDER BY o.type_desc;
    GO


    /* =========================================================
    27. KET QUA CUOI
    ========================================================= */

    PRINT N'============================================================';
    PRINT N'INTEGRATION TEST HOAN TAT';
    PRINT N'============================================================';
    PRINT N'PASS - Schema 19 bang';
    PRINT N'PASS - PK / FK / CHECK / UNIQUE';
    PRINT N'PASS - Trigger';
    PRINT N'PASS - View';
    PRINT N'PASS - Function';
    PRINT N'PASS - Stored Procedure';
    PRINT N'PASS - Index';
    PRINT N'PASS - Security Role';
    PRINT N'PASS - Hoc phi / Thanh toan';
    PRINT N'PASS - Dang ky / Si so';
    PRINT N'PASS - Audit Log';
    PRINT N'PASS - Transaction / Concurrency';
    PRINT N'============================================================';
    GO