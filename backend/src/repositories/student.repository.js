const { getPool, sql } = require('../config/db');

/**
 * Repository tra cứu học vụ sinh viên từ các SQL Views
 */

// Tra cứu thời khóa biểu sinh viên từ V_ThoiKhoaBieuSinhVien
const getSchedule = async (maSV, maHocKy) => {
  const pool = await getPool();
  const request = pool.request().input('MaSV', sql.Int, maSV);

  let query = `
    SELECT 
      MaSV, MaSinhVien, HoTenSinhVien,
      MaHocKy, NamHoc, TenHocKy,
      MaLHP, MaMonHoc, TenMonHoc, TenLHP,
      HoTenGiangVien,
      Thu, TietBatDau, SoTiet, PhongHoc
    FROM dbo.V_ThoiKhoaBieuSinhVien
    WHERE MaSV = @MaSV
  `;

  if (maHocKy) {
    query += ` AND MaHocKy = @MaHocKy`;
    request.input('MaHocKy', sql.Int, maHocKy);
  }

  query += ` ORDER BY Thu, TietBatDau`;
  const result = await request.query(query);

  return result.recordset.map(r => ({
    maSV: r.MaSV,
    maSinhVien: r.MaSinhVien,
    hoTenSinhVien: r.HoTenSinhVien,
    maHocKy: r.MaHocKy,
    namHoc: r.NamHoc,
    tenHocKy: r.TenHocKy,
    maLHP: r.MaLHP,
    maMonHoc: r.MaMonHoc,
    tenMonHoc: r.TenMonHoc,
    tenLHP: r.TenLHP,
    hoTenGiangVien: r.HoTenGiangVien || 'Chưa phân công',
    thu: r.Thu,
    tietBatDau: r.TietBatDau,
    soTiet: r.SoTiet,
    phongHoc: r.PhongHoc
  }));
};

// Tra cứu bảng điểm chi tiết từ V_BangDiemChiTiet
const getGrades = async (maSV, maHocKy) => {
  const pool = await getPool();
  const request = pool.request().input('MaSV', sql.Int, maSV);

  let query = `
    SELECT 
      MaDangKy, MaSV, MaSinhVien, HoTenSinhVien,
      MaHocKy, NamHoc, TenHocKy,
      MaLHP, MaMonHoc, TenMonHoc, SoTinChi,
      DiemQuaTrinh, DiemGiuaKy, DiemCuoiKy,
      TyTrongQT, TyTrongGK, TyTrongCK,
      DiemTongKet, DiemChu, KetQua
    FROM dbo.V_BangDiemChiTiet
    WHERE MaSV = @MaSV
  `;

  if (maHocKy) {
    query += ` AND MaHocKy = @MaHocKy`;
    request.input('MaHocKy', sql.Int, maHocKy);
  }

  query += ` ORDER BY MaHocKy, MaMonHoc`;
  const result = await request.query(query);

  return result.recordset.map(r => ({
    maDangKy: Number(r.MaDangKy),
    maSV: r.MaSV,
    maHocKy: r.MaHocKy,
    namHoc: r.NamHoc,
    tenHocKy: r.TenHocKy,
    maLHP: r.MaLHP,
    maMonHoc: r.MaMonHoc,
    tenMonHoc: r.TenMonHoc,
    soTinChi: r.SoTinChi,
    diemQuaTrinh: r.DiemQuaTrinh !== null ? Number(r.DiemQuaTrinh) : null,
    diemGiuaKy: r.DiemGiuaKy !== null ? Number(r.DiemGiuaKy) : null,
    diemCuoiKy: r.DiemCuoiKy !== null ? Number(r.DiemCuoiKy) : null,
    diemTongKet: r.DiemTongKet !== null ? Number(r.DiemTongKet) : null,
    diemChu: r.DiemChu,
    ketQua: r.KetQua
  }));
};

// Tra cứu công nợ học phí từ V_HocPhiSinhVien
const getTuition = async (maSV) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('MaSV', sql.Int, maSV)
    .query(`
      SELECT 
        hp.MaHocPhi, hp.MaSV, hp.MaSinhVien, hp.HoTenSinhVien,
        hp.MaHocKy, hp.NamHoc, hp.TenHocKy,
        hp.SoTinChi, hp.DonGiaTinChi, hp.TongTien,
        hp.SoTienDaThanhToan, hp.SoTienConLai,
        hp.TrangThai, hp.NgayCapNhat,
        ISNULL(pending.SoGiaoDich, 0) AS SoGiaoDichChoDuyet,
        ISNULL(pending.TongTienChoDuyet, 0) AS SoTienChoDuyet
      FROM dbo.V_HocPhiSinhVien hp
      OUTER APPLY (
        SELECT 
          COUNT(*) AS SoGiaoDich,
          SUM(SoTien) AS TongTienChoDuyet
        FROM dbo.CHITIETTHANHTOAN ct
        WHERE ct.MaHocPhi = hp.MaHocPhi AND ct.TrangThai = 'CHO_XAC_NHAN'
      ) pending
      WHERE hp.MaSV = @MaSV
      ORDER BY hp.MaHocKy DESC
    `);

  return result.recordset.map(r => ({
    maHocPhi: r.MaHocPhi,
    maSV: r.MaSV,
    maHocKy: r.MaHocKy,
    namHoc: r.NamHoc,
    tenHocKy: r.TenHocKy,
    soTinChi: r.SoTinChi,
    donGiaTinChi: Number(r.DonGiaTinChi),
    tongTien: Number(r.TongTien),
    soTienDaThanhToan: Number(r.SoTienDaThanhToan),
    soTienConLai: Number(r.SoTienConLai),
    trangThai: r.TrangThai,
    ngayCapNhat: r.NgayCapNhat,
    soGiaoDichChoDuyet: Number(r.SoGiaoDichChoDuyet || 0),
    soTienChoDuyet: Number(r.SoTienChoDuyet || 0),
    hasPendingPayment: Number(r.SoGiaoDichChoDuyet || 0) > 0
  }));
};

// Tra cứu lịch sử các giao dịch thanh toán của sinh viên có phân trang
const getPaymentHistory = async (maSV, options = {}) => {
  const pool = await getPool();
  const page = Math.max(1, parseInt(options.page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(options.pageSize) || 10));
  const request = pool.request();

  request.input('MaSV', sql.Int, maSV);
  request.input('Offset', sql.Int, (page - 1) * pageSize);
  request.input('PageSize', sql.Int, pageSize);

  // Đếm tổng số giao dịch
  const countResult = await request.query(`
    SELECT COUNT(*) AS TotalItems
    FROM dbo.CHITIETTHANHTOAN ct
    INNER JOIN dbo.HOCPHI hp ON ct.MaHocPhi = hp.MaHocPhi
    WHERE hp.MaSV = @MaSV;
  `);
  const totalItems = countResult.recordset[0]?.TotalItems || 0;

  // Lấy dữ liệu trang
  const result = await request.query(`
    SELECT 
      ct.MaThanhToan,
      ct.MaHocPhi,
      ct.SoTien,
      ct.PhuongThuc,
      ct.TrangThai,
      ct.NgayThanhToan,
      ct.NgayXacNhan,
      hk.TenHocKy,
      hk.NamHoc
    FROM dbo.CHITIETTHANHTOAN ct
    INNER JOIN dbo.HOCPHI hp ON ct.MaHocPhi = hp.MaHocPhi
    INNER JOIN dbo.HOCKY hk ON hp.MaHocKy = hk.MaHocKy
    WHERE hp.MaSV = @MaSV
    ORDER BY ct.NgayThanhToan DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
  `);

  const items = result.recordset.map(r => ({
    maThanhToan: r.MaThanhToan,
    maHocPhi: r.MaHocPhi,
    soTien: Number(r.SoTien),
    phuongThuc: r.PhuongThuc,
    trangThai: r.TrangThai,
    ngayThanhToan: r.NgayThanhToan,
    ngayXacNhan: r.NgayXacNhan,
    tenHocKy: r.TenHocKy,
    namHoc: r.NamHoc
  }));

  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize)
  };
};

// Lấy thông tin hồ sơ chi tiết sinh viên
const getStudentProfile = async (maSV) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('MaSV', sql.Int, maSV)
    .query(`
      SELECT 
        sv.MaSV,
        sv.MaSinhVien,
        sv.HoTen,
        sv.NgaySinh,
        sv.Email,
        sv.SoDienThoai,
        sv.MaKhoa,
        k.TenKhoa,
        sv.MaLop,
        l.TenLop,
        l.KhoaHoc,
        sv.TrangThai,
        sv.NgayTao,
        tk.Username,
        tk.VaiTro,
        tk.TrangThai AS TrangThaiTaiKhoan,
        tk.LanDangNhapCuoi
      FROM dbo.SINHVIEN sv
      INNER JOIN dbo.KHOA k ON sv.MaKhoa = k.MaKhoa
      LEFT JOIN dbo.LOP l ON sv.MaLop = l.MaLop
      LEFT JOIN dbo.TAIKHOAN tk ON sv.MaSV = tk.MaSV
      WHERE sv.MaSV = @MaSV;
    `);

  if (!result.recordset.length) return null;
  const r = result.recordset[0];
  return {
    maSV: r.MaSV,
    maSinhVien: r.MaSinhVien,
    hoTen: r.HoTen,
    ngaySinh: r.NgaySinh,
    email: r.Email,
    soDienThoai: r.SoDienThoai,
    maKhoa: r.MaKhoa,
    tenKhoa: r.TenKhoa,
    maLop: r.MaLop || null,
    tenLop: r.TenLop || null,
    khoaHoc: r.KhoaHoc || null,
    trangThai: r.TrangThai,
    ngayTao: r.NgayTao,
    username: r.Username,
    vaiTro: r.VaiTro,
    trangThaiTaiKhoan: r.TrangThaiTaiKhoan,
    lanDangNhapCuoi: r.LanDangNhapCuoi
  };
};

module.exports = {
  getSchedule,
  getGrades,
  getTuition,
  getPaymentHistory,
  getStudentProfile
};
