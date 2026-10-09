const lecturerService = require('../services/lecturer.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Controller cho Giảng viên
 */
const getSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { maHocKy } = req.query;
    const schedule = await lecturerService.getSchedule(id, maHocKy);
    return res.status(200).json(successResponse(schedule));
  } catch (err) {
    next(err);
  }
};

const getClasses = async (req, res, next) => {
  try {
    const { id } = req.params;
    const classes = await lecturerService.getClasses(id);
    return res.status(200).json(successResponse(classes));
  } catch (err) {
    next(err);
  }
};

const getClassStudents = async (req, res, next) => {
  try {
    const { maLHP } = req.params;
    const students = await lecturerService.getClassStudents(maLHP);
    return res.status(200).json(successResponse(students));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSchedule,
  getClasses,
  getClassStudents
};
