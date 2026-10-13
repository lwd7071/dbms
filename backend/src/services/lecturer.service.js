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

const assertLecturerOwnsClass = async (maGV, maLHP) => {
  if (!await lecturerRepo.isLecturerAssignedToClass(maGV, maLHP)) {
    const error = new Error('Bạn không được phân công phụ trách lớp học phần này.');
    error.status = 403;
    error.field = 'permission';
    throw error;
  }
};

const getClassStudents = async (maLHP, maGV) => {
  await assertLecturerOwnsClass(maGV, maLHP);
  return await lecturerRepo.getClassStudents(maLHP);
};

const updateGrades = async (maLHP, maGV, grades) => {
  await assertLecturerOwnsClass(maGV, maLHP);
  return await lecturerRepo.updateClassGrades(maLHP, grades);
};

module.exports = {
  getSchedule,
  getClasses,
  getClassStudents,
  assertLecturerOwnsClass,
  updateGrades
};
