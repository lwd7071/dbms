const lecturerService = require('../services/lecturer.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dbms330284_super_secret_jwt_key_2026';

// Helper kiểm tra quyền truy cập của giảng viên
const checkLecturerAccess = (req, targetId) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
      if (decoded.vaiTro === 'GIANG_VIEN' && decoded.maGV && String(decoded.maGV) !== String(targetId)) {
        return false;
      }
    } catch (_) {}
  }
  return true;
};

/**
 * Controller cho Giảng viên
 */
const getSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!checkLecturerAccess(req, id)) {
      return res.status(403).json(errorResponse({
        field: 'permission',
        message: 'Bạn không có quyền xem lịch giảng dạy của giảng viên khác.'
      }));
    }
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
    if (!checkLecturerAccess(req, id)) {
      return res.status(403).json(errorResponse({
        field: 'permission',
        message: 'Bạn không có quyền xem danh sách lớp học của giảng viên khác.'
      }));
    }
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
