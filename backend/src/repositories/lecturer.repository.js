const { getPool, sql } = require('../config/db');

/**
 * Repository xử lý dữ liệu cho Giảng viên
 */

// Lấy lịch dạy theo tuần của Giảng viên
const getLecturerSchedule = async (maGV, maHocKy = null) => {
  const pool = await getPool();
  const result = await pool.request().input('MaGV', sql.Int, maGV).input('MaHocKy', sql.Int, maHocKy)
    .execute('dbo.SP_App_Lecturer_Schedule');
  return result.recordset.map(r => ({ maLHP:r.MaLHP,tenLHP:r.TenLHP,maMonHoc:r.MaMonHoc,tenMonHoc:r.TenMonHoc,soTinChi:r.SoTinChi,
    maHocKy:r.MaHocKy,namHoc:r.NamHoc,tenHocKy:r.TenHocKy,thu:r.Thu,tietBatDau:r.TietBatDau,soTiet:r.SoTiet,phongHoc:r.PhongHoc }));
};
const getLecturerClasses = async maGV => {
  const pool = await getPool();
  const result = await pool.request().input('MaGV', sql.Int, maGV).execute('dbo.SP_App_Lecturer_Classes');
  return result.recordset.map(r => ({ maLHP:r.MaLHP,tenLHP:r.TenLHP,maMonHoc:r.MaMonHoc,tenMonHoc:r.TenMonHoc,soTinChi:r.SoTinChi,
    tenHocKy:r.TenHocKy,namHoc:r.NamHoc,soLuongToiDa:r.SoLuongToiDa,siSoHienTai:r.SiSoHienTai,trangThai:r.TrangThai }));
};
const getClassStudents = async maLHP => {
  const pool = await getPool();
  const result = await pool.request().input('MaLHP', sql.VarChar(30), maLHP).execute('dbo.SP_App_Lecturer_ClassStudents');
  return result.recordset.map(r => ({ maDangKy:Number(r.MaDangKy),maSV:r.MaSV,maSinhVien:r.MaSinhVien,hoTen:r.HoTenSinhVien,
    lopHoc:r.LopHoc||r.maLop||'',maLop:r.MaLop,diemQuaTrinh:r.DiemQuaTrinh!==null?Number(r.DiemQuaTrinh):null,
    diemGiuaKy:r.DiemGiuaKy!==null?Number(r.DiemGiuaKy):null,diemCuoiKy:r.DiemCuoiKy!==null?Number(r.DiemCuoiKy):null,
    diemTongKet:r.DiemTongKet!==null?Number(r.DiemTongKet):null,diemChu:r.DiemChu,ketQua:r.KetQua }));
};
const isLecturerAssignedToClass = async (maGV, maLHP) => {
  const pool = await getPool();
  const result = await pool.request().input('MaGV',sql.Int,Number(maGV)).input('MaLHP',sql.VarChar(30),maLHP)
    .execute('dbo.SP_App_Lecturer_IsAssigned');
  return Boolean(result.recordset[0]?.Assigned);
};

// Cập nhật điểm cho sinh viên trong lớp học phần (UPSERT vào bảng DIEMSO)
const updateClassGrades = async (maLHP, grades, actorMaTaiKhoan) => {
  const pool = await getPool();
  const gradesJson = JSON.stringify(grades.map(g => ({
    maDangKy:g.maDangKy, hasDiemQuaTrinh:g.diemQuaTrinh!==undefined, diemQuaTrinh:g.diemQuaTrinh??null,
    hasDiemGiuaKy:g.diemGiuaKy!==undefined, diemGiuaKy:g.diemGiuaKy??null,
    hasDiemCuoiKy:g.diemCuoiKy!==undefined, diemCuoiKy:g.diemCuoiKy??null
  })));
  const result = await pool.request().input('MaLHP',sql.VarChar(30),maLHP)
    .input('GradesJson',sql.NVarChar(sql.MAX),gradesJson).input('ActorMaTaiKhoan',sql.Int,actorMaTaiKhoan)
    .execute('dbo.SP_App_Lecturer_UpdateClassGrades');
  return { updatedCount: result.recordset[0]?.updatedCount || 0 };
};

module.exports = {
  getLecturerSchedule,
  getLecturerClasses,
  getClassStudents,
  isLecturerAssignedToClass,
  updateClassGrades
};
