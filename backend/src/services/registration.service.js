const regRepo = require('../repositories/registration.repository');
const courseRepo = require('../repositories/course.repository');

/**
 * Service xử lý nghiệp vụ Đăng ký và Hủy đăng ký tín chỉ
 */
const registerCourse = async ({ maSV, maLHP, tinChiToiDa = 25 }) => {
  return await regRepo.registerCourse(maSV, maLHP, tinChiToiDa);
};

const cancelRegistration = async (id, maSV) => {
  const reg = await regRepo.findRegistrationById(id);
  if (!reg || reg.TrangThai !== 'REGISTERED') {
    const error = new Error('Không tìm thấy đăng ký học phần hợp lệ để hủy.');
    error.status = 404;
    error.field = 'maDangKy';
    throw error;
  }

  if (String(reg.MaSV) !== String(maSV)) {
    const error = new Error('Bạn không có quyền hủy đăng ký của sinh viên khác.');
    error.status = 403;
    error.field = 'permission';
    throw error;
  }

  return await regRepo.cancelRegistration(maSV, reg.MaLHP);
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
