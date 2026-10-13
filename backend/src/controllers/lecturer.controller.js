const lecturerService = require('../services/lecturer.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const assertOwnLecturerId = (req, res) => {
  if (String(req.user.maGV) === String(req.params.id)) return true;
  res.status(403).json(errorResponse({
    field: 'permission',
    message: 'Bạn không có quyền xem dữ liệu giảng viên khác.'
  }));
  return false;
};

/**
 * Controller cho Giảng viên
 */
const getSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!assertOwnLecturerId(req, res)) return;
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
    if (!assertOwnLecturerId(req, res)) return;
    const classes = await lecturerService.getClasses(id);
    return res.status(200).json(successResponse(classes));
  } catch (err) {
    next(err);
  }
};

const getClassStudents = async (req, res, next) => {
  try {
    const { maLHP } = req.params;
    const students = await lecturerService.getClassStudents(maLHP, req.user.maGV);
    return res.status(200).json(successResponse(students));
  } catch (err) {
    next(err);
  }
};

const updateGrades = async (req, res, next) => {
  try {
    const { maLHP } = req.params;
    const { grades } = req.body;
    const result = await lecturerService.updateGrades(maLHP, req.user.maGV, grades);
    return res.status(200).json(successResponse(result));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSchedule,
  getClasses,
  getClassStudents,
  updateGrades
};
