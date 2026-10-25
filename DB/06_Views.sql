-- ENCODING: UTF-8 WITH BOM
USE [DBMS330284];
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
-- Phụ trách: Lương Viết Vĩ Đông
CREATE OR ALTER VIEW [dbo].[V_CauTrucChuongTrinhDaoTao]
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
    ON mh.MaMonHoc = ctm.MaMonHoc;
GO
-- Phụ trách: Lê Trung Đông
CREATE OR ALTER VIEW [dbo].[V_TaiKhoanNguoiDung]
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
    ON gv.MaGV = tk.MaGV;
GO
-- Phụ trách: Trần Biểu Hương
CREATE OR ALTER VIEW [dbo].[V_ThoiKhoaBieuSinhVien]
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
    AND dk.TrangThai = 'REGISTERED'
INNER JOIN dbo.LOPHOCPHAN lhp
    ON lhp.MaLHP = dk.MaLHP
INNER JOIN dbo.HOCKY hk
    ON hk.MaHocKy = lhp.MaHocKy
INNER JOIN dbo.MONHOC mh
    ON mh.MaMonHoc = lhp.MaMonHoc
LEFT JOIN dbo.GIANGVIEN gv
    ON gv.MaGV = lhp.MaGiangVien
INNER JOIN dbo.LICHHOC lh
    ON lh.MaLHP = lhp.MaLHP;
GO
-- Phụ trách: Trần Biểu Hương
CREATE OR ALTER VIEW [dbo].[V_BangDiemChiTiet]
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
            + ds.DiemCuoiKy * ds.TyTrongCK / 100.0 >= 8.5 THEN 'A'
        WHEN ds.DiemQuaTrinh * ds.TyTrongQT / 100.0
            + ds.DiemGiuaKy * ds.TyTrongGK / 100.0
            + ds.DiemCuoiKy * ds.TyTrongCK / 100.0 >= 8.0 THEN 'B+'
        WHEN ds.DiemQuaTrinh * ds.TyTrongQT / 100.0
            + ds.DiemGiuaKy * ds.TyTrongGK / 100.0
            + ds.DiemCuoiKy * ds.TyTrongCK / 100.0 >= 7.0 THEN 'B'
        WHEN ds.DiemQuaTrinh * ds.TyTrongQT / 100.0
            + ds.DiemGiuaKy * ds.TyTrongGK / 100.0
            + ds.DiemCuoiKy * ds.TyTrongCK / 100.0 >= 6.5 THEN 'C+'
        WHEN ds.DiemQuaTrinh * ds.TyTrongQT / 100.0
            + ds.DiemGiuaKy * ds.TyTrongGK / 100.0
            + ds.DiemCuoiKy * ds.TyTrongCK / 100.0 >= 5.5 THEN 'C'
        WHEN ds.DiemQuaTrinh * ds.TyTrongQT / 100.0
            + ds.DiemGiuaKy * ds.TyTrongGK / 100.0
            + ds.DiemCuoiKy * ds.TyTrongCK / 100.0 >= 5.0 THEN 'D'
        ELSE 'F'
    END AS DiemChu,
    CASE
        WHEN ds.DiemCuoiKy IS NULL THEN N'ĐANG HỌC'
        WHEN ds.DiemQuaTrinh * ds.TyTrongQT / 100.0
            + ds.DiemGiuaKy * ds.TyTrongGK / 100.0
            + ds.DiemCuoiKy * ds.TyTrongCK / 100.0 >= 5.0
        THEN N'ĐẠT'
        ELSE N'KHÔNG ĐẠT'
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
WHERE dk.TrangThai = 'REGISTERED';
GO
-- Phụ trách: Âu Quốc Khánh
CREATE OR ALTER VIEW [dbo].[V_HocPhiSinhVien]
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
    ON hk.MaHocKy = hp.MaHocKy;
GO

-- 6. View danh sách lớp sinh hoạt kèm sĩ số thực tế
-- Phụ trách: Lê Trung Đông
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
    l.TrangThai;
GO