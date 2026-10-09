const { getPool, sql } = require('../config/db');

/**
 * Repository thao tác giao dịch Đăng ký tín chỉ qua Stored Procedures
 */

// Đăng ký tín chỉ bằng cách gọi SP_DangKyTinChi
const registerCourse = async (maSV, maLHP, tinChiToiDa = 25) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('MaSV', sql.Int, maSV)
    .input('MaLHP', sql.VarChar(20), maLHP)
    .input('TinChiToiDa', sql.Int, tinChiToiDa)
    .execute('dbo.SP_DangKyTinChi');

  const record = result.recordset[0];
  return {
    maDangKy: record.MaDangKy,
    maSV: record.MaSV,
    maLHP: record.MaLHP,
    ngayDangKy: record.NgayDangKy,
    trangThai: record.TrangThai
  };
};

// Tìm thông tin đăng ký theo ID
const findRegistrationById = async (maDangKy) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('MaDangKy', sql.BigInt, maDangKy)
    .query(`
      SELECT 
        dk.MaDangKy,
        dk.MaSV,
        dk.MaLHP,
        dk.NgayDangKy,
        dk.TrangThai,
        lhp.MaMonHoc,
        lhp.MaHocKy
      FROM dbo.DANGKYTINCHI dk
      INNER JOIN dbo.LOPHOCPHAN lhp ON dk.MaLHP = lhp.MaLHP
      WHERE dk.MaDangKy = @MaDangKy
    `);

  return result.recordset[0] || null;
};

// Hủy đăng ký tín chỉ bằng cách gọi SP_HuyDangKy
const cancelRegistration = async (maSV, maLHP) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('MaSV', sql.Int, maSV)
    .input('MaLHP', sql.VarChar(20), maLHP)
    .execute('dbo.SP_HuyDangKy');

  const record = result.recordset[0];
  return {
    maDangKy: record.MaDangKy,
    maSV: record.MaSV,
    maLHP: record.MaLHP,
    ngayDangKy: record.NgayDangKy,
    trangThai: record.TrangThai
  };
};

// Lấy danh sách các môn đã đăng ký của sinh viên trong một học kỳ
const getStudentRegistrations = async (maSV, maHocKy) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('MaSV', sql.Int, maSV)
    .input('MaHocKy', sql.Int, maHocKy)
    .query(`
      SELECT 
        dk.MaDangKy,
        dk.MaLHP,
        lhp.TenLHP,
        mh.MaMonHoc,
        mh.TenMonHoc,
        mh.SoTinChi,
        gv.HoTen AS TenGiangVien,
        lh.Thu,
        lh.TietBatDau,
        lh.SoTiet,
        lh.PhongHoc,
        dk.NgayDangKy,
        dk.TrangThai
      FROM dbo.DANGKYTINCHI dk
      INNER JOIN dbo.LOPHOCPHAN lhp ON dk.MaLHP = lhp.MaLHP
      INNER JOIN dbo.MONHOC mh ON lhp.MaMonHoc = mh.MaMonHoc
      LEFT JOIN dbo.GIANGVIEN gv ON lhp.MaGiangVien = gv.MaGV
      LEFT JOIN dbo.LICHHOC lh ON lhp.MaLHP = lh.MaLHP
      WHERE dk.MaSV = @MaSV
        AND lhp.MaHocKy = @MaHocKy
        AND dk.TrangThai = 'REGISTERED'
      ORDER BY lhp.MaLHP
    `);

  return result.recordset.map(r => ({
    maDangKy: r.MaDangKy,
    maLHP: r.MaLHP,
    tenLHP: r.TenLHP,
    maMonHoc: r.MaMonHoc,
    tenMonHoc: r.TenMonHoc,
    soTinChi: r.SoTinChi,
    tenGiangVien: r.TenGiangVien || 'Chưa phân công',
    thu: r.Thu,
    tietBatDau: r.TietBatDau,
    soTiet: r.SoTiet,
    phongHoc: r.PhongHoc || 'TBA',
    ngayDangKy: r.NgayDangKy,
    trangThai: r.TrangThai
  }));
};

module.exports = {
  registerCourse,
  findRegistrationById,
  cancelRegistration,
  getStudentRegistrations
};
