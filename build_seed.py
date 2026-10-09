# -*- coding: utf-8 -*-
"""
Script to generate complete 04_SeedData.sql and 04_SeedData.md for DBMS330284.
"""
import os

target_sql = r"c:\Users\ADMIN\Desktop\STUDY\NAM3\HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU\ProjectDBMS\DB\04_SeedData.sql"
target_md  = r"c:\Users\ADMIN\Desktop\STUDY\NAM3\HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU\ProjectDBMS\DB\04_SeedData.md"

def build_full_script():
    lines = []
    def w(s=""):
        lines.append(s)

    w("-- =========================================================")
    w("-- HE THONG QUAN LY DANG KY TIN CHI DBMS330284 - SEED DATA")
    w("-- ENCODING: UTF-8 WITH BOM")
    w("-- =========================================================")
    w("USE [DBMS330284];")
    w("GO")
    w("")
    w("SET NOCOUNT ON;")
    w("SET QUOTED_IDENTIFIER ON;")
    w("SET XACT_ABORT ON;")
    w("GO")
    w("")
    w("/* Thiet lap session context ban dau = NULL khi chua co TAIKHOAN */")
    w("EXEC sys.sp_set_session_context @key = N'MaTaiKhoan', @value = NULL;")
    w("GO")
    w("")
    w("/* =========================================================")
    w("   0. LAM SACH DU LIEU CU & RESET IDENTITY (Neu co)")
    w("   ========================================================= */")
    w("DELETE FROM dbo.CHITIETTHANHTOAN;")
    w("DELETE FROM dbo.HOCPHI;")
    w("DELETE FROM dbo.MUCHOCPHI;")
    w("DELETE FROM dbo.DIEMSO;")
    w("DELETE FROM dbo.DANGKYTINCHI;")
    w("DELETE FROM dbo.LICHHOC;")
    w("DELETE FROM dbo.LOPHOCPHAN;")
    w("DELETE FROM dbo.HOCKY;")
    w("DELETE FROM dbo.LOGHOATDONG; -- Xoa log dot 1 truoc khi xoa TAIKHOAN")
    w("DELETE FROM dbo.TAIKHOAN;")
    w("DELETE FROM dbo.SINHVIEN;")
    w("DELETE FROM dbo.GIANGVIEN;")
    w("DELETE FROM dbo.MONHOCTIENQUYET;")
    w("DELETE FROM dbo.CTDT_MONHOC;")
    w("DELETE FROM dbo.MONHOC;")
    w("DELETE FROM dbo.CHUONGTRINHDAOTAO;")
    w("DELETE FROM dbo.NGANH;")
    w("DELETE FROM dbo.KHOA;")
    w("DELETE FROM dbo.LOGHOATDONG; -- Xoa log dot 2 do cac trigger audit DELETE sinh ra")
    w("GO")
    w("")
    w("IF (SELECT last_value FROM sys.identity_columns WHERE object_id = OBJECT_ID('dbo.HOCKY')) IS NOT NULL DBCC CHECKIDENT ('dbo.HOCKY', RESEED, 0);")
    w("IF (SELECT last_value FROM sys.identity_columns WHERE object_id = OBJECT_ID('dbo.SINHVIEN')) IS NOT NULL DBCC CHECKIDENT ('dbo.SINHVIEN', RESEED, 0);")
    w("IF (SELECT last_value FROM sys.identity_columns WHERE object_id = OBJECT_ID('dbo.GIANGVIEN')) IS NOT NULL DBCC CHECKIDENT ('dbo.GIANGVIEN', RESEED, 0);")
    w("IF (SELECT last_value FROM sys.identity_columns WHERE object_id = OBJECT_ID('dbo.TAIKHOAN')) IS NOT NULL DBCC CHECKIDENT ('dbo.TAIKHOAN', RESEED, 0);")
    w("IF (SELECT last_value FROM sys.identity_columns WHERE object_id = OBJECT_ID('dbo.LICHHOC')) IS NOT NULL DBCC CHECKIDENT ('dbo.LICHHOC', RESEED, 0);")
    w("IF (SELECT last_value FROM sys.identity_columns WHERE object_id = OBJECT_ID('dbo.DANGKYTINCHI')) IS NOT NULL DBCC CHECKIDENT ('dbo.DANGKYTINCHI', RESEED, 0);")
    w("IF (SELECT last_value FROM sys.identity_columns WHERE object_id = OBJECT_ID('dbo.MUCHOCPHI')) IS NOT NULL DBCC CHECKIDENT ('dbo.MUCHOCPHI', RESEED, 0);")
    w("IF (SELECT last_value FROM sys.identity_columns WHERE object_id = OBJECT_ID('dbo.HOCPHI')) IS NOT NULL DBCC CHECKIDENT ('dbo.HOCPHI', RESEED, 0);")
    w("IF (SELECT last_value FROM sys.identity_columns WHERE object_id = OBJECT_ID('dbo.CHITIETTHANHTOAN')) IS NOT NULL DBCC CHECKIDENT ('dbo.CHITIETTHANHTOAN', RESEED, 0);")
    w("IF (SELECT last_value FROM sys.identity_columns WHERE object_id = OBJECT_ID('dbo.LOGHOATDONG')) IS NOT NULL DBCC CHECKIDENT ('dbo.LOGHOATDONG', RESEED, 0);")
    w("GO")
    w("")

    # 1. KHOA
    w("/* =========================================================")
    w("   1. DANH MUC KHOA (6 Khoa)")
    w("   ========================================================= */")
    w("INSERT INTO dbo.KHOA (MaKhoa, TenKhoa, Email, SoDienThoai, TrangThai)")
    w("VALUES")
    w("('CNTT', N'Khoa Công nghệ Thông tin', 'cntt@university.edu.vn', '02838123001', 1),")
    w("('KTPM', N'Khoa Kỹ thuật Phần mềm', 'ktpm@university.edu.vn', '02838123002', 1),")
    w("('HTTT', N'Khoa Hệ thống Thông tin', 'httt@university.edu.vn', '02838123003', 1),")
    w("('KHMT', N'Khoa Khoa học Máy tính', 'khmt@university.edu.vn', '02838123004', 1),")
    w("('MMT',  N'Khoa Mạng Máy tính & Truyền thông', 'mmt@university.edu.vn', '02838123005', 1),")
    w("('ATTT', N'Khoa An toàn Thông tin', 'attt@university.edu.vn', '02838123006', 1);")
    w("GO")
    w("")

    # 1.1 NGANH
    w("/* =========================================================")
    w("   1.1 DANH MUC NGANH (7 Ngành đào tạo)")
    w("   ========================================================= */")
    w("INSERT INTO dbo.NGANH (MaNganh, MaKhoa, TenNganh, MoTa, TrangThai)")
    w("VALUES")
    w("('N01', 'CNTT', N'Công nghệ thông tin', N'Đào tạo kỹ sư CNTT tổng hợp', 1),")
    w("('N02', 'KTPM', N'Kỹ thuật phần mềm', N'Đào tạo kỹ sư phát triển phần mềm chuyên nghiệp', 1),")
    w("('N03', 'HTTT', N'Hệ thống thông tin', N'Đào tạo phân tích thiết kế và quản trị hệ thống thông tin', 1),")
    w("('N04', 'KHMT', N'Khoa học máy tính', N'Đào tạo thuật toán, AI và xử lý dữ liệu lớn', 1),")
    w("('N05', 'MMT',  N'Mạng máy tính & Truyền thông', N'Đào tạo hạ tầng mạng, điện toán đám mây và viễn thông', 1),")
    w("('N06', 'ATTT', N'An toàn thông tin', N'Đào tạo bảo mật hệ thống và an ninh mạng', 1),")
    w("('N07', 'HTTT', N'Thương mại điện tử', N'Đào tạo ứng dụng HTTT trong kinh doanh trực tuyến', 1);")
    w("GO")
    w("")

    # 2. CHUONGTRINHDAOTAO
    w("/* =========================================================")
    w("   2. CHUONG TRINH DAO TAO (8 CTDT)")
    w("   ========================================================= */")
    w("INSERT INTO dbo.CHUONGTRINHDAOTAO (MaCTDT, MaNganh, TenCTDT, KhoaHoc, TongTinChiYeuCau, ThoiGianDaoTao, TrangThai)")
    w("VALUES")
    w("('CTDT_CNTT_CQ',  'N01', N'Công nghệ Thông tin Chuẩn', '2023-2027', 135, 4, 1),")
    w("('CTDT_CNTT_CLC', 'N01', N'Công nghệ Thông tin Chất lượng cao', '2023-2027', 140, 4, 1),")
    w("('CTDT_KTPM_CQ',  'N02', N'Kỹ thuật Phần mềm Chuẩn', '2023-2027', 135, 4, 1),")
    w("('CTDT_HTTT_CQ',  'N03', N'Hệ thống Thông tin Chuẩn', '2023-2027', 132, 4, 1),")
    w("('CTDT_KHMT_CQ',  'N04', N'Khoa học Máy tính Chuẩn', '2023-2027', 135, 4, 1),")
    w("('CTDT_MMT_CQ',   'N05', N'Mạng Máy tính Chuẩn', '2023-2027', 132, 4, 1),")
    w("('CTDT_ATTT_CQ',  'N06', N'An toàn Thông tin Chuẩn', '2023-2027', 135, 4, 1),")
    w("('CTDT_TMDT_CQ',  'N07', N'Thương mại Điện tử Chuẩn', '2023-2027', 130, 4, 1);")
    w("GO")
    w("")

    # 3. MONHOC
    w("/* =========================================================")
    w("   3. DANH MUC MON HOC (50 Môn học)")
    w("   ========================================================= */")
    courses = [
        ('TRIET', 'CNTT', "N'Triết học Mác - Lênin'", 3, 45, 0),
        ('TOAN1', 'KHMT', "N'Giải tích 1'", 3, 45, 0),
        ('TOAN2', 'KHMT', "N'Đại số tuyến tính'", 3, 45, 0),
        ('XSTK',  'KHMT', "N'Xác suất thống kê ứng dụng'", 3, 45, 0),
        ('VLDC',  'MMT',  "N'Vật lý đại cương cho CNTT'", 3, 45, 0),
        ('NMLT',  'CNTT', "N'Nhập môn lập trình'", 4, 45, 30),
        ('KTLT',  'CNTT', "N'Kỹ thuật lập trình'", 4, 45, 30),
        ('CTDLGT','CNTT', "N'Cấu trúc dữ liệu và giải thuật'", 4, 45, 30),
        ('CSDL',  'HTTT', "N'Cơ sở dữ liệu'", 4, 45, 30),
        ('HQTCSDL','HTTT',"N'Hệ quản trị cơ sở dữ liệu'", 4, 45, 30),
        ('KTMT',  'KHMT', "N'Kiến trúc máy tính'", 3, 45, 0),
        ('HDH',   'KHMT', "N'Hệ điều hành'", 3, 30, 30),
        ('MMT',   'MMT',  "N'Mạng máy tính cơ bản'", 3, 30, 30),
        ('OOP',   'KTPM', "N'Lập trình hướng đối tượng'", 4, 45, 30),
        ('CNPM',  'KTPM', "N'Công nghệ phần mềm'", 3, 45, 0),
        ('PTTKHT','HTTT', "N'Phân tích thiết kế hệ thống thông tin'", 3, 45, 0),
        ('WEB1',  'KTPM', "N'Lập trình Web cơ bản'", 3, 30, 30),
        ('WEB2',  'KTPM', "N'Phát triển ứng dụng Web nâng cao'", 3, 30, 30),
        ('MOBILE','KTPM', "N'Lập trình ứng dụng di động'", 3, 30, 30),
        ('TTNT',  'KHMT', "N'Trí tuệ nhân tạo'", 3, 45, 0),
        ('HOCMAY','KHMT', "N'Học máy và ứng dụng'", 3, 30, 30),
        ('ATBM',  'ATTT', "N'An toàn và bảo mật thông tin'", 3, 45, 0),
        ('MATMA', 'ATTT', "N'Mật mã học cơ sở'", 3, 45, 0),
        ('ATMANG','ATTT', "N'An ninh mạng máy tính'", 3, 30, 30),
        ('DPT',   'CNTT', "N'Công nghệ đa phương tiện'", 3, 30, 30),
        ('CLOUD', 'MMT',  "N'Điện toán đám mây'", 3, 30, 30),
        ('IOT',   'MMT',  "N'Internet vạn vật & Ứng dụng'", 3, 30, 30),
        ('KTKD',  'KTPM', "N'Kiến trúc phần mềm doanh nghiệp'", 3, 45, 0),
        ('KTPMNC','KTPM', "N'Kiểm thử phần mềm'", 3, 30, 30),
        ('QLDA',  'KTPM', "N'Quản lý dự án phần mềm'", 3, 45, 0),
        ('BIGDATA','HTTT',"N'Xử lý và phân tích dữ liệu lớn'", 3, 30, 30),
        ('DWBI',  'HTTT', "N'Kho dữ liệu & Business Intelligence'", 3, 30, 30),
        ('TMDT',  'HTTT', "N'Phát triển hệ thống Thương mại điện tử'", 3, 45, 0),
        ('KHDL',  'KHMT', "N'Khai phá dữ liệu'", 3, 30, 30),
        ('XLA',   'KHMT', "N'Xử lý ảnh kỹ thuật số'", 3, 30, 30),
        ('NLP',   'KHMT', "N'Xử lý ngôn ngữ tự nhiên'", 3, 30, 30),
        ('DEVOPS','KTPM', "N'Thực hành DevOps & CI/CD'", 3, 30, 30),
        ('FORENSIC','ATTT',"N'Điều tra số & Khắc phục sự cố'", 3, 30, 30),
        ('ETHICAL','ATTT',"N'Kiểm thử xâm nhập & Đạo đức bảo mật'", 3, 30, 30),
        ('LINUX', 'MMT',  "N'Quản trị hệ thống máy chủ Linux'", 3, 30, 30),
        ('ROUTING','MMT', "N'Định tuyến và chuyển mạch nâng cao'", 3, 30, 30),
        ('BLOCKCHAIN','CNTT',"N'Công nghệ Chuỗi khối căn bản'", 3, 45, 0),
        ('UIUX',  'KTPM', "N'Thiết kế giao diện người dùng UI/UX'", 3, 30, 30),
        ('ERP',   'HTTT', "N'Hệ thống hoạch định nguồn lực ERP'", 3, 45, 0),
        ('KTN',   'CNTT', "N'Kỹ năng nghề nghiệp & Giao tiếp'", 2, 30, 0),
        ('ANHVAN1','CNTT',"N'Tiếng Anh chuyên ngành 1'", 3, 45, 0),
        ('ANHVAN2','CNTT',"N'Tiếng Anh chuyên ngành 2'", 3, 45, 0),
        ('TTNN',  'CNTT', "N'Thực tập tốt nghiệp doanh nghiệp'", 2, 0, 60),
        ('DATN1', 'CNTT', "N'Đồ án chuyên ngành'", 3, 15, 60),
        ('DATN2', 'CNTT', "N'Khóa luận tốt nghiệp'", 5, 0, 150)
    ]
    w("INSERT INTO dbo.MONHOC (MaMonHoc, MaKhoa, TenMonHoc, SoTinChi, SoTietLyThuyet, SoTietThucHanh, TrangThai)")
    w("VALUES")
    clines = [f"('{c[0]}', '{c[1]}', {c[2]}, {c[3]}, {c[4]}, {c[5]}, 1)" for c in courses]
    w(",\n".join(clines) + ";")
    w("GO")
    w("")

    # 4. CTDT_MONHOC
    w("/* =========================================================")
    w("   4. CTDT_MONHOC (160 liên kết môn học - CTĐT)")
    w("   ========================================================= */")
    ctdts = ['CTDT_CNTT_CQ', 'CTDT_CNTT_CLC', 'CTDT_KTPM_CQ', 'CTDT_HTTT_CQ', 'CTDT_KHMT_CQ', 'CTDT_MMT_CQ', 'CTDT_ATTT_CQ', 'CTDT_TMDT_CQ']
    ctdt_vals = []
    for ctdt_id in ctdts:
        for idx in range(20):
            c = courses[idx]
            hk_dk = (idx // 3) + 1
            if hk_dk > 8: hk_dk = 8
            loai = 'BAT_BUOC' if idx < 15 else 'TU_CHON'
            ctdt_vals.append(f"('{ctdt_id}', '{c[0]}', {hk_dk}, '{loai}', {idx+1})")
    w("INSERT INTO dbo.CTDT_MONHOC (MaCTDT, MaMonHoc, HocKyDuKien, LoaiMon, ThuTu)")
    w("VALUES")
    w(",\n".join(ctdt_vals) + ";")
    w("GO")
    w("")

    # 5. MONHOCTIENQUYET
    w("/* =========================================================")
    w("   5. MONHOCTIENQUYET (36 quan hệ chuẩn, không chu trình)")
    w("   ========================================================= */")
    prereqs = [
        ('KTLT', 'NMLT', 'BAT_BUOC'),
        ('CTDLGT', 'KTLT', 'BAT_BUOC'),
        ('OOP', 'KTLT', 'BAT_BUOC'),
        ('CSDL', 'NMLT', 'BAT_BUOC'),
        ('HQTCSDL', 'CSDL', 'BAT_BUOC'),
        ('HDH', 'KTMT', 'BAT_BUOC'),
        ('MMT', 'KTMT', 'BAT_BUOC'),
        ('CNPM', 'OOP', 'BAT_BUOC'),
        ('PTTKHT', 'CSDL', 'BAT_BUOC'),
        ('WEB1', 'NMLT', 'BAT_BUOC'),
        ('WEB2', 'WEB1', 'BAT_BUOC'),
        ('MOBILE', 'OOP', 'BAT_BUOC'),
        ('TTNT', 'CTDLGT', 'BAT_BUOC'),
        ('HOCMAY', 'TTNT', 'BAT_BUOC'),
        ('ATBM', 'MMT', 'BAT_BUOC'),
        ('MATMA', 'TOAN2', 'BAT_BUOC'),
        ('ATMANG', 'ATBM', 'BAT_BUOC'),
        ('CLOUD', 'MMT', 'BAT_BUOC'),
        ('IOT', 'MMT', 'BAT_BUOC'),
        ('KTKD', 'CNPM', 'BAT_BUOC'),
        ('KTPMNC', 'CNPM', 'BAT_BUOC'),
        ('QLDA', 'CNPM', 'BAT_BUOC'),
        ('BIGDATA', 'HQTCSDL', 'BAT_BUOC'),
        ('DWBI', 'HQTCSDL', 'BAT_BUOC'),
        ('TMDT', 'CSDL', 'BAT_BUOC'),
        ('KHDL', 'HQTCSDL', 'BAT_BUOC'),
        ('XLA', 'TOAN2', 'BAT_BUOC'),
        ('NLP', 'TTNT', 'BAT_BUOC'),
        ('DEVOPS', 'LINUX', 'BAT_BUOC'),
        ('LINUX', 'HDH', 'BAT_BUOC'),
        ('ROUTING', 'MMT', 'BAT_BUOC'),
        ('FORENSIC', 'ATBM', 'BAT_BUOC'),
        ('ETHICAL', 'ATBM', 'BAT_BUOC'),
        ('ANHVAN2', 'ANHVAN1', 'BAT_BUOC'),
        ('DATN1', 'TTNN', 'BAT_BUOC'),
        ('DATN2', 'DATN1', 'BAT_BUOC')
    ]
    w("INSERT INTO dbo.MONHOCTIENQUYET (MaMonHoc, MaMonTienQuyet, MucDo)")
    w("VALUES")
    prlines = [f"('{p[0]}', '{p[1]}', '{p[2]}')" for p in prereqs]
    w(",\n".join(prlines) + ";")
    w("GO")
    w("")

    # 6. HOCKY
    w("/* =========================================================")
    w("   6. HOCKY (7 Học kỳ từ 2023 đến 2027)")
    w("   ========================================================= */")
    w("INSERT INTO dbo.HOCKY (NamHoc, TenHocKy, NgayBatDau, NgayKetThuc, NgayMoDangKy, NgayDongDangKy, TrangThai)")
    w("VALUES")
    w("('2023-2024', N'Học kỳ 1', '2023-09-01', '2024-01-31', '2023-08-15 00:00:00', '2023-08-25 23:59:59', 'KET_THUC'),")
    w("('2023-2024', N'Học kỳ 2', '2024-02-15', '2024-06-30', '2024-01-20 00:00:00', '2024-01-30 23:59:59', 'KET_THUC'),")
    w("('2024-2025', N'Học kỳ 1', '2024-09-01', '2025-01-31', '2024-08-15 00:00:00', '2024-08-25 23:59:59', 'KET_THUC'),")
    w("('2024-2025', N'Học kỳ 2', '2025-02-15', '2025-06-30', '2025-01-20 00:00:00', '2025-01-30 23:59:59', 'KET_THUC'),")
    w("('2025-2026', N'Học kỳ 1', '2025-09-01', '2026-01-31', '2025-08-15 00:00:00', '2025-08-25 23:59:59', 'KET_THUC'),")
    w("('2025-2026', N'Học kỳ 2', '2026-02-15', '2026-06-30', '2026-01-20 00:00:00', '2026-01-30 23:59:59', 'KET_THUC'),")
    w("('2026-2027', N'Học kỳ 1', '2026-09-01', '2027-01-31', '2026-08-15 00:00:00', '2027-01-31 23:59:59', 'DANG_MO');")
    w("GO")
    w("")

    # 7. MUCHOCPHI
    w("/* =========================================================")
    w("   7. MUCHOCPHI (7 Mức học phí theo từng học kỳ)")
    w("   ========================================================= */")
    w("""
INSERT INTO dbo.MUCHOCPHI (MaHocKy, PhamViApDung, DonGiaTinChi, NgayHieuLuc, NgayHetHieuLuc, TrangThai)
SELECT
    hk.MaHocKy,
    'TOAN_TRUONG',
    val.DonGia,
    val.NgayHL,
    val.NgayHHL,
    'ACTIVE'
FROM dbo.HOCKY hk
INNER JOIN (VALUES
    ('2023-2024', N'Học kỳ 1', 450000.00, '2023-08-01', '2024-01-31'),
    ('2023-2024', N'Học kỳ 2', 450000.00, '2024-02-01', '2024-06-30'),
    ('2024-2025', N'Học kỳ 1', 480000.00, '2024-08-01', '2025-01-31'),
    ('2024-2025', N'Học kỳ 2', 480000.00, '2025-02-01', '2025-06-30'),
    ('2025-2026', N'Học kỳ 1', 520000.00, '2025-08-01', '2026-01-31'),
    ('2025-2026', N'Học kỳ 2', 520000.00, '2026-02-01', '2026-06-30'),
    ('2026-2027', N'Học kỳ 1', 550000.00, '2026-08-01', '2027-01-31')
) AS val(NamHoc, TenHocKy, DonGia, NgayHL, NgayHHL)
    ON val.NamHoc = hk.NamHoc AND val.TenHocKy = hk.TenHocKy;
GO
""")

    # 8. GIANGVIEN
    w("/* =========================================================")
    w("   8. GIANGVIEN (25 Giảng viên)")
    w("   ========================================================= */")
    gv_data = [
        ('GV0001', "N'Nguyễn Văn An'", "'an.nguyen@university.edu.vn'", "'0901234001'", "'CNTT'"),
        ('GV0002', "N'Trần Thị Bích'", "'bich.tran@university.edu.vn'", "'0901234002'", "'CNTT'"),
        ('GV0003', "N'Lê Hoàng Cường'", "'cuong.le@university.edu.vn'", "'0901234003'", "'CNTT'"),
        ('GV0004', "N'Phạm Minh Dũng'", "'dung.pham@university.edu.vn'", "'0901234004'", "'CNTT'"),
        ('GV0005', "N'Hoàng Thanh Giang'", "'giang.hoang@university.edu.vn'", "'0901234005'", "'KTPM'"),
        ('GV0006', "N'Vũ Hải Đăng'", "'dang.vu@university.edu.vn'", "'0901234006'", "'KTPM'"),
        ('GV0007', "N'Đặng Quốc Hùng'", "'hung.dang@university.edu.vn'", "'0901234007'", "'KTPM'"),
        ('GV0008', "N'Bùi Anh Khoa'", "'khoa.bui@university.edu.vn'", "'0901234008'", "'KTPM'"),
        ('GV0009', "N'Đỗ Phương Linh'", "'linh.do@university.edu.vn'", "'0901234009'", "'HTTT'"),
        ('GV0010', "N'Hồ Bảo Long'", "'long.ho@university.edu.vn'", "'0901234010'", "'HTTT'"),
        ('GV0011', "N'Ngô Quang Minh'", "'minh.ngo@university.edu.vn'", "'0901234011'", "'HTTT'"),
        ('GV0012', "N'Dương Hoài Nam'", "'nam.duong@university.edu.vn'", "'0901234012'", "'HTTT'"),
        ('GV0013', "N'Lý Vĩnh Phúc'", "'phuc.ly@university.edu.vn'", "'0901234013'", "'KHMT'"),
        ('GV0014', "N'Mai Hồng Quân'", "'quan.mai@university.edu.vn'", "'0901234014'", "'KHMT'"),
        ('GV0015', "N'Trịnh Thế Sơn'", "'son.trinh@university.edu.vn'", "'0901234015'", "'KHMT'"),
        ('GV0016', "N'Đinh Hữu Tâm'", "'tam.dinh@university.edu.vn'", "'0901234016'", "'KHMT'"),
        ('GV0017', "N'Phan Chiến Thắng'", "'thang.phan@university.edu.vn'", "'0901234017'", "'MMT'"),
        ('GV0018', "N'Võ Đức Toàn'", "'toan.vo@university.edu.vn'", "'0901234018'", "'MMT'"),
        ('GV0019', "N'Cao Thành Trung'", "'trung.cao@university.edu.vn'", "'0901234019'", "'MMT'"),
        ('GV0020', "N'Lâm Minh Tú'", "'tu.lam@university.edu.vn'", "'0901234020'", "'MMT'"),
        ('GV0021', "N'Hà Anh Tuấn'", "'tuan.ha@university.edu.vn'", "'0901234021'", "'ATTT'"),
        ('GV0022', "N'Tạ Quốc Việt'", "'viet.ta@university.edu.vn'", "'0901234022'", "'ATTT'"),
        ('GV0023', "N'Lương Thảo Vy'", "'vy.luong@university.edu.vn'", "'0901234023'", "'ATTT'"),
        ('GV0024', "N'Phùng Khắc Huy'", "'huy.phung@university.edu.vn'", "'0901234024'", "'ATTT'"),
        ('GV0025', "N'Trương Mỹ Duyên'", "'duyen.truong@university.edu.vn'", "'0901234025'", "'CNTT'")
    ]
    w("INSERT INTO dbo.GIANGVIEN (MaGiangVien, HoTen, Email, SoDienThoai, MaKhoa, TrangThai, NgayTao)")
    w("VALUES")
    gvlines = [f"('{g[0]}', {g[1]}, {g[2]}, {g[3]}, {g[4]}, 'DANG_CONG_TAC', '2023-01-15 08:00:00')" for g in gv_data]
    w(",\n".join(gvlines) + ";")
    w("GO")
    w("")

    # 9. SINHVIEN (1.500 sinh vien qua set-based CTE)
    w("/* =========================================================")
    w("   9. SINHVIEN (1.500 Sinh viên thực tế: Khóa 23, 24, 25)")
    w("   ========================================================= */")
    w("""
;WITH
HoList AS (
    SELECT id, Ho FROM (VALUES
        (0, N'Nguyễn'), (1, N'Trần'), (2, N'Lê'), (3, N'Phạm'), (4, N'Hoàng'),
        (5, N'Huỳnh'), (6, N'Phan'), (7, N'Vũ'), (8, N'Võ'), (9, N'Đặng'),
        (10, N'Bùi'), (11, N'Đỗ'), (12, N'Hồ'), (13, N'Ngô'), (14, N'Dương')
    ) AS t(id, Ho)
),
DemList AS (
    SELECT id, Dem FROM (VALUES
        (0, N'Văn'), (1, N'Thị'), (2, N'Minh'), (3, N'Hoàng'), (4, N'Đức'),
        (5, N'Hữu'), (6, N'Tuấn'), (7, N'Thanh'), (8, N'Anh'), (9, N'Quang'),
        (10, N'Bảo'), (11, N'Thảo'), (12, N'Ngọc'), (13, N'Xuân'), (14, N'Hải')
    ) AS t(id, Dem)
),
TenList AS (
    SELECT id, Ten FROM (VALUES
        (0, N'An'), (1, N'Bình'), (2, N'Cường'), (3, N'Dũng'), (4, N'Giang'),
        (5, N'Hải'), (6, N'Hùng'), (7, N'Khoa'), (8, N'Linh'), (9, N'Long'),
        (10, N'Minh'), (11, N'Nam'), (12, N'Phúc'), (13, N'Quân'), (14, N'Sơn'),
        (15, N'Tâm'), (16, N'Thắng'), (17, N'Toàn'), (18, N'Trung'), (19, N'Tú'),
        (20, N'Tuấn'), (21, N'Việt'), (22, N'Vy'), (23, N'Trang'), (24, N'Huy')
    ) AS t(id, Ten)
),
KhoaSeq AS (
    SELECT id, MaKhoa FROM (VALUES
        (0, 'CNTT'), (1, 'KTPM'), (2, 'HTTT'), (3, 'KHMT'), (4, 'MMT'), (5, 'ATTT')
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
            WHEN n <= 500 THEN '23'
            WHEN n <= 1000 THEN '24'
            ELSE '25'
        END AS KhoaTuyen,
        RIGHT('00000' + CAST(n AS VARCHAR), 6) AS SttStr,
        k.MaKhoa,
        h.Ho + N' ' + d.Dem + N' ' + t.Ten AS HoTen,
        DATEADD(DAY, (n * 37) % 1400, '2004-01-01') AS NgaySinh,
        CASE
            WHEN n <= 500 THEN '2023-08-10 09:00:00'
            WHEN n <= 1000 THEN '2024-08-10 09:00:00'
            ELSE '2025-08-10 09:00:00'
        END AS NgayTao,
        CASE
            WHEN n IN (495, 496, 497, 498, 499, 500, 998, 999, 1000) THEN 'BAO_LUU'
            WHEN n BETWEEN 460 AND 485 THEN 'TOT_NGHIEP'
            WHEN n IN (488, 489, 988) THEN 'THOI_HOC'
            ELSE 'DANG_HOC'
        END AS TrangThai
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
INSERT INTO dbo.SINHVIEN (MaSinhVien, HoTen, NgaySinh, Email, SoDienThoai, MaKhoa, TrangThai, NgayTao)
SELECT
    KhoaTuyen + SttStr AS MaSinhVien,
    HoTen,
    NgaySinh,
    'sv' + KhoaTuyen + SttStr + '@student.edu.vn' AS Email,
    '098' + RIGHT('0000000' + CAST(n AS VARCHAR), 7) AS SoDienThoai,
    MaKhoa,
    TrangThai,
    NgayTao
FROM RawSV;
GO
""")

    # 10. TAIKHOAN
    w("/* =========================================================")
    w("   10. TAIKHOAN (Admin, Dao tao, Giang vien, Sinh vien)")
    w("   ========================================================= */")
    w("""
-- 1. Tai khoan QUAN_TRI va DAO_TAO
INSERT INTO dbo.TAIKHOAN (Username, PasswordHash, VaiTro, TrangThai, MaSV, MaGV, NgayTao, LanDangNhapCuoi)
VALUES
('admin', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'QUAN_TRI', 'ACTIVE', NULL, NULL, '2023-01-01', '2026-10-07 14:00:00'),
('quantri01', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'QUAN_TRI', 'ACTIVE', NULL, NULL, '2023-01-01', '2026-10-06 09:30:00'),
('daotao01', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'DAO_TAO', 'ACTIVE', NULL, NULL, '2023-01-01', '2026-10-08 08:15:00'),
('daotao02', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'DAO_TAO', 'ACTIVE', NULL, NULL, '2023-01-01', '2026-09-30 11:20:00');

-- 2. Tai khoan GIANG_VIEN
INSERT INTO dbo.TAIKHOAN (Username, PasswordHash, VaiTro, TrangThai, MaSV, MaGV, NgayTao, LanDangNhapCuoi)
SELECT
    'gv_' + LOWER(MaGiangVien),
    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
    'GIANG_VIEN',
    'ACTIVE',
    NULL,
    MaGV,
    NgayTao,
    DATEADD(DAY, -((MaGV * 3) % 20), '2026-10-08')
FROM dbo.GIANGVIEN;

-- 3. Tai khoan SINH_VIEN (1.500 sinh vien)
INSERT INTO dbo.TAIKHOAN (Username, PasswordHash, VaiTro, TrangThai, MaSV, MaGV, NgayTao, LanDangNhapCuoi)
SELECT
    'sv_' + MaSinhVien,
    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
    'SINH_VIEN',
    CASE
        WHEN TrangThai = 'THOI_HOC' THEN 'DISABLED'
        WHEN TrangThai = 'BAO_LUU' THEN 'LOCKED'
        ELSE 'ACTIVE'
    END,
    MaSV,
    NULL,
    NgayTao,
    DATEADD(DAY, -((MaSV * 7) % 45), '2026-10-08')
FROM dbo.SINHVIEN;
GO

/* Sau khi da co TAIKHOAN admin (MaTaiKhoan = 1), thiet lap session context de audit log */
EXEC sys.sp_set_session_context @key = N'MaTaiKhoan', @value = 1;
GO
""")

    # 11. LOPHOCPHAN (588 lop hoc phan: 7 hoc ky * 84 lop)
    w("/* =========================================================")
    w("   11. LOPHOCPHAN (588 Lớp học phần: 7 học kỳ x 84 lớp)")
    w("   ========================================================= */")
    w("""
;WITH
SemesterOrdered AS (
    SELECT MaHocKy,
           ROW_NUMBER() OVER(ORDER BY NgayBatDau) AS SemesterSeq,
           CASE WHEN TrangThai = 'DANG_MO' THEN 'MO_DANG_KY' ELSE 'DA_KHOA' END AS TrangThaiLHP
    FROM dbo.HOCKY
),
SelectedCourses AS (
    -- 42 mon hoc mo lop, moi mon mo 2 lop = 84 lop / hoc ky
    SELECT MaMonHoc, TenMonHoc, ROW_NUMBER() OVER(ORDER BY MaMonHoc) AS Seq
    FROM dbo.MONHOC
    WHERE MaMonHoc IN (
        'TRIET','TOAN1','TOAN2','XSTK','VLDC','NMLT','KTLT','CTDLGT',
        'CSDL','HQTCSDL','KTMT','HDH','MMT','OOP','CNPM','PTTKHT',
        'WEB1','WEB2','MOBILE','TTNT','HOCMAY','ATBM','MATMA','ATMANG',
        'CLOUD','IOT','KTKD','KTPMNC','QLDA','BIGDATA','TMDT','KHDL',
        'LINUX','ROUTING','UIUX','ANHVAN1','ANHVAN2','XLA','NLP','DEVOPS',
        'FORENSIC','ETHICAL'
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
    'LHP_HK' + CAST(s.SemesterSeq AS VARCHAR) + '_' + s.MaMonHoc + '_0' + CAST(s.LopIdx AS VARCHAR) AS MaLHP,
    s.MaMonHoc,
    s.MaHocKy,
    gv.MaGV AS MaGiangVien,
    s.TenMonHoc + N' - Lớp 0' + CAST(s.LopIdx AS VARCHAR) + ' (HK' + CAST(s.SemesterSeq AS VARCHAR) + ')' AS TenLHP,
    120 AS SoLuongToiDa,
    s.TrangThaiLHP
FROM ClassExpanded s
-- Gan giang vien theo cong thuc dong bo voi TimeSlot de khong bao gio bi trung gio giang day
INNER JOIN GV_Numbered gv
    ON gv.GV_Seq = ((( (s.SlotId - 1) % 24 ) + ((s.SlotId - 1) / 24) * 6 + s.SemesterSeq ) % 25) + 1;
GO
""")

    # 12. LICHHOC (Phan bo slot khong xung dot, tuan thu BR05)
    w("/* =========================================================")
    w("   12. LICHHOC (Phân bổ phòng và giờ học không xung đột BR05)")
    w("   ========================================================= */")
    w("""
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
        (0, 'A101'), (1, 'A102'), (2, 'A201'), (3, 'A202'),
        (4, 'B101'), (5, 'B102'), (6, 'B201'), (7, 'B202'),
        (8, 'C101'), (9, 'C102'), (10, 'C201'), (11, 'C202')
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
FROM ScheduleSlots;
GO
""")

    # 13. DANGKYTINCHI (~52.000 dang ky, si so < 120)
    w("/* =========================================================")
    w("   13. DANGKYTINCHI (~52.000 bản ghi qua 7 học kỳ)")
    w("   ========================================================= */")
    w("""
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
    WHERE s.TrangThai IN ('DANG_HOC', 'TOT_NGHIEP')
      AND (
          (s.MaSinhVien LIKE '23%' AND h.SemesterSeq BETWEEN 1 AND 7) OR
          (s.MaSinhVien LIKE '24%' AND h.SemesterSeq BETWEEN 3 AND 7) OR
          (s.MaSinhVien LIKE '25%' AND h.SemesterSeq BETWEEN 5 AND 7)
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
            WHEN (sv.MaSV + k) % 30 = 0 THEN 'CANCELLED'
            ELSE 'REGISTERED'
        END AS TrangThai
    FROM SV_Semester sv
    CROSS JOIN (VALUES (0), (1), (2), (3), (4), (5)) AS sub(k)
    INNER JOIN LHP_Numbered lhp
        ON lhp.MaHocKy = sv.MaHocKy
       AND lhp.LHP_Seq = (((sv.SV_Seq * 5 + k * 11) % 84) + 1)
)
INSERT INTO dbo.DANGKYTINCHI (MaSV, MaLHP, NgayDangKy, TrangThai)
SELECT DISTINCT MaSV, MaLHP, NgayDangKy, TrangThai
FROM Enrollments;
GO
""")

    # 14. DIEMSO (~42.000 diem so cho cac ky 1..6)
    w("/* =========================================================")
    w("   14. DIEMSO (~42.000 bản ghi cho các học kỳ lịch sử 1..6)")
    w("   ========================================================= */")
    w("""
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
    WHERE dk.TrangThai = 'REGISTERED'
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
FROM GradeGen;
GO
""")

    # 15. HOCPHI (~7.400 ho so hoc phi)
    w("/* =========================================================")
    w("   15. HOCPHI (~7.400 hồ sơ học phí theo từng sinh viên & học kỳ)")
    w("   ========================================================= */")
    w("""
;WITH
StudentCredits AS (
    SELECT
        dk.MaSV,
        lhp.MaHocKy,
        SUM(CAST(mh.SoTinChi AS INT)) AS TongTinChi
    FROM dbo.DANGKYTINCHI dk
    INNER JOIN dbo.LOPHOCPHAN lhp ON lhp.MaLHP = dk.MaLHP
    INNER JOIN dbo.MONHOC mh ON mh.MaMonHoc = lhp.MaMonHoc
    WHERE dk.TrangThai = 'REGISTERED'
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
    'UNPAID' AS TrangThai,
    DATEADD(DAY, 10, hk.NgayMoDangKy) AS NgayCapNhat
FROM StudentCredits sc
INNER JOIN dbo.HOCKY hk ON hk.MaHocKy = sc.MaHocKy
INNER JOIN dbo.MUCHOCPHI mph ON mph.MaHocKy = sc.MaHocKy AND mph.TrangThai = 'ACTIVE'
WHERE NOT (sc.MaSV = 1500 AND hk.TrangThai = 'DANG_MO');
GO
""")

    # 16. CHITIETTHANHTOAN (~14.000 lan thanh toan, trigger tu dong update HOCPHI)
    w("/* =========================================================")
    w("   16. CHITIETTHANHTOAN (Thanh toán nhiều đợt, Trigger tự đồng bộ)")
    w("   ========================================================= */")
    w("""
-- Dot 1: Thanh toan lan dau (Tat ca cac ho so tru 10% chua nop)
-- 50% dong 100%, 40% dong 50%, 10% chua dong
INSERT INTO dbo.CHITIETTHANHTOAN (MaHocPhi, SoTien, NgayThanhToan, PhuongThuc)
SELECT
    hp.MaHocPhi,
    CASE
        WHEN hp.MaHocPhi % 10 BETWEEN 0 AND 4 THEN hp.TongTien           -- Dong du 100%
        ELSE CAST(hp.TongTien * 0.50 AS DECIMAL(14,2))                  -- Dong 50%
    END AS SoTien,
    DATEADD(DAY, 12 + (hp.MaHocPhi % 15), hk.NgayMoDangKy) AS NgayThanhToan,
    CASE WHEN hp.MaHocPhi % 2 = 0 THEN 'CHUYEN_KHOAN' ELSE 'TIEN_MAT' END AS PhuongThuc
FROM dbo.HOCPHI hp
INNER JOIN dbo.HOCKY hk ON hk.MaHocKy = hp.MaHocKy
WHERE (hp.MaHocPhi % 10) <> 9; -- 10% chua dong gi

-- Dot 2: Nop them 25% cho mot nua so ho so dang tra gop
INSERT INTO dbo.CHITIETTHANHTOAN (MaHocPhi, SoTien, NgayThanhToan, PhuongThuc)
SELECT
    hp.MaHocPhi,
    CAST(hp.TongTien * 0.25 AS DECIMAL(14,2)) AS SoTien,
    DATEADD(DAY, 28 + (hp.MaHocPhi % 10), hk.NgayMoDangKy) AS NgayThanhToan,
    'CHUYEN_KHOAN' AS PhuongThuc
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
        WHEN ISNULL(p.TongDaNop, 0.00) = 0 THEN 'UNPAID'
        WHEN ISNULL(p.TongDaNop, 0.00) >= hp.TongTien THEN 'PAID'
        ELSE 'PARTIAL'
    END
FROM dbo.HOCPHI hp
LEFT JOIN PaymentAgg p ON hp.MaHocPhi = p.MaHocPhi;
GO
""")

    # 17. SEED AUDIT LOG LICH SU (LOGHOATDONG: >100.000 records)
    w("/* =========================================================")
    w("   17. SEED AUDIT LOG LỊCH SỬ (LOGHOATDONG: >100.000 records)")
    w("   ========================================================= */")
    w("""
-- 1. Log dang ky tin chi tu DANGKYTINCHI (~44.500 rows)
INSERT INTO dbo.LOGHOATDONG (MaTaiKhoan, ThoiGian, HanhDong, TenBang, KhoaBanGhi, NoiDungCu, NoiDungMoi)
SELECT
    tk.MaTaiKhoan,
    DATEADD(SECOND, (dk.MaDangKy * 97) % (3 * 365 * 86400), '2023-08-15 08:00:00'),
    'INSERT',
    'DANGKYTINCHI',
    CAST(dk.MaDangKy AS NVARCHAR(100)),
    NULL,
    N'{"MaSV":' + CAST(dk.MaSV AS NVARCHAR) + N',"MaLHP":"' + dk.MaLHP + N'","TrangThai":"' + dk.TrangThai + N'"}'
FROM dbo.DANGKYTINCHI dk
INNER JOIN dbo.TAIKHOAN tk ON tk.MaSV = dk.MaSV;

-- 2. Log cham diem tu DIEMSO (~34.400 rows)
INSERT INTO dbo.LOGHOATDONG (MaTaiKhoan, ThoiGian, HanhDong, TenBang, KhoaBanGhi, NoiDungCu, NoiDungMoi)
SELECT
    tk.MaTaiKhoan,
    DATEADD(SECOND, (ds.MaDangKy * 101) % (3 * 365 * 86400), '2023-09-01 08:00:00'),
    'INSERT',
    'DIEMSO',
    CAST(ds.MaDangKy AS NVARCHAR(100)),
    NULL,
    N'{"MaDangKy":' + CAST(ds.MaDangKy AS NVARCHAR) + N',"DiemQT":' + CAST(ds.DiemQuaTrinh AS NVARCHAR) + N',"DiemGK":' + CAST(ds.DiemGiuaKy AS NVARCHAR) + N',"DiemCK":' + CAST(ds.DiemCuoiKy AS NVARCHAR) + N'}'
FROM dbo.DIEMSO ds
CROSS JOIN (SELECT TOP (1) MaTaiKhoan FROM dbo.TAIKHOAN WHERE VaiTro = 'DAO_TAO') tk;

-- 3. Log thanh toan hoc phi tu CHITIETTHANHTOAN (~8.100 rows)
INSERT INTO dbo.LOGHOATDONG (MaTaiKhoan, ThoiGian, HanhDong, TenBang, KhoaBanGhi, NoiDungCu, NoiDungMoi)
SELECT
    tk.MaTaiKhoan,
    CAST(ct.NgayThanhToan AS DATETIME2(7)),
    'INSERT',
    'CHITIETTHANHTOAN',
    CAST(ct.MaThanhToan AS NVARCHAR(100)),
    NULL,
    N'{"MaHocPhi":' + CAST(ct.MaHocPhi AS NVARCHAR) + N',"SoTien":' + CAST(ct.SoTien AS NVARCHAR) + N',"PhuongThuc":"' + ct.PhuongThuc + N'"}'
FROM dbo.CHITIETTHANHTOAN ct
INNER JOIN dbo.HOCPHI hp ON hp.MaHocPhi = ct.MaHocPhi
INNER JOIN dbo.TAIKHOAN tk ON tk.MaSV = hp.MaSV;

-- 4. Log cap nhat trang thai tu HOCPHI (~7.400 rows)
INSERT INTO dbo.LOGHOATDONG (MaTaiKhoan, ThoiGian, HanhDong, TenBang, KhoaBanGhi, NoiDungCu, NoiDungMoi)
SELECT
    tk.MaTaiKhoan,
    DATEADD(DAY, 15, hk.NgayMoDangKy),
    'UPDATE',
    'HOCPHI',
    CAST(hp.MaHocPhi AS NVARCHAR(100)),
    N'{"TrangThai":"UNPAID","SoTienDaThanhToan":0.00}',
    N'{"TrangThai":"' + hp.TrangThai + N'","SoTienDaThanhToan":' + CAST(hp.SoTienDaThanhToan AS NVARCHAR) + N'}'
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
    DATEADD(MINUTE, (l.rn * 17) % (3 * 365 * 1440), '2023-08-10 07:00:00'),
    'UPDATE',
    'TAIKHOAN',
    CAST(l.MaTaiKhoan AS NVARCHAR(100)),
    N'{"TrangThai":"ACTIVE"}',
    N'{"TrangThai":"ACTIVE","LanDangNhap":' + CAST(l.rn AS NVARCHAR) + N'}'
FROM AccountUpdates l;
GO
""")

    # 18. THONG KE TONG KET DỮ LIỆU
    w("/* =========================================================")
    w("   18. TỔNG KẾT DỮ LIỆU SEED TRONG HỆ THỐNG")
    w("   ========================================================= */")
    w("""
SELECT
    t.name AS TenBang,
    SUM(p.rows) AS [SoLuongBanGhi]
FROM sys.tables t
INNER JOIN sys.partitions p
    ON p.object_id = t.object_id
   AND p.index_id IN (0, 1)
WHERE t.schema_id = SCHEMA_ID(N'dbo')
GROUP BY t.name
ORDER BY t.name;
GO

PRINT N'============================================================';
PRINT N'SEED DATA HOAN TAT THANH CONG!';
PRINT N'============================================================';
GO
""")

    return "\n".join(lines)

content = build_full_script()

with open(target_sql, "w", encoding="utf-8-sig") as f:
    f.write(content)

with open(target_md, "w", encoding="utf-8-sig") as f:
    f.write(content)

print(f"Generated {len(content.splitlines())} lines successfully.")
