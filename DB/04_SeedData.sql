-- =========================================================
-- HE THONG QUAN LY DANG KY TIN CHI DBMS330284 - SEED DATA
-- ENCODING: UTF-8 WITH BOM
-- =========================================================
USE [$(DatabaseName)];
GO

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;
GO

/* Thiet lap session context ban dau = NULL khi chua co TAIKHOAN */
EXEC sys.sp_set_session_context @key = N'MaTaiKhoan', @value = NULL;
GO

/* Seed chỉ chạy trên database mới, trống. Không xóa hay reseed dữ liệu đang có. */
IF EXISTS (SELECT 1 FROM sys.tables t WHERE t.is_ms_shipped = 0 AND EXISTS
    (SELECT 1 FROM sys.partitions p WHERE p.object_id = t.object_id AND p.index_id IN (0, 1) AND p.rows > 0))
    THROW 52001, N'Seed bị từ chối: database không trống.', 1;
GO

/* =========================================================
   1. DANH MUC KHOA (6 Khoa)
   ========================================================= */
INSERT INTO dbo.KHOA (MaKhoa, TenKhoa, Email, SoDienThoai, TrangThai)
VALUES
('CNTT', N'Khoa Công nghệ Thông tin', 'cntt@university.edu.vn', '02838123001', 1),
('KTPM', N'Khoa Kỹ thuật Phần mềm', 'ktpm@university.edu.vn', '02838123002', 1),
('HTTT', N'Khoa Hệ thống Thông tin', 'httt@university.edu.vn', '02838123003', 1),
('KHMT', N'Khoa Khoa học Máy tính', 'khmt@university.edu.vn', '02838123004', 1),
('MMT',  N'Khoa Mạng Máy tính & Truyền thông', 'mmt@university.edu.vn', '02838123005', 1),
('ATTT', N'Khoa An toàn Thông tin', 'attt@university.edu.vn', '02838123006', 1);
GO

/* =========================================================
   1.1 DANH MUC NGANH (7 Ngành đào tạo)
   ========================================================= */
INSERT INTO dbo.NGANH (MaNganh, MaKhoa, TenNganh, MoTa, TrangThai)
VALUES
('N01', 'CNTT', N'Công nghệ thông tin', N'Đào tạo kỹ sư CNTT tổng hợp', 1),
('N02', 'KTPM', N'Kỹ thuật phần mềm', N'Đào tạo kỹ sư phát triển phần mềm chuyên nghiệp', 1),
('N03', 'HTTT', N'Hệ thống thông tin', N'Đào tạo phân tích thiết kế và quản trị hệ thống thông tin', 1),
('N04', 'KHMT', N'Khoa học máy tính', N'Đào tạo thuật toán, AI và xử lý dữ liệu lớn', 1),
('N05', 'MMT',  N'Mạng máy tính & Truyền thông', N'Đào tạo hạ tầng mạng, điện toán đám mây và viễn thông', 1),
('N06', 'ATTT', N'An toàn thông tin', N'Đào tạo bảo mật hệ thống và an ninh mạng', 1),
('N07', 'HTTT', N'Thương mại điện tử', N'Đào tạo ứng dụng HTTT trong kinh doanh trực tuyến', 1);
GO

/* =========================================================
   2. CHUONG TRINH DAO TAO (8 CTDT)
   ========================================================= */
INSERT INTO dbo.CHUONGTRINHDAOTAO (MaCTDT, MaNganh, TenCTDT, KhoaHoc, NamTuyenSinh, TongTinChiYeuCau, ThoiGianDaoTao, TrangThai)
VALUES
('CTDT_CNTT_CQ',  'N01', N'Công nghệ Thông tin Chuẩn', '2023-2027',  2023, 135, 4, 1),
('CTDT_CNTT_CLC', 'N01', N'Công nghệ Thông tin Chất lượng cao', '2023-2027',  2023, 140, 4, 1),
('CTDT_KTPM_CQ',  'N02', N'Kỹ thuật Phần mềm Chuẩn', '2023-2027',  2023, 135, 4, 1),
('CTDT_HTTT_CQ',  'N03', N'Hệ thống Thông tin Chuẩn', '2023-2027',  2023, 132, 4, 1),
('CTDT_KHMT_CQ',  'N04', N'Khoa học Máy tính Chuẩn', '2023-2027',  2023, 135, 4, 1),
('CTDT_MMT_CQ',   'N05', N'Mạng Máy tính Chuẩn', '2023-2027',  2023, 132, 4, 1),
('CTDT_ATTT_CQ',  'N06', N'An toàn Thông tin Chuẩn', '2023-2027',  2023, 135, 4, 1),
('CTDT_TMDT_CQ',  'N07', N'Thương mại Điện tử Chuẩn', '2023-2027',  2023, 130, 4, 1);
GO

INSERT INTO dbo.CHUONGTRINHDAOTAO (MaCTDT, MaNganh, TenCTDT, KhoaHoc, NamTuyenSinh, TongTinChiYeuCau, ThoiGianDaoTao, TrangThai)
SELECT CONCAT(src.MaCTDT, '_', RIGHT(CONVERT(VARCHAR(4), cohort.NamTuyenSinh), 2)),
       src.MaNganh, src.TenCTDT, CONCAT(cohort.NamTuyenSinh, '-', cohort.NamTuyenSinh + 4),
       cohort.NamTuyenSinh, src.TongTinChiYeuCau, src.ThoiGianDaoTao, src.TrangThai
FROM dbo.CHUONGTRINHDAOTAO src
CROSS JOIN (VALUES (2024), (2025)) cohort(NamTuyenSinh);
GO


/* =========================================================
   3. DANH MUC MON HOC (50 Môn học)
   ========================================================= */
INSERT INTO dbo.MONHOC (MaMonHoc, MaKhoa, TenMonHoc, SoTinChi, SoTietLyThuyet, SoTietThucHanh, TrangThai)
VALUES
('TRIET', 'CNTT', N'Triết học Mác - Lênin', 3, 45, 0, 1),
('TOAN1', 'KHMT', N'Giải tích 1', 3, 45, 0, 1),
('TOAN2', 'KHMT', N'Đại số tuyến tính', 3, 45, 0, 1),
('XSTK', 'KHMT', N'Xác suất thống kê ứng dụng', 3, 45, 0, 1),
('VLDC', 'MMT', N'Vật lý đại cương cho CNTT', 3, 45, 0, 1),
('NMLT', 'CNTT', N'Nhập môn lập trình', 4, 45, 30, 1),
('KTLT', 'CNTT', N'Kỹ thuật lập trình', 4, 45, 30, 1),
('CTDLGT', 'CNTT', N'Cấu trúc dữ liệu và giải thuật', 4, 45, 30, 1),
('CSDL', 'HTTT', N'Cơ sở dữ liệu', 4, 45, 30, 1),
('HQTCSDL', 'HTTT', N'Hệ quản trị cơ sở dữ liệu', 4, 45, 30, 1),
('KTMT', 'KHMT', N'Kiến trúc máy tính', 3, 45, 0, 1),
('HDH', 'KHMT', N'Hệ điều hành', 3, 30, 30, 1),
('MMT', 'MMT', N'Mạng máy tính cơ bản', 3, 30, 30, 1),
('OOP', 'KTPM', N'Lập trình hướng đối tượng', 4, 45, 30, 1),
('CNPM', 'KTPM', N'Công nghệ phần mềm', 3, 45, 0, 1),
('PTTKHT', 'HTTT', N'Phân tích thiết kế hệ thống thông tin', 3, 45, 0, 1),
('WEB1', 'KTPM', N'Lập trình Web cơ bản', 3, 30, 30, 1),
('WEB2', 'KTPM', N'Phát triển ứng dụng Web nâng cao', 3, 30, 30, 1),
('MOBILE', 'KTPM', N'Lập trình ứng dụng di động', 3, 30, 30, 1),
('TTNT', 'KHMT', N'Trí tuệ nhân tạo', 3, 45, 0, 1),
('HOCMAY', 'KHMT', N'Học máy và ứng dụng', 3, 30, 30, 1),
('ATBM', 'ATTT', N'An toàn và bảo mật thông tin', 3, 45, 0, 1),
('MATMA', 'ATTT', N'Mật mã học cơ sở', 3, 45, 0, 1),
('ATMANG', 'ATTT', N'An ninh mạng máy tính', 3, 30, 30, 1),
('DPT', 'CNTT', N'Công nghệ đa phương tiện', 3, 30, 30, 1),
('CLOUD', 'MMT', N'Điện toán đám mây', 3, 30, 30, 1),
('IOT', 'MMT', N'Internet vạn vật & Ứng dụng', 3, 30, 30, 1),
('KTKD', 'KTPM', N'Kiến trúc phần mềm doanh nghiệp', 3, 45, 0, 1),
('KTPMNC', 'KTPM', N'Kiểm thử phần mềm', 3, 30, 30, 1),
('QLDA', 'KTPM', N'Quản lý dự án phần mềm', 3, 45, 0, 1),
('BIGDATA', 'HTTT', N'Xử lý và phân tích dữ liệu lớn', 3, 30, 30, 1),
('DWBI', 'HTTT', N'Kho dữ liệu & Business Intelligence', 3, 30, 30, 1),
('TMDT', 'HTTT', N'Phát triển hệ thống Thương mại điện tử', 3, 45, 0, 1),
('KHDL', 'KHMT', N'Khai phá dữ liệu', 3, 30, 30, 1),
('XLA', 'KHMT', N'Xử lý ảnh kỹ thuật số', 3, 30, 30, 1),
('NLP', 'KHMT', N'Xử lý ngôn ngữ tự nhiên', 3, 30, 30, 1),
('DEVOPS', 'KTPM', N'Thực hành DevOps & CI/CD', 3, 30, 30, 1),
('FORENSIC', 'ATTT', N'Điều tra số & Khắc phục sự cố', 3, 30, 30, 1),
('ETHICAL', 'ATTT', N'Kiểm thử xâm nhập & Đạo đức bảo mật', 3, 30, 30, 1),
('LINUX', 'MMT', N'Quản trị hệ thống máy chủ Linux', 3, 30, 30, 1),
('ROUTING', 'MMT', N'Định tuyến và chuyển mạch nâng cao', 3, 30, 30, 1),
('BLOCKCHAIN', 'CNTT', N'Công nghệ Chuỗi khối căn bản', 3, 45, 0, 1),
('UIUX', 'KTPM', N'Thiết kế giao diện người dùng UI/UX', 3, 30, 30, 1),
('ERP', 'HTTT', N'Hệ thống hoạch định nguồn lực ERP', 3, 45, 0, 1),
('KTN', 'CNTT', N'Kỹ năng nghề nghiệp & Giao tiếp', 2, 30, 0, 1),
('ANHVAN1', 'CNTT', N'Tiếng Anh chuyên ngành 1', 3, 45, 0, 1),
('ANHVAN2', 'CNTT', N'Tiếng Anh chuyên ngành 2', 3, 45, 0, 1),
('TTNN', 'CNTT', N'Thực tập tốt nghiệp doanh nghiệp', 2, 0, 60, 1),
('DATN1', 'CNTT', N'Đồ án chuyên ngành', 3, 15, 60, 1),
('DATN2', 'CNTT', N'Khóa luận tốt nghiệp', 5, 0, 150, 1);
GO

/* =========================================================
   4. CTDT_MONHOC (160 liên kết môn học - CTĐT)
   ========================================================= */
INSERT INTO dbo.CTDT_MONHOC (MaCTDT, MaMonHoc, HocKyDuKien, LoaiMon, ThuTu)
VALUES
('CTDT_CNTT_CQ', 'TRIET', 1, 'BAT_BUOC', 1),
('CTDT_CNTT_CQ', 'TOAN1', 1, 'BAT_BUOC', 2),
('CTDT_CNTT_CQ', 'TOAN2', 1, 'BAT_BUOC', 3),
('CTDT_CNTT_CQ', 'XSTK', 2, 'BAT_BUOC', 4),
('CTDT_CNTT_CQ', 'VLDC', 2, 'BAT_BUOC', 5),
('CTDT_CNTT_CQ', 'NMLT', 2, 'BAT_BUOC', 6),
('CTDT_CNTT_CQ', 'KTLT', 3, 'BAT_BUOC', 7),
('CTDT_CNTT_CQ', 'CTDLGT', 3, 'BAT_BUOC', 8),
('CTDT_CNTT_CQ', 'CSDL', 3, 'BAT_BUOC', 9),
('CTDT_CNTT_CQ', 'HQTCSDL', 4, 'BAT_BUOC', 10),
('CTDT_CNTT_CQ', 'KTMT', 4, 'BAT_BUOC', 11),
('CTDT_CNTT_CQ', 'HDH', 4, 'BAT_BUOC', 12),
('CTDT_CNTT_CQ', 'MMT', 5, 'BAT_BUOC', 13),
('CTDT_CNTT_CQ', 'OOP', 5, 'BAT_BUOC', 14),
('CTDT_CNTT_CQ', 'CNPM', 5, 'BAT_BUOC', 15),
('CTDT_CNTT_CQ', 'PTTKHT', 6, 'TU_CHON', 16),
('CTDT_CNTT_CQ', 'WEB1', 6, 'TU_CHON', 17),
('CTDT_CNTT_CQ', 'WEB2', 6, 'TU_CHON', 18),
('CTDT_CNTT_CQ', 'MOBILE', 7, 'TU_CHON', 19),
('CTDT_CNTT_CQ', 'TTNT', 7, 'TU_CHON', 20),
('CTDT_CNTT_CLC', 'TRIET', 1, 'BAT_BUOC', 1),
('CTDT_CNTT_CLC', 'TOAN1', 1, 'BAT_BUOC', 2),
('CTDT_CNTT_CLC', 'TOAN2', 1, 'BAT_BUOC', 3),
('CTDT_CNTT_CLC', 'XSTK', 2, 'BAT_BUOC', 4),
('CTDT_CNTT_CLC', 'VLDC', 2, 'BAT_BUOC', 5),
('CTDT_CNTT_CLC', 'NMLT', 2, 'BAT_BUOC', 6),
('CTDT_CNTT_CLC', 'KTLT', 3, 'BAT_BUOC', 7),
('CTDT_CNTT_CLC', 'CTDLGT', 3, 'BAT_BUOC', 8),
('CTDT_CNTT_CLC', 'CSDL', 3, 'BAT_BUOC', 9),
('CTDT_CNTT_CLC', 'HQTCSDL', 4, 'BAT_BUOC', 10),
('CTDT_CNTT_CLC', 'KTMT', 4, 'BAT_BUOC', 11),
('CTDT_CNTT_CLC', 'HDH', 4, 'BAT_BUOC', 12),
('CTDT_CNTT_CLC', 'MMT', 5, 'BAT_BUOC', 13),
('CTDT_CNTT_CLC', 'OOP', 5, 'BAT_BUOC', 14),
('CTDT_CNTT_CLC', 'CNPM', 5, 'BAT_BUOC', 15),
('CTDT_CNTT_CLC', 'PTTKHT', 6, 'TU_CHON', 16),
('CTDT_CNTT_CLC', 'WEB1', 6, 'TU_CHON', 17),
('CTDT_CNTT_CLC', 'WEB2', 6, 'TU_CHON', 18),
('CTDT_CNTT_CLC', 'MOBILE', 7, 'TU_CHON', 19),
('CTDT_CNTT_CLC', 'TTNT', 7, 'TU_CHON', 20),
('CTDT_KTPM_CQ', 'TRIET', 1, 'BAT_BUOC', 1),
('CTDT_KTPM_CQ', 'TOAN1', 1, 'BAT_BUOC', 2),
('CTDT_KTPM_CQ', 'TOAN2', 1, 'BAT_BUOC', 3),
('CTDT_KTPM_CQ', 'XSTK', 2, 'BAT_BUOC', 4),
('CTDT_KTPM_CQ', 'VLDC', 2, 'BAT_BUOC', 5),
('CTDT_KTPM_CQ', 'NMLT', 2, 'BAT_BUOC', 6),
('CTDT_KTPM_CQ', 'KTLT', 3, 'BAT_BUOC', 7),
('CTDT_KTPM_CQ', 'CTDLGT', 3, 'BAT_BUOC', 8),
('CTDT_KTPM_CQ', 'CSDL', 3, 'BAT_BUOC', 9),
('CTDT_KTPM_CQ', 'HQTCSDL', 4, 'BAT_BUOC', 10),
('CTDT_KTPM_CQ', 'KTMT', 4, 'BAT_BUOC', 11),
('CTDT_KTPM_CQ', 'HDH', 4, 'BAT_BUOC', 12),
('CTDT_KTPM_CQ', 'MMT', 5, 'BAT_BUOC', 13),
('CTDT_KTPM_CQ', 'OOP', 5, 'BAT_BUOC', 14),
('CTDT_KTPM_CQ', 'CNPM', 5, 'BAT_BUOC', 15),
('CTDT_KTPM_CQ', 'PTTKHT', 6, 'TU_CHON', 16),
('CTDT_KTPM_CQ', 'WEB1', 6, 'TU_CHON', 17),
('CTDT_KTPM_CQ', 'WEB2', 6, 'TU_CHON', 18),
('CTDT_KTPM_CQ', 'MOBILE', 7, 'TU_CHON', 19),
('CTDT_KTPM_CQ', 'TTNT', 7, 'TU_CHON', 20),
('CTDT_HTTT_CQ', 'TRIET', 1, 'BAT_BUOC', 1),
('CTDT_HTTT_CQ', 'TOAN1', 1, 'BAT_BUOC', 2),
('CTDT_HTTT_CQ', 'TOAN2', 1, 'BAT_BUOC', 3),
('CTDT_HTTT_CQ', 'XSTK', 2, 'BAT_BUOC', 4),
('CTDT_HTTT_CQ', 'VLDC', 2, 'BAT_BUOC', 5),
('CTDT_HTTT_CQ', 'NMLT', 2, 'BAT_BUOC', 6),
('CTDT_HTTT_CQ', 'KTLT', 3, 'BAT_BUOC', 7),
('CTDT_HTTT_CQ', 'CTDLGT', 3, 'BAT_BUOC', 8),
('CTDT_HTTT_CQ', 'CSDL', 3, 'BAT_BUOC', 9),
('CTDT_HTTT_CQ', 'HQTCSDL', 4, 'BAT_BUOC', 10),
('CTDT_HTTT_CQ', 'KTMT', 4, 'BAT_BUOC', 11),
('CTDT_HTTT_CQ', 'HDH', 4, 'BAT_BUOC', 12),
('CTDT_HTTT_CQ', 'MMT', 5, 'BAT_BUOC', 13),
('CTDT_HTTT_CQ', 'OOP', 5, 'BAT_BUOC', 14),
('CTDT_HTTT_CQ', 'CNPM', 5, 'BAT_BUOC', 15),
('CTDT_HTTT_CQ', 'PTTKHT', 6, 'TU_CHON', 16),
('CTDT_HTTT_CQ', 'WEB1', 6, 'TU_CHON', 17),
('CTDT_HTTT_CQ', 'WEB2', 6, 'TU_CHON', 18),
('CTDT_HTTT_CQ', 'MOBILE', 7, 'TU_CHON', 19),
('CTDT_HTTT_CQ', 'TTNT', 7, 'TU_CHON', 20),
('CTDT_KHMT_CQ', 'TRIET', 1, 'BAT_BUOC', 1),
('CTDT_KHMT_CQ', 'TOAN1', 1, 'BAT_BUOC', 2),
('CTDT_KHMT_CQ', 'TOAN2', 1, 'BAT_BUOC', 3),
('CTDT_KHMT_CQ', 'XSTK', 2, 'BAT_BUOC', 4),
('CTDT_KHMT_CQ', 'VLDC', 2, 'BAT_BUOC', 5),
('CTDT_KHMT_CQ', 'NMLT', 2, 'BAT_BUOC', 6),
('CTDT_KHMT_CQ', 'KTLT', 3, 'BAT_BUOC', 7),
('CTDT_KHMT_CQ', 'CTDLGT', 3, 'BAT_BUOC', 8),
('CTDT_KHMT_CQ', 'CSDL', 3, 'BAT_BUOC', 9),
('CTDT_KHMT_CQ', 'HQTCSDL', 4, 'BAT_BUOC', 10),
('CTDT_KHMT_CQ', 'KTMT', 4, 'BAT_BUOC', 11),
('CTDT_KHMT_CQ', 'HDH', 4, 'BAT_BUOC', 12),
('CTDT_KHMT_CQ', 'MMT', 5, 'BAT_BUOC', 13),
('CTDT_KHMT_CQ', 'OOP', 5, 'BAT_BUOC', 14),
('CTDT_KHMT_CQ', 'CNPM', 5, 'BAT_BUOC', 15),
('CTDT_KHMT_CQ', 'PTTKHT', 6, 'TU_CHON', 16),
('CTDT_KHMT_CQ', 'WEB1', 6, 'TU_CHON', 17),
('CTDT_KHMT_CQ', 'WEB2', 6, 'TU_CHON', 18),
('CTDT_KHMT_CQ', 'MOBILE', 7, 'TU_CHON', 19),
('CTDT_KHMT_CQ', 'TTNT', 7, 'TU_CHON', 20),
('CTDT_MMT_CQ', 'TRIET', 1, 'BAT_BUOC', 1),
('CTDT_MMT_CQ', 'TOAN1', 1, 'BAT_BUOC', 2),
('CTDT_MMT_CQ', 'TOAN2', 1, 'BAT_BUOC', 3),
('CTDT_MMT_CQ', 'XSTK', 2, 'BAT_BUOC', 4),
('CTDT_MMT_CQ', 'VLDC', 2, 'BAT_BUOC', 5),
('CTDT_MMT_CQ', 'NMLT', 2, 'BAT_BUOC', 6),
('CTDT_MMT_CQ', 'KTLT', 3, 'BAT_BUOC', 7),
('CTDT_MMT_CQ', 'CTDLGT', 3, 'BAT_BUOC', 8),
('CTDT_MMT_CQ', 'CSDL', 3, 'BAT_BUOC', 9),
('CTDT_MMT_CQ', 'HQTCSDL', 4, 'BAT_BUOC', 10),
('CTDT_MMT_CQ', 'KTMT', 4, 'BAT_BUOC', 11),
('CTDT_MMT_CQ', 'HDH', 4, 'BAT_BUOC', 12),
('CTDT_MMT_CQ', 'MMT', 5, 'BAT_BUOC', 13),
('CTDT_MMT_CQ', 'OOP', 5, 'BAT_BUOC', 14),
('CTDT_MMT_CQ', 'CNPM', 5, 'BAT_BUOC', 15),
('CTDT_MMT_CQ', 'PTTKHT', 6, 'TU_CHON', 16),
('CTDT_MMT_CQ', 'WEB1', 6, 'TU_CHON', 17),
('CTDT_MMT_CQ', 'WEB2', 6, 'TU_CHON', 18),
('CTDT_MMT_CQ', 'MOBILE', 7, 'TU_CHON', 19),
('CTDT_MMT_CQ', 'TTNT', 7, 'TU_CHON', 20),
('CTDT_ATTT_CQ', 'TRIET', 1, 'BAT_BUOC', 1),
('CTDT_ATTT_CQ', 'TOAN1', 1, 'BAT_BUOC', 2),
('CTDT_ATTT_CQ', 'TOAN2', 1, 'BAT_BUOC', 3),
('CTDT_ATTT_CQ', 'XSTK', 2, 'BAT_BUOC', 4),
('CTDT_ATTT_CQ', 'VLDC', 2, 'BAT_BUOC', 5),
('CTDT_ATTT_CQ', 'NMLT', 2, 'BAT_BUOC', 6),
('CTDT_ATTT_CQ', 'KTLT', 3, 'BAT_BUOC', 7),
('CTDT_ATTT_CQ', 'CTDLGT', 3, 'BAT_BUOC', 8),
('CTDT_ATTT_CQ', 'CSDL', 3, 'BAT_BUOC', 9),
('CTDT_ATTT_CQ', 'HQTCSDL', 4, 'BAT_BUOC', 10),
('CTDT_ATTT_CQ', 'KTMT', 4, 'BAT_BUOC', 11),
('CTDT_ATTT_CQ', 'HDH', 4, 'BAT_BUOC', 12),
('CTDT_ATTT_CQ', 'MMT', 5, 'BAT_BUOC', 13),
('CTDT_ATTT_CQ', 'OOP', 5, 'BAT_BUOC', 14),
('CTDT_ATTT_CQ', 'CNPM', 5, 'BAT_BUOC', 15),
('CTDT_ATTT_CQ', 'PTTKHT', 6, 'TU_CHON', 16),
('CTDT_ATTT_CQ', 'WEB1', 6, 'TU_CHON', 17),
('CTDT_ATTT_CQ', 'WEB2', 6, 'TU_CHON', 18),
('CTDT_ATTT_CQ', 'MOBILE', 7, 'TU_CHON', 19),
('CTDT_ATTT_CQ', 'TTNT', 7, 'TU_CHON', 20),
('CTDT_TMDT_CQ', 'TRIET', 1, 'BAT_BUOC', 1),
('CTDT_TMDT_CQ', 'TOAN1', 1, 'BAT_BUOC', 2),
('CTDT_TMDT_CQ', 'TOAN2', 1, 'BAT_BUOC', 3),
('CTDT_TMDT_CQ', 'XSTK', 2, 'BAT_BUOC', 4),
('CTDT_TMDT_CQ', 'VLDC', 2, 'BAT_BUOC', 5),
('CTDT_TMDT_CQ', 'NMLT', 2, 'BAT_BUOC', 6),
('CTDT_TMDT_CQ', 'KTLT', 3, 'BAT_BUOC', 7),
('CTDT_TMDT_CQ', 'CTDLGT', 3, 'BAT_BUOC', 8),
('CTDT_TMDT_CQ', 'CSDL', 3, 'BAT_BUOC', 9),
('CTDT_TMDT_CQ', 'HQTCSDL', 4, 'BAT_BUOC', 10),
('CTDT_TMDT_CQ', 'KTMT', 4, 'BAT_BUOC', 11),
('CTDT_TMDT_CQ', 'HDH', 4, 'BAT_BUOC', 12),
('CTDT_TMDT_CQ', 'MMT', 5, 'BAT_BUOC', 13),
('CTDT_TMDT_CQ', 'OOP', 5, 'BAT_BUOC', 14),
('CTDT_TMDT_CQ', 'CNPM', 5, 'BAT_BUOC', 15),
('CTDT_TMDT_CQ', 'PTTKHT', 6, 'TU_CHON', 16),
('CTDT_TMDT_CQ', 'WEB1', 6, 'TU_CHON', 17),
('CTDT_TMDT_CQ', 'WEB2', 6, 'TU_CHON', 18),
('CTDT_TMDT_CQ', 'MOBILE', 7, 'TU_CHON', 19),
('CTDT_TMDT_CQ', 'TTNT', 7, 'TU_CHON', 20);
GO

INSERT INTO dbo.CTDT_MONHOC (MaCTDT, MaMonHoc, HocKyDuKien, LoaiMon, ThuTu)
SELECT CONCAT(ctm.MaCTDT, '_', RIGHT(CONVERT(VARCHAR(4), cohort.NamTuyenSinh), 2)),
       ctm.MaMonHoc, ctm.HocKyDuKien, ctm.LoaiMon, ctm.ThuTu
FROM dbo.CTDT_MONHOC ctm
CROSS JOIN (VALUES (2024), (2025)) cohort(NamTuyenSinh);
GO

/* =========================================================
   5. MONHOCTIENQUYET (36 quan hệ chuẩn, không chu trình)
   ========================================================= */
INSERT INTO dbo.MONHOCTIENQUYET (MaMonHoc, MaMonTienQuyet, MucDo)
VALUES
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
('DATN2', 'DATN1', 'BAT_BUOC');
GO

/* =========================================================
   6. HOCKY (7 Học kỳ từ 2023 đến 2027)
   ========================================================= */
INSERT INTO dbo.HOCKY (NamHoc, TenHocKy, NgayBatDau, NgayKetThuc, NgayMoDangKy, NgayDongDangKy, TrangThai)
VALUES
('2023-2024', N'Học kỳ 1', '2023-09-01', '2024-01-31', '2023-08-15 00:00:00', '2023-08-25 23:59:59', 'KET_THUC'),
('2023-2024', N'Học kỳ 2', '2024-02-15', '2024-06-30', '2024-01-20 00:00:00', '2024-01-30 23:59:59', 'KET_THUC'),
('2024-2025', N'Học kỳ 1', '2024-09-01', '2025-01-31', '2024-08-15 00:00:00', '2024-08-25 23:59:59', 'KET_THUC'),
('2024-2025', N'Học kỳ 2', '2025-02-15', '2025-06-30', '2025-01-20 00:00:00', '2025-01-30 23:59:59', 'KET_THUC'),
('2025-2026', N'Học kỳ 1', '2025-09-01', '2026-01-31', '2025-08-15 00:00:00', '2025-08-25 23:59:59', 'KET_THUC'),
('2025-2026', N'Học kỳ 2', '2026-02-15', '2026-06-30', '2026-01-20 00:00:00', '2026-01-30 23:59:59', 'KET_THUC'),
('2026-2027', N'Học kỳ 1', '2026-09-01', '2027-01-31', '2026-08-15 00:00:00', '2027-01-31 23:59:59', 'DANG_MO');
GO

/* =========================================================
   7. MUCHOCPHI (7 Mức học phí theo từng học kỳ)
   ========================================================= */

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

/* =========================================================
   8. GIANGVIEN (25 Giảng viên)
   ========================================================= */
INSERT INTO dbo.GIANGVIEN (MaGiangVien, HoTen, Email, SoDienThoai, MaKhoa, TrangThai, NgayTao)
VALUES
('GV0001', N'Nguyễn Văn An', 'an.nguyen@university.edu.vn', '0901234001', 'CNTT', 'DANG_CONG_TAC', '2023-01-15 08:00:00'),
('GV0002', N'Trần Thị Bích', 'bich.tran@university.edu.vn', '0901234002', 'CNTT', 'DANG_CONG_TAC', '2023-01-15 08:00:00'),
('GV0003', N'Lê Hoàng Cường', 'cuong.le@university.edu.vn', '0901234003', 'CNTT', 'DANG_CONG_TAC', '2023-01-15 08:00:00'),
('GV0004', N'Phạm Minh Dũng', 'dung.pham@university.edu.vn', '0901234004', 'CNTT', 'DANG_CONG_TAC', '2023-01-15 08:00:00'),
('GV0005', N'Hoàng Thanh Giang', 'giang.hoang@university.edu.vn', '0901234005', 'KTPM', 'DANG_CONG_TAC', '2023-01-15 08:00:00'),
('GV0006', N'Vũ Hải Đăng', 'dang.vu@university.edu.vn', '0901234006', 'KTPM', 'DANG_CONG_TAC', '2023-01-15 08:00:00'),
('GV0007', N'Đặng Quốc Hùng', 'hung.dang@university.edu.vn', '0901234007', 'KTPM', 'DANG_CONG_TAC', '2023-01-15 08:00:00'),
('GV0008', N'Bùi Anh Khoa', 'khoa.bui@university.edu.vn', '0901234008', 'KTPM', 'DANG_CONG_TAC', '2023-01-15 08:00:00'),
('GV0009', N'Đỗ Phương Linh', 'linh.do@university.edu.vn', '0901234009', 'HTTT', 'DANG_CONG_TAC', '2023-01-15 08:00:00'),
('GV0010', N'Hồ Bảo Long', 'long.ho@university.edu.vn', '0901234010', 'HTTT', 'DANG_CONG_TAC', '2023-01-15 08:00:00'),
('GV0011', N'Ngô Quang Minh', 'minh.ngo@university.edu.vn', '0901234011', 'HTTT', 'DANG_CONG_TAC', '2023-01-15 08:00:00'),
('GV0012', N'Dương Hoài Nam', 'nam.duong@university.edu.vn', '0901234012', 'HTTT', 'DANG_CONG_TAC', '2023-01-15 08:00:00'),
('GV0013', N'Lý Vĩnh Phúc', 'phuc.ly@university.edu.vn', '0901234013', 'KHMT', 'DANG_CONG_TAC', '2023-01-15 08:00:00'),
('GV0014', N'Mai Hồng Quân', 'quan.mai@university.edu.vn', '0901234014', 'KHMT', 'DANG_CONG_TAC', '2023-01-15 08:00:00'),
('GV0015', N'Trịnh Thế Sơn', 'son.trinh@university.edu.vn', '0901234015', 'KHMT', 'DANG_CONG_TAC', '2023-01-15 08:00:00'),
('GV0016', N'Đinh Hữu Tâm', 'tam.dinh@university.edu.vn', '0901234016', 'KHMT', 'DANG_CONG_TAC', '2023-01-15 08:00:00'),
('GV0017', N'Phan Chiến Thắng', 'thang.phan@university.edu.vn', '0901234017', 'MMT', 'DANG_CONG_TAC', '2023-01-15 08:00:00'),
('GV0018', N'Võ Đức Toàn', 'toan.vo@university.edu.vn', '0901234018', 'MMT', 'DANG_CONG_TAC', '2023-01-15 08:00:00'),
('GV0019', N'Cao Thành Trung', 'trung.cao@university.edu.vn', '0901234019', 'MMT', 'DANG_CONG_TAC', '2023-01-15 08:00:00'),
('GV0020', N'Lâm Minh Tú', 'tu.lam@university.edu.vn', '0901234020', 'MMT', 'DANG_CONG_TAC', '2023-01-15 08:00:00'),
('GV0021', N'Hà Anh Tuấn', 'tuan.ha@university.edu.vn', '0901234021', 'ATTT', 'DANG_CONG_TAC', '2023-01-15 08:00:00'),
('GV0022', N'Tạ Quốc Việt', 'viet.ta@university.edu.vn', '0901234022', 'ATTT', 'DANG_CONG_TAC', '2023-01-15 08:00:00'),
('GV0023', N'Lương Thảo Vy', 'vy.luong@university.edu.vn', '0901234023', 'ATTT', 'DANG_CONG_TAC', '2023-01-15 08:00:00'),
('GV0024', N'Phùng Khắc Huy', 'huy.phung@university.edu.vn', '0901234024', 'ATTT', 'DANG_CONG_TAC', '2023-01-15 08:00:00'),
('GV0025', N'Trương Mỹ Duyên', 'duyen.truong@university.edu.vn', '0901234025', 'CNTT', 'DANG_CONG_TAC', '2023-01-15 08:00:00');
GO

/* =========================================================
   8.1. LOP (36 Lớp sinh hoạt: 6 khoa x 3 khóa x 2 lớp)
   ========================================================= */
INSERT INTO dbo.LOP (MaLop, TenLop, MaKhoa, KhoaHoc, NamNhapHoc, TrangThai)
VALUES
('CNTT23_01', N'Công nghệ Thông tin 2023 - Lớp 01', 'CNTT', '2023-2027', 2023, 1),
('CNTT23_02', N'Công nghệ Thông tin 2023 - Lớp 02', 'CNTT', '2023-2027', 2023, 1),
('CNTT24_01', N'Công nghệ Thông tin 2024 - Lớp 01', 'CNTT', '2024-2028', 2024, 1),
('CNTT24_02', N'Công nghệ Thông tin 2024 - Lớp 02', 'CNTT', '2024-2028', 2024, 1),
('CNTT25_01', N'Công nghệ Thông tin 2025 - Lớp 01', 'CNTT', '2025-2029', 2025, 1),
('CNTT25_02', N'Công nghệ Thông tin 2025 - Lớp 02', 'CNTT', '2025-2029', 2025, 1),

('KTPM23_01', N'Kỹ thuật Phần mềm 2023 - Lớp 01', 'KTPM', '2023-2027', 2023, 1),
('KTPM23_02', N'Kỹ thuật Phần mềm 2023 - Lớp 02', 'KTPM', '2023-2027', 2023, 1),
('KTPM24_01', N'Kỹ thuật Phần mềm 2024 - Lớp 01', 'KTPM', '2024-2028', 2024, 1),
('KTPM24_02', N'Kỹ thuật Phần mềm 2024 - Lớp 02', 'KTPM', '2024-2028', 2024, 1),
('KTPM25_01', N'Kỹ thuật Phần mềm 2025 - Lớp 01', 'KTPM', '2025-2029', 2025, 1),
('KTPM25_02', N'Kỹ thuật Phần mềm 2025 - Lớp 02', 'KTPM', '2025-2029', 2025, 1),

('HTTT23_01', N'Hệ thống Thông tin 2023 - Lớp 01', 'HTTT', '2023-2027', 2023, 1),
('HTTT23_02', N'Hệ thống Thông tin 2023 - Lớp 02', 'HTTT', '2023-2027', 2023, 1),
('HTTT24_01', N'Hệ thống Thông tin 2024 - Lớp 01', 'HTTT', '2024-2028', 2024, 1),
('HTTT24_02', N'Hệ thống Thông tin 2024 - Lớp 02', 'HTTT', '2024-2028', 2024, 1),
('HTTT25_01', N'Hệ thống Thông tin 2025 - Lớp 01', 'HTTT', '2025-2029', 2025, 1),
('HTTT25_02', N'Hệ thống Thông tin 2025 - Lớp 02', 'HTTT', '2025-2029', 2025, 1),

('KHMT23_01', N'Khoa học Máy tính 2023 - Lớp 01', 'KHMT', '2023-2027', 2023, 1),
('KHMT23_02', N'Khoa học Máy tính 2023 - Lớp 02', 'KHMT', '2023-2027', 2023, 1),
('KHMT24_01', N'Khoa học Máy tính 2024 - Lớp 01', 'KHMT', '2024-2028', 2024, 1),
('KHMT24_02', N'Khoa học Máy tính 2024 - Lớp 02', 'KHMT', '2024-2028', 2024, 1),
('KHMT25_01', N'Khoa học Máy tính 2025 - Lớp 01', 'KHMT', '2025-2029', 2025, 1),
('KHMT25_02', N'Khoa học Máy tính 2025 - Lớp 02', 'KHMT', '2025-2029', 2025, 1),

('MMT23_01', N'Mạng máy tính & Truyền thông 2023 - Lớp 01', 'MMT', '2023-2027', 2023, 1),
('MMT23_02', N'Mạng máy tính & Truyền thông 2023 - Lớp 02', 'MMT', '2023-2027', 2023, 1),
('MMT24_01', N'Mạng máy tính & Truyền thông 2024 - Lớp 01', 'MMT', '2024-2028', 2024, 1),
('MMT24_02', N'Mạng máy tính & Truyền thông 2024 - Lớp 02', 'MMT', '2024-2028', 2024, 1),
('MMT25_01', N'Mạng máy tính & Truyền thông 2025 - Lớp 01', 'MMT', '2025-2029', 2025, 1),
('MMT25_02', N'Mạng máy tính & Truyền thông 2025 - Lớp 02', 'MMT', '2025-2029', 2025, 1),

('ATTT23_01', N'An toàn Thông tin 2023 - Lớp 01', 'ATTT', '2023-2027', 2023, 1),
('ATTT23_02', N'An toàn Thông tin 2023 - Lớp 02', 'ATTT', '2023-2027', 2023, 1),
('ATTT24_01', N'An toàn Thông tin 2024 - Lớp 01', 'ATTT', '2024-2028', 2024, 1),
('ATTT24_02', N'An toàn Thông tin 2024 - Lớp 02', 'ATTT', '2024-2028', 2024, 1),
('ATTT25_01', N'An toàn Thông tin 2025 - Lớp 01', 'ATTT', '2025-2029', 2025, 1),
('ATTT25_02', N'An toàn Thông tin 2025 - Lớp 02', 'ATTT', '2025-2029', 2025, 1);
GO

/* =========================================================
   9. SINHVIEN (1.500 Sinh viên thực tế: Khóa 23, 24, 25)
   ========================================================= */

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
        END AS TrangThai,
        CASE WHEN NTILE(2) OVER (PARTITION BY k.MaKhoa, CASE WHEN n <= 500 THEN '23' WHEN n <= 1000 THEN '24' ELSE '25' END ORDER BY n) = 1 THEN '01' ELSE '02' END AS LopNhom,
        CASE WHEN k.MaKhoa = 'CNTT' AND NTILE(2) OVER (PARTITION BY k.MaKhoa, CASE WHEN n <= 500 THEN '23' WHEN n <= 1000 THEN '24' ELSE '25' END ORDER BY n) = 2 THEN 'CTDT_CNTT_CLC'
             WHEN k.MaKhoa = 'CNTT' THEN 'CTDT_CNTT_CQ'
             WHEN k.MaKhoa = 'KTPM' THEN 'CTDT_KTPM_CQ'
             WHEN k.MaKhoa = 'HTTT' AND NTILE(2) OVER (PARTITION BY k.MaKhoa, CASE WHEN n <= 500 THEN '23' WHEN n <= 1000 THEN '24' ELSE '25' END ORDER BY n) = 2 THEN 'CTDT_TMDT_CQ'
             WHEN k.MaKhoa = 'HTTT' THEN 'CTDT_HTTT_CQ'
             WHEN k.MaKhoa = 'KHMT' THEN 'CTDT_KHMT_CQ'
             WHEN k.MaKhoa = 'MMT' THEN 'CTDT_MMT_CQ' ELSE 'CTDT_ATTT_CQ' END AS MaCTDTGoc
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
    'sv' + KhoaTuyen + SttStr + '@student.edu.vn' AS Email,
    '098' + RIGHT('0000000' + CAST(n AS VARCHAR), 7) AS SoDienThoai,
    MaKhoa,
    MaKhoa + KhoaTuyen + '_' + LopNhom,
    CASE WHEN KhoaTuyen = '23' THEN MaCTDTGoc ELSE MaCTDTGoc + '_' + KhoaTuyen END,
    TrangThai,
    NgayTao
FROM RawSV;
GO

/* =========================================================
   10. TAIKHOAN (Admin, Dao tao, Giang vien, Sinh vien)
   ========================================================= */

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

/* Seed/bảo trì không giả lập người dùng đã xác thực trong audit log. */
EXEC sys.sp_set_session_context @key = N'MaTaiKhoan', @value = NULL;
GO

/* =========================================================
   11. LOPHOCPHAN (588 Lớp học phần: 7 học kỳ x 84 lớp)
   ========================================================= */

;WITH
SemesterOrdered AS (
    SELECT MaHocKy,
           ROW_NUMBER() OVER(ORDER BY NgayBatDau) AS SemesterSeq,
           CAST('DA_KHOA' AS VARCHAR(20)) AS TrangThaiLHP
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

/* =========================================================
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

UPDATE lhp
SET TrangThai = 'MO_DANG_KY'
FROM dbo.LOPHOCPHAN lhp
INNER JOIN dbo.HOCKY hk ON hk.MaHocKy = lhp.MaHocKy
WHERE hk.TrangThai = 'DANG_MO';
GO

/* =========================================================
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

/* =========================================================
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

/* =========================================================
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

/* =========================================================
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
    CASE WHEN hp.MaHocPhi % 2 = 0 THEN 'CHUYEN_KHOAN' ELSE 'TIEN_MAT' END AS PhuongThuc,
    'DA_XAC_NHAN' AS TrangThai
FROM dbo.HOCPHI hp
INNER JOIN dbo.HOCKY hk ON hk.MaHocKy = hp.MaHocKy
WHERE (hp.MaHocPhi % 10) <> 9; -- 10% chua dong gi

-- Dot 2: Nop them 25% cho mot nua so ho so dang tra gop
INSERT INTO dbo.CHITIETTHANHTOAN (MaHocPhi, SoTien, NgayThanhToan, PhuongThuc, TrangThai)
SELECT
    hp.MaHocPhi,
    CAST(hp.TongTien * 0.25 AS DECIMAL(14,2)) AS SoTien,
    DATEADD(DAY, 28 + (hp.MaHocPhi % 10), hk.NgayMoDangKy) AS NgayThanhToan,
    'CHUYEN_KHOAN' AS PhuongThuc,
    'DA_XAC_NHAN' AS TrangThai
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

/* =========================================================
   17. SEED AUDIT LOG LỊCH SỬ (LOGHOATDONG: >100.000 records)
   ========================================================= */

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

/* =========================================================
   18. TỔNG KẾT DỮ LIỆU SEED TRONG HỆ THỐNG
   ========================================================= */

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
