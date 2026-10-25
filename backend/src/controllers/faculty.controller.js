const facultyRepository = require('../repositories/faculty.repository');
const { successResponse } = require('../utils/apiResponse');

/**
 * Lấy danh sách toàn bộ các khoa
 */
const getFaculties = async (req, res, next) => {
  try {
    const faculties = await facultyRepository.getAllFaculties();
    return res.status(200).json(successResponse(faculties));
  } catch (err) {
    next(err);
  }
};

const getFacultiesForStaff = async (req, res, next) => {
  try {
    const faculties = await facultyRepository.getAllFacultiesForStaff();
    return res.status(200).json(successResponse(faculties));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFaculties,
  getFacultiesForStaff
};
