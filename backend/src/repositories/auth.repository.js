const { getPool, sql } = require('../config/db');

/**
 * Repository thao tác bảng TAIKHOAN và liên kết SINHVIEN / GIANGVIEN
 */
const findByUsername = async (username) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('Username', sql.VarChar(50), username)
    .query(`
      SELECT 
        tk.MaTaiKhoan,
        tk.Username,
        tk.PasswordHash,
        tk.VaiTro,
        tk.TrangThai,
        tk.MaSV,
        tk.MaGV,
        sv.MaSinhVien,
        sv.HoTen AS HoTenSinhVien,
        sv.MaKhoa AS MaKhoaSV,
        sv.MaLop,
        l.TenLop AS TenLopSV,
        sv.TrangThai AS TrangThaiSV,
        gv.MaGiangVien,
        gv.HoTen AS HoTenGiangVien,
        gv.MaKhoa AS MaKhoaGV
      FROM dbo.TAIKHOAN tk
      LEFT JOIN dbo.SINHVIEN sv ON tk.MaSV = sv.MaSV
      LEFT JOIN dbo.LOP l ON sv.MaLop = l.MaLop
      LEFT JOIN dbo.GIANGVIEN gv ON tk.MaGV = gv.MaGV
      WHERE tk.Username = @Username
    `);

  return result.recordset[0] || null;
};

const findById = async (maTaiKhoan) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('MaTaiKhoan', sql.Int, maTaiKhoan)
    .query(`
      SELECT
        tk.MaTaiKhoan,
        tk.Username,
        tk.VaiTro,
        tk.TrangThai,
        tk.MaSV,
        tk.MaGV,
        sv.MaSinhVien,
        sv.HoTen AS HoTenSinhVien,
        sv.MaLop,
        l.TenLop AS TenLopSV,
        gv.MaGiangVien,
        gv.HoTen AS HoTenGiangVien
      FROM dbo.TAIKHOAN tk
      LEFT JOIN dbo.SINHVIEN sv ON tk.MaSV = sv.MaSV
      LEFT JOIN dbo.LOP l ON sv.MaLop = l.MaLop
      LEFT JOIN dbo.GIANGVIEN gv ON tk.MaGV = gv.MaGV
      WHERE tk.MaTaiKhoan = @MaTaiKhoan;
    `);

  return result.recordset[0] || null;
};

const updateLastLogin = async (maTaiKhoan) => {
  const pool = await getPool();
  await pool
    .request()
    .input('MaTaiKhoan', sql.Int, maTaiKhoan)
    .query(`
      UPDATE dbo.TAIKHOAN
      SET LanDangNhapCuoi = GETDATE()
      WHERE MaTaiKhoan = @MaTaiKhoan
    `);
};

module.exports = {
  findByUsername,
  findById,
  updateLastLogin
};
