const studentService = require('../services/student.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Controller xử lý các request học vụ của sinh viên (Thời khóa biểu, Bảng điểm, Học phí)
 */
const getSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { maHocKy } = req.query;

    const data = await studentService.getSchedule(id, maHocKy);
    return res.status(200).json(successResponse(data));
  } catch (err) {
    next(err);
  }
};

const getGrades = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { maHocKy } = req.query;

    const data = await studentService.getGrades(id, maHocKy);
    return res.status(200).json(successResponse(data));
  } catch (err) {
    next(err);
  }
};

const getTuition = async (req, res, next) => {
  try {
    const { id } = req.params;

    const data = await studentService.getTuition(id);
    return res.status(200).json(successResponse(data));
  } catch (err) {
    next(err);
  }
};

const getPaymentHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, pageSize } = req.query;
    const result = await studentService.getPaymentHistory(id, { page, pageSize });
    return res.status(200).json(successResponse(result.items, {
      page: result.page,
      pageSize: result.pageSize,
      totalItems: result.totalItems,
      totalPages: result.totalPages
    }));
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await studentService.getStudentProfile(id);
    if (!data) {
      return res.status(404).json(errorResponse({
        field: 'maSV',
        message: 'Không tìm thấy hồ sơ sinh viên'
      }));
    }
    return res.status(200).json(successResponse(data));
  } catch (err) {
    next(err);
  }
};

const getCurriculum = async (req, res, next) => {
  try {
    const data = await studentService.getStudentCurriculum(req.params.id);
    if (!data) return res.status(404).json(errorResponse({ field: 'maCTDT', message: 'Sinh viên chưa được gán chương trình đào tạo.' }));
    return res.status(200).json(successResponse(data));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSchedule,
  getGrades,
  getTuition,
  getPaymentHistory,
  getProfile,
  getCurriculum
};
