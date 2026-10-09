# FINAL DATABASE DESIGN – SCHEMA V1 (19 BẢNG)
> **Dự án DBMS330284 – Hệ thống Quản lý Học vụ & Đăng ký Tín chỉ Đại học**  
> **Phiên bản:** 1.2.0 | **Ngày cập nhật:** 09/10/2026  
> **Cơ sở dữ liệu:** Microsoft SQL Server 2022 | **Quy chuẩn chuẩn hóa:** Tối thiểu 3NF  

---

## TỔNG QUAN SCHEMA V1 (19 BẢNG)
Hệ thống CSDL **`DBMS330284`** được thiết kế toàn diện, đồng bộ và hoàn thiện gồm **19 bảng**, **6 Views**, **7 Functions**, **7 Stored Procedures**, **13 Triggers**, 4 Security Roles và hệ thống **19 Indexes** tối ưu, quản lý trên 210.000 dòng dữ liệu thực tế.

Schema bao gồm việc chuẩn hóa tách thực thể **`NGANH`** độc lập khỏi `CHUONGTRINHDAOTAO` (quan hệ `KHOA` 1:N `NGANH` 1:N `CHUONGTRINHDAOTAO`), bổ sung **`LOP`** phục vụ quản lý sinh viên theo lớp sinh hoạt / lớp niên chế và **`CHITIETTHANHTOAN`** phục vụ nghiệp vụ thanh toán học phí nhiều đợt.

---

## 1. QUY ƯỚC TÍCH HỢP ĐỒNG BỘ LIÊN MODULE

### 1.1. Khóa liên module (Cross-Module Keys)
- `KHOA.MaKhoa`: `VARCHAR(10)` (PK); `NGANH.MaKhoa`, `LOP.MaKhoa`, `SINHVIEN.MaKhoa`, `GIANGVIEN.MaKhoa`, `MONHOC.MaKhoa` đều dùng `VARCHAR(10)` (FK).
- `LOP.MaLop`: `VARCHAR(20)` (PK); `SINHVIEN.MaLop` dùng `VARCHAR(20)` (FK).
- `NGANH.MaNganh`: `VARCHAR(10)` (PK); `CHUONGTRINHDAOTAO.MaNganh` dùng `VARCHAR(10)` (FK).
- `SINHVIEN.MaSV`: `INT IDENTITY(1,1)` (PK kỹ thuật); `MaSinhVien` `VARCHAR(20)` là mã nghiệp vụ `UNIQUE`.
- `GIANGVIEN.MaGV`: `INT IDENTITY(1,1)` (PK kỹ thuật); `MaGiangVien` `VARCHAR(20)` là mã nghiệp vụ `UNIQUE`.
- `HOCKY.MaHocKy`: `INT IDENTITY(1,1)` (PK); toàn hệ thống dùng `MaHocKy`, không dùng `MaHK`.
- `TAIKHOAN.MaTaiKhoan`: `INT IDENTITY(1,1)` (PK).

### 1.2. Dữ liệu dẫn xuất và Snapshot (Derived & Snapshot Data)
- **Không lưu sĩ số tĩnh:** Tuyệt đối không lưu cột vật lý `SoLuongHienTai` trong `LOPHOCPHAN`; sĩ số thực tế được tính toán động từ `DANGKYTINCHI WHERE TrangThai = 'REGISTERED'`. Sĩ số của `LOP` sinh hoạt tính động từ `SINHVIEN WHERE TrangThai = 'DANG_HOC'`.
- **Không lưu điểm dẫn xuất tĩnh:** Không lưu vật lý `DiemTongKet`, `DiemChu`, `DiemHe4` trong `DIEMSO`; tính toán động thông qua View `V_BangDiemChiTiet` và Function `FN_TinhDiemTongKet`.
- **Snapshot học phí:** `HOCPHI` lưu snapshot `DonGiaTinChi` và `TongTien` tại thời điểm sinh viên tính học phí.
- **Cache thanh toán:** `HOCPHI.SoTienDaThanhToan` là trường cache; nguồn sự thật là bảng `CHITIETTHANHTOAN` và được đồng bộ tự động qua Trigger `TR_CHITIETTHANHTOAN_CapNhatHocPhi`.

### 1.3. Quy tắc cốt lõi đã chốt
- Mỗi học kỳ có một đợt đăng ký tín chỉ xác định bởi `NgayMoDangKy` và `NgayDongDangKy` trong bảng `HOCKY`.
- 4 Vai trò bảo mật (`VaiTro`): `SINH_VIEN`, `GIANG_VIEN`, `DAO_TAO`, `QUAN_TRI`.
- `Email` cho phép `NULL` nhưng duy nhất riêng biệt trong từng bảng `SINHVIEN`, `GIANGVIEN` thông qua Filtered Unique Index.
- `LOGHOATDONG` lưu JSON các cột dữ liệu thay đổi (`INSERT`, `UPDATE`, `DELETE`); tuyệt đối không ghi `PasswordHash`.
- Dữ liệu lịch sử ưu tiên không xóa dây chuyền (`CASCADE`); sử dụng cờ trạng thái nghiệp vụ và FK `NO ACTION`.

---

## 2. DANH SÁCH 19 BẢNG SCHEMA V1 (PHÂN THEO KHỐI CHỨC NĂNG)

### Khối A – Đào tạo & Chương trình học (6 bảng)
1. **`KHOA`**: Đơn vị quản lý học thuật cấp khoa.
2. **`NGANH`**: Ngành đào tạo trực thuộc khoa (chuẩn hóa 3NF tách từ CTĐT).
3. **`CHUONGTRINHDAOTAO`**: Chương trình đào tạo chuyên ngành theo khóa học.
4. **`MONHOC`**: Danh mục môn học thuộc quản lý của khoa.
5. **`CTDT_MONHOC`**: Khung chương trình đào tạo (bảng nối N:N giữa CTĐT và Môn học).
6. **`MONHOCTIENQUYET`**: Cây điều kiện môn tiên quyết / khuyến nghị (quan hệ đệ quy Môn học).

### Khối B – Người dùng, Lớp sinh hoạt & Học kỳ (5 bảng)
7. **`LOP`**: Lớp sinh hoạt / lớp niên chế của sinh viên (36 lớp toàn trường).
8. **`SINHVIEN`**: Hồ sơ lý lịch sinh viên (thuộc Khoa và Lớp sinh hoạt).
9. **`GIANGVIEN`**: Hồ sơ cán bộ giảng viên.
10. **`TAIKHOAN`**: Tài khoản người dùng, mật khẩu băm SHA-256 và vai trò phân quyền.
11. **`HOCKY`**: Danh mục năm học - học kỳ và thời gian mở/đóng cổng đăng ký tín chỉ.

### Khối C – Lớp học phần & Đăng ký học vụ (4 bảng)
11. **`LOPHOCPHAN`**: Lớp học phần mở trong từng học kỳ.
12. **`LICHHOC`**: Thời khóa biểu chi tiết của lớp học phần (thứ, tiết, phòng học).
13. **`DANGKYTINCHI`**: Giao dịch đăng ký tín chỉ của sinh viên vào lớp học phần.
14. **`DIEMSO`**: Bảng điểm quá trình, giữa kỳ, cuối kỳ của lượt đăng ký tín chỉ.

### Khối D – Học phí & Hệ thống (4 bảng)
15. **`MUCHOCPHI`**: Bảng định mức đơn giá tín chỉ áp dụng theo từng học kỳ.
16. **`HOCPHI`**: Hồ sơ nghĩa vụ học phí tổng hợp của sinh viên trong từng học kỳ.
17. **`CHITIETTHANHTOAN`**: Lịch sử các đợt nộp học phí thực tế của sinh viên.
18. **`LOGHOATDONG`**: Nhật ký kiểm toán (Audit Log) theo dõi biến động dữ liệu toàn hệ thống.

---

## 3. DATA DICTIONARY HỢP NHẤT CHI TIẾT (18 BẢNG)

### 3.1. KHOA
- `MaKhoa` VARCHAR(10) NOT NULL, PK.
- `TenKhoa` NVARCHAR(100) NOT NULL, UNIQUE (`UQ_KHOA_TenKhoa`).
- `Email` VARCHAR(100) NULL.
- `SoDienThoai` VARCHAR(15) NULL.
- `TrangThai` BIT NOT NULL DEFAULT 1 (`DF_KHOA_TrangThai`).

### 3.2. NGANH
- `MaNganh` VARCHAR(10) NOT NULL, PK (`PK_NGANH`).
- `MaKhoa` VARCHAR(10) NOT NULL, FK -> `KHOA.MaKhoa` (`FK_NGANH_KHOA`).
- `TenNganh` NVARCHAR(100) NOT NULL, UNIQUE (`UQ_NGANH_TenNganh`).
- `MoTa` NVARCHAR(500) NULL.
- `TrangThai` BIT NOT NULL DEFAULT 1 (`DF_NGANH_TrangThai`).

### 3.3. CHUONGTRINHDAOTAO
- `MaCTDT` VARCHAR(15) NOT NULL, PK (`PK_CHUONGTRINHDAOTAO`).
- `MaNganh` VARCHAR(10) NOT NULL, FK -> `NGANH.MaNganh` (`FK_CHUONGTRINHDAOTAO_NGANH`).
- `TenCTDT` NVARCHAR(150) NOT NULL.
- `KhoaHoc` VARCHAR(20) NOT NULL.
- `TongTinChiYeuCau` INT NOT NULL, CHECK > 0 (`CK_CHUONGTRINHDAOTAO_TongTinChi`).
- `ThoiGianDaoTao` INT NOT NULL, CHECK > 0 (`CK_CHUONGTRINHDAOTAO_ThoiGian`).
- `TrangThai` BIT NOT NULL DEFAULT 1 (`DF_CHUONGTRINHDAOTAO_TrangThai`).

### 3.4. MONHOC
- `MaMonHoc` VARCHAR(15) NOT NULL, PK (`PK_MONHOC`).
- `MaKhoa` VARCHAR(10) NOT NULL, FK -> `KHOA.MaKhoa` (`FK_MONHOC_KHOA`).
- `TenMonHoc` NVARCHAR(150) NOT NULL.
- `SoTinChi` TINYINT NOT NULL, CHECK > 0 (`CK_MONHOC_SoTinChi`).
- `SoTietLyThuyet` SMALLINT NOT NULL, CHECK >= 0 (`CK_MONHOC_SoTietLyThuyet`).
- `SoTietThucHanh` SMALLINT NOT NULL, CHECK >= 0 (`CK_MONHOC_SoTietThucHanh`).
- `MoTa` NVARCHAR(500) NULL.
- `TrangThai` BIT NOT NULL DEFAULT 1 (`DF_MONHOC_TrangThai`).

### 3.5. CTDT_MONHOC
- `MaCTDT` VARCHAR(15) NOT NULL, PK/FK -> `CHUONGTRINHDAOTAO.MaCTDT` (`FK_CTDT_MONHOC_CTDT`).
- `MaMonHoc` VARCHAR(15) NOT NULL, PK/FK -> `MONHOC.MaMonHoc` (`FK_CTDT_MONHOC_MONHOC`).
- `HocKyDuKien` TINYINT NOT NULL, CHECK > 0 (`CK_CTDT_MONHOC_HocKyDuKien`).
- `LoaiMon` VARCHAR(20) NOT NULL, CHECK IN ('BAT_BUOC', 'TU_CHON') (`CK_CTDT_MONHOC_LoaiMon`).
- `ThuTu` SMALLINT NULL, CHECK (ThuTu IS NULL OR ThuTu > 0) (`CK_CTDT_MONHOC_ThuTu`).
- PK ghép: `(MaCTDT, MaMonHoc)` (`PK_CTDT_MONHOC`).

### 3.6. MONHOCTIENQUYET
- `MaMonHoc` VARCHAR(15) NOT NULL, PK/FK -> `MONHOC.MaMonHoc` (`FK_MONHOCTIENQUYET_MONHOC`).
- `MaMonTienQuyet` VARCHAR(15) NOT NULL, PK/FK -> `MONHOC.MaMonHoc` (`FK_MONHOCTIENQUYET_MONHOCTIENQUYET`).
- `MucDo` VARCHAR(20) NOT NULL DEFAULT 'BAT_BUOC', CHECK IN ('BAT_BUOC', 'KHUYEN_NGHI') (`CK_MONHOCTIENQUYET_MucDo`).
- PK ghép: `(MaMonHoc, MaMonTienQuyet)` (`PK_MONHOCTIENQUYET`).
- CHECK: `MaMonHoc <> MaMonTienQuyet` (`CK_MONHOCTIENQUYET_MaMonHoc`).
- Kiểm soát chu trình đệ quy nhiều cấp thông qua Trigger `TR_MONHOCTIENQUYET_KiemTraChuTrinh`.

### 3.7. SINHVIEN
- `MaSV` INT IDENTITY(1,1) NOT NULL, PK (`PK_SINHVIEN`).
- `MaSinhVien` VARCHAR(20) NOT NULL, UNIQUE (`UQ_SINHVIEN_MaSinhVien`).
- `HoTen` NVARCHAR(100) NOT NULL.
- `NgaySinh` DATE NULL.
- `Email` VARCHAR(254) NULL, Filtered Unique Index (`UQ_SINHVIEN_Email` WHERE Email IS NOT NULL).
- `SoDienThoai` VARCHAR(20) NULL.
- `MaKhoa` VARCHAR(10) NOT NULL, FK -> `KHOA.MaKhoa` (`FK_SINHVIEN_KHOA`).
- `TrangThai` VARCHAR(20) NOT NULL DEFAULT 'DANG_HOC', CHECK IN ('DANG_HOC', 'BAO_LUU', 'TOT_NGHIEP', 'THOI_HOC') (`CK_SINHVIEN_TrangThai`).
- `NgayTao` DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME() (`DF_SINHVIEN_NgayTao`).

### 3.8. GIANGVIEN
- `MaGV` INT IDENTITY(1,1) NOT NULL, PK (`PK_GIANGVIEN`).
- `MaGiangVien` VARCHAR(20) NOT NULL, UNIQUE (`UQ_GIANGVIEN_MaGiangVien`).
- `HoTen` NVARCHAR(100) NOT NULL.
- `Email` VARCHAR(254) NULL, Filtered Unique Index (`UQ_GIANGVIEN_Email` WHERE Email IS NOT NULL).
- `SoDienThoai` VARCHAR(20) NULL.
- `MaKhoa` VARCHAR(10) NOT NULL, FK -> `KHOA.MaKhoa` (`FK_GIANGVIEN_KHOA`).
- `TrangThai` VARCHAR(20) NOT NULL DEFAULT 'DANG_CONG_TAC', CHECK IN ('DANG_CONG_TAC', 'TAM_NGHI', 'NGHI_VIEC') (`CK_GIANGVIEN_TrangThai`).
- `NgayTao` DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME() (`DF_GIANGVIEN_NgayTao`).

### 3.9. TAIKHOAN
- `MaTaiKhoan` INT IDENTITY(1,1) NOT NULL, PK (`PK_TAIKHOAN`).
- `Username` VARCHAR(50) NOT NULL, UNIQUE (`UQ_TAIKHOAN_Username`).
- `PasswordHash` VARCHAR(255) NOT NULL (mã băm chuẩn SHA-256).
- `VaiTro` VARCHAR(30) NOT NULL, CHECK IN ('SINH_VIEN', 'GIANG_VIEN', 'DAO_TAO', 'QUAN_TRI') (`CK_TAIKHOAN_VaiTro`).
- `TrangThai` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', CHECK IN ('ACTIVE', 'LOCKED', 'DISABLED') (`CK_TAIKHOAN_TrangThai`).
- `MaSV` INT NULL, FK -> `SINHVIEN.MaSV` (`FK_TAIKHOAN_SINHVIEN`), Filtered Unique Index (`UQ_TAIKHOAN_MaSV` WHERE MaSV IS NOT NULL).
- `MaGV` INT NULL, FK -> `GIANGVIEN.MaGV` (`FK_TAIKHOAN_GIANGVIEN`), Filtered Unique Index (`UQ_TAIKHOAN_MaGV` WHERE MaGV IS NOT NULL).
- `NgayTao` DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME() (`DF_TAIKHOAN_NgayTao`).
- `LanDangNhapCuoi` DATETIME2(0) NULL.
- CHECK: Không cho phép `MaSV` và `MaGV` đồng thời khác `NULL` (`CK_TAIKHOAN_NguoiDung`).

### 3.10. HOCKY
- `MaHocKy` INT IDENTITY(1,1) NOT NULL, PK (`PK_HOCKY`).
- `NamHoc` VARCHAR(9) NOT NULL.
- `TenHocKy` NVARCHAR(30) NOT NULL.
- `NgayBatDau` DATE NOT NULL.
- `NgayKetThuc` DATE NOT NULL.
- `NgayMoDangKy` DATETIME2 NOT NULL.
- `NgayDongDangKy` DATETIME2 NOT NULL.
- `TrangThai` VARCHAR(20) NOT NULL DEFAULT 'CHUA_MO', CHECK IN ('CHUA_MO', 'DANG_MO', 'KET_THUC') (`CK_HOCKY_TrangThai`).
- UNIQUE: `(NamHoc, TenHocKy)` (`UQ_HOCKY_NamHoc_TenHocKy`).
- CHECK: `NgayBatDau <= NgayKetThuc` (`CK_HOCKY_NgayHoc`).
- CHECK: `NgayMoDangKy <= NgayDongDangKy` (`CK_HOCKY_DangKy`).

### 3.11. LOPHOCPHAN
- `MaLHP` VARCHAR(20) NOT NULL, PK (`PK_LOPHOCPHAN`).
- `MaMonHoc` VARCHAR(15) NOT NULL, FK -> `MONHOC.MaMonHoc` (`FK_LOPHOCPHAN_MONHOC`).
- `MaHocKy` INT NOT NULL, FK -> `HOCKY.MaHocKy` (`FK_LOPHOCPHAN_HOCKY`).
- `MaGiangVien` INT NULL, FK -> `GIANGVIEN.MaGV` (`FK_LOPHOCPHAN_GIANGVIEN`).
- `TenLHP` NVARCHAR(100) NOT NULL.
- `SoLuongToiDa` INT NOT NULL DEFAULT 50, CHECK > 0 (`CK_LOPHOCPHAN_SoLuongToiDa`).
- `TrangThai` VARCHAR(20) NOT NULL DEFAULT 'MO_DANG_KY', CHECK IN ('MO_DANG_KY', 'DANG_MO', 'DA_KHOA', 'DA_HUY') (`CK_LOPHOCPHAN_TrangThai`).

### 3.12. LICHHOC
- `MaLichHoc` INT IDENTITY(1,1) NOT NULL, PK (`PK_LICHHOC`).
- `MaLHP` VARCHAR(20) NOT NULL, FK -> `LOPHOCPHAN.MaLHP` (`FK_LICHHOC_LOPHOCPHAN`).
- `Thu` TINYINT NOT NULL, CHECK BETWEEN 2 AND 8 (`CK_LICHHOC_Thu`).
- `TietBatDau` TINYINT NOT NULL, CHECK BETWEEN 1 AND 12 (`CK_LICHHOC_TietBatDau`).
- `SoTiet` TINYINT NOT NULL, CHECK BETWEEN 1 AND 6 (`CK_LICHHOC_SoTiet`).
- `PhongHoc` VARCHAR(20) NOT NULL.
- CHECK: `TietBatDau + SoTiet - 1 <= 12` (`CK_LICHHOC_TietKetThuc`).

### 3.13. DANGKYTINCHI
- `MaDangKy` BIGINT IDENTITY(1,1) NOT NULL, PK (`PK_DANGKYTINCHI`).
- `MaSV` INT NOT NULL, FK -> `SINHVIEN.MaSV` (`FK_DANGKYTINCHI_SINHVIEN`).
- `MaLHP` VARCHAR(20) NOT NULL, FK -> `LOPHOCPHAN.MaLHP` (`FK_DANGKYTINCHI_LOPHOCPHAN`).
- `NgayDangKy` DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME() (`DF_DANGKYTINCHI_NgayDangKy`).
- `TrangThai` VARCHAR(20) NOT NULL DEFAULT 'REGISTERED', CHECK IN ('REGISTERED', 'CANCELLED') (`CK_DANGKYTINCHI_TrangThai`).
- Filtered Unique Index: `(MaSV, MaLHP) WHERE TrangThai = 'REGISTERED'` (`UQ_DANGKYTINCHI_SinhVien_LopHocPhan`).

### 3.14. DIEMSO
- `MaDangKy` BIGINT NOT NULL, PK/FK -> `DANGKYTINCHI.MaDangKy` (`PK_DIEMSO`, `FK_DIEMSO_DANGKYTINCHI`).
- `DiemQuaTrinh` DECIMAL(4,2) NULL, CHECK (DiemQuaTrinh IS NULL OR DiemQuaTrinh BETWEEN 0 AND 10).
- `DiemGiuaKy` DECIMAL(4,2) NULL, CHECK (DiemGiuaKy IS NULL OR DiemGiuaKy BETWEEN 0 AND 10).
- `DiemCuoiKy` DECIMAL(4,2) NULL, CHECK (DiemCuoiKy IS NULL OR DiemCuoiKy BETWEEN 0 AND 10).
- `TyTrongQT` TINYINT NOT NULL DEFAULT 20 (`DF_DIEMSO_TyTrongQT`).
- `TyTrongGK` TINYINT NOT NULL DEFAULT 30 (`DF_DIEMSO_TyTrongGK`).
- `TyTrongCK` TINYINT NOT NULL DEFAULT 50 (`DF_DIEMSO_TyTrongCK`).
- CHECK: `TyTrongQT + TyTrongGK + TyTrongCK = 100` (`CK_DIEMSO_TyTrong`).

### 3.15. MUCHOCPHI
- `MaMucHocPhi` INT IDENTITY(1,1) NOT NULL, PK (`PK_MUCHOCPHI`).
- `MaHocKy` INT NOT NULL, FK -> `HOCKY.MaHocKy` (`FK_MUCHOCPHI_HOCKY`).
- `PhamViApDung` VARCHAR(50) NOT NULL, CHECK (`PhamViApDung = 'TOAN_TRUONG'`).
- `DonGiaTinChi` DECIMAL(12,2) NOT NULL, CHECK > 0 (`CK_MUCHOCPHI_DonGia`).
- `NgayHieuLuc` DATE NOT NULL.
- `NgayHetHieuLuc` DATE NULL.
- `TrangThai` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', CHECK IN ('ACTIVE', 'INACTIVE') (`CK_MUCHOCPHI_TrangThai`).
- CHECK: `NgayHetHieuLuc IS NULL OR NgayHetHieuLuc >= NgayHieuLuc` (`CK_MUCHOCPHI_NgayHieuLuc`).
- Trigger `TR_MUCHOCPHI_KiemTraHieuLuc` chặn trùng khoảng thời gian hiệu lực cho mức ACTIVE.

### 3.16. HOCPHI
- `MaHocPhi` INT IDENTITY(1,1) NOT NULL, PK (`PK_HOCPHI`).
- `MaSV` INT NOT NULL, FK -> `SINHVIEN.MaSV` (`FK_HOCPHI_SINHVIEN`).
- `MaHocKy` INT NOT NULL, FK -> `HOCKY.MaHocKy` (`FK_HOCPHI_HOCKY`).
- `MaMucHocPhi` INT NOT NULL, FK -> `MUCHOCPHI.MaMucHocPhi` (`FK_HOCPHI_MUCHOCPHI`).
- `SoTinChi` INT NOT NULL, CHECK > 0 (`CK_HOCPHI_SoTinChi`).
- `DonGiaTinChi` DECIMAL(12,2) NOT NULL, CHECK > 0 (`CK_HOCPHI_DonGia`).
- `TongTien` DECIMAL(14,2) NOT NULL, CHECK >= 0 (`CK_HOCPHI_TongTien`).
- `SoTienDaThanhToan` DECIMAL(14,2) NOT NULL DEFAULT 0 (`DF_HOCPHI_SoTienDaThanhToan`).
- `TrangThai` VARCHAR(20) NOT NULL DEFAULT 'UNPAID', CHECK IN ('UNPAID', 'PARTIAL', 'PAID') (`CK_HOCPHI_TrangThai`).
- `NgayCapNhat` DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME() (`DF_HOCPHI_NgayCapNhat`).
- UNIQUE: `(MaSV, MaHocKy)` (`UQ_HOCPHI_SinhVien_HocKy`).
- CHECK: `SoTienDaThanhToan >= 0 AND SoTienDaThanhToan <= TongTien` (`CK_HOCPHI_SoTienDaThanhToan`).

### 3.17. CHITIETTHANHTOAN
- `MaThanhToan` BIGINT IDENTITY(1,1) NOT NULL, PK (`PK_CHITIETTHANHTOAN`).
- `MaHocPhi` INT NOT NULL, FK -> `HOCPHI.MaHocPhi` (`FK_CHITIETTHANHTOAN_HOCPHI`).
- `SoTien` DECIMAL(14,2) NOT NULL, CHECK > 0 (`CK_CHITIETTHANHTOAN_SoTien`).
- `NgayThanhToan` DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME() (`DF_CHITIETTHANHTOAN_NgayThanhToan`).
- `PhuongThuc` VARCHAR(20) NOT NULL, CHECK IN ('TIEN_MAT', 'CHUYEN_KHOAN') (`CK_CHITIETTHANHTOAN_PhuongThuc`).

### 3.18. LOGHOATDONG
- `MaLog` BIGINT IDENTITY(1,1) NOT NULL, PK (`PK_LOGHOATDONG`).
- `MaTaiKhoan` INT NULL, FK -> `TAIKHOAN.MaTaiKhoan` (`FK_LOGHOATDONG_TAIKHOAN`).
- `ThoiGian` DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME() (`DF_LOGHOATDONG_ThoiGian`).
- `HanhDong` VARCHAR(20) NOT NULL, CHECK IN ('INSERT', 'UPDATE', 'DELETE') (`CK_LOGHOATDONG_HanhDong`).
- `TenBang` VARCHAR(128) NOT NULL.
- `KhoaBanGhi` NVARCHAR(200) NULL.
- `NoiDungCu` NVARCHAR(MAX) NULL (JSON).
- `NoiDungMoi` NVARCHAR(MAX) NULL (JSON).

---

## 4. QUAN HỆ CHÍNH (CARDINALITY & FOREIGN KEYS)

```text
[KHOA] 1 ────────────< N [NGANH]
[NGANH] 1 ───────────< N [CHUONGTRINHDAOTAO]
[KHOA] 1 ────────────< N [MONHOC]
[KHOA] 1 ────────────< N [SINHVIEN]
[KHOA] 1 ────────────< N [GIANGVIEN]

[CHUONGTRINHDAOTAO] 1 ──< N [CTDT_MONHOC] >── 1 [MONHOC] (N:N)
[MONHOC] 1 ─────────────< N [MONHOCTIENQUYET] >── 1 [MONHOC] (Tự quan hệ N:N)
[MONHOC] 1 ─────────────< N [LOPHOCPHAN]
[HOCKY] 1 ──────────────< N [LOPHOCPHAN]
[GIANGVIEN] 1 ──────────< N [LOPHOCPHAN]

[LOPHOCPHAN] 1 ─────────< N [LICHHOC]
[SINHVIEN] 1 ───────────< N [DANGKYTINCHI]
[LOPHOCPHAN] 1 ─────────< N [DANGKYTINCHI]
[DANGKYTINCHI] 1 ─────── 1 [DIEMSO] (1:1 qua MaDangKy)

[SINHVIEN] 1 ─────────── 0..1 [TAIKHOAN]
[GIANGVIEN] 1 ────────── 0..1 [TAIKHOAN]
[TAIKHOAN] 1 ───────────< N [LOGHOATDONG]

[HOCKY] 1 ──────────────< N [MUCHOCPHI]
[MUCHOCPHI] 1 ──────────< N [HOCPHI]
[SINHVIEN] 1 ───────────< N [HOCPHI]
[HOCKY] 1 ──────────────< N [HOCPHI]
[HOCPHI] 1 ─────────────< N [CHITIETTHANHTOAN]
```

---

## 5. BUSINESS RULES LIÊN MODULE (18 QUY TẮC TOÀN VẸN)

- **BR01:** Sinh viên chỉ được đăng ký môn khi trạng thái là `DANG_HOC` và tài khoản ở trạng thái `ACTIVE`.
- **BR02:** Môn tiên quyết `BAT_BUOC` được xem là hoàn thành khi điểm tổng kết của sinh viên đạt `>= 5.0`.
- **BR03:** Số lượng sinh viên đăng ký `REGISTERED` trong một lớp học phần không được vượt quá `SoLuongToiDa`.
- **BR04:** Sinh viên không được phép đăng ký hai lớp học phần có lịch học trùng/giao nhau trong cùng học kỳ.
- **BR05:** Không xếp cùng một giảng viên hoặc cùng một phòng học cho hai lớp học phần khác nhau trong cùng khung giờ.
- **BR06:** Đăng ký và hủy học phần chỉ được thực hiện trong khoảng thời gian `NgayMoDangKy` đến `NgayDongDangKy` và `HOCKY.TrangThai = 'DANG_MO'`.
- **BR07:** Tổng tỷ trọng điểm thành phần trong `DIEMSO` (`TyTrongQT + TyTrongGK + TyTrongCK`) bắt buộc phải bằng 100%.
- **BR08:** Tuyệt đối không cho phép tạo chu trình phụ thuộc vòng lặp giữa các môn tiên quyết.
- **BR09:** Đăng ký bị hủy (`CANCELLED`) không được tính vào sĩ số thực tế và không tính vào học phí.
- **BR10:** Mỗi sinh viên có tối đa một hồ sơ `HOCPHI` cho mỗi học kỳ (`UNIQUE(MaSV, MaHocKy)`).
- **BR11:** `HOCPHI` tham chiếu `MUCHOCPHI` đang có hiệu lực (`ACTIVE`) tại thời điểm tính và lưu snapshot `DonGiaTinChi`, `TongTien`.
- **BR12:** `MUCHOCPHI.PhamViApDung` phiên bản 1 chỉ áp dụng giá trị `'TOAN_TRUONG'`.
- **BR13:** Một hồ sơ `HOCPHI` có thể thanh toán nhiều đợt thông qua `CHITIETTHANHTOAN`; tổng tiền nộp không được vượt quá `TongTien`.
- **BR14:** `SoTienDaThanhToan` và `TrangThai` của `HOCPHI` phải được cập nhật đồng bộ tự động khi có biến động giao dịch thanh toán.
- **BR15:** Audit log ghi nhận mã tài khoản, thời gian, hành động, tên bảng và chuỗi JSON các trường thay đổi; tuyệt đối không ghi `PasswordHash`.
- **BR16:** Email được phép `NULL` nhưng nếu có giá trị thì không được phép trùng lặp trong cùng bảng `SINHVIEN` hoặc `GIANGVIEN`.
- **BR17:** Dữ liệu lịch sử đã được tham chiếu không xóa cứng (`NO ACTION`); chỉ đổi cờ trạng thái nghiệp vụ.
- **BR18:** Mỗi chương trình đào tạo bắt buộc trực thuộc một ngành học (`NGANH`); mỗi ngành học trực thuộc một khoa (`KHOA`).

---

## 6. ĐÁNH GIÁ CHUẨN HÓA CƠ SỞ DỮ LIỆU (1NF, 2NF, 3NF)

- **1NF (Chuẩn 1):** Toàn bộ thuộc tính nghiệp vụ đều mang giá trị nguyên tử (atomic values). Các danh mục nhiều giá trị (môn học của CTĐT, môn tiên quyết, thời khóa biểu) đều được tách thành các thực thể quan hệ riêng (`CTDT_MONHOC`, `MONHOCTIENQUYET`, `LICHHOC`). Trường JSON trong `LOGHOATDONG` chỉ đóng vai trò payload kiểm toán, không thay thế cấu trúc dữ liệu quan hệ.
- **2NF (Chuẩn 2):** Đạt 1NF và loại bỏ hoàn toàn phụ thuộc bộ phận. Tất cả các thuộc tính không khóa đều phụ thuộc hoàn toàn vào toàn bộ khóa chính:
  - Các bảng khóa đơn (`KHOA`, `NGANH`, `SINHVIEN`, `MONHOC`, `LOPHOCPHAN`,...) mặc nhiên thỏa mãn 2NF.
  - Các bảng khóa ghép (`CTDT_MONHOC`, `MONHOCTIENQUYET`) chỉ chứa các thuộc tính phụ thuộc vào toàn bộ cặp khóa ghép (`HocKyDuKien`, `LoaiMon`, `MucDo`).
- **3NF (Chuẩn 3):** Đạt 2NF và loại bỏ toàn bộ phụ thuộc bắc cầu (transitive dependencies):
  - **Tách bảng `NGANH`:** Chuẩn hóa quan hệ giữa Khoa và CTĐT. Trước đây `CHUONGTRINHDAOTAO` chứa tên ngành dẫn đến lặp dữ liệu và phụ thuộc gián tiếp tới `KHOA`. Khi tách thành `NGANH`, chuỗi quan hệ là `KHOA` (1:N) `NGANH` (1:N) `CHUONGTRINHDAOTAO`, triệt tiêu hoàn toàn phụ thuộc bắc cầu.
  - Không lặp tên khoa trong hồ sơ `SINHVIEN`, `GIANGVIEN`.
  - Không lưu sĩ số tĩnh trong `LOPHOCPHAN` (tính động từ `DANGKYTINCHI`).
  - Không lưu điểm tổng kết tĩnh trong `DIEMSO` (tính động qua View và Function).
  - Tách bảng `TAIKHOAN` độc lập khỏi hồ sơ cá nhân của Sinh viên và Giảng viên.

**Kết luận:** Toàn bộ 18 bảng đạt tiêu chuẩn tối thiểu **3NF**.

---

## 7. DANH MỤC ĐỐI TƯỢNG DATABASE ĐÃ TRIỂN KHAI HOÀN CHỈNH

Hệ thống mã nguồn SQL trong thư mục `DB/` đã hiện thực hóa đầy đủ 100% các đối tượng:

### 7.1. Views (06_Views.md - 6 Views)
1. `V_CauTrucChuongTrinhDaoTao`: Cấu trúc khung chương trình đào tạo theo Khoa, Ngành, CTĐT và môn học.
2. `V_TaiKhoanNguoiDung`: Danh sách tài khoản người dùng hiển thị họ tên thực tế, Lớp sinh hoạt, ẩn cột mật khẩu.
3. `V_ThoiKhoaBieuSinhVien`: Thời khóa biểu cá nhân của sinh viên theo từng học kỳ.
4. `V_BangDiemChiTiet`: Bảng điểm đầy đủ điểm quá trình, giữa kỳ, cuối kỳ, điểm tổng kết hệ 10, điểm chữ và kết quả Đạt/Không đạt.
5. `V_HocPhiSinhVien`: Tổng hợp học phí, số tiền đã đóng, số tiền còn nợ, Lớp sinh hoạt và trạng thái công nợ.
6. `V_DanhSachLopSinhHoat`: Danh sách 36 lớp sinh hoạt niên chế kèm sĩ số sinh viên thực tế tính động.

### 7.2. Functions (07_Functions.md - 7 Functions)
1. `FN_KiemTraTienQuyet(@MaSV, @MaMonHoc)`: Kiểm tra sinh viên đã hoàn thành môn tiên quyết bắt buộc (điểm tổng kết >= 5.0) hay chưa.
2. `FN_KiemTraThoiGianDangKy(@MaHocKy, @ThoiDiem)`: Kiểm tra thời điểm có nằm trong khung mở đăng ký của học kỳ đang mở hay không.
3. `FN_TongTinChiDangKy(@MaSV, @MaHocKy)`: Tính tổng số tín chỉ sinh viên đã đăng ký hợp lệ trong học kỳ.
4. `FN_TinhDiemTongKet(@QT, @GK, @CK, @TyTrongQT, @TyTrongGK, @TyTrongCK)`: Tính điểm trung bình theo tỷ trọng.
5. `FN_KiemTraTaiKhoanDangHoatDong(@MaTaiKhoan)`: Kiểm tra tài khoản có ở trạng thái `ACTIVE`.
6. `FN_LayDonGiaTinChi(@MaHocKy, @NgayTinh)`: Lấy đơn giá tín chỉ đang có hiệu lực tại thời điểm tính.
7. `FN_DemSiSoLopSinhHoat(@MaLop)`: Đếm sĩ số sinh viên hiện tại của một lớp sinh hoạt niên chế.

### 7.3. Stored Procedures (08_StoredProcedures.md - 7 Procedures)
1. `SP_TaoTaiKhoan`: Tạo tài khoản mới, kiểm tra trùng lặp và tính toàn vẹn khóa ngoại theo vai trò.
2. `SP_KhoaTaiKhoan`: Khóa tài khoản người dùng, phân quyền chỉ Đào tạo/Quản trị được thao tác.
3. `SP_DangKyTinChi`: Xử lý đăng ký tín chỉ lõi trong transaction (kiểm tra trạng thái SV, tiên quyết, trùng lịch học, sĩ số lớp, hạn mức tín chỉ).
4. `SP_HuyDangKy`: Xử lý hủy đăng ký tín chỉ (chặn hủy khi đã nhập điểm hoặc hết thời hạn đăng ký).
5. `SP_TinhHocPhiSinhVien`: Khởi tạo hồ sơ học phí theo mức giá tín chỉ học kỳ và số tín chỉ đã đăng ký hợp lệ.
6. `SP_ThongKeHocPhi`: Báo cáo thống kê tài chính học phí theo học kỳ và trạng thái thanh toán.
7. `SP_ThongKeHocPhiTheoLop`: Báo cáo thống kê tài chính học phí chi tiết theo Lớp sinh hoạt và học kỳ.

### 7.4. Triggers (05_Triggers.md - 13 Triggers)
- **Nghiệp vụ (6 triggers):**
  1. `TR_MONHOCTIENQUYET_KiemTraChuTrinh`: Ngăn chặn chu trình đệ quy vô hạn trong môn tiên quyết (mã 51001).
  2. `TR_DANGKYTINCHI_KiemTraSiSo`: Ngăn chặn đăng ký vượt quá sĩ số tối đa của lớp học phần (mã 51002).
  3. `TR_LICHHOC_KiemTraTrungLich`: Chặn xếp trùng lịch giảng viên hoặc trùng phòng học trong cùng khung giờ (mã 51310).
  4. `TR_MUCHOCPHI_KiemTraHieuLuc`: Chặn mức học phí trùng khoảng thời gian hiệu lực và đảm bảo phạm vi toàn trường (mã 51004, 51005).
  5. `TR_CHITIETTHANHTOAN_CapNhatHocPhi`: Tự động tính tổng tiền thanh toán, cập nhật cache và chuyển trạng thái `UNPAID`/`PARTIAL`/`PAID` cho `HOCPHI` (mã 51006).
  6. `TR_LOP_KiemTraXoa`: Ngăn chặn xóa Lớp sinh hoạt đang có Sinh viên trực thuộc (mã 51007).
- **Kiểm toán (Audit - 7 triggers):**
  7. `TR_TAIKHOAN_Audit`: Ghi nhật ký bảng `TAIKHOAN` vào `LOGHOATDONG`.
  8. `TR_DANGKYTINCHI_Audit`: Ghi nhật ký bảng `DANGKYTINCHI` vào `LOGHOATDONG`.
  9. `TR_DIEMSO_Audit`: Ghi nhật ký bảng `DIEMSO` vào `LOGHOATDONG`.
  10. `TR_MUCHOCPHI_Audit`: Ghi nhật ký bảng `MUCHOCPHI` vào `LOGHOATDONG`.
  11. `TR_HOCPHI_Audit`: Ghi nhật ký bảng `HOCPHI` vào `LOGHOATDONG`.
  12. `TR_CHITIETTHANHTOAN_Audit`: Ghi nhật ký bảng `CHITIETTHANHTOAN` vào `LOGHOATDONG`.
  13. `TR_LOP_Audit`: Ghi nhật ký bảng `LOP` vào `LOGHOATDONG`.

### 7.5. Security Roles (11_Security.md - 4 Roles)
1. `SINH_VIEN`: Quyền tra cứu thông tin cá nhân, TKB, bảng điểm, học phí; thực hiện đăng ký tín chỉ và nộp học phí.
2. `GIANG_VIEN`: Quyền xem lịch giảng dạy, danh sách sinh viên lớp học phần và chấm điểm.
3. `DAO_TAO`: Quản lý chương trình học, mở lớp học phần, quản lý đăng ký tín chỉ và xác nhận học phí.
4. `QUAN_TRI`: Quản trị toàn quyền hệ thống, quản lý tài khoản người dùng và xem Audit Log.

---

## 8. CÁC QUYẾT ĐỊNH THIẾT KẾ ĐÃ KHÓA (ARCHITECTURAL DECISIONS)

- **[DEC-01]** Schema chuẩn thức gồm đúng **19 bảng**. Bổ sung bảng `NGANH` để chuẩn hóa phân cấp Khoa - Ngành - CTĐT đạt chuẩn 3NF, bổ sung bảng `LOP` quản lý sinh viên theo lớp niên chế, và bổ sung bảng `CHITIETTHANHTOAN` hỗ trợ thanh toán học phí nhiều đợt.
- **[DEC-02]** Môn tiên quyết `BAT_BUOC` được xem là đạt khi `DiemTongKet >= 5.0`.
- **[DEC-03]** Bốn vai trò hệ thống: `SINH_VIEN`, `GIANG_VIEN`, `DAO_TAO`, `QUAN_TRI`.
- **[DEC-04]** Email không bắt buộc (`NULL`), nhưng đảm bảo tính duy nhất bằng Filtered Unique Index.
- **[DEC-05]** Mỗi học kỳ quản lý đợt đăng ký qua `NgayMoDangKy` và `NgayDongDangKy` kiểu `DATETIME2`.
- **[DEC-06]** `HOCKY.TrangThai` gồm `'CHUA_MO'`, `'DANG_MO'`, `'KET_THUC'` do phòng Đào tạo quản trị.
- **[DEC-07]** `HOCPHI` lưu `MaMucHocPhi` làm khóa ngoại FK tham chiếu đến `MUCHOCPHI`.
- **[DEC-08]** `HOCPHI` lưu snapshot `DonGiaTinChi` và `TongTien` tại thời điểm sinh viên tính học phí.
- **[DEC-09]** Hỗ trợ thanh toán nhiều đợt; `HOCPHI.SoTienDaThanhToan` là cache tự động cập nhật qua trigger với 3 trạng thái `'UNPAID'`, `'PARTIAL'`, `'PAID'`.
- **[DEC-10]** `MUCHOCPHI.PhamViApDung` phiên bản 1 khóa cứng nhận giá trị `'TOAN_TRUONG'`.
- **[DEC-11]** `LOGHOATDONG` lưu JSON các cột dữ liệu thay đổi. Phân quyền `DENY` quyền chỉnh sửa/xóa audit log đối với toàn bộ người dùng thông thường.
- **[DEC-12]** Quy chuẩn đặt tên chuẩn Microsoft SQL Server: `PK_<Bang>`, `FK_<BangCon>_<BangCha>`, `UQ_<Bang>_<Cot>`, `CK_<Bang>_<Cot>`, `DF_<Bang>_<Cot>`, `IX_<Bang>_<Cot>`, `V_<MoTa>`, `SP_<HanhDong>_<DoiTuong>`, `FN_<MoTa>`, `TR_<Bang>_<SuKien>`.

---

## 9. TRẠNG THÁI HOÀN THIỆN (STATUS CHECKLIST)

- [x] Khóa cấu trúc 19 bảng chuẩn hóa 3NF.
- [x] Bổ sung bảng `NGANH` tách từ `CHUONGTRINHDAOTAO`.
- [x] Bổ sung bảng `LOP` quản lý 36 lớp sinh hoạt niên chế.
- [x] Bổ sung bảng `CHITIETTHANHTOAN` hỗ trợ thanh toán nhiều đợt.
- [x] Đồng bộ 100% Primary Key / Foreign Key liên module.
- [x] Đồng bộ `MaHocKy`, loại bỏ hoàn toàn `MaHK`.
- [x] Khóa 12 quyết định thiết kế kiến trúc (DEC-01 -> DEC-12).
- [x] Triển khai và kiểm thử 13 Triggers.
- [x] Triển khai và kiểm thử 6 Views.
- [x] Triển khai và kiểm thử 7 Functions.
- [x] Triển khai và kiểm thử 7 Stored Procedures.
- [x] Triển khai và kiểm thử 19 Nonclustered Indexes.
- [x] Thiết lập hệ thống phân quyền 4 Security Roles.
- [x] Khởi tạo bộ dữ liệu mẫu >210.000 dòng dữ liệu thực tế (`04_SeedData.sql`).
- [x] Bộ kiểm thử tích hợp kiểm chứng đạt 100% test case (`13_Test_Integration.md`).
