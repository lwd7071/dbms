const semesterRepository = require('../repositories/semester.repository');
const { successResponse } = require('../utils/apiResponse');

/**
 * Lấy danh sách toàn bộ học kỳ
 */
const getSemesters = async (req, res, next) => {
  try {
    const semesters = await semesterRepository.getAllSemesters();
    return res.status(200).json(successResponse(semesters));
  } catch (err) {
    next(err);
  }
};

/**
 * Lấy học kỳ hiện tại đang mở
 */
const getCurrentSemester = async (req, res, next) => {
  try {
    const current = await semesterRepository.getCurrentSemester();
    return res.status(200).json(successResponse(current));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSemesters,
  getCurrentSemester
};
