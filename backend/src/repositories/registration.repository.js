const { getPool, sql, getRequestActorId } = require('../config/db');

/**
 * Repository thao tác giao dịch Đăng ký tín chỉ qua Stored Procedures
 */

// Đăng ký tín chỉ bằng cách gọi SP_DangKyTinChi
const registerCourse = async (maSV, maLHP) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('MaSV', sql.Int, maSV)
    .input('MaLHP', sql.VarChar(20), maLHP)
    .input('ActorMaTaiKhoan', sql.Int, getRequestActorId())
    .execute('dbo.SP_App_Registration_Create');

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
  const result = await pool.request().input('MaDangKy', sql.BigInt, maDangKy).execute('dbo.SP_App_Registration_GetById');
  return result.recordset[0] || null;
};

// Hủy đăng ký tín chỉ bằng cách gọi SP_HuyDangKy
const cancelRegistration = async (maSV, maLHP) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('MaSV', sql.Int, maSV)
    .input('MaLHP', sql.VarChar(20), maLHP)
    .input('ActorMaTaiKhoan', sql.Int, getRequestActorId())
    .execute('dbo.SP_App_Registration_Cancel');

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
  const result = await pool.request().input('MaSV', sql.Int, maSV).input('MaHocKy', sql.Int, maHocKy)
    .execute('dbo.SP_App_Registration_ListStudent');
  return result.recordset.map(r => ({
    maDangKy: r.MaDangKy, maLHP: r.MaLHP, tenLHP: r.TenLHP, maMonHoc: r.MaMonHoc, tenMonHoc: r.TenMonHoc,
    soTinChi: r.SoTinChi, tenGiangVien: r.TenGiangVien || 'Chưa phân công', thu: r.Thu, tietBatDau: r.TietBatDau,
    soTiet: r.SoTiet, phongHoc: r.PhongHoc || 'TBA', ngayDangKy: r.NgayDangKy, trangThai: r.TrangThai
  }));
};

module.exports = {
  registerCourse,
  findRegistrationById,
  cancelRegistration,
  getStudentRegistrations
};
