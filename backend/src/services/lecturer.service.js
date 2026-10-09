const lecturerRepo = require('../repositories/lecturer.repository');

/**
 * Service nghiệp vụ cho Giảng viên
 */
const getSchedule = async (maGV, maHocKy) => {
  return await lecturerRepo.getLecturerSchedule(Number(maGV), maHocKy ? Number(maHocKy) : null);
};

const getClasses = async (maGV) => {
  return await lecturerRepo.getLecturerClasses(Number(maGV));
};

const getClassStudents = async (maLHP) => {
  return await lecturerRepo.getClassStudents(maLHP);
};

module.exports = {
  getSchedule,
  getClasses,
  getClassStudents
};
