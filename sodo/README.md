# Sơ Đồ Thực Thể - Quan Hệ (ERD) - DBMS330284

Tài liệu thiết kế và sơ đồ tương tác ERD cho Hệ thống Quản lý Đào tạo & Đăng ký Tín chỉ.

---

## 1. Cách mở xem sơ đồ trực quan (HTML)

- Mở trực tiếp file [`index.html`](file:///c:/Users/ADMIN/Desktop/STUDY/NAM3/H%E1%BB%86%20QU%E1%BA%A2N%20TR%E1%BB%8A%20C%C6%A0%20S%E1%BB%9E%20D%E1%BB%AE%20LI%E1%BB%86U/ProjectDBMS/sodo/index.html) bằng bất kỳ trình duyệt web nào (Chrome, Edge, Firefox,...).
- **Tính năng nổi bật:**
  - **Tương tác Pan & Zoom:** Giữ chuột trái để kéo di chuyển bản đồ; lăn con trỏ chuột hoặc dùng nút zoom trên thanh công cụ để phóng to/thu nhỏ chi tiết.
  - **Bộ lọc phân hệ:** Chuyển đổi linh hoạt giữa góc nhìn toàn thể (19 bảng) và từng phân hệ: *Đào tạo*, *Nhân sự*, *Học phần & ĐK*, *Học phí*.
  - **Từ điển dữ liệu (Sidebar):** Tra cứu nhanh từng bảng, từng thuộc tính, kiểu dữ liệu, các ràng buộc PK, FK, UK.

---

## 2. Quy ước ký hiệu ERD (Crow's Foot Notation)

| Ký hiệu | Ý nghĩa | Ví dụ trong hệ thống |
| :---: | :--- | :--- |
| `||--||` | Đúng 1 - 1 (Bắt buộc cả 2 phía) | `DANGKYTINCHI` và `DIEMSO` (1 lượt đăng ký chỉ có 1 kết quả điểm) |
| `||--o|` | 0 hoặc 1 (Quan hệ tùy chọn 1-1) | `SINHVIEN`/`GIANGVIEN` và `TAIKHOAN` (một SV có tối đa 1 tài khoản) |
| `||--o{` | 1 - Nhiều (Zero or more) | `KHOA` và `NGANH` (1 khoa có 0 hoặc nhiều ngành) |
| `||--|{` | 1 - Nhiều bắt buộc (One or more) | `LOPHOCPHAN` và `LICHHOC` (Lớp HP phải có tối thiểu 1 buổi học) |
| `PK` | Primary Key | Khóa chính xác định duy nhất bản ghi |
| `FK` | Foreign Key | Khóa ngoại tham chiếu bảng cha |
| `UK` | Unique Key | Khóa duy nhất (không trùng lặp) |

---

## 3. Danh sách 19 Thực thể theo Phân hệ

### A. Phân hệ Tổ chức & Khung chương trình đào tạo
1. **`KHOA`**: Quản lý các khoa chuyên môn (`MaKhoa` PK).
2. **`NGANH`**: Ngành đào tạo thuộc Khoa (`MaNganh` PK, `MaKhoa` FK).
3. **`CHUONGTRINHDAOTAO`**: Khung đào tạo từng khóa (`MaCTDT` PK, `MaNganh` FK).
4. **`MONHOC`**: Danh mục môn học trường (`MaMonHoc` PK, `MaKhoa` FK).
5. **`CTDT_MONHOC`**: Bảng nối CTĐT - Môn học (`(MaCTDT, MaMonHoc)` PK, FK).
6. **`MONHOCTIENQUYET`**: Môn tiên quyết / học trước (`(MaMonHoc, MaMonTienQuyet)` PK, FK).
7. **`LOP`**: Lớp sinh hoạt hành chính (`MaLop` PK, `MaKhoa` FK).

### B. Phân hệ Người dùng & Nhân sự
8. **`SINHVIEN`**: Hồ sơ sinh viên (`MaSV` PK, `MaKhoa` FK, `MaLop` FK).
9. **`GIANGVIEN`**: Cán bộ giảng viên (`MaGV` PK, `MaKhoa` FK).
10. **`TAIKHOAN`**: Tài khoản người dùng (`MaTaiKhoan` PK, `MaSV` FK, `MaGV` FK).
11. **`LOGHOATDONG`**: Lịch sử kiểm toán thay đổi dữ liệu (`MaLog` PK, `MaTaiKhoan` FK).

### C. Phân hệ Học phần & Đăng ký tín chỉ
12. **`HOCKY`**: Học kỳ & đợt đăng ký (`MaHocKy` PK).
13. **`LOPHOCPHAN`**: Lớp tín chỉ mở trong kỳ (`MaLHP` PK, `MaMonHoc` FK, `MaHocKy` FK, `MaGiangVien` FK).
14. **`LICHHOC`**: Thứ, tiết, phòng học của lớp HP (`MaLichHoc` PK, `MaLHP` FK).
15. **`DANGKYTINCHI`**: Đăng ký môn của sinh viên (`MaDangKy` PK, `MaSV` FK, `MaLHP` FK).
16. **`DIEMSO`**: Điểm quá trình, giữa kỳ, cuối kỳ (`MaDangKy` PK, FK 1-1).

### D. Phân hệ Học phí & Tài chính
17. **`MUCHOCPHI`**: Định mức giá tín chỉ theo kỳ (`MaMucHocPhi` PK, `MaHocKy` FK).
18. **`HOCPHI`**: Công nợ học phí của sinh viên trong kỳ (`MaHocPhi` PK, `MaSV` FK, `MaHocKy` FK, `MaMucHocPhi` FK).
19. **`CHITIETTHANHTOAN`**: Lịch sử đóng học phí (`MaThanhToan` PK, `MaHocPhi` FK).
