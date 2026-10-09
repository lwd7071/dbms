const regRepo = require('../repositories/registration.repository');
const courseRepo = require('../repositories/course.repository');

/**
 * Service xử lý nghiệp vụ Đăng ký và Hủy đăng ký tín chỉ
 */
const registerCourse = async ({ maSV, maLHP, tinChiToiDa = 25 }) => {
  return await regRepo.registerCourse(maSV, maLHP, tinChiToiDa);
};

const cancelRegistration = async (id, payload = {}) => {
  let maSV = payload.maSV;
  let maLHP = payload.maLHP;

  // Nếu không có đủ maSV và maLHP thì tra cứu theo MaDangKy (id)
  if (!maSV || !maLHP) {
    const reg = await regRepo.findRegistrationById(id);
    if (!reg || reg.TrangThai !== 'REGISTERED') {
      const error = new Error('Không tìm thấy đăng ký học phần hợp lệ để hủy.');
      error.status = 404;
      error.field = 'maDangKy';
      throw error;
    }
    maSV = reg.MaSV;
    maLHP = reg.MaLHP;
  }

  return await regRepo.cancelRegistration(maSV, maLHP);
};

const getStudentRegistrations = async (maSV, maHocKy) => {
  if (!maHocKy) {
    maHocKy = await courseRepo.getDefaultOpenSemester();
  }
  return await regRepo.getStudentRegistrations(maSV, Number(maHocKy));
};

module.exports = {
  registerCourse,
  cancelRegistration,
  getStudentRegistrations
};
